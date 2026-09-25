import { differenceInCalendarDays } from "date-fns";
import { parseDateOnly, toLocalDateOnlyString } from "@/lib/domain/dates";
import { BOOKING_ISSUE_HORIZON_DAYS } from "@/lib/domain/planning-heuristics";
import type { TripState } from "@/lib/domain/trip-state";
import type { TaskPriority, TripSeed } from "@/lib/domain/types";
import { isTaskResolved, selectBookings } from "./bookings";
import { selectDayViews } from "./day";
import { memo } from "./memo";

export type IssueSeverity = "critical" | "high" | "medium" | "low";

export type IssueAction =
  | { type: "resolveBooking"; bookingId: string }
  | { type: "resolveTask"; taskId: string }
  | { type: "openDay"; dayId: string }
  | { type: "openInbox" };

export interface Issue {
  /** Stable per entity (booking, task, day, inbox): one issue per thing that is wrong. */
  key: string;
  severity: IssueSeverity;
  title: string;
  detail: string | null;
  dayId: string | null;
  action: IssueAction;
}

// Ordering groups, most urgent first (RFC §6); a group's rank is its position.
const GROUP_ORDER = ["criticalTask", "overloadedDay", "booking", "highTask", "tightDay", "missingAnchor", "inbox"] as const;
type Group = (typeof GROUP_ORDER)[number];

const PRIORITY_ORDER: readonly TaskPriority[] = ["critical", "high", "medium", "low"];
const SEVERITY_FOR_PRIORITY: Record<TaskPriority, IssueSeverity> = { critical: "critical", high: "high", medium: "medium", low: "low" };

interface Ranked extends Issue {
  group: Group;
  date: string;
}

/**
 * Everything that needs the traveler, deduplicated by entity and ordered deterministically:
 * group, then date, then key. Days before `now` are left out.
 */
export function selectTripIssues(state: TripState, seed: TripSeed, now: Date): Issue[] {
  const today = toLocalDateOnlyString(now);
  return memo(seed, state, `issues:${today}`, () => {
    const dayDate = new Map(seed.days.map((day) => [day.id, day.date]));
    const upcoming = (dayId: string) => (dayDate.get(dayId) ?? "") >= today;
    const ranked: Ranked[] = [];
    const bookings = selectBookings(state, seed);
    const openTasks = seed.tasks.filter((task) => !isTaskResolved(task, state, seed) && upcoming(task.dayId));

    // Unsecured bookings, with the tasks that a confirmation would resolve folded in.
    for (const view of bookings.values()) {
      if (view.state === "secured") continue;
      const bookingTasks = openTasks.filter((task) => task.resolvedBy === "booking" && task.relatedBookingId === view.booking.id);
      const firstDay = [...view.dayIds, ...bookingTasks.map((task) => task.dayId)].filter(upcoming).sort((a, b) => dayDate.get(a)!.localeCompare(dayDate.get(b)!))[0];
      if (!firstDay) continue;
      const soon = differenceInCalendarDays(parseDateOnly(dayDate.get(firstDay)!), parseDateOnly(today)) <= BOOKING_ISSUE_HORIZON_DAYS;
      if (!soon && bookingTasks.length === 0) continue;
      const lead = [...bookingTasks].sort((a, b) => PRIORITY_ORDER.indexOf(a.priority) - PRIORITY_ORDER.indexOf(b.priority))[0];
      const severity: IssueSeverity = lead ? SEVERITY_FOR_PRIORITY[lead.priority] : "high";
      ranked.push({
        key: `booking:${view.booking.id}`,
        severity,
        title: lead?.label ?? `Add the confirmation for ${view.booking.title}`,
        detail: view.state === "linked" ? "Linked but not confirmed yet." : "No confirmation yet.",
        dayId: firstDay,
        action: { type: "resolveBooking", bookingId: view.booking.id },
        group: severity === "critical" ? "criticalTask" : "booking",
        date: dayDate.get(firstDay)!,
      });
    }

    for (const task of openTasks) {
      if (task.resolvedBy === "booking") continue; // folded into its booking issue above
      if (task.priority !== "critical" && task.priority !== "high") continue; // shown on its day, not here
      ranked.push({
        key: `task:${task.id}`,
        severity: SEVERITY_FOR_PRIORITY[task.priority],
        title: task.label,
        detail: null,
        dayId: task.dayId,
        action: { type: "resolveTask", taskId: task.id },
        group: task.priority === "critical" ? "criticalTask" : "highTask",
        date: dayDate.get(task.dayId)!,
      });
    }

    for (const view of selectDayViews(state, seed)) {
      if (!upcoming(view.day.id)) continue;
      const base = { dayId: view.day.id, action: { type: "openDay", dayId: view.day.id } as const, date: view.day.date };
      if (view.status.verdict === "overloaded" || view.status.verdict === "tight") {
        const overloaded = view.status.verdict === "overloaded";
        ranked.push({
          ...base,
          key: `day:${view.day.id}`,
          severity: overloaded ? "high" : "medium",
          title: `${view.day.title} is ${view.status.verdictLabel.toLowerCase()}`,
          detail: view.status.headline,
          group: overloaded ? "overloadedDay" : "tightDay",
        });
      } else if (view.status.needsAnchor) {
        ranked.push({
          ...base,
          key: `anchor:${view.day.id}`,
          severity: "low",
          title: `Choose an anchor for ${view.day.title}`,
          detail: "One defining plan keeps the day intentional.",
          group: "missingAnchor",
        });
      }
    }

    const unsorted = state.places.filter((place) => place.assignment === null).length;
    if (unsorted > 0) {
      ranked.push({
        key: "inbox",
        severity: "low",
        title: unsorted === 1 ? "Sort 1 saved place" : `Sort ${unsorted} saved places`,
        detail: "Unsorted saves stay invisible until they have a day.",
        dayId: null,
        action: { type: "openInbox" },
        group: "inbox",
        date: "9999-12-31",
      });
    }

    return ranked
      .sort((a, b) => GROUP_ORDER.indexOf(a.group) - GROUP_ORDER.indexOf(b.group) || a.date.localeCompare(b.date) || a.key.localeCompare(b.key))
      .map(({ group: _group, date: _date, ...issue }) => issue);
  });
}
