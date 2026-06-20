export type HistoryEntry = {
  id: string;
  date: number;
  atsScore: number;
  interviewScore: number;
  name: string | null;
};

const KEY = "resumeiq-history";
const MAX = 12;

export function loadHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as HistoryEntry[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function saveHistory(entry: Omit<HistoryEntry, "id" | "date">) {
  if (typeof window === "undefined") return [];
  const list = loadHistory();
  const next: HistoryEntry = { ...entry, id: crypto.randomUUID(), date: Date.now() };
  const updated = [...list, next].slice(-MAX);
  try {
    localStorage.setItem(KEY, JSON.stringify(updated));
  } catch {}
  return updated;
}

export function clearHistory() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(KEY);
  } catch {}
}
