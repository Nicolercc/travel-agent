import { describe, expect, it } from "vitest";
import {
  createInvalidJourneyDataset,
  createMinimalJourneyDataset,
} from "./fixtures/minimal-dataset";
import { validateJourneyDataset } from "./validation";

describe("validateJourneyDataset", () => {
  it("accepts a minimal valid synthetic dataset", () => {
    const result = validateJourneyDataset(createMinimalJourneyDataset());
    expect(result.valid).toBe(true);
    expect(result.issues).toHaveLength(0);
  });

  it("flags missing event references on a day", () => {
    const result = validateJourneyDataset(createInvalidJourneyDataset());
    expect(result.valid).toBe(false);
    expect(result.issues.some((issue) => issue.code === "missing_event_reference")).toBe(
      true,
    );
  });

  it("flags duplicate entity ids", () => {
    const dataset = createMinimalJourneyDataset();
    dataset.days.push({ ...dataset.days[0] });
    const result = validateJourneyDataset(dataset);
    expect(result.valid).toBe(false);
    expect(result.issues.some((issue) => issue.code === "duplicate_id")).toBe(true);
  });

  it("flags confirmed bookings without confirmation numbers", () => {
    const dataset = createMinimalJourneyDataset();
    dataset.bookingReferences[0] = {
      ...dataset.bookingReferences[0],
      confirmationNumber: null,
      status: "confirmed",
    };
    const result = validateJourneyDataset(dataset);
    expect(result.valid).toBe(false);
    expect(result.issues.some((issue) => issue.code === "confirmed_without_number")).toBe(
      true,
    );
  });

  it("flags flexible events listed in fixed arrays", () => {
    const dataset = createMinimalJourneyDataset();
    const day = dataset.days.find((item) => item.id === "day-2");
    if (!day) throw new Error("expected day-2");
    day.fixedEventIds = ["evt-cove-swim"];
    day.flexibleEventIds = [];
    const result = validateJourneyDataset(dataset);
    expect(result.valid).toBe(false);
    expect(result.issues.some((issue) => issue.code === "fixed_array_non_fixed_event")).toBe(
      true,
    );
  });

  it("flags flexible events without a tier", () => {
    const dataset = createMinimalJourneyDataset();
    const event = dataset.events.find((item) => item.id === "evt-cove-swim");
    if (!event) throw new Error("expected evt-cove-swim");
    event.tier = null;
    const result = validateJourneyDataset(dataset);
    expect(result.valid).toBe(false);
    expect(result.issues.some((issue) => issue.code === "flexible_event_missing_tier")).toBe(
      true,
    );
  });
});
