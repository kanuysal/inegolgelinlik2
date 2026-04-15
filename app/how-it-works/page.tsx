"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";

/* ── Data ────────────────────────────────────── */

const EXPERIENCE_STEPS = [
  {
    num: "01",
    title: "Keşfedin",
    subtitle: "Koleksiyonlarımızı İnceleyin",
    desc: "Mina Lidya'nın her biri özgün hikayelere sahip Gelinlik, Abiye ve Tesettür koleksiyonlarını online kataloğumuzdan veya mağazalarımızda keşfedin.",
    image: "/images/hiw/bride-step1.jpg",
    imageAlt: "Mina Lidya Gelinlik Koleksiyonu",
    accent: "İlham Dolu Bir Başlangıç",
  },
  {
    num: "02",
    title: "Randevu",
    subtitle: "Uzmanlarımızla Tanışın",
    desc: "Hayalinizdeki modeli belirlemek ve profesyonel stil danışmanlığı almak için Güzelyalı veya İnegöl mağazalarımızdan randevunuzu oluşturun.",
    image: "/images/hiw/bride-step2.jpg",
    imageAlt: "Mina Lidya Randevu Süreci",
    accent: "Kişiye Özel İlgi",
  },
  {
    num: "03",
    title: "Tasarım",
    subtitle: "Size Özel Dokunuşlar",
    desc: "Seçtiğiniz model üzerinde vücut ölçülerinize ve zevkinize uygun revizyonlar yaparak, size en çok yakışacak silüeti birlikte oluşturuyoruz.",
    image: "/images/hiw/bride-step3.jpg",
    imageAlt: "Mina Lidya Tasarım ve Ölçü",
    accent: "Mükemmel Fit Garantisi",
  },
  {
    num: "04",
    title: "Teslimat",
    subtitle: "Düğün Gününüze Hazır",
    desc: "Provaların ardından titizlikle hazırlanan gelinliğiniz, düğün gününüzden önce size teslim edilir. Artık en özel hikayenize hazırsınız.",
    image: "/images/hiw/bride-step4.jpg",
    imageAlt: "Mina Lidya Gelinlik Teslimatı",
    accent: "Ve Hikaye Başlıyor",
  },
];

