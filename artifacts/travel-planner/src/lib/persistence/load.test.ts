import { describe, expect, it } from "vitest";
import legacyV2Places from "./fixtures/legacy-v2-places.json";
import { seed } from "@/data/seed";
import { LEGACY_PLACE_IDS, migrateLegacyPackingKey } from "@/data/seed/legacy-ids";
import { createInitialState } from "@/lib/domain/trip-state";
import { validateTripState } from "@/lib/state/invariants";
import { LEGACY_KEYS, STATE_KEY, loadState, removeLegacyKeys, saveState } from "./load";
import { memoryStorage, type StorageAdapter } from "./storage";

const legacy = { placeIds: LEGACY_PLACE_IDS, migratePackingKey: migrateLegacyPackingKey };
const load = (storage: StorageAdapter) => {
  const result = loadState(storage, seed, legacy);
  expect(validateTripState(result.state, seed)).toEqual([]);
  return result;
};
const initial = createInitialState(seed);

describe("loading state — corruption never blanks the app", () => {
  it("starts from the seed when nothing is stored", () => {
    const result = load(memoryStorage());
    expect(result.state).toEqual(initial);
    expect(result.recoveries).toEqual([]);
  });

  it.each([
    ["{}", "wrong-shape"],
    ['[{"id":"x"}]', "wrong-shape"],
    ['"oops"', "wrong-shape"],
    ["null", "wrong-shape"],
    ["42", "wrong-shape"],
    ['{"version":3,"places":', "malformed-json"],
    ["not json at all", "malformed-json"],
  ])("reseeds and says so for %j", (raw, reason) => {
    const result = load(memoryStorage({ [STATE_KEY]: raw }));
    expect(result.state).toEqual(initial);
    expect(result.recoveries).toEqual([{ kind: "reseeded", reason }]);
    expect(result.diagnostics.length).toBeGreaterThan(0);
  });

  it("reseeds a future or unknown version instead of guessing", () => {
    const raw = JSON.stringify({ ...initial, version: 99 });
    expect(load(memoryStorage({ [STATE_KEY]: raw })).recoveries).toEqual([{ kind: "reseeded", reason: "unknown-version" }]);
  });

  it("keeps good place records when some are invalid, and reports how many were dropped", () => {
    const places = [...initial.places.slice(0, 5), { id: "broken" }, { ...initial.places[6], name: "" }];
    const raw = JSON.stringify({ ...initial, places });
    const result = load(memoryStorage({ [STATE_KEY]: raw }));
    expect(result.recoveries).toEqual([{ kind: "records-dropped", count: 2 }]);
    expect(result.state.places.slice(0, 5)).toEqual(initial.places.slice(0, 5));
  });

  it("repairs dangling references and invariant violations instead of failing", () => {
    const places = initial.places.map((place) =>
      place.id === "place-cala-mitjana"
        ? { ...place, assignment: { ...place.assignment!, placement: "anchor" as const } } // second anchor on day-2
        : place.id === "place-cova"
          ? { ...place, bookingId: "book-gone", assignment: { ...place.assignment!, dayId: "day-99" } }
          : place,
    );
    const raw = JSON.stringify({
      ...initial,
      places,
      bookingOverrides: { "book-gone": { confirmation: "DEMO-X1", link: null }, "book-sagrada": { confirmation: "TBC", link: null } },
      resolvedTaskIds: ["task-gone", "task-frontair-shuttle", "task-frontair-shuttle"],
      progress: { "day-99": { a: "done" }, "day-2": { "place-gone": "done", "place-menorca-cala": "done" } },
      packed: ["nope", seed.packing[0].items[0].key],
    });
    const { state, diagnostics } = load(memoryStorage({ [STATE_KEY]: raw }));
    const find = (id: string) => state.places.find((place) => place.id === id)!;
    expect(find("place-cala-mitjana").assignment!.placement).toBe("planned");
    expect(find("place-cova").assignment).toBeNull();
    expect(find("place-cova").bookingId).toBeNull();
    expect(state.bookingOverrides).toEqual({});
    expect(state.resolvedTaskIds).toEqual(["task-frontair-shuttle"]);
    expect(state.progress).toEqual({ "day-2": { "place-menorca-cala": "done" } });
    expect(state.packed).toEqual([seed.packing[0].items[0].key]);
    expect(diagnostics.some((line) => line.includes("demoted extra anchor"))).toBe(true);
  });

  it("restores seed places missing from stored state", () => {
    const raw = JSON.stringify({ ...initial, places: initial.places.filter((place) => place.id !== "place-sagrada") });
    expect(load(memoryStorage({ [STATE_KEY]: raw })).state.places.some((place) => place.id === "place-sagrada")).toBe(true);
  });

  it("round-trips through save and load", () => {
    const storage = memoryStorage();
    const changed = { ...initial, resolvedTaskIds: ["task-frontair-shuttle"], packed: [seed.packing[1].items[0].key] };
    expect(saveState(storage, changed)).toBe(true);
    expect(load(storage).state).toEqual(changed);
  });
});

