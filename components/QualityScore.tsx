import { AnalysisResult } from "@/lib/types";
import { ShieldCheck, ShieldAlert, ShieldX, AlertTriangle } from "lucide-react";

interface Props {
  result: AnalysisResult;
}

function scoreLabel(score: number): { label: string; color: string; bg: string; ring: string } {
  if (score >= 80) return { label: "Clean", color: "text-safe", bg: "bg-safe/[0.09]", ring: "stroke-safe" };
  if (score >= 60) return { label: "Acceptable", color: "text-caution", bg: "bg-caution/[0.09]", ring: "stroke-caution" };
  if (score >= 40) return { label: "Moderate Concern", color: "text-caution", bg: "bg-caution/[0.09]", ring: "stroke-caution" };
  return { label: "High Concern", color: "text-danger", bg: "bg-danger/[0.09]", ring: "stroke-danger" };
}

function ScoreRing({ score }: { score: number }) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, score)) / 100;
  const { color, ring } = scoreLabel(score);

  return (
    <div className="relative w-24 h-24 shrink-0">
      <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
        <circle cx="48" cy="48" r={r} strokeWidth="7" className="stroke-warm-100" fill="none"/>
        <circle
          cx="48" cy="48" r={r}
          strokeWidth="7"
          className={ring}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - pct)}
          style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.16,1,0.3,1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-[22px] font-bold leading-none ${color}`}>{score}</span>
        <span className="text-[10px] text-warm-400 font-medium mt-0.5">/ 100</span>
      </div>
    </div>
  );
}

export default function QualityScore({ result }: Props) {
  const score = result.qualityScore ?? 50;
  const { label, color, bg } = scoreLabel(score);

  const verdictIcon =
    result.verdict === "safe" ? <ShieldCheck className="w-4 h-4" /> :
    result.verdict === "warning" ? <ShieldAlert className="w-4 h-4" /> :
    <ShieldX className="w-4 h-4" />;

  const avoidCount = result.ingredients.filter(i => i.safety === "avoid").length;
  const cautionCount = result.ingredients.filter(i => i.safety === "caution").length;
  const safeCount = result.ingredients.filter(i => i.safety === "safe").length;

  return (
    <div className={`rounded-card ${bg} overflow-hidden animate-fade-up`}>
      <div className="p-5">
        <div className="flex items-center gap-5">
          <ScoreRing score={score} />
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold text-warm-400 uppercase tracking-widest mb-1">Ingredient Quality</p>
            <p className={`text-[22px] font-bold tracking-tight leading-none ${color}`}>{label}</p>
            <div className={`inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-pill text-[12px] font-semibold ${color} bg-white/60`}>
              {verdictIcon}
              <span>{result.verdict === "safe" ? "No conflicts found" : result.verdict === "warning" ? "Check flagged items" : "Conflicts with your profile"}</span>
            </div>
          </div>
        </div>

        {/* Stat row */}
        <div className="flex gap-2 mt-4">
          {[
            { n: avoidCount, label: "Avoid", color: "text-danger", bg: "bg-danger/[0.08]" },
            { n: cautionCount, label: "Caution", color: "text-caution", bg: "bg-caution/[0.08]" },
            { n: safeCount, label: "Safe", color: "text-safe", bg: "bg-safe/[0.08]" },
          ].map(({ n, label, color, bg }) => (
            <div key={label} className={`flex-1 rounded-[12px] ${bg} py-2.5 text-center`}>
              <p className={`text-[18px] font-bold ${color}`}>{n}</p>
              <p className="text-[11px] text-warm-500 font-medium">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Personal warnings */}
      {result.personalWarnings && result.personalWarnings.length > 0 && (
        <div className="px-5 pb-4">
          <div className="border-t border-black/[0.06] pt-4 space-y-2">
            {result.personalWarnings.map((w, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 text-caution shrink-0" />
                <span className="text-[14px] font-semibold text-warm-800">{w}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
