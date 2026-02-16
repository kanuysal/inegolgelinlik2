/* ══════════════════════════════════════════════════
   Mock Listing Data — RE:GALIA Shop
   ══════════════════════════════════════════════════ */

export interface Listing {
  id: string;
  title: string;
  collection: string;
  designer: string;
  originalPrice: number;
  salePrice: number;
  currency: string;
  size: string;
  condition: "New Never Worn" | "Excellent" | "Very Good" | "Good";
  silhouette: "A-Line" | "Mermaid" | "Ball Gown" | "Sheath" | "Fit & Flare";
  neckline: "V-Neck" | "Sweetheart" | "Off-Shoulder" | "Strapless" | "High Neck" | "Illusion";
  fabric: "Lace" | "Tulle" | "Satin" | "Crepe" | "Organza" | "Silk";
  color: string;
  imageUrl: string;
  stockImageUrl: string;
  verified: boolean;
  featured: boolean;
  saves: number;
  daysListed: number;
  sellerLocation: string;
  measurements: {
    bust: string;
    waist: string;
    hips: string;
    height: string;
  };
}

export const COLLECTIONS = [
  "Couture",
  "GALA by Galia Lahav",
  "Bridal Couture",
  "Dancing Queen",
  "Do Not Disturb",
  "Victorian Affinity",
  "Queen of Hearts",
  "Fancy White",
  "Alegria",
];

export const SIZES = ["0", "2", "4", "6", "8", "10", "12", "14", "16"];
export const CONDITIONS: Listing["condition"][] = ["New Never Worn", "Excellent", "Very Good", "Good"];
export const SILHOUETTES: Listing["silhouette"][] = ["A-Line", "Mermaid", "Ball Gown", "Sheath", "Fit & Flare"];
export const NECKLINES: Listing["neckline"][] = ["V-Neck", "Sweetheart", "Off-Shoulder", "Strapless", "High Neck", "Illusion"];
export const FABRICS: Listing["fabric"][] = ["Lace", "Tulle", "Satin", "Crepe", "Organza", "Silk"];

export const PRICE_RANGES = [
  { label: "Under $3,000", min: 0, max: 3000 },
  { label: "$3,000 – $5,000", min: 3000, max: 5000 },
  { label: "$5,000 – $8,000", min: 5000, max: 8000 },
  { label: "$8,000 – $12,000", min: 8000, max: 12000 },
  { label: "Over $12,000", min: 12000, max: 999999 },
];

/* placeholder images using gown silhouettes — in production these come from the API */
const PLACEHOLDER_IMAGES = [
  "https://images.unsplash.com/photo-1594552072238-b8a33785b261?w=600&h=900&fit=crop&q=80",
  "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&h=900&fit=crop&q=80",
  "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=600&h=900&fit=crop&q=80",
  "https://images.unsplash.com/photo-1549416878-b9ca838fc293?w=600&h=900&fit=crop&q=80",
  "https://images.unsplash.com/photo-1522276498395-f4f68f7f8b5e?w=600&h=900&fit=crop&q=80",
  "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&h=900&fit=crop&q=80",
  "https://images.unsplash.com/photo-1585241936939-be4099591252?w=600&h=900&fit=crop&q=80",
  "https://images.unsplash.com/photo-1550005809-91ad75fb315f?w=600&h=900&fit=crop&q=80",
];

/* Seeded random number generator — ensures server & client produce identical values */
function createSeededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function generateListings(): Listing[] {
  const random = createSeededRandom(42);

  function pickRandom<T>(arr: T[]): T {
    return arr[Math.floor(random() * arr.length)];
  }

  const names = [
    "Almeria", "Brianna", "Celine", "Dahlia", "Estelle",
    "Fiorella", "Giselle", "Helena", "Isla", "Juliana",
    "Katerina", "Liliana", "Marcella", "Natasha", "Ophelia",
    "Primrose", "Rosalind", "Seraphina", "Tatiana", "Valentina",
    "Wisteria", "Xiomara", "Yasmine", "Zephyrine",
  ];

  return names.map((name, i) => {
    const original = 5000 + Math.floor(random() * 12000);
    const discount = 0.3 + random() * 0.4; // 30-70% off
    const sale = Math.round(original * (1 - discount));
    return {
      id: `gl-${String(i + 1).padStart(4, "0")}`,
      title: name,
      collection: pickRandom(COLLECTIONS),
      designer: "Galia Lahav",
      originalPrice: original,
      salePrice: sale,
      currency: "USD",
      size: pickRandom(SIZES),
      condition: pickRandom(CONDITIONS),
      silhouette: pickRandom(SILHOUETTES),
      neckline: pickRandom(NECKLINES),
      fabric: pickRandom(FABRICS),
      color: pickRandom(["Ivory", "White", "Champagne", "Blush", "Off-White"]),
      imageUrl: PLACEHOLDER_IMAGES[i % PLACEHOLDER_IMAGES.length],
      stockImageUrl: PLACEHOLDER_IMAGES[(i + 3) % PLACEHOLDER_IMAGES.length],
      verified: true,
      featured: i < 6,
      saves: Math.floor(random() * 120) + 5,
      daysListed: Math.floor(random() * 60) + 1,
      sellerLocation: pickRandom(["New York, US", "Los Angeles, US", "London, UK", "Paris, FR", "Tel Aviv, IL", "Dubai, AE", "Sydney, AU", "Toronto, CA"]),
      measurements: {
        bust: `${32 + Math.floor(random() * 10)}"`,
        waist: `${24 + Math.floor(random() * 8)}"`,
        hips: `${34 + Math.floor(random() * 10)}"`,
        height: `5'${4 + Math.floor(random() * 8)}"`,
      },
    };
  });
}

export const mockListings: Listing[] = generateListings();
