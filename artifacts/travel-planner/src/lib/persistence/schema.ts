import { z } from "zod";
import type { Assignment, BookingOverride, Place, TimeWindow } from "@/lib/domain/types";

const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);

const TimeWindowSchema: z.ZodType<TimeWindow> = z.object({ start: time, end: time.nullable() });

const AssignmentSchema: z.ZodType<Assignment> = z.object({
  dayId: z.string().min(1),
  placement: z.enum(["anchor", "planned", "optional", "backup", "do-not-cram"]),
  backupFor: z.string().nullable(),
  reason: z.string().nullable(),
});

export const PlaceSchema: z.ZodType<Place> = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  city: z.string().nullable(),
  area: z.string().nullable(),
  category: z.enum(["food", "bar", "cafe", "museum", "experience", "shop", "viewpoint", "nightlife", "beach", "other"]),
  priority: z.enum(["must", "high", "medium", "low"]),
  notes: z.string(),
  sourceUrl: z.string().nullable(),
  durationMinutes: z.number().int().positive().nullable(),
  energyCost: z.enum(["low", "medium", "high"]).nullable(),
  window: TimeWindowSchema.nullable(),
  bookingId: z.string().nullable(),
  origin: z.enum(["seed", "user"]),
  assignment: AssignmentSchema.nullable(),
});

const BookingOverrideSchema: z.ZodType<BookingOverride> = z.object({
  confirmation: z.string().nullable(),
  link: z.string().nullable(),
});

/** The persisted envelope. Places are validated one record at a time so good records survive bad ones. */
export const EnvelopeSchema = z.object({
  version: z.number(),
  places: z.array(z.unknown()),
  bookingOverrides: z.record(BookingOverrideSchema),
  resolvedTaskIds: z.array(z.string()),
  progress: z.record(z.record(z.enum(["done", "skipped"]))),
  packed: z.array(z.string()),
});

/** Earlier versions (v1/v2) stored the whole saved-place list in this looser shape. */
export const LegacyPlaceSchema = z.object({
  id: z.string().min(1),
  name: z.string().optional(),
  city: z.string().nullable().optional(),
  area: z.string().nullable().optional(),
  category: z.string().optional(),
  priority: z.string().optional(),
  notes: z.string().nullable().optional(),
  source_url: z.string().nullable().optional(),
  assigned_day_id: z.string().nullable().optional(),
  day_section: z.string().optional(),
});

export type LegacyPlace = z.infer<typeof LegacyPlaceSchema>;

export const LegacyItemStatesSchema = z.record(z.enum(["done", "skipped"]));
export const LegacyPackingSchema = z.record(z.boolean());
