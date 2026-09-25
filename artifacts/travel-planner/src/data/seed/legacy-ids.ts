/**
 * Mapping from ids stored by earlier versions (localStorage v1/v2) to the current seed.
 * `null` means the old record no longer exists as a place (it became a booking, a day
 * guardrail/fallback, or was stale) and is dropped during migration.
 */
export const LEGACY_PLACE_IDS: Record<string, string | null> = {
  "place-menorca-cala": "place-menorca-cala",
  "place-cova": "place-cova",
  "place-binibeca": "place-binibeca",
  "place-rental-car": null, // now the Drivalia booking + pickup event
  "place-marimurtra": "place-marimurtra",
  "place-begur": "place-begur",
  "place-tossa": "place-tossa",
  "place-satuna": "place-satuna",
  "place-cami-ronda": "place-cami-ronda",
  "place-skip-beach": null, // now a day-4 fallback
  "place-tossa-dinner": null, // stale: the night is spent in Tossa
  "place-no-bcn-shopping": null, // now a day-4 guardrail
  "place-no-third-beach": null, // now a day-4 guardrail
  "place-montserrat": "place-montserrat",
  "place-sagrada": "place-sagrada",
  "place-vintage-bakery": "place-vintage-bakery",
  "place-encants": "place-vintage-bakery", // v1: Encants was replaced (closed Tuesdays)
  "place-passeig": "place-passeig",
  "place-elborn-dinner": "place-elborn-dinner",
  "place-paradiso": "place-paradiso",
  "place-hotel-rest": null, // now a day-7 fallback
  "place-tapas-backup": null, // now a day-7 fallback
  "place-bunkers": "place-bunkers",
  "place-no-second-museum": null, // now a day-7 guardrail
  "place-larocca": "place-larocca",
  "place-parking-sotano": "place-parking-sotano",
  "place-syra": "place-syra",
  "place-bar-canete": "place-bar-canete",
  "place-la-pepita": "place-la-pepita",
  "place-bormuth": "place-bormuth",
  "place-nomad-coffee": "place-nomad-coffee",
  "place-xurreria": "place-xurreria",
  "place-hotel-bcn": null, // now the InterContinental booking
};

const PASSPORT_KEY = "Documents-Passport (valid for the whole trip)";

/**
 * Packing keys renamed since earlier versions. The old passport label included a document
 * expiry detail, so it is matched by prefix rather than stored here.
 */
export function migrateLegacyPackingKey(key: string): string {
  return key.startsWith("Documents-Passport (") ? PASSPORT_KEY : key;
}
