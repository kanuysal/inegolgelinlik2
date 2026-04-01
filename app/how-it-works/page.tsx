"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";

/* ═══════════════════════════════════════════
   Data
   ═══════════════════════════════════════════ */

const JOURNEY_STEPS = [
  {
    num: "01",
    title: "Discover",
    subtitle: "Our Bridal Collections",
    desc: "Browse our curated collection of authenticated Galia Lahav gowns. Filter by collection, size, condition, and price to find your perfect piece.",
    image: "/images/hiw/bride-step1.jpg",
    imageAlt: "Galia Lahav G-207 bridal gown",
    accent: "The Collection Awaits",
  },
  {
    num: "02",
    title: "Inquire",
    subtitle: "With Confidence",
    desc: "Request additional details, photos, or measurements. Our team facilitates all communication, ensuring clarity and total transparency between you and the seller.",
    image: "/images/hiw/bride-step2.jpg",
    imageAlt: "Galia Lahav Juniper bridal gown",
    accent: "Every Detail Matters",
  },
  {
    num: "03",
    title: "Purchase",
    subtitle: "With Confidence",
    desc: "Connect directly with the seller through our secure messaging platform. Once you agree on terms, payment and shipping are arranged between you and the seller.",
    image: "/images/hiw/bride-step3.jpg",
    imageAlt: "Galia Lahav Aelin bridal gown",
    accent: "Direct & Transparent",
  },
  {
    num: "04",
    title: "Delivered",
    subtitle: "With Care",
    desc: "For brand-direct purchases, returns are accepted within 5 days with a $200 fee. For peer-to-peer purchases, returns are at the discretion of buyer and seller.",
    image: "/images/hiw/bride-step4.jpg",
    imageAlt: "Galia Lahav G-302 bridal gown",
    accent: "Your Gown Arrives",
  },
];

const SELLING_STEPS = [
  {
    num: "01",
    title: "Upload",
    subtitle: "Your Gown",
    desc: "Share your gown\u2019s details, condition, and imagery through our elevated sales experience, designed for discretion and effortless ease.",
    image: "/images/hiw/seller-step1.webp",
    imageAlt: "Galia Lahav Lady G bridal gown",
    accent: "Simple & Guided",
  },
  {
    num: "02",
    title: "Verified",
    subtitle: "By The Brand",
    desc: "Every gown is authenticated by the House of Galia Lahav. Our experts verify craftsmanship and provenance to ensure complete marketplace integrity.",
    image: "/images/hiw/seller-step2.jpg",
    imageAlt: "Galia Lahav authentication process",
    accent: "GL Authentication",
  },
  {
    num: "03",
    title: "Complete",
    subtitle: "The Handover",
    desc: "Once both parties agree on terms, the transaction is completed directly between buyer and seller. RE:GALIA facilitates the connection and authentication \u2014 logistics and payment are arranged between the parties.",
    image: "/images/hiw/staircase.jpg",
    imageAlt: "Galia Lahav satin gown on elegant staircase",
    accent: "Seamless & Direct",
  },
];

const TRUST_FEATURES = [
  {
    title: "GL Authentication",
    desc: "Every gown is verified by the House of Galia Lahav, ensuring the integrity of every stitch and silhouette.",
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
    title: "Secure Messaging",
    desc: "Communicate directly with buyers and sellers through our secure platform. Every interaction is protected and private.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    title: "Brand-Direct Returns",
    desc: "Galia Lahav brand-direct purchases include a 5-day return window. Peer-to-peer returns are arranged between buyer and seller.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
        <path d="M9 14l-4-4 4-4" />
        <path d="M5 10h11a4 4 0 0 1 0 8h-1" />
      </svg>
    ),
  },
];

