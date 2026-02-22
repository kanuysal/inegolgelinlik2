import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ["Cormorant Garamond", "Georgia", "Times New Roman", "serif"],
        sans: ["PP Monument Extended", "system-ui", "Segoe UI", "sans-serif"],
        display: ["PP Monument Extended", "system-ui", "sans-serif"],
      },
      colors: {
        obsidian: "#1c1c1c",
        silk: "#FFFFFF",
        "bridal-white": "#FFFFFF",
        champagne: "#F7E7CE",
        "gold-muted": "#D4AF37",
        "resonance-amber": "#c9a96e",
        "resonance-blue": "#8da9c4",
        neutral: "#efefef",
        border: "#cfcfcf",
        primary: "#111111",
        "background-light": "#FDFDFD",
        accent: "#C5A059",
        secondary: "#f9f8f6",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.8s ease-out forwards",
        shimmer: "shimmer 2s linear infinite",
        marquee: "marquee 40s linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;
