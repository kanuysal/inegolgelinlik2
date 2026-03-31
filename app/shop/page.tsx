"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { mockListings, type Listing } from "@/lib/mock-listings";
import { getApprovedListings } from "./actions";
import { thumb, PLACEHOLDER_IMG } from "@/lib/image";

// Helper function to remove accents for search (e.g., "Élysée" → "elysee")
function removeAccents(str: string): string {
  return str
    .normalize("NFD") // Decompose characters into base + diacritics
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritical marks
    .toLowerCase();
}

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

  // Prefer stock (Galia Lahav) photo as the primary image shown to buyers
  const stockImage = thumb(row.products?.images?.[0]);
  const mainImage = stockImage || thumb(row.images?.[0]) || PLACEHOLDER_IMG;

  // Map collection line: "Bridal Couture" → "Couture", "Bridal GALA" → "GALA"
  const rawCollection = row.products?.stockist_data?.collectionLine || "";
  const collection = rawCollection.includes("GALA") ? "GALA" : rawCollection.includes("Couture") ? "Couture" : "Couture";

  return {
    id: row.id,
    title: row.title,
    collection,
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

/* ── Custom Filter Dropdown ── */
function FilterDropdown({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeLabel = value === "all" ? label : options.find((o) => o.value === value)?.label || label;
  const isActive = value !== "all";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 py-1 transition-colors duration-200 ${
          isActive
            ? "text-[#1c1c1c]"
            : "text-[#1c1c1c] hover:text-[#1c1c1c]/60"
        }`}
      >
        <span className="text-[13px] font-medium uppercase tracking-[0.12em]">{activeLabel}</span>
        <svg
          className={`w-2.5 h-2.5 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          viewBox="0 0 12 12"
          fill="none"
        >
          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {isActive && <span className="w-1 h-1 rounded-full bg-[#1c1c1c]" />}
      </button>

      {open && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 min-w-[200px] bg-white/95 backdrop-blur-xl border border-[#1c1c1c]/8 shadow-[0_12px_40px_rgba(0,0,0,0.12)] z-50 py-2">
          <button
            onClick={() => { onChange("all"); setOpen(false); }}
            className={`w-full text-left px-5 py-3 text-sm tracking-wide transition-all duration-200 font-serif ${
              value === "all"
                ? "text-[#1c1c1c] bg-[#1c1c1c]/[0.03]"
                : "text-[#1c1c1c]/40 hover:text-[#1c1c1c] hover:bg-[#1c1c1c]/[0.02] hover:pl-6"
            }`}
          >
            {label}
          </button>
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`w-full text-left px-5 py-3 text-sm tracking-wide transition-all duration-200 font-serif ${
                value === opt.value
                  ? "text-[#1c1c1c] bg-[#1c1c1c]/[0.03]"
                  : "text-[#1c1c1c]/40 hover:text-[#1c1c1c] hover:bg-[#1c1c1c]/[0.02] hover:pl-6"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ShopPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [seller, setSeller] = useState("all");
  const [collection, setCollection] = useState("all");
  const [condition, setCondition] = useState("all");
  const [size, setSize] = useState("all");
  const [price, setPrice] = useState("all");

  useEffect(() => {
    getApprovedListings().then((data) => {
      if (data && data.length > 0) {
        setListings(data.map(mapDbListing));
      }
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    return listings.filter((l) => {
      if (search) {
        const q = removeAccents(search);
        const match =
          removeAccents(l.title).includes(q) ||
          removeAccents(l.collection).includes(q) ||
          removeAccents(l.condition).includes(q);
        if (!match) return false;
      }
      if (seller !== "all") {
        if (seller === "samples" && l.listingType !== "brand_direct" && l.listingType !== "sample_sale") return false;
        if (seller === "brides" && l.listingType !== "peer_to_peer") return false;
      }
      if (collection !== "all" && l.collection !== collection) return false;
      if (condition !== "all" && l.condition.toLowerCase() !== condition.toLowerCase()) return false;
      if (size !== "all" && String(l.size) !== size) return false;
      if (price !== "all") {
        const p = l.salePrice;
        if (price === "under2k" && p >= 2000) return false;
        if (price === "2k-5k" && (p < 2000 || p >= 5000)) return false;
        if (price === "5k-10k" && (p < 5000 || p >= 10000)) return false;
        if (price === "over10k" && p < 10000) return false;
      }
      return true;
    });
  }, [listings, search, seller, collection, condition, size, price]);

  if (loading) return <LoadingSpinner />;

  return (
    <main className="min-h-screen flex flex-col bg-background-light text-slate-900 font-sans">
      <Navbar />

      {/* ── Header ── */}
      <div className="px-4 md:px-8 pt-28 max-w-[1600px] mx-auto mb-8 text-center">
        <h2 className="text-5xl font-normal tracking-tight font-serif text-[#1c1c1c]">Bridal Gowns</h2>
      </div>

      {/* ── Filters bar — sticks under navbar on desktop only ── */}
      <div className="md:sticky md:top-[76px] z-30 flex justify-center px-4">
        <div className="max-w-5xl w-full px-6 flex flex-wrap items-center justify-between gap-4 py-3 bg-white backdrop-blur-xl md:shadow-[0_1px_3px_rgba(0,0,0,0.1)] md:border-b border-slate-100" style={{ fontFamily: "'Lelo', serif" }}>
          {/* Search — left */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-0 top-1/2 -translate-y-1/2 text-[#1c1c1c]/40 text-lg">
              search
            </span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-7 pr-4 py-1.5 text-xs bg-transparent border-b border-[#1c1c1c]/10 focus:border-[#1c1c1c]/40 focus:ring-0 placeholder:text-[#1c1c1c]/40 text-[#1c1c1c] uppercase tracking-widest font-medium outline-none transition-colors w-40"
              placeholder="Search..."
              type="text"
            />
          </div>

          {/* Filters — right */}
          <div className="flex flex-wrap items-center gap-4">
            <FilterDropdown
              label="Sellers"
              value={seller}
              onChange={setSeller}
              options={[
                { value: "samples", label: "Galia Lahav" },
                { value: "brides", label: "GL Brides" },
              ]}
            />

            <FilterDropdown
              label="Collections"
              value={collection}
              onChange={setCollection}
              options={[
                { value: "Couture", label: "Couture" },
                { value: "GALA", label: "GALA" },
              ]}
            />

            <FilterDropdown
              label="Condition"
              value={condition}
              onChange={setCondition}
              options={[
                { value: "New Never Worn", label: "New with Tags" },
                { value: "Excellent", label: "Excellent" },
                { value: "Good", label: "Good" },
              ]}
            />

            <FilterDropdown
              label="Price"
              value={price}
              onChange={setPrice}
              options={[
                { value: "under2k", label: "Under $2,000" },
                { value: "2k-5k", label: "$2,000–$5,000" },
                { value: "5k-10k", label: "$5,000–$10,000" },
                { value: "over10k", label: "Over $10,000" },
              ]}
            />

            <FilterDropdown
              label="Sizes"
              value={size}
              onChange={setSize}
              options={[
                { value: "0", label: "0" },
                { value: "2", label: "2" },
                { value: "4", label: "4" },
                { value: "6", label: "6" },
                { value: "8", label: "8" },
                { value: "10", label: "10" },
                { value: "12", label: "12" },
                { value: "14", label: "14" },
                { value: "16", label: "16" },
                { value: "Custom", label: "Custom" },
              ]}
            />

            {/* Reset */}
            {(search || seller !== "all" || collection !== "all" || condition !== "all" || size !== "all" || price !== "all") && (
              <button
                onClick={() => { setSearch(""); setSeller("all"); setCollection("all"); setCondition("all"); setSize("all"); setPrice("all"); }}
                className="text-[13px] font-medium uppercase tracking-[0.12em] text-[#1c1c1c]/60 hover:text-[#1c1c1c] transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 pt-6 pb-10 w-full flex-1 max-w-[1600px] mx-auto">
        {/* ── Product grid — 5 per row ── */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-5 pb-20">
          {filtered.map((listing) => (
            <Link href={`/shop/${listing.id}`} key={listing.id}>
              <div className="group relative flex flex-col bg-white border border-slate-200 overflow-hidden transition-all hover:border-slate-400 h-full">
                <div className="aspect-[3/4] overflow-hidden relative bg-slate-100">
                  <img
                    alt={listing.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    src={listing.imageUrl}
                    loading="lazy"
                    onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMG; }}
                  />
                  {listing.listingType === "brand_direct" && (
                    <div className="absolute top-2 left-2 flex items-center gap-1 bg-[#1c1c1c]/90 backdrop-blur-sm text-white px-2 py-1">
                      <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3 flex-shrink-0">
                        <path d="M12 2L14.09 4.26L17 3.64L17.18 6.57L19.82 8.07L18.56 10.74L20 13.14L17.72 14.72L17.5 17.66L14.58 17.95L12.73 20.39L10.27 18.76L7.27 19.5L6.27 16.73L3.53 15.32L4.63 12.56L3.27 10L5.57 8.45L5.82 5.51L8.74 5.27L10.64 2.87L12 2Z" fill="white"/>
                        <path d="M9 12L11 14L15 10" stroke="#1c1c1c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="text-[8px] font-bold uppercase tracking-[0.1em]">Galia Lahav</span>
                    </div>
                  )}
                </div>
                <div className="p-2.5 md:p-3 flex flex-col flex-grow">
                  <div className="mb-1.5">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <h3 className="text-lg md:text-xl font-normal tracking-tight font-serif text-[#1c1c1c]">{listing.title}</h3>
                      <span className="text-xs md:text-sm font-bold text-[#1c1c1c]/60 uppercase tracking-tighter flex-shrink-0 ml-2">
                        SIZE {listing.size}
                      </span>
                    </div>
                  </div>
                  <div className="mt-auto pt-2 border-t border-slate-100">
                    <p className="text-[11px] md:text-xs text-[#1c1c1c]/60 uppercase tracking-widest mb-0.5">
                      {listing.condition}
                    </p>
                    <div className="flex items-baseline gap-1.5">
                      <p className="text-base md:text-lg font-bold tracking-tight text-[#1c1c1c]">
                        ${listing.salePrice.toLocaleString()}
                      </p>
                      {listing.originalPrice > listing.salePrice && (
                        <p className="text-xs md:text-sm text-[#1c1c1c]/50 line-through">
                          ${listing.originalPrice.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <Footer />
    </main>
  );
}
