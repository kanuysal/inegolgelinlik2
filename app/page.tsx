"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import { fetchProducts, getImageUrl, MinaLidyaProduct } from "@/lib/minalidya-api";
import { thumb, PLACEHOLDER_IMG } from "@/lib/image";
import { InlineLoadingSpinner } from "@/components/ui/LoadingSpinner";
import RingSection from "@/components/ui/RingSection";
import RibbonSection from "@/components/ui/RibbonSection";
import HorizontalVideoGallery from "@/components/ui/HorizontalVideoGallery";

export default function Home() {
  const [listings, setListings] = useState<MinaLidyaProduct[]>([]);
  const [listingsLoading, setListingsLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  useEffect(() => {
    fetchProducts()
      .then((data) => {
        if (data && data.length > 0) {
          const featured = data.filter(l => {
              const productCats = Array.isArray(l.category) ? l.category : (l.category ? [l.category] : []);
              const allCats = [...productCats, ...(l.categories || [])].map(c => c.toLowerCase());
              return allCats.includes('gelinlik') || allCats.includes('tesettur-gelinlik');
          }).slice(0, 20);
          setListings(featured);
        }
      })
      .catch(() => {})
      .finally(() => setListingsLoading(false));
  }, []);

  const HERO_SLOGANS = [
    { 
      title: "Hayallerinizi Gerçeğe Dönüştürüyoruz", 
      subtitle: "Usta işçilik ve modern tasarımın buluştuğu lüks gelinlik koleksiyonlarımızı keşfedin." 
    },
    { 
      title: "Valencia Atelier Tasarımları", 
      subtitle: "Akdeniz'in özgür ruhu ve İspanyol esintileriyle harmanlanmış couture mirası." 
    },
    { 
      title: "İnegöl Mağaza Uzmanlığı", 
      subtitle: "Yarım asırlık terzilik tecrübesi ve kişiye özel dikim sanatının eşsiz buluşması." 
    },
    { 
      title: "Kına ve Modern Organizasyonlar", 
      subtitle: "Geleneksel motifleri çağdaş çizgilerle buluşturan zarif ve modern tasarımlar." 
    }
  ];

  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % HERO_SLOGANS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <main className="bg-background-light text-primary font-sans transition-colors duration-300 antialiased selection:bg-[#B76E79]/10 selection:text-[#B76E79] overflow-x-hidden">

      <Navbar />

      {/* ── Hero ── */}
      <header className="relative w-full h-screen overflow-hidden group">
        <video 
          ref={videoRef} 
          autoPlay 
          muted 
          loop 
          playsInline 
          className="absolute inset-0 w-full h-full object-cover"
          style={{ 
            maskImage: 'linear-gradient(to bottom, black 0%, black 70%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 70%, transparent 100%)'
          }}
        >
          <source src="/videos/hero-lookbook.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-transparent opacity-50"></div>
        <div className="absolute bottom-12 left-6 md:left-10 z-10 text-white max-w-4xl mix-blend-difference">
          <p className="text-[10px] md:text-[11px] uppercase tracking-[0.4em] text-white/90 mb-4 font-bold">Mina Lidya Bridal</p>
          
          <AnimatePresence mode="wait">
            <motion.div key={heroIndex} className="space-y-6">
              <h1 className="text-4xl md:text-7xl lg:text-8xl font-serif font-light leading-[1.1] flex flex-wrap gap-x-[0.3em] text-white">
                {HERO_SLOGANS[heroIndex].title.split(" ").map((word, wordIdx) => (
                  <span key={wordIdx} className="inline-block whitespace-nowrap">
                    {word.split("").map((char, charIdx) => (
                      <motion.span
                        key={charIdx}
                        initial={{ opacity: 0, filter: "blur(10px)", y: 20 }}
                        animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                        transition={{
                          duration: 0.8,
                          delay: (wordIdx * 5 + charIdx) * 0.02,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        className="inline-block"
                      >
                        {char}
                      </motion.span>
                    ))}
                  </span>
                ))}
              </h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 1 }}
                className="text-sm md:text-base text-white/90 max-w-md leading-relaxed"
              >
                {HERO_SLOGANS[heroIndex].subtitle}
              </motion.p>
            </motion.div>
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 1 }}
            className="mt-8"
          >
            <Link href="/shop" className="inline-flex items-center gap-4 bg-white text-gray-900 px-8 py-4 md:px-12 md:py-5 font-bold text-xs uppercase tracking-[0.3em] hover:mix-blend-difference transition-all duration-500 shadow-2xl group font-sans">
              KOLEKSİYONU KEŞFET
              <span className="material-symbols-outlined text-sm group-hover:translate-x-2 transition-transform" style={{ fontVariationSettings: "'wght' 200" }}>arrow_forward</span>
            </Link>
          </motion.div>
        </div>
        <button
          onClick={toggleMute}
          className="absolute bottom-6 right-6 md:right-10 z-10 w-10 h-10 flex items-center justify-center bg-white/15 backdrop-blur-sm border border-white/20 text-white hover:bg-white/25 transition-all duration-300"
          aria-label={isMuted ? "Sesi Aç" : "Sesi Kapat"}
        >
          <span className="material-symbols-outlined text-lg">{isMuted ? "volume_off" : "volume_up"}</span>
        </button>
      </header>

      {/* ── Ring Section — Intro Animation ── */}
      <RingSection />

      {/* ── Featured Section — Overlapping Grid Style ── */}
      <section className="py-20 px-4 md:px-10 max-w-[1400px] mx-auto">
        <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="md:w-1/2 relative">
                <div className="aspect-[4/5] bg-neutral overflow-hidden shadow-2xl relative">
                    <video 
                        autoPlay 
                        muted 
                        loop 
                        playsInline 
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 hover:scale-105"
                    >
                        <source src="/videos/featured-video.mp4" type="video/mp4" />
                    </video>
                </div>
                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-[#B76E79] hidden md:flex items-center justify-center text-white p-4 text-center text-[10px] uppercase tracking-widest font-bold">
                    İnegöl Mağaza - Valencia Atelier
                </div>
            </div>
            <div className="md:w-1/2 space-y-6">
                <p className="text-[11px] uppercase tracking-[0.4em] text-[#B76E79]">Zerafetin Adresi</p>
                <h2 className="text-4xl md:text-6xl font-serif font-light leading-tight">Mina Lidya Couture Deneyimi</h2>
                <p className="text-gray-600 leading-relaxed max-w-md">
                    Valencia'dan gelen İspanyol esintileri ve Anadolu'nun bin yıllık tekstil mirasını harmanlayarak, her gelin için eşsiz bir hikaye yazıyoruz. Online Couture hizmetimizle mesafeleri kaldırıyoruz.
                </p>
                <div className="pt-4">
                    <Link href="/about" className="text-sm font-bold uppercase tracking-widest border-b-[2px] border-[#B76E79] pb-1 hover:text-[#B76E79] transition-colors">
                        HAKKIMIZDA DAHA FAZLASI
                    </Link>
                </div>
            </div>
        </div>
      </section>

      {/* ── Marketplace — Scrollable Grid ── */}
      <section className="py-20 px-4 md:px-8 max-w-[1600px] mx-auto border-t border-neutral">
        <div className="flex justify-between items-end mb-12">
          <div>
            <p className="text-[11px] uppercase tracking-[0.4em] text-[#B76E79] mb-2 font-bold">Bridal Premiere</p>
            <h3 className="text-3xl md:text-5xl font-medium tracking-tight font-serif">Son Eklenen Gelinlikler</h3>
          </div>
          {listings.length > 0 && (
            <p className="text-[11px] text-[#1c1c1c]/50 uppercase tracking-[0.3em] font-medium font-sans">
              {listings.length} ÖZEL TASARIM
            </p>
          )}
        </div>

        {listingsLoading ? (
          <div className="py-20">
            <InlineLoadingSpinner size="lg" />
          </div>
        ) : listings.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
              {listings.map((listing: MinaLidyaProduct) => {
                const image = listing.images?.[0] ? getImageUrl(listing.images[0]) : PLACEHOLDER_IMG;

                return (
                  <Link href={`/shop/${listing.slug || listing.id}`} key={listing.id}>
                    <div className="group relative flex flex-col bg-white overflow-hidden transition-all duration-500 h-full">
                      <div className="aspect-[3/4] overflow-hidden relative bg-slate-100">
                        <img
                          alt={listing.productName || listing.name || "Mina Lidya Model"}
                          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                          src={thumb(image, 800)}
                          loading="lazy"
                          onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMG; }}
                        />
                        {listing.isModest && (
                          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 shadow-sm">
                            <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#B76E79]">TESETTÜR</span>
                          </div>
                        )}
                      </div>
                      <div className="pt-6 pb-2 flex flex-col items-center text-center">
                        <p className="text-[10px] text-[#B76E79] uppercase tracking-[0.25em] mb-2 font-bold">
                            {Array.isArray(listing.category) ? listing.category[0] : (listing.category || "Bridal Couture")}
                        </p>
                        <h3 className="text-xl font-normal tracking-tight font-serif text-[#1c1c1c] mb-3">
                            {listing.productName || listing.name || "Yeni Model"}
                        </h3>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
        ) : (
          <p className="text-center text-gray-400 py-20 font-light">Şu an gösterilecek ürün bulunamadı. Lütfen daha sonra tekrar kontrol edin.</p>
        )}

        <div className="text-center py-20">
          <Link href="/shop" className="inline-flex items-center gap-4 px-12 py-5 bg-[#1c1c1c] text-white text-[12px] font-bold uppercase tracking-[0.25em] hover:bg-[#B76E79] transition-all duration-500 shadow-2xl group">
            TÜM KOLEKSİYONU GÖR
            <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform" style={{ fontVariationSettings: "'wght' 200" }}>arrow_forward</span>
          </Link>
        </div>
      </section>

      <RibbonSection />

      {/* ── Marquee Video Gallery ── */}
      <HorizontalVideoGallery />

      {/* ── Newsletter — Premium Style ── */}


      <Footer />
    </main>
  );
}
