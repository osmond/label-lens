"use client";
import { useState, useEffect } from "react";
import { loadHistory, clearHistory, removeFromHistory } from "@/lib/history";
import { HistoryScan } from "@/lib/types";
import VerdictBanner from "@/components/VerdictBanner";
import IngredientGrid from "@/components/IngredientGrid";
import Link from "next/link";

const VERDICT_COLORS = {
  safe: "text-emerald-700 bg-emerald-50 border-emerald-200",
  warning: "text-amber-700 bg-amber-50 border-amber-200",
  danger: "text-red-700 bg-red-50 border-red-200",
};

const VERDICT_ICONS = { safe: "✓", warning: "⚠", danger: "✕" };

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryScan[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  function handleRemove(id: string) {
    removeFromHistory(id);
    setHistory(loadHistory());
    if (expanded === id) setExpanded(null);
  }

  function handleClearAll() {
    if (!confirm("Clear all scan history?")) return;
    clearHistory();
    setHistory([]);
    setExpanded(null);
  }

  if (history.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-800">Scan History</h1>
        <div className="text-center py-16 text-slate-400">
          <div className="text-5xl mb-3">🕐</div>
          <p className="font-medium">No scans yet</p>
          <p className="text-sm mt-1">
            <Link href="/" className="text-indigo-600 underline">Scan a label</Link> to see your history here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Scan History</h1>
        <button
          onClick={handleClearAll}
          className="text-sm text-slate-400 hover:text-red-500 transition-colors"
        >
          Clear all
        </button>
      </div>

      <div className="space-y-3">
        {history.map((scan) => {
          const isOpen = expanded === scan.id;
          const verdictCfg = VERDICT_COLORS[scan.verdict];

          return (
            <div key={scan.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div
                className="flex items-center gap-3 p-4 cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => setExpanded(isOpen ? null : scan.id)}
              >
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border ${verdictCfg}`}>
                  {VERDICT_ICONS[scan.verdict]}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 truncate">{scan.productName}</p>
                  <p className="text-xs text-slate-400">
                    {timeAgo(scan.timestamp)} · {scan.inputType === "image" ? "📷 photo" : "✏️ text"} · {scan.result.ingredients.length} ingredients
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleRemove(scan.id); }}
                    className="text-slate-300 hover:text-red-400 transition-colors text-lg leading-none"
                    title="Remove"
                  >
                    ×
                  </button>
                  <svg
                    className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {isOpen && (
                <div className="px-4 pb-4 space-y-4 border-t border-slate-100 pt-4">
                  <VerdictBanner result={scan.result} />
                  <IngredientGrid ingredients={scan.result.ingredients} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {history.length >= 2 && (
        <div className="text-center">
          <Link
            href="/compare"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            Compare two scans →
          </Link>
        </div>
      )}
    </div>
  );
}
