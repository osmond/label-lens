"use client";
import { useState } from "react";
import { IngredientCard } from "@/lib/types";

const SAFETY_CONFIG = {
  safe: { badge: "Safe", bg: "bg-emerald-100 text-emerald-700", border: "border-emerald-200" },
  caution: { badge: "Caution", bg: "bg-amber-100 text-amber-700", border: "border-amber-200" },
  avoid: { badge: "Avoid", bg: "bg-red-100 text-red-700", border: "border-red-300" },
  neutral: { badge: "Neutral", bg: "bg-slate-100 text-slate-600", border: "border-slate-200" },
};

type FilterLevel = "all" | "avoid" | "caution" | "safe" | "neutral";

export default function IngredientGrid({ ingredients }: { ingredients: IngredientCard[] }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterLevel>("all");

  const counts = {
    avoid: ingredients.filter((i) => i.safety === "avoid").length,
    caution: ingredients.filter((i) => i.safety === "caution").length,
    safe: ingredients.filter((i) => i.safety === "safe").length,
    neutral: ingredients.filter((i) => i.safety === "neutral").length,
  };

  const visible = ingredients.filter((ing) => {
    const matchesSearch =
      !search ||
      ing.name.toLowerCase().includes(search.toLowerCase()) ||
      ing.plain.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || ing.safety === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-slate-800">
          All Ingredients <span className="text-slate-400 font-normal text-base">({ingredients.length})</span>
        </h2>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <input
          type="text"
          placeholder="Search ingredients..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <div className="flex gap-1.5 flex-wrap">
          {(["all", "avoid", "caution", "safe", "neutral"] as FilterLevel[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filter === f
                  ? "bg-indigo-600 text-white"
                  : "bg-white border border-slate-200 text-slate-600 hover:border-indigo-300"
              }`}
            >
              {f === "all" ? `All (${ingredients.length})` : `${f.charAt(0).toUpperCase() + f.slice(1)} (${counts[f]})`}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-8">No ingredients match your search.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {visible.map((ing, i) => {
            const cfg = SAFETY_CONFIG[ing.safety];
            return (
              <div
                key={i}
                className={`bg-white rounded-xl border-2 p-4 ${cfg.border} ${
                  ing.safety === "avoid" ? "ring-1 ring-red-200" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="font-semibold text-slate-800 text-sm">{ing.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${cfg.bg}`}>
                    {cfg.badge}
                  </span>
                </div>
                <p className="text-sm text-slate-600 mb-1">{ing.plain}</p>
                {ing.purpose && (
                  <p className="text-xs text-slate-400 italic">{ing.purpose}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
