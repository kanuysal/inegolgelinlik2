"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { checkIsStaff } from "@/app/auth/actions";
import type { User } from "@supabase/supabase-js";

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
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setDropdownOpen(false);
  }, [pathname]);

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

  const navBg = scrolled
    ? "bg-white/95 backdrop-blur-xl border-b border-black/5"
    : "bg-transparent";

  const textColor = scrolled || !isHome ? "text-[#1c1c1c]" : "text-white";
  const mutedColor = scrolled || !isHome ? "text-[#1c1c1c]/50" : "text-white/60";

  return (
    <>
      {/* Top nav bar - full width, Galia Lahav style */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-[60] transition-all duration-500 ${navBg}`}
      >
        <div className="max-w-[85rem] mx-auto px-6 md:px-16">
          <div className="h-[65px] flex items-center justify-between">
            {/* Left - Menu Toggle & Desktop Links */}
            <div className="flex-1 flex items-center gap-10">
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="flex flex-col gap-[5px] p-2 -ml-2 group md:hidden"
                aria-label="Toggle menu"
              >
                <motion.span
                  animate={mobileOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
                  className={`block w-5 h-[1px] bg-current ${textColor} transition-colors duration-500`}
                />
                <motion.span
                  animate={mobileOpen ? { rotate: -45, y: -1 } : { rotate: 0, y: 0 }}
                  className={`block w-5 h-[1px] bg-current ${textColor} transition-colors duration-500`}
                />
              </button>

              <div className="hidden md:flex items-center gap-10">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`font-sans text-[13px] font-light uppercase tracking-[0.08em] transition-all duration-300 ${pathname === link.href
                      ? `${textColor}`
                      : `${mutedColor} hover:${textColor}`
                      }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Center - Logo */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <Link href="/" className="flex items-center">
                <span className={`font-serif text-2xl tracking-[0.25em] uppercase transition-colors duration-500 font-light ${textColor}`}>
                  RE:GALIA
                </span>
              </Link>
            </div>

            {/* Right - Actions */}
            <div className="flex-1 flex items-center justify-end gap-6">
              {!loading && (
                <div className="flex items-center gap-6">
                  {user ? (
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDropdownOpen(!dropdownOpen);
                        }}
                        className="flex items-center gap-2"
                      >
                        <div className={`w-8 h-8 border flex items-center justify-center transition-all duration-500 ${scrolled || !isHome ? 'border-[#1c1c1c]/15 text-[#1c1c1c]' : 'border-white/30 text-white'}`}>
                          {user.user_metadata?.avatar_url ? (
                            <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-[10px] font-light">{userInitial}</span>
                          )}
                        </div>
                      </button>

                      <AnimatePresence>
                        {dropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 8 }}
                            className="absolute right-0 top-12 w-52 bg-white border border-black/5 shadow-lg overflow-hidden py-2"
                          >
                            <Link href="/dashboard" className="block px-5 py-3 font-sans text-[12px] font-light uppercase tracking-[0.05em] text-[#1c1c1c]/60 hover:text-[#1c1c1c] hover:bg-neutral/50 transition-colors">Dashboard</Link>
                            <Link href="/sell" className="block px-5 py-3 font-sans text-[12px] font-light uppercase tracking-[0.05em] text-[#1c1c1c]/60 hover:text-[#1c1c1c] hover:bg-neutral/50 transition-colors">Sell Gown</Link>
                            {isStaff && (
                              <Link href="/admin" className="block px-5 py-3 font-sans text-[12px] font-light uppercase tracking-[0.05em] text-[#1c1c1c] hover:bg-neutral/50 transition-colors">Admin Console</Link>
                            )}
                            <button onClick={handleSignOut} className="w-full text-left px-5 py-3 font-sans text-[12px] font-light uppercase tracking-[0.05em] text-[#1c1c1c]/40 hover:text-red-600 hover:bg-red-50/50 transition-colors">Sign Out</button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <Link
                      href="/auth/login"
                      className={`font-sans text-[13px] font-light uppercase tracking-[0.08em] transition-colors duration-300 ${mutedColor} hover:opacity-100`}
                    >
                      Sign In
                    </Link>
                  )}

                  <Link
                    href="/shop"
                    className="font-sans text-[11px] font-light uppercase tracking-[0.15em] px-7 py-3 bg-[#1c1c1c] text-white hover:bg-[#333] transition-all duration-300"
                  >
                    Browse
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile menu - full screen overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[55] bg-white flex flex-col items-center justify-center gap-10"
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
                  className={`font-serif text-4xl font-light tracking-tight ${pathname === link.href ? "text-[#1c1c1c]" : "text-[#1c1c1c]/40"
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
                    <>
                      <div className="flex items-center gap-4 mb-4">
                        {user.user_metadata?.avatar_url ? (
                          <img
                            src={user.user_metadata.avatar_url}
                            alt="Avatar"
                            className="w-12 h-12 border border-[#1c1c1c]/10"
                          />
                        ) : (
                          <span className="w-12 h-12 bg-neutral flex items-center justify-center text-[#1c1c1c] text-lg font-light">
                            {userInitial}
                          </span>
                        )}
                        <div>
                          <p className="font-sans text-lg font-light text-[#1c1c1c]">
                            {user.user_metadata?.full_name || "My Account"}
                          </p>
                          <p className="font-sans text-sm text-[#1c1c1c]/40">{user.email}</p>
                        </div>
                      </div>
                      {isStaff && (
                        <Link
                          href="/admin"
                          className="font-sans text-sm font-light text-[#1c1c1c] border border-[#1c1c1c]/20 px-6 py-2 uppercase tracking-[0.08em] mb-2"
                        >
                          Admin Console
                        </Link>
                      )}
                      <Link
                        href="/dashboard"
                        className="font-sans text-lg font-light text-[#1c1c1c]/60 mb-2"
                      >
                        Dashboard
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="font-sans text-lg font-light text-[#1c1c1c]/30 hover:text-red-400 transition-colors"
                      >
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <Link
                      href="/auth/login"
                      className="font-sans text-xl font-light text-[#1c1c1c]/50"
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
