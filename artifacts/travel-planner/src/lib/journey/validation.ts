import { isDateOnlyString } from "@/lib/dates";
import type { JourneyDataset, JourneyDatasetIndex } from "./dataset";
import { indexJourneyDataset } from "./dataset";

export interface JourneyValidationIssue {
  code: string;
  message: string;
  entityType?: string;
  entityId?: string;
}

export interface JourneyValidationResult {
  valid: boolean;
  issues: JourneyValidationIssue[];
}

function issue(
  code: string,
  message: string,
  entityType?: string,
  entityId?: string,
): JourneyValidationIssue {
  return { code, message, entityType, entityId };
}

function validateUniqueIds(
  items: { id: string }[],
  entityType: string,
  issues: JourneyValidationIssue[],
): void {
  const seen = new Set<string>();
  for (const item of items) {
    if (seen.has(item.id)) {
      issues.push(
        issue("duplicate_id", `Duplicate ${entityType} id: ${item.id}`, entityType, item.id),
      );
    }
    seen.add(item.id);
  }
}

function validateGeoPoint(
  coordinates: { lat: number; lng: number },
  entityType: string,
  entityId: string,
  issues: JourneyValidationIssue[],
): void {
  if (coordinates.lat < -90 || coordinates.lat > 90) {
    issues.push(
      issue(
        "invalid_latitude",
        `Latitude out of range for ${entityType} ${entityId}`,
        entityType,
        entityId,
      ),
    );
  }
  if (coordinates.lng < -180 || coordinates.lng > 180) {
    issues.push(
      issue(
        "invalid_longitude",
        `Longitude out of range for ${entityType} ${entityId}`,
        entityType,
        entityId,
      ),
    );
  }
}

function validateBookingReference(
  reference: JourneyDataset["bookingReferences"][number],
  issues: JourneyValidationIssue[],
): void {
  if (reference.status === "confirmed" && !reference.confirmationNumber?.trim()) {
    issues.push(
      issue(
        "confirmed_without_number",
        `Confirmed booking ${reference.id} requires a confirmation number`,
        "bookingReference",
        reference.id,
      ),
    );
  }
}

function validateEvent(
  event: JourneyDataset["events"][number],
  issues: JourneyValidationIssue[],
): void {
  if (!event.fixed && event.tier === null) {
    issues.push(
      issue(
        "flexible_event_missing_tier",
        `Flexible event ${event.id} must declare an EventTier`,
        "event",
        event.id,
      ),
    );
  }

  if (event.fixed && event.tier !== null && event.tier !== "must-do") {
    issues.push(
      issue(
        "fixed_event_tier_mismatch",
        `Fixed logistical event ${event.id} should use tier null or must-do, not ${event.tier}`,
        "event",
        event.id,
      ),
    );
  }
}

function validateJourneyDay(
  day: JourneyDataset["days"][number],
  index: JourneyDatasetIndex,
  issues: JourneyValidationIssue[],
): void {
  if (!isDateOnlyString(day.date)) {
    issues.push(
      issue("invalid_date", `Day ${day.id} has invalid date: ${day.date}`, "day", day.id),
    );
  }

  const eventIdSet = new Set([...day.fixedEventIds, ...day.flexibleEventIds]);
  if (eventIdSet.size !== day.fixedEventIds.length + day.flexibleEventIds.length) {
    issues.push(
      issue(
        "event_id_overlap",
        `Day ${day.id} lists the same event in fixed and flexible arrays`,
        "day",
        day.id,
      ),
    );
  }

  for (const eventId of day.fixedEventIds) {
    const event = index.eventsById.get(eventId);
    if (!event) {
      issues.push(
        issue(
          "missing_event_reference",
          `Day ${day.id} references missing fixed event ${eventId}`,
          "day",
          day.id,
        ),
      );
      continue;
    }
    if (!event.fixed) {
      issues.push(
        issue(
          "fixed_array_non_fixed_event",
          `Event ${eventId} is listed as fixed on day ${day.id} but event.fixed is false`,
          "event",
          eventId,
        ),
      );
    }
  }

  for (const eventId of day.flexibleEventIds) {
    const event = index.eventsById.get(eventId);
    if (!event) {
      issues.push(
        issue(
          "missing_event_reference",
          `Day ${day.id} references missing flexible event ${eventId}`,
          "day",
          day.id,
        ),
      );
      continue;
    }
    if (event.fixed) {
      issues.push(
        issue(
          "flexible_array_fixed_event",
          `Event ${eventId} is listed as flexible on day ${day.id} but event.fixed is true`,
          "event",
          eventId,
        ),
      );
    }
  }

  for (const legId of day.legIds) {
    if (!index.travelLegsById.has(legId)) {
      issues.push(
        issue(
          "missing_leg_reference",
          `Day ${day.id} references missing travel leg ${legId}`,
          "day",
          day.id,
        ),
      );
    }
  }

  for (const taskId of day.unresolvedTaskIds) {
    if (!index.unresolvedTasksById.has(taskId)) {
      issues.push(
        issue(
          "missing_task_reference",
          `Day ${day.id} references missing unresolved task ${taskId}`,
          "day",
          day.id,
        ),
      );
    }
  }

  const locationRefs = [
    ["originLocationId", day.originLocationId],
    ["destinationLocationId", day.destinationLocationId],
    ["overnightBaseLocationId", day.overnightBaseLocationId],
  ] as const;

  for (const [field, locationId] of locationRefs) {
    if (locationId && !index.locationsById.has(locationId)) {
      issues.push(
        issue(
          "missing_location_reference",
          `Day ${day.id} ${field} references missing location ${locationId}`,
          "day",
          day.id,
        ),
      );
    }
  }
}

