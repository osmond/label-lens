"use client";
import { useState, useRef, useEffect } from "react";
import { loadProfile } from "@/lib/profile";
import { saveToHistory } from "@/lib/history";
import { AnalysisResult, UserProfile } from "@/lib/types";
import VerdictBanner from "@/components/VerdictBanner";
import IngredientGrid from "@/components/IngredientGrid";
import ShareButton from "@/components/ShareButton";
import Link from "next/link";

type Mode = "image" | "text";

function fileToBase64(file: File): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const [header, base64] = dataUrl.split(",");
      resolve({ base64, mimeType: header.match(/data:([^;]+)/)?.[1] ?? "image/jpeg" });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function haptic(ms = 8) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate(ms);
}

export default function ScanPage() {
  const [mode, setMode] = useState<Mode>("image");
  const [text, setText] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile>({ restrictions: [], customAllergens: [] });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const resultSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setProfile(loadProfile()); }, []);

  function handleFileSelect(file: File) {
    if (!file.type.startsWith("image/")) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setResult(null);
    setError(null);
    haptic();
  }

  async function handleAnalyze() {
    setError(null);
    setResult(null);
    setLoading(true);
    haptic(12);
    try {
      let body: Record<string, unknown> = { profile };
      if (mode === "image" && imageFile) {
        const { base64, mimeType } = await fileToBase64(imageFile);
        body = { ...body, imageBase64: base64, imageMimeType: mimeType };
      } else if (mode === "text" && text.trim()) {
        body = { ...body, text: text.trim() };
      } else {
        setError("Please provide an image or paste ingredient text.");
        setLoading(false);
        return;
      }
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Analysis failed");
      const data: AnalysisResult = await res.json();
      setResult(data);
      saveToHistory(data, mode);
      haptic(20);
      setTimeout(() => resultSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 150);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      haptic(30);
    } finally {
      setLoading(false);
    }
  }

  const hasProfile = profile.restrictions.length > 0 || profile.customAllergens.length > 0;
  const canAnalyze = mode === "image" ? !!imageFile : !!text.trim();

  return (
    <div className="space-y-5">
      {/* Large title */}
      <div className="animate-fade-up">
        <h1 className="text-[32px] font-bold text-warm-900 tracking-tight leading-none">Scan a Label</h1>
        <p className="text-[15px] text-warm-400 mt-1.5">Instant AI-powered ingredient breakdown</p>
      </div>

      {/* Mock mode */}
      {process.env.NEXT_PUBLIC_MOCK_MODE === "true" && (
        <div className="animate-fade-up-d1 rounded-[14px] bg-brand-50 border border-brand-100 px-4 py-3 flex items-center gap-3">
          <div className="w-7 h-7 rounded-[8px] bg-brand-100 flex items-center justify-center shrink-0">
            <span className="text-[14px]">🧪</span>
          </div>
          <p className="text-[13px] font-medium text-brand-600">
            Mock mode — sample data only. Add a real API key to use Claude.
          </p>
        </div>
      )}

      {/* Main input card */}
      <div className="animate-fade-up-d1 rounded-card-lg bg-white shadow-card overflow-hidden">
        {/* Mode selector */}
        <div className="flex border-b border-warm-100">
          {(["image", "text"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setResult(null); setError(null); haptic(); }}
              className={`pressable flex-1 py-3.5 text-[14px] font-semibold transition-colors border-b-2 ${
                mode === m
                  ? "text-brand-500 border-brand-500"
                  : "text-warm-400 border-transparent"
              }`}
            >
              {m === "image" ? "📷  Photo" : "✏️  Paste Text"}
            </button>
          ))}
        </div>

        {/* Camera hero */}
        {mode === "image" ? (
          <div>
            <div
              onClick={() => { fileInputRef.current?.click(); haptic(); }}
              onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFileSelect(f); }}
              onDragOver={(e) => e.preventDefault()}
              className="pressable relative overflow-hidden"
              style={{ minHeight: "240px" }}
            >
              {imagePreview ? (
                <>
                  <img src={imagePreview} alt="Label" className="w-full object-cover" style={{ maxHeight: "340px" }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  <button
                    onClick={(e) => { e.stopPropagation(); setImageFile(null); setImagePreview(null); setResult(null); haptic(); }}
                    className="pressable absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center"
                  >
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-14 px-6 gap-5">
                  <div className="w-20 h-20 rounded-[22px] bg-brand-50 flex items-center justify-center">
                    <svg className="w-9 h-9 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6}
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                      <circle cx="12" cy="13" r="3" strokeWidth={1.6}/>
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="text-[17px] font-semibold text-warm-800">Take a Photo</p>
                    <p className="text-[13px] text-warm-400 mt-1">Point your camera at an ingredient list<br/>or drag and drop an image</p>
                  </div>
                </div>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])} />
          </div>
        ) : (
          <div className="p-4">
            <textarea
              value={text}
              onChange={(e) => { setText(e.target.value); setResult(null); setError(null); }}
              placeholder="Paste ingredient list here…&#10;&#10;e.g. Water, Sugar, Modified Starch (E1422), Citric Acid, Natural Flavours..."
              rows={7}
              className="input-field w-full px-4 py-3.5 text-[15px] resize-none leading-relaxed"
            />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mx-4 mb-4 px-4 py-3 bg-danger/[0.08] rounded-[12px] border border-danger/20">
            <p className="text-[13px] font-medium text-danger">{error}</p>
          </div>
        )}

        {/* CTA */}
        <div className="p-4 pt-0">
          {mode === "text" ? null : <div className="h-3" />}
          <button
            onClick={handleAnalyze}
            disabled={loading || !canAnalyze}
            className="pressable w-full py-4 bg-brand-500 text-white rounded-[16px] text-[17px] font-bold tracking-tight flex items-center justify-center gap-2.5 disabled:opacity-40 transition-opacity"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 opacity-80" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4"/>
                  <path className="opacity-90" fill="white" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
                Analyzing…
              </>
            ) : "Analyze Ingredients"}
          </button>
        </div>
      </div>

      {/* Profile prompt */}
      {!hasProfile && !result && (
        <Link href="/profile" className="block pressable animate-fade-up-d2">
          <div className="rounded-card bg-white shadow-card px-5 py-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-[12px] bg-warm-100 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-warm-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="8" r="4" strokeWidth="1.7"/>
                <path d="M4 20c0-3.314 3.582-6 8-6s8 2.686 8 6" strokeLinecap="round" strokeWidth="1.7"/>
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-[15px] font-semibold text-warm-900">Set up your profile</p>
              <p className="text-[13px] text-warm-400 mt-0.5">Get personalized allergen warnings</p>
            </div>
            <svg className="w-4 h-4 text-warm-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
            </svg>
          </div>
        </Link>
      )}

      {/* Active profile */}
      {hasProfile && !result && (
        <div className="animate-fade-up-d2 flex flex-wrap gap-1.5 items-center px-1">
          <p className="text-[12px] font-semibold text-warm-400 uppercase tracking-wide mr-0.5">Profile</p>
          {profile.restrictions.map((r) => (
            <span key={r} className="text-[12px] font-semibold px-2.5 py-1 rounded-pill bg-brand-50 text-brand-600">{r}</span>
          ))}
          {profile.customAllergens.map((a) => (
            <span key={a} className="text-[12px] font-semibold px-2.5 py-1 rounded-pill bg-danger/[0.09] text-danger">{a}</span>
          ))}
        </div>
      )}

      {/* Results */}
      {result && (
        <div ref={resultSectionRef} className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <p className="text-[12px] font-bold text-warm-400 uppercase tracking-widest">Result</p>
            <ShareButton targetRef={resultRef} result={result} />
          </div>
          <div ref={resultRef} className="space-y-4">
            <VerdictBanner result={result} />
            <IngredientGrid ingredients={result.ingredients} />
          </div>
        </div>
      )}
    </div>
  );
}
