import { HistoryScan, AnalysisResult } from "./types";

const STORAGE_KEY = "label-lens-history";
const MAX_HISTORY = 10;

export function loadHistory(): HistoryScan[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveToHistory(result: AnalysisResult, inputType: "image" | "text"): HistoryScan {
  const history = loadHistory();
  const scan: HistoryScan = {
    id: Date.now().toString(),
    timestamp: Date.now(),
    productName: result.productName ?? "Unknown product",
    verdict: result.verdict,
    result,
    inputType,
  };
  const updated = [scan, ...history].slice(0, MAX_HISTORY);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return scan;
}

export function clearHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function removeFromHistory(id: string): void {
  const history = loadHistory();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history.filter((s) => s.id !== id)));
}
