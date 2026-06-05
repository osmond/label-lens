"use client";
import { useState, useEffect } from "react";
import { loadHistory } from "@/lib/history";
import { HistoryScan } from "@/lib/types";
import Link from "next/link";

const V = {
  safe: { dot: "bg-safe", text: "text-safe", label: "Safe", tint: "bg-safe/[0.08]" },
  warning: { dot: "bg-caution", text: "text-caution", label: "Warning", tint: "bg-caution/[0.08]" },
  danger: { dot: "bg-danger", text: "text-danger", label: "Danger", tint: "bg-danger/[0.08]" },
};
const SD = { safe: "bg-safe", caution: "bg-caution", avoid: "bg-danger", neutral: "bg-warm-200" };
const ST = { safe: "text-safe", caution: "text-caution", avoid: "text-danger", neutral: "text-warm-400" };

function Col({ scan }: { scan: HistoryScan }) {
  const v = V[scan.verdict];
  const avoid = scan.result.ingredients.filter((i) => i.safety === "avoid").length;
  const caution = scan.result.ingredients.filter((i) => i.safety === "caution").length;
  const safe = scan.result.ingredients.filter((i) => i.safety === "safe").length;

  return (
    <div className="space-y-3">
      <div className={`rounded-card-sm shadow-card overflow-hidden ${v.tint}`}>
        <div className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-2.5 h-2.5 rounded-full ${v.dot}`} />
            <span className={`text-[12px] font-bold uppercase tracking-wide ${v.text}`}>{v.label}</span>
          </div>
          <p className="text-[14px] font-bold text-warm-900 leading-snug">{scan.productName}</p>
          <p className="text-[12px] text-warm-500 mt-1.5 leading-relaxed line-clamp-3">{scan.result.summary}</p>
        </div>
        <div className="flex border-t border-black/[0.06] divide-x divide-black/[0.06]">
          {[{ n: avoid, l: "Avoid", c: "text-danger" }, { n: caution, l: "Caution", c: "text-caution" }, { n: safe, l: "Safe", c: "text-safe" }].map(({ n, l, c }) => (
            <div key={l} className="flex-1 py-2.5 text-center">
              <p className={`text-[18px] font-bold ${c}`}>{n}</p>
              <p className="text-[11px] text-warm-400 font-medium">{l}</p>
            </div>
          ))}
        </div>
      </div>

      {scan.result.flagged.length > 0 && (
        <div className="rounded-card-sm bg-white shadow-card overflow-hidden">
          <p className="text-[11px] font-bold text-warm-400 uppercase tracking-widest px-4 pt-3.5 pb-1">Flagged</p>
          {scan.result.flagged.map((f, i) => (
            <div key={i} className={`px-4 py-2.5 ${i > 0 ? "border-t border-warm-100" : ""}`}>
              <p className="text-[13px] font-semibold text-warm-800">{f.ingredient}</p>
              <p className="text-[11px] text-warm-500 mt-0.5 leading-relaxed">{f.reason}</p>
              {f.safeAlternative && <p className="text-[11px] text-brand-500 mt-1 font-medium">→ {f.safeAlternative}</p>}
            </div>
          ))}
        </div>
      )}

      <div className="rounded-card-sm bg-white shadow-card overflow-hidden">
        <p className="text-[11px] font-bold text-warm-400 uppercase tracking-widest px-4 pt-3.5 pb-1">
          All Ingredients ({scan.result.ingredients.length})
        </p>
        {scan.result.ingredients.map((ing, i) => (
          <div key={i} className={`flex items-center gap-2.5 px-4 py-2.5 ${i > 0 ? "border-t border-warm-100" : ""}`}>
            <div className={`w-[4px] self-stretch rounded-full shrink-0 ${SD[ing.safety]}`} />
            <div className="flex-1 min-w-0">
              <p className="text-[12px] text-warm-800 truncate">{ing.name}</p>
            </div>
            {ing.safety !== "neutral" && (
              <span className={`text-[10px] font-bold shrink-0 ${ST[ing.safety]}`}>
                {ing.safety.charAt(0).toUpperCase() + ing.safety.slice(1)}
              </span>
            )}
          </div>
        ))}
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
    if (h.length >= 2) { setLeftId(h[0].id); setRightId(h[1].id); }
  }, []);

  const left = history.find((s) => s.id === leftId);
  const right = history.find((s) => s.id === rightId);

  if (history.length < 2) {
    return (
      <div className="space-y-5">
        <div className="animate-fade-up">
          <h1 className="text-[32px] font-bold text-warm-900 tracking-tight leading-none">Compare</h1>
        </div>
        <div className="animate-fade-up-d1 flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-[24px] bg-warm-100 flex items-center justify-center mb-5">
            <svg className="w-9 h-9 text-warm-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="3" y="4" width="8" height="16" rx="2" strokeWidth="1.5"/>
              <rect x="13" y="4" width="8" height="16" rx="2" strokeWidth="1.5"/>
            </svg>
          </div>
          <p className="text-[20px] font-bold text-warm-700 tracking-tight">Need 2 scans to compare</p>
          <p className="text-[15px] text-warm-400 mt-2 leading-relaxed">
            Scan a couple of labels and<br/>come back to compare them.
          </p>
          <Link href="/" className="pressable mt-6 px-6 py-3 bg-brand-500 text-white rounded-pill text-[15px] font-bold inline-block">
            Start scanning
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="animate-fade-up">
        <h1 className="text-[32px] font-bold text-warm-900 tracking-tight leading-none">Compare</h1>
        <p className="text-[15px] text-warm-400 mt-1.5">Pick two scans to see side by side</p>
      </div>

      <div className="animate-fade-up-d1 grid grid-cols-2 gap-3">
        {[{ id: leftId, setId: setLeftId, label: "Left" }, { id: rightId, setId: setRightId, label: "Right" }].map(({ id, setId, label }) => (
          <div key={label}>
            <p className="text-[11px] font-bold text-warm-400 uppercase tracking-widest mb-1.5">{label}</p>
            <select
              value={id}
              onChange={(e) => setId(e.target.value)}
              className="w-full bg-white rounded-[14px] shadow-card px-3 py-2.5 text-[13px] text-warm-800 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="">Select…</option>
              {history.map((s) => (
                <option key={s.id} value={s.id}>{s.productName}</option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {left && right && leftId !== rightId && (
        <div className="animate-scale-in grid grid-cols-2 gap-3">
          <Col scan={left} />
          <Col scan={right} />
        </div>
      )}
      {leftId === rightId && leftId && (
        <p className="text-center text-[14px] text-warm-400 py-8">Select two different scans.</p>
      )}
    </div>
  );
}
