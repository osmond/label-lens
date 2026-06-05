"use client";
import { useState } from "react";
import { AnalysisResult } from "@/lib/types";

const V = {
  safe: {
    gradient: "verdict-safe-bg",
    iconBg: "bg-safe/[0.12]",
    iconColor: "text-safe",
    textColor: "text-safe",
    label: "Safe for you",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7">
        <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.15"/>
        <path d="M7.5 12.5l3 3 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  warning: {
    gradient: "verdict-caution-bg",
    iconBg: "bg-caution/[0.12]",
    iconColor: "text-caution",
    textColor: "text-caution",
    label: "Check these ingredients",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7">
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M12 9v4M12 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
  danger: {
    gradient: "verdict-danger-bg",
    iconBg: "bg-danger/[0.12]",
    iconColor: "text-danger",
    textColor: "text-danger",
    label: "Contains something to avoid",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7">
        <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
};

const FLAG_TYPE = {
  confirmed: { label: "Confirmed", pill: "bg-danger/10 text-danger" },
  hidden: { label: "Hidden source", pill: "bg-caution/10 text-caution" },
  "cross-contamination": { label: "Cross-contamination", pill: "bg-warm-100 text-warm-500" },
};

function buildCopyText(result: AnalysisResult): string {
  const lines = [
    result.productName ? `Product: ${result.productName}` : null,
    `Verdict: ${result.verdict.toUpperCase()}`,
    "",
    result.summary,
    "",
    ...result.flagged.map((f) => `• ${f.ingredient}: ${f.reason}${f.safeAlternative ? `\n  Alternative: ${f.safeAlternative}` : ""}`),
    "",
    "Checked with Label Lens 🔬",
  ].filter((l) => l !== null);
  return lines.join("\n");
}

export default function VerdictBanner({ result }: { result: AnalysisResult }) {
  const cfg = V[result.verdict];
  const [copied, setCopied] = useState(false);

  return (
    <div className="rounded-card shadow-card overflow-hidden bg-white animate-scale-in">
      {/* Gradient header */}
      <div className={`${cfg.gradient} bg-white px-5 pt-5 pb-4`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3.5">
            <div className={`w-12 h-12 rounded-[14px] ${cfg.iconBg} ${cfg.iconColor} flex items-center justify-center shrink-0`}>
              {cfg.icon}
            </div>
            <div className="pt-0.5">
              {result.productName && (
                <p className="text-[12px] font-semibold text-warm-400 tracking-wide uppercase mb-0.5">
                  {result.productName}
                </p>
              )}
              <p className={`text-[20px] font-bold leading-tight tracking-tight ${cfg.textColor}`}>
                {cfg.label}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(buildCopyText(result));
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="pressable shrink-0 mt-1"
          >
            <span className="text-[13px] font-semibold text-brand-500">
              {copied ? "Copied ✓" : "Copy"}
            </span>
          </button>
        </div>
        <p className="text-[14px] text-warm-500 leading-relaxed mt-3.5">{result.summary}</p>
      </div>

      {/* Flagged items */}
      {result.flagged.length > 0 && (
        <div className="divide-y divide-warm-100">
          {result.flagged.map((f, i) => {
            const t = FLAG_TYPE[f.type ?? "confirmed"];
            return (
              <div key={i} className="px-5 py-4">
                <div className="flex items-start gap-2 flex-wrap mb-1.5">
                  <span className="text-[15px] font-semibold text-warm-900 leading-snug">
                    {f.ingredient}
                  </span>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-pill uppercase tracking-wide ${t.pill}`}>
                    {t.label}
                  </span>
                </div>
                <p className="text-[13px] text-warm-500 leading-relaxed">{f.reason}</p>
                {f.safeAlternative && (
                  <div className="mt-2 flex items-start gap-1.5">
                    <span className="text-brand-500 text-[12px] font-bold mt-px shrink-0">Alt</span>
                    <p className="text-[12px] text-warm-500">{f.safeAlternative}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
