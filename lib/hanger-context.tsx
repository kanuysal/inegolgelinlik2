"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

interface HangerCtx {
  ids: string[];
  isOnHanger: (id: string) => boolean;
  toggleHanger: (id: string) => void;
  removeId: (id: string) => void;
  count: number;
}

const HangerContext = createContext<HangerCtx>({
  ids: [],
  isOnHanger: () => false,
  toggleHanger: () => {},
  removeId: () => {},
  count: 0,
});

const STORAGE_KEY = "minalidya_hanger";

export function HangerProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setIds(JSON.parse(stored));
    } catch {}
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch {}
  }, [ids, mounted]);

  const isOnHanger = useCallback((id: string) => ids.includes(id.toString()), [ids]);

  const toggleHanger = useCallback((id: string) => {
    const stringId = id.toString();
    setIds((prev) =>
      prev.includes(stringId) ? prev.filter((x) => x !== stringId) : [...prev, stringId]
    );
  }, []);

  const removeId = useCallback((id: string) => {
    const stringId = id.toString();
    setIds((prev) => prev.filter((x) => x !== stringId));
  }, []);

  return (
    <HangerContext.Provider value={{ ids, isOnHanger, toggleHanger, removeId, count: ids.length }}>
      {children}
    </HangerContext.Provider>
  );
}

export function useHanger() {
  return useContext(HangerContext);
}
