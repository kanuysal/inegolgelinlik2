"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";

/* ── Data ── */
const HOW_IT_WORKS_STEPS = [
  { num: "01", title: "Find Your Gown", desc: "Search our House Catalog to instantly link your listing to official stock photography and verified atelier details." },
  { num: "02", title: "Detail & Condition", desc: "Select your gown's condition. Our intelligent evaluator will recommend a resale price to maximize your return." },
  { num: "03", title: "Seller Frames", desc: "Follow our guided photo checklist to capture your gown in high-fidelity. Consistency builds buyer trust." },
  { num: "04", title: "Expert Certification", desc: "The House of Galia Lahav reviews every submission, ensuring the integrity and authenticity of the marketplace." },
];

const COMMISSION_TIERS = [
  { range: "Over $10,000", rate: "15%", you: "85%" },
  { range: "$6,000 – $10,000", rate: "18%", you: "82%" },
  { range: "$3,000 – $6,000", rate: "20%", you: "80%" },
  { range: "Under $3,000", rate: "25%", you: "75%" },
];

const FAQS = [
  { q: "Which gowns do you accept?", a: "We exclusively accept Galia Lahav and GALA by Galia Lahav gowns in good or better condition. All collections are welcome." },
  { q: "How long does it take to sell?", a: "Most gowns sell within 30–90 days. Featured and popular styles often sell within the first two weeks." },
  { q: "How is pricing determined?", a: "Pricing is based on original retail value, current demand, and condition. Our team provides expert recommendations." },
  { q: "Do I need to pay anything upfront?", a: "Listing is complimentary. We only earn a commission upon the successful sale of your gown." },
];

