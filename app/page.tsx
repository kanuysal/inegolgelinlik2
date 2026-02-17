"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValueEvent,
} from "framer-motion";
import Link from "next/link";
import Navbar from "@/components/ui/Navbar";

/* ═══════════════════════════════════════════
   FRAME CONFIG — Bleecker collection video:
   frame_000.jpg → frame_299.jpg  (300 total)
   ═══════════════════════════════════════════ */
const TOTAL_FRAMES = 300;
const FRAME_PREFIX = "/frames/frame_";
const FRAME_EXT = ".jpg";

function padFrame(n: number): string {
  return String(n).padStart(3, "0");
}

/* ── Verified badge ── */
function VerifiedBadge({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
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

/* ── Luxury divider ── */
function LuxuryDivider() {
  return (
    <div className="flex items-center gap-4 my-6">
      <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-amber-100/30" />
      <div className="w-1 h-1 rounded-full bg-amber-100/40" />
      <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-amber-100/30" />
    </div>
  );
}

/* ═══════════════════════════════════════════
   SAMPLE GOWNS DATA — for browse section
   ═══════════════════════════════════════════ */
const COLLECTIONS = [
  { name: "Bridal Couture", slug: "bridal-couture" },
  { name: "GALA by GL", slug: "gala" },
  { name: "Bleecker", slug: "bleecker" },
  { name: "Victorian Affinity", slug: "victorian-affinity" },
  { name: "Queen of Hearts", slug: "queen-of-hearts" },
  { name: "Do Not Disturb", slug: "do-not-disturb" },
];

const SAMPLE_GOWNS = [
  {
    id: 1,
    name: "Alegria",
    collection: "Bridal Couture",
    originalPrice: 12800,
    price: 6400,
    size: "US 6",
    condition: "Like New",
    image: "/frames/frame_080.jpg",
    verified: true,
  },
  {
    id: 2,
    name: "Bella",
    collection: "GALA by GL",
    originalPrice: 8900,
    price: 4450,
    size: "US 4",
    condition: "Excellent",
    image: "/frames/frame_120.jpg",
    verified: true,
  },
  {
    id: 3,
    name: "Estelle",
    collection: "Bleecker",
    originalPrice: 15200,
    price: 7600,
    size: "US 8",
    condition: "Like New",
    image: "/frames/frame_180.jpg",
    verified: true,
  },
  {
    id: 4,
    name: "Florence",
    collection: "Victorian Affinity",
    originalPrice: 11500,
    price: 5750,
    size: "US 2",
    condition: "Sample",
    image: "/frames/frame_220.jpg",
    verified: true,
  },
  {
    id: 5,
    name: "Giselle",
    collection: "Queen of Hearts",
    originalPrice: 13400,
    price: 6700,
    size: "US 6",
    condition: "Like New",
    image: "/frames/frame_050.jpg",
    verified: true,
  },
  {
    id: 6,
    name: "Hazel",
    collection: "Do Not Disturb",
    originalPrice: 9800,
    price: 4900,
    size: "US 10",
    condition: "Excellent",
    image: "/frames/frame_260.jpg",
    verified: true,
  },
];

/* ══════════════════════════════════════
   MAIN PAGE
   ══════════════════════════════════════ */
export default function Home() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const currentFrameRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [scrollPercent, setScrollPercent] = useState(0);
  const [activeTab, setActiveTab] = useState<"featured" | "reduced" | "new">("featured");

  /* ── Scroll tracking ── */
  const { scrollYProgress } = useScroll({
    target: scrollContainerRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.0001,
  });

  /* ── Hero parallax ── */
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: heroScroll } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroOpacity = useTransform(heroScroll, [0, 0.5], [1, 0]);
  const heroY = useTransform(heroScroll, [0, 0.5], [0, -80]);
  const heroScale = useTransform(heroScroll, [0, 0.5], [1, 0.95]);

  /* ── Draw frame with cover-fit + DPR ── */
  const drawFrame = useCallback((index: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const img = imagesRef.current[index];
    if (!canvas || !ctx || !img || !img.complete || !img.naturalWidth) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const cw = rect.width;
    const ch = rect.height;

    if (canvas.width !== cw * dpr || canvas.height !== ch * dpr) {
      canvas.width = cw * dpr;
      canvas.height = ch * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    const scale = Math.max(cw / iw, ch / ih);
    const sw = iw * scale;
    const sh = ih * scale;
    const sx = (cw - sw) / 2;
    const sy = (ch - sh) / 2;

    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, sx, sy, sw, sh);
  }, []);

  /* ── Preload frames (starts at 0) ── */
  useEffect(() => {
    let loaded = 0;
    const images: HTMLImageElement[] = [];
    let cancelled = false;

    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = `${FRAME_PREFIX}${padFrame(i)}${FRAME_EXT}`;
      img.onload = () => {
        if (cancelled) return;
        loaded++;
        setLoadProgress(Math.round((loaded / TOTAL_FRAMES) * 100));
        if (loaded >= TOTAL_FRAMES) {
          setIsLoading(false);
          drawFrame(0);
        }
      };
      img.onerror = () => {
        if (cancelled) return;
        loaded++;
        setLoadProgress(Math.round((loaded / TOTAL_FRAMES) * 100));
        if (loaded >= TOTAL_FRAMES) setIsLoading(false);
      };
      images.push(img);
    }
    imagesRef.current = images;
    return () => {
      cancelled = true;
    };
  }, [drawFrame]);

  /* ── Scroll → frame mapping ── */
  useMotionValueEvent(smoothProgress, "change", (v) => {
    setScrollPercent(v);
    const idx = Math.min(
      TOTAL_FRAMES - 1,
      Math.max(0, Math.floor(v * (TOTAL_FRAMES - 1)))
    );
    if (idx !== currentFrameRef.current) {
      currentFrameRef.current = idx;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => drawFrame(idx));
    }
  });

  /* ── Resize handler ── */
  useEffect(() => {
    const onResize = () => drawFrame(currentFrameRef.current);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [drawFrame]);

  return (
    <main className="relative bg-obsidian selection:bg-amber-100/20 selection:text-white">
      {/* ── NAVBAR — always visible ── */}
      <Navbar />

      {/* ── LOADING SCREEN ── */}
      {isLoading && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-obsidian"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="font-display text-2xl tracking-[0.3em] text-white/60 mb-8 uppercase"
          >
            Preparing the Atelier&hellip;
          </motion.p>
          <div className="w-64 h-[1px] bg-white/10 relative overflow-hidden rounded-full">
            <motion.div
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-gold-muted/60 to-champagne/40"
              style={{ width: `${loadProgress}%` }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          </div>
          <p className="mt-4 font-sans text-xs tracking-widest text-white/30">
            {loadProgress}%
          </p>
        </motion.div>
      )}

      {/* ══════════ SCROLL CONTAINER ══════════ */}
      <div
        ref={scrollContainerRef}
        className="relative"
        style={{ height: "600vh" }}
      >
        {/* Fixed fullscreen canvas */}
        <canvas
          ref={canvasRef}
          className="fixed top-0 left-0 w-screen h-screen z-0"
          style={{ display: isLoading ? "none" : "block" }}
        />

        {/* Stronger vignette overlay for text readability */}
        <div className="fixed inset-0 z-[1] pointer-events-none bg-gradient-to-b from-obsidian/60 via-obsidian/20 to-obsidian/70" />
        {/* Side vignettes for better text contrast */}
        <div className="fixed inset-0 z-[1] pointer-events-none bg-gradient-to-r from-obsidian/50 via-transparent to-obsidian/50" />

        {/* ── HERO (first viewport) ── */}
        <section
          ref={heroRef}
          className="relative z-10 h-screen flex items-center justify-center"
        >
          <motion.div
            style={{ opacity: heroOpacity, y: heroY, scale: heroScale }}
            className="text-center"
          >
            <motion.p
              initial={{ opacity: 0, letterSpacing: "0.2em" }}
              animate={{ opacity: 1, letterSpacing: "0.4em" }}
              transition={{ duration: 1.5, delay: 0.3 }}
              className="font-display text-[10px] md:text-xs uppercase tracking-[0.4em] text-white/70 mb-6"
            >
              The Official Pre-Owned Marketplace
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.6 }}
              className="font-display text-6xl md:text-8xl lg:text-9xl font-bold tracking-wider text-white drop-shadow-[0_4px_30px_rgba(0,0,0,0.8)]"
            >
              RE:GALIA
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1.0 }}
              className="font-display text-sm md:text-base text-white/60 mt-3 tracking-[0.2em] uppercase drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)]"
            >
              The Eternal Life of Couture
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1.4 }}
              className="font-serif text-lg md:text-xl text-white/50 mt-2 italic tracking-wide drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)]"
            >
              by Galia Lahav
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 2.0 }}
              className="mt-14 flex flex-col items-center gap-2"
            >
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="w-[1px] h-12 bg-gradient-to-b from-transparent to-white/30"
              />
              <p className="font-sans text-[9px] uppercase tracking-[0.5em] text-white/40">
                Scroll to explore
              </p>
            </motion.div>
          </motion.div>
        </section>

        {/* ── BEAT A: THE ICON (0–20%) ── */}
        <section className="relative z-10 h-screen flex items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: 0.4 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="pl-8 md:pl-16 lg:pl-24 max-w-lg"
          >
            {/* Dark backing panel for readability */}
            <div className="bg-obsidian/60 backdrop-blur-sm rounded-lg p-6 md:p-8">
              <p className="font-display text-[10px] uppercase tracking-[0.5em] text-gold-muted mb-3">
                Chapter I
              </p>
              <h2 className="font-display text-4xl md:text-6xl font-bold text-white leading-tight">
                The Icon
              </h2>
              <LuxuryDivider />
              <p className="font-sans text-sm md:text-base text-white/70 leading-relaxed max-w-md">
                Each Galia Lahav gown is a masterpiece born from thousands of hours
                of hand-stitching, beading, and draping. A work of art that
                transcends fashion&mdash;crafted to be worn, cherished, and passed on.
              </p>
            </div>
          </motion.div>
        </section>

        {/* ── BEAT B: CERTIFIED LEGACY (25–45%) ── */}
        <section className="relative z-10 h-screen flex items-center justify-end">
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: 0.4 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="pr-8 md:pr-16 lg:pr-24 max-w-lg text-right"
          >
            <div className="bg-obsidian/60 backdrop-blur-sm rounded-lg p-6 md:p-8">
              <div className="flex items-center gap-3 mb-3 justify-end">
                <VerifiedBadge className="w-5 h-5 text-gold-muted" />
                <p className="font-display text-[10px] uppercase tracking-[0.5em] text-gold-muted">
                  Chapter II
                </p>
              </div>
              <h2 className="font-display text-4xl md:text-6xl font-bold text-white leading-tight">
                Certified Legacy
              </h2>
              <LuxuryDivider />
              <p className="font-sans text-sm md:text-base text-white/70 leading-relaxed">
                Unlike peer-to-peer marketplaces, every RE:GALIA gown is verified by
                the Galia Lahav House for 100% authenticity. Original materials
                confirmed, provenance traced, and restored to runway-ready condition.
              </p>
              <div className="mt-6 flex items-center gap-2 justify-end">
                <VerifiedBadge className="w-4 h-4 text-emerald-400/80" />
                <span className="font-sans text-xs text-emerald-400/80 tracking-wider">
                  Galia Lahav Verified
                </span>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ── BEAT C: CIRCULAR LUXURY (50–70%) ── */}
        <section className="relative z-10 h-screen flex items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: 0.4 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="pl-8 md:pl-16 lg:pl-24 max-w-lg"
          >
            <div className="bg-obsidian/60 backdrop-blur-sm rounded-lg p-6 md:p-8">
              <p className="font-display text-[10px] uppercase tracking-[0.5em] text-gold-muted mb-3">
                Chapter III
              </p>
              <h2 className="font-display text-4xl md:text-6xl font-bold text-white leading-tight">
                Circular Luxury
              </h2>
              <LuxuryDivider />
              <p className="font-sans text-sm md:text-base text-white/70 leading-relaxed">
                Reducing the bridal footprint through the beauty of pre-loved
                masterpieces. When you pass on your Galia Lahav, you give another
                woman her dream moment&mdash;and your gown lives on.
              </p>
              <div className="mt-6 inline-flex items-center gap-3 border border-white/15 rounded-full px-5 py-2.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500/60 animate-pulse" />
                <span className="font-sans text-xs text-white/50 tracking-wider">
                  Sustainable by design
                </span>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ── BEAT D: YOUR DREAM WITHIN REACH (75–95%) ── */}
        <section className="relative z-10 h-screen flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.4 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="text-center max-w-xl px-8"
          >
            <div className="bg-obsidian/60 backdrop-blur-sm rounded-lg p-8 md:p-12">
              <p className="font-display text-[10px] uppercase tracking-[0.5em] text-gold-muted mb-3">
                Chapter IV
              </p>
              <h2 className="font-display text-4xl md:text-6xl font-bold text-white leading-tight">
                Your Dream,
                <br />
                Within Reach
              </h2>
              <LuxuryDivider />
              <p className="font-sans text-sm md:text-base text-white/70 leading-relaxed">
                Browse official samples and pre-owned couture at a fraction of the
                cost. Iconic craftsmanship, a new price point.
              </p>

              {/* CTA Buttons */}
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href="/shop"
                  className="group relative px-10 py-3.5 bg-white text-obsidian font-display text-sm uppercase tracking-[0.25em] overflow-hidden transition-all duration-500 hover:shadow-[0_0_40px_rgba(201,169,110,0.15)]"
                >
                  <span className="relative z-10">Explore the Collection</span>
                  <div className="absolute inset-0 bg-champagne translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                </a>
                <a
                  href="/sell"
                  className="px-10 py-3.5 border border-white/30 font-display text-sm uppercase tracking-[0.25em] text-white/70 hover:text-white hover:border-white/50 transition-all duration-500"
                >
                  Consign Your Gown
                </a>
              </div>

              {/* Financing note */}
              <p className="mt-6 font-sans text-[10px] text-white/40 tracking-wider">
                Starting at $150/mo with Affirm &middot; 0% APR available
              </p>
            </div>
          </motion.div>
        </section>
      </div>

      {/* ══════════════════════════════════════════════════════
          BROWSE SECTION — Collections + Gown Listings
          ══════════════════════════════════════════════════════ */}
      <section className="relative z-10 bg-obsidian">
        {/* Transition gradient from hero */}
        <div className="h-32 bg-gradient-to-b from-obsidian/0 to-obsidian" />

        {/* Collections carousel */}
        <div className="max-w-7xl mx-auto px-6 md:px-10 pt-8 pb-12">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-white tracking-wider text-center mb-2">
            Browse by Collection
          </h2>
          <p className="font-sans text-sm text-white/40 text-center mb-10 tracking-wide">
            Explore authenticated gowns from every Galia Lahav line
          </p>

          {/* Collection circles */}
          <div className="flex gap-6 md:gap-8 overflow-x-auto pb-4 scrollbar-hide justify-center flex-wrap">
            {COLLECTIONS.map((col, i) => (
              <motion.a
                key={col.slug}
                href={`/shop?collection=${col.slug}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="flex flex-col items-center gap-3 group shrink-0"
              >
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border border-white/10 group-hover:border-gold-muted/40 transition-all duration-500 overflow-hidden bg-obsidian/50">
                  <img
                    src={`/frames/frame_${padFrame(i * 45 + 10)}.jpg`}
                    alt={col.name}
                    className="w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"
                  />
                </div>
                <span className="font-display text-[10px] md:text-xs uppercase tracking-[0.15em] text-white/50 group-hover:text-champagne transition-colors text-center whitespace-nowrap">
                  {col.name}
                </span>
              </motion.a>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="h-[1px] bg-white/5" />
        </div>

        {/* Tab navigation */}
        <div className="max-w-7xl mx-auto px-6 md:px-10 pt-10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex gap-6">
              {(
                [
                  { key: "featured", label: "Featured" },
                  { key: "reduced", label: "Price Reduced" },
                  { key: "new", label: "Newly Listed" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`font-display text-xs md:text-sm uppercase tracking-[0.2em] pb-2 border-b-2 transition-all duration-300 ${
                    activeTab === tab.key
                      ? "text-white border-gold-muted"
                      : "text-white/30 border-transparent hover:text-white/50"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <Link
              href="/shop"
              className="font-display text-xs uppercase tracking-[0.2em] text-gold-muted hover:text-champagne transition-colors"
            >
              View All →
            </Link>
          </div>

          {/* Gown grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 pb-16">
            {SAMPLE_GOWNS.map((gown, i) => (
              <motion.a
                key={gown.id}
                href={`/shop/${gown.id}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group cursor-pointer"
              >
                {/* Image */}
                <div className="relative aspect-[3/4] overflow-hidden bg-obsidian/50 mb-3">
                  <img
                    src={gown.image}
                    alt={gown.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  {/* Verified badge overlay */}
                  {gown.verified && (
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-obsidian/70 backdrop-blur-sm rounded-full px-2.5 py-1">
                      <VerifiedBadge className="w-3 h-3 text-gold-muted" />
                      <span className="font-sans text-[8px] uppercase tracking-wider text-gold-muted">
                        Verified
                      </span>
                    </div>
                  )}
                  {/* Condition tag */}
                  <div className="absolute bottom-3 left-3">
                    <span className="bg-obsidian/70 backdrop-blur-sm text-white/70 text-[9px] uppercase tracking-wider px-2.5 py-1 rounded-full font-sans">
                      {gown.condition}
                    </span>
                  </div>
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-obsidian/0 group-hover:bg-obsidian/20 transition-colors duration-500" />
                </div>

                {/* Info */}
                <div>
                  <h3 className="font-display text-sm md:text-base text-white group-hover:text-champagne transition-colors tracking-wider uppercase">
                    {gown.name}
                  </h3>
                  <p className="font-sans text-[10px] text-white/40 mt-0.5 tracking-wider">
                    {gown.collection} &middot; Size {gown.size}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="font-display text-sm text-white tracking-wider">
                      ${gown.price.toLocaleString()}
                    </span>
                    <span className="font-sans text-xs text-white/30 line-through">
                      ${gown.originalPrice.toLocaleString()}
                    </span>
                    <span className="font-sans text-[10px] text-emerald-400/80 tracking-wider">
                      {Math.round(((gown.originalPrice - gown.price) / gown.originalPrice) * 100)}% off
                    </span>
                  </div>
                </div>
              </motion.a>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center pb-20">
            <Link
              href="/shop"
              className="inline-block font-display text-sm uppercase tracking-[0.25em] px-12 py-4 border border-white/20 text-white/60 hover:text-white hover:border-white/40 transition-all duration-500"
            >
              Browse All Gowns
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════ FOOTER ══════════ */}
      <footer className="relative z-10 border-t border-white/5 bg-obsidian py-16 px-8 md:px-16">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left">
            <h3 className="font-display text-2xl tracking-wider text-white/70 font-bold">
              RE:GALIA
            </h3>
            <p className="font-sans text-xs text-white/30 mt-1">
              by Galia Lahav
            </p>
          </div>
          <div className="flex items-center gap-6">
            {["About", "How It Works", "Authenticity", "Contact"].map(
              (link) => (
                <a
                  key={link}
                  href="#"
                  className="font-sans text-xs text-white/30 hover:text-white/60 transition-colors tracking-wider uppercase"
                >
                  {link}
                </a>
              )
            )}
          </div>
          <p className="font-sans text-[10px] text-white/15 tracking-wider">
            &copy; {new Date().getFullYear()} Galia Lahav. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
