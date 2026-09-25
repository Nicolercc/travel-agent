import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { LEGACY_PLACE_IDS, migrateLegacyPackingKey } from "@/data/seed/legacy-ids";
import type { TripState } from "@/lib/domain/trip-state";
import type { TripSeed } from "@/lib/domain/types";
import { STATE_KEY, loadState, removeLegacyKeys, saveState, type Recovery } from "@/lib/persistence/load";
import { browserStorage, type StorageAdapter } from "@/lib/persistence/storage";
import { transition, type TripAction, type TripEffect } from "./transition";

const LEGACY = { placeIds: LEGACY_PLACE_IDS, migratePackingKey: migrateLegacyPackingKey };

export type PersistenceStatus = "saved" | "memory-only";

interface TripContextValue {
  seed: TripSeed;
  state: TripState;
  /** Apply an action; returns what changed so callers can announce it and offer Undo. */
  dispatch: (action: TripAction) => TripEffect[];
  recoveries: Recovery[];
  dismissRecoveries: () => void;
  persistence: PersistenceStatus;
}

const TripContext = createContext<TripContextValue | null>(null);

function logDiagnostics(lines: string[]) {
  if (import.meta.env.DEV && lines.length > 0) {
    console.warn(`[tripcanvas] recovered stored state:\n  ${lines.join("\n  ")}`);
  }
}

export function TripProvider({
  seed,
  storage: providedStorage,
  children,
}: {
  seed: TripSeed;
  storage?: StorageAdapter;
  children: ReactNode;
}) {
  const [storage] = useState(() => providedStorage ?? browserStorage());
  const [initial] = useState(() => {
    const result = loadState(storage, seed, LEGACY);
    logDiagnostics(result.diagnostics);
    return result;
  });
  const [state, setState] = useState(initial.state);
  const [recoveries, setRecoveries] = useState(initial.recoveries);
  const [persistence, setPersistence] = useState<PersistenceStatus>(storage.available ? "saved" : "memory-only");
  const stateRef = useRef(state);

  // Once on mount: write the loaded (possibly migrated or reseeded) state, then retire legacy keys.
  // Legacy keys are only removed after a successful write, so a failed save never loses old data.
  useEffect(() => {
    if (!storage.available) return;
    if (saveState(storage, initial.state)) {
      removeLegacyKeys(storage);
    } else {
      // Reflects the storage system's answer to this one-time sync; not derived render state.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPersistence("memory-only");
    }
  }, [initial, storage]);

  useEffect(() => {
    if (!storage.available || typeof window === "undefined") return;
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STATE_KEY) return;
      const result = loadState(storage, seed, LEGACY);
      logDiagnostics(result.diagnostics);
      stateRef.current = result.state;
      setState(result.state);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [seed, storage]);

  const dispatch = useCallback(
    (action: TripAction) => {
      const result = transition(stateRef.current, action, seed);
      if (result.state !== stateRef.current) {
        stateRef.current = result.state;
        setState(result.state);
        // Persist as part of the event that changed state (not in a render effect).
        if (storage.available && !saveState(storage, result.state)) setPersistence("memory-only");
      }
      return result.effects;
    },
    [seed, storage],
  );

  const dismissRecoveries = useCallback(() => setRecoveries([]), []);

  const value = useMemo(
    () => ({ seed, state, dispatch, recoveries, dismissRecoveries, persistence }),
    [seed, state, dispatch, recoveries, dismissRecoveries, persistence],
  );
  return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
}

export function useTrip(): TripContextValue {
  const context = useContext(TripContext);
  if (!context) throw new Error("useTrip must be used within a TripProvider");
  return context;
}
