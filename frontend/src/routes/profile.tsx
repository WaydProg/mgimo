import { createFileRoute } from "@tanstack/react-router";
import { Card, PageTitle } from "@/components/ui-kit";
import { useStudentData } from "@/lib/store";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Профиль — Деканат" }, { name: "description", content: "Данные студента." }, { property: "og:title", content: "Профиль — Деканат" }, { property: "og:description", content: "Данные студента." }] }),
  component: Profile,
});

function Profile() {
  const { student } = useStudentData();
  const rows = [["Факультет", student.faculty], ["Направление", student.program], ["Курс", `${student.course} курс`], ["Группа", student.group], ["Студенческий билет", student.id], ["Форма обучения", student.form], ["Куратор", student.advisor]];
  return (
    <>
      <PageTitle title="Профиль" />
      <Card className="mb-4 flex items-center gap-4"><div className="avatar h-14 w-14 text-base">{student.initials}</div><div className="min-w-0"><p className="text-lg font-semibold">{student.name}</p><p className="text-sm text-muted-foreground">{student.group} · {student.course} курс</p></div></Card>
      <Card className="p-0 sm:p-0"><dl className="divide-y divide-border">
        {rows.map(([k, v]) => <div key={k} className="grid gap-0.5 px-4 py-3 text-sm sm:grid-cols-3"><dt className="text-muted-foreground">{k}</dt><dd className="font-medium sm:col-span-2">{v}</dd></div>)}
      </dl></Card>
    </>
  );
}
