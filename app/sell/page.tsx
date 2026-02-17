"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";

/* ── Icons (consistent with rest of site) ── */
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

/* ── Luxury divider (matches homepage) ── */
function LuxuryDivider() {
  return (
    <div className="flex items-center gap-4 my-6">
      <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-gold-muted/30" />
      <div className="w-1 h-1 rounded-full bg-gold-muted/40" />
      <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-gold-muted/30" />
    </div>
  );
}

/* ── Data ── */
const HOW_IT_WORKS_STEPS = [
  { num: "01", title: "Submit Your Gown", desc: "Tell us about your Galia Lahav gown — collection, condition, and photos. Takes under 5 minutes." },
  { num: "02", title: "We Authenticate & List", desc: "Our GL experts verify authenticity and create a premium listing with photography guidance." },
  { num: "03", title: "Your Gown Sells", desc: "We handle inquiries, negotiations, and payment processing. You approve every offer." },
  { num: "04", title: "Ship & Get Paid", desc: "We provide insured shipping labels. Payment released within 3 business days of buyer confirmation." },
];

const COMMISSION_TIERS = [
  { range: "Under $3,000", rate: "25%", you: "75%" },
  { range: "$3,000 – $6,000", rate: "20%", you: "80%" },
  { range: "$6,000 – $10,000", rate: "18%", you: "82%" },
  { range: "Over $10,000", rate: "15%", you: "85%" },
];

const TRUST_POINTS = [
  "Every gown verified by Galia Lahav experts",
  "Professional listing with optimized photography",
  "Secure payment processing & buyer vetting",
  "Insured white-glove shipping with tracking",
  "14-day buyer protection program",
  "Dedicated seller support throughout",
];

const FAQS = [
  { q: "Which gowns do you accept?", a: "We exclusively accept Galia Lahav and GALA by Galia Lahav gowns in good or better condition. All collections are welcome — Couture, GALA, and limited editions." },
  { q: "How long does it take to sell?", a: "Most gowns sell within 30–90 days. Featured and popular styles often sell within the first two weeks. Pricing competitively significantly speeds up the process." },
  { q: "How is pricing determined?", a: "We recommend pricing based on original retail, condition, demand, and market data. You always have final say on the listing price and can adjust it anytime." },
  { q: "What condition does my gown need to be in?", a: "We accept gowns in 'Good' condition or better. Minor alterations are fine. Gowns should be clean and free of significant damage." },
  { q: "Do I need to pay anything upfront?", a: "No. Listing is completely free. We only earn our commission when your gown sells. Zero upfront costs or hidden fees." },
  { q: "How does shipping work?", a: "Once your gown sells, we send you a pre-paid, insured shipping label. Simply pack your gown following our guidelines and drop it off at the carrier." },
];

