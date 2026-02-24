"use client";

import { WishlistProvider } from "@/lib/wishlist-context";

export default function Providers({ children }: { children: React.ReactNode }) {
  return <WishlistProvider>{children}</WishlistProvider>;
}
