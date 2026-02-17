"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";

/* ── Icons ── */
function VerifiedBadge({ size = 20 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width={size} height={size}>
      <path
        d="M12 2L14.09 4.26L17 3.64L17.18 6.57L19.82 8.07L18.56 10.74L20 13.14L17.72 14.72L17.5 17.66L14.58 17.95L12.73 20.39L10.27 18.76L7.27 19.5L6.27 16.73L3.53 15.32L4.63 12.56L3.27 10L5.57 8.45L5.82 5.51L8.74 5.27L10.64 2.87L12 2Z"
        fill="currentColor"
      />
      <path d="M9 12L11 14L15 10" stroke="#050505" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function TruckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
      <rect x="1" y="3" width="15" height="13" />
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  );
}

function CreditCardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

/* ── Data ── */
const BUYING_STEPS = [
  {
    num: "01",
    title: "Discover Couture",
    desc: "Browse our curated collection of authenticated Galia Lahav gowns. Filter by collection, size, condition, and price to find your perfect piece.",
  },
  {
    num: "02",
    title: "Expert Inquiry",
    desc: "Request additional details, photos, or measurements. Our team facilitates all communication, ensuring clarity and total transparency.",
  },
  {
    num: "03",
    title: "Secure Purchase",
    desc: "Transaction security is paramount. Your payment is held in escrow until you confirm the gown's arrival and absolute satisfaction.",
  },
  {
    num: "04",
    title: "White-Glove Delivery",
    desc: "Your couture arrives via insured courier with full tracking. A 14-day protection window allows you to inspect every detail at your leisure.",
  },
];

const SELLING_STEPS = [
  {
    num: "01",
    title: "Submit Details",
    desc: "Provide your gown's history, condition, and imagery. Our streamlined process is designed for discretion and ease of use.",
  },
  {
    num: "02",
    title: "GL Verification",
    desc: "The House authenticates every submission. Our experts verify craftsmanship and provenance to ensure marketplace integrity.",
  },
  {
    num: "03",
    title: "Global Showcase",
    desc: "Your gown is presented to an exclusive global audience of high-intent brides, maximizing exposure and resale value.",
  },
  {
    num: "04",
    title: "Seamless Handover",
    desc: "We provide insured logistics and manage secure payment processing. You receive payment promptly upon buyer confirmation.",
  },
];

const TRUST_FEATURES = [
  {
    icon: <VerifiedBadge size={24} />,
    title: "GL Authentication",
    desc: "Every gown is verified by the House of Galia Lahav, ensuring the integrity of every stitch and silhouette.",
  },
  {
    icon: <ShieldIcon />,
    title: "Escrow Protection",
    desc: "Funds are held securely and only released when the buyer is satisfied, protecting both parties.",
  },
  {
    icon: <TruckIcon />,
    title: "White-Glove Logistics",
    desc: "Insured, tracked, and handled with the care couture deserves. We manage the journey from door to door.",
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
    a: "Due to the nature of online resale, in-person try-ons are not available. However, our 14-day return policy gives you time to receive and inspect the gown. We recommend checking measurements carefully and communicating with sellers for additional details.",
  },
];

