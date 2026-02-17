import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-obsidian">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="inline-block">
              <h3 className="font-display text-xl tracking-[0.2em] text-white/80">
                RE:GALIA
              </h3>
            </Link>
            <p className="font-sans text-[11px] text-white/25 mt-3 leading-relaxed max-w-[220px]">
              The official certified pre-owned marketplace by Galia Lahav. Every gown authenticated by the House.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-sans text-[10px] uppercase tracking-[0.3em] text-white/40 mb-5">
              Shop
            </h4>
            <ul className="space-y-3">
              {[
                { href: "/shop", label: "Browse All Gowns" },
                { href: "/shop?collection=Couture", label: "Couture Collection" },
                { href: "/shop?collection=GALA", label: "GALA by GL" },
                { href: "/shop?condition=new", label: "New — Never Worn" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="font-sans text-xs text-white/25 hover:text-white/60 transition-colors tracking-wider"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Sell */}
          <div>
            <h4 className="font-sans text-[10px] uppercase tracking-[0.3em] text-white/40 mb-5">
              Sell
            </h4>
            <ul className="space-y-3">
              {[
                { href: "/sell", label: "Consign Your Gown" },
                { href: "/how-it-works", label: "How It Works" },
                { href: "/sell#commission", label: "Commission Rates" },
                { href: "/sell#faq", label: "Seller FAQ" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="font-sans text-xs text-white/25 hover:text-white/60 transition-colors tracking-wider"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-sans text-[10px] uppercase tracking-[0.3em] text-white/40 mb-5">
              Company
            </h4>
            <ul className="space-y-3">
              {[
                { href: "/how-it-works", label: "About RE:GALIA" },
                { href: "/how-it-works#authenticity", label: "Authenticity Promise" },
                { href: "/how-it-works#buyer-protection", label: "Buyer Protection" },
                { href: "mailto:hello@regalia.com", label: "Contact Us" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="font-sans text-xs text-white/25 hover:text-white/60 transition-colors tracking-wider"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-sans text-[10px] text-white/15 tracking-wider">
            &copy; {new Date().getFullYear()} Galia Lahav. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((text) => (
              <a
                key={text}
                href="#"
                className="font-sans text-[10px] text-white/15 hover:text-white/30 transition-colors tracking-wider"
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
