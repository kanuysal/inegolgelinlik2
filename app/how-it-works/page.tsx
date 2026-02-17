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

/* ── Luxury Divider ── */
function LuxuryDivider() {
  return (
    <div className="flex items-center justify-center gap-4 my-8">
      <div className="h-[1px] w-16 bg-gradient-to-r from-transparent to-gold-muted/30" />
      <div className="w-1.5 h-1.5 rounded-full bg-gold-muted/40" />
      <div className="h-[1px] w-16 bg-gradient-to-l from-transparent to-gold-muted/30" />
    </div>
  );
}

/* ── Data ── */
const BUYER_STEPS = [
  {
    num: "01",
    title: "Discover",
    desc: "Browse our curated collection of authenticated Galia Lahav gowns. Filter by collection, size, condition, and price.",
    icon: "✦",
  },
  {
    num: "02",
    title: "Inquire",
    desc: "Request more details, additional photos, or measurements. Our team facilitates all communication between buyer and seller.",
    icon: "💬",
  },
  {
    num: "03",
    title: "Purchase",
    desc: "Secure your gown with our protected checkout. Your payment is held in escrow until you confirm receipt and satisfaction.",
    icon: "🔒",
  },
  {
    num: "04",
    title: "Receive",
    desc: "Your gown arrives via insured white-glove shipping with full tracking. Inspect it within our 14-day protection window.",
    icon: "📦",
  },
];

const SELLER_STEPS = [
  {
    num: "01",
    title: "Submit",
    desc: "Tell us about your Galia Lahav gown — collection, condition, measurements, and photos. Takes under 5 minutes.",
    icon: "📋",
  },
  {
    num: "02",
    title: "Authenticate",
    desc: "Our GL experts verify your gown's authenticity and create a premium listing with professional photography guidance.",
    icon: "✓",
  },
  {
    num: "03",
    title: "Sell",
    desc: "We handle all inquiries, negotiations, and payment processing. You approve every offer before it's accepted.",
    icon: "💰",
  },
  {
    num: "04",
    title: "Ship & Get Paid",
    desc: "We provide pre-paid insured shipping labels. Payment is released within 3 business days of buyer confirmation.",
    icon: "🚚",
  },
];

