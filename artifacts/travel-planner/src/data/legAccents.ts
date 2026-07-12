export interface TripLegAccent {
  id: string;
  label: string;
  cities: string[];
  cssVar: string;
  washClass: string;
  dotClass: string;
  textClass: string;
}

/**
 * Route-leg accents for the Spain 2026 demo.
 * Colors stay within the cohesive Soft Coastal blue–plum family via semantic tokens;
 * destination character comes from names, copy, and route geometry — not unrelated hues.
 */
export const TRIP_LEG_ACCENTS: TripLegAccent[] = [
  {
    id: "menorca",
    label: "Menorca",
    cities: ["Menorca"],
    cssVar: "--leg-menorca",
    washClass: "bg-[hsl(var(--sc-surface-brand)/0.35)]",
    dotClass: "bg-[hsl(var(--leg-menorca))]",
    textClass: "text-sc-route-label",
  },
  {
    id: "costa-brava",
    label: "Costa Brava",
    cities: ["Costa Brava"],
    cssVar: "--leg-costa-brava",
    washClass: "bg-[hsl(var(--sc-surface-selected)/0.65)]",
    dotClass: "bg-[hsl(var(--leg-costa-brava))]",
    textClass: "text-sc-route-label",
  },
  {
    id: "barcelona",
    label: "Barcelona",
    cities: ["Barcelona"],
    cssVar: "--leg-barcelona",
    washClass: "bg-[hsl(var(--sc-raw-mist-lilac)/0.55)]",
    dotClass: "bg-[hsl(var(--leg-barcelona))]",
    textClass: "text-sc-route-label",
  },
];

export function getLegAccentForCity(city: string): TripLegAccent {
  const match = TRIP_LEG_ACCENTS.find((leg) =>
    leg.cities.some(
      (name) =>
        city.toLowerCase().includes(name.toLowerCase()) ||
        name.toLowerCase().includes(city.toLowerCase()),
    ),
  );
  return match ?? TRIP_LEG_ACCENTS[0];
}

export function parseRouteLegs(route: string): string[] {
  return route
    .split("→")
    .map((segment) => segment.trim())
    .filter(Boolean);
}
