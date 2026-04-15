"use client";

import { HangerProvider } from "@/lib/hanger-context";

export default function Providers({ children }: { children: React.ReactNode }) {
  return <HangerProvider>{children}</HangerProvider>;
}
