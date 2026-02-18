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
    <main className="min-h-screen">
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
            <h1 className="font-serif text-6xl md:text-9xl font-light tracking-tighter text-obsidian leading-[0.85] mb-10">
              Consign Your <br />
              <span className="italic text-gold-muted">Galia Lahav</span>
            </h1>
            <p className="font-sans text-xl text-obsidian/30 tracking-wide max-w-xl leading-relaxed mb-14 font-medium">
              Entrust your couture to the experts who designed it. Our premium sell wizard guides you through a verified submission process in under 5 minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-6">
              <Link
                href="/sell/submit"
                className="px-12 py-6 bg-obsidian text-silk font-sans text-[11px] font-bold uppercase tracking-[0.3em] rounded-full hover:bg-gold-muted hover:text-obsidian transition-all duration-500 text-center shadow-xl"
              >
                Start Premium Wizard
              </Link>
              <Link
                href="/how-it-works"
                className="px-12 py-6 border border-obsidian/10 text-obsidian/40 font-sans text-[11px] font-bold uppercase tracking-[0.3em] rounded-full hover:text-obsidian hover:border-obsidian/30 hover:bg-obsidian/[0.03] transition-all duration-500 text-center font-medium"
              >
                The Process
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section className="border-y border-obsidian/5 bg-obsidian/[0.01]">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4">
          {[
            { val: "500+", label: "Couture Items Sold" },
            { val: "45d", label: "Avg. Sale Time" },
            { val: "85%", label: "Seller Return Rate" },
            { val: "Verified", label: "By Galia Lahav" },
          ].map((stat, i) => (
            <div key={i} className="py-14 px-10 text-center border-r border-obsidian/5 last:border-r-0">
              <div className="font-serif text-4xl font-light text-obsidian mb-3 tracking-tighter">{stat.val}</div>
              <div className="font-sans text-[10px] font-bold tracking-[0.4em] text-obsidian/20 uppercase">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Why Consign ── */}
      <section className="py-44 px-6 md:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12">
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
                className="resonance-panel p-14 flex flex-col items-start shadow-lg border border-obsidian/5"
              >
                <div className="w-16 h-16 rounded-full bg-obsidian/[0.02] border border-obsidian/5 flex items-center justify-center text-2xl text-gold-muted mb-10 shadow-inner">
                  {item.icon}
                </div>
                <h3 className="font-serif text-3xl text-obsidian mb-6 tracking-tight font-light">{item.title}</h3>
                <p className="font-sans text-[13px] text-obsidian/40 leading-relaxed tracking-wide font-medium">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── The Process ── */}
      <section className="py-44 bg-obsidian/[0.01] border-y border-obsidian/5">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="text-center mb-28">
            <p className="font-sans text-[10px] font-bold uppercase tracking-[0.5em] text-gold-muted mb-6">The Journey</p>
            <h2 className="font-serif text-5xl md:text-8xl font-light text-obsidian tracking-tighter leading-none">How It Works</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-16">
            {HOW_IT_WORKS_STEPS.map((step, i) => (
              <div key={i} className="relative">
                <div className="font-serif text-[100px] text-obsidian/[0.02] leading-none absolute -top-10 -left-6 select-none">
                  {step.num}
                </div>
                <div className="relative z-10">
                  <h3 className="font-serif text-2xl text-obsidian mb-6 tracking-tight font-light">{step.title}</h3>
                  <p className="font-sans text-[13px] text-obsidian/40 leading-relaxed tracking-wide font-medium">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="py-44 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="resonance-panel p-20 text-center bg-obsidian/[0.01] border-gold-muted/10 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-80 h-80 bg-gold-muted/5 blur-[120px] -z-10" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-gold-muted/5 blur-[120px] -z-10" />

            <h2 className="font-serif text-5xl md:text-7xl font-light text-obsidian mb-10 tracking-tighter">Ready to <span className="italic">Galia</span> Your Gown?</h2>
            <p className="font-sans text-sm text-obsidian/40 tracking-[0.3em] uppercase mb-16 max-w-xl mx-auto leading-relaxed font-bold">
              Join the official House marketplace. Our premium wizard will help you list in minutes.
            </p>
            <Link
              href="/sell/submit"
              className="inline-block px-18 py-7 bg-obsidian text-silk font-sans text-[11px] font-bold uppercase tracking-[0.4em] rounded-full hover:bg-gold-muted hover:text-obsidian transition-all duration-500 shadow-2xl"
            >
              Launch Sell Wizard
            </Link>
          </div>
        </div>
      </section>

      {/* ── Pricing Table ── */}
      <section className="py-44 bg-obsidian/[0.01] border-y border-obsidian/5">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-24">
            <h2 className="font-serif text-5xl md:text-6xl font-light text-obsidian tracking-tighter">Pricing Guide</h2>
            <p className="font-sans text-[10px] font-bold text-obsidian/20 tracking-[0.5em] uppercase mt-6">Calculated to maximize your return</p>
          </div>
          <div className="resonance-panel overflow-hidden shadow-xl border border-obsidian/5">
            <div className="grid grid-cols-3 border-b border-obsidian/5 bg-obsidian/[0.02]">
              <div className="px-12 py-8 font-sans text-[10px] font-bold tracking-[0.4em] text-obsidian/30 uppercase">Sale Price</div>
              <div className="px-12 py-8 font-sans text-[10px] font-bold tracking-[0.4em] text-obsidian/30 uppercase text-center">Service Fee</div>
              <div className="px-12 py-8 font-sans text-[10px] font-bold tracking-[0.4em] text-obsidian/30 uppercase text-right">Owner Payout</div>
            </div>
            {COMMISSION_TIERS.map((tier, i) => (
              <div key={i} className="grid grid-cols-3 border-b last:border-0 border-obsidian/[0.03] hover:bg-obsidian/[0.01] transition-colors">
                <div className="px-12 py-8 font-sans text-[15px] text-obsidian/60 font-medium">{tier.range}</div>
                <div className="px-12 py-8 font-sans text-[15px] text-obsidian/40 text-center font-medium">{tier.rate}</div>
                <div className="px-12 py-8 font-sans text-[15px] text-gold-muted font-bold text-right">{tier.you}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-44 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="font-serif text-5xl font-light text-obsidian tracking-tighter">Support</h2>
          </div>
          <div className="space-y-6">
            {FAQS.map((faq, i) => (
              <div key={i} className="resonance-panel px-10 py-4 border border-obsidian/5 hover:border-obsidian/10 transition-colors">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between py-6 text-left group">
                  <span className="font-sans text-[15px] text-obsidian/50 group-hover:text-obsidian transition-colors tracking-wide font-medium">{faq.q}</span>
                  <motion.span animate={{ rotate: openFaq === i ? 45 : 0 }} className="text-obsidian/20 text-2xl font-light transition-transform">+</motion.span>
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="pb-10 font-sans text-[15px] text-obsidian/40 leading-relaxed tracking-wide font-medium max-w-2xl">{faq.a}</div>
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
