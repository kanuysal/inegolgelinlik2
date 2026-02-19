"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { checkIsStaff } from "@/app/auth/actions";
import type { User } from "@supabase/supabase-js";

function VerifiedBadgeSmall() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5">
      <path
        d="M12 2L14.09 4.26L17 3.64L17.18 6.57L19.82 8.07L18.56 10.74L20 13.14L17.72 14.72L17.5 17.66L14.58 17.95L12.73 20.39L10.27 18.76L7.27 19.5L6.27 16.73L3.53 15.32L4.63 12.56L3.27 10L5.57 8.45L5.82 5.51L8.74 5.27L10.64 2.87L12 2Z"
        fill="currentColor"
      />
      <path
        d="M9 12L11 14L15 10"
        stroke="#050505"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const NAV_LINKS = [
  { href: "/shop", label: "Shop" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/sell", label: "Sell" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isStaff, setIsStaff] = useState(false);

  const isHome = pathname === "/";

  // Listen for auth state changes
  useEffect(() => {
    const supabase = createClient();

    const fetchUserAndRole = async (u: User | null) => {
      setUser(u);
      if (u) {
        // Use server action (admin client) to bypass RLS on user_roles
        const staff = await checkIsStaff();
        setIsStaff(staff);
      } else {
        setIsStaff(false);
      }
      setLoading(false);
    };

    // Get initial session
    supabase.auth.getUser().then(({ data: { user } }) => {
      fetchUserAndRole(user);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      fetchUserAndRole(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // On route change, close menus
  useEffect(() => {
    setMobileOpen(false);
    setDropdownOpen(false);
  }, [pathname]);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!dropdownOpen) return;
    const handler = () => setDropdownOpen(false);
    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, [dropdownOpen]);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setIsStaff(false);
    setDropdownOpen(false);
    router.push("/");
    router.refresh();
  };

  const userInitial = user?.user_metadata?.full_name
    ? user.user_metadata.full_name.charAt(0).toUpperCase()
    : user?.email
      ? user.email.charAt(0).toUpperCase()
      : "U";

  const navClass = scrolled
    ? "top-6 bg-white/95 backdrop-blur-xl border border-black/5 shadow-2xl"
    : "top-8 bg-transparent border-transparent";

  const textClass = scrolled ? "text-obsidian" : "text-white";
  const mutedTextClass = scrolled ? "text-obsidian/40" : "text-white/50";

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-[60] flex justify-center pointer-events-none p-6">
        <motion.nav
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className={`h-16 flex items-center justify-between px-6 rounded-full transition-all duration-700 pointer-events-auto w-full max-w-5xl relative ${navClass}`}
        >
          {/* Menu Toggle & Desktop Links - Left */}
          <div className="flex-1 flex items-center gap-8">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="flex flex-col gap-[5px] p-2 -ml-2 group z-20"
              aria-label="Toggle menu"
            >
              <motion.span
                animate={mobileOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
                className={`block w-6 h-[1.5px] ${textClass} transition-colors duration-500`}
              />
              <motion.span
                animate={mobileOpen ? { rotate: -45, y: -1 } : { rotate: 0, y: 0 }}
                className={`block w-6 h-[1.5px] ${textClass} transition-colors duration-500`}
              />
            </button>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-8">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`font-sans text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-500 whitespace-nowrap ${pathname === link.href
                    ? "text-[#C5A059]"
                    : `${mutedTextClass} hover:text-[#C5A059]`
                    }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Logo - Centered (Atmos Style) */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <Link href="/" className="flex items-center gap-2 group">
              <span className={`font-sans font-bold text-xl tracking-[0.2em] uppercase transition-colors duration-500 ${textClass}`}>
                RE:GALIA
              </span>
            </Link>
          </div>

          {/* Actions - Right */}
          <div className="flex-1 flex items-center justify-end gap-6 text-obsidian">
            {/* Minimal Desktop Browse */}
            {!loading && (
              <div className="flex items-center gap-4">
                {user ? (
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDropdownOpen(!dropdownOpen);
                      }}
                      className="flex items-center gap-2 group"
                    >
                      <div className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-500 ${scrolled ? 'bg-gold-muted/10 border-gold-muted/20 text-gold-muted' : 'bg-white/10 border-white/20 text-white'}`}>
                        {user.user_metadata?.avatar_url ? (
                          <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full rounded-full" />
                        ) : (
                          <span className="text-[10px] font-bold">{userInitial}</span>
                        )}
                      </div>
                    </button>

                    <AnimatePresence>
                      {dropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.96 }}
                          className="absolute right-0 top-12 w-52 bg-white border border-black/5 rounded-2xl shadow-2xl overflow-hidden py-2"
                        >
                          <Link href="/dashboard" className="block px-5 py-3 font-sans text-[10px] font-bold uppercase tracking-[0.1em] text-obsidian/60 hover:text-obsidian hover:bg-black/5">Dashboard</Link>
                          <Link href="/sell" className="block px-5 py-3 font-sans text-[10px] font-bold uppercase tracking-[0.1em] text-obsidian/60 hover:text-obsidian hover:bg-black/5">Sell Gown</Link>
                          {isStaff && (
                            <Link href="/admin" className="block px-5 py-3 font-sans text-[10px] font-bold uppercase tracking-[0.1em] text-[#C5A059] hover:text-[#B38E48] hover:bg-black/5 font-bold">Admin Console</Link>
                          )}
                          <button onClick={handleSignOut} className="w-full text-left px-5 py-3 font-sans text-[10px] font-bold uppercase tracking-[0.1em] text-red-500/60 hover:text-red-600 hover:bg-red-50">Sign Out</button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <Link
                    href="/auth/login"
                    className={`font-sans text-[10px] font-bold uppercase tracking-[0.2em] transition-colors duration-500 ${mutedTextClass} hover:text-gold-muted`}
                  >
                    Sign In
                  </Link>
                )}

                <Link
                  href="/shop"
                  className={`font-sans text-[10px] font-bold uppercase tracking-[0.2em] px-8 py-3 rounded-full transition-all duration-500 border ${scrolled
                    ? "bg-[#C5A059] text-white border-[#C5A059] hover:bg-[#B38E48]"
                    : "bg-[#C5A059] text-white border-[#C5A059] hover:scale-105 active:scale-95"
                    }`}
                >
                  Browse
                </Link>
              </div>
            )}
          </div>
        </motion.nav>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[55] bg-silk/98 backdrop-blur-xl flex flex-col items-center justify-center gap-10"
          >
            {NAV_LINKS.map((link, i) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <Link
                  href={link.href}
                  className={`font-sans text-4xl font-bold tracking-tight ${pathname === link.href ? "text-gold-muted" : "text-obsidian/80"
                    }`}
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-8 flex flex-col items-center gap-6"
            >
              {!loading && (
                <>
                  {user ? (
                    /* Signed in — mobile account links */
                    <>
                      <div className="flex items-center gap-4 mb-4">
                        {user.user_metadata?.avatar_url ? (
                          <img
                            src={user.user_metadata.avatar_url}
                            alt="Avatar"
                            className="w-12 h-12 rounded-full border border-obsidian/10"
                          />
                        ) : (
                          <span className="w-12 h-12 rounded-full bg-gold-muted/10 border border-gold-muted/20 flex items-center justify-center text-gold-muted text-lg font-bold">
                            {userInitial}
                          </span>
                        )}
                        <div>
                          <p className="font-sans text-lg font-bold text-obsidian">
                            {user.user_metadata?.full_name || "My Account"}
                          </p>
                          <p className="font-sans text-sm text-obsidian/40">{user.email}</p>
                        </div>
                      </div>
                      {isStaff && (
                        <Link
                          href="/admin"
                          className="font-sans text-lg font-semibold text-gold-muted border border-gold-muted/30 px-6 py-2 rounded-full mb-2"
                        >
                          Admin Console
                        </Link>
                      )}
                      <Link
                        href="/dashboard"
                        className="font-sans text-lg font-semibold text-obsidian/60 mb-2"
                      >
                        Dashboard
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="font-sans text-lg font-semibold text-obsidian/30 hover:text-red-400 transition-colors"
                      >
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <Link
                      href="/auth/login"
                      className="font-sans text-xl font-bold text-obsidian/50"
                    >
                      Sign In
                    </Link>
                  )}
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
