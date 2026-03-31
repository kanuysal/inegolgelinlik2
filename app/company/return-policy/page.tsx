import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";

export const metadata: Metadata = {
  title: "Return Policy — RE:GALIA",
  description:
    "Return policy for brand-direct Galia Lahav gowns purchased through RE:GALIA. 5-day return window from delivery.",
};

export default function ReturnPolicyPage() {
  return (
    <>
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="font-sans text-[11px] uppercase tracking-[0.2em] text-[#1c1c1c]/40 mb-6 font-light">
            Brand-Direct Purchases
          </p>
          <h1 className="font-serif text-4xl md:text-5xl font-light text-[#1c1c1c] leading-[1.15]">
            Return Policy
          </h1>
        </div>
      </section>

      {/* Content */}
      <section className="pb-24 md:pb-32 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="space-y-12">
            {/* Scope */}
            <div>
              <h2 className="font-sans text-[11px] uppercase tracking-[0.15em] text-[#1c1c1c]/30 mb-4 font-light">
                Scope
              </h2>
              <div className="border-t border-[#1c1c1c]/10 pt-6">
                <p className="font-sans text-[14px] text-[#1c1c1c]/70 leading-relaxed font-light">
                  This return policy applies exclusively to{" "}
                  <strong className="text-[#1c1c1c] font-normal">brand-direct</strong>{" "}
                  purchases — gowns sold directly by Galia Lahav through RE:GALIA.
                  Bride-to-bride (peer-to-peer) transactions are arranged independently
                  between buyer and seller; RE:GALIA does not mediate returns for those
                  listings.
                </p>
              </div>
            </div>

            {/* Return Window */}
            <div>
              <h2 className="font-sans text-[11px] uppercase tracking-[0.15em] text-[#1c1c1c]/30 mb-4 font-light">
                Return Window
              </h2>
              <div className="border-t border-[#1c1c1c]/10 pt-6 space-y-4">
                <p className="font-sans text-[14px] text-[#1c1c1c]/70 leading-relaxed font-light">
                  You have{" "}
                  <strong className="text-[#1c1c1c] font-normal">5 days from the date of delivery</strong>{" "}
                  to submit a return request. The delivery date is determined by the
                  carrier&rsquo;s confirmed delivery timestamp.
                </p>
                <p className="font-sans text-[14px] text-[#1c1c1c]/70 leading-relaxed font-light">
                  To initiate a return, contact us at{" "}
                  <a
                    href="mailto:regalia@galialahav.com"
                    className="text-[#1c1c1c] underline underline-offset-4 decoration-[#1c1c1c]/20 hover:decoration-[#1c1c1c]/60 transition-colors"
                  >
                    regalia@galialahav.com
                  </a>{" "}
                  or through your RE:GALIA dashboard messages. Please include your order
                  number and reason for return.
                </p>
              </div>
            </div>

            {/* Return Fees */}
            <div>
              <h2 className="font-sans text-[11px] uppercase tracking-[0.15em] text-[#1c1c1c]/30 mb-4 font-light">
                Return &amp; Exchange Fees
              </h2>
              <div className="border-t border-[#1c1c1c]/10 pt-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="p-6 border border-[#1c1c1c]/5">
                    <p className="font-sans text-[11px] uppercase tracking-[0.15em] text-[#1c1c1c]/30 mb-3 font-light">
                      Returns
                    </p>
                    <p className="font-sans text-[22px] text-[#1c1c1c] font-light">
                      $200 <span className="text-[14px] text-[#1c1c1c]/40">domestic</span>
                    </p>
                    <p className="font-sans text-[22px] text-[#1c1c1c] font-light">
                      $300 <span className="text-[14px] text-[#1c1c1c]/40">international</span>
                    </p>
                  </div>
                  <div className="p-6 border border-[#1c1c1c]/5">
                    <p className="font-sans text-[11px] uppercase tracking-[0.15em] text-[#1c1c1c]/30 mb-3 font-light">
                      Exchanges
                    </p>
                    <p className="font-sans text-[22px] text-[#1c1c1c] font-light">
                      $100 <span className="text-[14px] text-[#1c1c1c]/40">domestic</span>
                    </p>
                    <p className="font-sans text-[22px] text-[#1c1c1c] font-light">
                      $200 <span className="text-[14px] text-[#1c1c1c]/40">international</span>
                    </p>
                  </div>
                </div>
                <p className="font-sans text-[13px] text-[#1c1c1c]/40 leading-relaxed font-light">
                  Fees cover return shipping, inspection, and re-listing preparation.
                  They are deducted from your refund amount.
                </p>
              </div>
            </div>

            {/* Condition Requirements */}
            <div>
              <h2 className="font-sans text-[11px] uppercase tracking-[0.15em] text-[#1c1c1c]/30 mb-4 font-light">
                Condition Requirements
              </h2>
              <div className="border-t border-[#1c1c1c]/10 pt-6 space-y-4">
                <p className="font-sans text-[14px] text-[#1c1c1c]/70 leading-relaxed font-light">
                  To be eligible for a return, the gown must be in the same condition as when
                  it was received: unworn, unaltered, with all original tags and packaging intact.
                  Gowns that have been altered, damaged, or show signs of wear will not be
                  accepted for return.
                </p>
              </div>
            </div>

            {/* Refund Process */}
            <div>
              <h2 className="font-sans text-[11px] uppercase tracking-[0.15em] text-[#1c1c1c]/30 mb-4 font-light">
                Refund Process
              </h2>
              <div className="border-t border-[#1c1c1c]/10 pt-6 space-y-4">
                <p className="font-sans text-[14px] text-[#1c1c1c]/70 leading-relaxed font-light">
                  Once we receive and inspect the returned gown, your refund — minus the
                  applicable return fee — will be processed to your original payment method.
                  Please allow 5–10 business days for the refund to appear on your statement.
                </p>
              </div>
            </div>

            {/* Peer-to-Peer Note */}
            <div>
              <h2 className="font-sans text-[11px] uppercase tracking-[0.15em] text-[#1c1c1c]/30 mb-4 font-light">
                Bride-to-Bride Listings
              </h2>
              <div className="border-t border-[#1c1c1c]/10 pt-6 space-y-4">
                <p className="font-sans text-[14px] text-[#1c1c1c]/70 leading-relaxed font-light">
                  Returns for bride-to-bride listings are entirely at the discretion of the
                  buyer and seller. RE:GALIA facilitates the marketplace but does not mediate
                  or take responsibility for these transactions. Both parties should agree on
                  return terms before completing a purchase.
                </p>
              </div>
            </div>

            {/* Contact */}
            <div className="pt-4 border-t border-[#1c1c1c]/10">
              <p className="font-sans text-[13px] text-[#1c1c1c]/40 leading-relaxed font-light">
                Questions about a return?{" "}
                <a
                  href="mailto:regalia@galialahav.com"
                  className="text-[#1c1c1c]/60 underline underline-offset-4 decoration-[#1c1c1c]/20 hover:decoration-[#1c1c1c]/60 transition-colors"
                >
                  Reach out to us
                </a>{" "}
                — we&rsquo;re here to help.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
