"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#fafafa]">
      <Navbar />

      {/* ── HERO ── */}
      <section className="relative h-[70vh] flex flex-col items-center justify-center text-center px-6">
        <motion.span 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[10px] uppercase tracking-[0.6em] text-[#1a1a1a]/40 mb-6"
        >
          HİKAYEMİZ & MİRASIMIZ
        </motion.span>
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="font-serif text-6xl md:text-8xl lg:text-9xl text-[#1c1c1c] tracking-tighter leading-none"
        >
          Mina Lidya <br />
          <span className="italic font-light text-[#B76E79]/80">Couture</span>
        </motion.h1>
      </section>

      {/* ── MANIFESTO ── */}
      <section className="py-24 px-6 max-w-7xl mx-auto border-t border-black/[0.03]">
        <div className="grid lg:grid-cols-2 gap-20 items-start">
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="font-serif text-4xl md:text-5xl lg:text-6xl text-[#1c1c1c] leading-[1.1] leading-tight italic"
          >
            "Bilim ve sanatın, Anadolu mirasıyla buluştuğu naif bir dokunuş."
          </motion.h2>
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8 text-lg md:text-xl text-[#1c1c1c]/70 font-light leading-relaxed"
          >
            <p>
              Mina Lidya, sadece bir modaevi değil; doktoralı tekstil mühendisleri, vizyoner stilistler ve usta tasarımcıların ortak tutkusundan doğan elit bir yaklaşımdır. Güzelliğe bilimsel bir titizlikle yaklaşıyor, her dikişi bir sanat eseri disipliniyle kurguluyoruz.
            </p>
            <p>
              Kadim Anadolu mirasının zerafetini, Akdeniz'in özgürlükçü ve tutkulu ruhuyla sentezleyerek; modern kadının en özel anlarına naif birer hatıra bırakıyoruz.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── IMAGE BREAK ── */}
      <section className="px-6 py-12">
        <div className="aspect-[21/9] w-full overflow-hidden grayscale hover:grayscale-0 transition-all duration-1000">
           <img 
            src="/images/hiw/staircase.jpg" 
            alt="Mina Lidya Atelier" 
            className="w-full h-full object-cover"
           />
        </div>
      </section>

      {/* ── ATELIER BRIDGE ── */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-24 items-center">
          <div className="space-y-12">
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#B76E79] mb-4">İNEGÖL & VALENCIA</h3>
              <h2 className="font-serif text-4xl md:text-5xl text-[#1c1c1c]">Sınırları Aşan Bir Zanaat Köprüsü</h2>
            </div>
            <div className="space-y-6 text-[#1c1c1c]/60 leading-relaxed font-light">
              <p>
                Bursa’nın tarihi tekstil başkenti İnegöl’deki üretim atölyemiz ile İspanya, Valencia’nın kalbindeki tasarım ofisimiz arasında eşsiz bir köprü kuruyoruz. Geleneksel zanaat yeteneklerimizi, global haute couture standartlarıyla harmanlıyoruz.
              </p>
              <p>
                İnegöl Store ve Mağazamız, yerel dokuyu elit bir sunumla buluştururken; Valencia’daki tasarım stüdyomuz koleksiyonlarımıza Avrupa’nın sofistike çizgisini katıyor. Üretimimizi öz kaynaklarımızla, hiçbir kaliteden ödün vermeden kendi bünyemizde gerçekleştiriyoruz.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div className="aspect-[3/4] overflow-hidden">
                <img src="/images/hiw/bride-step1.jpg" alt="Detail" className="w-full h-full object-cover grayscale" />
             </div>
             <div className="aspect-[3/4] overflow-hidden translate-y-12">
                <img src="/images/hiw/bride-step2.jpg" alt="Detail" className="w-full h-full object-cover" />
             </div>
          </div>
        </div>
      </section>

      {/* ── KINA ORGANİZASYON ── */}
      <section className="py-32 px-6 bg-[#1c1c1c] text-white overflow-hidden relative">
         <div className="absolute top-0 right-0 w-1/3 h-full opacity-10">
            <img src="/images/hiw/banner.jpg" alt="Kına" className="w-full h-full object-cover" />
         </div>
         <div className="max-w-4xl relative z-10">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.6em] text-[#B76E79] mb-8">İNEGÖL ÖZEL HİZMETLER</h4>
            <h2 className="font-serif text-5xl md:text-7xl mb-12 italic leading-tight">
              Rüya Gibi Bir <br /> Kına Organizasyonu
            </h2>
            <div className="grid md:grid-cols-2 gap-12 text-white/60 font-light leading-relaxed">
              <p>
                Geleneklerin en zarif halini, modern bir estetikle İnegöl’deki özel mekanımızda buluşturuyoruz. Kına gecesi organizasyonumuzda, her detayı "naif" bir kurguyla ele alıyor, kına elbisenizden mekan tasarımına kadar bütünsel bir lüks deneyimi sunuyoruz.
              </p>
              <p>
                Anadolu’nun kadim ritüellerini, elit bir düğün resepsiyonu titizliğiyle yönetiyor; gelinlerimize sadece bir gece değil, ömür boyu hatırlanacak bir masal bırakıyoruz.
              </p>
            </div>
         </div>
      </section>

      {/* ── PHILOSOPHY ── */}
      <section className="py-32 px-6 text-center">
         <div className="max-w-2xl mx-auto space-y-12">
            <span className="font-serif text-6xl text-[#B76E79]/20 italic block">Hayalimiz</span>
            <p className="font-serif text-2xl md:text-3xl text-[#1c1c1c] font-light leading-relaxed">
              "Bizim için her gelinlik, sadece bir giysi değil; bir kadının hayallerinin bilimsel bir hassasiyet ve sanatsal bir naiflikle hayat bulmuş halidir."
            </p>
            <div className="pt-8">
               <a href="/contact" className="text-[11px] font-bold uppercase tracking-[0.4em] py-5 px-10 border border-black/10 hover:bg-black hover:text-white transition-all duration-500">
                  HİZMETLERİMİZİ KEŞFEDİN
               </a>
            </div>
         </div>
      </section>

      <Footer />
    </main>
  );
}
