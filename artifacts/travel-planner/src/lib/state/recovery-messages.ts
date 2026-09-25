import type { Recovery } from "@/lib/persistence/load";
import type { PersistenceStatus } from "./TripProvider";

/** What the traveler is told when their saved data changed without their action (RFC §14). */
export function recoveryMessage(recovery: Recovery): string | null {
  switch (recovery.kind) {
    case "reseeded":
      return "Saved demo data couldn't be read, so the demo was reset.";
    case "records-dropped":
      return recovery.count === 1
        ? "1 saved place couldn't be restored."
        : `${recovery.count} saved places couldn't be restored.`;
    case "storage-unavailable":
    case "migrated":
      // Unavailable storage is shown as a persistent banner; migrations are silent.
      return null;
  }
}

export function persistenceMessage(status: PersistenceStatus): string | null {
  return status === "memory-only" ? "Changes won't be saved in this browser." : null;
}
