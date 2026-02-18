import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-obsidian/5 bg-silk">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-24">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 md:gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="inline-block">
              <h3 className="font-display text-2xl tracking-[0.2em] text-obsidian">
                RE:GALIA
              </h3>
            </Link>
            <p className="font-sans text-[11px] text-obsidian/40 mt-6 leading-relaxed max-w-[240px] font-medium">
              The official certified pre-owned marketplace by Galia Lahav. Every gown authenticated by the House.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-sans text-[10px] uppercase tracking-[0.4em] text-obsidian/20 mb-8 font-bold">
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
                    className="font-sans text-xs text-obsidian/40 hover:text-gold-muted transition-colors tracking-widest uppercase font-bold"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Sell */}
          <div>
            <h4 className="font-sans text-[10px] uppercase tracking-[0.4em] text-obsidian/20 mb-8 font-bold">
              Sell
            </h4>
            <ul className="space-y-4">
              {[
                { href: "/sell", label: "Consign Your Gown" },
                { href: "/how-it-works", label: "How It Works" },
                { href: "/sell#commission", label: "Commission Rates" },
                { href: "/sell#faq", label: "Seller FAQ" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="font-sans text-xs text-obsidian/40 hover:text-gold-muted transition-colors tracking-widest uppercase font-bold"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-sans text-[10px] uppercase tracking-[0.4em] text-obsidian/20 mb-8 font-bold">
              Company
            </h4>
            <ul className="space-y-4">
              {[
                { href: "/how-it-works", label: "About RE:GALIA" },
                { href: "/how-it-works#authenticity", label: "Authenticity Promise" },
                { href: "/how-it-works#buyer-protection", label: "Buyer Protection" },
                { href: "mailto:hello@regalia.com", label: "Contact Us" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="font-sans text-xs text-obsidian/40 hover:text-gold-muted transition-colors tracking-widest uppercase font-bold"
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
      <div className="border-t border-obsidian/5">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="font-sans text-[10px] text-obsidian/20 tracking-[0.2em] font-bold uppercase">
            &copy; {new Date().getFullYear()} Galia Lahav. The Eternal Life of Couture.
          </p>
          <div className="flex items-center gap-8">
            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((text) => (
              <a
                key={text}
                href="#"
                className="font-sans text-[10px] text-obsidian/20 hover:text-obsidian/40 transition-colors tracking-[0.2em] font-bold uppercase"
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
