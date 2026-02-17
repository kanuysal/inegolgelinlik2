"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  COLLECTIONS,
  SIZES,
  CONDITIONS,
  SILHOUETTES,
  NECKLINES,
  FABRICS,
  PRICE_RANGES,
} from "@/lib/mock-listings";

export interface ActiveFilters {
  collection: string[];
  size: string[];
  condition: string[];
  silhouette: string[];
  neckline: string[];
  fabric: string[];
  priceRange: { min: number; max: number } | null;
  sortBy: "relevance" | "price-low" | "price-high" | "newest" | "biggest-save";
}

export const DEFAULT_FILTERS: ActiveFilters = {
  collection: [],
  size: [],
  condition: [],
  silhouette: [],
  neckline: [],
  fabric: [],
  priceRange: null,
  sortBy: "relevance",
};

interface FilterBarProps {
  filters: ActiveFilters;
  onFiltersChange: (filters: ActiveFilters) => void;
  totalResults: number;
}

/* ── Dropdown component ── */
function FilterDropdown({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string;
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const hasActive = selected.length > 0;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 px-6 py-2 border transition-all duration-500 font-sans text-[10px] font-bold uppercase tracking-[0.2em] rounded-full ${hasActive
            ? "border-resonance-amber/40 text-resonance-amber bg-resonance-amber/5"
            : "border-white/10 text-white/40 hover:border-white/30 hover:text-white/80"
          }`}
      >
        <span>{label}</span>
        {hasActive && (
          <span className="w-4 h-4 flex items-center justify-center bg-resonance-amber/20 text-resonance-amber text-[9px] rounded-full">
            {selected.length}
          </span>
        )}
        <svg
          className={`w-3 h-3 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 mt-2 min-w-[220px] max-h-[300px] overflow-y-auto resonance-panel z-50 shadow-2xl p-2"
          >
            {options.map((opt) => {
              const isSelected = selected.includes(opt);
              return (
                <button
                  key={opt}
                  onClick={() => onToggle(opt)}
                  className={`w-full text-left px-4 py-2.5 font-sans text-[11px] tracking-wide transition-all rounded-xl ${isSelected
                      ? "text-resonance-amber bg-resonance-amber/5"
                      : "text-white/50 hover:text-white hover:bg-white/5"
                    }`}
                >
                  <span className="flex items-center gap-2.5">
                    <span
                      className={`w-3.5 h-3.5 border flex-shrink-0 flex items-center justify-center rounded-sm transition-all ${isSelected ? "border-resonance-amber bg-resonance-amber/20" : "border-white/20"
                        }`}
                    >
                      {isSelected && (
                        <svg className="w-2.5 h-2.5 text-resonance-amber" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M2 6l3 3 5-5" />
                        </svg>
                      )}
                    </span>
                    {opt}
                  </span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Main filter bar ── */
export default function FilterBar({ filters, onFiltersChange, totalResults }: FilterBarProps) {
  function toggleArrayFilter(key: keyof ActiveFilters, value: string) {
    const current = filters[key] as string[];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onFiltersChange({ ...filters, [key]: next });
  }

  const activeCount =
    filters.collection.length +
    filters.size.length +
    filters.condition.length +
    filters.silhouette.length +
    filters.neckline.length +
    filters.fabric.length +
    (filters.priceRange ? 1 : 0);

  return (
    <div className="border-b border-white/5 pb-5">
      {/* Trust banner */}
      <div className="flex items-center justify-center gap-3 py-3 mb-8 border border-white/5 bg-white/[0.01] rounded-full">
        <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-resonance-blue/60">
          <path
            d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="font-sans text-[9px] font-medium uppercase tracking-[0.4em] text-white/30">
          Every gown verified by Galia Lahav &middot; Buyer Protection included
        </span>
      </div>

      {/* Filter row */}
      <div className="flex flex-wrap items-center gap-2.5">
        <FilterDropdown
          label="Collection"
          options={COLLECTIONS}
          selected={filters.collection}
          onToggle={(v) => toggleArrayFilter("collection", v)}
        />
        <FilterDropdown
          label="Size"
          options={SIZES}
          selected={filters.size}
          onToggle={(v) => toggleArrayFilter("size", v)}
        />
        <FilterDropdown
          label="Condition"
          options={CONDITIONS}
          selected={filters.condition}
          onToggle={(v) => toggleArrayFilter("condition", v)}
        />
        <FilterDropdown
          label="Silhouette"
          options={SILHOUETTES}
          selected={filters.silhouette}
          onToggle={(v) => toggleArrayFilter("silhouette", v)}
        />
        <FilterDropdown
          label="Neckline"
          options={NECKLINES}
          selected={filters.neckline}
          onToggle={(v) => toggleArrayFilter("neckline", v)}
        />
        <FilterDropdown
          label="Fabric"
          options={FABRICS}
          selected={filters.fabric}
          onToggle={(v) => toggleArrayFilter("fabric", v)}
        />

        {/* Price dropdown */}
        <div className="relative">
          <select
            value={filters.priceRange ? `${filters.priceRange.min}-${filters.priceRange.max}` : ""}
            onChange={(e) => {
              if (!e.target.value) {
                onFiltersChange({ ...filters, priceRange: null });
              } else {
                const [min, max] = e.target.value.split("-").map(Number);
                onFiltersChange({ ...filters, priceRange: { min, max } });
              }
            }}
            className="appearance-none px-6 py-2 border border-white/10 bg-transparent text-white/40 font-sans text-[10px] font-bold uppercase tracking-[0.2em] cursor-pointer hover:border-white/30 hover:text-white/80 transition-all rounded-full pr-10"
          >
            <option value="" className="bg-obsidian">Price</option>
            {PRICE_RANGES.map((r) => (
              <option key={r.label} value={`${r.min}-${r.max}`} className="bg-obsidian">
                {r.label}
              </option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/20">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Sort */}
        <div className="relative">
          <select
            value={filters.sortBy}
            onChange={(e) =>
              onFiltersChange({ ...filters, sortBy: e.target.value as ActiveFilters["sortBy"] })
            }
            className="appearance-none px-6 py-2 border border-white/10 bg-transparent text-white/40 font-sans text-[10px] font-bold uppercase tracking-[0.2em] cursor-pointer hover:border-white/30 hover:text-white/80 transition-all rounded-full pr-10"
          >
            <option value="relevance" className="bg-obsidian">Sort: Most Relevant</option>
            <option value="price-low" className="bg-obsidian">Price: Low to High</option>
            <option value="price-high" className="bg-obsidian">Price: High to Low</option>
            <option value="newest" className="bg-obsidian">Newest First</option>
            <option value="biggest-save" className="bg-obsidian">Biggest Savings</option>
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/20">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Active filters + results count */}
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-2 flex-wrap">
          {activeCount > 0 && (
            <button
              onClick={() => onFiltersChange(DEFAULT_FILTERS)}
              className="font-sans text-[10px] uppercase tracking-[0.2em] text-white/30 hover:text-white/60 transition-colors underline underline-offset-2"
            >
              Clear All ({activeCount})
            </button>
          )}
        </div>
        <p className="font-sans text-[11px] text-white/30 tracking-wider">
          {totalResults} {totalResults === 1 ? "gown" : "gowns"} found
        </p>
      </div>
    </div>
  );
}
