import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Btn, Empty, PageTitle, Tabs } from "@/components/ui-kit";
import { useStore, useStudentData } from "@/lib/store";

export const Route = createFileRoute("/notifications")({
  head: () => ({ meta: [{ title: "Уведомления — Деканат" }, { name: "description", content: "Уведомления деканата с отметкой прочтения." }, { property: "og:title", content: "Уведомления — Деканат" }, { property: "og:description", content: "Уведомления деканата." }] }),
  component: Notes,
});

function Notes() {
  const { notes } = useStudentData();
  const { markRead, markAll } = useStore();
  const [f, setF] = useState<"Все" | "Непрочитанные">("Все");
  const list = f === "Все" ? notes : notes.filter((n) => !n.read);
  return (
    <>
      <PageTitle title="Уведомления" sub={`Непрочитанных: ${notes.filter((n) => !n.read).length}`} action={<Btn variant="ghost" onClick={markAll}>Прочитать все</Btn>} />
      <div className="mb-3"><Tabs label="Фильтр" value={f} options={["Все", "Непрочитанные"]} onChange={setF} /></div>
      {list.length === 0 ? <Empty title="Всё прочитано" text="Новые уведомления появятся здесь." /> : (
        <ul className="space-y-2">
          {list.map((n) => (
            <li key={n.id} className={`flex flex-wrap items-start gap-3 rounded-xl border bg-card p-4 ${n.read ? "border-border" : "border-primary/30"}`}>
              <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.read ? "bg-border" : "bg-primary"}`} aria-hidden />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-2"><p className={n.read ? "font-medium text-muted-foreground" : "font-semibold"}>{n.title}</p><span className="text-xs text-muted-foreground">{n.at}</span><span className="sr-only">{n.read ? "прочитано" : "не прочитано"}</span></div>
                <p className="mt-0.5 text-sm text-muted-foreground">{n.text}</p>
                <div className="mt-2 flex flex-wrap gap-3 text-sm">
                  <Link to={n.to} onClick={() => markRead(n.id)} className="link">Перейти</Link>
                  {!n.read && <button onClick={() => markRead(n.id)} className="link">Отметить прочитанным</button>}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
