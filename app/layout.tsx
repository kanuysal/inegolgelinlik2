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
  title: "Mina Lidya Gelinlik - İnegöl Özel Tasarım Gelinlik & Kiralama",
  description:
    "Hayalinizdeki lüks gelinliği İnegöl'deki atölyemizde kişiye özel dikim veya kiralama seçenekleriyle keşfedin. İspanyol tasarımı ve Anadolu işçiliğinin buluştuğu eşsiz tasarımlar.",
  icons: {
    icon: "/icon.png",
    shortcut: "/favicon.png",
    apple: "/icon.png",
  },
  openGraph: {
    title: "Mina Lidya Gelinlik - İnegöl Özel Tasarım Gelinlik & Kiralama",
    description:
      "Hayalinizdeki lüks gelinliği usta işçilik ve modern tasarımla keşfedin. İnegöl kiralık gelinlik ve özel dikim.",
    url: "https://minalidya.wedding",
    siteName: "Mina Lidya",
    images: [
      {
        url: "/og.jpg",
        width: 1200,
        height: 630,
        alt: "Mina Lidya Gelinlik Koleksiyonu",
      },
    ],
    locale: "tr_TR",
    type: "website",
  },
};

import Script from "next/script";
import SmoothScroll from "@/components/ui/SmoothScroll";
import Providers from "@/components/Providers";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className={cormorant.variable}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-white text-[#1c1c1c] antialiased font-sans">
        {/* Google Analytics */}
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-D3GMBGWZ19" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-D3GMBGWZ19');
          `}
        </Script>
        <Providers>
          <SmoothScroll>
            {children}
          </SmoothScroll>
        </Providers>
      </body>
    </html>
  );
}
