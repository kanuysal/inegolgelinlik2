/* ══════════════════════════════════════════════════
   Galia Lahav Master Catalog — RE:GALIA
   ══════════════════════════════════════════════════ */

export interface CatalogGown {
    id: string;
    name: string;
    collection: "Bridal Couture" | "GALA by Galia Lahav" | "Evening" | "Accessories";
    description: string;
    silhouette: string;
    neckline?: string;
    msrp_range: string;
    images: string[];
}

const CDN_BASE = "https://www.galialahav.com/cdn/shop/files/";

export const GOWN_CATALOG: CatalogGown[] = [
    {
        id: "gl-artemis",
        name: "Artemis",
        collection: "Bridal Couture",
        description: "A statuesque mermaid gown with a plunging V-neckline, featuring intricate floral lace appliqués and a spectacular cathedral train.",
        silhouette: "Mermaid",
        msrp_range: "$12,000 - $18,000",
        images: [`${CDN_BASE}Artemis_1.jpg`, `${CDN_BASE}Artemis_3_1_e4f05321-a228-4bbc-aa4d-c8c13b478d8e.jpg`]
    },
    {
        id: "gl-gaia",
        name: "Gaia",
        collection: "Bridal Couture",
        description: "An ethereal A-line gown with a sheer corset bodice and hand-sewn 3D blossoms cascading into a voluminous silk tulle skirt.",
        silhouette: "A-Line",
        msrp_range: "$14,000 - $20,000",
        images: [`${CDN_BASE}Gaia_2_f64decaf-b6c1-4161-8b5b-55250e565f95.jpg`, `${CDN_BASE}Gaia_4.jpg`]
    },
    {
        id: "gl-nora",
        name: "Nora",
        collection: "GALA by Galia Lahav",
        description: "A romantic and modern ball gown with a square neckline and delicate sparkle tulle, perfect for the contemporary princess.",
        silhouette: "Ball Gown",
        msrp_range: "$8,000 - $12,000",
        images: [`${CDN_BASE}Nora_2.jpg`, `${CDN_BASE}Nora_4-2.jpg`]
    },
    {
        id: "gl-catherine",
        name: "Catherine",
        collection: "Bridal Couture",
        description: "A classic yet daring mermaid gown with off-the-shoulder sleeves and a signature low back, adorned with French lace.",
        silhouette: "Mermaid",
        msrp_range: "$11,000 - $16,000",
        images: [`${CDN_BASE}Catherine_White_1_4a482ec0-b216-4414-9c50-25b1f9bc3ebb.jpg`, `${CDN_BASE}Catherine_White_2.jpg`]
    },
    {
        id: "gl-eden",
        name: "Eden",
        collection: "GALA by Galia Lahav",
        description: "A bohemian-inspired A-line gown with a sweetheart neckline and dramatic detachable sleeves, featuring botanical embroidery.",
        silhouette: "A-Line",
        msrp_range: "$7,000 - $10,000",
        images: [`${CDN_BASE}Eden_1_73a74c24-81c3-4906-b854-3ea1d04fa17f.jpg`, `${CDN_BASE}Eden_4.jpg`]
    },
    {
        id: "gl-tal",
        name: "Tal",
        collection: "Bridal Couture",
        description: "A sophisticated sheath gown with a high slit and a draped silk satin bodice, embodying minimalist luxury.",
        silhouette: "Sheath",
        msrp_range: "$9,000 - $13,000",
        images: [`${CDN_BASE}Tal_1_b74cb4cd-148f-4498-b31a-3eda97a95f21.jpg`, `${CDN_BASE}Tal_2.jpg`]
    },
    {
        id: "gl-camellia",
        name: "Camellia",
        collection: "GALA by Galia Lahav",
        description: "A whimsical fit-and-flare gown with 3D floral lace and a shimmery underlay, designed for effortless movement.",
        silhouette: "Fit & Flare",
        msrp_range: "$8,500 - $12,500",
        images: [`${CDN_BASE}Camellia_1_765abdb6-922a-481d-803c-6e243a2b5578.jpg`, `${CDN_BASE}Camellia_2.jpg`]
    },
    {
        id: "gl-hazel",
        name: "Hazel",
        collection: "Bridal Couture",
        description: "A modern masterpiece featuring a structured corset, a pleated silk skirt, and a refined square neckline.",
        silhouette: "Ball Gown",
        msrp_range: "$13,000 - $19,000",
        images: [`${CDN_BASE}Hazel_White_MF1.jpg`, `${CDN_BASE}Hazel_White_B.jpg`]
    },
    {
        id: "gl-meghan",
        name: "Meghan",
        collection: "GALA by Galia Lahav",
        description: "A sleek and sexy mermaid gown with a deep plunge and intricate geometric beadwork.",
        silhouette: "Mermaid",
        msrp_range: "$7,500 - $11,000",
        images: [`${CDN_BASE}Meghan_F.jpg`, `${CDN_BASE}Meghan_MB.jpg`]
    },
    {
        id: "gl-lia",
        name: "Lia",
        collection: "Evening",
        description: "A two-piece ensemble featuring a beaded top and a layered silk skirt, personifying evening elegance.",
        silhouette: "A-Line",
        msrp_range: "$5,000 - $8,000",
        images: [`${CDN_BASE}Lia_Top_Lia_Skirt_MF.jpg`, `${CDN_BASE}Lia_Top_Lia_Skirt_MF1.jpg`]
    },
    {
        id: "gl-toni",
        name: "Toni",
        collection: "Bridal Couture",
        description: "A bold and architectural gown with oversized bow details and a clean, sculptural silhouette.",
        silhouette: "Sheath",
        msrp_range: "$10,000 - $15,000",
        images: [`${CDN_BASE}Toni_F1.jpg`, `${CDN_BASE}Toni_MF1.jpg`]
    },
    {
        id: "gl-lilah",
        name: "Lilah",
        collection: "GALA by Galia Lahav",
        description: "An enchanting ball gown with a sparkle tulle skirt and a corset bodice covered in floral lace.",
        silhouette: "Ball Gown",
        msrp_range: "$8,000 - $11,500",
        images: [`${CDN_BASE}Lilah_3.jpg`, `${CDN_BASE}Lilah_5.jpg`]
    }
];
