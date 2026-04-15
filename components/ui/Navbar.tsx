"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useHanger } from "@/lib/hanger-context";

const MENU_LINKS = [
  { href: "/shop", label: "Koleksiyonlar" },
  { href: "/online-couture", label: "Online Couture" },
  { href: "/about", label: "Hakkımızda" },
  { href: "/boutiques", label: "Mağazalar" },
  { href: "/appointment", label: "Randevu Al" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { count: hangerCount } = useHanger();

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const isHome = pathname === "/";
  const useLight = isHome && !scrolled;

  return (
    <>
      <nav className={`fixed left-0 right-0 z-[100] transition-all duration-500 ease-in-out ${scrolled ? "top-0 px-0" : "top-0 px-0"}`}>
        <div className={`mx-auto flex items-center justify-between relative transition-all duration-500 ease-in-out ${
          scrolled
            ? "max-w-full h-16 bg-white/50 backdrop-blur-2xl shadow-[0_4px_24px_rgba(0,0,0,0.02)] px-8"
            : "max-w-7xl h-20 px-6"
        }`}>

          <div className="flex items-center gap-6">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="group relative w-6 h-6 flex flex-col justify-center gap-1.5 focus:outline-none"
            >
               <span className={`h-[1px] w-6 transition-all duration-300 ${scrolled ? "bg-[#1c1c1c]" : "bg-[#1c1c1c]"} ${menuOpen ? "rotate-45 translate-y-[3.5px]" : ""}`} />
               <span className={`h-[1px] w-6 transition-all duration-300 ${scrolled ? "bg-[#1c1c1c]" : "bg-[#1c1c1c]"} ${menuOpen ? "-rotate-45 -translate-y-[3.5px]" : ""}`} />
            </button>
            <Link
              href="/shop?category=gelinlik"
              className={`text-[11px] font-bold tracking-[0.2em] uppercase transition-colors duration-300 hidden sm:block ${scrolled ? "text-[#1c1c1c]" : "text-[#1c1c1c]"}`}
            >
              Koleksiyonlar
            </Link>
          </div>

        {/* Center — Logo */}
        <div className="absolute left-1/2 -translate-x-1/2">
          <Link href="/" className={`text-xl md:text-2xl font-bold tracking-[-0.04em] transition-colors duration-300 ${scrolled ? "text-[#1c1c1c]" : "text-[#1c1c1c]"}`}>
            MİNA LİDYA
          </Link>
        </div>

        {/* Right — Hanger + Appointment */}
        <div className="flex items-center gap-6">
          <Link
            href="/appointment"
            className={`text-[11px] font-bold tracking-[0.2em] uppercase transition-colors duration-300 hidden sm:block ${scrolled ? "text-[#1c1c1c]" : "text-[#1c1c1c]"}`}
          >
            Randevu
          </Link>
          
          <Link href="/prova-listesi" className="relative group">
            <span className={`material-symbols-outlined text-[22px] transition-all duration-300 ${scrolled ? "text-[#1c1c1c]" : "text-[#1c1c1c]"} group-hover:text-[#B76E79]`} style={{ fontVariationSettings: "'wght' 300" }}>
              checkroom
            </span>
              {hangerCount > 0 && (
                <span className="absolute -top-1 -right-2 w-4 h-4 bg-[#B76E79] text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none shadow-sm">
                  {hangerCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Apple-Style Full Screen Menu ── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-[90] bg-white/95 backdrop-blur-3xl flex flex-col items-center justify-center"
          >
            <nav className="flex flex-col items-center gap-8 md:gap-12">
              {MENU_LINKS.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Link
                    href={link.href}
                    className={`text-4xl md:text-7xl font-serif tracking-tighter hover:italic transition-all duration-500 ${
                      pathname === link.href ? "text-[#B76E79]" : "text-[#1c1c1c]/40 hover:text-[#1c1c1c]"
                    }`}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </nav>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="absolute bottom-12 flex flex-col items-center gap-4"
            >
               <div className="flex gap-8 text-[11px] font-bold tracking-[0.2em] text-[#1c1c1c]/40">
                  <Link href="/prova-listesi" className="hover:text-[#B76E79]">PROVA LİSTESİ</Link>
                  <Link href="/company/contact" className="hover:text-[#B76E79]">İLETİŞİM</Link>
               </div>
               <p className="text-[10px] text-[#1c1c1c]/20 uppercase tracking-widest">&#169; {new Date().getFullYear()} MİNA LİDYA BRIDAL</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
