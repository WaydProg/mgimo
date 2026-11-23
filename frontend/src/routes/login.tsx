import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Btn } from "@/components/ui-kit";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Вход — Деканат" }, { name: "description", content: "Вход в цифровой деканат, доступен деморежим." }, { property: "og:title", content: "Вход — Деканат" }, { property: "og:description", content: "Вход в цифровой деканат." }] }),
  component: Login,
});

function Login() {
  const { signIn } = useStore();
  const nav = useNavigate();
  const [login, setLogin] = useState(""); const [pass, setPass] = useState("");
  const [err, setErr] = useState<{ login?: string; pass?: string; form?: string }>({});
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const n: typeof err = {};
    if (!login.trim()) n.login = "Введите логин или номер студенческого";
    if (pass.length < 6) n.pass = "Пароль — не меньше 6 символов";
    if (!n.login && !n.pass) {
      setLoading(true);
      void signIn(login.trim(), pass).then(() => nav({ to: "/" }))
        .catch(error => setErr({ form: error.message })).finally(() => setLoading(false));
    }
    setErr(n);
  };
  return (
    <div className="grid min-h-screen place-items-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Деканат</h1>
          <p className="mt-1 text-sm text-muted-foreground">Цифровой деканат будущего</p>
          <span className="mt-2 inline-block rounded bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground">Конкурсный прототип</span>
        </div>
        <form onSubmit={submit} noValidate className="space-y-4 rounded-xl border border-border bg-card p-6">
          <div>
            <label htmlFor="lg" className="mb-1.5 block text-sm font-medium">Логин</label>
            <input id="lg" className="field" value={login} onChange={(e) => setLogin(e.target.value)} aria-invalid={!!err.login} aria-describedby={err.login ? "lg-e" : undefined} autoComplete="username" />
            {err.login && <p id="lg-e" className="mt-1 text-xs text-destructive">{err.login}</p>}
          </div>
          <div>
            <label htmlFor="pw" className="mb-1.5 block text-sm font-medium">Пароль</label>
            <input id="pw" type="password" className="field" value={pass} onChange={(e) => setPass(e.target.value)} aria-invalid={!!err.pass} aria-describedby={err.pass ? "pw-e" : undefined} autoComplete="current-password" />
            {err.pass && <p id="pw-e" className="mt-1 text-xs text-destructive">{err.pass}</p>}
          </div>
          {err.form && <p role="alert" className="rounded-lg bg-warning-soft p-3 text-sm text-warning">{err.form}</p>}
          <Btn type="submit" disabled={loading} className="w-full">
            {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />} Войти
          </Btn>
          <p className="text-center text-xs text-muted-foreground">Все данные синтетические.</p>
        </form>
      </div>
    </div>
  );
}
