import { DEMO_NOW } from "@/data/demo-clock";

const LOCAL_DATE_TIME = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?$/;

/**
 * Parse `YYYY-MM-DD` or `YYYY-MM-DDTHH:mm` as local wall-clock time.
 * Returns null for anything else (including out-of-range components).
 */
export function parseLocalDateTime(value: string): Date | null {
  const match = LOCAL_DATE_TIME.exec(value.trim());
  if (!match) return null;
  const [year, month, day, hour, minute] = [
    match[1],
    match[2],
    match[3],
    match[4] ?? "0",
    match[5] ?? "0",
  ].map(Number);
  const date = new Date(year, month - 1, day, hour, minute);
  const roundTrips =
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day &&
    date.getHours() === hour &&
    date.getMinutes() === minute;
  return roundTrips ? date : null;
}

/** Resolve the demo clock: explicit override first, then the pinned default. */
export function resolveDemoNow(override: string | null | undefined): Date {
  return (override ? parseLocalDateTime(override) : null) ?? parseLocalDateTime(DEMO_NOW)!;
}
