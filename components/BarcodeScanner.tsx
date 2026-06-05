"use client";
import { useEffect, useRef, useState } from "react";
import { ScanBarcode, Loader2 } from "lucide-react";

interface BarcodeScannerProps {
  onResult: (ingredients: string, productName: string) => void;
  onError: (msg: string) => void;
}

export default function BarcodeScanner({ onResult, onError }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [scanning, setScanning] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [lastCode, setLastCode] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const readerRef = useRef<any>(null);

  useEffect(() => {
    let active = true;

    async function start() {
      setScanning(true);
      const { BrowserMultiFormatReader } = await import("@zxing/browser");
      const reader = new BrowserMultiFormatReader();
      readerRef.current = reader;

      try {
        await reader.decodeFromConstraints(
          { video: { facingMode: "environment" } },
          videoRef.current!,
          async (result, err) => {
            if (!result || !active || fetching) return;
            const code = result.getText();
            if (code === lastCode) return;
            setLastCode(code);

            if ("vibrate" in navigator) navigator.vibrate(15);
            setFetching(true);

            try {
              const res = await fetch(
                `https://world.openfoodfacts.org/api/v0/product/${code}.json`
              );
              const data = await res.json();
              if (data.status !== 1 || !data.product) {
                onError(`Product not found in database (${code}). Try the photo or text mode.`);
                setFetching(false);
                setLastCode("");
                return;
              }
              const product = data.product;
              const ingredients =
                product.ingredients_text_en ||
                product.ingredients_text ||
                "";
              const name =
                product.product_name_en ||
                product.product_name ||
                product.brands ||
                "Unknown Product";

              if (!ingredients) {
                onError(`No ingredient data found for "${name}". Try the photo mode instead.`);
                setFetching(false);
                setLastCode("");
                return;
              }

              onResult(ingredients, name);
            } catch {
              onError("Failed to look up barcode. Check your connection.");
              setFetching(false);
              setLastCode("");
            }
          }
        );
      } catch {
        onError("Camera access denied. Allow camera access and try again.");
        setScanning(false);
      }
    }

    start();

    return () => {
      active = false;
      readerRef.current = null;
    };
  }, []);

  return (
    <div className="relative overflow-hidden" style={{ minHeight: "260px" }}>
      <video
        ref={videoRef}
        className="w-full object-cover"
        style={{ maxHeight: "340px" }}
        playsInline
        muted
      />

      {/* Viewfinder overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="relative w-52 h-32">
          {/* Corner brackets */}
          {[
            "top-0 left-0 border-t-2 border-l-2 rounded-tl-[6px]",
            "top-0 right-0 border-t-2 border-r-2 rounded-tr-[6px]",
            "bottom-0 left-0 border-b-2 border-l-2 rounded-bl-[6px]",
            "bottom-0 right-0 border-b-2 border-r-2 rounded-br-[6px]",
          ].map((cls, i) => (
            <div key={i} className={`absolute w-6 h-6 border-white ${cls}`} />
          ))}
          {/* Scan line animation */}
          {!fetching && (
            <div
              className="absolute left-0 right-0 h-[2px] bg-brand-400/70"
              style={{
                animation: "scanLine 1.8s ease-in-out infinite",
                top: "50%",
              }}
            />
          )}
        </div>
      </div>

      {/* Status overlay */}
      {fetching && (
        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-7 h-7 text-white animate-spin" />
          <p className="text-white text-[14px] font-semibold">Looking up product…</p>
        </div>
      )}

      {!scanning && !fetching && (
        <div className="absolute inset-0 bg-warm-100 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-warm-300 animate-spin" />
        </div>
      )}

      <style>{`
        @keyframes scanLine {
          0%, 100% { transform: translateY(-28px); opacity: 0.4; }
          50% { transform: translateY(28px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
