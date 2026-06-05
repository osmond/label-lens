"use client";
import { useState, useEffect } from "react";
import { loadProfile, saveProfile, COMMON_RESTRICTIONS } from "@/lib/profile";
import { UserProfile } from "@/lib/types";

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile>({ restrictions: [], customAllergens: [] });
  const [customInput, setCustomInput] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setProfile(loadProfile());
  }, []);

  function toggleRestriction(r: string) {
    setProfile((p) => ({
      ...p,
      restrictions: p.restrictions.includes(r)
        ? p.restrictions.filter((x) => x !== r)
        : [...p.restrictions, r],
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

  function removeCustom(item: string) {
    setProfile((p) => ({ ...p, customAllergens: p.customAllergens.filter((x) => x !== item) }));
    setSaved(false);
  }

  function handleSave() {
    saveProfile(profile);
    setSaved(true);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">My Dietary Profile</h1>
        <p className="text-slate-500 mt-1 text-sm">
          Your profile is saved locally and used to personalize every scan.
        </p>
      </div>

      <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <h2 className="font-semibold text-slate-700">Dietary Restrictions</h2>
        <div className="flex flex-wrap gap-2">
          {COMMON_RESTRICTIONS.map((r) => (
            <button
              key={r}
              onClick={() => toggleRestriction(r)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                profile.restrictions.includes(r)
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-slate-600 border-slate-300 hover:border-indigo-400"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <h2 className="font-semibold text-slate-700">Custom Allergens</h2>
        <p className="text-sm text-slate-400">
          Add specific ingredients you need to avoid — including uncommon allergens like mustard,
          sesame, lupin, celery, molluscs, pine nuts, etc.
        </p>

        <div className="flex gap-2">
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addCustom()}
            placeholder="e.g. mustard, sesame, lupin..."
            className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={addCustom}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
          >
            Add
          </button>
        </div>

        {profile.customAllergens.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {profile.customAllergens.map((item) => (
              <span
                key={item}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-full text-sm"
              >
                {item}
                <button
                  onClick={() => removeCustom(item)}
                  className="text-rose-400 hover:text-rose-700 font-bold leading-none"
                  aria-label={`Remove ${item}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </section>

      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
        >
          Save Profile
        </button>
        {saved && (
          <span className="text-emerald-600 text-sm font-medium">Profile saved!</span>
        )}
      </div>
    </div>
  );
}
