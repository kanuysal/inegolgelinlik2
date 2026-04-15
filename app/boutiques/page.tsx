"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import Image from "next/image";

const STORES = [
  {
    name: "MİNA LİDYA İnegöl (Atelier & Store)",
    city: "Bursa / TÜRKİYE",
    address: "Kasım Efendi Caddesi No:25A, İnegöl, Bursa",
    phone: "+90 542 113 16 41",
    hours: "Pzt - Cmt: 09:30 - 19:30",
    image: "/images/hiw/staircase.jpg",
    mapUrl: "https://maps.google.com"
  },
  {
    name: "MİNA LİDYA Novias (Design Office)",
    city: "Valencia / SPAIN",
    address: "Alcoy, Alicante",
    phone: "+34 632 623 300",
    hours: "Pzt - Cmt: 10:00 - 19:00",
    image: "/images/hiw/banner.jpg",
    mapUrl: "https://maps.google.com"
  }
];

export default function BoutiquesPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <section className="pt-48 pb-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-32">
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-sans text-[10px] font-bold uppercase tracking-[0.5em] text-[#B76E79] mb-8"
            >
              MAĞAZALARIMIZ
            </motion.p>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-serif text-5xl md:text-8xl font-normal text-[#1c1c1c] tracking-tighter leading-none lowercase first-letter:uppercase"
            >
              Lüksü <span className="italic text-[#B76E79]">Yerinde Deneyimleyin</span>
            </motion.h1>
          </div>

          <div className="space-y-40">
            {STORES.map((store, i) => (
              <div key={i} className={`flex flex-col ${i % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"} gap-16 lg:gap-32 items-center`}>
                <div className="w-full lg:w-3/5">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1 }}
                    className="relative aspect-[16/9] overflow-hidden shadow-2xl"
                  >
                    <img src={store.image} alt={store.name} className="w-full h-full object-cover" />
                  </motion.div>
                </div>
                <div className="w-full lg:w-2/5 space-y-10">
                  <div className="space-y-4">
                    <p className="font-sans text-[11px] font-bold uppercase tracking-[0.3em] text-[#B76E79]">{store.city}</p>
                    <h2 className="font-serif text-4xl md:text-5xl font-normal text-[#1c1c1c] leading-tight">{store.name}</h2>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="flex gap-4 items-start">
                        <span className="material-symbols-outlined text-[#B76E79] text-xl">location_on</span>
                        <p className="font-sans text-base text-[#1c1c1c]/60 font-light leading-relaxed">{store.address}</p>
                    </div>
                    <div className="flex gap-4 items-center">
                        <span className="material-symbols-outlined text-[#B76E79] text-xl">call</span>
                        <p className="font-sans text-base text-[#1c1c1c]/60 font-light leading-relaxed">{store.phone}</p>
                    </div>
                    <div className="flex gap-4 items-center">
                        <span className="material-symbols-outlined text-[#B76E79] text-xl">schedule</span>
                        <p className="font-sans text-base text-[#1c1c1c]/60 font-light leading-relaxed">{store.hours}</p>
                    </div>
                  </div>

                  <div className="pt-6 flex flex-col sm:flex-row gap-4">
                    <a 
                        href={`https://wa.me/905421131641?text=Merhaba, ${store.name} mağazanız için randevu almak istiyorum.`}
                        className="px-10 py-5 bg-[#1c1c1c] text-white font-sans text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-[#B76E79] transition-all duration-500 text-center shadow-lg"
                    >
                        RANDEVU ALIN
                    </a>
                    <a 
                        href={store.mapUrl}
                        target="_blank"
                        className="px-10 py-5 border border-[#1c1c1c]/10 text-[#1c1c1c] font-sans text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-[#1c1c1c] hover:text-white transition-all duration-500 text-center"
                    >
                        YOL TARİFİ
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
