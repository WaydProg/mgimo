import hashlib
import os
import secrets
from datetime import datetime, timedelta, timezone
from typing import Annotated
from uuid import UUID, uuid4
from zoneinfo import ZoneInfo

from fastapi import Depends, FastAPI, HTTPException, Request, Response
from pydantic import BaseModel, ConfigDict, Field, StringConstraints
from pwdlib import PasswordHash
from sqlalchemy import DateTime, ForeignKey, String, create_engine, select
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column

engine = create_engine(os.environ["DATABASE_URL"], pool_pre_ping=True)
origin = os.environ.get("APP_ORIGIN", "http://localhost:5173").rstrip("/")
secure = origin.startswith("https://")
cookie = "__Host-dekanat" if secure else "dekanat"
password_hash = PasswordHash.recommended()
dummy_hash = password_hash.hash(secrets.token_hex(32))


class Base(DeclarativeBase):
    pass


class Student(Base):
    __tablename__ = "students"
    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(String(64), unique=True)
    hashed_password: Mapped[str]
    dashboard: Mapped[dict] = mapped_column(JSONB)


class LoginSession(Base):
    __tablename__ = "login_sessions"
    token_hash: Mapped[str] = mapped_column(String(64), primary_key=True)
    student_id: Mapped[int] = mapped_column(ForeignKey("students.id", ondelete="CASCADE"), index=True)
    expires: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)


class Application(Base):
    __tablename__ = "applications"
    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    student_id: Mapped[int] = mapped_column(ForeignKey("students.id"), index=True)
    created: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    details: Mapped[dict] = mapped_column(JSONB)
    status: Mapped[str] = mapped_column(String(20), default="Принята")
    history: Mapped[list] = mapped_column(JSONB, default=list)


class Login(BaseModel):
    model_config = ConfigDict(extra="forbid")
    username: str = Field(min_length=1, max_length=64)
    password: str = Field(min_length=1, max_length=128)


class ApplicationInput(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)
    title: Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=100)]
    purpose: Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=200)]
    copies: int = Field(ge=1, le=5)
    format: Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=80)]


def db_session():
    with Session(engine) as db:
        yield db


DB = Annotated[Session, Depends(db_session)]


def digest(token):
    return hashlib.sha256(token.encode()).hexdigest()


def active_session(request: Request, db: DB):
    token = request.cookies.get(cookie, "")
    if len(token) != 43:
        raise HTTPException(401, "Требуется вход")
    row = db.get(LoginSession, digest(token))
    if row is None or row.expires <= datetime.now(timezone.utc):
        raise HTTPException(401, "Требуется вход")
    return row


Active = Annotated[LoginSession, Depends(active_session)]
app = FastAPI(docs_url=None, redoc_url=None, openapi_url=None)


@app.middleware("http")
async def protect(request: Request, call_next):
    if request.method not in ("GET", "HEAD", "OPTIONS") and request.headers.get("origin") != origin:
        return Response(status_code=403)
    response = await call_next(request)
    response.headers["Cache-Control"] = "no-store"
    response.headers["X-Content-Type-Options"] = "nosniff"
    return response


@app.post("/api/login")
def login(data: Login, request: Request, response: Response, db: DB):
    student = db.scalar(select(Student).where(Student.username == data.username))
    valid = password_hash.verify(data.password, student.hashed_password if student else dummy_hash)
    if not student or not valid:
        raise HTTPException(401, "Неверный логин или пароль")
    old = request.cookies.get(cookie, "")
    if len(old) == 43 and (row := db.get(LoginSession, digest(old))):
        db.delete(row)
    token = secrets.token_urlsafe(32)
    db.add(LoginSession(token_hash=digest(token), student_id=student.id,
                        expires=datetime.now(timezone.utc) + timedelta(hours=8)))
    db.commit()
    response.set_cookie(cookie, token, max_age=28800, httponly=True, secure=secure, samesite="strict")
    return {"ok": True}


@app.post("/api/logout")
def logout(response: Response, db: DB, current: Active):
    db.delete(current)
    db.commit()
    response.delete_cookie(cookie, httponly=True, secure=secure, samesite="strict")
    return {"ok": True}


def application_view(row):
    created = row.created.astimezone(ZoneInfo("Europe/Moscow")).strftime("%d.%m.%Y, %H:%M")
    return {**row.details, "id": str(row.id), "status": row.status, "created": created,
            "history": row.history or [{"status": row.status, "at": created}]}


@app.get("/api/dashboard")
def dashboard(current: Active, db: DB):
    student = db.get(Student, current.student_id)
    rows = db.scalars(select(Application).where(Application.student_id == student.id)
                      .order_by(Application.created.desc()))
    return {**student.dashboard, "requests": [application_view(row) for row in rows]}


@app.post("/api/requests", status_code=201)
def create_application(data: ApplicationInput, current: Active, db: DB):
    row = Application(student_id=current.student_id, details=data.model_dump())
    db.add(row)
    db.commit()
    return application_view(row)


@app.get("/api/requests/{request_id}")
def get_application(request_id: UUID, current: Active, db: DB):
    row = db.scalar(select(Application).where(Application.id == request_id,
                                             Application.student_id == current.student_id))
    if not row:
        raise HTTPException(404, "Заявка не найдена")
    return application_view(row)


class MarkRead(BaseModel):
    model_config = ConfigDict(extra="forbid")
    id: str | None = Field(default=None, max_length=64)


@app.post("/api/notifications/read")
def mark_read(data: MarkRead, current: Active, db: DB):
    student = db.scalar(select(Student).where(Student.id == current.student_id).with_for_update())
    notes = [
        {**note, "read": True} if data.id is None or note["id"] == data.id else note
        for note in student.dashboard["notes"]
    ]
    student.dashboard = {**student.dashboard, "notes": notes}
    db.commit()
    return notes
