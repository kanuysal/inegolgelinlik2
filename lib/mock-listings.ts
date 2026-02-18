/* ══════════════════════════════════════════════════
   Mock Listing Data — RE:GALIA Shop
   ══════════════════════════════════════════════════ */

export type ListingType = "peer_to_peer" | "sample_sale" | "brand_direct";

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
  listingType: ListingType;
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

const GOWN_DATA = [
  { name: "Artemis", img: "Artemis_1.jpg", stock: "Artemis_3_1_e4f05321-a228-4bbc-aa4d-c8c13b478d8e.jpg" },
  { name: "Gaia", img: "Gaia_2_f64decaf-b6c1-4161-8b5b-55250e565f95.jpg", stock: "Gaia_4.jpg" },
  { name: "Nora", img: "Nora_2.jpg", stock: "Nora_4-2.jpg" },
  { name: "Catherine", img: "Catherine_White_1_4a482ec0-b216-4414-9c50-25b1f9bc3ebb.jpg", stock: "Catherine_White_2.jpg" },
  { name: "Eden", img: "Eden_1_73a74c24-81c3-4906-b854-3ea1d04fa17f.jpg", stock: "Eden_4.jpg" },
  { name: "Tal", img: "Tal_1_b74cb4cd-148f-4498-b31a-3eda97a95f21.jpg", stock: "Tal_2.jpg" },
  { name: "Camellia", img: "Camellia_1_765abdb6-922a-481d-803c-6e243a2b5578.jpg", stock: "Camellia_2.jpg" },
  { name: "Hazel", img: "Hazel_White_MF1.jpg", stock: "Hazel_White_B.jpg" },
  { name: "Meghan", img: "Meghan_F.jpg", stock: "Meghan_MB.jpg" },
  { name: "Lia", img: "Lia_Top_Lia_Skirt_MF.jpg", stock: "Lia_Top_Lia_Skirt_MF1.jpg" },
  { name: "Toni", img: "Toni_F1.jpg", stock: "Toni_MF1.jpg" },
  { name: "Lilah", img: "Lilah_3.jpg", stock: "Lilah_5.jpg" },
  { name: "Willow", img: "WillowTop_WynterSkirtF.jpg", stock: "WillowTop_WynterSkirtB.jpg" },
  { name: "Tango", img: "TangoMF.jpg", stock: "TangoB.jpg" },
  { name: "Stassie", img: "StassieF.jpg", stock: "StassieMF.jpg" },
  { name: "Hallie", img: "HallieMF1.jpg", stock: "IMG_1478.jpg" },
  { name: "Courtney", img: "CourtneyF.jpg", stock: "CourtneyB.jpg" },
  { name: "Ina", img: "InaF.jpg", stock: "InaMB1.jpg" },
  { name: "Clara", img: "ClaraMF.jpg", stock: "IMG_2295_30aabcee-17d4-447d-a034-d4a1084592d7.jpg" },
  { name: "Frankie", img: "Frankie_Balconette_1.jpg", stock: "Frankie_Balconette_2.jpg" },
  { name: "Angel", img: "Angel_Robe_3.jpg", stock: "Angel_Robe_2.jpg" },
  { name: "Lily", img: "Lily_Bra_1.jpg", stock: "Lily_Bra_2.jpg" },
];

const CDN_BASE = "https://www.galialahav.com/cdn/shop/files/";

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

  return GOWN_DATA.map((gown, i) => {
    const original = 8000 + Math.floor(random() * 15000); // Luxury pricing
    const discount = 0.3 + random() * 0.4; // 30-70% off
    const sale = Math.round(original * (1 - discount));
    const isGala = i < 12; // Assign first 12 to GALA
    return {
      id: `gl-${String(i + 1).padStart(4, "0")}`,
      title: gown.name,
      collection: isGala ? "GALA by Galia Lahav" : "Bridal Couture",
      designer: "Galia Lahav",
      originalPrice: original,
      salePrice: sale,
      currency: "USD",
      size: pickRandom(SIZES),
      condition: pickRandom(CONDITIONS),
      silhouette: pickRandom(SILHOUETTES),
      neckline: pickRandom(NECKLINES),
      fabric: pickRandom(FABRICS),
      color: pickRandom(["Ivory", "Soft White", "Champagne", "Blush"]),
      imageUrl: `${CDN_BASE}${gown.img}?width=1000`,
      stockImageUrl: `${CDN_BASE}${gown.stock || gown.img}?width=1000`,
      verified: true,
      featured: i < 6,
      saves: Math.floor(random() * 450) + 50,
      daysListed: Math.floor(random() * 30) + 1,
      sellerLocation: pickRandom(["New York, US", "Los Angeles, US", "London, UK", "Paris, FR", "Tel Aviv, IL", "Dubai, AE"]),
      listingType: i < 4 ? "brand_direct" : (i < 6 ? "sample_sale" : "peer_to_peer"),
      measurements: {
        bust: `${32 + Math.floor(random() * 6)}"`,
        waist: `${24 + Math.floor(random() * 6)}"`,
        hips: `${34 + Math.floor(random() * 6)}"`,
        height: `5'${6 + Math.floor(random() * 6)}"`,
      },
    };
  });
}

export const mockListings: Listing[] = generateListings();
