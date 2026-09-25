// @vitest-environment jsdom
import { useEffect } from "react";
import { describe, expect, it } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { seed } from "@/data/seed";
import { LEGACY_KEYS, STATE_KEY } from "@/lib/persistence/load";
import { memoryStorage, type StorageAdapter } from "@/lib/persistence/storage";
import { createInitialState } from "@/lib/domain/trip-state";
import { TripProvider, useTrip } from "./TripProvider";
import type { TripEffect } from "./transition";

const probe: { current: ReturnType<typeof useTrip> | null } = { current: null };
function Probe() {
  const value = useTrip();
  useEffect(() => {
    probe.current = value;
  });
  return <p>places: {value.state.places.length}</p>;
}

function mount(storage: StorageAdapter) {
  render(
    <TripProvider seed={seed} storage={storage}>
      <Probe />
    </TripProvider>,
  );
}

describe("TripProvider", () => {
  it("renders from corrupt storage instead of crashing, reports the reset, and saves a valid state", () => {
    const storage = memoryStorage({ [STATE_KEY]: "{}" });
    mount(storage);
    expect(screen.getByText(`places: ${seed.places.length}`)).toBeInTheDocument();
    expect(probe.current!.recoveries).toEqual([{ kind: "reseeded", reason: "wrong-shape" }]);
    expect(JSON.parse(storage.read(STATE_KEY)!)).toEqual(createInitialState(seed));
  });

  it("persists every transition and returns its effects", () => {
    const storage = memoryStorage();
    mount(storage);
    let effects: TripEffect[] = [];
    act(() => {
      effects = probe.current!.dispatch({ type: "setPlacement", placeId: "place-cales-coves", dayId: "day-3", placement: "anchor" });
    });
    expect(effects).toContainEqual({ type: "anchorDemoted", placeId: "place-binibeca", dayId: "day-3" });
    const saved = JSON.parse(storage.read(STATE_KEY)!);
    expect(saved.places.find((p: { id: string }) => p.id === "place-cales-coves").assignment.placement).toBe("anchor");
  });

  it("switches to memory-only when a write fails, without losing the change", () => {
    const base = memoryStorage();
    let allowWrites = true;
    const storage: StorageAdapter = { ...base, write: (key, value) => allowWrites && base.write(key, value) };
    mount(storage);
    expect(probe.current!.persistence).toBe("saved");
    allowWrites = false;
    act(() => {
      probe.current!.dispatch({ type: "unassignPlace", placeId: "place-cova" });
    });
    expect(probe.current!.persistence).toBe("memory-only");
    expect(probe.current!.state.places.find((p) => p.id === "place-cova")!.assignment).toBeNull();
  });

  it("reports memory-only from the start when storage is unavailable", () => {
    mount(memoryStorage({}, false));
    expect(probe.current!.persistence).toBe("memory-only");
    expect(probe.current!.recoveries).toEqual([{ kind: "storage-unavailable" }]);
  });

  it("removes legacy keys only after the migrated state is saved", () => {
    const storage = memoryStorage({ [LEGACY_KEYS.packingV1]: JSON.stringify({ "Beach-Swimsuit (×2)": true }) });
    mount(storage);
    expect(probe.current!.state.packed).toEqual(["Beach-Swimsuit (×2)"]);
    expect(storage.keys()).toEqual([STATE_KEY]);
  });

  it("keeps legacy keys when the migrated state could not be saved", () => {
    const base = memoryStorage({ [LEGACY_KEYS.packingV1]: JSON.stringify({ "Beach-Swimsuit (×2)": true }) });
    mount({ ...base, write: () => false });
    expect(base.keys()).toEqual([LEGACY_KEYS.packingV1]);
  });

  it("reloads when another tab saves (last writer wins)", () => {
    const storage = memoryStorage();
    mount(storage);
    const other = { ...createInitialState(seed), resolvedTaskIds: ["task-frontair-shuttle"] };
    act(() => {
      storage.write(STATE_KEY, JSON.stringify(other));
      window.dispatchEvent(new StorageEvent("storage", { key: STATE_KEY }));
    });
    expect(probe.current!.state.resolvedTaskIds).toEqual(["task-frontair-shuttle"]);
  });
});
