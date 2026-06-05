"use client";
import { useState, RefObject } from "react";
import { AnalysisResult } from "@/lib/types";

interface ShareButtonProps {
  targetRef: RefObject<HTMLDivElement>;
  result?: AnalysisResult;
}

function buildShareText(result?: AnalysisResult): string {
  if (!result) return "Checked with Label Lens";
  const lines = [
    result.productName ? `${result.productName}` : null,
    `Verdict: ${result.verdict.toUpperCase()}`,
    "",
    result.summary,
  ].filter(Boolean);

  if (result.flagged.length > 0) {
    lines.push("", "Flagged:");
    result.flagged.forEach((f) => {
      lines.push(`• ${f.ingredient}: ${f.reason}`);
      if (f.safeAlternative) lines.push(`  Alternative: ${f.safeAlternative}`);
    });
  }
  lines.push("", "Checked with Label Lens 🔬");
  return lines.join("\n");
}

export default function ShareButton({ targetRef, result }: ShareButtonProps) {
  const [saving, setSaving] = useState(false);

  async function handleShare() {
    if (!targetRef.current) return;
    setSaving(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(targetRef.current, {
        backgroundColor: "#f8fafc",
        scale: 2,
        useCORS: true,
      });

      if (navigator.share) {
        // Mobile: native share sheet — try with image, fall back to text
        try {
          const blob = await new Promise<Blob>((resolve, reject) =>
            canvas.toBlob((b) => (b ? resolve(b) : reject()), "image/png")
          );
          const file = new File([blob], "label-lens-result.png", { type: "image/png" });
          if (navigator.canShare?.({ files: [file] })) {
            await navigator.share({
              title: result?.productName ?? "Label Lens Result",
              text: buildShareText(result),
              files: [file],
            });
            return;
          }
        } catch {
          // file share not supported, fall through to text share
        }
        await navigator.share({
          title: result?.productName ?? "Label Lens Result",
          text: buildShareText(result),
        });
      } else {
        // Desktop: download PNG
        const link = document.createElement("a");
        link.download = "label-lens-result.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
      }
    } finally {
      setSaving(false);
    }
  }

  const isMobile = typeof navigator !== "undefined" && "share" in navigator;

  return (
    <button
      onClick={handleShare}
      disabled={saving}
      className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:border-indigo-300 hover:text-indigo-600 transition-colors disabled:opacity-50"
    >
      {saving ? (
        <>
          <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          {isMobile ? "Sharing..." : "Saving..."}
        </>
      ) : isMobile ? (
        <>
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          Share result
        </>
      ) : (
        <>
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Save as image
        </>
      )}
    </button>
  );
}
