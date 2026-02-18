/* ══════════════════════════════════════════════════
   Galia Lahav Sizes Database — RE:GALIA
   ══════════════════════════════════════════════════ */

export interface SizeDimension {
    us_size: string;
    eu_size: string;
    bust_cm: number;
    waist_cm: number;
    hips_cm: number;
    label: string;
}

export const SIZE_DATABASE: SizeDimension[] = [
    { us_size: "0", eu_size: "32", bust_cm: 80, waist_cm: 60, hips_cm: 88, label: "US 0 (EU 32)" },
    { us_size: "2", eu_size: "34", bust_cm: 84, waist_cm: 64, hips_cm: 92, label: "US 2 (EU 34)" },
    { us_size: "4", eu_size: "36", bust_cm: 88, waist_cm: 68, hips_cm: 96, label: "US 4 (EU 36)" },
    { us_size: "6", eu_size: "38", bust_cm: 92, waist_cm: 72, hips_cm: 100, label: "US 6 (EU 38)" },
    { us_size: "8", eu_size: "40", bust_cm: 96, waist_cm: 76, hips_cm: 104, label: "US 8 (EU 40)" },
    { us_size: "10", eu_size: "42", bust_cm: 100, waist_cm: 80, hips_cm: 108, label: "US 10 (EU 42)" },
    { us_size: "12", eu_size: "44", bust_cm: 104, waist_cm: 84, hips_cm: 112, label: "US 12 (EU 44)" },
    { us_size: "14", eu_size: "46", bust_cm: 108, waist_cm: 88, hips_cm: 116, label: "US 14 (EU 46)" }
];

export function getDimensionsForSize(sizeLabel: string): SizeDimension | null {
    return SIZE_DATABASE.find(s => s.label === sizeLabel) || null;
}
