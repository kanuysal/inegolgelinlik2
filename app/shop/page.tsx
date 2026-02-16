"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/ui/Navbar";
import FilterBar, { ActiveFilters, DEFAULT_FILTERS } from "@/components/ui/FilterBar";
import ProductCard from "@/components/ui/ProductCard";
import { mockListings, type Listing } from "@/lib/mock-listings";

function applyFilters(listings: Listing[], filters: ActiveFilters): Listing[] {
  let result = [...listings];

  if (filters.collection.length > 0) {
    result = result.filter((l) => filters.collection.includes(l.collection));
  }
  if (filters.size.length > 0) {
    result = result.filter((l) => filters.size.includes(l.size));
  }
  if (filters.condition.length > 0) {
    result = result.filter((l) => filters.condition.includes(l.condition));
  }
  if (filters.silhouette.length > 0) {
    result = result.filter((l) => filters.silhouette.includes(l.silhouette));
  }
  if (filters.neckline.length > 0) {
    result = result.filter((l) => filters.neckline.includes(l.neckline));
  }
  if (filters.fabric.length > 0) {
    result = result.filter((l) => filters.fabric.includes(l.fabric));
  }
  if (filters.priceRange) {
    result = result.filter(
      (l) => l.salePrice >= filters.priceRange!.min && l.salePrice <= filters.priceRange!.max
    );
  }

  /* Sorting */
  switch (filters.sortBy) {
    case "price-low":
      result.sort((a, b) => a.salePrice - b.salePrice);
      break;
    case "price-high":
      result.sort((a, b) => b.salePrice - a.salePrice);
      break;
    case "newest":
      result.sort((a, b) => a.daysListed - b.daysListed);
      break;
    case "biggest-save":
      result.sort(
        (a, b) =>
          (b.originalPrice - b.salePrice) / b.originalPrice -
          (a.originalPrice - a.salePrice) / a.originalPrice
      );
      break;
    default:
      /* relevance — featured first, then newest */
      result.sort((a, b) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return a.daysListed - b.daysListed;
      });
  }

  return result;
}

export default function ShopPage() {
  const [filters, setFilters] = useState<ActiveFilters>(DEFAULT_FILTERS);

  const filtered = useMemo(() => applyFilters(mockListings, filters), [filters]);

  return (
    <main className="min-h-screen bg-obsidian">
      <Navbar />

      {/* Hero banner */}
      <section className="pt-24 pb-10 px-6 md:px-10">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 mb-8">
            <a href="/" className="font-sans text-[10px] uppercase tracking-[0.2em] text-white/25 hover:text-white/50 transition-colors">
              Home
            </a>
            <span className="text-white/15">/</span>
            <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-white/50">
              Shop
            </span>
          </nav>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="font-serif text-4xl md:text-6xl font-light tracking-wider text-white/90">
              The Collection
            </h1>
            <p className="font-sans text-sm text-white/30 mt-3 tracking-wide max-w-lg">
              Authenticated Galia Lahav couture, curated for its next chapter.
              Every gown verified by the House.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters + Grid */}
      <section className="px-6 md:px-10 pb-20">
        <div className="max-w-7xl mx-auto">
          <FilterBar
            filters={filters}
            onFiltersChange={setFilters}
            totalResults={filtered.length}
          />

          {/* Product grid */}
          {filtered.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10 mt-8">
              {filtered.map((listing, i) => (
                <ProductCard key={listing.id} listing={listing} index={i} />
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-32"
            >
              <p className="font-serif text-2xl text-white/40 tracking-wider mb-3">
                No gowns found
              </p>
              <p className="font-sans text-sm text-white/20 mb-6">
                Try adjusting your filters to discover more pieces.
              </p>
              <button
                onClick={() => setFilters(DEFAULT_FILTERS)}
                className="px-6 py-2.5 border border-white/15 font-sans text-xs uppercase tracking-[0.2em] text-white/40 hover:text-white/70 hover:border-white/30 transition-colors"
              >
                Clear All Filters
              </button>
            </motion.div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-obsidian py-12 px-6 md:px-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <h3 className="font-serif text-xl tracking-wider text-white/60">RE:GALIA</h3>
            <p className="font-sans text-[10px] text-white/20 mt-1 tracking-wider">
              The Official Pre-Owned Marketplace by Galia Lahav
            </p>
          </div>
          <div className="flex items-center gap-6">
            {["About", "How It Works", "Authenticity", "Contact"].map((link) => (
              <a
                key={link}
                href="#"
                className="font-sans text-[10px] text-white/25 hover:text-white/50 transition-colors tracking-wider uppercase"
              >
                {link}
              </a>
            ))}
          </div>
          <p className="font-sans text-[9px] text-white/10 tracking-wider">
            &copy; {new Date().getFullYear()} Galia Lahav. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
