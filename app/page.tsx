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
          window.dispatchEvent(new CustomEvent("app-ready"));
        }
      };
      img.onerror = () => {
        if (cancelled) return;
        loaded++;
        setLoadProgress(Math.round((loaded / TOTAL_FRAMES) * 100));
        if (loaded >= TOTAL_FRAMES) {
          setIsLoading(false);
          window.dispatchEvent(new CustomEvent("app-ready"));
        }
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

      {/* ── NAVBAR — always visible ── */}
      <Navbar />

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
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, delay: 0.3 }}
              className="font-sans text-[11px] font-bold uppercase tracking-[0.6em] text-resonance-amber mb-8 resonance-glow"
            >
              The Official Pre-Owned Marketplace
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.6 }}
              className="font-sans text-6xl md:text-8xl lg:text-[10rem] font-black tracking-tighter text-white leading-none mb-4"
            >
              RE:GALIA
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1.0 }}
              className="font-sans text-sm md:text-base font-medium text-white/50 tracking-[0.3em] uppercase"
            >
              The Eternal Life of Couture
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1.8 }}
              className="mt-20 flex flex-col items-center gap-4"
            >
              <div className="w-[1px] h-20 bg-gradient-to-b from-resonance-amber to-transparent opacity-50" />
              <p className="font-sans text-[10px] uppercase tracking-[0.4em] text-white/30 font-semibold">
                Scroll to explore
              </p>
            </motion.div>
          </motion.div>
        </section>

        {/* ── BEAT A: THE ICON ── */}
        <section className="relative z-10 h-screen flex items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.4 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="pl-8 md:pl-24 max-w-lg"
          >
            <div className="resonance-panel p-10 md:p-12">
              <p className="font-sans text-[10px] font-bold uppercase tracking-[0.4em] text-resonance-amber mb-6">
                Chapter 01
              </p>
              <h2 className="font-sans text-4xl md:text-5xl font-bold text-white leading-[1.1] mb-6">
                The Icon
              </h2>
              <p className="font-sans text-base text-white/50 leading-relaxed font-medium">
                Each Galia Lahav gown is a masterpiece born from thousands of hours
                of hand-stitching, beading, and draping. A work of art that
                transcends fashion&mdash;crafted to be passes on.
              </p>
            </div>
          </motion.div>
        </section>

        {/* ── BEAT B: CERTIFIED LEGACY ── */}
        <section className="relative z-10 h-screen flex items-center justify-end">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.4 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="pr-8 md:pr-24 max-w-lg"
          >
            <div className="resonance-panel p-10 md:p-12 border-resonance-amber/20 shadow-[0_0_50px_rgba(255,179,71,0.05)]">
              <div className="flex items-center gap-3 mb-6">
                <VerifiedBadge className="w-5 h-5 text-resonance-amber" />
                <p className="font-sans text-[10px] font-bold uppercase tracking-[0.4em] text-resonance-amber">
                  Chapter 02
                </p>
              </div>
              <h2 className="font-sans text-4xl md:text-5xl font-bold text-white leading-[1.1] mb-6">
                Certified Legacy
              </h2>
              <p className="font-sans text-base text-white/50 leading-relaxed font-medium">
                Unlike peer-to-peer marketplaces, every RE:GALIA gown is verified by
                the House of Galia Lahav for 100% authenticity. Restored to runway condition.
              </p>
            </div>
          </motion.div>
        </section>

        {/* ── BEAT C: CIRCULAR LUXURY ── */}
        <section className="relative z-10 h-screen flex items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.4 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="pl-8 md:pl-24 max-w-lg"
          >
            <div className="resonance-panel p-10 md:p-12">
              <p className="font-sans text-[10px] font-bold uppercase tracking-[0.4em] text-resonance-amber mb-6">
                Chapter 03
              </p>
              <h2 className="font-sans text-4xl md:text-5xl font-bold text-white leading-[1.1] mb-6">
                Circular Luxury
              </h2>
              <p className="font-sans text-base text-white/50 leading-relaxed font-medium">
                Reducing the bridal footprint through the beauty of pre-loved
                masterpieces. Your gown lives on through another woman's dream moment.
              </p>
              <div className="mt-8 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-resonance-blue animate-pulse" />
                <span className="font-sans text-[11px] font-bold text-resonance-blue uppercase tracking-widest">
                  Sustainable by design
                </span>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ── BEAT D: YOUR DREAM WITHIN REACH ── */}
        <section className="relative z-10 h-screen flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.4 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="text-center max-w-2xl px-8"
          >
            <div className="resonance-panel p-12 md:p-16">
              <p className="font-sans text-[10px] font-bold uppercase tracking-[0.4em] text-resonance-amber mb-6">
                Final Chapter
              </p>
              <h2 className="font-sans text-4xl md:text-6xl font-black text-white leading-[1.05] mb-8">
                Your Dream, <br />Within Reach
              </h2>
              <p className="font-sans text-base md:text-lg text-white/50 leading-relaxed font-medium mb-12 max-w-md mx-auto">
                Browse official samples and pre-owned couture at a fraction of the
                cost. Iconic craftsmanship, now accessible.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href="/shop"
                  className="w-full sm:w-auto px-10 py-4 bg-white text-black font-sans font-bold text-sm rounded-full hover:bg-resonance-amber transition-all duration-300"
                >
                  Explore Collection
                </a>
                <a
                  href="/sell"
                  className="w-full sm:w-auto px-10 py-4 border border-white/20 font-sans font-bold text-sm text-white rounded-full hover:bg-white/5 transition-all duration-300"
                >
                  Consign Gown
                </a>
              </div>
            </div>
          </motion.div>
        </section>
      </div>

      {/* ══════════ BROWSE SECTION ══════════ */}
      <section className="relative z-10 bg-black">
        <div className="h-40 bg-gradient-to-b from-transparent to-black" />

        {/* Tab navigation */}
        <div className="max-w-7xl mx-auto px-6 md:px-10 pt-10 pb-20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-16">
            <div className="text-center md:text-left">
              <h2 className="font-sans text-3xl md:text-5xl font-black text-white tracking-tight mb-2">
                The Gown Archive
              </h2>
              <p className="font-sans text-base text-white/40 font-medium">
                Authenticated couture masterpieces, awaiting their next story.
              </p>
            </div>

            <div className="flex items-center gap-2 resonance-panel p-1 rounded-full">
              {(
                [
                  { key: "featured", label: "Featured" },
                  { key: "reduced", label: "Reduced" },
                  { key: "new", label: "New" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-6 py-2 rounded-full font-sans text-xs font-bold uppercase tracking-widest transition-all duration-300 ${activeTab === tab.key
                    ? "bg-white text-black"
                    : "text-white/40 hover:text-white/70"
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Gown grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 mb-20">
            {SAMPLE_GOWNS.map((gown, i) => (
              <motion.a
                key={gown.id}
                href={`/shop/${gown.id}`}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group"
              >
                <div className="relative aspect-[3/4] overflow-hidden rounded-[32px] bg-white/5 mb-6">
                  <img
                    src={gown.image}
                    alt={gown.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  {gown.verified && (
                    <div className="absolute top-4 left-4 resonance-panel px-4 py-2 rounded-full flex items-center gap-2">
                      <VerifiedBadge className="w-3 h-3 text-resonance-amber" />
                      <span className="font-sans text-[9px] font-black uppercase tracking-widest text-white">
                        House Verified
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500" />
                </div>

                <div className="px-2">
                  <h3 className="font-sans text-xl font-bold text-white mb-1 group-hover:text-resonance-amber transition-colors">
                    {gown.name}
                  </h3>
                  <p className="font-sans text-sm text-white/40 font-bold uppercase tracking-widest mb-3">
                    {gown.collection} &middot; Size {gown.size}
                  </p>
                  <div className="flex items-center gap-4">
                    <span className="font-sans text-lg font-black text-white">
                      ${gown.price.toLocaleString()}
                    </span>
                    <span className="font-sans text-sm text-white/20 line-through font-bold">
                      ${gown.originalPrice.toLocaleString()}
                    </span>
                  </div>
                </div>
              </motion.a>
            ))}
          </div>

          <div className="text-center">
            <Link
              href="/shop"
              className="inline-block px-12 py-4 border border-white/10 rounded-full font-sans text-sm font-bold uppercase tracking-widest text-white/60 hover:text-white hover:border-white transition-all duration-300"
            >
              Browse All Masterpieces
            </Link>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/5 bg-black py-20 px-8 md:px-24">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="text-center md:text-left">
            <h3 className="font-sans text-2xl font-black text-white tracking-tight">
              RE:GALIA
            </h3>
            <p className="font-sans text-xs font-bold text-white/20 mt-2 uppercase tracking-widest">
              The Official Marketplace
            </p>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            {["Shop", "Works", "Authentic", "Contact"].map(
              (link) => (
                <a
                  key={link}
                  href="#"
                  className="font-sans text-xs font-bold text-white/40 hover:text-resonance-amber transition-colors tracking-[0.2em] uppercase"
                >
                  {link}
                </a>
              )
            )}
          </div>
          <p className="font-sans text-[10px] font-bold text-white/10 tracking-[0.3em] uppercase">
            &copy; {new Date().getFullYear()} RE:GALIA House
          </p>
        </div>
      </footer>
    </main>
  );
}
