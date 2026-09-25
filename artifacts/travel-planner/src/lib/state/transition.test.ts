import { describe, expect, it } from "vitest";
import { seed } from "@/data/seed";
import type { Place } from "@/lib/domain/types";
import { validateTripState } from "./invariants";
import { createInitialState, type TripState } from "@/lib/domain/trip-state";
import { transition, type TripAction, type TripEffect } from "./transition";

/** Apply an action and assert every invariant still holds afterwards. */
function apply(state: TripState, action: TripAction): { state: TripState; effects: TripEffect[] } {
  const result = transition(state, action, seed);
  expect(validateTripState(result.state, seed)).toEqual([]);
  return result;
}

const find = (state: TripState, id: string) => state.places.find((place) => place.id === id)!;
const anchorsOn = (state: TripState, dayId: string) =>
  state.places.filter((p) => p.assignment?.dayId === dayId && p.assignment.placement === "anchor").map((p) => p.id);

describe("trip state transitions", () => {
  const initial = createInitialState(seed);

  it("starts valid from the seed", () => {
    expect(validateTripState(initial, seed)).toEqual([]);
  });

  it("INV-1: choosing a new anchor demotes the previous one to planned, in one transition", () => {
    const { state, effects } = apply(initial, { type: "setPlacement", placeId: "place-cales-coves", dayId: "day-3", placement: "anchor" });
    expect(anchorsOn(state, "day-3")).toEqual(["place-cales-coves"]);
    expect(find(state, "place-binibeca").assignment!.placement).toBe("planned");
    expect(effects).toContainEqual({ type: "anchorDemoted", placeId: "place-binibeca", dayId: "day-3" });
  });

  it("reports before/after for every changed place so the change can be undone", () => {
    const { state, effects } = apply(initial, { type: "setPlacement", placeId: "place-cales-coves", dayId: "day-3", placement: "anchor" });
    const changed = effects.find((e) => e.type === "assignmentsChanged");
    if (changed?.type !== "assignmentsChanged") throw new Error("expected assignmentsChanged");
    const undone = apply(state, {
      type: "restoreAssignments",
      changes: changed.changes.map((c) => ({ placeId: c.placeId, assignment: c.before })),
    });
    expect(undone.state.places).toEqual(initial.places);
  });

  it("refuses an undo that would now break an invariant", () => {
    const moved = apply(initial, { type: "setPlacement", placeId: "place-cales-coves", dayId: "day-3", placement: "anchor" }).state;
    const result = transition(moved, { type: "restoreAssignments", changes: [{ placeId: "place-naveta", assignment: { dayId: "day-3", placement: "anchor", backupFor: null, reason: null } }] }, seed);
    expect(result.state).toBe(moved);
    expect(result.effects).toEqual([{ type: "rejected", reason: "undo no longer applies" }]);
  });

  it("INV-9: moving a place to another day detaches backups that pointed at it", () => {
    const { state } = apply(initial, { type: "setPlacement", placeId: "place-menorca-cala", dayId: "day-3", placement: "optional" });
    expect(find(state, "place-boat-day").assignment!.backupFor).toBeNull();
  });

  it("keeps a backup's target when that target only changes placement on the same day", () => {
    const { state } = apply(initial, { type: "setPlacement", placeId: "place-menorca-cala", dayId: "day-2", placement: "planned" });
    expect(find(state, "place-boat-day").assignment!.backupFor).toBe("place-menorca-cala");
  });

  it("unassigning sends a place back to the Inbox", () => {
    const { state } = apply(initial, { type: "unassignPlace", placeId: "place-paradiso" });
    expect(find(state, "place-paradiso").assignment).toBeNull();
  });

  it("rejects unknown places, days, bookings, tasks, and packing items without changing state", () => {
    const rejected: TripAction[] = [
      { type: "setPlacement", placeId: "nope", dayId: "day-2", placement: "planned" },
      { type: "setPlacement", placeId: "place-cova", dayId: "day-99", placement: "planned" },
      { type: "resolveBooking", bookingId: "nope", override: { confirmation: "DEMO-X1", link: null } },
      { type: "setTaskResolved", taskId: "nope", resolved: true },
      { type: "toggleProgress", dayId: "day-99", itemId: "place-cova", mark: "done" },
      { type: "toggleProgress", dayId: "day-1", itemId: "nope", mark: "done" },
      { type: "togglePacked", key: "nope" },
    ];
    for (const action of rejected) {
      const result = transition(initial, action, seed);
      expect(result.state).toBe(initial);
      expect(result.effects[0]?.type).toBe("rejected");
    }
  });

  it("stores booking details as an override and never a placeholder confirmation", () => {
    const { state } = apply(initial, { type: "resolveBooking", bookingId: "book-sagrada", override: { confirmation: " DEMO-SGF14 ", link: null } });
    expect(state.bookingOverrides["book-sagrada"]).toEqual({ confirmation: "DEMO-SGF14", link: null });
    const placeholder = transition(initial, { type: "resolveBooking", bookingId: "book-sagrada", override: { confirmation: "TBC", link: null } }, seed);
    expect(placeholder.state).toBe(initial);
    const cleared = apply(state, { type: "clearBookingOverride", bookingId: "book-sagrada" });
    expect(cleared.state.bookingOverrides).toEqual({});
  });

  it("INV-10: progress is per day, so moving a place does not carry completion", () => {
    const done = apply(initial, { type: "toggleProgress", dayId: "day-1", itemId: "place-cova", mark: "done" }).state;
    expect(done.progress["day-1"]).toEqual({ "place-cova": "done" });
    const moved = apply(done, { type: "setPlacement", placeId: "place-cova", dayId: "day-2", placement: "optional" }).state;
    expect(moved.progress["day-2"]).toBeUndefined();
    const toggledOff = apply(done, { type: "toggleProgress", dayId: "day-1", itemId: "place-cova", mark: "done" }).state;
    expect(toggledOff.progress["day-1"]).toEqual({});
    const skipped = apply(done, { type: "toggleProgress", dayId: "day-1", itemId: "place-cova", mark: "skipped" }).state;
    expect(skipped.progress["day-1"]).toEqual({ "place-cova": "skipped" });
  });

  it("tracks progress on travel legs and fixed events too (Trip Mode marks a flight done)", () => {
    const flown = apply(initial, { type: "toggleProgress", dayId: "day-0", itemId: "leg-dl128", mark: "done" }).state;
    expect(flown.progress["day-0"]).toEqual({ "leg-dl128": "done" });
    const arrived = apply(flown, { type: "toggleProgress", dayId: "day-0", itemId: "fx-jfk-arrive", mark: "done" }).state;
    expect(arrived.progress["day-0"]).toEqual({ "leg-dl128": "done", "fx-jfk-arrive": "done" });
  });

  it("toggles tasks and packing items", () => {
    const resolved = apply(initial, { type: "setTaskResolved", taskId: "task-frontair-shuttle", resolved: true }).state;
    expect(resolved.resolvedTaskIds).toEqual(["task-frontair-shuttle"]);
    expect(apply(resolved, { type: "setTaskResolved", taskId: "task-frontair-shuttle", resolved: false }).state.resolvedTaskIds).toEqual([]);
    const key = seed.packing[0].items[0].key;
    const packed = apply(initial, { type: "togglePacked", key }).state;
    expect(packed.packed).toEqual([key]);
    expect(apply(packed, { type: "togglePacked", key }).state.packed).toEqual([]);
  });

  it("adds user places as origin 'user' and refuses duplicate ids", () => {
    const place: Place = { ...seed.places[0], id: "place-1790000000000", origin: "seed", assignment: null };
    const { state } = apply(initial, { type: "addPlace", place });
    expect(find(state, place.id).origin).toBe("user");
    expect(transition(state, { type: "addPlace", place }, seed).effects[0]).toEqual({ type: "rejected", reason: "duplicate id" });
  });

  it("holds every invariant across a long random sequence of edits", () => {
    let state = initial;
    const placements = ["anchor", "planned", "optional", "backup", "do-not-cram"] as const;
    let seedValue = 42;
    const next = () => (seedValue = (seedValue * 1103515245 + 12345) % 2147483648) / 2147483648;
    for (let step = 0; step < 500; step++) {
      const place = state.places[Math.floor(next() * state.places.length)];
      const day = seed.days[Math.floor(next() * seed.days.length)];
      const roll = next();
      const action: TripAction =
        roll < 0.8
          ? { type: "setPlacement", placeId: place.id, dayId: day.id, placement: placements[Math.floor(next() * placements.length)] }
          : { type: "unassignPlace", placeId: place.id };
      state = apply(state, action).state;
    }
    for (const day of seed.days) expect(anchorsOn(state, day.id).length).toBeLessThanOrEqual(1);
  });

  it("reset returns to the seed", () => {
    const changed = apply(initial, { type: "unassignPlace", placeId: "place-cova" }).state;
    expect(apply(changed, { type: "reset" }).state).toEqual(initial);
  });
});
