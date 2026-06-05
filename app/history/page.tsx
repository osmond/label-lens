"use client";
import { useState, useEffect } from "react";
import { loadHistory, clearHistory, removeFromHistory } from "@/lib/history";
import { HistoryScan } from "@/lib/types";
import VerdictBanner from "@/components/VerdictBanner";
import IngredientGrid from "@/components/IngredientGrid";
import Link from "next/link";

const V_DOT: Record<string, string> = {
  safe: "bg-safe",
  warning: "bg-caution",
  danger: "bg-danger",
};
const V_LABEL: Record<string, string> = {
  safe: "Safe",
  warning: "Warning",
  danger: "Danger",
};
const V_TEXT: Record<string, string> = {
  safe: "text-safe",
  warning: "text-caution",
  danger: "text-danger",
};

function ago(ts: number): string {
  const d = Date.now() - ts;
  const m = Math.floor(d / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryScan[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => { setHistory(loadHistory()); }, []);

  function remove(id: string) {
    removeFromHistory(id);
    setHistory(loadHistory());
    if (expanded === id) setExpanded(null);
    if ("vibrate" in navigator) navigator.vibrate(8);
  }

  if (history.length === 0) {
    return (
      <div className="space-y-5">
        <div className="animate-fade-up">
          <h1 className="text-[32px] font-bold text-warm-900 tracking-tight leading-none">History</h1>
        </div>
        <div className="animate-fade-up-d1 flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-[24px] bg-warm-100 flex items-center justify-center mb-5">
            <svg className="w-9 h-9 text-warm-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="9" strokeWidth="1.5"/>
              <path d="M12 7v5l3 3" strokeLinecap="round" strokeWidth="1.5"/>
            </svg>
          </div>
          <p className="text-[20px] font-bold text-warm-700 tracking-tight">No scans yet</p>
          <p className="text-[15px] text-warm-400 mt-2 leading-relaxed">
            Your scan history will<br/>appear here.
          </p>
          <Link href="/" className="pressable mt-6 px-6 py-3 bg-brand-500 text-white rounded-pill text-[15px] font-bold inline-block">
            Scan your first label
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="animate-fade-up flex items-end justify-between">
        <div>
          <h1 className="text-[32px] font-bold text-warm-900 tracking-tight leading-none">History</h1>
          <p className="text-[15px] text-warm-400 mt-1.5">{history.length} scan{history.length !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={() => { if (confirm("Clear all scan history?")) { clearHistory(); setHistory([]); setExpanded(null); } }}
          className="pressable text-[14px] font-semibold text-danger mb-1"
        >
          Clear all
        </button>
      </div>

      <div className="space-y-3 animate-fade-up-d1">
        {history.map((scan) => {
          const open = expanded === scan.id;
          return (
            <div key={scan.id} className="rounded-card bg-white shadow-card overflow-hidden">
              <button
                onClick={() => { setExpanded(open ? null : scan.id); if ("vibrate" in navigator) navigator.vibrate(6); }}
                className="pressable w-full flex items-center gap-4 px-5 py-4 text-left"
              >
                <div className={`w-3 h-3 rounded-full shrink-0 ${V_DOT[scan.verdict]}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-[16px] font-semibold text-warm-900 truncate">{scan.productName}</p>
                  <p className="text-[12px] text-warm-400 mt-0.5">
                    <span className={`font-semibold ${V_TEXT[scan.verdict]}`}>{V_LABEL[scan.verdict]}</span>
                    {"  ·  "}{ago(scan.timestamp)}
                    {"  ·  "}{scan.result.ingredients.length} ingredients
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={(e) => { e.stopPropagation(); remove(scan.id); }}
                    className="pressable w-7 h-7 rounded-full bg-warm-100 flex items-center justify-center"
                  >
                    <svg className="w-3.5 h-3.5 text-warm-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                  <svg className={`w-4 h-4 text-warm-300 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                  </svg>
                </div>
              </button>
              {open && (
                <div className="px-4 pb-5 pt-2 space-y-4 border-t border-warm-100">
                  <VerdictBanner result={scan.result} />
                  <IngredientGrid ingredients={scan.result.ingredients} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {history.length >= 2 && (
        <Link href="/compare"
          className="pressable animate-fade-up-d2 block w-full py-4 text-center bg-white shadow-card rounded-card text-[15px] font-bold text-brand-500">
          Compare two scans →
        </Link>
      )}
    </div>
  );
}
