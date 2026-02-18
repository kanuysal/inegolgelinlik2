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

/** Helper to create a minimal catalog entry */
function gown(
    name: string,
    collection: CatalogGown["collection"],
    silhouette = "",
    msrp_range = "",
    description = "",
    images: string[] = [],
): CatalogGown {
    return {
        id: `gl-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
        name,
        collection,
        description,
        silhouette,
        msrp_range,
        images,
    };
}

export const GOWN_CATALOG: CatalogGown[] = [
    /* ────────────────────────────────────────────────
       FEATURED — Detailed entries
       ──────────────────────────────────────────────── */
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
    },

    /* ────────────────────────────────────────────────
       BRIDAL COUTURE — L'Étoile Collection
       ──────────────────────────────────────────────── */
    gown("Greta", "Bridal Couture"),
    gown("Heather", "Bridal Couture"),
    gown("June", "Bridal Couture"),
    gown("Delilah", "Bridal Couture"),
    gown("Molly", "Bridal Couture"),
    gown("Molly Mae", "Bridal Couture"),
    gown("Reagan", "Bridal Couture"),
    gown("Forest", "Bridal Couture"),

    /* ────────────────────────────────────────────────
       BRIDAL COUTURE — Iconic Collection
       ──────────────────────────────────────────────── */
    gown("Adore", "Bridal Couture"),
    gown("Gigi", "Bridal Couture"),
    gown("Danny", "Bridal Couture"),
    gown("Nia", "Bridal Couture"),
    gown("Eva", "Bridal Couture"),
    gown("Clare", "Bridal Couture"),

    /* ────────────────────────────────────────────────
       BRIDAL COUTURE — Rise Collection
       ──────────────────────────────────────────────── */
    gown("Carrie", "Bridal Couture"),
    gown("Kendall", "Bridal Couture"),
    gown("Leonie", "Bridal Couture"),
    gown("Reese", "Bridal Couture"),
    gown("Hailey", "Bridal Couture"),
    gown("Uma", "Bridal Couture"),
    gown("Esmeralda", "Bridal Couture"),

    /* ────────────────────────────────────────────────
       BRIDAL COUTURE — Dancing Queen Collection
       ──────────────────────────────────────────────── */
    gown("Julie", "Bridal Couture"),
    gown("Letitia", "Bridal Couture"),
    gown("Fuego", "Bridal Couture"),
    gown("Luna", "Bridal Couture"),
    gown("Alejandra", "Bridal Couture"),
    gown("Barbara", "Bridal Couture"),

    /* ────────────────────────────────────────────────
       BRIDAL COUTURE — Le Rêve Collection
       ──────────────────────────────────────────────── */
    gown("Shirley", "Bridal Couture"),
    gown("Emilia", "Bridal Couture"),
    gown("Gina", "Bridal Couture"),
    gown("Soleil", "Bridal Couture"),

    /* ────────────────────────────────────────────────
       BRIDAL COUTURE — Encanto Collection
       ──────────────────────────────────────────────── */
    gown("Flash", "Bridal Couture"),
    gown("Lima", "Bridal Couture"),
    gown("Aspen", "Bridal Couture"),
    gown("Nala", "Bridal Couture"),
    gown("Xo", "Bridal Couture"),

    /* ────────────────────────────────────────────────
       BRIDAL COUTURE — Amor Collection
       ──────────────────────────────────────────────── */
    gown("Shiloh", "Bridal Couture"),
    gown("Tokyo", "Bridal Couture"),
    gown("Diem", "Bridal Couture"),
    gown("Denise", "Bridal Couture"),
    gown("Nadia", "Bridal Couture"),
    gown("Renee", "Bridal Couture"),

    /* ────────────────────────────────────────────────
       BRIDAL COUTURE — The Stunners Collection
       ──────────────────────────────────────────────── */
    gown("Nirvana", "Bridal Couture"),
    gown("Utopia", "Bridal Couture"),
    gown("Euphoria", "Bridal Couture"),

    /* ────────────────────────────────────────────────
       BRIDAL COUTURE — Symphony Collection
       ──────────────────────────────────────────────── */
    gown("Fleur", "Bridal Couture"),
    gown("Lorena", "Bridal Couture"),

    /* ────────────────────────────────────────────────
       BRIDAL COUTURE — Heritage Collection
       ──────────────────────────────────────────────── */
    gown("Evelyn", "Bridal Couture"),
    gown("Paloma", "Bridal Couture"),
    gown("Maribel", "Bridal Couture"),
    gown("Catalina", "Bridal Couture"),
    gown("Reina", "Bridal Couture"),
    gown("Evita", "Bridal Couture"),
    gown("Quinn", "Bridal Couture"),

    /* ────────────────────────────────────────────────
       BRIDAL COUTURE — Suivez-Moi Collection
       ──────────────────────────────────────────────── */
    gown("Opéra", "Bridal Couture"),
    gown("Blanche", "Bridal Couture"),
    gown("Emmanuelle", "Bridal Couture"),
    gown("Lafayette", "Bridal Couture"),
    gown("Élysée", "Bridal Couture"),
    gown("Onyx", "Bridal Couture"),
    gown("Platine", "Bridal Couture"),
    gown("Bijou", "Bridal Couture"),
    gown("Marquise", "Bridal Couture"),
    gown("Anica", "Bridal Couture"),
    gown("Nadine", "Bridal Couture"),
    gown("Mélanie", "Bridal Couture"),
    gown("Patrice", "Bridal Couture"),
    gown("Trish", "Bridal Couture"),
    gown("Champagne", "Bridal Couture"),
    gown("Alona", "Bridal Couture"),
    gown("Perla", "Bridal Couture"),

    /* ────────────────────────────────────────────────
       BRIDAL COUTURE — Reverie Collection
       ──────────────────────────────────────────────── */
    gown("Neta", "Bridal Couture"),
    gown("Ricky", "Bridal Couture"),
    gown("Meg", "Bridal Couture"),
    gown("Chris", "Bridal Couture"),
    gown("Sky", "Bridal Couture"),
    gown("Tulip", "Bridal Couture"),
    gown("Sandy", "Bridal Couture"),

    /* ────────────────────────────────────────────────
       BRIDAL COUTURE — Collection X
       ──────────────────────────────────────────────── */
    gown("Scarlett", "Bridal Couture"),
    gown("Zendaya", "Bridal Couture"),
    gown("Sasha", "Bridal Couture"),
    gown("Dean", "Bridal Couture"),
    gown("Eilish", "Bridal Couture"),
    gown("Dakota", "Bridal Couture"),
    gown("Monroe", "Bridal Couture"),
    gown("Blonde", "Bridal Couture"),
    gown("Noa", "Bridal Couture"),
    gown("Blake", "Bridal Couture"),
    gown("Diamond", "Bridal Couture"),
    gown("Veronica", "Bridal Couture"),
    gown("Kristen", "Bridal Couture"),

    /* ────────────────────────────────────────────────
       BRIDAL COUTURE — Do Not Disturb Collection
       ──────────────────────────────────────────────── */
    gown("Shelly", "Bridal Couture"),
    gown("Ester", "Bridal Couture"),
    gown("Jacqueline", "Bridal Couture"),
    gown("Katie", "Bridal Couture"),
    gown("Liza", "Bridal Couture"),
    gown("Carmen", "Bridal Couture"),
    gown("Julia", "Bridal Couture"),
    gown("Betty", "Bridal Couture"),

    /* ────────────────────────────────────────────────
       BRIDAL COUTURE — Kiss & Tell Collection
       ──────────────────────────────────────────────── */
    gown("Gatsby", "Bridal Couture"),
    gown("Tonic", "Bridal Couture"),
    gown("Passion", "Bridal Couture"),
    gown("Velma", "Bridal Couture"),
    gown("Charleston", "Bridal Couture"),
    gown("Roxie", "Bridal Couture"),
    gown("Bellini", "Bridal Couture"),
    gown("Chicago", "Bridal Couture"),
    gown("Martini", "Bridal Couture"),
    gown("Mariposa", "Bridal Couture"),
    gown("Fiori", "Bridal Couture"),
    gown("Venezia", "Bridal Couture"),
    gown("Hermosa", "Bridal Couture"),
    gown("Whisper", "Bridal Couture"),
    gown("Lilith", "Bridal Couture"),
    gown("Belladonna", "Bridal Couture"),
    gown("Ametista", "Bridal Couture"),
    gown("Dynasty", "Bridal Couture"),
    gown("Primavera", "Bridal Couture"),
    gown("Midnight", "Bridal Couture"),
    gown("Leonora", "Bridal Couture"),

    /* ────────────────────────────────────────────────
       BRIDAL COUTURE — Don't Tell Collection
       ──────────────────────────────────────────────── */
    gown("Harmony", "Bridal Couture"),
    gown("Berry", "Bridal Couture"),
    gown("Fairytale", "Bridal Couture"),
    gown("Pompadour", "Bridal Couture"),
    gown("Vision", "Bridal Couture"),
    gown("Aspire", "Bridal Couture"),
    gown("Contessa", "Bridal Couture"),
    gown("Splendid", "Bridal Couture"),
    gown("Petal", "Bridal Couture"),
    gown("Magnifique", "Bridal Couture"),
    gown("Cosmo", "Bridal Couture"),
    gown("Akira", "Bridal Couture"),
    gown("Yumi", "Bridal Couture"),
    gown("Dream", "Bridal Couture"),
    gown("Majestic", "Bridal Couture"),
    gown("Baroness", "Bridal Couture"),
    gown("Wish", "Bridal Couture"),
    gown("Fortuna", "Bridal Couture"),
    gown("Evangeline", "Bridal Couture"),
    gown("Duchess", "Bridal Couture"),
    gown("Noblesse", "Bridal Couture"),

    /* ────────────────────────────────────────────────
       BRIDAL COUTURE — Charmed Collection
       ──────────────────────────────────────────────── */
    gown("Sun", "Bridal Couture"),
    gown("Rosemary", "Bridal Couture"),
    gown("Rebel", "Bridal Couture"),
    gown("Raphaella", "Bridal Couture"),
    gown("Rachel", "Bridal Couture"),
    gown("Peachy", "Bridal Couture"),
    gown("Noel", "Bridal Couture"),
    gown("Mojo", "Bridal Couture"),
    gown("Lyric", "Bridal Couture"),
    gown("Izzy", "Bridal Couture"),
    gown("Icon", "Bridal Couture"),
    gown("Horizon", "Bridal Couture"),
    gown("Heaven", "Bridal Couture"),
    gown("Freya", "Bridal Couture"),
    gown("Fresco", "Bridal Couture"),
    gown("Florence", "Bridal Couture"),
    gown("Finesse", "Bridal Couture"),
    gown("Eleina", "Bridal Couture"),
    gown("Breeze", "Bridal Couture"),
    gown("Bonny", "Bridal Couture"),
    gown("Bold", "Bridal Couture"),
    gown("Archie", "Bridal Couture"),
    gown("April", "Bridal Couture"),
    gown("Anais", "Bridal Couture"),
    gown("Bella", "Bridal Couture"),
    gown("Gia", "Bridal Couture"),
    gown("Alma", "Bridal Couture"),
    gown("Thelma", "Bridal Couture"),
    gown("Bellina", "Bridal Couture"),
    gown("Fabiana", "Bridal Couture"),
    gown("Lady G", "Bridal Couture"),

    /* ────────────────────────────────────────────────
       BRIDAL COUTURE — Keepsake Collection
       ──────────────────────────────────────────────── */
    gown("Hunter", "Bridal Couture"),
    gown("Brooks", "Bridal Couture"),
    gown("Gale", "Bridal Couture"),
    gown("Casey", "Bridal Couture"),
    gown("Mimosa", "Bridal Couture"),
    gown("Jules", "Bridal Couture"),
    gown("Magia", "Bridal Couture"),
    gown("Blair", "Bridal Couture"),
    gown("Eddie", "Bridal Couture"),
    gown("Rania", "Bridal Couture"),
    gown("Bebe", "Bridal Couture"),
    gown("Angie", "Bridal Couture"),
    gown("Amanda", "Bridal Couture"),
    gown("Gimaya", "Bridal Couture"),
    gown("Ina", "Bridal Couture"),
    gown("Clara", "Bridal Couture"),
    gown("Alana", "Bridal Couture"),
    gown("Maya", "Bridal Couture"),
    gown("Yael", "Bridal Couture"),
    gown("Wonder", "Bridal Couture"),
    gown("Vanity", "Bridal Couture"),

    /* ────────────────────────────────────────────────
       GALA by Galia Lahav
       ──────────────────────────────────────────────── */
    gown("Aerie", "GALA by Galia Lahav"),
    gown("Miley", "GALA by Galia Lahav"),
    gown("Lori", "GALA by Galia Lahav"),
    gown("Libby", "GALA by Galia Lahav"),
    gown("Peyton", "GALA by Galia Lahav"),
    gown("Penny", "GALA by Galia Lahav"),
    gown("Ally", "GALA by Galia Lahav"),
    gown("Teddy", "GALA by Galia Lahav"),
    gown("Bri", "GALA by Galia Lahav"),
    gown("Marissa", "GALA by Galia Lahav"),
    gown("Helen", "GALA by Galia Lahav"),
    gown("Chelsea", "GALA by Galia Lahav"),
    gown("Mercer", "GALA by Galia Lahav"),
    gown("Astor", "GALA by Galia Lahav"),
    gown("Waldorf", "GALA by Galia Lahav"),
    gown("Spring", "GALA by Galia Lahav"),
    gown("Sweeney", "GALA by Galia Lahav"),
    gown("Hudson", "GALA by Galia Lahav"),
    gown("Lenox", "GALA by Galia Lahav"),
    gown("Bleecker", "GALA by Galia Lahav"),
    gown("Brooklyn", "GALA by Galia Lahav"),
    gown("Stassie", "GALA by Galia Lahav"),
    gown("Olympia", "GALA by Galia Lahav"),
    gown("Faye", "GALA by Galia Lahav"),
    gown("Mel", "GALA by Galia Lahav"),
    gown("Jessie", "GALA by Galia Lahav"),
    gown("Jay", "GALA by Galia Lahav"),
    gown("Adi", "GALA by Galia Lahav"),
    gown("Bay", "GALA by Galia Lahav"),
    gown("Indie", "GALA by Galia Lahav"),
    gown("Lou", "GALA by Galia Lahav"),
    gown("Ari", "GALA by Galia Lahav"),
    gown("Mimi", "GALA by Galia Lahav"),
    gown("Paz", "GALA by Galia Lahav"),
    gown("Rae", "GALA by Galia Lahav"),
    gown("Vic", "GALA by Galia Lahav"),
    gown("Josi", "GALA by Galia Lahav"),
    gown("Hallie", "GALA by Galia Lahav"),
    gown("Courtney", "GALA by Galia Lahav"),
    gown("Livvy", "GALA by Galia Lahav"),
    gown("Yo-Yo", "GALA by Galia Lahav"),
    gown("G-104", "GALA by Galia Lahav"),
    gown("G-510", "GALA by Galia Lahav"),
    gown("G-512", "GALA by Galia Lahav"),
    gown("G-523", "GALA by Galia Lahav"),

    /* ────────────────────────────────────────────────
       EVENING
       ──────────────────────────────────────────────── */
    gown("Mirage", "Evening"),
    gown("Tropicana", "Evening"),
    gown("Bali", "Evening"),
    gown("Iris", "Evening"),
    gown("Peony", "Evening"),
    gown("Echo", "Evening"),
    gown("Cabernet", "Evening"),
    gown("Cora", "Evening"),
    gown("Yara", "Evening"),
    gown("Lotus", "Evening"),
    gown("Lailanie", "Evening"),
    gown("Sahara", "Evening"),
    gown("Meadow", "Evening"),
    gown("Daisy", "Evening"),
    gown("Audrina", "Evening"),
    gown("Lolly", "Evening"),
    gown("Hope", "Evening"),
    gown("Lilou", "Evening"),
    gown("Hannah", "Evening"),
    gown("Rita", "Evening"),
];
