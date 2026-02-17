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
import { mockListings, type Listing } from "@/lib/mock-listings";
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

function conditionColor(c: Listing["condition"]) {
  const map = {
    "New Never Worn": "bg-emerald-500/10 text-emerald-400/90 border-emerald-500/20",
    Excellent: "bg-resonance-amber/10 text-resonance-amber border-resonance-amber/20",
    "Very Good": "bg-resonance-blue/10 text-resonance-blue border-resonance-blue/20",
    Good: "bg-white/5 text-white/40 border-white/10",
  };
  return map[c];
}

function conditionDescription(c: Listing["condition"]) {
  const map = {
    "New Never Worn": "This gown has never been worn, altered, or cleaned. Original tags may still be attached.",
    Excellent: "Worn once on the wedding day only. No visible signs of wear, stains, or damage.",
    "Very Good": "Worn once with very minor signs of wear. May have been professionally cleaned.",
    Good: "Gently worn with minor imperfections that do not affect the overall beauty of the gown.",
  };
  return map[c];
}

/* ── Icons ──────────────────────────────────────── */

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

function ChevronLeft() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <path d="M15 19l-7-7 7-7" />
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

function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" />
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
    <div className="border-t border-white/5 py-1">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left group"
      >
        <span className="font-sans text-[10px] uppercase tracking-[0.3em] font-bold text-white/40 group-hover:text-white/70 transition-colors">{title}</span>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="text-white/20 text-xl leading-none"
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