const TRUST_FEATURES = [
  {
    title: "Zanaatkar İşçilik",
    desc: "Her bir parça, yılların deneyimine sahip usta terzilerimiz tarafından el işçiliği ile titizlikle hazırlanır.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7">
        <path
          d="M12 2L14.09 4.26L17 3.64L17.18 6.57L19.82 8.07L18.56 10.74L20 13.14L17.72 14.72L17.5 17.66L14.58 17.95L12.73 20.39L10.27 18.76L7.27 19.5L6.27 16.73L3.53 15.32L4.63 12.56L3.27 10L5.57 8.45L5.82 5.51L8.74 5.27L10.64 2.87L12 2Z"
          fill="currentColor"
        />
        <path d="M9 12L11 14L15 10" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Kişiye Özel Dikim",
    desc: "Sadece bir elbise değil, sizin hikayenize ve vücut hattınıza tam uyum sağlayan özel bir deneyim sunuyoruz.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    title: "Modern Tasarım",
    desc: "Dünya moda trendlerini geleneksel zarafetle harmanlayarak modern ve zamansız gelinlikler tasarlıyoruz.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

const FAQS = [
  {
    q: "Randevu almam gerekiyor mu?",
    a: "Evet, size en iyi hizmeti sunabilmek ve provalarınızı huzur içinde gerçekleştirebilmek için randevu ile çalışmaktayız. Web sitemiz üzerinden veya telefonla randevu alabilirsiniz.",
  },
  {
    q: "Gelinlik dikim süreci ne kadar sürer?",
    a: "Gelinlik modeline ve prova yoğunluğuna bağlı olarak süreç genellikle 4-8 hafta arasında değişmektedir. Ancak acil durumlar için ekspres dikim seçeneklerimiz mevcuttur.",
  },
  {
    q: "Özel tasarım yapıyor musunuz?",
    a: "Evet, mevcut koleksiyonlarımızın yanı sıra hayalinizdeki tasarımı size özel olarak sıfırdan hayata geçirebiliriz.",
  },
  {
    q: "Fiyat aralığınız nedir?",
    a: "Fiyatlarımız seçilen kumaş, işçilik detayları ve dikim türüne göre değişiklik gösterir. Detaylı bilgi için mağazalarımızı ziyaret edebilirsiniz.",
  },
];

/* ── Journey Step Component ── */

function JourneyStep({
  step,
  index,
  isLast,
}: {
  step: (typeof EXPERIENCE_STEPS)[0];
  index: number;
  isLast: boolean;
}) {
  const isEven = index % 2 === 0;

  return (
    <section className={`relative min-h-screen flex items-center`}>
      {/* Giant background number */}
      <div
        className={`absolute top-1/2 -translate-y-1/2 font-serif text-[20vw] md:text-[28vw] leading-none text-[#B76E79] opacity-[0.05] select-none pointer-events-none ${
          isEven ? "right-0 md:right-10" : "left-0 md:left-10"
        }`}
      >
        {step.num}
      </div>

      <div className="max-w-[90rem] mx-auto w-full px-6 md:px-16 py-24 md:py-32 relative z-10">
        <div className={`grid md:grid-cols-2 gap-12 md:gap-24 items-center ${isEven ? "" : "md:[direction:rtl]"}`}>
          {/* Image side */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="relative aspect-[3/4] overflow-hidden md:[direction:ltr] shadow-2xl"
          >
            <Image
              src={step.image}
              alt={step.imageAlt}
              fill
              className="object-cover transition-transform duration-1000 hover:scale-110"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </motion.div>

          {/* Text side */}
          <motion.div
            initial={{ opacity: 0, x: isEven ? 30 : -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col justify-center md:[direction:ltr]"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="h-[1px] w-12 bg-[#B76E79]" />
              <span className="font-sans text-[10px] font-bold uppercase tracking-[0.4em] text-[#B76E79]">
                {step.accent}
              </span>
            </div>

            <h2 className="font-serif text-5xl md:text-7xl lg:text-8xl font-normal text-[#1c1c1c] tracking-tight leading-[0.9] mb-4 lowercase first-letter:uppercase">
              {step.title}
            </h2>
            <h3 className="font-serif text-3xl md:text-4xl lg:text-5xl font-light italic text-[#1c1c1c]/50 tracking-tight leading-[1] mb-10">
              {step.subtitle}
            </h3>

            <p className="font-sans text-base md:text-lg text-[#1c1c1c]/70 leading-relaxed font-light max-w-md">
              {step.desc}
            </p>
          </motion.div>
        </div>
      </div>

      {!isLast && (
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1px] h-32 bg-gradient-to-b from-[#B76E79]/30 to-transparent" />
      )}
    </section>
  );
}

export default function ExperiencePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <main className="min-h-screen bg-white overflow-hidden">
      <Navbar />

      {/* ── Intro ── */}
      <section className="pt-48 pb-12 px-6 text-center">
        <div className="max-w-4xl mx-auto">
            <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-sans text-[10px] font-bold uppercase tracking-[0.5em] text-[#B76E79] mb-8"
            >
                MINA LIDYA DENEYİMİ
            </motion.p>
            <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="font-serif text-5xl md:text-8xl font-normal text-[#1c1c1c] tracking-tighter leading-none mb-12 lowercase first-letter:uppercase"
            >
                Zarafete Giden <br /><span className="italic opacity-40">Eşsiz Yolculuk</span>
            </motion.h1>
            <div className="h-[1px] w-32 bg-[#B76E79]/20 mx-auto" />
        </div>
      </section>

      {/* ── Journey Steps ── */}
      {EXPERIENCE_STEPS.map((step, i) => (
        <JourneyStep
          key={i}
          step={step}
          index={i}
          isLast={i === EXPERIENCE_STEPS.length - 1}
        />
      ))}

      {/* ── CTA ── */}
      <section className="py-32 md:py-48 px-6 text-center">
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
        >
            <h2 className="font-serif text-4xl md:text-7xl font-normal text-[#1c1c1c] tracking-tight leading-none mb-12 lowercase first-letter:uppercase">
                Kendi Hikayenizi <br /><span className="italic text-[#B76E79]">Yazmaya Başlayın</span>
            </h2>
            <Link
                href="/appointment"
                className="inline-block px-16 py-6 bg-[#1c1c1c] text-white font-sans text-[12px] font-bold uppercase tracking-[0.2em] hover:bg-[#B76E79] transition-all duration-500 shadow-2xl"
            >
                RANDEVUNUZU OLUŞTURUN
            </Link>
        </motion.div>
      </section>

      {/* ── Trust Section ── */}
      <section className="py-32 md:py-44 bg-[#1c1c1c] px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-32"
          >
            <p className="font-sans text-[10px] font-bold uppercase tracking-[0.5em] text-[#B76E79] mb-8">
              MINA LIDYA STANDARTLARI
            </p>
            <h2 className="font-serif text-4xl md:text-7xl font-light text-white tracking-[-0.02em] leading-none lowercase first-letter:uppercase">
              Güven Ve <span className="italic opacity-40">Zarafet</span>
            </h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-16 md:gap-24">
            {TRUST_FEATURES.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="text-center flex flex-col items-center"
              >
                <div className="text-[#B76E79] mb-10">{feature.icon}</div>
                <h3 className="font-serif text-3xl text-white mb-6 tracking-tight font-normal">
                  {feature.title}
                </h3>
                <p className="font-sans text-base text-white/40 leading-relaxed font-light">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-32 md:py-48 px-6">
        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-24">
                <p className="font-sans text-[10px] font-bold uppercase tracking-[0.5em] text-[#B76E79] mb-8">
                    MERAK EDİLENLER
                </p>
                <h2 className="font-serif text-4xl md:text-6xl font-normal text-[#1c1c1c] tracking-tight lowercase first-letter:uppercase">
                    Size Nasıl <span className="italic text-[#B76E79]">Yardımcı Olabiliriz?</span>
                </h2>
            </div>
          <div className="space-y-4">
            {FAQS.map((faq, i) => (
              <div key={i} className="border border-[#1c1c1c]/5 px-8 md:px-12 py-2 hover:border-[#B76E79]/30 transition-all duration-500">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between py-6 text-left"
                >
                  <span className="font-sans text-base text-[#1c1c1c]/80 font-medium">
                    {faq.q}
                  </span>
                  <motion.span
                    animate={{ rotate: openFaq === i ? 45 : 0 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="text-[#B76E79] text-2xl font-light"
                  >
                    +
                  </motion.span>
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="pb-10 font-sans text-base text-[#1c1c1c]/60 leading-relaxed font-light">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
