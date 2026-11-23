import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Bell, CalendarDays, FileText, GraduationCap, Home, LogOut, Menu, User, Clock } from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { TODAY, useStore, useStudentData } from "@/lib/store";

const nav = [
  { to: "/", label: "Главная", icon: Home },
  { to: "/schedule", label: "Расписание", icon: CalendarDays },
  { to: "/grades", label: "Успеваемость", icon: GraduationCap },
  { to: "/requests", label: "Заявки", icon: FileText },
  { to: "/notifications", label: "Уведомления", icon: Bell },
  { to: "/profile", label: "Профиль", icon: User },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { lessons, student, notes } = useStudentData();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { signOut } = useStore();
  const nav2 = useNavigate();
  const unread = notes.filter((n) => !n.read).length;
  const isActive = (to: string) => (to === "/" ? path === "/" : path.startsWith(to));
  const today = lessons.filter((l) => l.day === TODAY);

  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      <a href="#main" className="skip-link">Перейти к содержимому</a>
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-60 flex-col border-r border-border bg-card lg:flex">
        <div className="px-5 py-5">
          <div className="text-lg font-semibold tracking-tight">Деканат</div>
          <div className="mt-1 inline-block rounded bg-accent px-1.5 py-0.5 text-[11px] font-medium text-accent-foreground">Конкурсный прототип</div>
        </div>
        <nav aria-label="Основная навигация" className="flex-1 space-y-0.5 px-3">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} className={cn("nav-item", isActive(n.to) && "nav-item-active")} aria-current={isActive(n.to) ? "page" : undefined}>
              <n.icon className="h-4 w-4" aria-hidden /> <span className="flex-1">{n.label}</span>
              {n.to === "/notifications" && unread > 0 && <span className="badge-count">{unread}</span>}
            </Link>
          ))}
        </nav>
        <div className="border-t border-border p-3">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="avatar">{student.initials}</div>
            <div className="min-w-0 text-sm"><div className="truncate font-medium">{student.short}</div><div className="text-xs text-muted-foreground">{student.group} · {student.course} курс</div></div>
          </div>
          <button onClick={() => { void signOut().then(() => nav2({ to: "/login" })).catch(() => window.alert("Не удалось выйти")); }} className="nav-item w-full"><LogOut className="h-4 w-4" aria-hidden /> Выйти</button>
        </div>
      </aside>

      {/* Mobile header */}
      <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border bg-card/95 px-4 backdrop-blur lg:hidden">
        <div className="min-w-0"><div className="font-semibold leading-tight">Деканат</div><div className="text-[11px] text-muted-foreground">Конкурсный прототип</div></div>
        <Link to="/notifications" aria-label={`Уведомления, непрочитанных: ${unread}`} className="relative grid h-10 w-10 place-items-center rounded-full hover:bg-muted focus-ring">
          <Bell className="h-5 w-5" aria-hidden />
          {unread > 0 && <span className="badge-dot">{unread}</span>}
        </Link>
      </header>

      <div className="lg:pl-60 xl:pr-80">
        <main id="main" tabIndex={-1} className="mx-auto max-w-4xl px-4 pb-28 pt-5 sm:px-6 lg:pb-10 lg:pt-8 outline-none">{children}</main>
      </div>

      {/* Right rail */}
      <aside aria-label="Лента" className="fixed inset-y-0 right-0 hidden w-80 overflow-y-auto border-l border-border bg-card p-5 xl:block">
        <div className="flex items-center justify-between"><h2 className="text-sm font-semibold">Сегодня, чт 12 ноября</h2></div>
        <ul className="mt-3 space-y-2">
          {today.map((l) => (
            <li key={l.id} className="rounded-lg bg-muted/60 p-3 text-sm">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Clock className="h-3 w-3" aria-hidden />{l.time} · {l.room}</div>
              <div className="mt-0.5 font-medium">{l.title}</div>
              {l.moved && <div className="mt-1 text-xs font-medium text-warning">{l.moved}</div>}
            </li>
          ))}
        </ul>
        <div className="mt-6 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Уведомления</h2>
          <Link to="/notifications" className="link text-xs">Все</Link>
        </div>
        <ul className="mt-3 space-y-1">
          {notes.slice(0, 4).map((n) => (
            <li key={n.id}>
              <Link to={n.to} className="block rounded-lg p-2.5 text-sm hover:bg-muted focus-ring">
                <div className="flex items-center gap-2">{!n.read && <span className="h-2 w-2 shrink-0 rounded-full bg-primary" aria-label="Не прочитано" />}<span className="font-medium">{n.title}</span><span className="ml-auto text-xs text-muted-foreground">{n.at}</span></div>
                <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{n.text}</p>
              </Link>
            </li>
          ))}
        </ul>
      </aside>

      {/* Bottom tabs */}
      <nav aria-label="Вкладки" className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-4 border-t border-border bg-card pb-[env(safe-area-inset-bottom)] lg:hidden">
        {([
          { to: "/", label: "Главная", icon: Home, act: path === "/" },
          { to: "/schedule", label: "Расписание", icon: CalendarDays, act: path.startsWith("/schedule") },
          { to: "/requests", label: "Заявки", icon: FileText, act: path.startsWith("/requests") },
          { to: "/more", label: "Ещё", icon: Menu, act: ["/more", "/grades", "/profile", "/notifications"].some((p) => path.startsWith(p)) },
        ] as const).map((t) => (
          <Link key={t.to} to={t.to} aria-current={t.act ? "page" : undefined} className={cn("tab-item", t.act && "tab-item-active")}>
            <t.icon className="h-5 w-5" aria-hidden /><span>{t.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
