import json
import secrets
from copy import deepcopy
from pathlib import Path

from main import Application, Base, Student, engine, password_hash
from sqlalchemy import select
from sqlalchemy.orm import Session


if __name__ == "__main__":
    Base.metadata.create_all(engine)
    template = json.loads(Path(__file__).with_name("demo.json").read_text())
    examples = template.pop("requests")
    credentials = []
    with Session(engine) as db, db.begin():
        for number in (1, 2):
            username = f"student{number}"
            if db.scalar(select(Student.id).where(Student.username == username)):
                continue
            dashboard = deepcopy(template)
            if number == 2:
                dashboard["student"].update(name="Ветров Марк Олегович", short="Марк Ветров",
                                            initials="МВ", group="ПИ-32", id="№ ДЕМО-002")
                dashboard["lessons"] = dashboard["lessons"][:3]
                dashboard["semesters"] = dashboard["semesters"][1:]
                dashboard["session"] = []
                dashboard["notes"] = []
            password = secrets.token_urlsafe(18)
            student = Student(username=username, hashed_password=password_hash.hash(password), dashboard=dashboard)
            db.add(student)
            db.flush()
            if number == 1:
                for row in examples:
                    details = {key: row[key] for key in ("title", "purpose", "copies", "format")}
                    db.add(Application(student_id=student.id, details=details,
                                       status=row["status"], history=row["history"]))
            credentials.append((username, password))
    for username, password in credentials:
        print(f"{username}: {password}")
