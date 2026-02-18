/* ══════════════════════════════════════════════════
   Product Detail Page — RE:GALIA
   /shop/[id]
   ══════════════════════════════════════════════════ */
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { mockListings, type Listing, type ListingType } from "@/lib/mock-listings";
import { getListingById } from "../actions";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";

/* ── Helpers ────────────────────────────────────── */

function fmt(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(amount);
}

function VerifiedBadge({ size = 16 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width={size} height={size}>
      <path
        d="M12 2L14.09 4.26L17 3.64L17.18 6.57L19.82 8.07L18.56 10.74L20 13.14L17.72 14.72L17.5 17.66L14.58 17.95L12.73 20.39L10.27 18.76L7.27 19.5L6.27 16.73L3.53 15.32L4.63 12.56L3.27 10L5.57 8.45L5.82 5.51L8.74 5.27L10.64 2.87L12 2Z"
        fill="currentColor"
      />
      <path d="M9 12L11 14L15 10" stroke="#050505" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── Accordion Section ──────────────────────────── */

function AccordionSection({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-t border-black/5 py-1">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-6 text-left group"
      >
        <span className="font-sans text-[11px] uppercase tracking-[0.25em] font-bold text-obsidian/40 group-hover:text-obsidian transition-colors">{title}</span>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="text-obsidian/20 text-xl leading-none"
        >
          +
        </motion.span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="pb-8">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SellerBadge({ type }: { type: ListingType }) {
  if (type === "brand_direct") {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-[#C5A059]/10 rounded-full border border-[#C5A059]/20">
        <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 flex-shrink-0">
          <path
            d="M12 2L14.09 4.26L17 3.64L17.18 6.57L19.82 8.07L18.56 10.74L20 13.14L17.72 14.72L17.5 17.66L14.58 17.95L12.73 20.39L10.27 18.76L7.27 19.5L6.27 16.73L3.53 15.32L4.63 12.56L3.27 10L5.57 8.45L5.82 5.51L8.74 5.27L10.64 2.87L12 2Z"
            fill="#C5A059"
          />
          <path d="M9 12L11 14L15 10" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-[#C5A059] font-bold">
          Sold by Galia Lahav
        </span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-obsidian/[0.03] rounded-full border border-obsidian/5">
      <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3 flex-shrink-0 text-obsidian/30">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.5" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-obsidian/40 font-bold">
        {type === "sample_sale" ? "Sample Sale" : "Bride to Bride"}
      </span>
    </div>
  );
}

export default function ProductDetailPage() {
  const params = useParams();
  const [activeImage, setActiveImage] = useState(0);
  const [listing, setListing] = useState<Listing | null>(null);

  useEffect(() => {
    const id = params.id as string;
    getListingById(id).then((dbRow) => {
      if (dbRow) {
        const condMap: Record<string, Listing["condition"]> = { new_unworn: "New Never Worn", excellent: "Excellent", good: "Good" };
        const silMap: Record<string, Listing["silhouette"]> = { a_line: "A-Line", mermaid: "Mermaid", ball_gown: "Ball Gown", sheath: "Sheath", fit_and_flare: "Fit & Flare", trumpet: "Mermaid" };
        const mainImg = dbRow.images?.[0] || "/placeholder-gown.jpg";
        setListing({
          id: dbRow.id,
          title: dbRow.title,
          collection: dbRow.products?.style_name || dbRow.category || "Couture",
          designer: "Galia Lahav",
          originalPrice: dbRow.msrp || dbRow.price * 1.4,
          salePrice: dbRow.price,
          currency: "USD",
          size: dbRow.size_us || "—",
          condition: condMap[dbRow.condition] || "Excellent",
          silhouette: silMap[dbRow.silhouette || ""] || "A-Line",
          neckline: "V-Neck",
          fabric: "Lace",
          color: "Ivory",
          imageUrl: mainImg,
          stockImageUrl: dbRow.products?.images?.[0] || mainImg,
          verified: true,
          featured: false,
          saves: 0,
          daysListed: 0,
          sellerLocation: "Worldwide",
          listingType: dbRow.listing_type || "peer_to_peer",
          measurements: {
            bust: dbRow.bust_cm ? `${dbRow.bust_cm}cm` : "—",
            waist: dbRow.waist_cm ? `${dbRow.waist_cm}cm` : "—",
            hips: dbRow.hips_cm ? `${dbRow.hips_cm}cm` : "—",
            height: dbRow.height_cm ? `${dbRow.height_cm}cm` : "—",
          },
        });
      } else {
        const found = mockListings.find((l) => l.id === id);
        if (found) setListing(found);
      }
    });
  }, [params.id]);

  if (!listing) return null;

  const images = [listing.imageUrl, listing.stockImageUrl, listing.imageUrl, listing.stockImageUrl];

  return (
    <div className="min-h-screen bg-silk text-obsidian pb-32">
      <Navbar />

      <div className="max-w-[1400px] mx-auto px-6 pt-32 lg:pt-48">
        <div className="flex flex-col lg:flex-row gap-20">

          {/* ──── LEFT: STICKY MEDIA COLUMN ──── */}
          <div className="w-full lg:w-[55%]">
            <div className="lg:sticky lg:top-32 space-y-6">
              <div className="relative aspect-[3/4] rounded-[2.5rem] overflow-hidden bg-obsidian/[0.03] shadow-lg">
                <motion.div
                  key={activeImage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8 }}
                  className="w-full h-full"
                >
                  <Image
                    src={images[activeImage]}
                    alt={listing.title}
                    fill
                    className="object-cover"
                    priority
                  />
                </motion.div>
                {listing.verified && (
                  <div className="absolute top-8 left-8 px-5 py-2.5 bg-white/90 backdrop-blur-md rounded-full flex items-center gap-3 shadow-md border border-black/5">
                    <VerifiedBadge size={14} />
                    <span className="font-sans text-[10px] font-bold uppercase tracking-widest text-obsidian/60">
                      House Authenticated
                    </span>
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`relative flex-shrink-0 w-24 aspect-[3/4] rounded-2xl overflow-hidden border-2 transition-all duration-300 ${activeImage === i ? "border-gold-muted scale-105" : "border-transparent opacity-40"
                      }`}
                  >
                    <Image src={img} alt="Thumbnail" fill className="object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ──── RIGHT: SCROLLING CONTENT COLUMN ──── */}
          <div className="w-full lg:w-[45%] lg:pt-10">
            <div className="max-w-xl">
              <div className="flex items-center gap-4 mb-4">
                <p className="font-sans text-[11px] font-bold uppercase tracking-[0.4em] text-gold-muted">
                  {listing.collection} Collection
                </p>
                <span className="text-obsidian/10">|</span>
                <SellerBadge type={listing.listingType} />
              </div>
              <h1 className="font-serif text-6xl md:text-8xl leading-none tracking-tighter mb-8 italic">
                {listing.title}
              </h1>

              <div className="flex items-baseline gap-6 mb-12">
                <span className="font-sans text-4xl font-bold tracking-tighter">
                  {fmt(listing.salePrice)}
                </span>
                <span className="font-sans text-xl text-obsidian/20 line-through">
                  {fmt(listing.originalPrice)}
                </span>
                <div className="px-3 py-1 bg-gold-muted text-white font-sans text-[10px] font-bold uppercase tracking-widest rounded-full">
                  Save {Math.round(((listing.originalPrice - listing.salePrice) / listing.originalPrice) * 100)}%
                </div>
              </div>

              <p className="font-sans text-lg text-obsidian/60 leading-relaxed mb-12">
                An authentic masterpiece of couture heritage. Professionally restored to runway condition,
                awaiting its next chapter in your eternal story.
              </p>

              <div className="grid grid-cols-2 gap-y-10 gap-x-12 mb-16 border-t border-black/5 pt-12">
                {[
                  ["Size", listing.size],
                  ["Silhouette", listing.silhouette],
                  ["Neckline", listing.neckline],
                  ["Color", listing.color],
                  ["Sold by", listing.listingType === "brand_direct" ? "Galia Lahav" : listing.listingType === "sample_sale" ? "Sample Sale" : "Private Seller"],
                  ["Condition", listing.condition],
                ].map(([label, value]) => (
                  <div key={label}>
                    <span className="font-sans text-[10px] font-bold uppercase tracking-[0.3em] text-obsidian/20 block mb-2">{label}</span>
                    <span className="font-sans text-lg font-medium text-obsidian/80">{value}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-4 mb-16">
                <button className="w-full py-6 bg-obsidian text-white font-sans text-[11px] font-bold uppercase tracking-[0.4em] rounded-full hover:bg-gold-muted transition-all duration-500 shadow-xl">
                  Inquire Now
                </button>
                <button className="w-full py-6 border border-black/10 text-obsidian/40 font-sans text-[11px] font-bold uppercase tracking-[0.4em] rounded-full hover:bg-black/5 transition-all duration-500">
                  Professional Sizing Help
                </button>
              </div>

              <div className="space-y-2">
                <AccordionSection title="The Heritage" defaultOpen>
                  <div className="space-y-4 font-sans text-sm text-obsidian/60 leading-relaxed">
                    <p>Original Fabric: {listing.fabric}</p>
                    <p>This gown represents the pinnacle of Galia Lahav craftsmanship, featuring signature 3D floral appliqués and hand-beaded lace.</p>
                  </div>
                </AccordionSection>
                <AccordionSection title="Measurements">
                  <div className="grid grid-cols-2 gap-6">
                    {Object.entries(listing.measurements).map(([key, val]) => (
                      <div key={key}>
                        <span className="font-sans text-[10px] font-bold uppercase tracking-widest text-obsidian/30 block mb-1 capitalize">{key}</span>
                        <span className="font-sans text-base font-medium">{val}</span>
                      </div>
                    ))}
                  </div>
                </AccordionSection>
                <AccordionSection title="Shipping & Returns">
                  <div className="space-y-4 font-sans text-sm text-obsidian/60 leading-relaxed">
                    <p>Worldwide white-glove shipping insured for full value.</p>
                    <p>14-day archival return window included with our authenticity guarantee.</p>
                  </div>
                </AccordionSection>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
