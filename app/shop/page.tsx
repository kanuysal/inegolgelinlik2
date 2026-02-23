"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import { mockListings, type Listing } from "@/lib/mock-listings";
import { getApprovedListings } from "./actions";

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

export default function ShopPage() {
  const [listings, setListings] = useState<Listing[]>(mockListings);
  const [search, setSearch] = useState("");
  const [seller, setSeller] = useState("all");
  const [collection, setCollection] = useState("all");
  const [condition, setCondition] = useState("all");
  const [size, setSize] = useState("all");

  useEffect(() => {
    getApprovedListings().then((data) => {
      if (data && data.length > 0) {
        setListings(data.map(mapDbListing));
      }
    });
  }, []);

  const filtered = useMemo(() => {
    return listings.filter((l) => {
      if (search) {
        const q = search.toLowerCase();
        const match =
          l.title.toLowerCase().includes(q) ||
          l.collection.toLowerCase().includes(q) ||
          l.condition.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (seller !== "all") {
        if (seller === "samples" && l.listingType !== "brand_direct" && l.listingType !== "sample_sale") return false;
        if (seller === "brides" && l.listingType !== "peer_to_peer") return false;
      }
      if (collection !== "all" && !l.collection.toLowerCase().includes(collection.toLowerCase())) return false;
      if (condition !== "all" && l.condition.toLowerCase() !== condition.toLowerCase()) return false;
      if (size !== "all" && String(l.size) !== size) return false;
      return true;
    });
  }, [listings, search, seller, collection, condition, size]);

  return (
    <main className="min-h-screen flex flex-col bg-background-light text-slate-900 font-sans">
      <Navbar />

      {/* ── Sticky filter bar — full width, navbar-aligned ── */}
      <div className="sticky top-0 z-40 bg-background-light/95 backdrop-blur-sm border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-6 flex flex-wrap items-center gap-4 h-14">
          {/* Search */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-0 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
              search
            </span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-7 pr-4 py-1.5 text-xs bg-transparent border-b border-slate-200 focus:border-slate-400 focus:ring-0 placeholder:text-slate-400 uppercase tracking-widest font-medium outline-none transition-colors w-36"
              placeholder="Search..."
              type="text"
            />
          </div>

          {/* Seller */}
          <select
            value={seller}
            onChange={(e) => setSeller(e.target.value)}
            className="p-0 bg-transparent border-none text-[11px] font-bold uppercase tracking-widest focus:ring-0 cursor-pointer hover:text-accent transition-colors outline-none"
          >
            <option value="all">All Sellers</option>
            <option value="samples">Galia Lahav Samples</option>
            <option value="brides">Galia Lahav Brides</option>
          </select>

          {/* Collection */}
          <select
            value={collection}
            onChange={(e) => setCollection(e.target.value)}
            className="p-0 bg-transparent border-none text-[11px] font-bold uppercase tracking-widest focus:ring-0 cursor-pointer hover:text-accent transition-colors outline-none"
          >
            <option value="all">All Collections</option>
            <option value="Le Secret Royal">Le Secret Royal</option>
            <option value="Allegria">Allegria</option>
            <option value="Couture">Couture</option>
            <option value="GALA">GALA</option>
          </select>

          {/* Condition */}
          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            className="p-0 bg-transparent border-none text-[11px] font-bold uppercase tracking-widest focus:ring-0 cursor-pointer hover:text-accent transition-colors outline-none"
          >
            <option value="all">All Conditions</option>
            <option value="New Never Worn">New with Tags</option>
            <option value="Excellent">Excellent</option>
            <option value="Good">Good</option>
          </select>

          {/* Size */}
          <select
            value={size}
            onChange={(e) => setSize(e.target.value)}
            className="p-0 bg-transparent border-none text-[11px] font-bold uppercase tracking-widest focus:ring-0 cursor-pointer hover:text-accent transition-colors outline-none"
          >
            <option value="all">All Sizes</option>
            <option value="0">0</option>
            <option value="2">2</option>
            <option value="4">4</option>
            <option value="6">6</option>
            <option value="8">8</option>
            <option value="10">10</option>
            <option value="12">12</option>
            <option value="14">14</option>
            <option value="16">16</option>
          </select>

          {/* Count + Reset */}
          <div className="ml-auto flex items-center gap-4">
            <p className="text-[10px] text-slate-400 uppercase tracking-[0.3em]">
              {filtered.length} {filtered.length === 1 ? "gown" : "gowns"}
            </p>
            {(search || seller !== "all" || collection !== "all" || condition !== "all" || size !== "all") && (
              <button
                onClick={() => { setSearch(""); setSeller("all"); setCollection("all"); setCondition("all"); setSize("all"); }}
                className="text-[10px] uppercase tracking-widest text-slate-400 hover:text-primary transition-colors"
              >
                Clear All
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
                  />
                </div>
                <div className="p-3 md:p-4 flex flex-col flex-grow">
                  <div className="mb-2">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="text-sm md:text-base font-normal tracking-tight font-serif">{listing.title}</h3>
                      <span className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                        SIZE {listing.size}
                      </span>
                    </div>
                    <p className="text-[9px] md:text-[10px] text-slate-400 uppercase tracking-widest">
                      {listing.collection}
                    </p>
                  </div>
                  <div className="mt-auto pt-3 border-t border-slate-100 flex justify-between items-end">
                    <div>
                      <p className="text-[8px] md:text-[9px] text-slate-400 uppercase tracking-widest mb-1">
                        {listing.condition}
                      </p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-sm md:text-base font-bold tracking-tight">
                          ${listing.salePrice.toLocaleString()}
                        </p>
                        {listing.originalPrice > listing.salePrice && (
                          <p className="text-xs text-slate-300 line-through">
                            ${listing.originalPrice.toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="hidden md:block text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-primary transition-colors">
                      View
                    </span>
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
