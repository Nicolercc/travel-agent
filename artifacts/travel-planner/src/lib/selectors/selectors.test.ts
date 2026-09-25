import { describe, expect, it } from "vitest";
import { seed } from "@/data/seed";
import { createInitialState, type TripState } from "@/lib/domain/trip-state";
import { transition, type TripAction } from "@/lib/state/transition";
import { selectBookings, selectDayIdeas, selectDayView, selectDayViews, selectInbox, selectItinerary, selectReadiness, selectRouteDiagram, selectTripIssues, selectTripMode } from "./index";

const now = new Date(2026, 6, 25, 10); // demo clock: Sat Jul 25
const initial = createInitialState(seed);
const apply = (state: TripState, ...actions: TripAction[]) => actions.reduce((s, a) => transition(s, a, seed).state, state);

describe("day view", () => {
  it("groups a day's plans by placement, timed plans first in time order", () => {
    const view = selectDayView(initial, seed, "day-4")!;
    expect(view.anchor?.place.id).toBe("place-tossa");
    expect(view.planned.map((p) => p.place.id)).toEqual(["place-marimurtra", "place-begur"]);
    expect(view.optional.map((p) => p.place.id)).toEqual(["place-satuna"]);
    expect(view.optional[0].fits).toBe(true);
  });

  it("shows the overnight DL128 as departing on Jul 28 and arriving on Jul 29 (INV-7)", () => {
    expect(selectDayView(initial, seed, "day-0")!.legs.find((l) => l.leg.id === "leg-dl128")?.relation).toBe("departs");
    expect(selectDayView(initial, seed, "day-1")!.legs.find((l) => l.leg.id === "leg-dl128")?.relation).toBe("arrives");
  });

  it("names what a backup replaces", () => {
    expect(selectDayView(initial, seed, "day-2")!.backup[0]).toMatchObject({ backupForName: "Cala Macarella & Macarelleta" });
  });

  it("returns null for an unknown day", () => {
    expect(selectDayView(initial, seed, "day-99")).toBeNull();
  });

  it("is cached per state and recomputed after a change", () => {
    expect(selectDayView(initial, seed, "day-4")).toBe(selectDayView(initial, seed, "day-4"));
    const changed = apply(initial, { type: "setPlacement", placeId: "place-satuna", dayId: "day-4", placement: "planned" });
    expect(selectDayView(changed, seed, "day-4")!.status.verdict).toBe("tight");
    expect(selectDayView(initial, seed, "day-4")!.status.verdict).toBe("full");
  });
});

describe("booking truth", () => {
  it("derives booked from a secured booking, and a confirmation resolves the booking's task", () => {
    const sagrada = () => selectDayView(state, seed, "day-7")!.anchor!;
    let state = initial;
    expect(sagrada().booked).toBe(false);
    expect(selectDayView(state, seed, "day-7")!.openTasks.map((t) => t.id)).toContain("task-sagrada-booking");
    state = apply(state, { type: "resolveBooking", bookingId: "book-sagrada", override: { confirmation: "DEMO-SGF14", link: null } });
    expect(sagrada().booked).toBe(true);
    expect(selectDayView(state, seed, "day-7")!.openTasks.map((t) => t.id)).not.toContain("task-sagrada-booking");
    expect(selectBookings(state, seed).get("book-sagrada")).toMatchObject({ state: "secured", edited: true });
  });
});

describe("trip issues", () => {
  it("orders the seed's issues deterministically, one per entity", () => {
    const issues = selectTripIssues(initial, seed, now);
    expect(issues.map((i) => i.key)).toEqual([
      "task:task-menorca-car-return",
      "booking:book-sagrada",
      "booking:book-cova-xoroi",
      "task:task-drivalia-early-return",
      "task:task-frontair-shuttle",
      "inbox",
    ]);
    expect(new Set(issues.map((i) => i.key)).size).toBe(issues.length);
    expect(issues[1]).toMatchObject({ severity: "critical", action: { type: "resolveBooking", bookingId: "book-sagrada" } });
  });

  it("removes an issue as soon as its cause is resolved", () => {
    const state = apply(
      initial,
      { type: "resolveBooking", bookingId: "book-sagrada", override: { confirmation: "DEMO-SGF14", link: null } },
      { type: "setTaskResolved", taskId: "task-frontair-shuttle", resolved: true },
    );
    const keys = selectTripIssues(state, seed, now).map((i) => i.key);
    expect(keys).not.toContain("booking:book-sagrada");
    expect(keys).not.toContain("task:task-frontair-shuttle");
  });

  it("raises a day when it becomes Tight or Overloaded, with the engine's top reason", () => {
    const state = apply(initial, { type: "setPlacement", placeId: "place-satuna", dayId: "day-4", placement: "planned" });
    const issue = selectTripIssues(state, seed, now).find((i) => i.key === "day:day-4")!;
    expect(issue).toMatchObject({ severity: "medium", action: { type: "openDay", dayId: "day-4" } });
    expect(issue.detail).toBe(selectDayView(state, seed, "day-4")!.status.headline);
  });

  it("asks for an anchor only on experience-type days", () => {
    const state = apply(initial, { type: "unassignPlace", placeId: "place-montserrat" });
    const keys = selectTripIssues(state, seed, now).map((i) => i.key);
    expect(keys).toContain("anchor:day-6");
    expect(keys.filter((k) => k.startsWith("anchor:"))).toEqual(["anchor:day-6"]);
  });

  it("leaves out past days relative to the demo clock", () => {
    const keys = selectTripIssues(initial, seed, new Date(2026, 7, 4, 9)).map((i) => i.key);
    expect(keys).not.toContain("task:task-menorca-car-return");
    expect(keys).not.toContain("booking:book-cova-xoroi");
    expect(keys).toContain("booking:book-sagrada");
  });
});

