/** A storage boundary that never throws. `write` reports failure instead (quota, private mode). */
export interface StorageAdapter {
  readonly available: boolean;
  read(key: string): string | null;
  write(key: string, value: string): boolean;
  remove(key: string): void;
  keys(): string[];
}

export function memoryStorage(initial: Record<string, string> = {}, available = true): StorageAdapter {
  const data = new Map(Object.entries(initial));
  return {
    available,
    read: (key) => data.get(key) ?? null,
    write: (key, value) => {
      data.set(key, value);
      return true;
    },
    remove: (key) => {
      data.delete(key);
    },
    keys: () => [...data.keys()],
  };
}

const PROBE_KEY = "tripcanvas:probe";

/** localStorage when it works; otherwise an in-memory store flagged as unavailable. */
export function browserStorage(): StorageAdapter {
  let storage: Storage;
  try {
    storage = window.localStorage;
    storage.setItem(PROBE_KEY, "1");
    storage.removeItem(PROBE_KEY);
  } catch {
    return memoryStorage({}, false);
  }
  return {
    available: true,
    read: (key) => {
      try {
        return storage.getItem(key);
      } catch {
        return null;
      }
    },
    write: (key, value) => {
      try {
        storage.setItem(key, value);
        return true;
      } catch {
        return false;
      }
    },
    remove: (key) => {
      try {
        storage.removeItem(key);
      } catch {
        // Nothing useful to do; the next successful write replaces state anyway.
      }
    },
    keys: () => {
      try {
        return Object.keys(storage);
      } catch {
        return [];
      }
    },
  };
}
