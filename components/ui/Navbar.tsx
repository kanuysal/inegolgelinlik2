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
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isStaff, setIsStaff] = useState(false);

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

  return (
    <>
      {/* ── Stitch-style top nav ── */}
      <nav className="border-b border-gray-100 sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

          {/* Left — Hamburger (mobile) + Desktop links */}
          <div className="flex items-center space-x-8">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="flex items-center space-x-2 md:hidden"
              aria-label="Toggle menu"
            >
              <span className="material-symbols-outlined text-xl">menu</span>
            </button>

            <div className="hidden md:flex items-center space-x-8">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-xs uppercase tracking-[0.15em] font-medium transition-colors hover:text-accent ${pathname === link.href ? "text-primary" : "text-gray-400"
                    }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Center — Brand */}
          <div className="absolute left-1/2 -translate-x-1/2 text-center">
            <Link href="/" className="font-serif text-2xl tracking-widest uppercase">
              RE:GALIA
            </Link>
          </div>

          {/* Right — Icons */}
          <div className="flex items-center space-x-6">
            <Link href="/shop" className="hidden md:block">
              <span className="material-symbols-outlined cursor-pointer text-gray-600 hover:text-primary transition-colors">search</span>
            </Link>
            <Link href="/shop" className="hidden md:block">
              <span className="material-symbols-outlined cursor-pointer text-gray-600 hover:text-primary transition-colors">favorite</span>
            </Link>

            {!loading && (
              <>
                {user ? (
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDropdownOpen(!dropdownOpen);
                      }}
                      className="flex items-center"
                    >
                      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center border border-gray-200">
                        {user.user_metadata?.avatar_url ? (
                          <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <span className="text-[10px] font-medium text-primary">{userInitial}</span>
                        )}
                      </div>
                    </button>

                    <AnimatePresence>
                      {dropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          className="absolute right-0 top-12 w-52 bg-white border border-gray-100 shadow-lg overflow-hidden py-2"
                        >
                          <Link href="/dashboard" className="block px-5 py-3 text-xs font-medium uppercase tracking-[0.05em] text-gray-500 hover:text-primary hover:bg-gray-50 transition-colors">
                            Dashboard
                          </Link>
                          <Link href="/sell" className="block px-5 py-3 text-xs font-medium uppercase tracking-[0.05em] text-gray-500 hover:text-primary hover:bg-gray-50 transition-colors">
                            Sell Gown
                          </Link>
                          {isStaff && (
                            <Link href="/admin" className="block px-5 py-3 text-xs font-medium uppercase tracking-[0.05em] text-primary hover:bg-gray-50 transition-colors">
                              Admin Console
                            </Link>
                          )}
                          <button onClick={handleSignOut} className="w-full text-left px-5 py-3 text-xs font-medium uppercase tracking-[0.05em] text-gray-400 hover:text-red-600 hover:bg-red-50/50 transition-colors">
                            Sign Out
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <Link
                    href="/auth/login"
                    className="text-xs font-medium uppercase tracking-[0.08em] text-gray-500 hover:text-primary transition-colors"
                  >
                    Sign In
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── Mobile menu — full screen overlay ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[55] bg-white flex flex-col items-center justify-center gap-10"
          >
            {/* Close button */}
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-6 right-6"
              aria-label="Close menu"
            >
              <span className="material-symbols-outlined text-2xl text-gray-600">close</span>
            </button>

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
                  className={`font-serif text-4xl font-light tracking-tight ${pathname === link.href ? "text-primary" : "text-gray-300"
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
                            className="w-12 h-12 rounded-full border border-gray-200"
                          />
                        ) : (
                          <span className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center text-primary text-lg font-light">
                            {userInitial}
                          </span>
                        )}
                        <div>
                          <p className="text-lg font-light text-primary">
                            {user.user_metadata?.full_name || "My Account"}
                          </p>
                          <p className="text-sm text-gray-400">{user.email}</p>
                        </div>
                      </div>
                      {isStaff && (
                        <Link
                          href="/admin"
                          className="text-sm font-light text-primary border border-gray-200 px-6 py-2 uppercase tracking-[0.08em] mb-2"
                        >
                          Admin Console
                        </Link>
                      )}
                      <Link
                        href="/dashboard"
                        className="text-lg font-light text-gray-500 mb-2"
                      >
                        Dashboard
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="text-lg font-light text-gray-300 hover:text-red-400 transition-colors"
                      >
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <Link
                      href="/auth/login"
                      className="text-xl font-light text-gray-400"
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
