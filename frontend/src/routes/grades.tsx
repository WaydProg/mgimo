import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, PageTitle } from "@/components/ui-kit";
import { useStudentData } from "@/lib/store";

export const Route = createFileRoute("/grades")({
  head: () => ({ meta: [{ title: "Успеваемость — Деканат" }, { name: "description", content: "Оценки, зачёты и сессия по семестрам." }, { property: "og:title", content: "Успеваемость — Деканат" }, { property: "og:description", content: "Оценки, зачёты и сессия." }] }),
  component: Grades,
});

function Mark({ m }: { m: string }) {
  const cls = m === "5" || m === "зачтено" ? "pill-ok" : m === "4" ? "pill-info" : m === "—" ? "pill-muted" : "pill-warn";
  return <span className={`pill ${cls}`}>{m === "—" ? "ожидается" : m}</span>;
}

function Grades() {
  const { semesters, session } = useStudentData();
  const [sem, setSem] = useState(5);
  const s = semesters.find((x) => x.n === sem)!;
  return (
    <>
      <PageTitle title="Успеваемость" sub="Средний балл за всё время: 4,71" />
      <div role="tablist" aria-label="Семестр" className="mb-4 flex flex-wrap gap-2">
        {semesters.map((x) => (
          <button key={x.n} role="tab" aria-selected={sem === x.n} onClick={() => setSem(x.n)} className={`btn ${sem === x.n ? "btn-primary" : "btn-ghost"}`}>{x.n} семестр</button>
        ))}
      </div>
      {s.current && (
        <Card className="mb-4">
          <h2 className="font-semibold">Зимняя сессия</h2>
          <p className="text-sm text-muted-foreground">Зачётная неделя 22–27 декабря · Курсовой по БД до 14 ноября</p>
          <ul className="mt-3 divide-y divide-border">
            {session.map((e) => (
              <li key={e.s} className="flex items-center gap-3 py-2.5 text-sm">
                <span className="w-14 shrink-0 font-semibold">{e.date}</span>
                <span className="min-w-0 flex-1"><span className="block truncate font-medium">{e.s}</span><span className="text-muted-foreground">{e.kind} · {e.time} · {e.room}</span></span>
              </li>
            ))}
          </ul>
        </Card>
      )}
      <Card className="p-0 sm:p-0">
        <h2 className="border-b border-border px-4 py-3 text-sm font-semibold">{s.title}</h2>
        <ul className="divide-y divide-border">
          {s.items.map((i) => (
            <li key={i.s} className="flex items-center gap-3 px-4 py-3 text-sm">
              <span className="min-w-0 flex-1"><span className="block font-medium">{i.s}</span><span className="text-muted-foreground">{i.kind} · {i.ects} з.е.</span></span>
              <Mark m={i.mark} />
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}
