"use client";

import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

/**
 * APPOINTMENT PAGE
 * Synthesized from minalidya.wedding/contact.html
 * Featuring Horizontal Parallax Gallery and Elite Contact Cards.
 */
export default function AppointmentPage() {
  const horizontalSectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    const section = horizontalSectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    // Main Horizontal Scroll
    const totalWidth = track.scrollWidth;
    const scrollAmount = totalWidth - window.innerWidth;

    const ctx = gsap.context(() => {
      const tween = gsap.to(track, {
        x: -scrollAmount,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${totalWidth}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
        }
      });

      // Parallax Items Logic
      const items = track.querySelectorAll('.gallery-item');
      items.forEach((item) => {
        const speed = parseFloat((item as HTMLElement).dataset.speed || "1");
        if (speed === 1) return;
        
        gsap.to(item, {
          x: () => (1 - speed) * (totalWidth * 0.1),
          ease: "none",
          scrollTrigger: {
            trigger: section,
            containerAnimation: tween,
            start: "left right",
            end: "right left",
            scrub: true
          }
        });
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <main className="min-h-screen bg-white selection:bg-[#B76E79] selection:text-white">
      <Navbar />

      {/* ── 0. HORIZONTAL PARALLAX GALLERY ── */}
      <section ref={horizontalSectionRef} className="relative h-screen overflow-hidden bg-[#fafafa]">
        <div ref={trackRef} className="flex h-full items-center gap-[15vw] px-[10vw] relative will-change-transform">
          
          {/* Floating Titles */}
          <div 
            className="absolute left-[5vw] top-[25vh] z-10 pointer-events-none mix-blend-difference"
            style={{ fontSize: '15vh' }}
          >
            <h2 className="font-serif text-[#1c1c1c] opacity-5 tracking-tighter">CONTACT</h2>
          </div>

          {[
            { src: "/images/wedding/1.webp", size: "w-[40vw] h-[60vh]", speed: "0.5", layer: "back" },
            { src: "/images/wedding/3.webp", size: "w-[25vw] h-[40vh]", speed: "1.5", layer: "front" },
            { src: "/images/wedding/5.webp", size: "w-[30vw] h-[50vh]", speed: "1.0", layer: "mid" },
            { src: "/images/wedding/8.webp", size: "w-[45vw] h-[35vh]", speed: "0.8", layer: "back" },
            { src: "/images/wedding/12.webp", size: "w-[35vw] h-[55vh]", speed: "1.3", layer: "front" },
            { src: "/images/wedding/14.webp", size: "w-[20vw] h-[30vh]", speed: "0.6", layer: "back" }
          ].map((item, i) => (
            <div 
              key={i}
              className={`gallery-item relative flex-shrink-0 flex items-center justify-center ${item.size}`}
              data-speed={item.speed}
            >
              <div className="w-full h-full overflow-hidden shadow-2xl grayscale hover:grayscale-0 transition-all duration-1000">
                <img 
                  src={item.src} 
                  alt="Wedding" 
                  className="w-full h-full object-cover scale-110 hover:scale-100 transition-transform duration-1000" 
                />
              </div>
            </div>
          ))}

          <div 
            className="absolute right-[5vw] bottom-[25vh] z-10 pointer-events-none mix-blend-difference"
            style={{ fontSize: '18vh' }}
          >
            <h2 className="font-serif text-[#1c1c1c] opacity-5 tracking-tighter">RENDEZVOUS</h2>
          </div>
        </div>
      </section>

      {/* ── 1. SENTENCE REVEAL ── */}
      <section className="py-24 px-6 md:py-48 max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="font-serif text-3xl md:text-5xl lg:text-7xl leading-tight text-[#1c1c1c]">
            Hayalinizdeki gelinlik ve gece kıyafetleri ya da ihtiyacınız olan destek için, <span className="italic text-[#B76E79]">video konferans</span> veya mağaza ziyareti ile bize ulaşın. Hayalinizi beraber tasarlayalım.
          </h2>
        </motion.div>
      </section>

      {/* ── 2. ELITE CONTACT CARDS ── */}
      <section className="pb-32 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12">
          
          {/* BURSA CARD */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-12 border border-black/5 flex flex-col items-center text-center space-y-8 hover:bg-[#fafafa] transition-colors duration-500"
          >
            <span className="text-[10px] font-bold tracking-[0.4em] text-[#B76E79]">TÜRKİYE</span>
            <h3 className="font-serif text-4xl uppercase tracking-tighter">BURSA / İNEGÖL</h3>
            <p className="font-sans text-[#1c1c1c]/50 text-sm tracking-wide leading-relaxed">
              Kasım Efendi Caddesi No.25A <br />İnegöl, Bursa
            </p>
            <div className="flex flex-col gap-4 w-full pt-8">
               <a href="https://wa.me/905421131641" target="_blank" className="py-4 border border-black/10 text-[10px] font-bold tracking-[0.2em] flex items-center justify-center gap-3 transition-all hover:bg-black hover:text-white">
                  <span className="material-symbols-outlined text-sm">chat</span> +90 542 113 16 41
               </a>
               <a href="mailto:store@minalidya.com" className="py-4 border border-black/10 text-[10px] font-bold tracking-[0.2em] flex items-center justify-center gap-3 transition-all hover:bg-black hover:text-white">
                  <span className="material-symbols-outlined text-sm">mail</span> STORE@MINALIDYA.COM
               </a>
            </div>
          </motion.div>

          {/* ALCOY CARD */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-12 border border-black/5 flex flex-col items-center text-center space-y-8 hover:bg-[#fafafa] transition-colors duration-500"
          >
            <span className="text-[10px] font-bold tracking-[0.4em] text-[#B76E79]">SPAIN</span>
            <h3 className="font-serif text-4xl uppercase tracking-tighter">ALCOY / ALICANTE</h3>
            <p className="font-sans text-[#1c1c1c]/50 text-sm tracking-wide leading-relaxed">
              Mina Lidya Novias <br />Alcoy, Alicante
            </p>
            <div className="flex flex-col gap-4 w-full pt-8">
               <a href="https://wa.me/34632623300" target="_blank" className="py-4 border border-black/10 text-[10px] font-bold tracking-[0.2em] flex items-center justify-center gap-3 transition-all hover:bg-black hover:text-white">
                  <span className="material-symbols-outlined text-sm">chat</span> +34 632 623 300
               </a>
               <a href="mailto:novias@minalidya.es" className="py-4 border border-black/10 text-[10px] font-bold tracking-[0.2em] flex items-center justify-center gap-3 transition-all hover:bg-black hover:text-white">
                  <span className="material-symbols-outlined text-sm">mail</span> NOVIAS@MINALIDYA.ES
               </a>
            </div>
          </motion.div>

        </div>
      </section>

      <Footer />
    </main>
  );
}
