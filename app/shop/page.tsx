"use client";

import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/ui/Navbar";
import FilterBar, { ActiveFilters, DEFAULT_FILTERS } from "@/components/ui/FilterBar";
import ProductCard from "@/components/ui/ProductCard";
import { mockListings, type Listing } from "@/lib/mock-listings";
import { getApprovedListings } from "./actions";
import Footer from "@/components/ui/Footer";

/**
 * Convert a Supabase listing row into the Listing shape
 * used by ProductCard / FilterBar (backward compat with mocks)
 */
function mapDbListing(row: any): Listing {
  const conditionMap: Record<string, Listing["condition"]> = {
    new_unworn: "New Never Worn",
    excellent: "Excellent",
    good: "Good",
  };
  const silhouetteMap: Record<string, Listing["silhouette"]> = {
    a_line: "A-Line",
    mermaid: "Mermaid",
    ball_gown: "Ball Gown",
    sheath: "Sheath",
    fit_and_flare: "Fit & Flare",
    trumpet: "Mermaid",
    empire: "A-Line",
    column: "Sheath",
  };

  const mainImage = row.images?.[0] || "/placeholder-gown.jpg";
  const stockImage = row.products?.images?.[0] || mainImage;

  return {
    id: row.id,
    title: row.title,
    collection: row.products?.style_name || row.category || "Couture",
    designer: "Galia Lahav",
    originalPrice: row.msrp || row.price * 1.4,
    salePrice: row.price,
    currency: "USD",
    size: row.size_us || "—",
    condition: conditionMap[row.condition] || "Excellent",
    silhouette: silhouetteMap[row.silhouette || ""] || "A-Line",
    neckline: "V-Neck",
    fabric: "Lace",
    color: "Ivory",
    imageUrl: mainImage,
    stockImageUrl: stockImage,
    verified: true,
    featured: false,
    saves: 0,
    daysListed: Math.floor((Date.now() - new Date(row.created_at).getTime()) / 86400000),
    sellerLocation: "Worldwide",
    listingType: row.listing_type || "peer_to_peer",
    measurements: {
      bust: row.bust_cm ? `${row.bust_cm}cm` : "—",
      waist: row.waist_cm ? `${row.waist_cm}cm` : "—",
      hips: row.hips_cm ? `${row.hips_cm}cm` : "—",
      height: row.height_cm ? `${row.height_cm}cm` : "—",
    },
  };
}

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
  const [listings, setListings] = useState<Listing[]>(mockListings);
  const [visibleItems, setVisibleItems] = useState(8);

  // Try to load real listings from Supabase on mount
  useEffect(() => {
    getApprovedListings().then((data) => {
      if (data && data.length > 0) {
        setListings(data.map(mapDbListing));
      }
      // else keep mock data as fallback
    });
  }, []);

  const filtered = useMemo(() => applyFilters(listings, filters), [listings, filters]);

  // Reset pagination when filters change
  useEffect(() => {
    setVisibleItems(8);
  }, [filters]);

  const displayedListings = useMemo(() => filtered.slice(0, visibleItems), [filtered, visibleItems]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleItems < filtered.length) {
          setVisibleItems((prev) => prev + 4);
        }
      },
      { threshold: 0.1 }
    );

    const trigger = document.getElementById("scroll-trigger");
    if (trigger) observer.observe(trigger);

    return () => {
      if (trigger) observer.unobserve(trigger);
    };
  }, [filtered.length, visibleItems]);

  return (
    <main className="min-h-screen">
      <Navbar />

      {/* Hero banner */}
      <section className="pt-48 pb-12 px-6 md:px-10">
        <div className="max-w-7xl mx-auto">
          <nav className="flex items-center gap-3 mb-10">
            <a href="/" className="font-sans text-[9px] font-bold uppercase tracking-[0.4em] text-obsidian/20 hover:text-obsidian/50 transition-colors">
              Home
            </a>
            <span className="text-obsidian/10 text-[8px]">•</span>
            <span className="font-sans text-[9px] font-bold uppercase tracking-[0.4em] text-obsidian/40">
              Shop
            </span>
          </nav>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="font-serif text-6xl md:text-8xl font-light tracking-tight text-obsidian leading-none">
              The Collection
            </h1>
            <p className="font-sans text-sm text-obsidian/40 mt-8 tracking-wide max-w-lg leading-relaxed">
              Authenticated Galia Lahav couture, curated for its next chapter.
              Every gown verified by the House of Galia Lahav.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters + Grid */}
      <section className="px-6 md:px-10 pb-32">
        <div className="max-w-7xl mx-auto">
          <FilterBar
            filters={filters}
            onFiltersChange={setFilters}
            totalResults={filtered.length}
          />

          {filtered.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-16 mt-16">
                {displayedListings.map((listing, i) => (
                  <ProductCard key={listing.id} listing={listing} index={i} />
                ))}
              </div>
              <div id="scroll-trigger" className="h-20 w-full" />
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-40"
            >
              <p className="font-serif text-3xl text-obsidian/40 tracking-tight mb-4">
                No gowns found
              </p>
              <p className="font-sans text-sm text-obsidian/20 mb-10 max-w-xs text-center leading-relaxed">
                Try adjusting your search criteria to discover more available pieces.
              </p>
              <button
                onClick={() => setFilters(DEFAULT_FILTERS)}
                className="px-12 py-4 border border-obsidian/10 rounded-full font-sans text-[10px] font-bold uppercase tracking-[0.3em] text-obsidian/40 hover:text-obsidian hover:border-obsidian/30 transition-all hover:bg-obsidian/5"
              >
                Clear All Filters
              </button>
            </motion.div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
