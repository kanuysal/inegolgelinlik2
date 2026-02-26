"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";

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
  const [cleaned, setCleaned] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setIds(JSON.parse(stored));
    } catch {}
  }, []);

  // Cleanup expired/deleted items from wishlist
  useEffect(() => {
    if (ids.length === 0 || cleaned) return;

    async function cleanupWishlist() {
      const supabase = createClient();

      // Fetch all wishlist items from database
      const { data: listings } = await supabase
        .from('listings')
        .select('id, status')
        .in('id', ids);

      if (!listings) return;

      // Get valid listing IDs (approved listings only)
      const validIds = new Set(
        (listings as Array<{ id: string; status: string }>)
          .filter(l => l.status === 'approved')
          .map(l => l.id)
      );

      // Filter out expired/deleted items
      const cleanedIds = ids.filter(id => validIds.has(id));

      // Update if any items were removed
      if (cleanedIds.length !== ids.length) {
        console.log(`Cleaned ${ids.length - cleanedIds.length} expired items from wishlist`);
        setIds(cleanedIds);
      }

      setCleaned(true);
    }

    cleanupWishlist();
  }, [ids, cleaned]);

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
