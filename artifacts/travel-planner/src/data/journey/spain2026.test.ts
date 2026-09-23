import { describe, expect, it } from "vitest";
import {
  spain2026JourneyDataset,
  spain2026ValidationResult,
} from "@/data/journey";
import { getJourneyDayCount } from "@/lib/journey";

describe("spain2026JourneyDataset", () => {
  it("passes journey domain validation", () => {
    expect(spain2026ValidationResult.valid).toBe(true);
    expect(spain2026ValidationResult.issues).toHaveLength(0);
  });

  it("includes all nine days from July 28 through August 5", () => {
    expect(getJourneyDayCount(spain2026JourneyDataset)).toBe(9);
    expect(spain2026JourneyDataset.days.map((day) => day.id)).toEqual([
      "day-0",
      "day-1",
      "day-2",
      "day-3",
      "day-4",
      "day-5",
      "day-6",
      "day-7",
      "day-8",
    ]);
  });

  it("records the Menorca car-return conflict as critical", () => {
    const task = spain2026JourneyDataset.unresolvedTasks.find(
      (item) => item.id === "task-menorca-car-return",
    );
    expect(task?.priority).toBe("critical");
    expect(spain2026JourneyDataset.days.find((day) => day.id === "day-3")?.unresolvedTaskIds).toContain(
      "task-menorca-car-return",
    );
  });

  it("keeps Sagrada Família unresolved in structured data", () => {
    const sagradaEvent = spain2026JourneyDataset.events.find(
      (event) => event.id === "evt-sagrada-familia",
    );
    expect(sagradaEvent?.status).toBe("unresolved");
    expect(sagradaEvent?.tier).toBe("must-do");
  });
});
