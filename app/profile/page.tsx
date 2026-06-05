"use client";
import { useState, useEffect } from "react";
import { loadProfile, saveProfile, COMMON_RESTRICTIONS } from "@/lib/profile";
import { UserProfile } from "@/lib/types";

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile>({ restrictions: [], customAllergens: [] });
  const [customInput, setCustomInput] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => { setProfile(loadProfile()); }, []);

  function toggle(r: string) {
    setProfile((p) => ({
      ...p,
      restrictions: p.restrictions.includes(r) ? p.restrictions.filter((x) => x !== r) : [...p.restrictions, r],
    }));
    setSaved(false);
  }

  function addCustom() {
    const val = customInput.trim();
    if (!val || profile.customAllergens.includes(val)) return;
    setProfile((p) => ({ ...p, customAllergens: [...p.customAllergens, val] }));
    setCustomInput("");
    setSaved(false);
  }

  function save() {
    saveProfile(profile);
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
    if ("vibrate" in navigator) navigator.vibrate(12);
  }

  return (
    <div className="space-y-6">
      <div className="animate-fade-up">
        <h1 className="text-[32px] font-bold text-warm-900 tracking-tight leading-none">My Profile</h1>
        <p className="text-[15px] text-warm-400 mt-1.5">Saved locally on your device</p>
      </div>

      {/* Dietary restrictions */}
      <div className="animate-fade-up-d1 space-y-2">
        <p className="text-[12px] font-bold text-warm-400 uppercase tracking-widest px-1">Dietary Restrictions</p>
        <div className="rounded-card bg-white shadow-card overflow-hidden">
          {COMMON_RESTRICTIONS.map((r, i) => {
            const active = profile.restrictions.includes(r);
            return (
              <button
                key={r}
                onClick={() => toggle(r)}
                className={`pressable w-full flex items-center justify-between px-5 py-4 text-left ${
                  i > 0 ? "border-t border-warm-100" : ""
                }`}
              >
                <span className={`text-[17px] ${active ? "font-semibold text-warm-900" : "text-warm-700"}`}>{r}</span>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                  active ? "bg-brand-500" : "border-2 border-warm-200"
                }`}>
                  {active && (
                    <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
                    </svg>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom allergens */}
      <div className="animate-fade-up-d2 space-y-2">
        <p className="text-[12px] font-bold text-warm-400 uppercase tracking-widest px-1">Custom Allergens</p>
        <div className="rounded-card bg-white shadow-card overflow-hidden">
          <div className="flex items-center px-5 py-3 border-b border-warm-100 gap-3">
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCustom()}
              placeholder="e.g. sesame, lupin, celery…"
              className="flex-1 text-[16px] text-warm-900 placeholder-warm-300 bg-transparent focus:outline-none py-1"
            />
            <button
              onClick={addCustom}
              disabled={!customInput.trim()}
              className="pressable text-[15px] font-bold text-brand-500 disabled:opacity-30"
            >
              Add
            </button>
          </div>
          {profile.customAllergens.length === 0 ? (
            <div className="px-5 py-5 text-center">
              <p className="text-[14px] text-warm-300">No custom allergens added</p>
            </div>
          ) : (
            <div>
              {profile.customAllergens.map((item, i) => (
                <div key={item} className={`flex items-center justify-between px-5 py-3.5 ${i > 0 ? "border-t border-warm-100" : ""}`}>
                  <span className="text-[16px] text-warm-900">{item}</span>
                  <button
                    onClick={() => { setProfile((p) => ({ ...p, customAllergens: p.customAllergens.filter((x) => x !== item) })); setSaved(false); }}
                    className="pressable text-[14px] font-semibold text-danger"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <p className="text-[12px] text-warm-400 px-1">
          Specify ingredients Claude should watch for, even if they&apos;re unusual (mustard, pine nuts, molluscs, etc.)
        </p>
      </div>

      {/* Save */}
      <button
        onClick={save}
        className="pressable animate-fade-up-d3 w-full py-4 bg-brand-500 text-white rounded-[16px] text-[17px] font-bold tracking-tight transition-all"
      >
        {saved ? "✓ Saved!" : "Save Profile"}
      </button>
    </div>
  );
}
