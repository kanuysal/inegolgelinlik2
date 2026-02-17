"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
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
        const { data: roles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", u.id);

        const staffRoles = (roles as any[])?.some(r => r.role === "admin" || r.role === "moderator");
        setIsStaff(staffRoles ?? false);
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
    ? "top-4 mx-auto max-w-[90%] rounded-full resonance-panel px-4"
    : "top-0 w-full bg-transparent";

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed left-0 right-0 z-[60] transition-all duration-500 ${navClass}`}
      >
        <div className="mx-auto h-16 flex items-center justify-between px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="font-sans font-bold text-xl tracking-tight text-white transition-colors">
              RE:GALIA
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`font-sans text-[13px] font-medium transition-colors duration-300 ${pathname === link.href
                  ? "text-resonance-amber"
                  : "text-white/50 hover:text-white"
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop right side */}
          <div className="hidden md:flex items-center gap-6">
            {!loading && (
              <>
                {isStaff && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-2 px-4 py-1.5 rounded-full resonance-panel border-resonance-amber/20 hover:border-resonance-amber/40 transition-all group"
                  >
                    <span className="w-2 h-2 rounded-full bg-resonance-amber animate-pulse" />
                    <span className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-resonance-amber/80 group-hover:text-resonance-amber">
                      Console
                    </span>
                  </Link>
                )}

                {user ? (
                  /* Signed in — show account button */
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDropdownOpen(!dropdownOpen);
                      }}
                      className="flex items-center gap-2.5 group"
                    >
                      {user.user_metadata?.avatar_url ? (
                        <img
                          src={user.user_metadata.avatar_url}
                          alt="Avatar"
                          className="w-8 h-8 rounded-full border border-white/10 group-hover:border-resonance-amber/40 transition-colors"
                        />
                      ) : (
                        <span className="w-8 h-8 rounded-full bg-resonance-amber/10 border border-resonance-amber/20 flex items-center justify-center text-resonance-amber text-xs font-sans font-medium">
                          {userInitial}
                        </span>
                      )}
                      <span className="font-sans text-xs uppercase tracking-[0.15em] text-white/50 group-hover:text-white/70 transition-colors">
                        Account
                      </span>
                    </button>

                    {/* Dropdown */}
                    <AnimatePresence>
                      {dropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.96 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 top-12 w-52 bg-[#111] border border-white/10 rounded-sm shadow-2xl overflow-hidden"
                        >
                          {/* User info */}
                          <div className="px-4 py-3 border-b border-white/5">
                            <p className="font-sans text-xs text-white/70 truncate">
                              {user.user_metadata?.full_name || user.email}
                            </p>
                            {user.user_metadata?.full_name && (
                              <p className="font-sans text-[10px] text-white/30 truncate mt-0.5">
                                {user.email}
                              </p>
                            )}
                          </div>

                          <div className="py-1">
                            <Link
                              href="/dashboard"
                              className="block px-4 py-2.5 font-sans text-xs uppercase tracking-[0.15em] text-white/50 hover:text-white hover:bg-white/5 transition-colors"
                            >
                              Dashboard
                            </Link>
                            <Link
                              href="/sell"
                              className="block px-4 py-2.5 font-sans text-xs uppercase tracking-[0.15em] text-white/50 hover:text-white hover:bg-white/5 transition-colors"
                            >
                              Sell a Gown
                            </Link>
                            <button
                              onClick={handleSignOut}
                              className="w-full text-left px-4 py-2.5 font-sans text-xs uppercase tracking-[0.15em] text-white/30 hover:text-red-400 hover:bg-white/5 transition-colors"
                            >
                              Sign Out
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  /* Not signed in — show Sign In link */
                  <Link
                    href="/auth/login"
                    className="font-sans text-xs uppercase tracking-[0.2em] text-white/40 hover:text-white/70 transition-colors"
                  >
                    Sign In
                  </Link>
                )}
              </>
            )}
            <Link
              href="/shop"
              className="font-sans text-[13px] font-semibold px-6 py-2 bg-white text-black rounded-full hover:bg-resonance-amber transition-colors duration-300"
            >
              Browse
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden flex flex-col gap-1.5 p-2"
            aria-label="Toggle menu"
          >
            <motion.span
              animate={mobileOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
              className="block w-5 h-[1.5px] bg-white"
            />
            <motion.span
              animate={mobileOpen ? { opacity: 0 } : { opacity: 1 }}
              className="block w-5 h-[1.5px] bg-white"
            />
            <motion.span
              animate={mobileOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
              className="block w-5 h-[1.5px] bg-white"
            />
          </button>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[55] bg-black/98 backdrop-blur-xl flex flex-col items-center justify-center gap-10"
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
                  className={`font-sans text-4xl font-bold tracking-tight ${pathname === link.href ? "text-resonance-amber" : "text-white/80"
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
                            className="w-12 h-12 rounded-full border border-white/10"
                          />
                        ) : (
                          <span className="w-12 h-12 rounded-full bg-resonance-amber/20 border border-resonance-amber/30 flex items-center justify-center text-resonance-amber text-lg font-bold">
                            {userInitial}
                          </span>
                        )}
                        <div>
                          <p className="font-sans text-lg font-bold text-white">
                            {user.user_metadata?.full_name || "My Account"}
                          </p>
                          <p className="font-sans text-sm text-white/40">{user.email}</p>
                        </div>
                      </div>
                      {isStaff && (
                        <Link
                          href="/admin"
                          className="font-sans text-lg font-semibold text-resonance-amber border border-resonance-amber/30 px-6 py-2 rounded-full mb-2"
                        >
                          Admin Console
                        </Link>
                      )}
                      <Link
                        href="/dashboard"
                        className="font-sans text-lg font-semibold text-white/60 mb-2"
                      >
                        Dashboard
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="font-sans text-lg font-semibold text-white/30 hover:text-red-400 transition-colors"
                      >
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <Link
                      href="/auth/login"
                      className="font-sans text-xl font-bold text-white/50"
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
