"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import type { Listing, ListingType } from "@/lib/mock-listings";
import { PLACEHOLDER_IMG } from "@/lib/image";

function SellerTypeBadge({ type }: { type: ListingType }) {
  if (type === "brand_direct") {
    return (
      <div className="flex items-center gap-1.5">
        <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 flex-shrink-0">
          <path
            d="M12 2L14.09 4.26L17 3.64L17.18 6.57L19.82 8.07L18.56 10.74L20 13.14L17.72 14.72L17.5 17.66L14.58 17.95L12.73 20.39L10.27 18.76L7.27 19.5L6.27 16.73L3.53 15.32L4.63 12.56L3.27 10L5.57 8.45L5.82 5.51L8.74 5.27L10.64 2.87L12 2Z"
            fill="#1c1c1c"
          />
          <path d="M9 12L11 14L15 10" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="font-sans text-[9px] uppercase tracking-[0.15em] text-white/95 font-light">
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
      <span className="font-sans text-[9px] uppercase tracking-[0.15em] text-white/80 font-light">
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
        stroke="white"
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
      return "bg-[#1c1c1c]/5 text-[#1c1c1c]/60 border-[#1c1c1c]/10";
    case "Very Good":
      return "bg-blue-500/10 text-blue-600 border-blue-500/20";
    case "Good":
      return "bg-[#1c1c1c]/5 text-[#1c1c1c]/40 border-[#1c1c1c]/10";
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
        <div className="relative aspect-[2/3] overflow-hidden bg-[#efefef]">
          {/* Main image */}
          <motion.img
            src={listing.imageUrl}
            alt={`${listing.title} by ${listing.designer}`}
            className="absolute inset-0 w-full h-full object-cover"
            animate={{ scale: isHovered ? 1.05 : 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMG; }}
          />

          {/* Hover overlay */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-[#1c1c1c]/40 via-transparent to-transparent"
            animate={{ opacity: isHovered ? 1 : 0.2 }}
            transition={{ duration: 0.3 }}
          />

          {/* Top badges row */}
          <div className="absolute top-4 left-4 right-4 flex items-start justify-between z-10">
            {/* Condition badge */}
            <span
              className={`px-3 py-1 text-[9px] uppercase tracking-[0.15em] font-sans font-light border backdrop-blur-md ${getConditionColor(
                listing.condition
              )}`}
            >
              {listing.condition}
            </span>

            {/* Save % badge */}
            <span className="px-3 py-1 bg-[#1c1c1c] text-white text-[9px] uppercase tracking-[0.15em] font-sans font-light">
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
            <button className="px-6 py-3 bg-white text-[#1c1c1c] font-sans text-[11px] font-light uppercase tracking-[0.08em] hover:bg-white/90 transition-all shadow-lg">
              Quick View
            </button>
          </motion.div>
        </div>

        {/* Card info */}
        <div className="pt-5 pb-2">
          {/* Collection */}
          <p className="font-sans text-[10px] uppercase tracking-[0.15em] text-[#1c1c1c]/50 mb-1.5 font-light">
            {listing.collection}
          </p>

          {/* Title */}
          <h3 className="font-serif text-xl tracking-tight text-[#1c1c1c] group-hover:opacity-60 transition-opacity duration-300 font-light">
            {listing.title}
          </h3>

          {/* Attributes row */}
          <p className="font-sans text-[11px] text-[#1c1c1c]/55 mt-2 tracking-wide font-light">
            Size {listing.size} &middot; {listing.silhouette} &middot; {listing.fabric}
          </p>

          {/* Price row */}
          <div className="flex items-baseline gap-3 mt-3">
            <span className="font-sans text-base text-[#1c1c1c] tracking-tight">
              {formatPrice(listing.salePrice)}
            </span>
            <span className="font-sans text-sm text-[#1c1c1c]/50 line-through">
              {formatPrice(listing.originalPrice)}
            </span>
          </div>

          {/* Financing hint */}
          <p className="font-sans text-[10px] text-[#1c1c1c]/50 mt-2 font-light">
            As low as {formatPrice(Math.round(listing.salePrice / 12))}/mo with Affirm
          </p>
        </div>
      </motion.article>
    </Link>
  );
}