/* ── Main Page Component ────────────────────────── */

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [listing, setListing] = useState<Listing | null>(null);

  useEffect(() => {
    // Try Supabase first, fallback to mock data
    const id = params.id as string;
    getListingById(id).then((dbRow) => {
      if (dbRow) {
        // Map DB row to Listing shape
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
          daysListed: Math.floor((Date.now() - new Date(dbRow.created_at).getTime()) / 86400000),
          sellerLocation: "Worldwide",
          measurements: {
            bust: dbRow.bust_cm ? `${dbRow.bust_cm}cm` : "—",
            waist: dbRow.waist_cm ? `${dbRow.waist_cm}cm` : "—",
            hips: dbRow.hips_cm ? `${dbRow.hips_cm}cm` : "—",
            height: dbRow.height_cm ? `${dbRow.height_cm}cm` : "—",
          },
        });
      } else {
        // Fallback to mock
        const found = mockListings.find((l) => l.id === id);
        if (found) setListing(found);
      }
    });
  }, [params.id]);

  if (!listing) {
    return (
      <div className="min-h-screen bg-obsidian flex items-center justify-center">
        <p className="font-sans text-white/40 text-sm tracking-wider">Loading…</p>
      </div>
    );
  }

  const savePercent = Math.round(
    ((listing.originalPrice - listing.salePrice) / listing.originalPrice) * 100
  );

  // Simulated gallery — in production this comes from API
  const images = [listing.imageUrl, listing.stockImageUrl, listing.imageUrl, listing.stockImageUrl];

  const relatedGowns = mockListings
    .filter((l) => l.id !== listing.id && l.silhouette === listing.silhouette)
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-obsidian text-white">
      <Navbar />

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-5 pt-32 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center w-8 h-8 rounded-full border border-white/10 text-white/30 hover:text-white hover:border-white/30 transition-all"
          >
            <ChevronLeft />
          </button>
          <nav className="font-sans text-[9px] font-bold uppercase tracking-[0.3em] text-white/20">
            <Link href="/" className="hover:text-white/50 transition-colors">Home</Link>
            <span className="mx-2 opacity-50">•</span>
            <Link href="/shop" className="hover:text-white/50 transition-colors">Shop</Link>
            <span className="mx-2 opacity-50">•</span>
            <span className="text-white/40">{listing.title}</span>
          </nav>
        </div>
      </div>

      {/* Main Grid — Image Gallery + Details */}
      <div className="max-w-7xl mx-auto px-5 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* ──── Left: Image Gallery ──── */}
          <div className="space-y-3">
            {/* Main Image */}
            <motion.div
              key={activeImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="relative aspect-[3/4] overflow-hidden bg-white/5"
            >
              <Image
                src={images[activeImage]}
                alt={`${listing.title} by ${listing.designer}`}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />

              {/* Verified overlay */}
              {listing.verified && (
                <div className="absolute bottom-6 left-6 flex items-center gap-3 backdrop-blur-xl bg-white/[0.03] px-4 py-2.5 border border-white/10 rounded-full">
                  <span className="text-resonance-amber">
                    <VerifiedBadge size={16} />
                  </span>
                  <span className="font-sans text-[9px] font-bold uppercase tracking-[0.3em] text-white/60">
                    Galia Lahav Verified
                  </span>
                </div>
              )}
            </motion.div>

            {/* Thumbnail Strip */}
            <div className="flex gap-3 pt-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`relative w-20 h-28 overflow-hidden rounded-sm border transition-all duration-500 ${activeImage === i
                      ? "border-resonance-amber/50 scale-[1.02]"
                      : "border-transparent opacity-40 hover:opacity-70"
                    }`}
                >
                  <Image src={img} alt={`View ${i + 1}`} fill className="object-cover" sizes="80px" />
                </button>
              ))}
            </div>
          </div>

          {/* ──── Right: Product Details ──── */}
          <div className="lg:pt-2">
            {/* Collection */}
            <p className="font-sans text-[9px] font-bold uppercase tracking-[0.4em] text-white/30 mb-3">
              {listing.collection}
            </p>

            {/* Title */}
            <h1 className="font-serif text-5xl lg:text-7xl tracking-tighter text-white/95 leading-[0.9] mb-4">
              {listing.title}
            </h1>

            {/* Designer */}
            <p className="font-sans text-sm text-white/40 tracking-wider mb-8">
              by <span className="text-white/60 font-medium">{listing.designer}</span>
            </p>

            {/* Price Block */}
            <div className="mt-8 flex items-baseline gap-5">
              <span className="font-sans text-4xl font-medium text-white tracking-tighter">
                {fmt(listing.salePrice)}
              </span>
              <span className="font-sans text-lg text-white/20 line-through">
                {fmt(listing.originalPrice)}
              </span>
              <span className="font-sans text-sm font-bold text-resonance-amber/80 tracking-widest uppercase">
                Save {savePercent}%
              </span>
            </div>

            {/* Financing */}
            <p className="font-sans text-xs text-white/25 mt-2">
              As low as {fmt(Math.round(listing.salePrice / 12))}/mo with Affirm · Klarna available
            </p>

            {/* Condition Badge */}
            <div className="mt-8">
              <div
                className={`inline-flex items-center gap-2 px-4 py-2 border rounded-full text-[10px] font-bold uppercase tracking-[0.2em] font-sans backdrop-blur-sm ${conditionColor(
                  listing.condition
                )}`}
              >
                {listing.condition}
              </div>
              <p className="font-sans text-xs text-white/30 mt-3 leading-relaxed max-w-sm">
                {conditionDescription(listing.condition)}
              </p>
            </div>

            {/* Quick Attributes */}
            <div className="mt-12 grid grid-cols-2 gap-x-12 gap-y-6">
              {[
                ["Size", listing.size],
                ["Silhouette", listing.silhouette],
                ["Neckline", listing.neckline],
                ["Fabric", listing.fabric],
                ["Color", listing.color],
                ["Location", listing.sellerLocation],
              ].map(([label, value]) => (
                <div key={label} className="border-b border-white/5 pb-3">
                  <span className="font-sans text-[9px] font-bold uppercase tracking-[0.3em] text-white/20 block mb-1">
                    {label}
                  </span>
                  <span className="font-sans text-[15px] font-medium text-white/80">{value}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="mt-14 space-y-4">
              <button className="w-full py-5 bg-white text-obsidian font-sans text-xs font-bold uppercase tracking-[0.3em] rounded-full hover:bg-resonance-amber transition-all duration-500 shadow-[0_0_50px_rgba(255,255,255,0.05)]">
                Inquire About This Gown
              </button>

              <div className="flex gap-4">
                <button className="flex-[2] py-4 border border-white/10 rounded-full font-sans text-[10px] font-bold uppercase tracking-[0.25em] text-white/40 hover:text-white hover:border-white/30 hover:bg-white/5 transition-all duration-500">
                  Make an Offer
                </button>
                <button
                  onClick={() => setSaved(!saved)}
                  className={`w-14 items-center justify-center flex border rounded-full transition-all duration-500 ${saved
                      ? "border-resonance-amber/40 text-resonance-amber bg-resonance-amber/5"
                      : "border-white/10 text-white/40 hover:text-white hover:border-white/30 hover:bg-white/5"
                    }`}
                >
                  <HeartIcon filled={saved} />
                </button>
                <button className="w-14 items-center justify-center flex border border-white/10 rounded-full text-white/40 hover:text-white hover:border-white/30 hover:bg-white/5 transition-all duration-500">
                  <ShareIcon />
                </button>
              </div>
            </div>

            {/* Trust Signals */}
            <div className="mt-12 py-8 border-y border-white/5 grid grid-cols-3 gap-8 text-center bg-white/[0.01] rounded-3xl">
              {[
                ["🔒", "Secure\nPayment"],
                ["✨", "GL\nAuthenticated"],
                ["🌊", "Buyer\nProtection"],
              ].map(([icon, label]) => (
                <div key={label}>
                  <span className="text-xl mb-3 block">{icon}</span>
                  <p className="font-sans text-[8px] font-bold uppercase tracking-[0.3em] text-white/30 mt-2 whitespace-pre-line leading-[1.6]">
                    {label}
                  </p>
                </div>
              ))}
            </div>

            {/* Accordion Sections */}
            <div className="mt-4">
              <AccordionSection title="Measurements" defaultOpen>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(listing.measurements).map(([key, val]) => (
                    <div key={key} className="flex justify-between">
                      <span className="font-sans text-xs text-white/30 capitalize">{key}</span>
                      <span className="font-sans text-sm text-white/70">{val}</span>
                    </div>
                  ))}
                </div>
                <p className="font-sans text-[10px] text-white/20 mt-3">
                  Measurements provided by seller. Professional verification available upon request.
                </p>
              </AccordionSection>

              <AccordionSection title="Authenticity & Verification">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="text-gold-muted mt-0.5">
                      <VerifiedBadge size={16} />
                    </span>
                    <div>
                      <p className="font-sans text-xs text-white/70">Galia Lahav Certified</p>
                      <p className="font-sans text-[11px] text-white/30 mt-0.5">
                        This gown has been verified as an authentic Galia Lahav creation by the House.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-white/40 mt-0.5 text-xs">📋</span>
                    <div>
                      <p className="font-sans text-xs text-white/70">Certificate of Authenticity</p>
                      <p className="font-sans text-[11px] text-white/30 mt-0.5">
                        Includes official GL certificate and provenance documentation.
                      </p>
                    </div>
                  </div>
                </div>
              </AccordionSection>

              <AccordionSection title="Shipping & Returns">
                <div className="space-y-2 font-sans text-xs text-white/40 leading-relaxed">
                  <p>Worldwide insured shipping via white-glove courier service.</p>
                  <p>
                    14-day return window from delivery. Gown must be in the same condition as received.
                  </p>
                  <p>Buyer protection included on all RE:GALIA transactions.</p>
                </div>
              </AccordionSection>

              <AccordionSection title="Buyer Protection">
                <div className="space-y-2 font-sans text-xs text-white/40 leading-relaxed">
                  <p>Every RE:GALIA purchase is protected by our comprehensive buyer guarantee.</p>
                  <p>Funds are held in escrow until you confirm receipt and satisfaction.</p>
                  <p>Full refund if the gown is not as described or fails authentication.</p>
                </div>
              </AccordionSection>
            </div>
          </div>
        </div>

        {/* ──── Similar Gowns Section ──── */}
        {relatedGowns.length > 0 && (
          <section className="mt-24 border-t border-white/5 pt-16">
            <h2 className="font-serif text-2xl tracking-wide text-white/80 mb-8">
              Similar Gowns
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
              {relatedGowns.map((gown) => {
                const sp = Math.round(
                  ((gown.originalPrice - gown.salePrice) / gown.originalPrice) * 100
                );
                return (
                  <Link
                    key={gown.id}
                    href={`/shop/${gown.id}`}
                    className="group"
                  >
                    <div className="relative aspect-[2/3] overflow-hidden bg-white/5">
                      <Image
                        src={gown.imageUrl}
                        alt={gown.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 1024px) 50vw, 25vw"
                      />
                      <div className="absolute top-2 right-2">
                        <span className="px-2 py-1 bg-white text-obsidian text-[9px] uppercase tracking-wider font-sans">
                          Save {sp}%
                        </span>
                      </div>
                    </div>
                    <div className="pt-3">
                      <p className="font-sans text-[9px] uppercase tracking-[0.3em] text-gold-muted/50">
                        {gown.collection}
                      </p>
                      <h3 className="font-serif text-base text-white/80 group-hover:text-champagne transition-colors">
                        {gown.title}
                      </h3>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="font-sans text-sm text-white/70">{fmt(gown.salePrice)}</span>
                        <span className="font-sans text-[11px] text-white/20 line-through">
                          {fmt(gown.originalPrice)}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>
      <Footer />
    </div>
  );
}
