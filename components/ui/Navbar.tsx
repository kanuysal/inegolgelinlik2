"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { checkIsStaff } from "@/app/auth/actions";
import type { User } from "@supabase/supabase-js";

const MENU_LINKS = [
  { href: "/shop", label: "The Collection" },
  { href: "/sell", label: "Sell Your Gown" },
  { href: "/how-it-works", label: "How It Works" },
];

const SECONDARY_LINKS = [
  { href: "/how-it-works", label: "Authentication" },
  { href: "/how-it-works", label: "About Us" },
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
            ? "max-w-5xl h-14 bg-white/85 backdrop-blur-xl rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-white/60 px-6"
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

      {/* ── Full-screen menu overlay ── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-[100] flex h-screen w-screen overflow-hidden"
          >
            {/* Left — Editorial image (desktop only) */}
            <motion.div
              initial={{ scale: 1.1, opacity: 0 }}
              animate={{ scale: 1.05, opacity: 1 }}
              exit={{ scale: 1.1, opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="relative hidden lg:block lg:w-[60%] h-full overflow-hidden"
            >
              <img
                alt="Editorial bridal gown"
                className="absolute inset-0 w-full h-full object-cover"
                src="https://cdn.shopify.com/s/files/1/0839/7222/7357/files/Maya_side.jpg"
              />
              <div className="absolute inset-0 bg-black/40 mix-blend-multiply" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/20" />
              <div className="absolute bottom-12 left-12 text-white">
                <p className="text-xs uppercase tracking-[0.3em] font-light mb-2">The Archive</p>
                <h2 className="text-3xl font-light italic font-serif">Curated Couture</h2>
              </div>
            </motion.div>

            {/* Right — Navigation panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
              className="w-full lg:w-[40%] h-full bg-[#faf9f8] flex flex-col relative"
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
                        className={`block text-5xl lg:text-7xl font-bold tracking-tighter hover:pl-4 transition-all duration-500 uppercase leading-none ${
                          pathname === link.href ? "text-primary" : "text-gray-300 hover:text-primary"
                        }`}
                      >
                        {link.label}
                      </Link>
                    </motion.div>
                  ))}

                  {/* Account link */}
                  <motion.div
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.4, delay: 0.15 + MENU_LINKS.length * 0.08 }}
                  >
                    {!loading && (
                      user ? (
                        <Link
                          href="/dashboard"
                          onClick={() => setMenuOpen(false)}
                          className={`block text-5xl lg:text-7xl font-bold tracking-tighter hover:pl-4 transition-all duration-500 uppercase leading-none ${
                            pathname === "/dashboard" ? "text-primary" : "text-gray-300 hover:text-primary"
                          }`}
                        >
                          Account
                        </Link>
                      ) : (
                        <Link
                          href="/auth/login"
                          onClick={() => setMenuOpen(false)}
                          className="block text-5xl lg:text-7xl font-bold tracking-tighter hover:pl-4 transition-all duration-500 uppercase leading-none text-gray-300 hover:text-primary"
                        >
                          Sign In
                        </Link>
                      )
                    )}
                  </motion.div>
                </nav>
              </div>

              {/* Bottom — Secondary links + auth actions */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="px-8 lg:px-16 pb-12"
              >
                <div className="flex flex-wrap gap-8 border-t border-gray-200 pt-8">
                  {SECONDARY_LINKS.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      className="text-xs uppercase tracking-[0.2em] font-medium text-gray-500 hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
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
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