export default function SellPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <main className="min-h-screen bg-obsidian text-white/90">
      <Navbar />

      {/* ── Hero section ── */}
      <section className="pt-48 pb-32 px-6 md:px-10 overflow-hidden relative">
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-4xl"
          >
            <p className="font-sans text-[10px] font-bold uppercase tracking-[0.5em] text-gold-muted mb-6">
              The House Marketplace
            </p>
            <h1 className="font-serif text-6xl md:text-9xl font-light tracking-tighter text-white/95 leading-[0.85] mb-10">
              Consign Your <br />
              <span className="italic text-gold-muted">Galia Lahav</span>
            </h1>
            <p className="font-sans text-xl text-white/30 tracking-wide max-w-xl leading-relaxed mb-14">
              Entrust your couture to the experts who designed it. Our premium sell wizard guides you through a verified submission process in under 5 minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-6">
              <Link
                href="/sell/submit"
                className="px-12 py-6 bg-gold-muted text-obsidian font-sans text-[11px] font-bold uppercase tracking-[0.3em] rounded-full hover:bg-champagne transition-all duration-500 text-center shadow-[0_0_60px_rgba(212,175,55,0.1)]"
              >
                Start Premium Wizard
              </Link>
              <Link
                href="/how-it-works"
                className="px-12 py-6 border border-white/10 text-white/40 font-sans text-[11px] font-bold uppercase tracking-[0.3em] rounded-full hover:text-white hover:border-white/30 hover:bg-white/5 transition-all duration-500 text-center"
              >
                The Process
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section className="border-y border-white/5 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4">
          {[
            { val: "500+", label: "Couture Items Sold" },
            { val: "45d", label: "Avg. Sale Time" },
            { val: "85%", label: "Seller Return Rate" },
            { val: "Verified", label: "By Galia Lahav" },
          ].map((stat, i) => (
            <div key={i} className="py-12 px-10 text-center border-r border-white/5 last:border-r-0">
              <div className="font-serif text-3xl font-light text-white/80 mb-2">{stat.val}</div>
              <div className="font-sans text-[9px] font-bold tracking-[0.4em] text-white/20 uppercase">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Why Consign ── */}
      <section className="py-40 px-6 md:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                title: "Authenticity First",
                desc: "Direct verification by the House protects your gown's value and ensures buyer confidence.",
                icon: "✓",
              },
              {
                title: "Global Reach",
                desc: "Connect with a curated community of brides worldwide, specifically seeking GL couture.",
                icon: "✧",
              },
              {
                title: "Full Security",
                desc: "Encrypted payments and white-glove logistics. We handle the process from end-to-end.",
                icon: "🔒",
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="resonance-panel p-12 flex flex-col items-start"
              >
                <div className="w-14 h-14 rounded-full bg-white/[0.03] border border-white/10 flex items-center justify-center text-xl text-gold-muted mb-8 shadow-inner">
                  {item.icon}
                </div>
                <h3 className="font-serif text-2xl text-white/90 mb-4 tracking-tight">{item.title}</h3>
                <p className="font-sans text-[13px] text-white/30 leading-relaxed tracking-wide">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── The Process ── */}
      <section className="py-40 bg-white/[0.01] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="text-center mb-24">
            <p className="font-sans text-[10px] font-bold uppercase tracking-[0.5em] text-gold-muted mb-6">The Journey</p>
            <h2 className="font-serif text-5xl md:text-7xl font-light text-white/95 leading-none">How It Works</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-12">
            {HOW_IT_WORKS_STEPS.map((step, i) => (
              <div key={i} className="relative">
                <div className="font-serif text-[80px] text-white/[0.03] leading-none absolute -top-8 -left-4 select-none">
                  {step.num}
                </div>
                <div className="relative z-10">
                  <h3 className="font-serif text-2xl text-white/80 mb-4 tracking-wide">{step.title}</h3>
                  <p className="font-sans text-[13px] text-white/30 leading-relaxed tracking-wide">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="py-40 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="resonance-panel p-16 text-center bg-white/[0.02] border-gold-muted/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gold-muted/5 blur-[100px] -z-10" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gold-muted/5 blur-[100px] -z-10" />

            <h2 className="font-serif text-5xl md:text-6xl font-light text-white/95 mb-8">Ready to <span className="italic">Galia</span> Your Gown?</h2>
            <p className="font-sans text-sm text-white/30 tracking-widest uppercase mb-12 max-w-lg mx-auto leading-relaxed">
              Join the official House marketplace. Our premium wizard will help you list in minutes.
            </p>
            <Link
              href="/sell/submit"
              className="inline-block px-16 py-7 bg-gold-muted text-obsidian font-sans text-xs font-bold uppercase tracking-[0.4em] rounded-full hover:bg-champagne transition-all duration-500 shadow-[0_20px_60px_-15px_rgba(212,175,55,0.3)]"
            >
              Launch Sell Wizard
            </Link>
          </div>
        </div>
      </section>

      {/* ── Pricing Table ── */}
      <section className="py-40 bg-white/[0.01] border-y border-white/5">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="font-serif text-5xl font-light text-white/95">Pricing Guide</h2>
            <p className="font-sans text-xs text-white/20 tracking-widest uppercase mt-4">Calculated to maximize your return</p>
          </div>
          <div className="resonance-panel overflow-hidden">
            <div className="grid grid-cols-3 border-b border-white/5 bg-white/[0.03]">
              <div className="px-10 py-6 font-sans text-[9px] font-bold tracking-[0.3em] text-white/30 uppercase">Sale Price</div>
              <div className="px-10 py-6 font-sans text-[9px] font-bold tracking-[0.3em] text-white/30 uppercase text-center">Service Fee</div>
              <div className="px-10 py-6 font-sans text-[9px] font-bold tracking-[0.3em] text-white/30 uppercase text-right">Owner Payout</div>
            </div>
            {COMMISSION_TIERS.map((tier, i) => (
              <div key={i} className="grid grid-cols-3 border-b last:border-0 border-white/[0.03] hover:bg-white/[0.01] transition-colors">
                <div className="px-10 py-6 font-sans text-sm text-white/50">{tier.range}</div>
                <div className="px-10 py-6 font-sans text-sm text-white/30 text-center">{tier.rate}</div>
                <div className="px-10 py-6 font-sans text-sm text-gold-muted font-medium text-right">{tier.you}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-40 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="font-serif text-5xl font-light text-white/95 tracking-tight">Support</h2>
          </div>
          <div className="space-y-4">
            {FAQS.map((faq, i) => (
              <div key={i} className="resonance-panel px-8 py-2">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between py-6 text-left group">
                  <span className="font-sans text-[13px] text-white/50 group-hover:text-white/80 transition-colors tracking-wide">{faq.q}</span>
                  <motion.span animate={{ rotate: openFaq === i ? 45 : 0 }} className="text-white/20 text-xl font-light">+</motion.span>
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="pb-8 font-sans text-[13px] text-white/20 leading-relaxed tracking-wide">{faq.a}</div>
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
