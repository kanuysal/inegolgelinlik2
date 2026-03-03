"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import { getPublicFeaturedGowns } from "@/app/admin/actions";
import { getApprovedListings } from "@/app/shop/actions";
import { thumb } from "@/lib/image";

const DEFAULT_FEATURED = [
  { id: '1', title: 'The Maya', subtitle: 'Size 4 • Excellent Condition', price: '$4,200', image_url: 'https://cdn.shopify.com/s/files/1/0839/7222/7357/files/Maya_side.jpg', link: '/shop' },
  { id: '2', title: 'The Gala 802', subtitle: 'Size 6 • Like New', price: '$5,800', image_url: 'https://cdn.shopify.com/s/files/1/0839/7222/7357/files/Nora_2.jpg', link: '/shop' },
  { id: '3', title: 'The Fabiana', subtitle: 'Size 2 • Professionally Cleaned', price: '$6,100', image_url: 'https://cdn.shopify.com/s/files/1/0839/7222/7357/files/FABIANAB.jpg', link: '/shop' },
  { id: '4', title: 'The Lorena', subtitle: 'Size 8 • Pristine Condition', price: '$7,500', image_url: 'https://cdn.shopify.com/s/files/1/0839/7222/7357/files/Lorena_-_Studio_-_Ai.jpg', link: '/shop' },
  { id: '5', title: 'The Blanche', subtitle: 'Size 4 • Worn Once', price: '$5,200', image_url: 'https://cdn.shopify.com/s/files/1/0839/7222/7357/files/BlancheM.jpg', link: '/shop' },
  { id: '6', title: 'The Gaia', subtitle: 'Size 6 • Like New', price: '$8,900', image_url: 'https://cdn.shopify.com/s/files/1/0839/7222/7357/files/Gaia_1.jpg', link: '/shop' },
];

