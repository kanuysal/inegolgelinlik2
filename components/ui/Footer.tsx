import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-[#1c1c1c]/5 bg-white">
      {/* Main footer */}
      <div className="max-w-[85rem] mx-auto px-6 md:px-16 py-20 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-14 md:gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="inline-block">
              <h3 className="font-serif text-2xl tracking-[0.25em] text-[#1c1c1c] font-light uppercase">
                RE:GALIA
              </h3>
            </Link>
            <p className="font-sans text-[13px] text-[#1c1c1c]/40 mt-6 leading-relaxed max-w-[260px] font-light">
              The official certified pre-owned marketplace by Galia Lahav. Every gown authenticated by the House.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-sans text-[11px] uppercase tracking-[0.15em] text-[#1c1c1c]/30 mb-8 font-light">
              Shop
            </h4>
            <ul className="space-y-4">
              {[
                { href: "/shop", label: "Browse All Gowns" },
                { href: "/shop?collection=Couture", label: "Couture Collection" },
                { href: "/shop?collection=GALA", label: "GALA by GL" },
                { href: "/shop?condition=new", label: "New — Never Worn" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="font-sans text-[13px] text-[#1c1c1c]/50 hover:text-[#1c1c1c] transition-colors font-light"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Sell */}
          <div>
            <h4 className="font-sans text-[11px] uppercase tracking-[0.15em] text-[#1c1c1c]/30 mb-8 font-light">
              Sell
            </h4>
            <ul className="space-y-4">
              {[
                { href: "/consign", label: "Consign Your Gown" },
                { href: "/how-it-works", label: "How It Works" },
                { href: "/how-it-works#commission", label: "Commission Rates" },
                { href: "/how-it-works#faq", label: "Seller FAQ" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="font-sans text-[13px] text-[#1c1c1c]/50 hover:text-[#1c1c1c] transition-colors font-light"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-sans text-[11px] uppercase tracking-[0.15em] text-[#1c1c1c]/30 mb-8 font-light">
              Company
            </h4>
            <ul className="space-y-4">
              {[
                { href: "/how-it-works", label: "About RE:GALIA" },
                { href: "/how-it-works#authenticity", label: "Authenticity Promise" },
                { href: "/how-it-works#buyer-protection", label: "Buyer Protection" },
                { href: "/company/return-policy", label: "Return Policy" },
                { href: "mailto:hello@regalia.com", label: "Contact Us" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="font-sans text-[13px] text-[#1c1c1c]/50 hover:text-[#1c1c1c] transition-colors font-light"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="border-t border-[#1c1c1c]/5">
        <div className="max-w-[85rem] mx-auto px-6 md:px-16 py-6">
          <p className="font-sans text-[11px] text-[#1c1c1c]/30 font-light leading-relaxed text-center max-w-3xl mx-auto">
            All transactions between buyers and sellers are conducted independently. RE:GALIA facilitates the marketplace but does not take responsibility for communications, payments, or disputes between parties.
          </p>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[#1c1c1c]/5">
        <div className="max-w-[85rem] mx-auto px-6 md:px-16 py-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="font-sans text-[12px] text-[#1c1c1c]/30 font-light">
            &copy; {new Date().getFullYear()} Galia Lahav. All rights reserved.
          </p>
          <div className="flex items-center gap-8">
            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((text) => (
              <a
                key={text}
                href="#"
                className="font-sans text-[12px] text-[#1c1c1c]/30 hover:text-[#1c1c1c]/60 transition-colors font-light"
              >
                {text}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
