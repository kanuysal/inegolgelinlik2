"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

/* ── icons ── */
function CheckCircle() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function ArrowRight() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

function DollarIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function TruckIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="15" height="13" />
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  );
}

/* ── data ── */
const HOW_IT_WORKS_STEPS = [
  {
    num: "01",
    title: "Submit Your Gown",
    desc: "Tell us about your gown — designer, collection, condition, and photos. Takes under 5 minutes.",
    icon: <CameraIcon />,
  },
  {
    num: "02",
    title: "We Authenticate & List",
    desc: "Our experts verify authenticity and create a premium listing with professional photography guidance.",
    icon: <ShieldIcon />,
  },
  {
    num: "03",
    title: "Your Gown Sells",
    desc: "We handle inquiries, negotiations, and payment processing. You approve every offer.",
    icon: <SparkleIcon />,
  },
  {
    num: "04",
    title: "Ship & Get Paid",
    desc: "We provide insured shipping labels. Payment is released within 3 business days of buyer confirmation.",
    icon: <DollarIcon />,
  },
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
  "Insured shipping with tracking",
  "14-day buyer protection program",
  "Dedicated seller support throughout",
];

const FAQS = [
  {
    q: "Which gowns do you accept?",
    a: "We exclusively accept Galia Lahav and GALA by Galia Lahav gowns in good or better condition. All collections are welcome — Couture, GALA, and limited editions.",
  },
  {
    q: "How long does it take to sell?",
    a: "Most gowns sell within 30–90 days. Featured and popular styles often sell within the first two weeks. Pricing competitively significantly speeds up the process.",
  },
  {
    q: "How is pricing determined?",
    a: "We recommend pricing based on original retail, condition, demand, and market data. You always have final say on the listing price and can adjust it anytime.",
  },
  {
    q: "What condition does my gown need to be in?",
    a: "We accept gowns in 'Good' condition or better. Minor alterations are fine. Gowns should be clean (professionally cleaned is ideal) and free of significant damage.",
  },
  {
    q: "Do I need to pay anything upfront?",
    a: "No. Listing is completely free. We only earn our commission when your gown sells. There are zero upfront costs or hidden fees.",
  },
  {
    q: "How does shipping work?",
    a: "Once your gown sells, we send you a pre-paid, insured shipping label. Simply pack your gown following our guidelines and drop it off at the carrier. We handle everything else.",
  },
];

/* ── consign form fields ── */
const GOWN_CONDITIONS = ["New — Never Worn (tags attached)", "New — Never Worn (tags removed)", "Excellent — Worn once, no alterations", "Very Good — Worn once, minor alterations", "Good — Worn, visible wear or alterations"];
const COLLECTIONS_LIST = ["Couture", "GALA by Galia Lahav", "Bridal Couture", "Dancing Queen", "Do Not Disturb", "Victorian Affinity", "Queen of Hearts", "Fancy White", "Alegria", "Other / Not Sure"];
const SIZES = ["0", "2", "4", "6", "8", "10", "12", "14", "16", "18", "Custom"];