export default function HowItWorksPage() {
  const [activeTab, setActiveTab] = useState<"buying" | "selling">("buying");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <main className="min-h-screen bg-obsidian text-white/90">
      <Navbar />

      {/* ── Hero section ── */}
      <section className="pt-48 pb-24 px-6 md:px-10 overflow-hidden relative">
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="font-sans text-[10px] font-bold uppercase tracking-[0.5em] text-resonance-amber mb-6">
              The RE:GALIA Journey
            </p>
            <h1 className="font-serif text-6xl md:text-8xl font-light tracking-tighter text-white/95 leading-none mb-10">
              Seamlessly <br />
              <span className="italic">Yours</span>
            </h1>
            <p className="font-sans text-xl text-white/30 tracking-wide max-w-xl mx-auto leading-relaxed mb-12">
              Experience the pinnacle of pre-owned luxury bridal. A curated process designed for trust, authenticity, and the signature Galia Lahav experience.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Process Tabs ── */}
      <section className="py-24 px-6 md:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center gap-12 mb-20 border-b border-white/5">
            {["Buying", "Selling"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab.toLowerCase() as any)}
                className={`pb-8 font-sans text-[11px] font-bold uppercase tracking-[0.4em] transition-all relative ${activeTab === tab.toLowerCase()
                    ? "text-resonance-amber"
                    : "text-white/20 hover:text-white/40"
                  }`}
              >
                {tab}
                {activeTab === tab.toLowerCase() && (
                  <motion.div
                    layoutId="activeTabUnderline"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-resonance-amber shadow-[0_0_15px_rgba(245,158,11,0.5)]"
                  />
                )}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="grid md:grid-cols-4 gap-10"
            >
              {(activeTab === "buying" ? BUYING_STEPS : SELLING_STEPS).map((step, i) => (
                <div key={i} className="resonance-panel p-10 flex flex-col items-start min-h-[360px] relative overflow-hidden group">
                  <div className="font-serif text-[80px] text-white/[0.03] leading-none absolute -top-4 -right-2 select-none group-hover:text-white/[0.05] transition-colors">
                    {step.num}
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white/[0.03] border border-white/10 flex items-center justify-center font-serif text-resonance-amber mb-8">
                    {step.num}
                  </div>
                  <h3 className="font-serif text-2xl text-white/90 mb-6 tracking-tight leading-tight z-10">
                    {step.title}
                  </h3>
                  <p className="font-sans text-[13px] text-white/30 leading-relaxed tracking-wide mt-auto z-10 group-hover:text-white/40 transition-colors">
                    {step.desc}
                  </p>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>

          <div className="text-center mt-20">
            <Link
              href={activeTab === "buying" ? "/shop" : "/sell"}
              className="px-16 py-6 bg-white text-obsidian font-sans text-[11px] font-bold uppercase tracking-[0.4em] rounded-full hover:bg-resonance-amber transition-all duration-500 shadow-[0_0_50px_rgba(255,255,255,0.05)]"
            >
              {activeTab === "buying" ? "Explore Collection" : "Start Consigning"}
            </Link>
          </div>
        </div>
      </section>

      {/* ── Trust Section ── */}
      <section className="py-40 bg-white/[0.01] border-y border-white/5 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="font-serif text-5xl md:text-7xl font-light text-white/95 tracking-tight leading-none mb-6">Built on Trust</h2>
            <p className="font-sans text-sm text-white/20 tracking-widest uppercase">The RE:GALIA Standard of Excellence</p>
          </div>
          <div className="grid md:grid-cols-3 gap-10">
            {TRUST_FEATURES.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="resonance-panel p-12 text-center flex flex-col items-center"
              >
                <div className="text-resonance-amber mb-8 opacity-80 group-hover:opacity-100 transition-opacity">
                  {feature.icon}
                </div>
                <h3 className="font-serif text-2xl text-white/90 mb-4 tracking-tight">{feature.title}</h3>
                <p className="font-sans text-[13px] text-white/30 leading-relaxed tracking-wide">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ Section ── */}
      <section className="py-40 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="font-serif text-5xl font-light text-white/95 tracking-tight leading-none">Questions</h2>
          </div>
          <div className="space-y-4">
            {FAQS.map((faq, i) => (
              <div key={i} className="resonance-panel px-8 py-2">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between py-6 text-left group"
                >
                  <span className="font-sans text-[14px] text-white/50 group-hover:text-white/80 transition-colors tracking-wide">{faq.q}</span>
                  <motion.span
                    animate={{ rotate: openFaq === i ? 45 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-white/20 text-xl font-light"
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
                      <div className="pb-8 font-sans text-[14px] text-white/25 leading-relaxed tracking-wide">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
