import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type ReqStatus = "Принята" | "В работе" | "Готова" | "Выдана";
export type Request = {
  id: string; title: string; purpose: string; copies: number; format: string;
  created: string; status: ReqStatus; history: { status: ReqStatus; at: string }[];
};
export type Note = { id: string; title: string; text: string; at: string; read: boolean; to: string; kind: "schedule" | "deadline" | "request" | "info" };
export type Lesson = { id: string; day: number; time: string; title: string; type: string; teacher: string; room: string; moved?: string };

export const days = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
export const TODAY = 3;
export const statusOrder: ReqStatus[] = ["Принята", "В работе", "Готова", "Выдана"];
type Dashboard = {
  student: {"name":string,"short":string,"initials":string,"faculty":string,"program":string,"course":number,"group":string,"id":string,"form":string,"advisor":string};
  lessons: Lesson[];
  semesters: { n: number; title: string; current?: boolean; items: { s: string; kind: string; mark: string; ects: number }[] }[];
  session: { date: string; s: string; kind: string; room: string; time: string }[];
  notes: Note[];
  requests: Request[];
};
type RequestInput = Pick<Request, "title" | "purpose" | "copies" | "format">;
async function api<T>(path: string, method = "GET", payload?: unknown): Promise<T> {
  const response = await fetch("/api/" + path, {
    method,
    ...(payload === undefined ? {} : { headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }),
  });
  if (!response.ok) throw new Error(response.status === 401 ? "Неверный логин, пароль или сессия истекла" : "Запрос не выполнен. Попробуйте ещё раз.");
  return response.json();
}

function useDashboard() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    void api<Dashboard>("dashboard").then(setData).catch(() => {}).finally(() => setLoading(false));
  }, []);
  const signIn = async (username: string, password: string) => {
    await api("login", "POST", { username, password });
    setData(await api<Dashboard>("dashboard"));
  };
  const signOut = async () => {
    await api("logout", "POST");
    setData(null);
  };
  const addRequest = async (input: RequestInput) => {
    const row = await api<Request>("requests", "POST", input);
    setData(previous => previous && { ...previous, requests: [row, ...previous.requests] });
    return row;
  };
  const mark = (id?: string) => {
    void api<Note[]>("notifications/read", "POST", { id: id ?? null })
      .then(notes => setData(previous => previous && { ...previous, notes }))
      .catch(() => window.alert("Не удалось обновить уведомления"));
  };
  return { data, loading, authed: data !== null, signIn, signOut, addRequest, markRead: mark, markAll: () => mark() };
}
const C = createContext<ReturnType<typeof useDashboard> | null>(null);
export function StoreProvider({ children }: { children: ReactNode }) {
  return <C.Provider value={useDashboard()}>{children}</C.Provider>;
}
export function useStore() {
  const context = useContext(C);
  if (!context) throw new Error("StoreProvider is missing");
  return context;
}
export function useStudentData() {
  const { data } = useStore();
  if (!data) throw new Error("Student data is missing");
  return data;
}
