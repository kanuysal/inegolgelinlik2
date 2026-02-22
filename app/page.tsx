"use client";

import Link from "next/link";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";

export default function Home() {
  return (
    <main className="bg-background-light text-primary font-sans transition-colors duration-300 antialiased selection:bg-[#1c1c1c]/10 selection:text-[#1c1c1c] overflow-x-hidden">

      <Navbar />

      <header className="relative w-full h-screen overflow-hidden rounded-b-2xl mb-12 group">
        <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
          <source src="/videos/hero.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute bottom-10 left-0 w-full text-center px-4 fade-in-up">
          <h1 className="text-white text-6xl md:text-8xl lg:text-9xl font-bold tracking-tight mb-6 drop-shadow-lg">
            Meet the Couture
          </h1>
          <div className="mb-12 md:mb-16 flex justify-center">
            <Link href="/shop" className="bg-white text-gray-900 px-8 py-3 md:px-10 md:py-4 rounded-full font-medium text-sm md:text-base uppercase tracking-widest hover:bg-gray-100 hover:scale-105 transition-all duration-300 shadow-xl flex items-center gap-3 group">
              Shop the Collection
              <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </Link>
          </div>
          <div className="flex justify-between items-end w-full max-w-7xl mx-auto px-4 text-white/90">
            <span className="material-symbols-outlined animate-bounce">arrow_downward</span>
            <span className="text-xs uppercase tracking-widest">Scroll to explore</span>
          </div>
        </div>
      </header>

      <section className="py-20 px-6 max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-5xl font-medium leading-tight mb-6 text-gray-900">
          Pre-loved elegance, curated perfection<br />and ceremony-ready.
        </h2>
        <p className="text-gray-600 text-lg">
          Discover the premier marketplace for authenticated Galia Lahav masterpieces.
        </p>
      </section>

      <section className="py-12 px-4 md:px-8 max-w-[1400px] mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-6xl md:text-8xl lg:text-[10rem] font-bold tracking-tighter leading-none text-gray-900">
            Verified
          </h2>
          <h2 className="text-6xl md:text-8xl lg:text-[10rem] font-bold tracking-tighter leading-none text-gray-900 -mt-4 md:-mt-10 lg:-mt-16 relative z-10 mix-blend-overlay">
            Authenticity
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
          <div className="relative group cursor-pointer">
            <div className="aspect-[4/3] rounded-xl overflow-hidden mb-4">
              <img alt="Close up of lace detail" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" src="https://cdn.shopify.com/s/files/1/0839/7222/7357/files/BlancheM.jpg" />
            </div>
            <h3 className="text-3xl font-medium text-center text-white absolute bottom-10 left-0 right-0 drop-shadow-md">Inspected Detail</h3>
          </div>
          <div className="relative group cursor-pointer mt-0 md:mt-24">
            <div className="aspect-[4/3] rounded-xl overflow-hidden mb-4">
              <img alt="Gown silhouette in desert" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" src="https://cdn.shopify.com/s/files/1/0839/7222/7357/files/Gaia_1.jpg" />
            </div>
            <h3 className="text-3xl font-medium text-center text-white absolute bottom-10 left-0 right-0 drop-shadow-md">Curated Quality</h3>
          </div>
        </div>
      </section>

      {/* ── Featured Gowns — Horizontal Scroll ── */}
      <section className="py-16 overflow-hidden">
        <div className="px-6 mb-12 flex flex-col md:flex-row justify-between items-end max-w-[1400px] mx-auto">
          <div>
            <h3 className="text-4xl md:text-5xl font-medium tracking-tight mb-2">Featured Gowns</h3>
            <p className="text-gray-500">Timeless silhouettes, available now.</p>
          </div>
          <Link href="/shop" className="hidden md:block px-6 py-2 rounded-full border border-gray-300 hover:bg-gray-100 transition text-sm uppercase tracking-wider text-black">
            View All Collection
          </Link>
        </div>
        <div className="flex overflow-x-auto gap-6 px-6 pb-12 snap-x snap-mandatory" style={{ scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch" }}>
          {/* Card 1 */}
          <Link href="/shop" className="min-w-[300px] md:min-w-[380px] snap-center group relative rounded-xl overflow-hidden h-[500px] flex-shrink-0">
            <img alt="The Maya Gown" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src="https://cdn.shopify.com/s/files/1/0839/7222/7357/files/Maya_side.jpg" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90"></div>
            <div className="absolute bottom-0 left-0 p-6 w-full text-white">
              <span className="bg-white/20 backdrop-blur-sm text-xs px-2 py-1 rounded mb-3 inline-block">New Arrival</span>
              <h4 className="text-2xl font-semibold mb-1">The Maya</h4>
              <p className="text-sm opacity-80 mb-4">Size 4 • Excellent Condition</p>
              <div className="flex justify-between items-center">
                <span className="font-medium">$4,200</span>
                <span className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </span>
              </div>
            </div>
          </Link>
          {/* Card 2 */}
          <Link href="/shop" className="min-w-[300px] md:min-w-[380px] snap-center group relative rounded-xl overflow-hidden h-[500px] flex-shrink-0">
            <img alt="The Gala 802 Gown" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src="https://cdn.shopify.com/s/files/1/0839/7222/7357/files/Nora_2.jpg" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90"></div>
            <div className="absolute bottom-0 left-0 p-6 w-full text-white">
              <span className="bg-white/20 backdrop-blur-sm text-xs px-2 py-1 rounded mb-3 inline-block">Rare Find</span>
              <h4 className="text-2xl font-semibold mb-1">The Gala 802</h4>
              <p className="text-sm opacity-80 mb-4">Size 6 • Like New</p>
              <div className="flex justify-between items-center">
                <span className="font-medium">$5,800</span>
                <span className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </span>
              </div>
            </div>
          </Link>
          {/* Card 3 */}
          <Link href="/shop" className="min-w-[300px] md:min-w-[380px] snap-center group relative rounded-xl overflow-hidden h-[500px] flex-shrink-0">
            <img alt="The Fabiana Gown" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src="https://cdn.shopify.com/s/files/1/0839/7222/7357/files/FABIANAB.jpg" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90"></div>
            <div className="absolute bottom-0 left-0 p-6 w-full text-white">
              <h4 className="text-2xl font-semibold mb-1">The Fabiana</h4>
              <p className="text-sm opacity-80 mb-4">Size 2 • Professionally Cleaned</p>
              <div className="flex justify-between items-center">
                <span className="font-medium">$6,100</span>
                <span className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </span>
              </div>
            </div>
          </Link>
          {/* Card 4 */}
          <Link href="/shop" className="min-w-[300px] md:min-w-[380px] snap-center group relative rounded-xl overflow-hidden h-[500px] flex-shrink-0">
            <img alt="The Lorena Gown" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src="https://cdn.shopify.com/s/files/1/0839/7222/7357/files/Lorena_-_Studio_-_Ai.jpg" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90"></div>
            <div className="absolute bottom-0 left-0 p-6 w-full text-white">
              <span className="bg-white/20 backdrop-blur-sm text-xs px-2 py-1 rounded mb-3 inline-block">Editor&apos;s Pick</span>
              <h4 className="text-2xl font-semibold mb-1">The Lorena</h4>
              <p className="text-sm opacity-80 mb-4">Size 8 • Pristine Condition</p>
              <div className="flex justify-between items-center">
                <span className="font-medium">$7,500</span>
                <span className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </span>
              </div>
            </div>
          </Link>
          {/* Card 5 */}
          <Link href="/shop" className="min-w-[300px] md:min-w-[380px] snap-center group relative rounded-xl overflow-hidden h-[500px] flex-shrink-0">
            <img alt="The Blanche Gown" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src="https://cdn.shopify.com/s/files/1/0839/7222/7357/files/BlancheM.jpg" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90"></div>
            <div className="absolute bottom-0 left-0 p-6 w-full text-white">
              <span className="bg-white/20 backdrop-blur-sm text-xs px-2 py-1 rounded mb-3 inline-block">Just Listed</span>
              <h4 className="text-2xl font-semibold mb-1">The Blanche</h4>
              <p className="text-sm opacity-80 mb-4">Size 4 • Worn Once</p>
              <div className="flex justify-between items-center">
                <span className="font-medium">$5,200</span>
                <span className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </span>
              </div>
            </div>
          </Link>
          {/* Card 6 */}
          <Link href="/shop" className="min-w-[300px] md:min-w-[380px] snap-center group relative rounded-xl overflow-hidden h-[500px] flex-shrink-0">
            <img alt="The Gaia Gown" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src="https://cdn.shopify.com/s/files/1/0839/7222/7357/files/Gaia_1.jpg" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90"></div>
            <div className="absolute bottom-0 left-0 p-6 w-full text-white">
              <span className="bg-white/20 backdrop-blur-sm text-xs px-2 py-1 rounded mb-3 inline-block">Rare Find</span>
              <h4 className="text-2xl font-semibold mb-1">The Gaia</h4>
              <p className="text-sm opacity-80 mb-4">Size 6 • Like New</p>
              <div className="flex justify-between items-center">
                <span className="font-medium">$8,900</span>
                <span className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </span>
              </div>
            </div>
          </Link>
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
          <h2 className="text-4xl md:text-6xl font-medium leading-tight mb-8">
            The Journey Continues<br />with a Seamless Resale.
          </h2>
          <Link href="/sell" className="inline-block px-8 py-3 rounded-full border border-white/30 bg-white/10 backdrop-blur hover:bg-white hover:text-black transition duration-300 text-sm font-semibold tracking-wide text-white">
            Start Selling
          </Link>
        </div>
      </section>

      <section className="py-24 px-6 md:px-12 max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 order-2 lg:order-1">
            <h3 className="text-3xl md:text-5xl font-medium leading-tight mb-8 text-gray-900">
              Discover a better way to love luxury, where heritage meets circularity.
            </h3>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Extending the life of couture gowns isn't just about value—it's about the story. Our verified marketplace ensures that every bead, stitch, and layer of tulle is preserved for its next grand entrance. With secure payments and white-glove shipping, your dream dress is closer than you think.
            </p>
            <Link href="/how-it-works" className="inline-block px-6 py-2 rounded-full border border-gray-300 hover:bg-gray-100 transition text-sm uppercase tracking-wider text-black">
              Our Philosophy
            </Link>
          </div>
          <div className="lg:col-span-7 order-1 lg:order-2">
            <div className="relative rounded-2xl overflow-hidden aspect-video">
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
        <div className="max-w-[1400px] mx-auto bg-surface-light rounded-2xl overflow-hidden relative">
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "radial-gradient(#999 1px, transparent 1px)", backgroundSize: "20px 20px" }}></div>
          <div className="flex flex-col lg:flex-row">
            <div className="lg:w-1/2 p-10 md:p-16 flex flex-col justify-center relative z-10">
              <p className="text-xs uppercase tracking-widest text-gray-500 mb-4">Stay in the loop</p>
              <h3 className="text-3xl md:text-4xl font-medium mb-6 leading-tight text-gray-900">
                New arrivals, authentication tips, and bridal inspiration — find it in our newsletter.
              </h3>
              <form className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                <input className="bg-white border-0 rounded-full px-6 py-3 text-sm focus:ring-2 focus:ring-gray-400 w-full shadow-sm text-gray-900 placeholder-gray-400" placeholder="name@email.com" type="email" />
                <button className="bg-primary text-white rounded-full px-8 py-3 text-sm font-medium hover:bg-gray-800 transition shadow-lg flex items-center justify-center gap-2 group whitespace-nowrap" type="submit">
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
