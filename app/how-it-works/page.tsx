"use client";

import { useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
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
    subtitle: "Your Couture",
    desc: "Browse our curated collection of authenticated Galia Lahav gowns. Filter by collection, size, condition, and price to find your perfect piece.",
    image: "/images/hiw/ballgown.gif",
    imageAlt: "Galia Lahav tiered tulle ball gown",
    accent: "The Collection Awaits",
  },
  {
    num: "02",
    title: "Inquire",
    subtitle: "With Confidence",
    desc: "Request additional details, photos, or measurements. Our team facilitates all communication, ensuring clarity and total transparency between you and the seller.",
    image: "/images/hiw/staircase.jpg",
    imageAlt: "Galia Lahav satin draped evening gown",
    accent: "Every Detail Matters",
  },
  {
    num: "03",
    title: "Purchase",
    subtitle: "With Security",
    desc: "Transaction security is paramount. Your payment is held in escrow until you confirm the gown's arrival and your absolute satisfaction with every detail.",
    image: "/images/hiw/poodle.jpg",
    imageAlt: "Galia Lahav lace mermaid gown",
    accent: "Protected & Verified",
  },
  {
    num: "04",
    title: "Receive",
    subtitle: "Your Moment",
    desc: "Your couture arrives via insured white-glove courier with full tracking. A 14-day protection window allows you to inspect every detail at your leisure.",
    image: "/images/hiw/veil.jpg",
    imageAlt: "Galia Lahav bridal gown with cathedral veil",
    accent: "White-Glove Delivery",
  },
];

