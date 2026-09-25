import { isRealReference } from "@/lib/domain/bookings";
import { safeHttpUrl } from "@/lib/domain/links";
import { STATE_VERSION, createInitialState, progressItemIds, type TripState } from "@/lib/domain/trip-state";
import type { Assignment, ItemCategory, Place, Placement, Priority, TripSeed } from "@/lib/domain/types";
import {
  EnvelopeSchema,
  LegacyItemStatesSchema,
  LegacyPackingSchema,
  LegacyPlaceSchema,
  PlaceSchema,
  type LegacyPlace,
} from "./schema";
import type { StorageAdapter } from "./storage";

export const STATE_KEY = "tripcanvas:state";
export const LEGACY_KEYS = {
  placesV1: "tripcanvas:places:v1",
  placesV2: "tripcanvas:places:v2",
  itemStatesV1: "tripcanvas:item-states:v1",
  packingV1: "tripcanvas:packing:v1",
} as const;

export type Recovery =
  | { kind: "storage-unavailable" }
  | { kind: "reseeded"; reason: "malformed-json" | "wrong-shape" | "unknown-version" }
  | { kind: "migrated"; from: number }
  | { kind: "records-dropped"; count: number };

/** How earlier versions' ids map onto the current seed (supplied by the state layer). */
export interface LegacyMapping {
  placeIds: Record<string, string | null>;
  migratePackingKey: (key: string) => string;
}

export interface LoadResult {
  state: TripState;
  recoveries: Recovery[];
  /** Developer diagnostics: what was repaired or dropped, and why. */
  diagnostics: string[];
}

// ── Repair: enforce invariants on whatever came out of storage (INV-1, 9, 11) ──────

export function repairState(input: TripState, seed: TripSeed, diagnostics: string[]): TripState {
  const dayIds = new Set(seed.days.map((day) => day.id));
  const bookingIds = new Set(seed.bookings.map((booking) => booking.id));
  const taskIds = new Set(seed.tasks.map((task) => task.id));
  const packingKeys = new Set(seed.packing.flatMap((category) => category.items.map((item) => item.key)));

  const seen = new Set<string>();
  let places: Place[] = [];
  for (const place of input.places) {
    if (seen.has(place.id)) {
      diagnostics.push(`dropped duplicate place ${place.id}`);
      continue;
    }
    seen.add(place.id);
    places.push(place);
  }
  // Seed places missing from stored state come back with their seed placement.
  for (const seedPlace of seed.places) {
    if (!seen.has(seedPlace.id)) {
      diagnostics.push(`restored seed place ${seedPlace.id}`);
      places.push(structuredClone(seedPlace));
    }
  }

  places = places.map((place) => {
    let next = place;
    if (next.bookingId !== null && !bookingIds.has(next.bookingId)) {
      diagnostics.push(`cleared unknown booking on ${next.id}`);
      next = { ...next, bookingId: null };
    }
    if (next.window?.end && next.window.end <= next.window.start) {
      diagnostics.push(`cleared invalid time window on ${next.id}`);
      next = { ...next, window: null };
    }
    if (next.assignment && !dayIds.has(next.assignment.dayId)) {
      diagnostics.push(`unassigned ${next.id} from unknown day ${next.assignment.dayId}`);
      next = { ...next, assignment: null };
    }
    if (next.assignment && next.assignment.reason !== null && next.assignment.placement !== "do-not-cram") {
      next = { ...next, assignment: { ...next.assignment, reason: null } };
    }
    return next;
  });

  const byId = new Map(places.map((place) => [place.id, place]));
  const anchorSeen = new Set<string>();
  places = places.map((place) => {
    const assignment = place.assignment;
    if (!assignment) return place;
    let next: Assignment = assignment;
    if (next.backupFor !== null) {
      const target = byId.get(next.backupFor);
      if (next.placement !== "backup" || !target || target.id === place.id || target.assignment?.dayId !== next.dayId) {
        diagnostics.push(`cleared dangling backup target on ${place.id}`);
        next = { ...next, backupFor: null };
      }
    }
    if (next.placement === "anchor") {
      if (anchorSeen.has(next.dayId)) {
        diagnostics.push(`demoted extra anchor ${place.id} on ${next.dayId}`);
        next = { ...next, placement: "planned" };
      } else {
        anchorSeen.add(next.dayId);
      }
    }
    return next === assignment ? place : { ...place, assignment: next };
  });

  const itemIds = progressItemIds(places, seed);
  const bookingOverrides: TripState["bookingOverrides"] = {};
  for (const [bookingId, override] of Object.entries(input.bookingOverrides)) {
    if (!bookingIds.has(bookingId)) continue;
    const confirmation = isRealReference(override.confirmation) ? override.confirmation : null;
    const link = override.link || null;
    if (confirmation || link) bookingOverrides[bookingId] = { confirmation, link };
  }
  const progress = Object.fromEntries(
    Object.entries(input.progress)
      .filter(([dayId]) => dayIds.has(dayId))
      .map(([dayId, marks]) => [dayId, Object.fromEntries(Object.entries(marks).filter(([itemId]) => itemIds.has(itemId)))]),
  );

  return {
    version: STATE_VERSION,
    places,
    bookingOverrides,
    resolvedTaskIds: [...new Set(input.resolvedTaskIds.filter((id) => taskIds.has(id)))],
    progress,
    packed: [...new Set(input.packed.filter((key) => packingKeys.has(key)))],
  };
}