const TRUST_FEATURES = [
  {
    icon: <VerifiedBadge size={24} />,
    title: "GL Authentication",
    desc: "Every gown is verified as an authentic Galia Lahav creation by experts who know the House's craftsmanship.",
  },
  {
    icon: <ShieldIcon />,
    title: "Buyer Protection",
    desc: "Funds held in escrow until you confirm receipt. Full refund if the gown isn't as described.",
  },
  {
    icon: <TruckIcon />,
    title: "Insured Shipping",
    desc: "White-glove courier service with full insurance and tracking. Your gown arrives safely, guaranteed.",
  },
  {
    icon: <CreditCardIcon />,
    title: "Secure Payments",
    desc: "Industry-standard encryption and secure payment processing. Your financial data is never shared.",
  },
  {
    icon: <HeartIcon />,
    title: "Dedicated Support",
    desc: "Personal assistance from submission to delivery. Our team is with you every step of the way.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
    title: "14-Day Returns",
    desc: "Not quite right? Return within 14 days of delivery in original condition. No questions asked.",
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
  {
    q: "How much can I save?",
    a: "Most gowns on RE:GALIA are priced 30-70% below original retail. Since Galia Lahav gowns retail from $5,000 to over $20,000, that represents significant savings on authentic couture.",
  },
  {
    q: "How long does shipping take?",
    a: "Domestic shipping within the US typically takes 3-5 business days. International shipping takes 5-10 business days depending on destination and customs processing. All shipments are fully insured and tracked.",
  },
  {
    q: "What if I want to sell my gown?",
    a: "Simply visit our Sell page and submit your gown details. Our team will review it within 24-48 hours, help you set the right price, and create a professional listing. You only pay a commission when your gown sells — no upfront costs.",
  },
];

export default function HowItWorksPage() {
  const [activeView, setActiveView] = useState<"buyer" | "seller">("buyer");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const steps = activeView === "buyer" ? BUYER_STEPS : SELLER_STEPS;

  return (
    <main className="min-h-screen bg-obsidian">
      <Navbar />

      {/* ── Hero ── */}
      <section className="pt-28 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-sans text-[10px] uppercase tracking-[0.5em] text-gold-muted/50 mb-4"
          >
            The RE:GALIA Experience
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display text-4xl md:text-6xl font-thin text-white/90 mb-6 tracking-wider leading-tight uppercase"
          >
            How It Works
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-sans text-sm text-white/35 max-w-xl mx-auto leading-relaxed"
          >
            The first marketplace dedicated exclusively to certified pre-owned
            Galia Lahav couture. Whether buying or selling, we make every step
            seamless.
          </motion.p>
        </div>
      </section>

      {/* ── Toggle: Buyer / Seller ── */}
      <section className="px-6 pb-20">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-center mb-14">
            <div className="inline-flex border border-white/10">
              {(["buyer", "seller"] as const).map((view) => (
                <button
                  key={view}
                  onClick={() => setActiveView(view)}
                  className={`px-8 py-3 font-sans text-xs uppercase tracking-[0.25em] transition-all duration-300 ${
                    activeView === view
                      ? "bg-white text-obsidian"
                      : "text-white/40 hover:text-white/70"
                  }`}
                >
                  {view === "buyer" ? "I'm Buying" : "I'm Selling"}
                </button>
              ))}
            </div>
          </div>

          {/* Steps */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              {/* Numbered steps */}
              <div className="grid md:grid-cols-4 gap-10 mb-16">
                {steps.map((step, i) => (
                  <motion.div
                    key={step.num}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="text-center"
                  >
                    <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center mx-auto mb-6 relative">
                      <span className="font-display text-lg text-gold-muted/60 tracking-widest">
                        {step.num}
                      </span>
                      {i < steps.length - 1 && (
                        <div className="hidden md:block absolute left-full top-1/2 w-[calc(100%-4rem)] h-[1px] bg-gradient-to-r from-white/10 to-transparent -translate-y-1/2 ml-4" />
                      )}
                    </div>
                    <h3 className="font-serif text-xl text-white/80 mb-3 tracking-wide">
                      {step.title}
                    </h3>
                    <p className="font-sans text-xs text-white/30 leading-relaxed max-w-[200px] mx-auto">
                      {step.desc}
                    </p>
                  </motion.div>
                ))}
              </div>

              {/* CTA */}
              <div className="text-center">
                <Link
                  href={activeView === "buyer" ? "/shop" : "/sell"}
                  className="group relative inline-flex items-center gap-3 px-10 py-3.5 bg-white text-obsidian font-sans text-sm uppercase tracking-[0.25em] overflow-hidden transition-all hover:shadow-[0_0_40px_rgba(201,169,110,0.15)]"
                >
                  <span className="relative z-10">
                    {activeView === "buyer" ? "Browse Gowns" : "Start Consigning"}
                  </span>
                  <svg className="relative z-10 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                  <div className="absolute inset-0 bg-champagne translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ── Trust & Authenticity ── */}
      <section id="authenticity" className="py-20 px-6 border-y border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="font-sans text-[10px] uppercase tracking-[0.5em] text-gold-muted/50 mb-3">
              The GL Standard
            </p>
            <h2 className="font-serif text-3xl md:text-5xl font-light text-white/90 tracking-wider">
              Trust & Authenticity
            </h2>
            <LuxuryDivider />
            <p className="font-sans text-sm text-white/30 max-w-lg mx-auto">
              Every transaction on RE:GALIA is protected by our comprehensive
              authentication and buyer protection program.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {TRUST_FEATURES.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="border border-white/5 p-8 hover:border-white/10 transition-all duration-300 group"
              >
                <span className="text-gold-muted/60 group-hover:text-gold-muted transition-colors">
                  {feature.icon}
                </span>
                <h3 className="font-serif text-lg text-white/80 mt-5 mb-3 tracking-wide">
                  {feature.title}
                </h3>
                <p className="font-sans text-xs text-white/30 leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Buyer Protection Detail ── */}
      <section id="buyer-protection" className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="font-sans text-[10px] uppercase tracking-[0.5em] text-gold-muted/50 mb-3">
              Peace of Mind
            </p>
            <h2 className="font-serif text-3xl md:text-5xl font-light text-white/90 tracking-wider">
              Buyer Protection
            </h2>
            <LuxuryDivider />
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: "Escrow Payment",
                desc: "Your payment is held securely until you receive and approve your gown. Sellers only get paid after your confirmation.",
              },
              {
                title: "14-Day Inspection",
                desc: "From the moment your gown arrives, you have 14 days to inspect it. If it's not as described, return it for a full refund.",
              },
              {
                title: "Authenticity Guarantee",
                desc: "If your gown is found to not be an authentic Galia Lahav piece at any point, we provide a complete refund plus return shipping.",
              },
              {
                title: "Insured Transit",
                desc: "Every gown ships with comprehensive insurance. If anything happens during transit, you're fully covered.",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-5"
              >
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0 mt-1">
                  <span className="font-sans text-[10px] text-gold-muted/60 tracking-widest">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <div>
                  <h3 className="font-serif text-lg text-white/80 mb-2">{item.title}</h3>
                  <p className="font-sans text-xs text-white/30 leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="border-y border-white/5">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4">
          {[
            { val: "500+", label: "Gowns Sold" },
            { val: "100%", label: "Authenticated" },
            { val: "30–70%", label: "Below Retail" },
            { val: "14 Days", label: "Return Window" },
          ].map((stat, i) => (
            <div
              key={i}
              className="py-10 px-6 text-center border-r border-white/5 last:border-r-0"
            >
              <div className="font-serif text-3xl md:text-4xl font-light text-white/80 mb-2">
                {stat.val}
              </div>
              <div className="font-sans text-[9px] tracking-[0.3em] text-white/25 uppercase">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-serif text-3xl md:text-4xl font-light text-white/90 tracking-wider">
              Frequently Asked Questions
            </h2>
            <LuxuryDivider />
          </div>

          <div className="space-y-2">
            {FAQS.map((faq, i) => (
              <div
                key={i}
                className="border border-white/5 hover:border-white/10 transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left"
                >
                  <span className="font-sans text-sm text-white/60 pr-4">
                    {faq.q}
                  </span>
                  <motion.span
                    animate={{ rotate: openFaq === i ? 45 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-white/20 text-lg leading-none shrink-0"
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
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-5 font-sans text-xs text-white/30 leading-relaxed">
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

      {/* ── Final CTA ── */}
      <section className="py-20 px-6 border-t border-white/5">
        <div className="max-w-3xl mx-auto text-center">
          <p className="font-sans text-[10px] uppercase tracking-[0.5em] text-gold-muted/40 mb-4">
            Join the RE:GALIA Community
          </p>
          <h2 className="font-serif text-3xl md:text-5xl font-light text-white/90 mb-4 tracking-wider">
            Ready to Begin?
          </h2>
          <LuxuryDivider />
          <p className="font-sans text-sm text-white/25 mb-10 max-w-md mx-auto">
            Whether you&apos;re looking for your dream gown or giving yours a
            second chapter, we&apos;re here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/shop"
              className="group relative px-10 py-3.5 bg-white text-obsidian font-sans text-sm uppercase tracking-[0.25em] overflow-hidden transition-all inline-flex items-center justify-center gap-3"
            >
              <span className="relative z-10">Shop Gowns</span>
              <div className="absolute inset-0 bg-champagne translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            </Link>
            <Link
              href="/sell"
              className="px-10 py-3.5 border border-white/20 font-sans text-sm uppercase tracking-[0.25em] text-white/60 hover:text-white hover:border-white/40 transition-all duration-500 text-center"
            >
              Sell Your Gown
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
