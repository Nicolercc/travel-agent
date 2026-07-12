export interface PackingListItem {
  label: string;
  /** Decorative or nice-to-have rows are excluded from readiness totals. */
  optional?: boolean;
}

export interface PackingCategory {
  name: string;
  items: PackingListItem[];
}

export const PACKING_CATEGORIES: PackingCategory[] = [
  {
    name: "Documents",
    items: [
      { label: "Passport (valid through 2027)" },
      { label: "Travel insurance card" },
      { label: "EU health card" },
      { label: "Hotel confirmations printed" },
      { label: "Emergency contacts note" },
    ],
  },
  {
    name: "Beach",
    items: [
      { label: "Swimsuit (×2)" },
      { label: "Quick-dry beach towel" },
      { label: "Waterproof sandals" },
      { label: "SPF 50+ sunscreen" },
      { label: "Snorkel (optional)", optional: true },
      { label: "Waterproof bag" },
    ],
  },
  {
    name: "City Walking",
    items: [
      { label: "Broken-in walking shoes (critical)" },
      { label: "Light linen pants (×2)" },
      { label: "Breathable shirts (×3)" },
      { label: "Sun hat or cap" },
      { label: "Sunglasses" },
      { label: "Compact tote bag" },
    ],
  },
  {
    name: "Night Out",
    items: [
      { label: "Teal two-piece (cave club, Menorca)" },
      { label: "One smart outfit (Barcelona evenings)" },
      { label: "Light jacket / blazer" },
      { label: "Going-out shoes (comfortable)" },
    ],
  },
  {
    name: "Tech",
    items: [
      { label: "Phone + charger" },
      { label: "EU power adapters (×2)" },
      { label: "Portable battery bank" },
      { label: "Earbuds" },
      { label: "Camera or camera phone" },
    ],
  },
  {
    name: "Toiletries",
    items: [
      { label: "Solid shampoo bar" },
      { label: "Moisturiser with SPF" },
      { label: "Lip balm with SPF" },
      { label: "Toothbrush + toothpaste" },
      { label: "Deodorant" },
      { label: "Any prescription medication" },
    ],
  },
];

export const PACKING_OUTFIT_NOTES = [
  { dayId: "day-1", label: "Menorca Arrival", outfit: "Airport comfortable, easy layers" },
  { dayId: "day-2", label: "Menorca Coves", outfit: "Swimsuit, cover-up, sandals. Don't forget sunscreen." },
  { dayId: "day-3", label: "Beach Day / Cova d'en Xoroi", outfit: "Teal two-piece for the cave club. Bring a light jacket for evening." },
  { dayId: "day-4", label: "Costa Brava Road Day", outfit: "Linen pants, comfortable sandals, sunglasses. Avoid new shoes." },
  { dayId: "day-5", label: "Tossa → Barcelona", outfit: "Travel comfortable, fresh change for Barcelona arrival" },
  { dayId: "day-6", label: "Montserrat Day", outfit: "Walking shoes, layers — it gets cool up there. Comfortable pants." },
  { dayId: "day-7", label: "Barcelona Vintage + Gaudí", outfit: "Comfortable shoes, breathable outfit, sunglasses." },
  { dayId: "day-8", label: "Departure Day", outfit: "Airport comfortable fit. Don't pack your good shoes last." },
] as const;

/** Stable storage keys for actionable packing rows only. */
export function getPackingItemKey(categoryName: string, item: PackingListItem): string {
  return `${categoryName}-${item.label}`;
}

export function getActionablePackingKeys(): string[] {
  return PACKING_CATEGORIES.flatMap((category) =>
    category.items
      .filter((item) => !item.optional)
      .map((item) => getPackingItemKey(category.name, item)),
  );
}

export function countActionablePackingItems(): number {
  return getActionablePackingKeys().length;
}