const FAQS = [
  {
    q: "How do I know a gown is authentic?",
    a: "Every gown on RE:GALIA is verified by our authentication team with deep expertise in Galia Lahav craftsmanship. We check construction details, materials, labels, and provenance. Each verified gown receives a Certificate of Authenticity.",
  },
  {
    q: "What condition are the gowns in?",
    a: "We only accept gowns in 'Good' condition or better. Each listing includes a detailed condition assessment: New Never Worn (tags may be attached), Excellent (worn once, no signs of wear), Very Good (minor signs of wear), or Good (gently worn with minor imperfections).",
  },
  {
    q: "Can I try the gown before purchasing?",
    a: "Due to the nature of online resale, in-person try-ons are not available. For brand-direct purchases, returns are accepted within 5 days (a $200 return fee applies). For peer-to-peer listings, returns are at the discretion of buyer and seller. We recommend checking measurements carefully and communicating with sellers for additional details.",
  },
  {
    q: "How long does selling take?",
    a: "Most gowns sell within 30–90 days. Featured and popular styles often sell within the first two weeks. Our global audience of high-intent brides ensures maximum exposure for your listing.",
  },
  {
    q: "What are the fees?",
    a: "Listing is complimentary. We only earn a commission upon successful sale — ranging from 15% to 25% depending on the sale price, meaning you keep between 75% and 85% of the final sale.",
  },
];

/* ═══════════════════════════════════════════
   Journey Step Component (Scroll-Driven)
   ═══════════════════════════════════════════ */

