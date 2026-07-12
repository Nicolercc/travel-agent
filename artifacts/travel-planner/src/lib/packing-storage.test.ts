import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  countActionablePackingItems,
  getActionablePackingKeys,
} from "@/data/packing-data";
import {
  PACKING_STORAGE_KEY,
  clearPackingStorage,
  countCheckedPackingItems,
  normalizePackingState,
  readPackingProgress,
  readPackingProgressFromStorage,
  readPackingState,
  subscribePackingProgress,
  writePackingState,
} from "./packing-storage";
import { computeTripReadiness } from "./trip-metrics";
import { mockDays, mockLogistics, mockPlaces } from "@/data/mockData";

describe("packing progress", () => {
  const total = countActionablePackingItems();

  it("derives total from actionable items only", () => {
    expect(total).toBeGreaterThan(0);
    expect(getActionablePackingKeys().length).toBe(total);
  });

  it("reports 0 of N when storage is empty", () => {
    const progress = readPackingProgressFromStorage(null);
    expect(progress).toEqual({ checked: 0, total });
  });

  it("reports partial completion", () => {
    const keys = getActionablePackingKeys().slice(0, 10);
    const stored = Object.fromEntries(keys.map((key) => [key, true]));
    const progress = readPackingProgressFromStorage(JSON.stringify(stored));
    expect(progress.checked).toBe(10);
    expect(progress.total).toBe(total);
  });

  it("reports N of N when all actionable keys are checked", () => {
    const stored = Object.fromEntries(
      getActionablePackingKeys().map((key) => [key, true]),
    );
    const progress = readPackingProgressFromStorage(JSON.stringify(stored));
    expect(progress.checked).toBe(total);
    expect(progress.total).toBe(total);
  });

  it("ignores unknown and duplicate stored ids", () => {
    const stored = {
      "unknown-item": true,
      "Documents-Passport (valid through 2027)": true,
    };
    expect(countCheckedPackingItems(stored)).toBe(1);
    expect(
      countCheckedPackingItems({
        ...stored,
        "Documents-Passport (valid through 2027)": true,
      }),
    ).toBe(1);
  });

  it("fails safely on malformed storage", () => {
    expect(readPackingProgressFromStorage("{not-json")).toEqual({
      checked: 0,
      total,
    });
  });
});

describe("packing storage lifecycle", () => {
  const total = countActionablePackingItems();
  const storage = new Map<string, string>();

  beforeEach(() => {
    storage.clear();
    vi.stubGlobal("window", {
      localStorage: {
        getItem: (key: string) => storage.get(key) ?? null,
        setItem: (key: string, value: string) => {
          storage.set(key, value);
        },
        removeItem: (key: string) => {
          storage.delete(key);
        },
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("writes packed ids and reads them back", () => {
    writePackingState({
      "Documents-Passport (valid through 2027)": true,
    });

    expect(readPackingState()).toEqual({
      "Documents-Passport (valid through 2027)": true,
    });
    expect(readPackingProgress()).toEqual({ checked: 1, total });
  });

  it("reset removes packed ids from storage", () => {
    writePackingState({
      "Documents-Passport (valid through 2027)": true,
    });
    clearPackingStorage();

    expect(storage.has(PACKING_STORAGE_KEY)).toBe(false);
    expect(readPackingState()).toEqual({});
    expect(readPackingProgress()).toEqual({ checked: 0, total });
  });

  it("normalizes unknown and duplicate ids on write", () => {
    writePackingState(
      JSON.parse(
        '{"unknown-item":true,"Documents-Passport (valid through 2027)":true,"Documents-Passport (valid through 2027)":true}',
      ) as Record<string, boolean>,
    );

    expect(readPackingState()).toEqual({
      "Documents-Passport (valid through 2027)": true,
    });
    expect(readPackingProgress().checked).toBe(1);
  });

  it("notifies subscribers on reset without reload", () => {
    writePackingState({
      "Documents-Passport (valid through 2027)": true,
    });

    let revision = 0;
    const unsubscribe = subscribePackingProgress(() => {
      revision += 1;
    });

    clearPackingStorage();
    unsubscribe();

    expect(revision).toBe(1);
    expect(readPackingProgress()).toEqual({ checked: 0, total });
  });

  it("packing readiness reaches ready when all canonical items are packed", () => {
    writePackingState(
      Object.fromEntries(getActionablePackingKeys().map((key) => [key, true])),
    );

    const readiness = computeTripReadiness(
      mockDays,
      mockPlaces,
      mockLogistics,
      readPackingProgress(),
    );
    const packing = readiness.dimensions.find(
      (dimension) => dimension.id === "packing",
    );

    expect(packing?.stage).toBe("ready");
  });
});

describe("normalizePackingState", () => {
  it("drops unknown ids and deduplicates canonical ids", () => {
    const normalized = normalizePackingState(
      JSON.parse(
        '{"unknown-item":true,"Documents-Passport (valid through 2027)":true,"Documents-Passport (valid through 2027)":true}',
      ) as Record<string, boolean>,
    );

    expect(normalized).toEqual({
      "Documents-Passport (valid through 2027)": true,
    });
    expect(Object.keys(normalized)).toHaveLength(1);
  });
});
