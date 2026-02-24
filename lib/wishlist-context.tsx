"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

interface WishlistCtx {
  ids: string[];
  has: (id: string) => boolean;
  toggle: (id: string) => void;
  count: number;
}

const WishlistContext = createContext<WishlistCtx>({
  ids: [],
  has: () => false,
  toggle: () => {},
  count: 0,
});

const STORAGE_KEY = "regalia_wishlist";

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setIds(JSON.parse(stored));
    } catch {}
  }, []);

  // Persist to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch {}
  }, [ids]);

  const has = useCallback((id: string) => ids.includes(id), [ids]);

  const toggle = useCallback((id: string) => {
    setIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  return (
    <WishlistContext.Provider value={{ ids, has, toggle, count: ids.length }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}