function JourneyStep({
  step,
  index,
  isLast,
}: {
  step: (typeof JOURNEY_STEPS)[0];
  index: number;
  isLast: boolean;
}) {
  const isEven = index % 2 === 0;

  return (
    <section
      className={`relative min-h-screen flex items-center ${!isLast ? "mb-0" : ""}`}
    >
      {/* Giant background number */}
      <div
        className={`absolute top-1/2 -translate-y-1/2 font-serif text-[20vw] md:text-[28vw] leading-none text-[#1c1c1c] opacity-[0.06] select-none pointer-events-none ${
          isEven ? "right-0 md:right-10" : "left-0 md:left-10"
        }`}
      >
        {step.num}
      </div>

      <div className="max-w-[90rem] mx-auto w-full px-6 md:px-16 py-24 md:py-32 relative z-10">
        <div
          className={`grid md:grid-cols-2 gap-10 md:gap-20 items-center ${
            isEven ? "" : "md:[direction:rtl]"
          }`}
        >
          {/* Image side */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative aspect-[3/4] overflow-hidden md:[direction:ltr]"
          >
            <Image
              src={step.image}
              alt={step.imageAlt}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            {/* Image overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
          </motion.div>

          {/* Text side */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="flex flex-col justify-center md:[direction:ltr]"
          >
            {/* Accent label */}
            <div className="flex items-center gap-4 mb-8">
              <div className="h-[1px] w-12 bg-[#1c1c1c]/20" />
              <span className="font-sans text-[10px] font-light uppercase tracking-[0.3em] text-[#1c1c1c]/60">
                {step.accent}
              </span>
            </div>

            {/* Step number */}
            <span className="font-sans text-[11px] font-light uppercase tracking-[0.2em] text-[#1c1c1c]/60 mb-4">
              Step {step.num}
            </span>

            {/* Title */}
            <h2 className="font-serif text-5xl md:text-7xl lg:text-8xl font-light text-[#1c1c1c] tracking-[-0.03em] leading-[0.9] mb-2">
              {step.title}
            </h2>
            <h3 className="font-serif text-4xl md:text-5xl lg:text-6xl font-light italic text-[#1c1c1c]/70 tracking-[-0.02em] leading-[0.95] mb-10">
              {step.subtitle}
            </h3>

            {/* Description */}
            <p className="font-sans text-[15px] md:text-[16px] text-[#1c1c1c]/75 leading-[1.8] font-light max-w-md">
              {step.desc}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Section divider line */}
      {!isLast && (
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1px] h-20 bg-gradient-to-b from-[#1c1c1c]/10 to-transparent" />
      )}
    </section>
  );
}

/* ═══════════════════════════════════════════
   Main Page
   ═══════════════════════════════════════════ */

export default function HowItWorksPage() {
  const [activeTab, setActiveTab] = useState<"buying" | "selling">("buying");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const steps = activeTab === "buying" ? JOURNEY_STEPS : SELLING_STEPS;

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* ── Journey Toggle ── */}
      <section className="pt-28 py-8 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center gap-16 border-b border-[#1c1c1c]/5">
            {(["Buying", "Selling"] as const).map((tab) => {
              const key = tab.toLowerCase() as "buying" | "selling";
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(key)}
                  className={`pb-6 font-sans text-[12px] font-light uppercase tracking-[0.2em] transition-all relative ${
                    activeTab === key
                      ? "text-[#1c1c1c]"
                      : "text-[#1c1c1c]/40 hover:text-[#1c1c1c]/70"
                  }`}
                >
                  {tab === "Buying" ? "For Brides" : "For Sellers"}
                  {activeTab === key && (
                    <motion.div
                      layoutId="journeyTab"
                      className="absolute bottom-0 left-0 right-0 h-[1px] bg-[#1c1c1c]"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Immersive Journey Steps ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {steps.map((step, i) => (
            <JourneyStep
              key={`${activeTab}-${i}`}
              step={step}
              index={i}
              isLast={i === steps.length - 1}
            />
          ))}
        </motion.div>
      </AnimatePresence>

      {/* ── CTA between journey and trust ── */}
      <section className="py-24 md:py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="font-serif text-4xl md:text-6xl font-light text-[#1c1c1c] tracking-[-0.02em] leading-[0.95] mb-8">
              Ready to Begin<br />
              <span className="italic">Your Story</span>?
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
              {activeTab === "buying" ? (
                <Link
                  href="/shop"
                  className="px-14 py-5 bg-[#1c1c1c] text-white font-sans text-[11px] font-light uppercase tracking-[0.15em] hover:bg-[#333] transition-all duration-300 text-center"
                >
                  Shop the Collection
                </Link>
              ) : (
                <Link
                  href="/sell/submit"
                  className="px-14 py-5 bg-[#1c1c1c] text-white font-sans text-[11px] font-light uppercase tracking-[0.15em] hover:bg-[#333] transition-all duration-300 text-center"
                >
                  Start Consigning
                </Link>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Trust Section ── */}
      <section className="py-32 md:py-44 bg-[#1c1c1c] px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-24"
          >
            <p className="font-sans text-[10px] font-light uppercase tracking-[0.4em] text-white/50 mb-6">
              The RE:GALIA Standard
            </p>
            <h2 className="font-serif text-4xl md:text-7xl font-light text-white tracking-[-0.02em] leading-none">
              Built on Trust
            </h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-[1px] bg-white/5">
            {TRUST_FEATURES.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="p-14 md:p-16 text-center flex flex-col items-center bg-[#1c1c1c]"
              >
                <div className="text-white/50 mb-10">{feature.icon}</div>
                <h3 className="font-serif text-2xl text-white mb-6 tracking-[-0.02em] font-light">
                  {feature.title}
                </h3>
                <p className="font-sans text-[13px] text-white/60 leading-relaxed font-light max-w-xs">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ Section ── */}
      <section className="py-32 md:py-44 px-6 md:px-10">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <p className="font-sans text-[10px] font-light uppercase tracking-[0.4em] text-[#1c1c1c]/60 mb-6">
              Common Questions
            </p>
            <h2 className="font-serif text-4xl md:text-6xl font-light text-[#1c1c1c] tracking-[-0.02em] leading-none">
              We&apos;re Here to Help
            </h2>
          </motion.div>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="border border-[#1c1c1c]/5 px-8 md:px-10 py-1 hover:border-[#1c1c1c]/10 transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between py-6 text-left group"
                >
                  <span className="font-sans text-[14px] text-[#1c1c1c]/75 group-hover:text-[#1c1c1c] transition-colors font-light">
                    {faq.q}
                  </span>
                  <motion.span
                    animate={{ rotate: openFaq === i ? 45 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-[#1c1c1c]/40 text-xl font-light flex-shrink-0 ml-4"
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
                      transition={{ duration: 0.4, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="pb-8 font-sans text-[14px] text-[#1c1c1c]/70 leading-[1.8] font-light max-w-2xl">
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
