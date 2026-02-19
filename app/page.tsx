"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useMotionValueEvent,
} from "framer-motion";
import Link from "next/link";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";

/* ═══════════════════════════════════════════
   FRAME CONFIG — Bleecker collection video
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
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const FEATURED_GOWNS = [
  {
    id: 1,
    name: "Alegria",
    collection: "Bridal Couture",
    originalPrice: 12800,
    price: 6400,
    size: "US 6",
    image: "/frames/frame_080.jpg",
  },
  {
    id: 2,
    name: "Bella",
    collection: "GALA by GL",
    originalPrice: 8900,
    price: 4450,
    size: "US 4",
    image: "/frames/frame_120.jpg",
  },
  {
    id: 3,
    name: "Estelle",
    collection: "Bleecker",
    originalPrice: 15200,
    price: 7600,
    size: "US 8",
    image: "/frames/frame_180.jpg",
  },
  {
    id: 4,
    name: "Florence",
    collection: "Victorian Affinity",
    originalPrice: 11500,
    price: 5750,
    size: "US 2",
    image: "/frames/frame_220.jpg",
  },
  {
    id: 5,
    name: "Giselle",
    collection: "Queen of Hearts",
    originalPrice: 13400,
    price: 6700,
    size: "US 6",
    image: "/frames/frame_050.jpg",
  },
  {
    id: 6,
    name: "Hazel",
    collection: "Do Not Disturb",
    originalPrice: 9800,
    price: 4900,
    size: "US 10",
    image: "/frames/frame_260.jpg",
  },
];

const MARQUEE_IMAGES = [
  "/frames/frame_020.jpg",
  "/frames/frame_060.jpg",
  "/frames/frame_100.jpg",
  "/frames/frame_140.jpg",
  "/frames/frame_200.jpg",
  "/frames/frame_240.jpg",
  "/frames/frame_280.jpg",
  "/frames/frame_030.jpg",
  "/frames/frame_090.jpg",
  "/frames/frame_170.jpg",
];

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const currentFrameRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const drawFrame = useCallback((index: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const img = imagesRef.current[index];
    if (!ctx || !img || !img.complete) return;

    const dpr = window.devicePixelRatio || 1;
    const cw = canvas.clientWidth;
    const ch = canvas.clientHeight;

    if (canvas.width !== cw * dpr || canvas.height !== ch * dpr) {
      canvas.width = cw * dpr;
      canvas.height = ch * dpr;
      ctx.scale(dpr, dpr);
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

  useEffect(() => {
    let loaded = 0;
    let done = false;
    const images: HTMLImageElement[] = [];

    const markReady = () => {
      if (done) return;
      done = true;
      setIsLoading(false);
      drawFrame(0);
    };

    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = `${FRAME_PREFIX}${padFrame(i)}${FRAME_EXT}`;
      img.onload = img.onerror = () => {
        loaded++;
        if (loaded === TOTAL_FRAMES) markReady();
      };
      images.push(img);
    }
    imagesRef.current = images;

    // Fallback: dismiss loader after 4s even if frames haven't finished
    const timeout = setTimeout(markReady, 4000);
    return () => clearTimeout(timeout);
  }, [drawFrame]);

  const { scrollYProgress } = useScroll({
    target: scrollContainerRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const idx = Math.min(TOTAL_FRAMES - 1, Math.floor(v * TOTAL_FRAMES));
    if (idx !== currentFrameRef.current) {
      currentFrameRef.current = idx;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => drawFrame(idx));
    }
  });

  return (
    <main className="relative bg-white selection:bg-[#1c1c1c]/10 selection:text-[#1c1c1c] overflow-x-hidden">
      <Navbar />

      {/* ── HERO ── */}
      <section className="relative h-[100vh] flex flex-col items-center justify-end px-6 overflow-hidden bg-[#1c1c1c] text-white pb-20">
        {/* Inline loading state with GL logo */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              key="hero-loader"
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#1c1c1c]"
            >
              <motion.img
                src="/images/SYMBOL_BLACK.png"
                alt="GL"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="w-16 h-16 md:w-20 md:h-20 invert mb-8"
              />
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="w-24 h-[1px] bg-white/20 origin-center mb-6"
              />
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="font-serif text-xl tracking-[0.35em] text-white/60 font-light uppercase"
              >
                RE:GALIA
              </motion.p>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-10"
              >
                <motion.div
                  className="w-8 h-[1px] bg-white/20"
                  animate={{ scaleX: [0.3, 1, 0.3], opacity: [0.2, 0.5, 0.2] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isLoading ? {} : { opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="text-center z-10 max-w-5xl"
        >
          <p className="font-sans text-[11px] font-light uppercase tracking-[0.4em] text-white/40 mb-6">
            Certified Pre-Owned by Galia Lahav
          </p>
          <h1 className="font-serif text-[clamp(3rem,8vw,8rem)] leading-[0.9] tracking-[-0.03em] mb-10 font-light">
            The Eternal Life <br />
            <span className="italic">of Couture</span>
          </h1>
          <Link
            href="/shop"
            className="inline-block px-14 py-5 bg-white text-[#1c1c1c] font-sans text-[11px] font-light uppercase tracking-[0.15em] hover:bg-white/90 transition-all duration-300"
          >
            Shop Now
          </Link>
        </motion.div>

        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-t from-[#1c1c1c] via-[#1c1c1c]/40 to-transparent z-10" />
          <img
            src="/frames/frame_150.jpg"
            alt="Bridal Couture"
            className="w-full h-full object-cover opacity-60 scale-110"
          />
        </div>
      </section>

      {/* ── AUTO-SCROLL MARQUEE ── */}
      <section className="py-3 bg-white overflow-hidden border-y border-[#1c1c1c]/5">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...MARQUEE_IMAGES, ...MARQUEE_IMAGES].map((img, i) => (
            <div key={i} className="flex-shrink-0 w-[180px] md:w-[260px] aspect-[3/4] mx-1.5 overflow-hidden">
              <img
                src={img}
                alt="Couture"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURED EDITORIAL GRID ── */}
      <section className="bg-white py-20 md:py-28">
        <div className="max-w-[92rem] mx-auto px-4 md:px-8">
          <div className="flex items-end justify-between mb-12 md:mb-16 px-2">
            <div>
              <p className="font-sans text-[11px] font-light uppercase tracking-[0.4em] text-[#1c1c1c]/30 mb-3">
                Featured
              </p>
              <h2 className="font-serif text-3xl md:text-5xl font-light text-[#1c1c1c] tracking-[-0.02em]">
                Shop the Collection
              </h2>
            </div>
            <Link
              href="/shop"
              className="hidden md:inline-block font-sans text-[11px] font-light uppercase tracking-[0.15em] text-[#1c1c1c] border-b border-[#1c1c1c] pb-1 hover:opacity-60 transition-opacity"
            >
              View All
            </Link>
          </div>

          {/* 2 big + 4 smaller */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {FEATURED_GOWNS.slice(0, 2).map((gown, i) => (
              <motion.a
                key={gown.id}
                href="/shop"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.7, delay: i * 0.1 }}
                className="group col-span-1 md:col-span-2 relative"
              >
                <div className="aspect-[3/4] overflow-hidden bg-[#efefef] relative">
                  <img
                    src={gown.image}
                    alt={gown.name}
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-1000"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1c1c1c]/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute bottom-0 inset-x-0 p-6 md:p-10 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
                    <p className="font-sans text-[10px] font-light uppercase tracking-[0.2em] text-white/60 mb-2">
                      {gown.collection}
                    </p>
                    <h3 className="font-serif text-2xl md:text-4xl text-white font-light mb-3">
                      {gown.name}
                    </h3>
                    <div className="flex items-center gap-3">
                      <span className="font-sans text-sm text-white">
                        ${gown.price.toLocaleString()}
                      </span>
                      <span className="font-sans text-sm text-white/40 line-through">
                        ${gown.originalPrice.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="absolute top-4 left-4 md:top-6 md:left-6 px-3 py-1.5 bg-white/90 backdrop-blur-sm flex items-center gap-1.5">
                    <VerifiedBadge className="w-3 h-3 text-[#1c1c1c]" />
                    <span className="font-sans text-[9px] font-light uppercase tracking-[0.08em] text-[#1c1c1c]/70">
                      Verified
                    </span>
                  </div>
                  <div className="absolute bottom-4 right-4 md:bottom-6 md:right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <span className="px-6 py-3 bg-white text-[#1c1c1c] font-sans text-[11px] font-light uppercase tracking-[0.15em]">
                      Shop Now
                    </span>
                  </div>
                </div>
              </motion.a>
            ))}

            {FEATURED_GOWNS.slice(2).map((gown, i) => (
              <motion.a
                key={gown.id}
                href="/shop"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.7, delay: i * 0.08 }}
                className="group col-span-1"
              >
                <div className="aspect-[3/4] overflow-hidden bg-[#efefef] relative">
                  <img
                    src={gown.image}
                    alt={gown.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1c1c1c]/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute bottom-0 inset-x-0 p-4 md:p-6 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
                    <h3 className="font-serif text-lg md:text-xl text-white font-light mb-1">
                      {gown.name}
                    </h3>
                    <span className="font-sans text-xs text-white/80">
                      ${gown.price.toLocaleString()}
                    </span>
                  </div>
                  <div className="absolute top-3 left-3 px-2 py-1 bg-white/90 flex items-center gap-1">
                    <VerifiedBadge className="w-2.5 h-2.5 text-[#1c1c1c]" />
                    <span className="font-sans text-[8px] font-light uppercase tracking-[0.06em] text-[#1c1c1c]/60">
                      Verified
                    </span>
                  </div>
                </div>
                <div className="pt-4">
                  <p className="font-sans text-[9px] font-light text-[#1c1c1c]/30 uppercase tracking-[0.12em] mb-1">
                    {gown.collection}
                  </p>
                  <h3 className="font-serif text-lg text-[#1c1c1c] font-light">
                    {gown.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-sans text-sm text-[#1c1c1c]">
                      ${gown.price.toLocaleString()}
                    </span>
                    <span className="font-sans text-xs text-[#1c1c1c]/25 line-through">
                      ${gown.originalPrice.toLocaleString()}
                    </span>
                  </div>
                </div>
              </motion.a>
            ))}
          </div>

          <div className="flex justify-center mt-16 md:mt-20">
            <Link
              href="/shop"
              className="px-16 py-5 bg-[#1c1c1c] text-white font-sans text-[11px] font-light uppercase tracking-[0.15em] hover:bg-[#333] transition-all duration-300"
            >
              Shop All Gowns
            </Link>
          </div>
        </div>
      </section>

      {/* ── BRAND STATEMENT ── */}
      <section className="relative py-32 md:py-44 bg-[#1c1c1c] text-white overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <p className="font-sans text-[11px] font-light uppercase tracking-[0.4em] text-white/30 mb-8">
              Our Promise
            </p>
            <h2 className="font-serif text-3xl md:text-6xl font-light tracking-[-0.02em] leading-[1.15] mb-10">
              Every gown on RE:GALIA has been <span className="italic">authenticated</span> by the House of Galia Lahav
            </h2>
            <p className="font-sans text-base text-white/40 leading-relaxed max-w-2xl mx-auto mb-14 font-light">
              We extend the life of couture masterpieces through circular luxury. Each piece is verified, restored, and presented with the same care as the day it left the atelier.
            </p>
            <Link
              href="/how-it-works"
              className="inline-block px-14 py-5 bg-white text-[#1c1c1c] font-sans text-[11px] font-light uppercase tracking-[0.15em] hover:bg-white/90 transition-all duration-300"
            >
              How It Works
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── HERITAGE ── */}
      <section className="bg-white py-28 md:py-40 border-t border-[#1c1c1c]/5">
        <div className="max-w-[85rem] mx-auto px-6 md:px-16 grid md:grid-cols-2 gap-10 md:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="order-2 md:order-1"
          >
            <div className="aspect-[3/4] overflow-hidden">
              <img
                src="https://www.galialahav.com/cdn/shop/files/GL_Couture_Atelier_1.jpg?width=1000"
                alt="The Atelier"
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="order-1 md:order-2"
          >
            <p className="font-sans text-[11px] font-light uppercase tracking-[0.4em] text-[#1c1c1c]/30 mb-8">
              Heritage & Craft
            </p>
            <h2 className="font-serif text-3xl md:text-5xl font-light text-[#1c1c1c] leading-tight mb-8 tracking-[-0.02em]">
              The Art of <br />
              <span className="italic">Galia Lahav</span>
            </h2>
            <p className="font-sans text-base text-[#1c1c1c]/45 leading-relaxed mb-10 font-light">
              For over three decades, the House of Galia Lahav has redefined bridal luxury. Each gown is a testament to meticulous craftsmanship, hand-sewn in our Tel Aviv atelier.
            </p>
            <div className="grid grid-cols-2 gap-10">
              <div>
                <p className="font-serif text-3xl text-[#1c1c1c] mb-2 italic font-light">100%</p>
                <p className="font-sans text-[10px] uppercase tracking-[0.12em] text-[#1c1c1c]/25 font-light">Atelier Authenticated</p>
              </div>
              <div>
                <p className="font-serif text-3xl text-[#1c1c1c] mb-2 italic font-light">Handmade</p>
                <p className="font-sans text-[10px] uppercase tracking-[0.12em] text-[#1c1c1c]/25 font-light">In Tel Aviv</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── SCROLL VIDEO ── */}
      <section className="relative bg-white py-20 md:py-32 px-6 border-t border-[#1c1c1c]/5">
        <div className="max-w-[85rem] mx-auto md:px-10">
          <div className="flex flex-col md:flex-row gap-12 md:gap-20 items-center">
            <div className="w-full md:w-1/2">
              <p className="font-sans text-[11px] font-light uppercase tracking-[0.4em] text-[#1c1c1c]/30 mb-8">
                The Experience
              </p>
              <h2 className="font-serif text-3xl md:text-5xl font-light text-[#1c1c1c] leading-[1.1] mb-8 tracking-[-0.02em]">
                Crafted to <br />
                <span className="italic">Experience Again</span>
              </h2>
              <p className="font-sans text-base text-[#1c1c1c]/45 leading-relaxed font-light max-w-md mb-10">
                Every Galia Lahav gown is a masterpiece born from thousands of hours of heritage.
                We ensure its story lives on through circular luxury.
              </p>
              <Link
                href="/how-it-works"
                className="inline-block font-sans text-[11px] font-light uppercase tracking-[0.15em] text-[#1c1c1c] border-b border-[#1c1c1c] pb-1 hover:opacity-60 transition-opacity"
              >
                Our Verification Process
              </Link>
            </div>

            <div className="w-full md:w-1/2 aspect-[3/4] relative overflow-hidden bg-[#efefef]">
              <div ref={scrollContainerRef} className="absolute inset-0 h-[300vh] -top-[100vh] pointer-events-none" />
              <canvas ref={canvasRef} className="w-full h-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-[#1c1c1c]/50 to-transparent flex items-end justify-between">
                <span className="font-sans text-[10px] font-light uppercase tracking-[0.12em] text-white/80">
                  Collection: Bleecker
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CONSIGN CTA ── */}
      <section className="bg-[#1c1c1c] text-white py-24 md:py-32">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="font-sans text-[11px] font-light uppercase tracking-[0.4em] text-white/30 mb-6">
            For Sellers
          </p>
          <h2 className="font-serif text-3xl md:text-5xl font-light tracking-[-0.02em] mb-8">
            Your Gown Deserves <span className="italic">a Second Chapter</span>
          </h2>
          <p className="font-sans text-base text-white/40 leading-relaxed max-w-xl mx-auto mb-12 font-light">
            List your Galia Lahav gown on the official marketplace. House-verified, globally visible, and handled with the care couture deserves.
          </p>
          <Link
            href="/sell"
            className="inline-block px-14 py-5 bg-white text-[#1c1c1c] font-sans text-[11px] font-light uppercase tracking-[0.15em] hover:bg-white/90 transition-all duration-300"
          >
            Consign Your Gown
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
