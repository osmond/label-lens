"use client";
import { useState, useEffect } from "react";
import { loadHistory } from "@/lib/history";
import { HistoryScan } from "@/lib/types";
import Link from "next/link";

const VERDICT_CONFIG = {
  safe: { label: "Safe", icon: "✓", bg: "bg-emerald-50 border-emerald-300", text: "text-emerald-700", iconBg: "bg-emerald-100" },
  warning: { label: "Check", icon: "⚠", bg: "bg-amber-50 border-amber-300", text: "text-amber-700", iconBg: "bg-amber-100" },
  danger: { label: "Danger", icon: "✕", bg: "bg-red-50 border-red-300", text: "text-red-700", iconBg: "bg-red-100" },
};

const SAFETY_COLORS = {
  safe: "text-emerald-700 bg-emerald-50",
  caution: "text-amber-700 bg-amber-50",
  avoid: "text-red-700 bg-red-50",
  neutral: "text-slate-500 bg-slate-50",
};

const FLAG_TYPE_BADGES = {
  confirmed: "bg-red-100 text-red-700",
  hidden: "bg-orange-100 text-orange-700",
  "cross-contamination": "bg-yellow-100 text-yellow-700",
};

function ScanSelector({
  history,
  selected,
  onSelect,
  label,
}: {
  history: HistoryScan[];
  selected: string;
  onSelect: (id: string) => void;
  label: string;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-slate-500">{label}</label>
      <select
        value={selected}
        onChange={(e) => onSelect(e.target.value)}
        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
      >
        <option value="">— choose a scan —</option>
        {history.map((s) => (
          <option key={s.id} value={s.id}>
            {s.productName} ({s.verdict})
          </option>
        ))}
      </select>
    </div>
  );
}

function ScanColumn({ scan }: { scan: HistoryScan }) {
  const cfg = VERDICT_CONFIG[scan.verdict];
  const avoidCount = scan.result.ingredients.filter((i) => i.safety === "avoid").length;
  const cautionCount = scan.result.ingredients.filter((i) => i.safety === "caution").length;
  const safeCount = scan.result.ingredients.filter((i) => i.safety === "safe").length;

  return (
    <div className="space-y-4">
      <div className={`rounded-xl border-2 p-4 ${cfg.bg} ${cfg.text}`}>
        <div className="flex items-center gap-2 mb-2">
          <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${cfg.iconBg}`}>
            {cfg.icon}
          </span>
          <div>
            <p className="font-bold text-sm leading-tight">{scan.productName}</p>
            <p className="text-xs opacity-60">{cfg.label}</p>
          </div>
        </div>
        <p className="text-xs opacity-70">{scan.result.summary}</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Safety breakdown</h3>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-red-50 rounded-lg p-2">
            <div className="text-xl font-bold text-red-600">{avoidCount}</div>
            <div className="text-xs text-red-500">Avoid</div>
          </div>
          <div className="bg-amber-50 rounded-lg p-2">
            <div className="text-xl font-bold text-amber-600">{cautionCount}</div>
            <div className="text-xs text-amber-500">Caution</div>
          </div>
          <div className="bg-emerald-50 rounded-lg p-2">
            <div className="text-xl font-bold text-emerald-600">{safeCount}</div>
            <div className="text-xs text-emerald-500">Safe</div>
          </div>
        </div>
      </div>

      {scan.result.flagged.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-2">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Flagged</h3>
          {scan.result.flagged.map((f, i) => (
            <div key={i} className="text-xs space-y-0.5">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-semibold text-slate-700">{f.ingredient}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${FLAG_TYPE_BADGES[f.type ?? "confirmed"]}`}>
                  {f.type ?? "confirmed"}
                </span>
              </div>
              <p className="text-slate-500">{f.reason}</p>
              {f.safeAlternative && (
                <p className="text-indigo-600">✦ {f.safeAlternative}</p>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-2">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">All ingredients ({scan.result.ingredients.length})</h3>
        <div className="space-y-1">
          {scan.result.ingredients.map((ing, i) => (
            <div key={i} className="flex items-center justify-between gap-2 text-xs">
              <span className="text-slate-700 truncate">{ing.name}</span>
              <span className={`px-1.5 py-0.5 rounded-full font-medium shrink-0 ${SAFETY_COLORS[ing.safety]}`}>
                {ing.safety}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ComparePage() {
  const [history, setHistory] = useState<HistoryScan[]>([]);
  const [leftId, setLeftId] = useState("");
  const [rightId, setRightId] = useState("");

  useEffect(() => {
    const h = loadHistory();
    setHistory(h);
    if (h.length >= 2) {
      setLeftId(h[0].id);
      setRightId(h[1].id);
    }
  }, []);

  const left = history.find((s) => s.id === leftId);
  const right = history.find((s) => s.id === rightId);

  if (history.length < 2) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-800">Compare Labels</h1>
        <div className="text-center py-16 text-slate-400">
          <div className="text-5xl mb-3">⚖️</div>
          <p className="font-medium">Need at least 2 scans to compare</p>
          <p className="text-sm mt-1">
            <Link href="/" className="text-indigo-600 underline">Scan some labels</Link> first.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Compare Labels</h1>
        <p className="text-slate-500 mt-1 text-sm">Pick two scans from your history to compare side by side.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <ScanSelector history={history} selected={leftId} onSelect={setLeftId} label="Left" />
        <ScanSelector history={history} selected={rightId} onSelect={setRightId} label="Right" />
      </div>

      {left && right && leftId !== rightId ? (
        <div className="grid grid-cols-2 gap-4">
          <ScanColumn scan={left} />
          <ScanColumn scan={right} />
        </div>
      ) : leftId === rightId && leftId !== "" ? (
        <p className="text-center text-sm text-slate-400 py-8">Select two different scans to compare.</p>
      ) : null}
    </div>
  );
}