describe("cross-screen consistency (must-protect)", () => {
  it("every surface reads the same status for every day, before and after edits", () => {
    const scenarios = [
      initial,
      apply(initial, { type: "setPlacement", placeId: "place-satuna", dayId: "day-4", placement: "planned" }),
      apply(initial, { type: "setPlacement", placeId: "place-cala-turqueta", dayId: "day-2", placement: "planned" }, { type: "setPlacement", placeId: "place-lithica", dayId: "day-2", placement: "planned" }),
      apply(initial, { type: "unassignPlace", placeId: "place-montserrat" }),
    ];
    for (const state of scenarios) {
      const list = selectDayViews(state, seed);
      const issues = selectTripIssues(state, seed, now);
      for (const view of list) {
        expect(selectDayView(state, seed, view.day.id)!.status).toBe(view.status);
        const dayIssue = issues.find((i) => i.key === `day:${view.day.id}`);
        expect(Boolean(dayIssue)).toBe(view.status.verdict === "tight" || view.status.verdict === "overloaded");
      }
      const readiness = selectReadiness(state, seed);
      expect(readiness.days.done).toBe(list.filter((v) => v.status.verdict === "comfortable" || v.status.verdict === "full").length);
      expect(readiness.unsorted).toBe(selectInbox(state, seed).length);
    }
  });
});

describe("readiness and inbox", () => {
  it("summarizes the seed", () => {
    expect(selectReadiness(initial, seed)).toEqual({
      bookings: { done: 10, total: 12 },
      days: { done: 9, total: 9 },
      tasks: { done: 0, total: 14 },
      unsorted: 7,
      packing: { done: 0, total: 31 },
    });
  });

  it("lists the traveler's own captures before seed saves", () => {
    const captured = apply(initial, { type: "addPlace", place: { ...seed.places[0], id: "place-1790000000000", name: "New save", assignment: null } });
    expect(selectInbox(captured, seed)[0].id).toBe("place-1790000000000");
  });
});

describe("day ideas", () => {
  it("suggests unsorted places in the cities the day actually touches", () => {
    // Aug 4 sleeps in Sant Boi but its plans are in Barcelona, where every unsorted save is.
    expect(selectDayIdeas(initial, seed, "day-7")).toMatchObject({ nearbyCities: ["Barcelona"] });
    expect(selectDayIdeas(initial, seed, "day-7").places).toHaveLength(7);
  });

  it("falls back to all unsorted places, flagged as not nearby", () => {
    expect(selectDayIdeas(initial, seed, "day-2")).toMatchObject({ nearbyCities: [] });
    expect(selectDayIdeas(initial, seed, "day-2").places).toHaveLength(7);
  });
});

describe("itinerary", () => {
  const byDay = new Map(selectItinerary(initial, seed).flatMap((group) => group.days).map((item) => [item.view.day.id, item]));
  const keyLegIds = (dayId: string) => byDay.get(dayId)!.keyLegs.map((leg) => leg.leg.id);

  it("groups days into consecutive region runs", () => {
    expect(selectItinerary(initial, seed).map((group) => [group.region.id, group.days.map((item) => item.view.day.id)])).toEqual([
      ["transit", ["day-0"]],
      ["menorca", ["day-1", "day-2", "day-3"]],
      ["costa-brava", ["day-4"]],
      ["barcelona", ["day-5", "day-6", "day-7", "day-8"]],
    ]);
  });

  it("shows scheduled, booked, and base-changing legs; counts the rest", () => {
    expect(keyLegIds("day-1")).toEqual(["leg-dl128", "leg-fr7509", "leg-car-menorca-pickup"]);
    expect(byDay.get("day-1")!.otherMoves).toBe(1);
    // Untimed and unbooked, but it is how the night's base changes.
    expect(keyLegIds("day-5")).toEqual(["leg-drive-bcn"]);
    expect(keyLegIds("day-2")).toEqual([]);
    expect(byDay.get("day-2")!.otherMoves).toBe(3);
  });

  it("carries the overnight flight's real duration on both days", () => {
    expect(byDay.get("day-0")!.keyLegs[0]).toMatchObject({ relation: "departs", durationMinutes: 470 });
    expect(byDay.get("day-1")!.keyLegs[0]).toMatchObject({ relation: "arrives", durationMinutes: 470 });
  });

  it("agrees with the day view on every day's verdict", () => {
    for (const item of byDay.values()) expect(item.view.status).toEqual(selectDayView(initial, seed, item.view.day.id)!.status);
  });
});

