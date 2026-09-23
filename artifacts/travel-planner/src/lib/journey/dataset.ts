import type {
  BookingReference,
  ItineraryEvent,
  JourneyDay,
  Location,
  TravelLeg,
  UnresolvedTask,
} from "@/types/journey";

/** Aggregate journey model — populated in Phase 2B; validated in Phase 2A. */
export interface JourneyDataset {
  days: JourneyDay[];
  locations: Location[];
  bookingReferences: BookingReference[];
  travelLegs: TravelLeg[];
  events: ItineraryEvent[];
  unresolvedTasks: UnresolvedTask[];
}

export interface JourneyDatasetIndex {
  daysById: Map<string, JourneyDay>;
  locationsById: Map<string, Location>;
  bookingReferencesById: Map<string, BookingReference>;
  travelLegsById: Map<string, TravelLeg>;
  eventsById: Map<string, ItineraryEvent>;
  unresolvedTasksById: Map<string, UnresolvedTask>;
}

export function createEmptyJourneyDataset(): JourneyDataset {
  return {
    days: [],
    locations: [],
    bookingReferences: [],
    travelLegs: [],
    events: [],
    unresolvedTasks: [],
  };
}

export function indexJourneyDataset(dataset: JourneyDataset): JourneyDatasetIndex {
  return {
    daysById: new Map(dataset.days.map((day) => [day.id, day])),
    locationsById: new Map(dataset.locations.map((location) => [location.id, location])),
    bookingReferencesById: new Map(
      dataset.bookingReferences.map((reference) => [reference.id, reference]),
    ),
    travelLegsById: new Map(dataset.travelLegs.map((leg) => [leg.id, leg])),
    eventsById: new Map(dataset.events.map((event) => [event.id, event])),
    unresolvedTasksById: new Map(
      dataset.unresolvedTasks.map((task) => [task.id, task]),
    ),
  };
}
