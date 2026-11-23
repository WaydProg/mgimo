import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AlertTriangle, Clock, MapPin, User } from "lucide-react";
import { Empty, PageTitle, Tabs } from "@/components/ui-kit";
import { days, TODAY, type Lesson, useStudentData } from "@/lib/store";

export const Route = createFileRoute("/schedule")({
  head: () => ({ meta: [{ title: "Расписание — Деканат" }, { name: "description", content: "Расписание занятий на сегодня и неделю." }, { property: "og:title", content: "Расписание — Деканат" }, { property: "og:description", content: "Расписание занятий группы." }] }),
  component: Schedule,
});

function Row({ l }: { l: Lesson }) {
  return (
    <li className={`rounded-xl border bg-card p-4 ${l.moved ? "border-warning/50" : "border-border"}`}>
      <div className="flex flex-wrap items-center gap-2 text-sm"><span className="inline-flex items-center gap-1.5 font-medium"><Clock className="h-4 w-4 text-muted-foreground" aria-hidden />{l.time}</span><span className="pill pill-muted">{l.type}</span></div>
      <p className="mt-1.5 font-semibold">{l.title}</p>
      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-1.5"><User className="h-4 w-4" aria-hidden />{l.teacher}</span>
        <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4" aria-hidden />{l.room}</span>
      </div>
      {l.moved && <p className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-warning-soft px-2 py-1 text-xs font-medium text-warning"><AlertTriangle className="h-3.5 w-3.5" aria-hidden />{l.moved}</p>}
    </li>
  );
}

function Schedule() {
  const { lessons } = useStudentData();
  const [tab, setTab] = useState<"Сегодня" | "Неделя">("Сегодня");
  const [day, setDay] = useState(TODAY);
  return (
    <>
      <PageTitle title="Расписание" sub="Группа ПИ-31 · неделя 11 (числитель)" action={<Tabs label="Период" value={tab} options={["Сегодня", "Неделя"]} onChange={setTab} />} />
      {tab === "Сегодня" ? (
        <ul className="space-y-2">{lessons.filter((l) => l.day === TODAY).map((l) => <Row key={l.id} l={l} />)}</ul>
      ) : (
        <>
          <div role="tablist" aria-label="День недели" className="mb-4 grid grid-cols-6 gap-1">
            {days.map((d, i) => (
              <button key={d} role="tab" aria-selected={day === i} onClick={() => setDay(i)}
                className={`rounded-lg py-2 text-sm font-medium focus-ring ${day === i ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground border border-border"}`}>
                {d}<span className="block text-[11px] opacity-80">{9 + i}</span>
              </button>
            ))}
          </div>
          {lessons.filter((l) => l.day === day).length ? (
            <ul className="space-y-2">{lessons.filter((l) => l.day === day).map((l) => <Row key={l.id} l={l} />)}</ul>
          ) : <Empty title="Занятий нет" text="В этот день пар не запланировано." />}
        </>
      )}
    </>
  );
}
