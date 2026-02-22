"use client";

import Link from "next/link";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";

export default function Home() {
  return (
    <main className="bg-background-light dark:bg-background-dark text-primary dark:text-gray-100 font-sans transition-colors duration-300 antialiased selection:bg-[#1c1c1c]/10 selection:text-[#1c1c1c] overflow-x-hidden">
      
      {/* ── Navbar is provided globally by layout or standard component, so we omit the raw Stitch nav here, but let's keep the hero structure ── */}
      <Navbar />

      <header className="relative w-full h-screen overflow-hidden rounded-b-2xl mb-12 group pt-20">
        <img alt="Bride in a luxury gown walking in a landscape" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuApOL6IabwRqinf4WUDEjX5XSfT-fwYCryqEFEwGEAPPFHul3jmtjdsATi0V4pn0v7qoS-fiS69OypjwRpdxKrTPiSsEGw85zt-hw7A_Y0audsValikskgao4-qhZckQmvwtvThvZClbU_hIjli730_PsyaB1kQkGkqNaIKurx9lKq66DdAF6kZ24KFRi5PMlJfy6S7Er9L2QkG0zu6PWzWZzREo6SmChZZbGsZuWQ3RHqnq7T739KOkhgZbGTz8AIKQNPFfes2nC79"/>
        <div className="absolute inset-0 bg-black/20 dark:bg-black/40"></div>
        <div className="absolute bottom-10 left-0 w-full text-center px-4 fade-in-up">
          <h1 className="text-white text-6xl md:text-8xl lg:text-9xl font-bold tracking-tight mb-4 drop-shadow-lg">
            Meet the Couture
          </h1>
          <div className="flex justify-between items-end w-full max-w-7xl mx-auto px-4 text-white/90">
            <span className="material-icons animate-bounce">arrow_downward</span>
            <span className="text-xs uppercase tracking-widest">Scroll to explore</span>
          </div>
        </div>
      </header>

      <section className="py-20 px-6 max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-5xl font-medium leading-tight mb-6 text-gray-900 dark:text-white">
          Pre-loved elegance, curated perfection<br/>and ceremony-ready.
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Discover the premier marketplace for authenticated Galia Lahav masterpieces.
        </p>
      </section>

      <section className="py-12 px-4 md:px-8 max-w-[1400px] mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-6xl md:text-8xl lg:text-[10rem] font-bold tracking-tighter leading-none text-gray-900 dark:text-white">
            Verified
          </h2>
          <h2 className="text-6xl md:text-8xl lg:text-[10rem] font-bold tracking-tighter leading-none text-gray-900 dark:text-white -mt-4 md:-mt-10 lg:-mt-16 relative z-10 mix-blend-overlay dark:mix-blend-normal">
            Authenticity
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
          <div className="relative group cursor-pointer">
            <div className="aspect-[4/3] rounded-xl overflow-hidden mb-4">
              <img alt="Close up of lace detail" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD26ERf7qdIwvqZsAGj3CgoSiRHdrhvyt0UM4U-XPsDdtGLzEETP1xuXzKGGORvUWAjKYvZbfI89znoKyb_jeClPVAVeo0xdY5fGjOJHAs7LDbo0J31hBVZ7f57IpEW6GEQyQ0mDCEeHKQk92dZ4dphYrYzpe45tTv-EmomWlBbjdrXyKh7GN07s8QJK1rau1DMFI6tUbUxr7lVPTjS2_lKa3O22mOmV4b_HhNNS2iEX5GKtJvKMB0HxuPND5poFLIM8CFH7CYd03IP"/>
            </div>
            <h3 className="text-3xl font-medium text-center text-white absolute bottom-10 left-0 right-0 drop-shadow-md">Inspected Detail</h3>
          </div>
          <div className="relative group cursor-pointer mt-0 md:mt-24">
            <div className="aspect-[4/3] rounded-xl overflow-hidden mb-4">
              <img alt="Gown silhouette in desert" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAXeTEcNmV8Mf5CYFHbd06II_JjZ59jGzoFcd3H4i1L5zDmRPslL5M8bAYKPXL3MpF1nt0zhmqQB2wycK7GQEXwR1eBR3A9gB8f_8qiZ2thMyewC208LhZwqbTox1LMCJEj0DzwS4gI8sfUr0tzpl6TyO8s3c5roy2DKo5KbVtYf0vWHr4vp1W0jmQsjD_t3wrZ4PjCvhNeHNSRRJ9iBN4tQl2I-1_aeA6Rzbgi2BfIPHPRsp2wMsOluFRXQfOnJVjSNdDCN7rf_0fr"/>
            </div>
            <h3 className="text-3xl font-medium text-center text-white absolute bottom-10 left-0 right-0 drop-shadow-md">Curated Quality</h3>
          </div>
        </div>
      </section>

      <section className="py-16 overflow-hidden">
        <div className="px-6 mb-12 flex flex-col md:flex-row justify-between items-end max-w-[1400px] mx-auto">
          <div>
            <h3 className="text-4xl md:text-5xl font-medium tracking-tight mb-2">Featured Gowns</h3>
            <p className="text-gray-500 dark:text-gray-400">Timeless silhouettes, available now.</p>
          </div>
          <Link href="/shop" className="hidden md:block px-6 py-2 rounded-full border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition text-sm uppercase tracking-wider text-black">
            View All Collection
          </Link>
        </div>
        <div className="flex overflow-x-auto gap-6 px-6 pb-12 no-scrollbar snap-x snap-mandatory">
          <Link href="/shop" className="min-w-[300px] md:min-w-[400px] snap-center group relative rounded-xl overflow-hidden h-[500px]">
            <img alt="Silk wedding dress" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDrSRGMoy4dMxNj1PQzw3nffo5wBOsvnze21R76OJXfIoPim-dBSVlMAH0xBwes67v0QawrvElOOcO-D-7zG7aBSKznr9JCdrj-vMiyoEIe4dFdUPOG_H-DVNFzD5TxDg_uP4bm79FzFkmnJgDqPUjKR__Tc1Ir1qFLJ2GQNhvFCv5_k2U9k0Tb4j_b69t0N5-CKRFPNoI6feMHRyJ0rxhDM2yPBSVxGskjGVF4z0Z9TYO7numZhzPBrlcoJxdtLfnoT1XrGO0IcTuj"/>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90"></div>
            <div className="absolute bottom-0 left-0 p-6 w-full text-white">
              <span className="bg-white/20 backdrop-blur-sm text-xs px-2 py-1 rounded mb-3 inline-block">New Arrival</span>
              <h4 className="text-2xl font-semibold mb-1">The Maya</h4>
              <p className="text-sm opacity-80 mb-4">Size 4 • Excellent Condition</p>
              <div className="flex justify-between items-center">
                <span className="font-medium">$4,200</span>
                <button className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0 duration-300">
                  <span className="material-icons text-sm">arrow_forward</span>
                </button>
              </div>
            </div>
          </Link>
          <Link href="/shop" className="min-w-[300px] md:min-w-[400px] snap-center group relative rounded-xl overflow-hidden h-[500px]">
            <img alt="Lace wedding dress back" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCJwCik15AN2javDp9pWFeRp4q5gkaj3x9kSLjaF9Qp9F_P78YJxHGmOU3Mittjhxwfacp90SFNsZCEuz_G25GWdg3goBfXhcNqeWp4T6S_NmGmEquwFZqT6xj5O8aUhiU9XxIjFU7K1Qutn1P_szkZ8xAQUSdwR-Di8OfPzkIjFPXlmCjp3l4P4K6DbQTEDP-OKBTr-VSEid3cTcIDWyQlztyIeDp8yhU_gUIgxgGXl8d-63WecgslirU3nPbR5m-w0ODeOP91ZqnN"/>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90"></div>
            <div className="absolute bottom-0 left-0 p-6 w-full text-white">
              <span className="bg-white/20 backdrop-blur-sm text-xs px-2 py-1 rounded mb-3 inline-block">Rare Find</span>
              <h4 className="text-2xl font-semibold mb-1">The Gala 802</h4>
              <p className="text-sm opacity-80 mb-4">Size 6 • Like New</p>
              <div className="flex justify-between items-center">
                <span className="font-medium">$5,800</span>
                <button className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0 duration-300">
                  <span className="material-icons text-sm">arrow_forward</span>
                </button>
              </div>
            </div>
          </Link>
          <Link href="/shop" className="min-w-[300px] md:min-w-[400px] snap-center group relative rounded-xl overflow-hidden h-[500px]">
            <img alt="Mermaid style gown" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA8Rnxxs4I0PPHJ0nx1CVmRQ8DR2XDjAgSPOR47y6-EPPAZukqthaJDFbqjnxEYKa1a7fkUjluih_Ampsbsct2IL1WRRDbiCdWjhcbRJmKGsFFECDbXuzw-dewnMB6td_7br2UnQ015t4GB7tODu2waTc2Efp-2C-P1nmvx0K_nBhYTBaIb3O0ylO-qthteB37H0xIG2dOdPqqFwFTqiAZIdA7m-zTnJEBMrnN4nXZlC9PMU2KS1II7HNyx3KHLzO7LefRB0OeYOlCd"/>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90"></div>
            <div className="absolute bottom-0 left-0 p-6 w-full text-white">
              <h4 className="text-2xl font-semibold mb-1">The Fabiana</h4>
              <p className="text-sm opacity-80 mb-4">Size 2 • Professionally Cleaned</p>
              <div className="flex justify-between items-center">
                <span className="font-medium">$6,100</span>
                <button className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0 duration-300">
                  <span className="material-icons text-sm">arrow_forward</span>
                </button>
              </div>
            </div>
          </Link>
        </div>
      </section>

      <section className="relative py-32 px-6 overflow-hidden">
        <div className="absolute inset-0">
          <img alt="Road landscape background" className="w-full h-full object-cover grayscale brightness-50 dark:brightness-40" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA7OOpQgP4ddYWDRzDcYV4pCom6NX3PjAOvfinaFf8CrFjG4xsqlunwCTjvspVkMetY85KW6XYuCdV4hvHKWtwSPY3SKwoh76O3GdYmOOdOgKpaxgnU1vHc09XgcrjfTXoPV8uzk9seszkmAg06gpA_WqK1G-vJ9MTu9fF6gJyZf09mYuzqZhwmC8Q7uoFHxQRgbrHkgeabWiSPcCe8TEKoMh7YCUFSJgEgHF4oi9J-s39rHf-copwPfxJ871r17SIXdl7Y_OqwM2-9"/>
        </div>
        <div className="relative z-10 max-w-4xl mx-auto text-center text-white">
          <div className="flex justify-center mb-6">
            <span className="flex gap-2">
              <span className="w-2 h-2 bg-white rounded-full"></span>
              <span className="w-2 h-2 bg-white/50 rounded-full"></span>
            </span>
          </div>
          <h2 className="text-4xl md:text-6xl font-medium leading-tight mb-8">
            The Journey Continues<br/>with a Seamless Resale.
          </h2>
          <Link href="/sell" className="inline-block px-8 py-3 text-black rounded-full border border-white/30 bg-white/10 backdrop-blur hover:bg-white hover:text-black transition duration-300 text-sm font-semibold tracking-wide text-white">
            Start Selling
          </Link>
        </div>
      </section>

      <section className="py-24 px-6 md:px-12 max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 order-2 lg:order-1">
            <h3 className="text-3xl md:text-5xl font-medium leading-tight mb-8 text-gray-900 dark:text-white">
              Discover a better way to love luxury, where heritage meets circularity.
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
              Extending the life of couture gowns isn't just about value—it's about the story. Our verified marketplace ensures that every bead, stitch, and layer of tulle is preserved for its next grand entrance. With secure payments and white-glove shipping, your dream dress is closer than you think.
            </p>
            <Link href="/how-it-works" className="inline-block px-6 py-2 rounded-full border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition text-sm uppercase tracking-wider text-black">
              Our Philosophy
            </Link>
          </div>
          <div className="lg:col-span-7 order-1 lg:order-2">
            <div className="relative rounded-2xl overflow-hidden aspect-video">
              <img alt="Bridal atelier team working" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDhcLCbNt46OFJp1unwdLAP5CBX_XNbzji-Dzv1asj3WSXe34Qtm-K_q4sdhfhHqmX01_yRiyby2GjtxKVOYupegwUYf4wFUJf2g1TQpyHB4vXinHnPhrelJdWxHCEj2uOFJAaNQIDSypiiz8EnJg6juhFnsThEew-d2Esam6AzlciGrnlEMSphYdJ_lhM-JCA5vNUcRO-bmL3e0DM4MCNkr4SEM3T30g-vRT2Wyj54qCEXSye5AJGSqeIZEebtYk1pfAKnnlUIkuxi"/>
              <div className="absolute bottom-6 left-6 max-w-sm text-white drop-shadow-lg">
                <p className="text-xs uppercase tracking-widest mb-2">The Atelier Standard</p>
                <p className="text-sm opacity-90">Every gown is inspected by our team of expert seamstresses before listing.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-[1400px] mx-auto bg-surface-light dark:bg-surface-dark rounded-2xl overflow-hidden relative">
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "radial-gradient(#999 1px, transparent 1px)", backgroundSize: "20px 20px" }}></div>
          <div className="flex flex-col lg:flex-row">
            <div className="lg:w-1/2 p-10 md:p-16 flex flex-col justify-center relative z-10">
              <p className="text-xs uppercase tracking-widest text-gray-500 mb-4">Stay in the loop</p>
              <h3 className="text-3xl md:text-4xl font-medium mb-6 leading-tight text-gray-900 dark:text-white">
                New arrivals, authentication tips, and bridal inspiration — find it in our newsletter.
              </h3>
              <form className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                <input className="bg-white dark:bg-black border-0 rounded-full px-6 py-3 text-sm focus:ring-2 focus:ring-gray-400 w-full shadow-sm text-gray-900 dark:text-white placeholder-gray-400" placeholder="name@email.com" type="email"/>
                <button className="bg-primary text-white rounded-full px-8 py-3 text-sm font-medium hover:bg-gray-800 transition shadow-lg flex items-center justify-center gap-2 group whitespace-nowrap" type="submit">
                  Register
                  <span className="material-icons text-xs group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </button>
              </form>
            </div>
            <div className="lg:w-1/2 h-64 lg:h-auto relative">
              <img alt="Bridal landscape" className="absolute inset-0 w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAcNNxmRqZIEzT15YsKadOe1MVPv5tsVWcqyp_Im3atFKEUQKTCEzNsqx23VZRwKr2-_BbNWVPDTa66DC8BDgeyzLYuEcgzWRacs9E210HsXZtNbc-KYyEcIDI_NkOqqRC8AYLM7TYlO6IPqg-iLSulzvQGvLMSIMSjL1MvqwNIMbaRSToXWgF83ojYddAAp9t7mM5A4KtW1_iNd6O5QVeQrE9McAlS9dHZHZDMUm8K_nQTLXk-sWne_msQQEi6rutblG2zD97qbklG"/>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </main>
  );
}