const SELLING_STEPS = [
  {
    num: "01",
    title: "Submit",
    subtitle: "Your Gown",
    desc: "Provide your gown's history, condition, and imagery through our premium sell wizard. The streamlined process is designed for discretion and ease.",
    image: "/images/hiw/convertible.jpg",
    imageAlt: "Bride in vintage convertible with flowing gown",
    accent: "Simple & Guided",
  },
  {
    num: "02",
    title: "Verified",
    subtitle: "By The House",
    desc: "The House of Galia Lahav authenticates every submission. Our experts verify craftsmanship and provenance to ensure complete marketplace integrity.",
    image: "/images/hiw/veil.jpg",
    imageAlt: "Galia Lahav gown with hand-embroidered veil",
    accent: "GL Authentication",
  },
  {
    num: "03",
    title: "Showcase",
    subtitle: "To The World",
    desc: "Your gown is presented to an exclusive global audience of high-intent brides, maximizing exposure and ensuring the best possible resale value.",
    image: "/images/hiw/waterfall.jpg",
    imageAlt: "Galia Lahav beaded gown by waterfall",
    accent: "Global Reach",
  },
  {
    num: "04",
    title: "Complete",
    subtitle: "The Handover",
    desc: "We provide insured logistics and manage secure payment processing. You receive payment promptly upon buyer confirmation — seamless from start to finish.",
    image: "/images/hiw/staircase.jpg",
    imageAlt: "Galia Lahav satin gown on elegant staircase",
    accent: "Secure & Swift",
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
    title: "Escrow Protection",
    desc: "Funds are held securely and only released when the buyer is satisfied, protecting both parties in every transaction.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    title: "White-Glove Logistics",
    desc: "Insured, tracked, and handled with the care couture deserves. We manage the entire journey from door to door.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
        <rect x="1" y="3" width="15" height="13" />
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
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
    a: "Due to the nature of online resale, in-person try-ons are not available. However, our 14-day return policy gives you time to receive and inspect the gown. We recommend checking measurements carefully and communicating with sellers for additional details.",
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
  const sectionRef = useRef<HTMLDivElement>(null);
  const isEven = index % 2 === 0;

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // Image parallax & reveal
  const imageY = useTransform(scrollYProgress, [0, 0.5, 1], [80, 0, -80]);
  const imageScale = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.9, 1, 1, 0.95]);
  const imageOpacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  // Text reveal
  const textY = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [60, 0, 0, -40]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.25, 0.75, 1], [0, 1, 1, 0]);

  // Number reveal
  const numOpacity = useTransform(scrollYProgress, [0, 0.15, 0.8, 1], [0, 0.06, 0.06, 0]);

  // Accent line
  const lineScaleX = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

  return (
    <section
      ref={sectionRef}
      className={`relative min-h-screen flex items-center ${!isLast ? "mb-0" : ""}`}
    >
      {/* Giant background number */}
      <motion.div
        style={{ opacity: numOpacity }}
        className={`absolute top-1/2 -translate-y-1/2 font-serif text-[20vw] md:text-[28vw] leading-none text-[#1c1c1c] select-none pointer-events-none ${
          isEven ? "right-0 md:right-10" : "left-0 md:left-10"
        }`}
      >
        {step.num}
      </motion.div>

      <div className="max-w-[90rem] mx-auto w-full px-6 md:px-16 py-24 md:py-32 relative z-10">
        <div
          className={`grid md:grid-cols-2 gap-10 md:gap-20 items-center ${
            isEven ? "" : "md:[direction:rtl]"
          }`}
        >
          {/* Image side */}
          <motion.div
            style={{ y: imageY, scale: imageScale, opacity: imageOpacity }}
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
            style={{ y: textY, opacity: textOpacity }}
            className="flex flex-col justify-center md:[direction:ltr]"
          >
            {/* Accent label */}
            <div className="flex items-center gap-4 mb-8">
              <motion.div
                style={{ scaleX: lineScaleX }}
                className="h-[1px] w-12 bg-[#1c1c1c]/20 origin-left"
              />
              <span className="font-sans text-[10px] font-light uppercase tracking-[0.3em] text-[#1c1c1c]/30">
                {step.accent}
              </span>
            </div>

            {/* Step number */}
            <span className="font-sans text-[11px] font-light uppercase tracking-[0.2em] text-[#1c1c1c]/20 mb-4">
              Step {step.num}
            </span>

            {/* Title */}
            <h2 className="font-serif text-5xl md:text-7xl lg:text-8xl font-light text-[#1c1c1c] tracking-[-0.03em] leading-[0.9] mb-2">
              {step.title}
            </h2>
            <h3 className="font-serif text-4xl md:text-5xl lg:text-6xl font-light italic text-[#1c1c1c]/40 tracking-[-0.02em] leading-[0.95] mb-10">
              {step.subtitle}
            </h3>

            {/* Description */}
            <p className="font-sans text-[15px] md:text-[16px] text-[#1c1c1c]/45 leading-[1.8] font-light max-w-md">
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
   Hero Word Reveal Component
   ═══════════════════════════════════════════ */

function HeroWordReveal() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const words = ["Your", "journey", "to", "couture,", "perfected."];

  return (
    <div ref={containerRef} className="relative min-h-[200vh]">
      <div className="sticky top-0 h-screen flex items-center justify-center">
        <div className="text-center px-6">
          <motion.p
            style={{ opacity: useTransform(scrollYProgress, [0, 0.1], [1, 0]) }}
            className="font-sans text-[10px] font-light uppercase tracking-[0.5em] text-[#1c1c1c]/30 mb-10"
          >
            The RE:GALIA Journey
          </motion.p>
          <div className="flex flex-wrap justify-center gap-x-[0.35em]">
            {words.map((word, i) => {
              const start = 0.1 + i * 0.12;
              const end = start + 0.15;
              return (
                <motion.span
                  key={i}
                  style={{
                    opacity: useTransform(scrollYProgress, [start, end], [0.08, 1]),
                    y: useTransform(scrollYProgress, [start, end], [30, 0]),
                  }}
                  className={`font-serif text-5xl md:text-7xl lg:text-[6rem] font-light tracking-[-0.03em] text-[#1c1c1c] leading-none ${
                    word === "couture," ? "italic" : ""
                  } ${word === "perfected." ? "italic" : ""}`}
                >
                  {word}
                </motion.span>
              );
            })}
          </div>
          <motion.p
            style={{
              opacity: useTransform(scrollYProgress, [0.7, 0.85], [0, 1]),
              y: useTransform(scrollYProgress, [0.7, 0.85], [20, 0]),
            }}
            className="font-sans text-[15px] text-[#1c1c1c]/35 tracking-wide max-w-lg mx-auto leading-relaxed mt-10 font-light"
          >
            A curated experience built on trust, authentication, and the signature Galia Lahav standard.
          </motion.p>
        </div>
      </div>
    </div>
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

      {/* ── Immersive Hero with Word Reveal ── */}
      <div className="pt-[65px]">
        <HeroWordReveal />
      </div>

      {/* ── Journey Toggle ── */}
      <section className="py-8 px-6">
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
                      : "text-[#1c1c1c]/20 hover:text-[#1c1c1c]/50"
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
              <Link
                href="/shop"
                className="px-14 py-5 bg-[#1c1c1c] text-white font-sans text-[12px] font-light uppercase tracking-[0.1em] hover:bg-[#333] transition-all duration-300 text-center"
              >
                Explore Collection
              </Link>
              <Link
                href="/sell/submit"
                className="px-14 py-5 border border-[#1c1c1c]/10 text-[#1c1c1c]/50 font-sans text-[12px] font-light uppercase tracking-[0.1em] hover:text-[#1c1c1c] hover:border-[#1c1c1c]/30 transition-all duration-300 text-center"
              >
                Start Consigning
              </Link>
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
            <p className="font-sans text-[10px] font-light uppercase tracking-[0.4em] text-white/25 mb-6">
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
                <div className="text-white/30 mb-10">{feature.icon}</div>
                <h3 className="font-serif text-2xl text-white mb-6 tracking-[-0.02em] font-light">
                  {feature.title}
                </h3>
                <p className="font-sans text-[13px] text-white/35 leading-relaxed font-light max-w-xs">
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
            <p className="font-sans text-[10px] font-light uppercase tracking-[0.4em] text-[#1c1c1c]/25 mb-6">
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
                  <span className="font-sans text-[14px] text-[#1c1c1c]/50 group-hover:text-[#1c1c1c] transition-colors font-light">
                    {faq.q}
                  </span>
                  <motion.span
                    animate={{ rotate: openFaq === i ? 45 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-[#1c1c1c]/20 text-xl font-light flex-shrink-0 ml-4"
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
                      <div className="pb-8 font-sans text-[14px] text-[#1c1c1c]/40 leading-[1.8] font-light max-w-2xl">
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
