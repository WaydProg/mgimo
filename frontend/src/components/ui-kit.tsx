import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { ReqStatus } from "@/lib/store";

export function Card({ className, children, ...p }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-xl border border-border bg-card p-4 sm:p-5", className)} {...p}>{children}</div>;
}
export function PageTitle({ title, sub, action }: { title: string; sub?: string; action?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {sub && <p className="mt-1 text-sm text-muted-foreground">{sub}</p>}
      </div>
      {action}
    </div>
  );
}
export function Btn({ variant = "primary", className, ...p }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "soft" }) {
  return <button className={cn("btn", `btn-${variant}`, className)} {...p} />;
}
const tone: Record<ReqStatus, string> = { "Принята": "pill-info", "В работе": "pill-warn", "Готова": "pill-ok", "Выдана": "pill-muted" };
export function StatusPill({ s }: { s: ReqStatus }) { return <span className={cn("pill", tone[s])}>{s}</span>; }
export function Skeleton({ className }: { className?: string }) { return <div className={cn("animate-pulse rounded-md bg-muted", className)} />; }
export function Empty({ title, text, action }: { title: string; text: string; action?: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card px-6 py-10 text-center">
      <p className="font-medium">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{text}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
export function Tabs<T extends string>({ value, options, onChange, label }: { value: T; options: T[]; onChange: (v: T) => void; label: string }) {
  return (
    <div role="tablist" aria-label={label} className="inline-flex rounded-lg bg-muted p-1">
      {options.map((o) => (
        <button key={o} role="tab" aria-selected={value === o} onClick={() => onChange(o)}
          className={cn("rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus-ring", value === o ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
          {o}
        </button>
      ))}
    </div>
  );
}
