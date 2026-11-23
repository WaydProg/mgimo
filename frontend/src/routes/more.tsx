import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Bell, ChevronRight, GraduationCap, LogOut, User } from "lucide-react";
import { PageTitle } from "@/components/ui-kit";
import { useStore, useStudentData } from "@/lib/store";

export const Route = createFileRoute("/more")({
  head: () => ({ meta: [{ title: "Ещё — Деканат" }, { name: "description", content: "Профиль, успеваемость и уведомления." }, { property: "og:title", content: "Ещё — Деканат" }, { property: "og:description", content: "Дополнительные разделы деканата." }] }),
  component: More,
});

function More() {
  const { notes } = useStudentData();
  const { signOut } = useStore(); const nav = useNavigate();
  const items = [{ to: "/profile", l: "Профиль", i: User }, { to: "/grades", l: "Успеваемость", i: GraduationCap }, { to: "/notifications", l: `Уведомления (${notes.filter((n) => !n.read).length})`, i: Bell }] as const;
  return (
    <>
      <PageTitle title="Ещё" />
      <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
        {items.map((x) => <li key={x.to}><Link to={x.to} className="flex items-center gap-3 p-4 hover:bg-muted focus-ring"><x.i className="h-5 w-5 text-muted-foreground" aria-hidden /><span className="flex-1 font-medium">{x.l}</span><ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden /></Link></li>)}
        <li><button onClick={() => { void signOut().then(() => nav({ to: "/login" })).catch(() => window.alert("Не удалось выйти")); }} className="flex w-full items-center gap-3 p-4 text-left text-destructive hover:bg-muted focus-ring"><LogOut className="h-5 w-5" aria-hidden />Выйти</button></li>
      </ul>
      <p className="mt-6 text-center text-xs text-muted-foreground">Конкурсный прототип · синтетические данные</p>
    </>
  );
}
