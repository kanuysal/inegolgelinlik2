"use client";

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

/**
 * ONLINE COUTURE PAGE
 * Synthesized from minalidya.wedding/online-couture.html
 */
export default function OnlineCouturePage() {

  useEffect(() => {
    if (typeof window === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    // Parallax and Reveal animations
    gsap.from('.step-card', {
        y: 100,
        opacity: 0,
        duration: 1.2,
        stagger: 0.3,
        ease: "power4.out",
        scrollTrigger: {
            trigger: ".steps-grid",
            start: "top 80%",
        }
    });

    return () => {
        ScrollTrigger.getAll().forEach(st => st.kill());
    };
  }, []);

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* ── 1. HERO SECTION ── */}
      <section className="relative h-[100vh] w-full overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <video 
            autoPlay 
            muted 
            loop 
            playsInline 
            className="w-full h-full object-cover"
          >
            <source src="/videos/online-couture.mp4" type="video/mp4" />
          </video>
        </div>

        <div className="relative z-10 text-center px-6">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, ease: [0.19, 1, 0.22, 1] }}
            className="font-serif text-6xl md:text-8xl lg:text-9xl tracking-tighter mb-4 text-white mix-blend-difference selection:bg-white selection:text-black"
          >
            ONLINE COUTURE
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="font-sans text-sm md:text-base uppercase tracking-[0.5em] font-light"
          >
            Sınırları Aşan Özel Dikim Deneyimi
          </motion.p>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="mt-12 text-3xl animate-bounce"
          >
            ↓
          </motion.div>
        </div>
      </section>

      {/* ── 2. THE PROCESS (BRIDGING THE DISTANCE) ── */}
      <section className="py-32 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-24">
            <span className="text-[10px] font-bold tracking-[0.4em] text-[#B76E79] uppercase block mb-4">Sürecimiz</span>
            <h2 className="font-serif text-4xl md:text-6xl text-[#1c1c1c]">Mesafeleri Ortadan Kaldırıyoruz</h2>
        </div>

        <div className="steps-grid grid md:grid-cols-3 gap-12">
          {/* Step 1 */}
          <div className="step-card group">
            <div className="aspect-[3/4] overflow-hidden mb-8 relative border border-[#1c1c1c]/5">
              <img src="/images/wedding/13.webp" alt="Consultation" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
            </div>
            <h3 className="font-serif text-2xl mb-4 tracking-tight uppercase">01. KONSÜLTASYON</h3>
            <p className="font-sans text-[14px] text-[#1c1c1c]/50 leading-relaxed font-light">
              Vizyonunuzu, stilinizi ve kumaş tercihlerinizi tartışmak için uzman tasarımcılarımızla gerçekleştireceğiniz özel bir video görüşme.
            </p>
          </div>

          {/* Step 2 */}
          <div className="step-card group">
            <div className="aspect-[3/4] overflow-hidden mb-8 relative border border-[#1c1c1c]/5">
              <img src="/images/wedding/4.webp" alt="Measurement" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
            </div>
            <h3 className="font-serif text-2xl mb-4 tracking-tight uppercase">02. ÖLÇÜ ALIMI</h3>
            <p className="font-sans text-[14px] text-[#1c1c1c]/50 leading-relaxed font-light">
              Kıyafetinizin üzerinize kusursuz bir şekilde oturmasını sağlamak için kapsamlı bir ölçü alım seansında size rehberlik ediyoruz.
            </p>
          </div>

          {/* Step 3 */}
          <div className="step-card group">
            <div className="aspect-[3/4] overflow-hidden mb-8 relative border border-[#1c1c1c]/5">
              <img src="/images/wedding/14.webp" alt="Creation" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
            </div>
            <h3 className="font-serif text-2xl mb-4 tracking-tight uppercase">03. ÜRETİM</h3>
            <p className="font-sans text-[14px] text-[#1c1c1c]/50 leading-relaxed font-light">
              Bursa'daki atölyemizde ustalarımız elbisenizi titizlikle işlerken, her aşamada sizi bilgilendiriyor ve detayları paylaşıyoruz.
            </p>
          </div>
        </div>
      </section>

      {/* ── 3. SEO / CONTENT BLOCK ── */}
      <section className="bg-[#fafafa] py-32 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-12">
            <span className="text-[10px] font-bold tracking-[0.4em] text-[#B76E79] uppercase">Dijital Atölye</span>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-7xl text-[#1c1c1c] leading-tight">Yüksek Moda Sınır Tanımaz</h2>
            <div className="space-y-8 font-sans text-lg md:text-xl text-[#1c1c1c]/70 font-light leading-relaxed">
                <p>
                    Sınırların silindiği bir çağda, Mina Lidya lüksün özünü yeniden tanımlıyor. Özel bir atölyenin samimiyetini doğrudan sizin dünyanıza taşıyoruz.
                </p>
                <p>
                    Rafine edilmiş sanal konsültasyon sürecimiz sayesinde, usta terzilerimiz ölçü alım sürecinin her aşamasında size eşlik ederek kusursuzluğu garanti ediyor.
                </p>
            </div>
        </div>
      </section>

      {/* ── 4. CALL TO ACTION ── */}
      <section className="py-48 px-6 text-center">
        <div className="max-w-3xl mx-auto space-y-12">
            <h3 className="font-serif text-4xl md:text-6xl text-[#1c1c1c] tracking-tight italic uppercase">Düşleriniz, Bizim Zanaatımız</h3>
            <p className="font-sans text-lg text-[#1c1c1c]/50 font-light">
                Yolculuğunuza başlamaya hazır mısınız? Bugün özel konsültasyonunuzu rezerve edin.
            </p>
            <div className="pt-6">
                <a 
                    href="/appointment" 
                    className="inline-block py-6 px-16 bg-[#1c1c1c] text-white font-sans text-[12px] font-bold uppercase tracking-[0.3em] hover:bg-[#B76E79] transition-all duration-500 shadow-2xl"
                >
                    RANDEVU ALIN
                </a>
            </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