describe("route diagram", () => {
  const route = selectRouteDiagram(seed);

  it("lists bases in the order slept in, with the nights spent at each", () => {
    expect(route.bases.map((stop) => [stop.location.city, stop.dayIds])).toEqual([
      ["Cala en Porter", ["day-1", "day-2", "day-3"]],
      ["Tossa de Mar", ["day-4"]],
      ["Barcelona", ["day-5", "day-6"]],
      ["Sant Boi de Llobregat", ["day-7"]],
    ]);
  });

  it("keeps the long-haul flights off the diagram and leaves out walks and same-place legs", () => {
    expect(route.offMap.map((segment) => segment.legId)).toEqual(["leg-dl128", "leg-dl129"]);
    const drawn = new Set(route.segments.map((segment) => segment.legId));
    expect(drawn.has("leg-walk-sagrada")).toBe(false);
    expect(drawn.has("leg-cremallera")).toBe(false);
    expect(route.summary).toBe("4 bases: Cala en Porter, Tossa de Mar, Barcelona, Sant Boi de Llobregat; 4 flights and 21 ground transfers.");
  });
});

describe("Trip Mode now/next (RFC §10)", () => {
  const at = (dayId: string, clock: string, state: TripState = initial, chosen: string[] = []) => {
    const view = selectTripMode(state, seed, dayId, new Date(clock), chosen)!;
    return { now: view.now?.id ?? null, next: view.next?.id ?? null, previewing: view.previewing };
  };

  it.each([
    ["day-0", "2026-07-28T14:00", null, "leg-dl128"],
    ["day-0", "2026-07-28T16:00", "leg-dl128", null],
    ["day-1", "2026-07-29T07:00", null, "leg-dl128"],
    ["day-1", "2026-07-29T15:00", null, "leg-fr7509"],
    ["day-1", "2026-07-29T17:10", "leg-car-menorca-pickup", null],
    ["day-4", "2026-08-01T05:10", "fx-wake-day4", "leg-car-return-menorca"],
    ["day-7", "2026-08-04T11:30", null, "fx-ic-checkout"],
    ["day-7", "2026-08-04T14:30", "place-sagrada", "fx-frontair-checkin"],
    ["day-8", "2026-08-05T07:10", "leg-frontair-shuttle", "leg-dl129"],
  ])("%s at %s: now %s, next %s", (dayId, clock, now, next) => {
    expect(at(dayId, clock)).toEqual({ now, next, previewing: false });
  });

  it("previews another date: nothing is now, next is the day's first open item", () => {
    expect(at("day-7", "2026-07-25T10:00")).toEqual({ now: null, next: "fx-ic-checkout", previewing: true });
  });

  it("skips done and skipped items, and puts a chosen backup first", () => {
    const done = apply(initial, { type: "toggleProgress", dayId: "day-7", itemId: "fx-ic-checkout", mark: "done" });
    expect(at("day-7", "2026-08-04T11:30", done).next).toBe("place-sagrada");
    const skipped = apply(initial, { type: "toggleProgress", dayId: "day-2", itemId: "place-menorca-cala", mark: "skipped" });
    expect(at("day-2", "2026-07-30T09:00", skipped, ["place-boat-day"]).next).toBe("place-boat-day");
  });

  it("folds airport steps and the booked appointment into their leg, so nothing is listed twice", () => {
    const day1 = selectTripMode(initial, seed, "day-1", new Date("2026-07-29T07:00"))!;
    expect(day1.items.map((item) => item.id)).toEqual(["leg-dl128", "leg-fr7509", "fx-cala-checkin", "leg-car-menorca-pickup"]);
    const day0 = selectTripMode(initial, seed, "day-0", new Date("2026-07-28T14:00"))!;
    expect(day0.travel).toHaveLength(1);
    expect(day0.travel[0]).toMatchObject({ steps: ["Arrive at JFK · 3:45 PM", "Check in for DL128"], bookingState: "secured" });
  });
});
