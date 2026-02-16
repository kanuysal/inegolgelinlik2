"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import type { Listing } from "@/lib/mock-listings";

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
      return "bg-emerald-500/20 text-emerald-300 border-emerald-500/20";
    case "Excellent":
      return "bg-amber-500/15 text-amber-200 border-amber-500/15";
    case "Very Good":
      return "bg-blue-500/15 text-blue-300 border-blue-500/15";
    case "Good":
      return "bg-white/10 text-white/50 border-white/10";
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
      <div className="relative aspect-[2/3] overflow-hidden bg-white/5">
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
          className="absolute inset-0 bg-gradient-to-t from-obsidian/60 via-transparent to-transparent"
          animate={{ opacity: isHovered ? 1 : 0.3 }}
          transition={{ duration: 0.3 }}
        />

        {/* Top badges row */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between z-10">
          {/* Condition badge */}
          <span
            className={`px-2.5 py-1 text-[10px] uppercase tracking-wider font-sans border ${getConditionColor(
              listing.condition
            )}`}
          >
            {listing.condition}
          </span>

          {/* Save % badge */}
          <span className="px-2.5 py-1 bg-white text-obsidian text-[10px] uppercase tracking-wider font-sans font-medium">
            Save {savePercent}%
          </span>
        </div>

        {/* Heart / save button */}
        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            setSaved(!saved);
          }}
          className={`absolute top-3 right-3 z-20 p-2 transition-colors ${
            saved ? "text-rose-400" : "text-white/60 hover:text-white"
          }`}
          style={{ display: "none" }} /* hidden — save badge takes its spot */
          whileTap={{ scale: 0.85 }}
        >
          <HeartIcon filled={saved} />
        </motion.button>

        {/* Verified badge (bottom-left on image) */}
        {listing.verified && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 z-10">
            <VerifiedBadge />
            <span className="font-sans text-[9px] uppercase tracking-[0.2em] text-white/60">
              GL Verified
            </span>
          </div>
        )}

        {/* Quick view on hover */}
        <motion.div
          className="absolute bottom-3 right-3 z-10"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 8 }}
          transition={{ duration: 0.25 }}
        >
          <button className="px-4 py-2 bg-white/90 backdrop-blur-sm text-obsidian font-sans text-[10px] uppercase tracking-[0.2em] hover:bg-white transition-colors">
            Quick View
          </button>
        </motion.div>
      </div>

      {/* Card info */}
      <div className="pt-4 pb-2">
        {/* Collection */}
        <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-gold-muted/60 mb-1">
          {listing.collection}
        </p>

        {/* Title */}
        <h3 className="font-serif text-lg tracking-wide text-white/90 group-hover:text-champagne transition-colors duration-300">
          {listing.title}
        </h3>

        {/* Attributes row */}
        <p className="font-sans text-[11px] text-white/30 mt-1 tracking-wide">
          Size {listing.size} &middot; {listing.silhouette} &middot; {listing.fabric}
        </p>

        {/* Price row */}
        <div className="flex items-baseline gap-2.5 mt-2.5">
          <span className="font-sans text-base font-medium text-white/90 tracking-wide">
            {formatPrice(listing.salePrice)}
          </span>
          <span className="font-sans text-xs text-white/25 line-through">
            {formatPrice(listing.originalPrice)}
          </span>
        </div>

        {/* Financing hint */}
        <p className="font-sans text-[10px] text-white/20 mt-1">
          As low as {formatPrice(Math.round(listing.salePrice / 12))}/mo with Affirm
        </p>
      </div>
    </motion.article>
    </Link>
  );
}
