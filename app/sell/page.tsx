"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";

/* ── Icons ── */
function VerifiedBadge({ size = 16 }: { size?: number }) {
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

function ArrowRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

/* ── Data ── */
const HOW_IT_WORKS_STEPS = [
  { num: "01", title: "Submit Your Gown", desc: "Detail your gown's history, condition, and provide imagery. Our process is designed for discretion and speed." },
  { num: "02", title: "Expert Verification", desc: "The House of Galia Lahav authenticates every submission, ensuring the integrity of our curated marketplace." },
  { num: "03", title: "Global Exposure", desc: "Your couture is showcased to a worldwide audience of high-intent brides seeking the Galia Lahav signature." },
  { num: "04", title: "Secure Handover", desc: "Benefit from insured logistics and secure payment processing. We handle the complexity of the secondary market." },
];

const COMMISSION_TIERS = [
  { range: "Under $3,000", rate: "25%", you: "75%" },
  { range: "$3,000 – $6,000", rate: "20%", you: "80%" },
  { range: "$6,000 – $10,000", rate: "18%", you: "82%" },
  { range: "Over $10,000", rate: "15%", you: "85%" },
];

const FAQS = [
  { q: "Which gowns do you accept?", a: "We exclusively accept Galia Lahav and GALA by Galia Lahav gowns in good or better condition. All collections are welcome — Couture, GALA, and limited editions." },
  { q: "How long does it take to sell?", a: "Most gowns sell within 30–90 days. Featured and popular styles often sell within the first two weeks." },
  { q: "How is pricing determined?", a: "Pricing is based on original retail value, current market demand, and condition. Our team provides expert recommendations to maximize your return." },
  { q: "Do I need to pay anything upfront?", a: "Listing is complimentary. We only earn a commission upon the successful sale of your gown." },
];

const COLLECTIONS_LIST = ["Couture", "GALA by Galia Lahav", "Bridal Couture", "Other"];
const SIZES = ["0", "2", "4", "6", "8", "10", "12", "14", "Custom"];

export default function SellPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [formStep, setFormStep] = useState(0);
  const [formData, setFormData] = useState({
    gownName: "", collection: "", size: "", condition: "",
    originalPrice: "", askingPrice: "", alterations: "",
    name: "", email: "", phone: "", location: "", notes: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="min-h-screen bg-obsidian text-white/90">
      <Navbar />

      <AnimatePresence mode="wait">
        {formStep === 2 ? (
          /* ── Success State ── */
          <motion.section
            key="success"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="pt-48 pb-40 px-6 text-center"
          >
            <div className="max-w-xl mx-auto">
              <div className="w-24 h-24 rounded-full bg-resonance-blue/5 border border-resonance-blue/20 flex items-center justify-center mx-auto mb-10 shadow-[0_0_50px_rgba(59,130,246,0.1)]">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-resonance-blue">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h1 className="font-serif text-5xl font-light tracking-tight mb-6">Submission Received</h1>
              <p className="font-sans text-sm text-white/30 leading-relaxed mb-12">
                Our authentication team will review the details for your <span className="text-white/60">{formData.gownName}</span>. We will contact you via email within 24–48 hours with our evaluation.
              </p>
              <div className="flex justify-center gap-5">
                <Link href="/shop" className="px-10 py-5 bg-white text-obsidian font-sans text-[11px] font-bold uppercase tracking-[0.3em] rounded-full hover:bg-resonance-amber transition-all">
                  Browse Gowns
                </Link>
                <button onClick={() => setFormStep(0)} className="px-10 py-5 border border-white/10 text-white/40 font-sans text-[11px] font-bold uppercase tracking-[0.3em] rounded-full hover:text-white transition-all">
                  Done
                </button>
              </div>
            </div>
          </motion.section>
        ) : (
          <div key="landing">
            {/* ── Hero section ── */}
            <section className="pt-48 pb-32 px-6 md:px-10 overflow-hidden relative">
              <div className="max-w-7xl mx-auto relative z-10">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  className="max-w-4xl"
                >
                  <p className="font-sans text-[10px] font-bold uppercase tracking-[0.5em] text-resonance-amber mb-6">
                    A Legacy Redefined
                  </p>
                  <h1 className="font-serif text-6xl md:text-9xl font-light tracking-tighter text-white/95 leading-[0.85] mb-10">
                    Consign Your <br />
                    <span className="italic">Galia Lahav</span>
                  </h1>
                  <p className="font-sans text-xl text-white/30 tracking-wide max-w-xl leading-relaxed mb-14">
                    The only platform endorsed by the House. Entrust your couture to the experts who designed it, ensuring a premium handover to its next custodian.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-6">
                    <button
                      onClick={() => document.getElementById("consign-form")?.scrollIntoView({ behavior: 'smooth' })}
                      className="px-12 py-6 bg-white text-obsidian font-sans text-[11px] font-bold uppercase tracking-[0.3em] rounded-full hover:bg-resonance-amber transition-all duration-500 text-center shadow-[0_0_60px_rgba(255,255,255,0.05)]"
                    >
                      Start Submission
                    </button>
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
                      <div className="w-14 h-14 rounded-full bg-white/[0.03] border border-white/10 flex items-center justify-center text-xl text-resonance-amber mb-8 shadow-inner">
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
                  <p className="font-sans text-[10px] font-bold uppercase tracking-[0.5em] text-resonance-amber mb-6">The Journey</p>
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

            {/* ── Consignment Form ── */}
            <section id="consign-form" className="py-40 px-6">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-20">
                  <h2 className="font-serif text-5xl md:text-6xl font-light text-white/95 mb-6">Consignment Request</h2>
                  <p className="font-sans text-sm text-white/30 tracking-widest uppercase">Start your gown&apos;s next chapter</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-16">
                  {/* Step 1: The Gown */}
                  <div className="space-y-10">
                    <div className="flex items-center gap-6">
                      <span className="w-10 h-10 rounded-full border border-resonance-amber/30 flex items-center justify-center font-serif text-resonance-amber text-lg">1</span>
                      <h3 className="font-sans text-[10px] font-bold tracking-[0.4em] text-white/40 uppercase">Gown Details</h3>
                      <div className="h-[1px] flex-1 bg-white/[0.05]" />
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="font-sans text-[10px] uppercase tracking-widest text-white/20 ml-2">Gown Name *</label>
                        <input name="gownName" required onChange={handleChange} className="w-full bg-white/[0.02] border border-white/10 rounded-full px-8 py-4 font-sans text-[13px] focus:border-resonance-amber/50 focus:outline-none transition-all" placeholder="e.g. Almeria" />
                      </div>
                      <div className="space-y-2">
                        <label className="font-sans text-[10px] uppercase tracking-widest text-white/20 ml-2">Collection *</label>
                        <select name="collection" required onChange={handleChange} className="w-full bg-white/[0.02] border border-white/10 rounded-full px-8 py-4 font-sans text-[13px] focus:border-resonance-amber/50 focus:outline-none transition-all appearance-none cursor-pointer">
                          <option value="" className="bg-obsidian">Select Collection</option>
                          {COLLECTIONS_LIST.map(c => <option key={c} value={c} className="bg-obsidian">{c}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="font-sans text-[10px] uppercase tracking-widest text-white/20 ml-2">Label Size *</label>
                        <select name="size" required onChange={handleChange} className="w-full bg-white/[0.02] border border-white/10 rounded-full px-8 py-4 font-sans text-[13px] focus:border-resonance-amber/50 focus:outline-none transition-all appearance-none cursor-pointer">
                          <option value="" className="bg-obsidian">Select Size</option>
                          {SIZES.map(s => <option key={s} value={s} className="bg-obsidian">{s}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="font-sans text-[10px] uppercase tracking-widest text-white/20 ml-2">Original Retail (USD) *</label>
                        <input name="originalPrice" type="number" required onChange={handleChange} className="w-full bg-white/[0.02] border border-white/10 rounded-full px-8 py-4 font-sans text-[13px] focus:border-resonance-amber/50 focus:outline-none transition-all" placeholder="e.g. 8500" />
                      </div>
                    </div>
                  </div>

                  {/* Step 2: Contact */}
                  <div className="space-y-10">
                    <div className="flex items-center gap-6">
                      <span className="w-10 h-10 rounded-full border border-resonance-amber/30 flex items-center justify-center font-serif text-resonance-amber text-lg">2</span>
                      <h3 className="font-sans text-[10px] font-bold tracking-[0.4em] text-white/40 uppercase">Your Information</h3>
                      <div className="h-[1px] flex-1 bg-white/[0.05]" />
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="font-sans text-[10px] uppercase tracking-widest text-white/20 ml-2">Full Name *</label>
                        <input name="name" required onChange={handleChange} className="w-full bg-white/[0.02] border border-white/10 rounded-full px-8 py-4 font-sans text-[13px] focus:border-resonance-amber/50 focus:outline-none transition-all" />
                      </div>
                      <div className="space-y-2">
                        <label className="font-sans text-[10px] uppercase tracking-widest text-white/20 ml-2">Email Address *</label>
                        <input name="email" type="email" required onChange={handleChange} className="w-full bg-white/[0.02] border border-white/10 rounded-full px-8 py-4 font-sans text-[13px] focus:border-resonance-amber/50 focus:outline-none transition-all" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="font-sans text-[10px] uppercase tracking-widest text-white/20 ml-2">Additional Notes</label>
                      <textarea name="notes" rows={4} onChange={handleChange} className="w-full bg-white/[0.02] border border-white/10 rounded-3xl px-8 py-6 font-sans text-[13px] focus:border-resonance-amber/50 focus:outline-none transition-all resize-none" placeholder="e.g. Minor customizations, veil included, professional cleaning status..." />
                    </div>
                  </div>

                  <div className="pt-10 flex flex-col items-center">
                    <button type="submit" className="px-16 py-6 bg-white text-obsidian font-sans text-[11px] font-bold uppercase tracking-[0.4em] rounded-full hover:bg-resonance-amber transition-all duration-500 shadow-[0_0_50px_rgba(255,255,255,0.05)]">
                      Submit for Approval
                    </button>
                    <p className="font-sans text-[9px] text-white/15 mt-6 tracking-[0.2em] uppercase">
                      By submitting, you agree to the House of Galia Lahav consignment terms.
                    </p>
                  </div>
                </form>
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
                      <div className="px-10 py-6 font-sans text-sm text-resonance-amber font-medium text-right">{tier.you}</div>
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
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </main>
  );
}
