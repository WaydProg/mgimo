import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Loader2, Plus, X } from "lucide-react";
import { Btn, Card, Empty, PageTitle, Skeleton, StatusPill, Tabs } from "@/components/ui-kit";
import { statusOrder, type Request, useStore, useStudentData } from "@/lib/store";

export const Route = createFileRoute("/requests")({
  head: () => ({ meta: [{ title: "Заявки — Деканат" }, { name: "description", content: "Заказ справок и статус заявок." }, { property: "og:title", content: "Заявки — Деканат" }, { property: "og:description", content: "Заказ справок и статус заявок." }] }),
  component: Requests,
});

const types = ["Справка об обучении", "Справка для военкомата", "Справка о стипендии", "Академическая справка"];

function Timeline({ r }: { r: Request }) {
  const done = statusOrder.indexOf(r.status);
  return (
    <ol className="mt-4 space-y-3 border-t border-border pt-4">
      {statusOrder.map((s, i) => {
        const h = r.history.find((x) => x.status === s);
        return (
          <li key={s} className="flex gap-3">
            <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs ${i <= done ? "bg-primary text-primary-foreground" : "border border-border bg-card text-muted-foreground"}`}>{i <= done ? <Check className="h-3.5 w-3.5" aria-hidden /> : i + 1}</span>
            <div className="text-sm"><p className={i <= done ? "font-medium" : "text-muted-foreground"}>{s}</p>{h && <p className="text-xs text-muted-foreground">{h.at}</p>}</div>
          </li>
        );
      })}
    </ol>
  );
}

function Form({ onDone }: { onDone: (id: string) => void }) {
  const { addRequest } = useStore();
  const [f, setF] = useState({ title: "", purpose: "", copies: "1", format: "Электронная (PDF с ЭП)" });
  const [err, setErr] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const n: Record<string, string> = {};
    if (!f.title) n["title"] = "Выберите тип справки";
    if (f.purpose.trim().length < 3) n["purpose"] = "Укажите, куда нужна справка (от 3 символов)";
    const c = Number(f.copies); if (!Number.isInteger(c) || c < 1 || c > 5) n["copies"] = "От 1 до 5 экземпляров";
    setErr(n);
    if (Object.keys(n).length) { document.getElementById(`f-${Object.keys(n)[0]}`)?.focus(); return; }
    setBusy(true);
    void addRequest({ title: f.title, purpose: f.purpose.trim(), copies: c, format: f.format }).then(r => onDone(r.id)).catch(error => window.alert(error.message)).finally(() => setBusy(false));
  };
  const fe = (k: string) => ({ "aria-invalid": !!err[k], "aria-describedby": err[k] ? `e-${k}` : undefined });
  const Err = ({ k }: { k: string }) => err[k] ? <p id={`e-${k}`} className="mt-1 text-xs text-destructive">{err[k]}</p> : null;
  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      {Object.keys(err).length > 0 && <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">Проверьте поля, отмеченные красным.</p>}
      <div><label htmlFor="f-title" className="mb-1.5 block text-sm font-medium">Тип справки</label>
        <select id="f-title" className="field" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} {...fe("title")}>
          <option value="">Выберите…</option>{types.map((t) => <option key={t}>{t}</option>)}
        </select><Err k="title" /></div>
      <div><label htmlFor="f-purpose" className="mb-1.5 block text-sm font-medium">Место предъявления</label>
        <input id="f-purpose" className="field" placeholder="Например, по месту работы родителей" value={f.purpose} onChange={(e) => setF({ ...f, purpose: e.target.value })} {...fe("purpose")} /><Err k="purpose" /></div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label htmlFor="f-copies" className="mb-1.5 block text-sm font-medium">Экземпляров</label>
          <input id="f-copies" type="number" min={1} max={5} className="field" value={f.copies} onChange={(e) => setF({ ...f, copies: e.target.value })} {...fe("copies")} /><Err k="copies" /></div>
        <fieldset><legend className="mb-1.5 text-sm font-medium">Формат</legend>
          <div className="flex flex-col gap-1.5 text-sm">{["Электронная (PDF с ЭП)", "Бумажная"].map((o) => (
            <label key={o} className="inline-flex items-center gap-2"><input type="radio" name="fmt" checked={f.format === o} onChange={() => setF({ ...f, format: o })} className="accent-primary" />{o}</label>))}</div>
        </fieldset>
      </div>
      <Btn type="submit" disabled={busy} className="w-full sm:w-auto">{busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}{busy ? "Отправляем…" : "Отправить заявку"}</Btn>
    </form>
  );
}

function Requests() {
  const { requests } = useStudentData();
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<"Все" | "Активные" | "Архив">("Все");
  const [expanded, setExpanded] = useState<string | null>("Р-1042");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const list = requests.filter((r) => filter === "Все" ? true : filter === "Активные" ? r.status !== "Выдана" && r.status !== "Готова" : r.status === "Выдана");
  const changeFilter = (v: typeof filter) => { setLoading(true); setFilter(v); setTimeout(() => setLoading(false), 500); };
  return (
    <>
      <PageTitle title="Заявки" sub="Справки и документы деканата" action={!open && <Btn onClick={() => setOpen(true)}><Plus className="h-4 w-4" aria-hidden />Заказать справку</Btn>} />
      {toast && <div role="status" className="mb-4 flex items-center gap-2 rounded-lg bg-success-soft p-3 text-sm text-success"><Check className="h-4 w-4" aria-hidden />Заявка {toast} принята. Статус обновится в уведомлениях.<button aria-label="Закрыть" onClick={() => setToast(null)} className="ml-auto rounded focus-ring"><X className="h-4 w-4" /></button></div>}
      {open && (
        <Card className="mb-5">
          <div className="mb-4 flex items-center justify-between"><h2 className="font-semibold">Новая справка</h2><button aria-label="Закрыть форму" onClick={() => setOpen(false)} className="rounded p-1 hover:bg-muted focus-ring"><X className="h-4 w-4" /></button></div>
          <Form onDone={(id) => { setOpen(false); setToast(id); setFilter("Все"); setExpanded(id); }} />
        </Card>
      )}
      <div className="mb-3"><Tabs label="Фильтр заявок" value={filter} options={["Все", "Активные", "Архив"]} onChange={changeFilter} /></div>
      {loading ? (
        <div className="space-y-2" aria-busy="true" aria-label="Загрузка">{[0, 1, 2].map((i) => <div key={i} className="rounded-xl border border-border bg-card p-4"><Skeleton className="h-4 w-1/2" /><Skeleton className="mt-2 h-3 w-1/3" /></div>)}</div>
      ) : list.length === 0 ? (
        <Empty title="Здесь пока пусто" text="Активных заявок нет. Закажите справку — она появится в этом списке." action={<Btn variant="soft" onClick={() => setOpen(true)}>Заказать справку</Btn>} />
      ) : (
        <ul className="space-y-2">
          {list.map((r) => (
            <li key={r.id}><Card className="p-0 sm:p-0">
              <button aria-expanded={expanded === r.id} onClick={() => setExpanded(expanded === r.id ? null : r.id)} className="flex w-full items-center gap-3 rounded-xl p-4 text-left focus-ring">
                <span className="min-w-0 flex-1"><span className="block font-medium">{r.title}</span><span className="block truncate text-sm text-muted-foreground">{r.id} · {r.created} · {r.format}</span></span>
                <StatusPill s={r.status} />
              </button>
              {expanded === r.id && <div className="px-4 pb-4"><p className="text-sm text-muted-foreground">Для: {r.purpose} · {r.copies} экз.</p><Timeline r={r} />
                {r.status === "Готова" && <Btn variant="soft" className="mt-4" onClick={() => alert("Демо: скачивание справки (синтетический файл)")}>Скачать PDF</Btn>}</div>}
            </Card></li>
          ))}
        </ul>
      )}
    </>
  );
}
