"use client";
import { useState } from "react";
import { IngredientCard } from "@/lib/types";

const S = {
  safe: {
    stripe: "bg-safe",
    badge: "bg-safe/[0.10] text-safe",
    label: "Safe",
    cardBg: "",
  },
  caution: {
    stripe: "bg-caution",
    badge: "bg-caution/[0.10] text-caution",
    label: "Caution",
    cardBg: "",
  },
  avoid: {
    stripe: "bg-danger",
    badge: "bg-danger/[0.10] text-danger",
    label: "Avoid",
    cardBg: "bg-danger/[0.025]",
  },
  neutral: {
    stripe: "bg-warm-200",
    badge: "",
    label: "",
    cardBg: "",
  },
};

type Filter = "all" | "avoid" | "caution" | "safe" | "neutral";
const FILTERS: Filter[] = ["all", "avoid", "caution", "safe", "neutral"];

export default function IngredientGrid({ ingredients }: { ingredients: IngredientCard[] }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [expanded, setExpanded] = useState<number | null>(null);

  const counts = {
    avoid: ingredients.filter((i) => i.safety === "avoid").length,
    caution: ingredients.filter((i) => i.safety === "caution").length,
    safe: ingredients.filter((i) => i.safety === "safe").length,
    neutral: ingredients.filter((i) => i.safety === "neutral").length,
  };

  const visible = ingredients.filter((ing) => {
    const q = search.toLowerCase();
    const matchSearch = !q || ing.name.toLowerCase().includes(q) || ing.plain.toLowerCase().includes(q);
    const matchFilter = filter === "all" || ing.safety === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-3 animate-fade-up-d2">
      {/* Section header */}
      <div className="px-1 flex items-center justify-between">
        <p className="text-[13px] font-bold text-warm-400 uppercase tracking-widest">
          All Ingredients
        </p>
        <span className="text-[13px] text-warm-400">{ingredients.length} total</span>
      </div>

      {/* Search bar */}
      <div className="relative">
        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="7" strokeWidth="1.8"/>
          <path d="M21 21l-4.35-4.35" strokeLinecap="round" strokeWidth="1.8"/>
        </svg>
        <input
          type="search"
          placeholder="Search ingredients…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field w-full pl-10 pr-4 py-2.5 text-[15px]"
        />
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 overflow-x-auto">
        {FILTERS.map((f) => {
          const active = filter === f;
          const count = f === "all" ? ingredients.length : counts[f];
          const pillColors: Record<Filter, string> = {
            all: active ? "bg-brand-500 text-white" : "bg-warm-100 text-warm-600",
            avoid: active ? "bg-danger text-white" : "bg-danger/10 text-danger",
            caution: active ? "bg-caution text-white" : "bg-caution/10 text-caution",
            safe: active ? "bg-safe text-white" : "bg-safe/10 text-safe",
            neutral: active ? "bg-warm-600 text-white" : "bg-warm-100 text-warm-500",
          };
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`pressable shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-pill text-[13px] font-semibold transition-all ${pillColors[f]}`}
            >
              {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
              <span className={`text-[11px] font-bold opacity-70`}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Cards */}
      {visible.length === 0 ? (
        <div className="rounded-card bg-white shadow-card py-12 text-center">
          <p className="text-[32px] mb-2">🔍</p>
          <p className="text-[15px] font-semibold text-warm-700">No matches</p>
          <p className="text-[13px] text-warm-400 mt-1">Try a different search term</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {visible.map((ing, i) => {
            const cfg = S[ing.safety];
            const isOpen = expanded === i;
            return (
              <div
                key={i}
                className={`rounded-card-sm shadow-card overflow-hidden bg-white ${cfg.cardBg} pressable`}
                style={{ animationDelay: `${i * 0.03}s` }}
                onClick={() => setExpanded(isOpen ? null : i)}
              >
                <div className="flex">
                  {/* Safety stripe */}
                  <div className={`w-[5px] shrink-0 ${cfg.stripe}`} />

                  <div className="flex-1 px-4 py-3.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-[15px] font-semibold text-warm-900 leading-snug">{ing.name}</p>
                        <p className="text-[13px] text-warm-500 mt-0.5 leading-relaxed">{ing.plain}</p>
                      </div>
                      {cfg.badge && (
                        <span className={`shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-pill ${cfg.badge}`}>
                          {cfg.label}
                        </span>
                      )}
                    </div>

                    {/* Expanded: purpose */}
                    {isOpen && ing.purpose && (
                      <div className="mt-2 pt-2 border-t border-warm-100">
                        <span className="text-[11px] font-semibold text-warm-400 uppercase tracking-wide">Role: </span>
                        <span className="text-[11px] text-warm-500">{ing.purpose}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