const GOWN_CONDITIONS = [
  "New — Never Worn (tags attached)",
  "New — Never Worn (tags removed)",
  "Excellent — Worn once, no alterations",
  "Very Good — Worn once, minor alterations",
  "Good — Worn, visible wear or alterations",
];
const COLLECTIONS_LIST = ["Couture", "GALA by Galia Lahav", "Bridal Couture", "Dancing Queen", "Do Not Disturb", "Victorian Affinity", "Queen of Hearts", "Fancy White", "Alegria", "Other / Not Sure"];
const SIZES = ["0", "2", "4", "6", "8", "10", "12", "14", "16", "18", "Custom"];

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
    <main className="min-h-screen bg-obsidian">
      <Navbar />

      {/* ── Success State ── */}
      {formStep === 2 && (
        <section className="pt-32 pb-20 px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto text-center"
          >
            <div className="w-20 h-20 rounded-full border border-emerald-500/30 flex items-center justify-center mx-auto mb-8">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-emerald-400">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h1 className="font-serif text-4xl md:text-5xl font-light text-white/90 mb-4 tracking-wider">
              Submission Received
            </h1>
            <p className="font-sans text-sm text-white/40 mb-4 leading-relaxed">
              Thank you, {formData.name.split(" ")[0] || "there"}. We&apos;ve received your consignment request
              for your <span className="text-champagne">{formData.gownName || "Galia Lahav"}</span> gown.
            </p>
            <p className="font-sans text-xs text-white/25 mb-10">
              Our authentication team will review your submission and respond within 24–48 hours.
            </p>

            <div className="border border-white/10 p-8 text-left mb-10">
              <h3 className="font-sans text-[10px] tracking-[0.3em] text-gold-muted/60 uppercase mb-6">What Happens Next</h3>
              <div className="space-y-4">
                {["We review your gown details and photos", "Our team sends you a pricing recommendation", "You approve the listing and we go live", "Inquiries start coming in"].map((step, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <span className="font-sans text-[10px] text-white/20 mt-0.5 tracking-widest">{String(i + 1).padStart(2, "0")}</span>
                    <span className="font-sans text-sm text-white/50">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <Link href="/shop" className="px-8 py-3 border border-white/15 font-sans text-xs uppercase tracking-[0.2em] text-white/50 hover:text-white hover:border-white/30 transition-all">
                BROWSE GOWNS
              </Link>
              <button
                onClick={() => { setFormStep(0); setFormData({ gownName: "", collection: "", size: "", condition: "", originalPrice: "", askingPrice: "", alterations: "", name: "", email: "", phone: "", location: "", notes: "" }); }}
                className="px-8 py-3 bg-white text-obsidian font-sans text-xs uppercase tracking-[0.2em] hover:bg-champagne transition-all"
              >
                SUBMIT ANOTHER
              </button>
            </div>
          </motion.div>
        </section>
      )}

      {formStep < 2 && (
        <>
          {/* ── Hero ── */}
          <section className="pt-28 pb-16 px-6">
            <div className="max-w-4xl mx-auto text-center">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-sans text-[10px] uppercase tracking-[0.5em] text-gold-muted/50 mb-4"
              >
                Consign with RE:GALIA
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="font-serif text-5xl md:text-7xl font-light text-white/90 mb-6 tracking-wider leading-tight"
              >
                Give Your Gown<br />
                <span className="italic text-champagne/80">a Second Chapter</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="font-sans text-sm text-white/35 max-w-xl mx-auto mb-10 leading-relaxed"
              >
                Your Galia Lahav gown deserves another moment in the spotlight.
                List it on the only marketplace dedicated exclusively to GL brides —
                and let another bride fall in love.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <button
                  onClick={() => { window.location.href = '/sell/submit'; }}
                  className="group relative px-10 py-3.5 bg-white text-obsidian font-sans text-sm uppercase tracking-[0.25em] overflow-hidden transition-all duration-500 hover:shadow-[0_0_40px_rgba(201,169,110,0.15)] inline-flex items-center justify-center gap-3"
                >
                  <span className="relative z-10">Start Consigning</span>
                  <span className="relative z-10"><ArrowRight /></span>
                  <div className="absolute inset-0 bg-champagne translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                </button>
                <a
                  href="#how-it-works"
                  className="px-10 py-3.5 border border-white/20 font-sans text-sm uppercase tracking-[0.25em] text-white/60 hover:text-white hover:border-white/40 transition-all duration-500 text-center"
                >
                  How It Works
                </a>
              </motion.div>
            </div>
          </section>

          {/* ── Stats Bar ── */}
          <section className="border-y border-white/5">
            <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4">
              {[
                { val: "500+", label: "Gowns Sold" },
                { val: "45 Days", label: "Avg. Time to Sell" },
                { val: "$4,200", label: "Avg. Seller Payout" },
                { val: "98%", label: "Seller Satisfaction" },
              ].map((stat, i) => (
                <div key={i} className="py-8 px-6 text-center border-r border-white/5 last:border-r-0">
                  <div className="font-serif text-2xl md:text-3xl font-light text-white/80 mb-1">{stat.val}</div>
                  <div className="font-sans text-[9px] tracking-[0.3em] text-white/25 uppercase">{stat.label}</div>
                </div>
              ))}
            </div>
          </section>

          {/* ── How It Works ── */}
          <section id="how-it-works" className="py-20 px-6">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-14">
                <p className="font-sans text-[10px] uppercase tracking-[0.5em] text-gold-muted/50 mb-3">The Process</p>
                <h2 className="font-serif text-3xl md:text-5xl font-light text-white/90 tracking-wider">
                  How Consigning Works
                </h2>
                <LuxuryDivider />
                <p className="font-sans text-sm text-white/30 max-w-lg mx-auto">
                  From submission to payout — we handle everything so you don&apos;t have to.
                </p>
              </div>

              <div className="grid md:grid-cols-4 gap-10">
                {HOW_IT_WORKS_STEPS.map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="text-center"
                  >
                    <div className="w-14 h-14 rounded-full border border-white/10 flex items-center justify-center mx-auto mb-5">
                      <span className="font-serif text-lg text-gold-muted/60">{step.num}</span>
                    </div>
                    <h3 className="font-serif text-lg text-white/80 mb-2 tracking-wide">{step.title}</h3>
                    <p className="font-sans text-xs text-white/30 leading-relaxed">{step.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* ── Commission Table ── */}
          <section className="py-20 px-6 border-y border-white/5">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-12">
                <p className="font-sans text-[10px] uppercase tracking-[0.5em] text-gold-muted/50 mb-3">Pricing</p>
                <h2 className="font-serif text-3xl md:text-5xl font-light text-white/90 tracking-wider">
                  Transparent Fees
                </h2>
                <LuxuryDivider />
                <p className="font-sans text-sm text-white/30 max-w-lg mx-auto">
                  No hidden fees. No upfront costs. We only earn when you do.
                </p>
              </div>

              <div className="border border-white/10 overflow-hidden">
                <div className="grid grid-cols-3 bg-white/5">
                  <div className="px-6 py-4 font-sans text-[10px] tracking-[0.25em] text-white/40 uppercase">Sale Price</div>
                  <div className="px-6 py-4 font-sans text-[10px] tracking-[0.25em] text-white/40 uppercase text-center">Our Fee</div>
                  <div className="px-6 py-4 font-sans text-[10px] tracking-[0.25em] text-white/40 uppercase text-right">You Keep</div>
                </div>
                {COMMISSION_TIERS.map((tier, i) => (
                  <div key={i} className="grid grid-cols-3 border-t border-white/5 hover:bg-white/[0.02] transition-colors">
                    <div className="px-6 py-5 font-sans text-sm text-white/50">{tier.range}</div>
                    <div className="px-6 py-5 font-sans text-sm text-white/30 text-center">{tier.rate}</div>
                    <div className="px-6 py-5 font-sans text-sm text-champagne/80 font-medium text-right">{tier.you}</div>
                  </div>
                ))}
              </div>
              <p className="font-sans text-[10px] text-white/15 text-center mt-4 tracking-wider">
                Commission is calculated on the final sale price. Shipping costs are covered by the buyer.
              </p>
            </div>
          </section>

          {/* ── Trust Points ── */}
          <section className="py-20 px-6">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <p className="font-sans text-[10px] uppercase tracking-[0.5em] text-gold-muted/50 mb-3">Why RE:GALIA</p>
                <h2 className="font-serif text-3xl md:text-5xl font-light text-white/90 tracking-wider">
                  The GL Standard
                </h2>
                <LuxuryDivider />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {TRUST_POINTS.map((point, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-start gap-4 border border-white/5 p-5 hover:border-white/10 transition-colors"
                  >
                    <span className="text-gold-muted shrink-0 mt-0.5"><VerifiedBadge size={16} /></span>
                    <span className="font-sans text-sm text-white/50">{point}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* ── Consignment Form ── */}
          <section id="consign-form" className="py-20 px-6 border-y border-white/5">
            <div className="max-w-3xl mx-auto">
              <AnimatePresence mode="wait">
                {formStep === 0 ? (
                  <motion.div key="cta" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
                    <h2 className="font-serif text-3xl md:text-4xl font-light text-white/90 mb-4 tracking-wider">
                      Ready to List Your Gown?
                    </h2>
                    <p className="font-sans text-sm text-white/30 mb-8 max-w-md mx-auto">
                      It takes less than 5 minutes. Tell us about your Galia Lahav gown and we&apos;ll take care of the rest.
                    </p>
                    <button
                      onClick={() => setFormStep(1)}
                      className="group relative px-12 py-3.5 bg-white text-obsidian font-sans text-sm uppercase tracking-[0.25em] overflow-hidden transition-all inline-flex items-center gap-3"
                    >
                      <span className="relative z-10">Start Your Submission</span>
                      <span className="relative z-10"><ArrowRight /></span>
                      <div className="absolute inset-0 bg-champagne translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                    </button>
                  </motion.div>
                ) : (
                  <motion.div key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                    <h2 className="font-serif text-3xl font-light text-white/90 mb-2 tracking-wider">
                      Consignment Submission
                    </h2>
                    <p className="font-sans text-xs text-white/25 mb-10 tracking-wider">
                      All fields marked with * are required
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-12">
                      {/* Gown Details */}
                      <div>
                        <h3 className="font-sans text-[10px] tracking-[0.35em] text-gold-muted/50 uppercase mb-6 pb-2 border-b border-white/5">
                          Gown Details
                        </h3>
                        <div className="grid md:grid-cols-2 gap-5">
                          <div>
                            <label className="block font-sans text-xs text-white/40 mb-2 tracking-wider">Gown Name / Style *</label>
                            <input type="text" name="gownName" value={formData.gownName} onChange={handleChange} required placeholder="e.g. Almeria, Brianna" className="w-full px-4 py-3 border border-white/10 bg-white/[0.03] text-white/80 placeholder:text-white/15 font-sans text-sm focus:outline-none focus:border-gold-muted/40 transition-colors" />
                          </div>
                          <div>
                            <label className="block font-sans text-xs text-white/40 mb-2 tracking-wider">Collection *</label>
                            <select name="collection" value={formData.collection} onChange={handleChange} required className="w-full px-4 py-3 border border-white/10 bg-white/[0.03] text-white/80 font-sans text-sm focus:outline-none focus:border-gold-muted/40 transition-colors">
                              <option value="" className="bg-obsidian">Select collection</option>
                              {COLLECTIONS_LIST.map((c) => (<option key={c} value={c} className="bg-obsidian">{c}</option>))}
                            </select>
                          </div>
                          <div>
                            <label className="block font-sans text-xs text-white/40 mb-2 tracking-wider">Size *</label>
                            <select name="size" value={formData.size} onChange={handleChange} required className="w-full px-4 py-3 border border-white/10 bg-white/[0.03] text-white/80 font-sans text-sm focus:outline-none focus:border-gold-muted/40 transition-colors">
                              <option value="" className="bg-obsidian">Select size</option>
                              {SIZES.map((s) => (<option key={s} value={s} className="bg-obsidian">{s}</option>))}
                            </select>
                          </div>
                          <div>
                            <label className="block font-sans text-xs text-white/40 mb-2 tracking-wider">Condition *</label>
                            <select name="condition" value={formData.condition} onChange={handleChange} required className="w-full px-4 py-3 border border-white/10 bg-white/[0.03] text-white/80 font-sans text-sm focus:outline-none focus:border-gold-muted/40 transition-colors">
                              <option value="" className="bg-obsidian">Select condition</option>
                              {GOWN_CONDITIONS.map((c) => (<option key={c} value={c} className="bg-obsidian">{c}</option>))}
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Pricing */}
                      <div>
                        <h3 className="font-sans text-[10px] tracking-[0.35em] text-gold-muted/50 uppercase mb-6 pb-2 border-b border-white/5">
                          Pricing
                        </h3>
                        <div className="grid md:grid-cols-2 gap-5">
                          <div>
                            <label className="block font-sans text-xs text-white/40 mb-2 tracking-wider">Original Retail Price (USD) *</label>
                            <input type="number" name="originalPrice" value={formData.originalPrice} onChange={handleChange} required placeholder="e.g. 8500" className="w-full px-4 py-3 border border-white/10 bg-white/[0.03] text-white/80 placeholder:text-white/15 font-sans text-sm focus:outline-none focus:border-gold-muted/40 transition-colors" />
                          </div>
                          <div>
                            <label className="block font-sans text-xs text-white/40 mb-2 tracking-wider">Your Asking Price (USD)</label>
                            <input type="number" name="askingPrice" value={formData.askingPrice} onChange={handleChange} placeholder="Leave blank for our recommendation" className="w-full px-4 py-3 border border-white/10 bg-white/[0.03] text-white/80 placeholder:text-white/15 font-sans text-sm focus:outline-none focus:border-gold-muted/40 transition-colors" />
                          </div>
                        </div>
                        <div className="mt-5">
                          <label className="block font-sans text-xs text-white/40 mb-2 tracking-wider">Alterations Made</label>
                          <input type="text" name="alterations" value={formData.alterations} onChange={handleChange} placeholder="e.g. Hemmed, taken in at waist, bustle added" className="w-full px-4 py-3 border border-white/10 bg-white/[0.03] text-white/80 placeholder:text-white/15 font-sans text-sm focus:outline-none focus:border-gold-muted/40 transition-colors" />
                        </div>
                      </div>

                      {/* Contact Info */}
                      <div>
                        <h3 className="font-sans text-[10px] tracking-[0.35em] text-gold-muted/50 uppercase mb-6 pb-2 border-b border-white/5">
                          Your Information
                        </h3>
                        <div className="grid md:grid-cols-2 gap-5">
                          <div>
                            <label className="block font-sans text-xs text-white/40 mb-2 tracking-wider">Full Name *</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full px-4 py-3 border border-white/10 bg-white/[0.03] text-white/80 font-sans text-sm focus:outline-none focus:border-gold-muted/40 transition-colors" />
                          </div>
                          <div>
                            <label className="block font-sans text-xs text-white/40 mb-2 tracking-wider">Email *</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full px-4 py-3 border border-white/10 bg-white/[0.03] text-white/80 font-sans text-sm focus:outline-none focus:border-gold-muted/40 transition-colors" />
                          </div>
                          <div>
                            <label className="block font-sans text-xs text-white/40 mb-2 tracking-wider">Phone</label>
                            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-3 border border-white/10 bg-white/[0.03] text-white/80 font-sans text-sm focus:outline-none focus:border-gold-muted/40 transition-colors" />
                          </div>
                          <div>
                            <label className="block font-sans text-xs text-white/40 mb-2 tracking-wider">Location *</label>
                            <input type="text" name="location" value={formData.location} onChange={handleChange} required placeholder="City, Country" className="w-full px-4 py-3 border border-white/10 bg-white/[0.03] text-white/80 placeholder:text-white/15 font-sans text-sm focus:outline-none focus:border-gold-muted/40 transition-colors" />
                          </div>
                        </div>
                        <div className="mt-5">
                          <label className="block font-sans text-xs text-white/40 mb-2 tracking-wider">Additional Notes</label>
                          <textarea name="notes" value={formData.notes} onChange={handleChange} rows={3} placeholder="Anything else we should know about your gown?" className="w-full px-4 py-3 border border-white/10 bg-white/[0.03] text-white/80 placeholder:text-white/15 font-sans text-sm focus:outline-none focus:border-gold-muted/40 transition-colors resize-none" />
                        </div>
                      </div>

                      {/* Submit */}
                      <div className="pt-2">
                        <button type="submit" className="group relative w-full py-4 bg-white text-obsidian font-sans text-sm uppercase tracking-[0.25em] overflow-hidden transition-all hover:shadow-[0_0_40px_rgba(201,169,110,0.15)] flex items-center justify-center gap-3">
                          <span className="relative z-10">Submit for Review</span>
                          <span className="relative z-10"><ArrowRight /></span>
                          <div className="absolute inset-0 bg-champagne translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                        </button>
                        <p className="font-sans text-[10px] text-white/15 text-center mt-4 tracking-wider">
                          By submitting, you agree to our consignment terms. We&apos;ll respond within 24–48 hours.
                        </p>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>

          {/* ── FAQ ── */}
          <section className="py-20 px-6">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="font-serif text-3xl md:text-4xl font-light text-white/90 tracking-wider">
                  Frequently Asked Questions
                </h2>
                <LuxuryDivider />
              </div>
              <div className="space-y-2">
                {FAQS.map((faq, i) => (
                  <div key={i} className="border border-white/5 hover:border-white/10 transition-colors">
                    <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between px-6 py-5 text-left">
                      <span className="font-sans text-sm text-white/60 pr-4">{faq.q}</span>
                      <motion.span animate={{ rotate: openFaq === i ? 45 : 0 }} transition={{ duration: 0.2 }} className="text-white/20 text-lg leading-none shrink-0">+</motion.span>
                    </button>
                    <AnimatePresence>
                      {openFaq === i && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                          <div className="px-6 pb-5 font-sans text-xs text-white/30 leading-relaxed">{faq.a}</div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── Final CTA ── */}
          <section className="py-20 px-6 border-t border-white/5">
            <div className="max-w-3xl mx-auto text-center">
              <p className="font-sans text-[10px] uppercase tracking-[0.5em] text-gold-muted/40 mb-4">
                Exclusively for Galia Lahav Gowns
              </p>
              <h2 className="font-serif text-3xl md:text-5xl font-light text-white/90 mb-4 tracking-wider">
                Your Gown&apos;s Next Chapter<br />Starts Here
              </h2>
              <LuxuryDivider />
              <p className="font-sans text-sm text-white/25 mb-8 max-w-md mx-auto">
                Join hundreds of GL brides who have found the perfect new home for their gowns.
              </p>
              <button
                onClick={() => { window.location.href = '/sell/submit'; }}
                className="group relative px-12 py-3.5 bg-white text-obsidian font-sans text-sm uppercase tracking-[0.25em] overflow-hidden transition-all inline-flex items-center gap-3"
              >
                <span className="relative z-10">Consign Your Gown</span>
                <span className="relative z-10"><ArrowRight /></span>
                <div className="absolute inset-0 bg-champagne translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              </button>
            </div>
          </section>
        </>
      )}

      <Footer />
    </main>
  );
}
