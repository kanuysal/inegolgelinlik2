import type { Metadata } from "next";
import { Cormorant_Garamond, Outfit } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-serif",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "RE:GALIA — Certified Pre-Owned Galia Lahav",
  description:
    "The official second-hand marketplace for Galia Lahav couture. Every gown authenticated, every story continued.",
  openGraph: {
    title: "RE:GALIA — Certified Pre-Owned Galia Lahav",
    description:
      "Own a piece of couture history. Authenticated Galia Lahav gowns at accessible prices.",
    type: "website",
  },
};

import SmoothScroll from "@/components/ui/SmoothScroll";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${cormorant.variable} ${outfit.variable}`}>
      <body className="bg-white text-[#1c1c1c] antialiased">
        <SmoothScroll>
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}
