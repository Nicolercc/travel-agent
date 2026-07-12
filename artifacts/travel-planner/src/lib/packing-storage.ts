import {
  countActionablePackingItems,
  getActionablePackingKeys,
  getPackingItemKey,
} from "@/data/packing-data";

/** Shared key with Packing.tsx — read-only access for Trip Pulse readiness. */
export const PACKING_STORAGE_KEY = "tripcanvas:packing:v1";

export interface PackingProgress {
  checked: number;
  total: number;
}

type PackingChangeListener = () => void;

const packingChangeListeners = new Set<PackingChangeListener>();

function notifyPackingChange(): void {
  for (const listener of packingChangeListeners) {
    listener();
  }
}

export function subscribePackingProgress(
  listener: PackingChangeListener,
): () => void {
  packingChangeListeners.add(listener);
  return () => {
    packingChangeListeners.delete(listener);
  };
}

export function normalizePackingState(
  stored: Record<string, boolean> | null | undefined,
): Record<string, boolean> {
  const validKeys = new Set(getActionablePackingKeys());
  if (!stored) return {};

  const seen = new Set<string>();
  const normalized: Record<string, boolean> = {};

  for (const [key, value] of Object.entries(stored)) {
    if (!value || !validKeys.has(key) || seen.has(key)) continue;
    seen.add(key);
    normalized[key] = true;
  }

  return normalized;
}

export function countCheckedPackingItems(
  stored: Record<string, boolean> | null | undefined,
): number {
  return Object.keys(normalizePackingState(stored)).length;
}

export function readPackingStateFromStorage(
  raw: string | null,
): Record<string, boolean> {
  if (!raw) return {};

  try {
    const parsed = JSON.parse(raw) as Record<string, boolean>;
    return normalizePackingState(parsed);
  } catch {
    return {};
  }
}

export function readPackingState(): Record<string, boolean> {
  if (typeof window === "undefined") return {};

  return readPackingStateFromStorage(
    window.localStorage.getItem(PACKING_STORAGE_KEY),
  );
}

export function writePackingState(state: Record<string, boolean>): void {
  const normalized = normalizePackingState(state);

  if (typeof window !== "undefined") {
    window.localStorage.setItem(
      PACKING_STORAGE_KEY,
      JSON.stringify(normalized),
    );
  }

  notifyPackingChange();
}

export function clearPackingStorage(): void {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(PACKING_STORAGE_KEY);
  }

  notifyPackingChange();
}

export function readPackingProgressFromStorage(
  raw: string | null,
): PackingProgress {
  const total = countActionablePackingItems();
  const stored = readPackingStateFromStorage(raw);

  return {
    checked: countCheckedPackingItems(stored),
    total,
  };
}

export function readPackingProgress(): PackingProgress {
  if (typeof window === "undefined") {
    return { checked: 0, total: countActionablePackingItems() };
  }

  return readPackingProgressFromStorage(
    window.localStorage.getItem(PACKING_STORAGE_KEY),
  );
}

export { getPackingItemKey };