// ── Legacy migration (v1/v2 → v3) ─────────────────────────────────────────────────

const CATEGORIES: readonly ItemCategory[] = ["food", "bar", "cafe", "museum", "experience", "shop", "viewpoint", "nightlife", "beach", "other"];
const PRIORITIES: readonly Priority[] = ["must", "high", "medium", "low"];
const PLACEMENTS: readonly Placement[] = ["anchor", "planned", "optional", "backup", "do-not-cram"];
const USER_PLACE_ID = /^place-\d+$/;

function legacyAssignment(legacy: LegacyPlace): Assignment | null {
  if (!legacy.assigned_day_id) return null;
  // "booked" was a section in earlier versions; booking truth is now a relation, so it becomes planned.
  const placement = PLACEMENTS.includes(legacy.day_section as Placement) ? (legacy.day_section as Placement) : "planned";
  return { dayId: legacy.assigned_day_id, placement, backupFor: null, reason: null };
}

function userPlaceFromLegacy(legacy: LegacyPlace): Place | null {
  if (!legacy.name) return null;
  return {
    id: legacy.id,
    name: legacy.name,
    city: legacy.city ?? null,
    area: legacy.area ?? null,
    category: CATEGORIES.includes(legacy.category as ItemCategory) ? (legacy.category as ItemCategory) : "other",
    priority: PRIORITIES.includes(legacy.priority as Priority) ? (legacy.priority as Priority) : "medium",
    notes: legacy.notes ?? "",
    sourceUrl: safeHttpUrl(legacy.source_url),
    durationMinutes: null,
    energyCost: null,
    window: null,
    bookingId: null,
    origin: "user",
    assignment: legacyAssignment(legacy),
  };
}

