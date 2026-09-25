import type { Placement, Priority } from "./types";

export { PLACEMENT_LABEL } from "./vocabulary";

/**
 * Where a place lands when it is assigned from the Inbox. Never the anchor: choosing the day's
 * defining plan is always an explicit decision in Day Builder.
 */
export function placementForPriority(priority: Priority): Placement {
  switch (priority) {
    case "must":
    case "high":
      return "planned";
    case "medium":
      return "optional";
    case "low":
      return "backup";
  }
}
