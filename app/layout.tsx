import type { Metadata } from "next";
import { Cormorant_Garamond } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-serif",
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
import Providers from "@/components/Providers";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cormorant.variable}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-white text-[#1c1c1c] antialiased font-sans">
        <Providers>
          <SmoothScroll>
            {children}
          </SmoothScroll>
        </Providers>
      </body>
    </html>
  );
}
