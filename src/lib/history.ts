export type HistoryKind = "email" | "meeting" | "plan";

export type HistoryEntry = {
  id: string;
  kind: HistoryKind;
  title: string;
  preview: string;
  createdAt: number;
};

const KEY = "velaro.history.v1";
const LISTENERS = new Set<() => void>();

export function readHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

export function addHistory(entry: Omit<HistoryEntry, "id" | "createdAt">) {
  if (typeof window === "undefined") return;
  const list = readHistory();
  list.unshift({
    ...entry,
    id: `${Date.now()}-${Math.round(Math.random() * 1e6)}`,
    createdAt: Date.now(),
  });
  window.localStorage.setItem(KEY, JSON.stringify(list.slice(0, 50)));
  LISTENERS.forEach((l) => l());
}

export function clearHistory() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
  LISTENERS.forEach((l) => l());
}

export function subscribeHistory(listener: () => void) {
  LISTENERS.add(listener);
  return () => {
    LISTENERS.delete(listener);
  };
}

export function timeAgo(ts: number) {
  const diff = Math.max(0, Date.now() - ts);
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export const KIND_LABEL: Record<HistoryKind, string> = {
  email: "Email Generator",
  meeting: "Meeting Summarizer",
  plan: "Task Planner",
};
