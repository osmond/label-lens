"use client";
import { useState, useRef, useEffect } from "react";
import { loadProfile } from "@/lib/profile";
import { saveToHistory } from "@/lib/history";
import { AnalysisResult, UserProfile } from "@/lib/types";
import VerdictBanner from "@/components/VerdictBanner";
import IngredientGrid from "@/components/IngredientGrid";
import QualityScore from "@/components/QualityScore";
import ShareButton from "@/components/ShareButton";
import BarcodeScanner from "@/components/BarcodeScanner";
import Link from "next/link";
import { Camera, AlignLeft, ScanBarcode, Check } from "lucide-react";

type Mode = "image" | "barcode" | "text";

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

function SkeletonResults() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="rounded-card bg-white shadow-card p-5 space-y-3">
        <div className="flex gap-4">
          <div className="w-24 h-24 rounded-[20px] bg-warm-100 shrink-0" />
          <div className="flex-1 space-y-2 pt-1">
            <div className="h-3 bg-warm-100 rounded-full w-20" />
            <div className="h-6 bg-warm-100 rounded-full w-36" />
            <div className="h-8 bg-warm-100 rounded-[10px] w-44 mt-2" />
          </div>
        </div>
        <div className="flex gap-2 pt-1">
          <div className="flex-1 h-16 rounded-[12px] bg-warm-100" />
          <div className="flex-1 h-16 rounded-[12px] bg-warm-100" />
          <div className="flex-1 h-16 rounded-[12px] bg-warm-100" />
        </div>
      </div>
      <div className="rounded-card bg-white shadow-card p-5 space-y-3">
        <div className="h-3 bg-warm-100 rounded-full w-28" />
        {[80, 60, 90, 70, 55].map((w, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-1 h-8 rounded-full bg-warm-100 shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 bg-warm-100 rounded-full" style={{ width: `${w}%` }} />
              <div className="h-2.5 bg-warm-100 rounded-full w-2/3" />
            </div>
            <div className="w-12 h-5 rounded-pill bg-warm-100 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}

const BENEFITS = [
  "Understand ingredients in plain English",
  "Detect allergens and sensitivities instantly",
  "Check vegan and vegetarian compatibility",
  "Discover safer alternatives",
];

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
  const scanCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setProfile(loadProfile()); }, []);

  function handleFileSelect(file: File) {
    if (!file.type.startsWith("image/")) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setResult(null);
    setError(null);
    haptic();
  }

  async function handleAnalyze(overrideText?: string, overrideName?: string) {
    setError(null);
    setResult(null);
    setLoading(true);
    haptic(12);
    try {
      const useText = overrideText ?? text;
      let body: Record<string, unknown> = { profile };
      if (mode === "image" && imageFile) {
        const { base64, mimeType } = await fileToBase64(imageFile);
        body = { ...body, imageBase64: base64, imageMimeType: mimeType };
      } else if ((mode === "text" || overrideText) && useText.trim()) {
        body = { ...body, text: useText.trim() };
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
      if (overrideName) data.productName = data.productName || overrideName;
      setResult(data);
      saveToHistory(data, mode === "image" ? "image" : "text");
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
  const canAnalyze = mode === "image" ? !!imageFile : mode === "text" ? !!text.trim() : false;
  const showHero = !imagePreview && !result && mode !== "barcode";

  return (
    <div className="space-y-6">

      {/* Landing hero — shown before any input */}
      {showHero && (
        <div className="animate-fade-up pt-2">
          <h1 className="text-[34px] sm:text-[40px] font-bold text-warm-900 tracking-tight leading-[1.1]">
            Know what&apos;s really<br className="sm:hidden" /> in your products.
          </h1>
          <p className="text-[16px] text-warm-500 mt-3 leading-relaxed max-w-md">
            Instant AI-powered ingredient analysis for food, skincare, supplements, and household products.
          </p>
          <ul className="mt-5 space-y-2.5">
            {BENEFITS.map((b) => (
              <li key={b} className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-brand-50 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-brand-500" strokeWidth={2.5} />
                </div>
                <span className="text-[14px] text-warm-700 font-medium">{b}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* After upload — compact title */}
      {!showHero && !result && (
        <div className="animate-fade-up">
          <h1 className="text-[28px] font-bold text-warm-900 tracking-tight leading-none">Scan a Label</h1>
          <p className="text-[14px] text-warm-400 mt-1">AI-powered ingredient breakdown</p>
        </div>
      )}

      {/* Main input card */}
      <div ref={scanCardRef} className="animate-fade-up-d1 rounded-card-lg bg-white shadow-card overflow-hidden">
        {/* Mode selector */}
        <div className="flex border-b border-warm-100">
          {([
            { id: "image" as Mode, icon: <Camera className="w-4 h-4" />, label: "Photo" },
            { id: "barcode" as Mode, icon: <ScanBarcode className="w-4 h-4" />, label: "Barcode" },
            { id: "text" as Mode, icon: <AlignLeft className="w-4 h-4" />, label: "Text" },
          ]).map(({ id, icon, label }) => (
            <button
              key={id}
              onClick={() => { setMode(id); setResult(null); setError(null); haptic(); }}
              className={`pressable flex-1 py-3.5 text-[14px] font-semibold transition-colors border-b-2 ${
                mode === id ? "text-brand-500 border-brand-500" : "text-warm-400 border-transparent"
              }`}
            >
              <span className="flex items-center justify-center gap-1.5">{icon}{label}</span>
            </button>
          ))}
        </div>

        {/* Barcode scanner */}
        {mode === "barcode" && (
          <BarcodeScanner
            onResult={(ingredients, productName) => {
              handleAnalyze(ingredients, productName);
            }}
            onError={(msg) => { setError(msg); haptic(30); }}
          />
        )}

        {/* Camera hero */}
        {mode === "image" && (
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
                    <Camera className="w-9 h-9 text-brand-400" strokeWidth={1.5} />
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
        )}

        {/* Text input */}
        {mode === "text" && (
          <div className="p-4">
            <textarea
              value={text}
              onChange={(e) => { setText(e.target.value); setResult(null); setError(null); }}
              placeholder={"Paste ingredient list here…\n\ne.g. Water, Sugar, Modified Starch (E1422), Citric Acid, Natural Flavours..."}
              rows={7}
              className="input-field w-full px-4 py-3.5 text-[15px] resize-none leading-relaxed"
            />
          </div>
        )}

        {/* Barcode hint */}
        {mode === "barcode" && !loading && !result && (
          <div className="px-5 pb-4 pt-1">
            <p className="text-[13px] text-warm-400 text-center">Point the camera at a barcode — it scans automatically</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mx-4 mb-4 px-4 py-3 bg-danger/[0.08] rounded-[12px] border border-danger/20">
            <p className="text-[13px] font-medium text-danger">{error}</p>
          </div>
        )}

        {/* CTA — hidden in barcode mode */}
        {mode !== "barcode" && (
          <div className="p-4 pt-0">
            {mode !== "text" && <div className="h-3" />}
            <button
              onClick={() => handleAnalyze()}
              disabled={loading || !canAnalyze}
              className={`pressable w-full py-4 rounded-[16px] text-[17px] font-bold tracking-tight flex items-center justify-center gap-2.5 transition-all ${
                canAnalyze && !loading
                  ? "bg-brand-500 text-white shadow-float"
                  : "bg-warm-100 text-warm-400 cursor-default"
              }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 opacity-80" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                  Analyzing…
                </>
              ) : "Analyze Ingredients"}
            </button>
          </div>
        )}
      </div>

      {/* Profile prompt */}
      {!hasProfile && !result && !loading && (
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

      {/* Active profile pills */}
      {hasProfile && !result && !loading && (
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

      {/* Skeleton loading */}
      {loading && (
        <div ref={resultSectionRef}>
          <SkeletonResults />
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <div ref={resultSectionRef} className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <p className="text-[12px] font-bold text-warm-400 uppercase tracking-widest">Result</p>
            <ShareButton targetRef={resultRef} result={result} />
          </div>

          {/* Desktop: two-column layout */}
          <div ref={resultRef} className="md:grid md:grid-cols-[2fr_3fr] md:gap-5 space-y-4 md:space-y-0">
            {/* Left col: image + quality score */}
            <div className="space-y-4">
              {imagePreview && (
                <div className="rounded-card overflow-hidden shadow-card">
                  <img src={imagePreview} alt="Scanned label" className="w-full object-cover max-h-64" />
                </div>
              )}
              <QualityScore result={result} />
              <VerdictBanner result={result} />
            </div>

            {/* Right col: ingredients */}
            <div>
              <IngredientGrid ingredients={result.ingredients} />
            </div>
          </div>

          {/* Compare link — secondary, in results */}
          <Link href="/compare" className="pressable block w-full py-3.5 text-center bg-white shadow-card rounded-card text-[14px] font-semibold text-brand-500">
            Compare with another product →
          </Link>
        </div>
      )}
    </div>
  );
}
