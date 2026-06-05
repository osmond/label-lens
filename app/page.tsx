"use client";
import { useState, useRef, useEffect } from "react";
import { loadProfile } from "@/lib/profile";
import { saveToHistory } from "@/lib/history";
import { AnalysisResult, UserProfile } from "@/lib/types";
import VerdictBanner from "@/components/VerdictBanner";
import IngredientGrid from "@/components/IngredientGrid";
import ShareButton from "@/components/ShareButton";
import Link from "next/link";

type InputMode = "image" | "text";

function fileToBase64(file: File): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const [header, base64] = dataUrl.split(",");
      const mimeType = header.match(/data:([^;]+)/)?.[1] ?? "image/jpeg";
      resolve({ base64, mimeType });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function ScanPage() {
  const [mode, setMode] = useState<InputMode>("image");
  const [text, setText] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile>({ restrictions: [], customAllergens: [] });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setProfile(loadProfile());
  }, []);

  function handleFileSelect(file: File) {
    if (!file.type.startsWith("image/")) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setResult(null);
    setError(null);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }

  async function handleAnalyze() {
    setError(null);
    setResult(null);
    setLoading(true);

    try {
      let body: Record<string, unknown> = { profile };

      if (mode === "image" && imageFile) {
        const { base64, mimeType } = await fileToBase64(imageFile);
        body = { ...body, imageBase64: base64, imageMimeType: mimeType };
      } else if (mode === "text" && text.trim()) {
        body = { ...body, text: text.trim() };
      } else {
        setError("Please provide an image or ingredient text.");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Analysis failed");
      }

      const data: AnalysisResult = await res.json();
      setResult(data);
      saveToHistory(data, mode);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const hasProfile =
    profile.restrictions.length > 0 || profile.customAllergens.length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Scan a Label</h1>
        <p className="text-slate-500 mt-1 text-sm">
          Upload a product label photo or paste the ingredient text to get an AI-powered breakdown.
        </p>
      </div>

      {process.env.NEXT_PUBLIC_MOCK_MODE === "true" && (
        <div className="bg-violet-50 border border-violet-200 rounded-xl p-3 text-sm text-violet-800 flex items-center gap-2">
          <span>🧪</span>
          <span><strong>Mock mode</strong> — returning sample data. Set <code className="bg-violet-100 px-1 rounded">MOCK_MODE=false</code> and add a real API key to use Claude.</span>
        </div>
      )}

      {!hasProfile && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 flex items-start gap-3">
          <span className="text-lg">💡</span>
          <span>
            You haven&apos;t set up a dietary profile yet.{" "}
            <Link href="/profile" className="underline font-medium">
              Set up your profile
            </Link>{" "}
            to get personalized safety verdicts.
          </span>
        </div>
      )}

      {hasProfile && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 text-sm text-indigo-800 flex flex-wrap gap-1.5 items-center">
          <span className="font-medium mr-1">Active profile:</span>
          {profile.restrictions.map((r) => (
            <span key={r} className="bg-indigo-100 px-2 py-0.5 rounded-full">{r}</span>
          ))}
          {profile.customAllergens.map((a) => (
            <span key={a} className="bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">{a}</span>
          ))}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <div className="flex gap-2 bg-slate-100 p-1 rounded-xl w-fit">
          {(["image", "text"] as InputMode[]).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setResult(null); setError(null); }}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                mode === m ? "bg-white shadow text-slate-800" : "text-slate-500"
              }`}
            >
              {m === "image" ? "📷 Photo" : "✏️ Paste Text"}
            </button>
          ))}
        </div>

        {mode === "image" ? (
          <div>
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/40 transition-colors"
            >
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Label preview"
                  className="max-h-64 mx-auto rounded-lg object-contain"
                />
              ) : (
                <div className="space-y-2">
                  <div className="text-4xl">📷</div>
                  <p className="text-slate-600 font-medium">Drop a label photo here</p>
                  <p className="text-slate-400 text-sm">or tap to take a photo / browse your library</p>
                </div>
              )}
            </div>
            {/* capture="environment" opens the camera directly on mobile */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            />
          </div>
        ) : (
          <textarea
            value={text}
            onChange={(e) => { setText(e.target.value); setResult(null); setError(null); }}
            placeholder="Paste ingredient list here, e.g. Water, Sugar, Modified Starch (E1422), Citric Acid, Natural Flavours..."
            rows={6}
            className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />
        )}

        {error && (
          <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">{error}</p>
        )}

        <button
          onClick={handleAnalyze}
          disabled={loading || (mode === "image" ? !imageFile : !text.trim())}
          className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Analyzing ingredients...
            </>
          ) : (
            "Analyze Ingredients"
          )}
        </button>
      </div>

      {result && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-slate-500">Result</h2>
            <ShareButton targetRef={resultRef} />
          </div>
          <div ref={resultRef} className="space-y-6 rounded-xl">
            <VerdictBanner result={result} />
            <IngredientGrid ingredients={result.ingredients} />
          </div>
        </div>
      )}
    </div>
  );
}
