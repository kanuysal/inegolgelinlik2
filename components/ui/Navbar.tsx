"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { checkIsStaff } from "@/app/auth/actions";
import type { User } from "@supabase/supabase-js";

const MENU_LINKS = [
  { href: "/shop", label: "Bridal Gowns" },
  { href: "/sell", label: "List a Gown" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/dashboard", label: "My Account" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isStaff, setIsStaff] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    const fetchUserAndRole = async (u: User | null) => {
      setUser(u);
      if (u) {
        const staff = await checkIsStaff();
        setIsStaff(staff);
      } else {
        setIsStaff(false);
      }
      setLoading(false);
    };

    supabase.auth.getUser().then(({ data: { user } }) => {
      fetchUserAndRole(user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      fetchUserAndRole(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

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

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setIsStaff(false);
    setMenuOpen(false);
    router.push("/");
    router.refresh();
  };

  const isHome = pathname === "/";
  const useLight = isHome && !scrolled;

  return (
    <>
      {/* ── Top bar ── */}
      <nav className={`fixed left-0 right-0 z-50 transition-all duration-500 ease-in-out ${scrolled ? "top-4 px-4" : "top-0 px-0"}`}>
        <div className={`mx-auto flex items-center justify-between relative transition-all duration-500 ease-in-out ${
          scrolled
            ? "max-w-5xl h-14 bg-white/85 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-white/60 px-6"
            : "max-w-7xl h-20 px-6"
        }`}>

          {/* Left — Menu + Shop */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
            >
              <span className={`material-symbols-outlined text-xl transition-colors duration-300 ${useLight ? "text-white" : "text-primary"}`}>menu</span>
            </button>
            <Link
              href="/shop"
              className={`text-sm font-medium tracking-widest uppercase transition-colors duration-300 hidden sm:block ${useLight ? "text-white" : "text-primary"}`}
            >
              Shop
            </Link>
          </div>

          {/* Center — Brand */}
          <div className="absolute left-1/2 -translate-x-1/2 text-center">
            <Link href="/" className={`text-2xl font-bold tracking-tighter transition-colors duration-300 ${useLight ? "text-white" : "text-primary"}`}>
              RE:GALIA
            </Link>
          </div>

          {/* Right — Sell + Bag */}
          <div className="flex items-center gap-4">
            <Link
              href="/sell"
              className={`text-sm font-medium tracking-widest uppercase transition-colors duration-300 hidden sm:block ${useLight ? "text-white" : "text-primary"}`}
            >
              Sell
            </Link>
            <Link href="/shop">
              <span className={`material-symbols-outlined text-xl cursor-pointer transition-colors duration-300 ${useLight ? "text-white" : "text-primary"}`}>shopping_bag</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Half-screen menu overlay ── */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-[100] bg-black/30"
              onClick={() => setMenuOpen(false)}
            />

            {/* Navigation panel — right half */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
              className="fixed top-0 right-0 z-[101] w-full sm:w-[50%] h-screen bg-[#faf9f8] flex flex-col"
            >
              {/* Close button */}
              <button
                onClick={() => setMenuOpen(false)}
                className="absolute top-8 right-8 z-[110] group flex items-center gap-3"
                aria-label="Close menu"
              >
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300">Close</span>
                <span className="material-symbols-outlined text-3xl group-hover:rotate-90 transition-transform duration-500">close</span>
              </button>

              {/* Main nav links */}
              <div className="flex-grow flex flex-col justify-center px-8 lg:px-16 pt-20">
                <nav className="space-y-6">
                  {MENU_LINKS.map((link, i) => (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: 40 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.4, delay: 0.15 + i * 0.08 }}
                    >
                      <Link
                        href={link.href}
                        onClick={() => setMenuOpen(false)}
                        className={`block text-4xl lg:text-5xl font-bold tracking-tighter hover:pl-4 transition-all duration-500 uppercase leading-none ${
                          pathname === link.href ? "text-primary" : "text-gray-300 hover:text-primary"
                        }`}
                      >
                        {link.label}
                      </Link>
                    </motion.div>
                  ))}

                </nav>
              </div>

              {/* Bottom */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="px-8 lg:px-16 pb-12"
              >
                <div className="flex flex-wrap gap-8 border-t border-gray-200 pt-8">
                  {!loading && user && isStaff && (
                    <Link
                      href="/admin"
                      onClick={() => setMenuOpen(false)}
                      className="text-xs uppercase tracking-[0.2em] font-medium text-primary hover:text-accent transition-colors"
                    >
                      Admin Console
                    </Link>
                  )}
                  {!loading && user && (
                    <button
                      onClick={handleSignOut}
                      className="text-xs uppercase tracking-[0.2em] font-medium text-gray-400 hover:text-red-600 transition-colors"
                    >
                      Sign Out
                    </button>
                  )}
                </div>

                <div className="mt-12 flex justify-between items-end">
                  <div className="text-[10px] uppercase tracking-widest text-gray-400">
                    &copy; {new Date().getFullYear()} RE:GALIA
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