function parseJson(raw: string | null): unknown {
  if (raw === null) return undefined;
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

function migrateLegacy(
  storage: StorageAdapter,
  seed: TripSeed,
  legacy: LegacyMapping,
  diagnostics: string[],
): { state: TripState; from: number; dropped: number } | null {
  const v2 = storage.read(LEGACY_KEYS.placesV2);
  const v1 = storage.read(LEGACY_KEYS.placesV1);
  const itemStatesRaw = storage.read(LEGACY_KEYS.itemStatesV1);
  const packingRaw = storage.read(LEGACY_KEYS.packingV1);
  if (v2 === null && v1 === null && itemStatesRaw === null && packingRaw === null) return null;

  const from = v2 !== null ? 2 : 1;
  const state = createInitialState(seed);
  let dropped = 0;

  const legacyList = parseJson(v2 ?? v1);
  const records = Array.isArray(legacyList) ? legacyList : [];
  const idMap = new Map<string, string>();
  for (const record of records) {
    const parsed = LegacyPlaceSchema.safeParse(record);
    if (!parsed.success) {
      dropped++;
      diagnostics.push("dropped unreadable legacy place record");
      continue;
    }
    const old = parsed.data;
    if (old.id in legacy.placeIds) {
      const target = legacy.placeIds[old.id];
      if (target === null) continue; // converted to a booking, guardrail, or fallback — not a loss
      const index = state.places.findIndex((place) => place.id === target);
      if (index >= 0) {
        state.places[index] = { ...state.places[index], assignment: legacyAssignment(old) };
        idMap.set(old.id, target);
      }
    } else if (USER_PLACE_ID.test(old.id)) {
      const place = userPlaceFromLegacy(old);
      if (place) {
        state.places.push(place);
        idMap.set(old.id, place.id);
      } else {
        dropped++;
        diagnostics.push(`dropped unnamed legacy place ${old.id}`);
      }
    } else {
      dropped++;
      diagnostics.push(`dropped unknown legacy place ${old.id}`);
    }
  }

  const itemStates = LegacyItemStatesSchema.safeParse(parseJson(itemStatesRaw));
  if (itemStates.success) {
    for (const [oldId, mark] of Object.entries(itemStates.data)) {
      const newId = idMap.get(oldId) ?? (oldId in legacy.placeIds ? legacy.placeIds[oldId] : null);
      const dayId = state.places.find((place) => place.id === newId)?.assignment?.dayId;
      if (newId && dayId) state.progress[dayId] = { ...state.progress[dayId], [newId]: mark };
    }
  }

  const packing = LegacyPackingSchema.safeParse(parseJson(packingRaw));
  if (packing.success) {
    state.packed = Object.entries(packing.data)
      .filter(([, checked]) => checked)
      .map(([key]) => legacy.migratePackingKey(key));
  }

  return { state, from, dropped };
}

// ── Load / save ───────────────────────────────────────────────────────────────────

/** Load state from storage. Never throws; always returns a state that satisfies every invariant. */
export function loadState(storage: StorageAdapter, seed: TripSeed, legacy: LegacyMapping): LoadResult {
  const diagnostics: string[] = [];
  if (!storage.available) {
    return { state: createInitialState(seed), recoveries: [{ kind: "storage-unavailable" }], diagnostics };
  }

  const raw = storage.read(STATE_KEY);
  if (raw === null) {
    const migrated = migrateLegacy(storage, seed, legacy, diagnostics);
    if (!migrated) return { state: createInitialState(seed), recoveries: [], diagnostics };
    const recoveries: Recovery[] = [{ kind: "migrated", from: migrated.from }];
    if (migrated.dropped > 0) recoveries.push({ kind: "records-dropped", count: migrated.dropped });
    return { state: repairState(migrated.state, seed, diagnostics), recoveries, diagnostics };
  }

  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    diagnostics.push("stored state is not valid JSON");
    return { state: createInitialState(seed), recoveries: [{ kind: "reseeded", reason: "malformed-json" }], diagnostics };
  }

  const envelope = EnvelopeSchema.safeParse(json);
  if (!envelope.success) {
    diagnostics.push(...envelope.error.issues.map((issue) => `wrong shape at ${issue.path.join(".") || "(root)"}: ${issue.message}`));
    return { state: createInitialState(seed), recoveries: [{ kind: "reseeded", reason: "wrong-shape" }], diagnostics };
  }
  if (envelope.data.version !== STATE_VERSION) {
    diagnostics.push(`unknown state version ${envelope.data.version}`);
    return { state: createInitialState(seed), recoveries: [{ kind: "reseeded", reason: "unknown-version" }], diagnostics };
  }

  const places: Place[] = [];
  let dropped = 0;
  for (const record of envelope.data.places) {
    const parsed = PlaceSchema.safeParse(record);
    if (parsed.success) {
      places.push(parsed.data);
    } else {
      dropped++;
      diagnostics.push(`dropped invalid place record: ${parsed.error.issues[0]?.message ?? "unknown"}`);
    }
  }

  const state = repairState({ ...envelope.data, version: STATE_VERSION, places }, seed, diagnostics);
  return { state, recoveries: dropped > 0 ? [{ kind: "records-dropped", count: dropped }] : [], diagnostics };
}

/** Persist state. Returns false instead of throwing when storage refuses the write. */
export function saveState(storage: StorageAdapter, state: TripState): boolean {
  if (!storage.available) return false;
  return storage.write(STATE_KEY, JSON.stringify(state));
}

/** Remove keys written by earlier versions once the current state has been saved. */
export function removeLegacyKeys(storage: StorageAdapter): void {
  for (const key of Object.values(LEGACY_KEYS)) storage.remove(key);
}