export default function Home() {
  const [featuredGowns, setFeaturedGowns] = useState(DEFAULT_FEATURED);
  const [listings, setListings] = useState<any[]>([]);
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
    getPublicFeaturedGowns().then((data) => {
      if (data && data.length > 0) {
        setFeaturedGowns(data);
      }
    });
    getApprovedListings()
      .then((data) => {
        if (data && data.length > 0) {
          setListings(data.slice(0, 20));
        }
      })
      .catch(() => {})
      .finally(() => setListingsLoading(false));
  }, []);

  return (
    <main className="bg-background-light text-primary font-sans transition-colors duration-300 antialiased selection:bg-[#1c1c1c]/10 selection:text-[#1c1c1c] overflow-x-hidden">

      <Navbar />

      {/* ── Hero ── */}
      <header className="relative w-full h-screen overflow-hidden group">
        <video ref={videoRef} autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
          <source src="/videos/hero.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
        <div className="absolute bottom-12 left-6 md:left-10 z-10 text-white max-w-lg">
          <p className="text-[10px] md:text-[11px] uppercase tracking-[0.4em] text-white/60 mb-3">Galia Lahav</p>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif font-light leading-tight mb-4">
            Our Official<br />Resale Marketplace
          </h1>
          <p className="text-sm text-white/60 mb-6 max-w-sm">
            Authenticated pre-loved gowns, curated for their next grand entrance.
          </p>
          <Link href="/shop" className="inline-flex items-center gap-3 bg-white text-gray-900 px-8 py-3 md:px-10 md:py-4 font-medium text-sm uppercase tracking-widest hover:bg-gray-100 hover:scale-105 transition-all duration-300 shadow-xl group font-sans">
            Shop Now
            <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform" style={{ fontVariationSettings: "'wght' 200" }}>arrow_forward</span>
          </Link>
        </div>
        <button
          onClick={toggleMute}
          className="absolute bottom-6 right-6 md:right-10 z-10 w-10 h-10 flex items-center justify-center bg-white/15 backdrop-blur-sm border border-white/20 text-white hover:bg-white/25 transition-all duration-300"
          aria-label={isMuted ? "Unmute" : "Mute"}
        >
          <span className="material-symbols-outlined text-lg">{isMuted ? "volume_off" : "volume_up"}</span>
        </button>
      </header>

      {/* ── Featured Gowns — Horizontal Scroll ── */}
      <section className="py-10 overflow-hidden">
        <div className="px-6 mb-8 flex flex-col md:flex-row justify-between items-end max-w-[1400px] mx-auto">
          <div>
            <h3 className="text-4xl md:text-5xl font-medium tracking-tight mb-2 font-serif">Featured Gowns</h3>
            <p className="text-gray-500">Timeless silhouettes, available now.</p>
          </div>
          <Link href="/shop" className="hidden md:block px-6 py-2 border border-gray-300 hover:bg-gray-100 transition text-sm uppercase tracking-wider text-black">
            View All
          </Link>
        </div>
        <div className="flex overflow-x-auto gap-6 px-6 pb-6 snap-x snap-mandatory" style={{ scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch" }}>
          {featuredGowns.map((gown) => (
            <Link key={gown.id} href={gown.link || "/shop"} className="min-w-[300px] md:min-w-[380px] snap-center group relative overflow-hidden h-[500px] flex-shrink-0">
              <img alt={`${gown.title} Gown`} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src={gown.image_url} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90"></div>
              <div className="absolute bottom-0 left-0 p-6 w-full text-white">
                <h4 className="text-2xl font-semibold mb-1">{gown.title}</h4>
                {gown.subtitle && <p className="text-sm opacity-80 mb-4">{gown.subtitle}</p>}
                {gown.price && <span className="font-medium">{gown.price}</span>}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Marketplace — Scrollable Grid ── */}
      <section className="pt-6 pb-2 px-4 md:px-8 max-w-[1600px] mx-auto">
        <div className="flex justify-between items-end mb-6">
          <div>
            <p className="text-[11px] uppercase tracking-[0.4em] text-gray-400 mb-2">Just Listed</p>
            <h3 className="text-3xl md:text-5xl font-medium tracking-tight font-serif">New Arrivals</h3>
          </div>
          {listings.length > 0 && (
            <p className="text-[11px] text-gray-400 uppercase tracking-[0.3em]">
              {listings.length} gowns
            </p>
          )}
        </div>

        {listingsLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-slate-200"></div>
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/3 mt-3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : listings.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-5">
              {listings.map((listing: any) => {
                const image = thumb(listing.images?.[0] || listing.products?.images?.[0]);
                const price = listing.price;
                const msrp = listing.msrp || listing.products?.msrp;
                const conditionMap: Record<string, string> = {
                  new_unworn: "New Never Worn",
                  excellent: "Excellent",
                  good: "Good",
                };
                return (
                  <Link href={`/shop/${listing.id}`} key={listing.id}>
                    <div className="group relative flex flex-col bg-white border border-slate-200 overflow-hidden transition-all hover:border-slate-400 h-full">
                      <div className="aspect-[3/4] overflow-hidden relative bg-slate-100">
                        <img
                          alt={listing.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          src={image}
                          loading="lazy"
                        />
                      </div>
                      <div className="p-2.5 md:p-3 flex flex-col flex-grow">
                        <div className="mb-1.5">
                          <div className="flex justify-between items-start mb-0.5">
                            <h3 className="text-base md:text-lg font-normal tracking-tight font-serif text-[#1c1c1c]">{listing.title}</h3>
                            {listing.size_us && (
                              <span className="text-[10px] md:text-xs font-bold text-[#1c1c1c]/60 uppercase tracking-tighter">
                                SIZE {listing.size_us}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] md:text-[11px] text-[#1c1c1c]/60 uppercase tracking-widest">
                            {listing.products?.style_name || listing.category || "Couture"}
                          </p>
                        </div>
                        <div className="mt-auto pt-2 border-t border-slate-100">
                          <p className="text-[10px] md:text-[11px] text-[#1c1c1c]/60 uppercase tracking-widest mb-0.5">
                            {conditionMap[listing.condition] || "Excellent"}
                          </p>
                          <div className="flex items-baseline gap-1.5 md:gap-2">
                            <p className="text-base md:text-lg font-bold tracking-tight text-[#1c1c1c]">
                              ${price?.toLocaleString()}
                            </p>
                            {msrp && msrp > price && (
                              <p className="text-xs md:text-sm text-[#1c1c1c]/30 line-through">
                                ${msrp.toLocaleString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
        ) : (
          <p className="text-center text-gray-400 py-12">No gowns available right now. Check back soon.</p>
        )}

        <div className="text-center py-10">
          <Link href="/shop" className="inline-flex items-center gap-3 px-12 py-4 bg-primary text-white text-sm font-semibold uppercase tracking-widest hover:bg-gray-800 transition-all duration-300 shadow-lg">
            View Full Collection
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'wght' 200" }}>arrow_forward</span>
          </Link>
        </div>
      </section>

      {/* ── Sell CTA ── */}
      <section className="relative py-32 px-6 overflow-hidden">
        <div className="absolute inset-0">
          <img alt="Bridal background" className="w-full h-full object-cover" src="/images/hiw/banner.jpg" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl md:text-6xl font-serif font-light leading-tight mb-8">
            Give Your Gown<br />a Second Story
          </h2>
          <Link href="/how-it-works" className="inline-block px-8 py-3 border border-white bg-white text-[#1c1c1c] hover:bg-white/90 transition duration-300 text-sm font-semibold tracking-wide">
            Start Selling
          </Link>
        </div>
      </section>

      {/* ── Newsletter ── */}
      <section className="py-20 px-6">
        <div className="max-w-[1400px] mx-auto bg-surface-light overflow-hidden relative">
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "radial-gradient(#999 1px, transparent 1px)", backgroundSize: "20px 20px" }}></div>
          <div className="flex flex-col lg:flex-row">
            <div className="lg:w-1/2 p-10 md:p-16 flex flex-col justify-center relative z-10">
              <p className="text-xs uppercase tracking-widest text-gray-500 mb-4">Stay in the loop</p>
              <h3 className="text-3xl md:text-4xl font-medium mb-6 leading-tight text-gray-900 font-serif">
                New arrivals, authentication tips, and bridal inspiration — find it in our newsletter.
              </h3>
              <form className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                <input className="bg-white border-0 px-6 py-3 text-sm focus:ring-2 focus:ring-gray-400 w-full shadow-sm text-gray-900 placeholder-gray-400" placeholder="name@email.com" type="email" />
                <button className="bg-[#1c1c1c] text-white px-8 py-3 text-sm font-medium hover:bg-[#1c1c1c]/90 transition shadow-lg flex items-center justify-center gap-2 group whitespace-nowrap" type="submit">
                  Register
                  <span className="material-symbols-outlined text-xs group-hover:translate-x-1 transition-transform" style={{ fontVariationSettings: "'wght' 200" }}>arrow_forward</span>
                </button>
              </form>
            </div>
            <div className="lg:w-1/2 h-64 lg:h-auto relative">
              <img alt="Bridal landscape" className="absolute inset-0 w-full h-full object-cover" src="/images/hiw/convertible.jpg" />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
