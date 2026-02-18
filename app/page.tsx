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
import Footer from "@/components/ui/Footer";

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

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const currentFrameRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  /* ── Canvas Frame Preloading ── */
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
    const images: HTMLImageElement[] = [];
    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = `${FRAME_PREFIX}${padFrame(i)}${FRAME_EXT}`;
      img.onload = () => {
        loaded++;
        if (loaded === TOTAL_FRAMES) {
          setIsLoading(false);
          drawFrame(0);
        }
      };
      images.push(img);
    }
    imagesRef.current = images;
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
    <main className="relative bg-silk selection:bg-gold-muted/20 selection:text-obsidian overflow-x-hidden">
      <Navbar />

      {/* ── SECTION 1: HERO ── */}
      <section className="relative h-[110vh] flex flex-col items-center justify-center px-6 overflow-hidden bg-obsidian text-silk">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="text-center z-10 max-w-5xl"
        >
          <p className="font-sans text-[10px] font-bold uppercase tracking-[0.5em] text-gold-muted/80 mb-8">
            Official Marketplace
          </p>
          <h1 className="font-serif text-[clamp(3.5rem,10vw,10rem)] leading-[0.85] tracking-tighter mb-12">
            The Eternal Life <br />
            <span className="italic">of Couture</span>
          </h1>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-6">
            <Link
              href="/shop"
              className="px-12 py-5 bg-[#C5A059] text-white font-sans text-[11px] font-bold uppercase tracking-[0.3em] rounded-full hover:bg-[#B38E48] transition-all duration-500 min-w-[240px] shadow-[0_10px_30px_rgba(197,160,89,0.4)]"
            >
              Explore Shop
            </Link>
            <Link
              href="/sell"
              className="px-12 py-5 border border-silk/20 text-silk font-sans text-[11px] font-bold uppercase tracking-[0.3em] rounded-full hover:bg-white/5 transition-all duration-500 min-w-[240px]"
            >
              Consign Gown
            </Link>
          </div>
        </motion.div>

        {/* Hero Background Elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-obsidian/20 to-obsidian opacity-60" />
          <img
            src="/frames/frame_150.jpg"
            alt="Bridal Couture"
            className="w-full h-full object-cover opacity-40 scale-105"
          />
        </div>
      </section>

      {/* ── SECTION 1.5: HERITAGE & MISSION ── */}
      <section className="bg-silk py-40 px-6 border-b border-black/5">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-24 items-center">
          <div className="order-2 md:order-1">
            <div className="aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl">
              <img
                src="https://www.galialahav.com/cdn/shop/files/GL_Couture_Atelier_1.jpg?width=1000"
                alt="The Atelier"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="order-1 md:order-2">
            <p className="font-sans text-[10px] font-bold uppercase tracking-[0.5em] text-gold-muted mb-8">
              Heritage & Craft
            </p>
            <h2 className="font-serif text-5xl md:text-7xl font-light text-obsidian leading-tight mb-8">
              The Art of <br />
              <span className="italic">Galia Lahav</span>
            </h2>
            <p className="font-sans text-lg text-obsidian/60 leading-relaxed mb-10">
              For over three decades, the House of Galia Lahav has redefined bridal luxury. Each gown is a testament to meticulous craftsmanship, hand-sewn in our Tel Aviv atelier by master artisans who pour hundreds of hours into every stitch.
            </p>
            <div className="grid grid-cols-2 gap-10">
              <div>
                <p className="font-serif text-3xl text-obsidian mb-2 italic">100%</p>
                <p className="font-sans text-[9px] uppercase tracking-widest text-obsidian/40 font-bold">Atelier Authenticated</p>
              </div>
              <div>
                <p className="font-serif text-3xl text-obsidian mb-2 italic">Handmade</p>
                <p className="font-sans text-[9px] uppercase tracking-widest text-obsidian/40 font-bold">In Tel Aviv</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-obsidian text-silk py-40 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          <p className="font-sans text-[10px] font-bold uppercase tracking-[0.5em] text-gold-muted mb-8">
            Our Commitment
          </p>
          <h2 className="font-serif text-5xl md:text-8xl font-light tracking-tight mb-12">
            Circular <span className="italic">Luxury</span>
          </h2>
          <p className="font-sans text-xl text-silk/60 leading-relaxed max-w-3xl mb-16">
            RE:GALIA is born from a desire to preserve the legacy of couture while embracing a sustainable future. By extending the life of these masterpieces, we celebrate the enduring beauty of exceptional design and reduce the environmental footprint of the bridal industry.
          </p>
          <Link
            href="/how-it-works"
            className="px-12 py-5 bg-[#C5A059] text-white font-sans text-[11px] font-bold uppercase tracking-[0.3em] rounded-full hover:bg-[#B38E48] transition-all duration-500 shadow-[0_10px_30px_rgba(197,160,89,0.4)]"
          >
            Learn About Circularity
          </Link>
        </div>
      </section>

      {/* ── SECTION 2: THE BRIDE SCROLL VIDEO ── */}
      <section className="relative bg-silk py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-20 items-center">
            <div className="w-full md:w-1/2">
              <p className="font-sans text-[10px] font-bold uppercase tracking-[0.5em] text-gold-muted mb-8">
                The Experience
              </p>
              <h2 className="font-serif text-5xl md:text-7xl font-light text-obsidian leading-[1.1] mb-10">
                Crafted to <br />
                <span className="italic">Experience Again</span>
              </h2>
              <p className="font-sans text-lg text-obsidian/60 leading-relaxed font-medium max-w-md mb-12">
                Every Galia Lahav gown is a masterpiece of тысячи hours of heritage.
                We ensure its story lives on through circular luxury.
              </p>
              <Link
                href="/how-it-works"
                className="inline-block pb-1 border-b-[1.5px] border-gold-muted font-sans text-[10px] font-bold uppercase tracking-[0.3em] text-obsidian hover:text-gold-muted transition-colors"
              >
                Our Verification Process
              </Link>
            </div>

            {/* The Scrolling Video Frame */}
            <div className="w-full md:w-1/2 aspect-[4/5] relative rounded-[3rem] overflow-hidden bg-obsidian/[0.03] shadow-2xl">
              <div ref={scrollContainerRef} className="absolute inset-0 h-[300vh] -top-[100vh] pointer-events-none" />
              <canvas
                ref={canvasRef}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 p-10 bg-gradient-to-t from-obsidian/40 to-transparent flex items-end justify-between">
                <span className="font-sans text-[9px] font-bold uppercase tracking-[0.4em] text-white/80">
                  Collection: Bleecker
                </span>
                <div className="w-1.5 h-1.5 rounded-full bg-gold-muted animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 3: PRODUCT GRID (Pouch Style) ── */}
      <section className="relative bg-silk pb-40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between mb-20 border-b border-black/5 pb-10">
            <h2 className="font-serif text-4xl md:text-6xl font-light text-obsidian tracking-tight">
              Featured Masterpieces
            </h2>
            <Link
              href="/shop"
              className="font-sans text-[10px] font-bold uppercase tracking-[0.4em] text-gold-muted hover:text-obsidian transition-colors"
            >
              View All
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
            {SAMPLE_GOWNS.map((gown, i) => (
              <motion.a
                key={gown.id}
                href={`/shop/${gown.id}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, delay: i * 0.1 }}
                className="group flex flex-col"
              >
                <div className="aspect-[3/4] rounded-[2.5rem] overflow-hidden bg-obsidian/[0.03] mb-8 relative">
                  <img
                    src={gown.image}
                    alt={gown.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                  />
                  {gown.verified && (
                    <div className="absolute top-6 left-6 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full flex items-center gap-2 shadow-sm">
                      <VerifiedBadge className="w-3 h-3 text-gold-muted" />
                      <span className="font-sans text-[8px] font-bold uppercase tracking-widest text-obsidian/60">
                        Verified
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-obsidian/0 group-hover:bg-obsidian/5 transition-colors duration-500" />
                </div>
                <div className="flex flex-col items-center text-center">
                  <p className="font-sans text-[9px] font-bold text-obsidian/30 uppercase tracking-[0.3em] mb-2">
                    {gown.collection}
                  </p>
                  <h3 className="font-serif text-2xl text-obsidian mb-3 italic">
                    {gown.name}
                  </h3>
                  <div className="flex items-center gap-4">
                    <span className="font-sans text-sm font-bold text-obsidian">
                      ${gown.price.toLocaleString()}
                    </span>
                    <span className="font-sans text-xs text-obsidian/20 line-through">
                      ${gown.originalPrice.toLocaleString()}
                    </span>
                  </div>
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