describe("storage failures", () => {
  it("runs from memory and says so when storage is unavailable", () => {
    const result = load(memoryStorage({}, false));
    expect(result.state).toEqual(initial);
    expect(result.recoveries).toEqual([{ kind: "storage-unavailable" }]);
  });

  it("reports a failed write instead of throwing (quota exceeded, private mode)", () => {
    const failing: StorageAdapter = { ...memoryStorage(), write: () => false };
    expect(saveState(failing, initial)).toBe(false);
    expect(saveState(memoryStorage({}, false), initial)).toBe(false);
  });
});

describe("migrating earlier versions", () => {
  it("migrates the real v2 payload: keeps placements, drops converted records, counts nothing as lost", () => {
    const v2 = legacyV2Places.map((place) =>
      place.id === "place-syra" ? { ...place, assigned_day_id: "day-7", day_section: "optional" } : place,
    );
    const storage = memoryStorage({
      [LEGACY_KEYS.placesV2]: JSON.stringify(v2),
      [LEGACY_KEYS.itemStatesV1]: JSON.stringify({ "place-sagrada": "done", "place-hotel-bcn": "done", "place-gone": "skipped" }),
      [LEGACY_KEYS.packingV1]: JSON.stringify({ "Documents-Passport (valid for the whole trip)": true, "Beach-Swimsuit (×2)": true, "Beach-Nope": true }),
    });
    const { state, recoveries } = load(storage);
    const find = (id: string) => state.places.find((place) => place.id === id);

    expect(recoveries).toEqual([{ kind: "migrated", from: 2 }]);
    expect(find("place-syra")!.assignment).toMatchObject({ dayId: "day-7", placement: "optional" });
    expect(find("place-hotel-bcn")).toBeUndefined();
    expect(find("place-rental-car")).toBeUndefined();
    expect(find("place-cala-mitjana")!.assignment).toMatchObject({ dayId: "day-2", placement: "planned" }); // new seed place
    expect(state.progress["day-7"]).toEqual({ "place-sagrada": "done" });
    expect(state.packed).toEqual(["Documents-Passport (valid for the whole trip)", "Beach-Swimsuit (×2)"]);
  });

  it("maps a v1 'booked' section to planned and the retired Encants place to its replacement", () => {
    const v1 = [
      { id: "place-encants", name: "Mercat dels Encants", assigned_day_id: "day-7", day_section: "planned" },
      { id: "place-sagrada", name: "Sagrada Família", assigned_day_id: "day-7", day_section: "booked" },
    ];
    const { state, recoveries } = load(memoryStorage({ [LEGACY_KEYS.placesV1]: JSON.stringify(v1) }));
    expect(recoveries).toEqual([{ kind: "migrated", from: 1 }]);
    expect(state.places.find((p) => p.id === "place-vintage-bakery")!.assignment).toMatchObject({ dayId: "day-7", placement: "planned" });
    expect(state.places.find((p) => p.id === "place-sagrada")!.assignment!.placement).toBe("planned");
  });

  it("keeps places the traveler created, with only safe web links", () => {
    const v2 = [
      { id: "place-1760000000000", name: "Rooftop bar", city: "Barcelona", area: "Eixample", category: "bar", priority: "high", notes: "", source_url: "javascript:alert(1)", assigned_day_id: null },
      { id: "place-1760000000001", name: "Accommodation idea", category: "accommodation", source_url: "https://example.com/x", assigned_day_id: "day-5" },
    ];
    const { state } = load(memoryStorage({ [LEGACY_KEYS.placesV2]: JSON.stringify(v2) }));
    const rooftop = state.places.find((p) => p.id === "place-1760000000000")!;
    expect(rooftop).toMatchObject({ origin: "user", category: "bar", sourceUrl: null, assignment: null });
    expect(state.places.find((p) => p.id === "place-1760000000001")).toMatchObject({ category: "other", sourceUrl: "https://example.com/x" });
  });

  it("drops unreadable or unknown legacy records and reports the count", () => {
    const v2 = [{ nope: true }, { id: "place-mystery", name: "?" }, { id: "place-cova", assigned_day_id: "day-1", day_section: "optional" }];
    const { recoveries } = load(memoryStorage({ [LEGACY_KEYS.placesV2]: JSON.stringify(v2) }));
    expect(recoveries).toEqual([{ kind: "migrated", from: 2 }, { kind: "records-dropped", count: 2 }]);
  });

  it("migrates even when only legacy packing progress exists, and can remove the old keys", () => {
    const storage = memoryStorage({ [LEGACY_KEYS.packingV1]: JSON.stringify({ "Beach-Swimsuit (×2)": true }) });
    expect(load(storage).state.packed).toEqual(["Beach-Swimsuit (×2)"]);
    removeLegacyKeys(storage);
    expect(storage.keys()).toEqual([]);
  });
});
