import type { JourneyDataset, JourneyDatasetIndex } from "./dataset";
import { indexJourneyDataset } from "./dataset";
import type {
  ItineraryEvent,
  JourneyDay,
  TravelLeg,
  UnresolvedTask,
  UnresolvedTaskPriority,
} from "@/types/journey";

export interface JourneyLookupContext {
  dataset: JourneyDataset;
  index: JourneyDatasetIndex;
}

export function createJourneyLookupContext(dataset: JourneyDataset): JourneyLookupContext {
  return { dataset, index: indexJourneyDataset(dataset) };
}

export function getJourneyDay(
  context: JourneyLookupContext,
  dayId: string,
): JourneyDay | undefined {
  return context.index.daysById.get(dayId);
}

export function getEventsForDay(
  context: JourneyLookupContext,
  day: JourneyDay,
): ItineraryEvent[] {
  const ids = [...day.fixedEventIds, ...day.flexibleEventIds];
  return ids
    .map((id) => context.index.eventsById.get(id))
    .filter((event): event is ItineraryEvent => event !== undefined);
}

export function getFixedEventsForDay(
  context: JourneyLookupContext,
  day: JourneyDay,
): ItineraryEvent[] {
  return day.fixedEventIds
    .map((id) => context.index.eventsById.get(id))
    .filter((event): event is ItineraryEvent => event !== undefined);
}

export function getFlexibleEventsForDay(
  context: JourneyLookupContext,
  day: JourneyDay,
): ItineraryEvent[] {
  return day.flexibleEventIds
    .map((id) => context.index.eventsById.get(id))
    .filter((event): event is ItineraryEvent => event !== undefined);
}

export function getTravelLegsForDay(
  context: JourneyLookupContext,
  day: JourneyDay,
): TravelLeg[] {
  return day.legIds
    .map((id) => context.index.travelLegsById.get(id))
    .filter((leg): leg is TravelLeg => leg !== undefined);
}

export function getTravelLegsOwnedByDay(
  context: JourneyLookupContext,
  dayId: string,
): TravelLeg[] {
  return context.dataset.travelLegs.filter((leg) => leg.dayId === dayId);
}

export function getUnresolvedTasksForDay(
  context: JourneyLookupContext,
  day: JourneyDay,
): UnresolvedTask[] {
  return day.unresolvedTaskIds
    .map((id) => context.index.unresolvedTasksById.get(id))
    .filter((task): task is UnresolvedTask => task !== undefined);
}

export function getUnresolvedTasksOwnedByDay(
  context: JourneyLookupContext,
  dayId: string,
): UnresolvedTask[] {
  return context.dataset.unresolvedTasks.filter((task) => task.dayId === dayId);
}

const PRIORITY_RANK: Record<UnresolvedTaskPriority, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

export function getBlockingUnresolvedTasksForDay(
  context: JourneyLookupContext,
  day: JourneyDay,
): UnresolvedTask[] {
  return getUnresolvedTasksForDay(context, day)
    .filter((task) => task.priority === "critical" || task.priority === "high")
    .sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]);
}

export function sortJourneyDaysByDate(days: JourneyDay[]): JourneyDay[] {
  return [...days].sort((a, b) => a.date.localeCompare(b.date));
}

export function getJourneyDayCount(dataset: JourneyDataset): number {
  return dataset.days.length;
}
