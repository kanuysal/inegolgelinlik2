"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import { getPublicFeaturedGowns } from "@/app/admin/actions";

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
  }, []);

  return (
    <main className="bg-background-light text-primary font-sans transition-colors duration-300 antialiased selection:bg-[#1c1c1c]/10 selection:text-[#1c1c1c] overflow-x-hidden">

      <Navbar />

      <header className="relative w-full h-screen overflow-hidden mb-12 group">
        <video ref={videoRef} autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
          <source src="/videos/hero.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/20"></div>
        <button
          onClick={toggleMute}
          className="absolute bottom-10 right-6 md:right-10 z-10 w-10 h-10 flex items-center justify-center bg-white/15 backdrop-blur-sm border border-white/20 text-white hover:bg-white/25 transition-all duration-300"
          aria-label={isMuted ? "Unmute" : "Mute"}
        >
          <span className="material-symbols-outlined text-lg">{isMuted ? "volume_off" : "volume_up"}</span>
        </button>
        <div className="absolute bottom-10 left-0 w-full text-center px-4 fade-in-up">
          <div className="mb-12 md:mb-16 flex justify-center">
            <Link href="/shop" className="bg-white text-gray-900 px-8 py-3 md:px-10 md:py-4 font-medium text-sm md:text-base uppercase tracking-widest hover:bg-gray-100 hover:scale-105 transition-all duration-300 shadow-xl flex items-center gap-3 group font-sans">
              Shop the Collection
              <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </Link>
          </div>
        </div>
      </header>

      <section className="py-20 px-6 max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-5xl font-medium leading-tight mb-6 text-gray-900 font-serif">
          Pre-loved elegance, curated perfection<br />and ceremony-ready.
        </h2>
        <p className="text-gray-600 text-lg">
          Discover the premier marketplace for authenticated Galia Lahav masterpieces.
        </p>
      </section>

      <section className="py-24 px-6 md:px-12 max-w-[1400px] mx-auto">
        <div className="text-center mb-20">
          <p className="text-[11px] uppercase tracking-[0.4em] text-gray-400 mb-4">The RE:GALIA Promise</p>
          <h2 className="text-4xl md:text-6xl font-normal leading-tight text-gray-900 font-serif">
            Verified Authenticity
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative group cursor-pointer">
            <div className="aspect-[3/4] overflow-hidden">
              <img alt="Close up of lace detail" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src="https://cdn.shopify.com/s/files/1/0839/7222/7357/files/BlancheM.jpg" />
            </div>
            <div className="mt-6">
              <h3 className="text-xl font-normal font-serif mb-2">Inspected Detail</h3>
              <p className="text-sm text-gray-400 leading-relaxed">Every bead, stitch, and layer of fabric is examined by our atelier team before listing.</p>
            </div>
          </div>
          <div className="relative group cursor-pointer mt-0 md:mt-16">
            <div className="aspect-[3/4] overflow-hidden">
              <img alt="Gown embellishment close-up" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src="https://cdn.shopify.com/s/files/1/0839/7222/7357/files/Gaia_1.jpg" />
            </div>
            <div className="mt-6">
              <h3 className="text-xl font-normal font-serif mb-2">Curated Quality</h3>
              <p className="text-sm text-gray-400 leading-relaxed">Only gowns that meet our condition standards are accepted into the collection.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Featured Gowns — Horizontal Scroll ── */}
      <section className="py-16 overflow-hidden">
        <div className="px-6 mb-12 flex flex-col md:flex-row justify-between items-end max-w-[1400px] mx-auto">
          <div>
            <h3 className="text-4xl md:text-5xl font-medium tracking-tight mb-2 font-serif">Featured Gowns</h3>
            <p className="text-gray-500">Timeless silhouettes, available now.</p>
          </div>
          <Link href="/shop" className="hidden md:block px-6 py-2 border border-gray-300 hover:bg-gray-100 transition text-sm uppercase tracking-wider text-black">
            View All
          </Link>
        </div>
        <div className="flex overflow-x-auto gap-6 px-6 pb-12 snap-x snap-mandatory" style={{ scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch" }}>
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

      <section className="relative py-32 px-6 overflow-hidden">
        <div className="absolute inset-0">
          <img alt="Road landscape background" className="w-full h-full object-cover grayscale brightness-50" src="/images/hiw/staircase.jpg" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto text-center text-white">
          <div className="flex justify-center mb-6">
            <span className="flex gap-2">
              <span className="w-2 h-2 bg-white rounded-full"></span>
              <span className="w-2 h-2 bg-white/50 rounded-full"></span>
            </span>
          </div>
          <h2 className="text-4xl md:text-6xl font-serif font-light leading-tight mb-8">
            Give Your Gown<br />a Second Story
          </h2>
          <Link href="/sell" className="inline-block px-8 py-3 border border-white/30 bg-white/10 backdrop-blur hover:bg-white hover:text-black transition duration-300 text-sm font-semibold tracking-wide text-white">
            Start Selling
          </Link>
        </div>
      </section>

      <section className="py-24 px-6 md:px-12 max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 order-2 lg:order-1">
            <h3 className="text-3xl md:text-5xl font-medium leading-tight mb-8 text-gray-900 font-serif">
              Discover a better way to love luxury, where heritage meets circularity.
            </h3>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Extending the life of couture gowns isn't just about value—it's about the story. Our verified marketplace ensures that every bead, stitch, and layer of tulle is preserved for its next grand entrance. With secure payments and white-glove shipping, your dream dress is closer than you think.
            </p>
            <Link href="/how-it-works" className="inline-block px-6 py-2 border border-gray-300 hover:bg-gray-100 transition text-sm uppercase tracking-wider text-black">
              Our Philosophy
            </Link>
          </div>
          <div className="lg:col-span-7 order-1 lg:order-2">
            <div className="relative overflow-hidden aspect-video">
              <img alt="Bridal atelier team working" className="w-full h-full object-cover" src="/images/hiw/veil.jpg" />
              <div className="absolute bottom-6 left-6 max-w-sm text-white drop-shadow-lg">
                <p className="text-xs uppercase tracking-widest mb-2">The Atelier Standard</p>
                <p className="text-sm opacity-90">Every gown is inspected by our team of expert seamstresses before listing.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

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
                <button className="bg-primary text-white px-8 py-3 text-sm font-medium hover:bg-gray-800 transition shadow-lg flex items-center justify-center gap-2 group whitespace-nowrap" type="submit">
                  Register
                  <span className="material-symbols-outlined text-xs group-hover:translate-x-1 transition-transform">arrow_forward</span>
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
