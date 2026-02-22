"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import { mockListings, type Listing } from "@/lib/mock-listings";
import { getApprovedListings } from "./actions";

// Re-using the mapping function
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
  
  useEffect(() => {
    getApprovedListings().then((data) => {
      if (data && data.length > 0) {
        setListings(data.map(mapDbListing));
      }
    });
  }, []);

  return (
    <main className="min-h-screen flex flex-col bg-background-light text-slate-900 font-sans">
      <Navbar />

      <div className="p-10 space-y-10 pt-32 max-w-[1600px] mx-auto w-full flex-1">
        <div className="space-y-8">
          <div>
            <h2 className="text-5xl font-light tracking-tight mb-4 font-display">The Collection</h2>
            <p className="text-[11px] text-slate-400 uppercase tracking-[0.4em] font-sans">
              Visual Curation & Asset Management
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-6 border-y border-slate-200 py-6">
            <div className="relative flex-grow max-w-md">
              <span className="material-symbols-outlined absolute left-0 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                search
              </span>
              <input
                className="w-full pl-8 pr-4 py-2 text-xs bg-transparent border-none focus:ring-0 placeholder:text-slate-400 uppercase tracking-widest font-medium outline-none"
                placeholder="Search Listings..."
                type="text"
              />
            </div>
            <div className="h-8 w-px bg-slate-200"></div>
            <div className="flex items-center gap-8">
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  Collection
                </label>
                <select className="p-0 bg-transparent border-none text-[10px] font-bold uppercase tracking-widest focus:ring-0 cursor-pointer hover:text-accent transition-colors outline-none">
                  <option>All Collections</option>
                  <option>Le Secret Royal</option>
                  <option>Allegria</option>
                  <option>Couture</option>
                  <option>GALA</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  Condition
                </label>
                <select className="p-0 bg-transparent border-none text-[10px] font-bold uppercase tracking-widest focus:ring-0 cursor-pointer hover:text-accent transition-colors outline-none">
                  <option>All Conditions</option>
                  <option>New with Tags</option>
                  <option>Pristine</option>
                  <option>Excellent</option>
                  <option>Good</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  Status
                </label>
                <select className="p-0 bg-transparent border-none text-[10px] font-bold uppercase tracking-widest focus:ring-0 cursor-pointer hover:text-accent transition-colors outline-none">
                  <option>All Statuses</option>
                  <option>Live</option>
                  <option>Sold</option>
                  <option>Pending</option>
                </select>
              </div>
            </div>
            <button className="ml-auto flex items-center gap-2 px-6 py-2.5 bg-primary text-white text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-slate-800 transition-colors">
              <span className="material-symbols-outlined text-sm">filter_list</span>
              Filters
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10 pb-20">
          {listings.map((listing) => (
            <Link href={`/shop/${listing.id}`} key={listing.id}>
              <div className="group relative flex flex-col bg-white border border-slate-200 overflow-hidden transition-all hover:border-slate-400 h-full">
                <div className="aspect-[3/4] overflow-hidden relative bg-slate-100">
                  <img
                    alt={listing.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    src={listing.imageUrl}
                  />
                  {listing.verified && (
                    <div className="absolute top-4 left-4">
                      <span className="inline-flex items-center px-3 py-1 text-[9px] font-bold uppercase tracking-widest bg-green-50/90 text-green-600 backdrop-blur-sm border border-green-200/50">
                        Verified Authentic
                      </span>
                    </div>
                  )}
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="w-8 h-8 bg-white/90 flex items-center justify-center border border-slate-200">
                      <span className="material-symbols-outlined text-lg">more_horiz</span>
                    </button>
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <div className="mb-4">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="text-xl font-medium tracking-tight font-display">{listing.title}</h3>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                        SIZE {listing.size}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-sans">
                      {listing.collection} • {listing.sellerLocation}
                    </p>
                  </div>
                  <div className="mt-auto pt-6 border-t border-slate-100 flex justify-between items-end">
                    <div>
                      <p className="text-[9px] text-slate-400 uppercase tracking-widest mb-1 font-sans">
                        {listing.condition}
                      </p>
                      <p className="text-lg font-bold tracking-tight">
                        ${listing.salePrice.toLocaleString()}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-accent hover:text-primary transition-colors">
                      View Details
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