function validateTravelLeg(
  leg: JourneyDataset["travelLegs"][number],
  index: JourneyDatasetIndex,
  issues: JourneyValidationIssue[],
): void {
  if (!index.daysById.has(leg.dayId)) {
    issues.push(
      issue(
        "missing_day_reference",
        `Travel leg ${leg.id} references missing day ${leg.dayId}`,
        "travelLeg",
        leg.id,
      ),
    );
  }

  if (!index.locationsById.has(leg.fromLocationId)) {
    issues.push(
      issue(
        "missing_location_reference",
        `Travel leg ${leg.id} references missing from location ${leg.fromLocationId}`,
        "travelLeg",
        leg.id,
      ),
    );
  }

  if (!index.locationsById.has(leg.toLocationId)) {
    issues.push(
      issue(
        "missing_location_reference",
        `Travel leg ${leg.id} references missing to location ${leg.toLocationId}`,
        "travelLeg",
        leg.id,
      ),
    );
  }

  if (leg.bookingRefId && !index.bookingReferencesById.has(leg.bookingRefId)) {
    issues.push(
      issue(
        "missing_booking_reference",
        `Travel leg ${leg.id} references missing booking ${leg.bookingRefId}`,
        "travelLeg",
        leg.id,
      ),
    );
  }

  if (leg.departure && !isDateOnlyString(leg.departure.date)) {
    issues.push(
      issue(
        "invalid_departure_date",
        `Travel leg ${leg.id} has invalid departure date`,
        "travelLeg",
        leg.id,
      ),
    );
  }

  if (leg.arrival && !isDateOnlyString(leg.arrival.date)) {
    issues.push(
      issue(
        "invalid_arrival_date",
        `Travel leg ${leg.id} has invalid arrival date`,
        "travelLeg",
        leg.id,
      ),
    );
  }
}

function validateItineraryEvent(
  event: JourneyDataset["events"][number],
  index: JourneyDatasetIndex,
  issues: JourneyValidationIssue[],
): void {
  if (!index.daysById.has(event.dayId)) {
    issues.push(
      issue(
        "missing_day_reference",
        `Event ${event.id} references missing owning day ${event.dayId}`,
        "event",
        event.id,
      ),
    );
  }

  if (!index.locationsById.has(event.locationId)) {
    issues.push(
      issue(
        "missing_location_reference",
        `Event ${event.id} references missing location ${event.locationId}`,
        "event",
        event.id,
      ),
    );
  }

  if (event.bookingRefId && !index.bookingReferencesById.has(event.bookingRefId)) {
    issues.push(
      issue(
        "missing_booking_reference",
        `Event ${event.id} references missing booking ${event.bookingRefId}`,
        "event",
        event.id,
      ),
    );
  }
}

function validateUnresolvedTask(
  task: JourneyDataset["unresolvedTasks"][number],
  index: JourneyDatasetIndex,
  issues: JourneyValidationIssue[],
): void {
  if (!index.daysById.has(task.dayId)) {
    issues.push(
      issue(
        "missing_day_reference",
        `Unresolved task ${task.id} references missing owning day ${task.dayId}`,
        "unresolvedTask",
        task.id,
      ),
    );
  }

  if (task.relatedBookingRefId && !index.bookingReferencesById.has(task.relatedBookingRefId)) {
    issues.push(
      issue(
        "missing_booking_reference",
        `Unresolved task ${task.id} references missing booking ${task.relatedBookingRefId}`,
        "unresolvedTask",
        task.id,
      ),
    );
  }

  if (task.relatedEventId && !index.eventsById.has(task.relatedEventId)) {
    issues.push(
      issue(
        "missing_event_reference",
        `Unresolved task ${task.id} references missing event ${task.relatedEventId}`,
        "unresolvedTask",
        task.id,
      ),
    );
  }
}

/**
 * Validates referential integrity and domain rules for a journey dataset.
 * Does not evaluate readiness (Phase 2C).
 */
export function validateJourneyDataset(dataset: JourneyDataset): JourneyValidationResult {
  const issues: JourneyValidationIssue[] = [];
  const index = indexJourneyDataset(dataset);

  validateUniqueIds(dataset.days, "day", issues);
  validateUniqueIds(dataset.locations, "location", issues);
  validateUniqueIds(dataset.bookingReferences, "bookingReference", issues);
  validateUniqueIds(dataset.travelLegs, "travelLeg", issues);
  validateUniqueIds(dataset.events, "event", issues);
  validateUniqueIds(dataset.unresolvedTasks, "unresolvedTask", issues);

  for (const location of dataset.locations) {
    validateGeoPoint(location.coordinates, "location", location.id, issues);
  }

  for (const reference of dataset.bookingReferences) {
    validateBookingReference(reference, issues);
  }

  for (const event of dataset.events) {
    validateEvent(event, issues);
    validateItineraryEvent(event, index, issues);
  }

  for (const leg of dataset.travelLegs) {
    validateTravelLeg(leg, index, issues);
  }

  for (const task of dataset.unresolvedTasks) {
    validateUnresolvedTask(task, index, issues);
  }

  for (const day of dataset.days) {
    validateJourneyDay(day, index, issues);
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}
