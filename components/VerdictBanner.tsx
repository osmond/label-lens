"use client";
import { useState } from "react";
import { AnalysisResult } from "@/lib/types";

const VERDICT_CONFIG = {
  safe: {
    icon: "✓",
    label: "Safe for you",
    bg: "bg-emerald-50 border-emerald-300",
    text: "text-emerald-800",
    iconBg: "bg-emerald-100 text-emerald-700",
  },
  warning: {
    icon: "⚠",
    label: "Check these ingredients",
    bg: "bg-amber-50 border-amber-300",
    text: "text-amber-800",
    iconBg: "bg-amber-100 text-amber-700",
  },
  danger: {
    icon: "✕",
    label: "Contains something you avoid",
    bg: "bg-red-50 border-red-300",
    text: "text-red-800",
    iconBg: "bg-red-100 text-red-700",
  },
};

const FLAG_TYPE_CONFIG = {
  confirmed: { label: "Confirmed allergen", badge: "bg-red-100 text-red-700 border border-red-200" },
  hidden: { label: "Hidden source", badge: "bg-orange-100 text-orange-700 border border-orange-200" },
  "cross-contamination": { label: "Cross-contamination risk", badge: "bg-yellow-100 text-yellow-700 border border-yellow-200" },
};

export default function VerdictBanner({ result }: { result: AnalysisResult }) {
  const cfg = VERDICT_CONFIG[result.verdict];
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    const lines = result.flagged.map(
      (f) => `• ${f.ingredient}: ${f.reason}${f.safeAlternative ? ` (Alternative: ${f.safeAlternative})` : ""}`
    );
    const text = [
      result.productName ? `Product: ${result.productName}` : null,
      `Verdict: ${result.verdict.toUpperCase()}`,
      "",
      result.summary,
      "",
      lines.length > 0 ? "Flagged ingredients:\n" + lines.join("\n") : "No flagged ingredients.",
    ]
      .filter((l) => l !== null)
      .join("\n");

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className={`rounded-xl border-2 p-4 ${cfg.bg} ${cfg.text} mb-4`}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-3">
          <span className={`text-2xl font-bold w-10 h-10 flex items-center justify-center rounded-full shrink-0 ${cfg.iconBg}`}>
            {cfg.icon}
          </span>
          <div>
            {result.productName && (
              <p className="text-xs font-medium opacity-60 mb-0.5">{result.productName}</p>
            )}
            <span className="text-xl font-semibold">{cfg.label}</span>
          </div>
        </div>
        <button
          onClick={handleCopy}
          title="Copy result to clipboard"
          className="shrink-0 text-xs px-3 py-1.5 rounded-lg bg-white/60 hover:bg-white/90 transition-colors font-medium opacity-70 hover:opacity-100"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      <p className="text-sm opacity-80 ml-[52px]">{result.summary}</p>

      {result.flagged.length > 0 && (
        <div className="mt-3 space-y-2">
          {result.flagged.map((f, i) => {
            const typeCfg = FLAG_TYPE_CONFIG[f.type ?? "confirmed"];
            return (
              <div key={i} className="bg-white/60 rounded-lg p-3 text-sm space-y-1.5">
                <div className="flex items-center flex-wrap gap-2">
                  <span className="font-semibold">{f.ingredient}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeCfg.badge}`}>
                    {typeCfg.label}
                  </span>
                </div>
                <p>{f.reason}</p>
                {f.safeAlternative && (
                  <p className="text-xs opacity-70 flex items-center gap-1">
                    <span>✦</span>
                    <span><strong>Alternative:</strong> {f.safeAlternative}</span>
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
