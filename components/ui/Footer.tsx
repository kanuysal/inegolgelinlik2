import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-[#1c1c1c]/5 bg-white">
      
      {/* Instagram Follow Section - Pre-Footer style */}
      <div className="pt-20 border-b border-[#1c1c1c]/5 text-center px-6">
        <div className="max-w-xl mx-auto space-y-8 pb-20">
          <span className="text-[10px] font-bold tracking-[0.4em] text-[#B76E79] uppercase">Bizi Takip Edin</span>
          <h3 className="font-serif text-3xl md:text-5xl text-[#1c1c1c] font-light">@minalidyagelinlik</h3>
          <p className="font-sans text-[13px] text-[#1c1c1c]/40 leading-relaxed font-light">
            En son koleksiyonlarımız, sahne arkası görüntülerimiz ve gelin adaylarımızdan ilham verici anlar için Instagram topluluğumuza katılın.
          </p>
          <div className="pt-4">
            <a 
              href="https://instagram.com/minalidyagelinlik" 
              target="_blank" 
              className="inline-flex items-center gap-3 py-4 px-10 border border-[#1c1c1c] text-[11px] font-bold tracking-[0.2em] transition-all hover:bg-[#1c1c1c] hover:text-white uppercase"
            >
              <span>INSTAGRAM'DA GÖRÜNTÜLE</span>
              <span className="material-symbols-outlined text-sm">open_in_new</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main footer contents */}
      <div className="max-w-[85rem] mx-auto px-6 md:px-16 py-20 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-14 md:gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="inline-block">
              <h3 className="font-serif text-2xl tracking-[0.25em] text-[#1c1c1c] font-light uppercase">
                MİNA LİDYA
              </h3>
            </Link>
            <p className="font-sans text-[13px] text-[#1c1c1c]/40 mt-6 leading-relaxed max-w-[260px] font-light">
              Lüks gelinlik ve couture mirası. Anadolu'nun usta işçiliği ve İspanyol tasarımıyla hayallerinizi gerçeğe dönüştürüyoruz.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-sans text-[11px] uppercase tracking-[0.15em] text-[#1c1c1c]/30 mb-8 font-light">
              KOLEKSİYONLAR
            </h4>
            <ul className="space-y-4">
              {[
                { href: "/shop?category=gelinlik", label: "Gelinlik" },
                { href: "/shop?category=tesettur-gelinlik", label: "Tesettür Gelinlikler" },
                { href: "/shop?category=after-party", label: "After Party" },
                { href: "/shop?category=abiye", label: "Abiye" },
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

          {/* Sell (Contact/Services) */}
          <div>
            <h4 className="font-sans text-[11px] uppercase tracking-[0.15em] text-[#1c1c1c]/30 mb-8 font-light">
              HİZMETLER
            </h4>
            <ul className="space-y-4">
              {[
                { href: "/appointment", label: "Randevu Al" },
                { href: "/online-couture", label: "Mesafesiz Couture" },
                { href: "/about#process", label: "Dikim Süreci" },
                { href: "/about#atelier", label: "Atölyemiz" },
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
              KURUMSAL
            </h4>
            <ul className="space-y-4">
              {[
                { href: "/about", label: "Hakkımızda" },
                { href: "/boutiques", label: "Mağazalarımız" },
                { href: "/faq", label: "Sıkça Sorulan Sorular" },
                { href: "/contact", label: "İletişim" },
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
            Mina Lidya, Bursa ve Valencia merkezli global bir gelinlik markasıdır. Tüm tasarımlarımız tescillidir ve usta işçilikle atölyemizde üretilmektedir.
          </p>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[#1c1c1c]/5 bg-[#fcfcfc]">
        <div className="max-w-[85rem] mx-auto px-6 md:px-16 py-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="font-sans text-[12px] text-[#1c1c1c]/30 font-light">
            &copy; {new Date().getFullYear()} MİNA LİDYA. Tüm hakları saklıdır.
          </p>
          <div className="flex items-center gap-8">
            {["Gizlilik Politikası", "Kullanım Şartları", "Çerez Politikası"].map((text) => (
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
