"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import type { Listing, ListingType } from "@/lib/mock-listings";

function SellerTypeBadge({ type }: { type: ListingType }) {
  if (type === "brand_direct") {
    return (
      <div className="flex items-center gap-1.5">
        <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 flex-shrink-0">
          <path
            d="M12 2L14.09 4.26L17 3.64L17.18 6.57L19.82 8.07L18.56 10.74L20 13.14L17.72 14.72L17.5 17.66L14.58 17.95L12.73 20.39L10.27 18.76L7.27 19.5L6.27 16.73L3.53 15.32L4.63 12.56L3.27 10L5.57 8.45L5.82 5.51L8.74 5.27L10.64 2.87L12 2Z"
            fill="#C5A059"
          />
          <path d="M9 12L11 14L15 10" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="font-sans text-[9px] uppercase tracking-[0.15em] text-white/95 font-bold">
          Galia Lahav
        </span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5">
      <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3 flex-shrink-0 text-white/70">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.5" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <span className="font-sans text-[9px] uppercase tracking-[0.15em] text-white/80 font-bold">
        {type === "sample_sale" ? "Sample Sale" : "Bride to Bride"}
      </span>
    </div>
  );
}

function VerifiedBadge() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 flex-shrink-0">
      <path
        d="M12 2L14.09 4.26L17 3.64L17.18 6.57L19.82 8.07L18.56 10.74L20 13.14L17.72 14.72L17.5 17.66L14.58 17.95L12.73 20.39L10.27 18.76L7.27 19.5L6.27 16.73L3.53 15.32L4.63 12.56L3.27 10L5.57 8.45L5.82 5.51L8.74 5.27L10.64 2.87L12 2Z"
        fill="currentColor"
      />
      <path
        d="M9 12L11 14L15 10"
        stroke="#050505"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function getConditionColor(condition: Listing["condition"]): string {
  switch (condition) {
    case "New Never Worn":
      return "bg-emerald-500/10 text-emerald-600/90 border-emerald-500/20";
    case "Excellent":
      return "bg-gold-muted/10 text-gold-muted border-gold-muted/20";
    case "Very Good":
      return "bg-blue-500/10 text-blue-600 border-blue-500/20";
    case "Good":
      return "bg-obsidian/5 text-obsidian/40 border-obsidian/10";
  }
}

interface ProductCardProps {
  listing: Listing;
  index?: number;
}

export default function ProductCard({ listing, index = 0 }: ProductCardProps) {
  const [saved, setSaved] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const savePercent = Math.round(
    ((listing.originalPrice - listing.salePrice) / listing.originalPrice) * 100
  );

  return (
    <Link href={`/shop/${listing.id}`}>
      <motion.article
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group relative cursor-pointer"
      >
        {/* Image container */}
        <div className="relative aspect-[2/3] overflow-hidden bg-obsidian/[0.03] rounded-2xl">
          {/* Main image */}
          <motion.img
            src={listing.imageUrl}
            alt={`${listing.title} by ${listing.designer}`}
            className="absolute inset-0 w-full h-full object-cover"
            animate={{ scale: isHovered ? 1.05 : 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          />

          {/* Hover overlay */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-obsidian/40 via-transparent to-transparent"
            animate={{ opacity: isHovered ? 1 : 0.2 }}
            transition={{ duration: 0.3 }}
          />

          {/* Top badges row */}
          <div className="absolute top-4 left-4 right-4 flex items-start justify-between z-10">
            {/* Condition badge */}
            <span
              className={`px-3 py-1 text-[9px] uppercase tracking-[0.15em] font-sans font-bold border rounded-full backdrop-blur-md ${getConditionColor(
                listing.condition
              )}`}
            >
              {listing.condition}
            </span>

            {/* Save % badge */}
            <span className="px-3 py-1 bg-[#C5A059] text-white text-[9px] uppercase tracking-[0.15em] font-sans font-bold rounded-full shadow-[0_4px_15px_rgba(197,160,89,0.3)]">
              Save {savePercent}%
            </span>
          </div>

          {/* Seller type badge (bottom-left on image) */}
          <div className="absolute bottom-4 left-4 z-10">
            <SellerTypeBadge type={listing.listingType} />
          </div>

          {/* Quick view on hover */}
          <motion.div
            className="absolute bottom-6 right-6 z-10"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <button className="px-6 py-3 bg-[#C5A059] text-white font-sans text-[10px] font-bold uppercase tracking-[0.25em] rounded-full hover:bg-[#B38E48] transition-all shadow-2xl scale-110">
              Quick View
            </button>
          </motion.div>
        </div>

        {/* Card info */}
        <div className="pt-6 pb-2">
          {/* Collection */}
          <p className="font-sans text-[9px] uppercase tracking-[0.4em] text-obsidian/30 mb-2 font-bold">
            {listing.collection}
          </p>

          {/* Title */}
          <h3 className="font-serif text-2xl tracking-tight text-obsidian group-hover:text-[#C5A059] transition-colors duration-500">
            {listing.title}
          </h3>

          {/* Attributes row */}
          <p className="font-sans text-[11px] text-obsidian/40 mt-2 tracking-wide font-medium">
            Size {listing.size} &middot; {listing.silhouette} &middot; {listing.fabric}
          </p>

          {/* Price row */}
          <div className="flex items-baseline gap-3 mt-4">
            <span className="font-sans text-xl font-bold text-obsidian tracking-tight">
              {formatPrice(listing.salePrice)}
            </span>
            <span className="font-sans text-[14px] text-obsidian/20 line-through">
              {formatPrice(listing.originalPrice)}
            </span>
          </div>

          {/* Financing hint */}
          <p className="font-sans text-[10px] text-obsidian/20 mt-2">
            As low as {formatPrice(Math.round(listing.salePrice / 12))}/mo with Affirm
          </p>
        </div>
      </motion.article>
    </Link>
  );
}
