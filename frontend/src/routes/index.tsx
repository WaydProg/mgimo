import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CalendarClock, Clock, FileCheck2, MapPin, Timer, User } from "lucide-react";
import { Card } from "@/components/ui-kit";
import { TODAY, useStudentData } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Главная — Деканат" }, { name: "description", content: "Ближайшая пара и важные события студента." }, { property: "og:title", content: "Главная — Деканат" }, { property: "og:description", content: "Ближайшая пара и важные события студента." }] }),
  component: Index,
});

function Index() {
  const { lessons, student, requests } = useStudentData();
  const next = lessons.find((l) => l.day === TODAY);
  const ready = requests.find((r) => r.status === "Готова");
  const items = [
    { icon: CalendarClock, tone: "pill-warn", label: "Перенос занятия", text: "«Тестирование ПО» сегодня в 12:30, ауд. Б-305", to: "/schedule" as const, cta: "К расписанию" },
    { icon: Timer, tone: "pill-info", label: "Дедлайн через 2 дня", text: "Курсовой проект по «Базам данных» — до 14 ноября", to: "/grades" as const, cta: "К успеваемости" },
    ...(ready ? [{ icon: FileCheck2, tone: "pill-ok", label: "Справка готова", text: `${ready.id} · ${ready.title}`, to: "/requests" as const, cta: "Открыть заявку" }] : []),
  ];
  return (
    <>
      <p className="text-sm text-muted-foreground">Четверг, 12 ноября</p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight">Добрый день, {student.short.split(" ")[0]}</h1>

      <section aria-labelledby="next" className="mt-6">
        <h2 id="next" className="mb-2 text-sm font-semibold text-muted-foreground">Ближайшая пара</h2>
        {next ? <Card className="border-primary/20">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <span className="pill pill-info">{next.type} · через 25 мин</span>
              <p className="mt-2 text-xl font-semibold">{next.title}</p>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4" aria-hidden />{next.time}</span>
                <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4" aria-hidden />{next.room}</span>
                <span className="inline-flex items-center gap-1.5"><User className="h-4 w-4" aria-hidden />{next.teacher}</span>
              </div>
            </div>
            <Link to="/schedule" className="btn btn-ghost">Расписание</Link>
          </div>
        </Card> : <Card>На сегодня занятий нет.</Card>}
      </section>

      <section aria-labelledby="att" className="mt-6">
        <h2 id="att" className="mb-2 text-sm font-semibold text-muted-foreground">Требует внимания</h2>
        <ul className="space-y-2">
          {items.map((i) => (
            <li key={i.label}>
              <Link to={i.to} className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40 focus-ring">
                <span className={`pill ${i.tone} h-9 w-9 shrink-0 justify-center p-0`}><i.icon className="h-4 w-4" aria-hidden /></span>
                <span className="min-w-0 flex-1"><span className="block font-medium">{i.label}</span><span className="block truncate text-sm text-muted-foreground">{i.text}</span></span>
                <span className="hidden text-sm font-medium text-primary sm:inline">{i.cta}</span>
                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Card><p className="text-xs text-muted-foreground">Средний балл</p><p className="mt-1 text-2xl font-semibold">4,71</p></Card>
        <Card><p className="text-xs text-muted-foreground">До сессии</p><p className="mt-1 text-2xl font-semibold">61 день</p></Card>
        <Card className="col-span-2 sm:col-span-1"><p className="text-xs text-muted-foreground">Заявок в работе</p><p className="mt-1 text-2xl font-semibold">{requests.filter((r) => r.status === "Принята" || r.status === "В работе").length}</p></Card>
      </section>
    </>
  );
}
