import type { PackingCategory } from "@/lib/domain/types";

type Row = string | { label: string; optional: true };

/** Storage keys are `${category}-${label}` — unchanged from the earlier packing list so saved progress carries over. */
function category(name: string, rows: Row[]): PackingCategory {
  return {
    name,
    items: rows.map((row) => {
      const label = typeof row === "string" ? row : row.label;
      return { key: `${name}-${label}`, label, optional: typeof row !== "string" };
    }),
  };
}

export const packing: PackingCategory[] = [
  category("Documents", ["Passport (valid for the whole trip)", "Travel insurance card", "EU health card", "Hotel confirmations printed", "Emergency contacts note"]),
  category("Beach", ["Swimsuit (×2)", "Quick-dry beach towel", "Waterproof sandals", "SPF 50+ sunscreen", { label: "Snorkel (optional)", optional: true }, "Waterproof bag"]),
  category("City Walking", ["Broken-in walking shoes (critical)", "Light linen pants (×2)", "Breathable shirts (×3)", "Sun hat or cap", "Sunglasses", "Compact tote bag"]),
  category("Night Out", ["Teal two-piece (cave club, Menorca)", "One smart outfit (Barcelona evenings)", "Light jacket / blazer", "Going-out shoes (comfortable)"]),
  category("Tech", ["Phone + charger", "EU power adapters (×2)", "Portable battery bank", "Earbuds", "Camera or camera phone"]),
  category("Toiletries", ["Solid shampoo bar", "Moisturiser with SPF", "Lip balm with SPF", "Toothbrush + toothpaste", "Deodorant", "Any prescription medication"]),
];
