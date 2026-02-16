"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValueEvent,
} from "framer-motion";

/* ═══════════════════════════════════════════
   FRAME CONFIG — matches your actual files:
   frame_000.jpg → frame_191.jpg  (192 total)
   ═══════════════════════════════════════════ */
const TOTAL_FRAMES = 192;
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

/* ── Floating verified badge that follows scroll ── */
function FloatingVerifiedBadge({ progress }: { progress: number }) {
  const opacity = progress > 0.15 && progress < 0.92 ? 1 : 0;
  return (
    <motion.div
      className="fixed top-8 right-8 z-50 flex items-center gap-2 transition-opacity duration-700"
      style={{ opacity }}
    >
      <VerifiedBadge className="w-4 h-4 text-amber-100/50" />
      <span className="font-sans text-[9px] uppercase tracking-[0.3em] text-amber-100/30">
        GL Verified
      </span>
    </motion.div>
  );
}

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
            className="font-serif text-2xl tracking-[0.3em] text-white/60 mb-8 uppercase"
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

      {/* ── Floating Verified Badge ── */}
      <FloatingVerifiedBadge progress={scrollPercent} />

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

        {/* Semi-transparent vignette overlay for text readability */}
        <div className="fixed inset-0 z-[1] pointer-events-none bg-gradient-to-b from-obsidian/30 via-transparent to-obsidian/50" />

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
              className="font-sans text-[10px] md:text-xs uppercase tracking-[0.4em] text-amber-100/40 mb-6"
            >
              The Official Pre-Owned Marketplace
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.6 }}
              className="font-serif text-6xl md:text-8xl lg:text-9xl font-light tracking-wider text-white/90"
            >
              RE:GALIA
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1.0 }}
              className="font-sans text-sm md:text-base text-white/30 mt-3 tracking-[0.2em] uppercase"
            >
              The Eternal Life of Couture
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1.4 }}
              className="font-serif text-lg md:text-xl text-white/40 mt-2 italic tracking-wide"
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
                className="w-[1px] h-12 bg-gradient-to-b from-transparent to-white/20"
              />
              <p className="font-sans text-[9px] uppercase tracking-[0.5em] text-white/20">
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
            <p className="font-sans text-[10px] uppercase tracking-[0.5em] text-amber-100/40 mb-3">
              Chapter I
            </p>
            <h2 className="font-serif text-4xl md:text-6xl font-light text-white/90 leading-tight">
              The Icon
            </h2>
            <LuxuryDivider />
            <p className="font-sans text-sm md:text-base text-white/50 leading-relaxed max-w-md">
              Each Galia Lahav gown is a masterpiece born from thousands of hours
              of hand-stitching, beading, and draping. A work of art that
              transcends fashion&mdash;crafted to be worn, cherished, and passed on.
            </p>
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
            <div className="flex items-center gap-3 mb-3 justify-end">
              <VerifiedBadge className="w-5 h-5 text-gold-muted" />
              <p className="font-sans text-[10px] uppercase tracking-[0.5em] text-amber-100/40">
                Chapter II
              </p>
            </div>
            <h2 className="font-serif text-4xl md:text-6xl font-light text-white/90 leading-tight">
              Certified Legacy
            </h2>
            <LuxuryDivider />
            <p className="font-sans text-sm md:text-base text-white/50 leading-relaxed">
              Unlike peer-to-peer marketplaces, every RE:GALIA gown is verified by
              the Galia Lahav House for 100% authenticity. Original materials
              confirmed, provenance traced, and restored to runway-ready condition.
            </p>
            <div className="mt-6 flex items-center gap-2 justify-end">
              <VerifiedBadge className="w-4 h-4 text-emerald-400/70" />
              <span className="font-sans text-xs text-emerald-400/70 tracking-wider">
                Galia Lahav Verified
              </span>
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
            <p className="font-sans text-[10px] uppercase tracking-[0.5em] text-amber-100/40 mb-3">
              Chapter III
            </p>
            <h2 className="font-serif text-4xl md:text-6xl font-light text-white/90 leading-tight">
              Circular Luxury
            </h2>
            <LuxuryDivider />
            <p className="font-sans text-sm md:text-base text-white/50 leading-relaxed">
              Reducing the bridal footprint through the beauty of pre-loved
              masterpieces. When you pass on your Galia Lahav, you give another
              woman her dream moment&mdash;and your gown lives on.
            </p>
            <div className="mt-6 inline-flex items-center gap-3 border border-white/10 rounded-full px-5 py-2.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500/60 animate-pulse" />
              <span className="font-sans text-xs text-white/40 tracking-wider">
                Sustainable by design
              </span>
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
            <p className="font-sans text-[10px] uppercase tracking-[0.5em] text-amber-100/40 mb-3">
              Chapter IV
            </p>
            <h2 className="font-serif text-4xl md:text-6xl font-light text-white/90 leading-tight">
              Your Dream,
              <br />
              Within Reach
            </h2>
            <LuxuryDivider />
            <p className="font-sans text-sm md:text-base text-white/50 leading-relaxed">
              Browse official samples and pre-owned couture at a fraction of the
              cost. Iconic craftsmanship, a new price point.
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="/shop"
                className="group relative px-10 py-3.5 bg-white text-obsidian font-sans text-sm uppercase tracking-[0.25em] overflow-hidden transition-all duration-500 hover:shadow-[0_0_40px_rgba(201,169,110,0.15)]"
              >
                <span className="relative z-10">Explore the Collection</span>
                <div className="absolute inset-0 bg-champagne translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              </a>
              <a
                href="/sell"
                className="px-10 py-3.5 border border-white/20 font-sans text-sm uppercase tracking-[0.25em] text-white/60 hover:text-white hover:border-white/40 transition-all duration-500"
              >
                Consign Your Gown
              </a>
            </div>

            {/* Financing note */}
            <p className="mt-6 font-sans text-[10px] text-white/25 tracking-wider">
              Starting at $150/mo with Affirm &middot; 0% APR available
            </p>
          </motion.div>
        </section>
      </div>

      {/* ══════════ FOOTER ══════════ */}
      <footer className="relative z-10 border-t border-white/5 bg-obsidian py-16 px-8 md:px-16">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left">
            <h3 className="font-serif text-2xl tracking-wider text-white/70">
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