export default function SellPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [formStep, setFormStep] = useState(0); // 0 = info, 1 = form, 2 = success
  const [formData, setFormData] = useState({
    gownName: "",
    collection: "",
    size: "",
    condition: "",
    originalPrice: "",
    askingPrice: "",
    alterations: "",
    name: "",
    email: "",
    phone: "",
    location: "",
    notes: "",
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
    <main className="min-h-screen bg-[#faf9f7]">
      {/* ── nav bar ── */}
      <nav className="fixed top-0 w-full z-50 bg-[#faf9f7]/90 backdrop-blur-md border-b border-[#e8e4df]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl tracking-[0.3em] font-light text-[#1a1a1a]">
            RE:GALIA
          </Link>
          <div className="flex items-center gap-8">
            <Link href="/shop" className="text-sm tracking-widest text-[#6b6560] hover:text-[#1a1a1a] transition-colors">
              SHOP
            </Link>
            <Link href="/sell" className="text-sm tracking-widest text-[#1a1a1a] font-medium border-b border-[#1a1a1a] pb-0.5">
              SELL
            </Link>
          </div>
        </div>
      </nav>

      {/* ── success state ── */}
      {formStep === 2 && (
        <section className="pt-32 pb-20 px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto text-center"
          >
            <div className="w-20 h-20 rounded-full bg-[#1a1a1a] flex items-center justify-center mx-auto mb-8">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#faf9f7" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h1 className="text-4xl md:text-5xl font-light text-[#1a1a1a] mb-4 tracking-tight">
              Submission Received
            </h1>
            <p className="text-lg text-[#6b6560] mb-4 leading-relaxed">
              Thank you, {formData.name.split(" ")[0] || "there"}. We&apos;ve received your consignment request for your <span className="text-[#1a1a1a]">{formData.gownName || "Galia Lahav"}</span> gown.
            </p>
            <p className="text-[#8a8580] mb-10">
              Our authentication team will review your submission and respond within 24–48 hours with next steps.
            </p>
            <div className="bg-white rounded-xl p-8 border border-[#e8e4df] text-left mb-10">
              <h3 className="text-sm tracking-widest text-[#8a8580] mb-4 uppercase">What happens next</h3>
              <div className="space-y-4">
                {[
                  "We review your gown details and photos",
                  "Our team sends you a pricing recommendation",
                  "You approve the listing and we go live",
                  "Inquiries start coming in",
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-xs text-[#8a8580] mt-1 font-medium">{String(i + 1).padStart(2, "0")}</span>
                    <span className="text-[#3a3530]">{step}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-4 justify-center">
              <Link
                href="/shop"
                className="px-8 py-3 border border-[#1a1a1a] text-[#1a1a1a] text-sm tracking-widest hover:bg-[#1a1a1a] hover:text-white transition-all"
              >
                BROWSE GOWNS
              </Link>
              <button
                onClick={() => { setFormStep(0); setFormData({ gownName: "", collection: "", size: "", condition: "", originalPrice: "", askingPrice: "", alterations: "", name: "", email: "", phone: "", location: "", notes: "" }); }}
                className="px-8 py-3 bg-[#1a1a1a] text-white text-sm tracking-widest hover:bg-[#2a2a2a] transition-all"
              >
                SUBMIT ANOTHER
              </button>
            </div>
          </motion.div>
        </section>
      )}

      {formStep < 2 && (
        <>
          {/* ── hero ── */}
          <section className="pt-28 pb-16 px-6">
            <div className="max-w-4xl mx-auto text-center">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs tracking-[0.35em] text-[#8a8580] uppercase mb-4"
              >
                Consign with RE:GALIA
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl md:text-6xl font-light text-[#1a1a1a] mb-6 tracking-tight leading-[1.1]"
              >
                Give Your Gown<br />
                <span className="italic">a Second Chapter</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg text-[#6b6560] max-w-2xl mx-auto mb-10 leading-relaxed"
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
                  onClick={() => { setFormStep(1); document.getElementById("consign-form")?.scrollIntoView({ behavior: "smooth" }); }}
                  className="px-10 py-4 bg-[#1a1a1a] text-white text-sm tracking-[0.2em] hover:bg-[#2a2a2a] transition-all flex items-center justify-center gap-3"
                >
                  START CONSIGNING <ArrowRight />
                </button>
                <a
                  href="#how-it-works"
                  className="px-10 py-4 border border-[#1a1a1a] text-[#1a1a1a] text-sm tracking-[0.2em] hover:bg-[#1a1a1a] hover:text-white transition-all text-center"
                >
                  HOW IT WORKS
                </a>
              </motion.div>
            </div>
          </section>

          {/* ── stats bar ── */}
          <section className="border-y border-[#e8e4df] bg-white">
            <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4">
              {[
                { val: "500+", label: "Gowns Sold" },
                { val: "45 Days", label: "Avg. Time to Sell" },
                { val: "$4,200", label: "Avg. Seller Payout" },
                { val: "98%", label: "Seller Satisfaction" },
              ].map((stat, i) => (
                <div key={i} className="py-8 px-6 text-center border-r border-[#e8e4df] last:border-r-0">
                  <div className="text-2xl md:text-3xl font-light text-[#1a1a1a] mb-1">{stat.val}</div>
                  <div className="text-xs tracking-widest text-[#8a8580] uppercase">{stat.label}</div>
                </div>
              ))}
            </div>
          </section>

          {/* ── how it works ── */}
          <section id="how-it-works" className="py-20 px-6">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-light text-[#1a1a1a] text-center mb-4 tracking-tight">
                How Consigning Works
              </h2>
              <p className="text-[#6b6560] text-center mb-14 max-w-xl mx-auto">
                From submission to payout — we handle everything so you don&apos;t have to.
              </p>
              <div className="grid md:grid-cols-4 gap-8">
                {HOW_IT_WORKS_STEPS.map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="text-center"
                  >
                    <div className="w-16 h-16 rounded-full border border-[#d4cfc9] flex items-center justify-center mx-auto mb-5 text-[#6b6560]">
                      {step.icon}
                    </div>
                    <div className="text-xs text-[#b5afa8] tracking-widest mb-2">{step.num}</div>
                    <h3 className="text-lg font-medium text-[#1a1a1a] mb-2">{step.title}</h3>
                    <p className="text-sm text-[#6b6560] leading-relaxed">{step.desc}</p>
                    {i < 3 && (
                      <div className="hidden md:block mt-6 text-[#d4cfc9]">
                        <ArrowRight />
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* ── commission table ── */}
          <section className="py-20 px-6 bg-white border-y border-[#e8e4df]">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-light text-[#1a1a1a] text-center mb-4 tracking-tight">
                Transparent Pricing
              </h2>
              <p className="text-[#6b6560] text-center mb-12 max-w-xl mx-auto">
                No hidden fees. No upfront costs. We only earn when you do.
              </p>
              <div className="border border-[#e8e4df] rounded-xl overflow-hidden">
                <div className="grid grid-cols-3 bg-[#1a1a1a] text-white">
                  <div className="px-6 py-4 text-xs tracking-widest uppercase">Sale Price</div>
                  <div className="px-6 py-4 text-xs tracking-widest uppercase text-center">Our Fee</div>
                  <div className="px-6 py-4 text-xs tracking-widest uppercase text-right">You Keep</div>
                </div>
                {COMMISSION_TIERS.map((tier, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-3 border-b border-[#e8e4df] last:border-b-0 hover:bg-[#faf9f7] transition-colors"
                  >
                    <div className="px-6 py-5 text-[#3a3530]">{tier.range}</div>
                    <div className="px-6 py-5 text-[#8a8580] text-center">{tier.rate}</div>
                    <div className="px-6 py-5 text-[#1a1a1a] font-medium text-right">{tier.you}</div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-[#b5afa8] text-center mt-4">
                Commission is calculated on the final sale price. Shipping costs are covered by the buyer.
              </p>
            </div>
          </section>

          {/* ── trust points ── */}
          <section className="py-20 px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-light text-[#1a1a1a] text-center mb-12 tracking-tight">
                Why Consign with RE:GALIA
              </h2>
              <div className="grid md:grid-cols-2 gap-5">
                {TRUST_POINTS.map((point, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-start gap-4 bg-white rounded-xl p-5 border border-[#e8e4df]"
                  >
                    <span className="text-[#1a1a1a] mt-0.5 shrink-0"><CheckCircle /></span>
                    <span className="text-[#3a3530]">{point}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* ── consignment form ── */}
          <section id="consign-form" className="py-20 px-6 bg-white border-y border-[#e8e4df]">
            <div className="max-w-3xl mx-auto">
              <AnimatePresence mode="wait">
                {formStep === 0 ? (
                  <motion.div
                    key="cta"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center"
                  >
                    <h2 className="text-3xl md:text-4xl font-light text-[#1a1a1a] mb-4 tracking-tight">
                      Ready to List Your Gown?
                    </h2>
                    <p className="text-[#6b6560] mb-8 max-w-lg mx-auto">
                      It takes less than 5 minutes. Tell us about your gown and we&apos;ll take care of the rest.
                    </p>
                    <button
                      onClick={() => setFormStep(1)}
                      className="px-12 py-4 bg-[#1a1a1a] text-white text-sm tracking-[0.2em] hover:bg-[#2a2a2a] transition-all inline-flex items-center gap-3"
                    >
                      START YOUR SUBMISSION <ArrowRight />
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <h2 className="text-3xl font-light text-[#1a1a1a] mb-2 tracking-tight">
                      Consignment Submission
                    </h2>
                    <p className="text-[#8a8580] mb-10">All fields marked with * are required</p>

                    <form onSubmit={handleSubmit} className="space-y-10">
                      {/* gown details */}
                      <div>
                        <h3 className="text-xs tracking-[0.3em] text-[#8a8580] uppercase mb-6 pb-2 border-b border-[#e8e4df]">
                          Gown Details
                        </h3>
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm text-[#3a3530] mb-2">Gown Name / Style *</label>
                            <input
                              type="text"
                              name="gownName"
                              value={formData.gownName}
                              onChange={handleChange}
                              required
                              placeholder="e.g. Almeria, Brianna,?"
                              className="w-full px-4 py-3 border border-[#d4cfc9] rounded-lg bg-[#faf9f7] text-[#1a1a1a] placeholder:text-[#b5afa8] focus:outline-none focus:border-[#1a1a1a] transition-colors"
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-[#3a3530] mb-2">Collection *</label>
                            <select
                              name="collection"
                              value={formData.collection}
                              onChange={handleChange}
                              required
                              className="w-full px-4 py-3 border border-[#d4cfc9] rounded-lg bg-[#faf9f7] text-[#1a1a1a] focus:outline-none focus:border-[#1a1a1a] transition-colors"
                            >
                              <option value="">Select collection</option>
                              {COLLECTIONS_LIST.map((c) => (
                                <option key={c} value={c}>{c}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm text-[#3a3530] mb-2">Size *</label>
                            <select
                              name="size"
                              value={formData.size}
                              onChange={handleChange}
                              required
                              className="w-full px-4 py-3 border border-[#d4cfc9] rounded-lg bg-[#faf9f7] text-[#1a1a1a] focus:outline-none focus:border-[#1a1a1a] transition-colors"
                            >
                              <option value="">Select size</option>
                              {SIZES.map((s) => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm text-[#3a3530] mb-2">Condition *</label>
                            <select
                              name="condition"
                              value={formData.condition}
                              onChange={handleChange}
                              required
                              className="w-full px-4 py-3 border border-[#d4cfc9] rounded-lg bg-[#faf9f7] text-[#1a1a1a] focus:outline-none focus:border-[#1a1a1a] transition-colors"
                            >
                              <option value="">Select condition</option>
                              {GOWN_CONDITIONS.map((c) => (
                                <option key={c} value={c}>{c}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* pricing */}
                      <div>
                        <h3 className="text-xs tracking-[0.3em] text-[#8a8580] uppercase mb-6 pb-2 border-b border-[#e8e4df]">
                          Pricing
                        </h3>
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm text-[#3a3530] mb-2">Original Retail Price (USD) *</label>
                            <input
                              type="number"
                              name="originalPrice"
                              value={formData.originalPrice}
                              onChange={handleChange}
                              required
                              placeholder="e.g. 8500"
                              className="w-full px-4 py-3 border border-[#d4cfc9] rounded-lg bg-[#faf9f7] text-[#1a1a1a] placeholder:text-[#b5afa8] focus:outline-none focus:border-[#1a1a1a] transition-colors"
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-[#3a3530] mb-2">Your Asking Price (USD)</label>
                            <input
                              type="number"
                              name="askingPrice"
                              value={formData.askingPrice}
                              onChange={handleChange}
                              placeholder="Leave blank for our recommendation"
                              className="w-full px-4 py-3 border border-[#d4cfc9] rounded-lg bg-[#faf9f7] text-[#1a1a1a] placeholder:text-[#b5afa8] focus:outline-none focus:border-[#1a1a1a] transition-colors"
                            />
                          </div>
                        </div>
                        <div className="mt-6">
                          <label className="block text-sm text-[#3a3530] mb-2">Alterations Made</label>
                          <input
                            type="text"
                            name="alterations"
                            value={formData.alterations}
                            onChange={handleChange}
                            placeholder="e.g. Hemmed, taken in at waist, bustle added"
                            className="w-full px-4 py-3 border border-[#d4cfc9] rounded-lg bg-[#faf9f7] text-[#1a1a1a] placeholder:text-[#b5afa8] focus:outline-none focus:border-[#1a1a1a] transition-colors"
                          />
                        </div>
                      </div>

                      {/* contact info */}
                      <div>
                        <h3 className="text-xs tracking-[0.3em] text-[#8a8580] uppercase mb-6 pb-2 border-b border-[#e8e4df]">
                          Your Information
                        </h3>
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm text-[#3a3530] mb-2">Full Name *</label>
                            <input
                              type="text"
                              name="name"
                              value={formData.name}
                              onChange={handleChange}
                              required
                              className="w-full px-4 py-3 border border-[#d4cfc9] rounded-lg bg-[#faf9f7] text-[#1a1a1a] focus:outline-none focus:border-[#1a1a1a] transition-colors"
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-[#3a3530] mb-2">Email *</label>
                            <input
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleChange}
                              required
                              className="w-full px-4 py-3 border border-[#d4cfc9] rounded-lg bg-[#faf9f7] text-[#1a1a1a] focus:outline-none focus:border-[#1a1a1a] transition-colors"
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-[#3a3530] mb-2">Phone</label>
                            <input
                              type="tel"
                              name="phone"
                              value={formData.phone}
                              onChange={handleChange}
                              className="w-full px-4 py-3 border border-[#d4cfc9] rounded-lg bg-[#faf9f7] text-[#1a1a1a] focus:outline-none focus:border-[#1a1a1a] transition-colors"
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-[#3a3530] mb-2">Location *</label>
                            <input
                              type="text"
                              name="location"
                              value={formData.location}
                              onChange={handleChange}
                              required
                              placeholder="City, Country"
                              className="w-full px-4 py-3 border border-[#d4cfc9] rounded-lg bg-[#faf9f7] text-[#1a1a1a] placeholder:text-[#b5afa8] focus:outline-none focus:border-[#1a1a1a] transition-colors"
                            />
                          </div>
                        </div>
                        <div className="mt-6">
                          <label className="block text-sm text-[#3a3530] mb-2">Additional Notes</label>
                          <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            rows={3}
                            placeholder="Anything else we should know about your gown?"
                            className="w-full px-4 py-3 border border-[#d4cfc9] rounded-lg bg-[#faf9f7] text-[#1a1a1a] placeholder:text-[#b5afa8] focus:outline-none focus:border-[#1a1a1a] transition-colors resize-none"
                          />
                        </div>
                      </div>

                      {/* submit */}
                      <div className="pt-4">
                        <button
                          type="submit"
                          className="w-full py-4 bg-[#1a1a1a] text-white text-sm tracking-[0.2em] hover:bg-[#2a2a2a] transition-all flex items-center justify-center gap-3"
                        >
                          SUBMIT FOR REVIEW <ArrowRight />
                        </button>
                        <p className="text-xs text-[#b5afa8] text-center mt-4">
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
              <h2 className="text-3xl md:text-4xl font-light text-[#1a1a1a] text-center mb-12 tracking-tight">
                Frequently Asked Questions
              </h2>
              <div className="space-y-3">
                {FAQS.map((faq, i) => (
                  <div key={i} className="border border-[#e8e4df] rounded-xl overflow-hidden bg-white">
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full flex items-center justify-between px-6 py-5 text-left"
                    >
                      <span className="text-[#1a1a1a] font-medium pr-4">{faq.q}</span>
                      <span className={`text-[#8a8580] transition-transform ${openFaq === i ? "rotate-45" : ""}`}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="12" y1="5" x2="12" y2="19" />
                          <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                      </span>
                    </button>
                    <AnimatePresence>
                      {openFaq === i && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-6 pb-5 text-[#6b6560] leading-relaxed">
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

          {/* ── final CTA ── */}
          <section className="py-20 px-6 bg-[#1a1a1a]">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-light text-white mb-4 tracking-tight">
                Your Gown&apos;s Next Chapter Starts Here
              </h2>
              <p className="text-[#8a8580] mb-8 max-w-lg mx-auto">
                Join hundreds of GL brides who have found the perfect new home for their gowns.
              </p>
              <button
                onClick={() => { setFormStep(1); document.getElementById("consign-form")?.scrollIntoView({ behavior: "smooth" }); }}
                className="px-12 py-4 bg-white text-[#1a1a1a] text-sm tracking-[0.2em] hover:bg-[#f0ede9] transition-all inline-flex items-center gap-3"
              >
                CONSIGN YOUR GOWN <ArrowRight />
              </button>
            </div>
          </section>
        </>
      )}

      {/* ── footer ── */}
      <footer className="py-10 px-6 border-t border-[#e8e4df] bg-[#faf9f7]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <Link href="/" className="text-lg tracking-[0.3em] font-light text-[#1a1a1a]">
            RE:GALIA
          </Link>
          <p className="text-xs text-[#b5afa8]">
            The official pre-owned marketplace for Galia Lahav
          </p>
        </div>
      </footer>
    </main>
  );
}
