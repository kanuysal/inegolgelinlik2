"use client";

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

/**
 * CONTACT PAGE
 * Synthesized from minalidya.wedding/contact.html
 */
export default function ContactPage() {

  useEffect(() => {
    if (typeof window === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    // Fade up animations
    gsap.from('.contact-card', {
        y: 60,
        opacity: 0,
        duration: 1.2,
        stagger: 0.3,
        ease: "power4.out",
        scrollTrigger: {
            trigger: ".contact-grid",
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

      {/* ── HERO SECTION ── */}
      <section className="relative h-[60vh] flex flex-col items-center justify-center text-center px-6 border-b border-[#1c1c1c]/5">
        <div className="space-y-6">
            <motion.span 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[10px] uppercase tracking-[0.6em] text-[#B76E79] font-bold"
            >
                BİZE ULAŞIN
            </motion.span>
            <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="font-serif text-6xl md:text-8xl text-[#1c1c1c] tracking-tighter italic"
            >
                Rendezvous
            </motion.h1>
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="max-w-xl mx-auto font-sans text-sm md:text-base text-[#1c1c1c]/40 font-light leading-relaxed"
            >
                Hayalinizdeki elbiseyi birlikte tasarlamak için sizi mağazalarımıza veya sanal atölyemize bekliyoruz.
            </motion.p>
        </div>
      </section>

      {/* ── CONTACT GRID ── */}
      <section className="py-32 px-6 max-w-7xl mx-auto">
        <div className="contact-grid grid md:grid-cols-2 gap-12 md:gap-24">
            
            {/* Bursa / Türkiye */}
            <div className="contact-card space-y-12 p-12 bg-[#fafafa] border border-[#1c1c1c]/5 hover:border-[#B76E79]/20 transition-all duration-500">
                <div className="space-y-4">
                    <h2 className="font-serif text-4xl text-[#1c1c1c]">Bursa / Türkiye</h2>
                    <p className="font-sans text-sm text-[#1c1c1c]/50 leading-relaxed font-light">
                        Kasım Efendi Caddesi No.25A<br />İnegöl, Bursa
                    </p>
                </div>
                
                <div className="flex flex-col gap-6">
                    <a href="https://wa.me/905421131641" target="_blank" className="flex items-center gap-4 group">
                        <div className="w-12 h-12 rounded-full border border-[#1c1c1c]/10 flex items-center justify-center group-hover:bg-[#1c1c1c] group-hover:text-white transition-all duration-500">
                            <span className="material-symbols-outlined text-sm">chat</span>
                        </div>
                        <span className="font-sans text-[12px] font-bold tracking-widest text-[#1c1c1c]">+90 542 113 16 41</span>
                    </a>
                    <a href="mailto:store@minalidya.com" className="flex items-center gap-4 group">
                        <div className="w-12 h-12 rounded-full border border-[#1c1c1c]/10 flex items-center justify-center group-hover:bg-[#1c1c1c] group-hover:text-white transition-all duration-500">
                            <span className="material-symbols-outlined text-sm">mail</span>
                        </div>
                        <span className="font-sans text-[12px] font-bold tracking-widest text-[#1c1c1c]">store@minalidya.com</span>
                    </a>
                </div>
                
                <div className="pt-6">
                    <a 
                        href="https://maps.google.com" 
                        target="_blank"
                        className="text-[10px] font-bold uppercase tracking-[0.3em] pb-1 border-b border-[#B76E79] text-[#B76E79]"
                    >
                        HARİTADA GÖRÜNTÜLE
                    </a>
                </div>
            </div>

            {/* Valencia / İspanya */}
            <div className="contact-card space-y-12 p-12 bg-[#fafafa] border border-[#1c1c1c]/5 hover:border-[#B76E79]/20 transition-all duration-500">
                <div className="space-y-4">
                    <h2 className="font-serif text-4xl text-[#1c1c1c]">Valencia / İspanya</h2>
                    <p className="font-sans text-sm text-[#1c1c1c]/50 leading-relaxed font-light">
                        Mina Lidya Novias<br />Design Studio & Atelier
                    </p>
                </div>
                
                <div className="flex flex-col gap-6">
                    <a href="https://wa.me/34632623300" target="_blank" className="flex items-center gap-4 group">
                        <div className="w-12 h-12 rounded-full border border-[#1c1c1c]/10 flex items-center justify-center group-hover:bg-[#1c1c1c] group-hover:text-white transition-all duration-500">
                            <span className="material-symbols-outlined text-sm">chat</span>
                        </div>
                        <span className="font-sans text-[12px] font-bold tracking-widest text-[#1c1c1c]">+34 632 623 300</span>
                    </a>
                    <a href="mailto:novias@minalidya.es" className="flex items-center gap-4 group">
                        <div className="w-12 h-12 rounded-full border border-[#1c1c1c]/10 flex items-center justify-center group-hover:bg-[#1c1c1c] group-hover:text-white transition-all duration-500">
                            <span className="material-symbols-outlined text-sm">mail</span>
                        </div>
                        <span className="font-sans text-[12px] font-bold tracking-widest text-[#1c1c1c]">novias@minalidya.es</span>
                    </a>
                </div>

                <div className="pt-6">
                    <a 
                        href="https://instagram.com/minalidyanovias" 
                        target="_blank"
                        className="text-[10px] font-bold uppercase tracking-[0.3em] pb-1 border-b border-[#B76E79] text-[#B76E79]"
                    >
                        INSTAGRAM @MINALIDYANOVIAS
                    </a>
                </div>
            </div>

        </div>
      </section>

      {/* ── MAP / IMAGE SECTION ── */}
      <section className="px-6 py-24 bg-[#fafafa]">
        <div className="max-w-7xl mx-auto aspect-[16/6] grayscale overflow-hidden shadow-2xl">
            <img src="/images/hiw/banner.jpg" alt="Atelier" className="w-full h-full object-cover" />
        </div>
      </section>

      <Footer />
    </main>
  );
}
