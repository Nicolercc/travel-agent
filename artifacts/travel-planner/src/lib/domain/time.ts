import type { TimeOfDay } from "./types";

const TIME_OF_DAY = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function isTimeOfDay(value: string): value is TimeOfDay {
  return TIME_OF_DAY.test(value);
}

/** "HH:mm" → minutes since local midnight. Throws on malformed input (seed data is validated). */
export function toMinutes(time: TimeOfDay): number {
  const match = TIME_OF_DAY.exec(time);
  if (!match) throw new Error(`Expected HH:mm time, got: ${time}`);
  return Number(match[1]) * 60 + Number(match[2]);
}

/** Minutes since midnight → "3:45 PM". */
export function formatClock(minutes: number): string {
  const normalized = ((Math.round(minutes) % 1440) + 1440) % 1440;
  const hours24 = Math.floor(normalized / 60);
  const mins = normalized % 60;
  const suffix = hours24 < 12 ? "AM" : "PM";
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  return `${hours12}:${String(mins).padStart(2, "0")} ${suffix}`;
}

export function formatTimeOfDay(time: TimeOfDay): string {
  return formatClock(toMinutes(time));
}

/**
 * Deliberately imprecise duration for estimates: rounded to the nearest 15 minutes and
 * prefixed "about" (honesty rule — estimates are never shown as exact).
 */
export function formatApproxDuration(minutes: number): string {
  const quarterHours = Math.max(0, Math.round(minutes / 15));
  if (quarterHours === 0) return "no time";
  if (quarterHours < 4) return `about ${quarterHours * 15} minutes`;
  const hours = Math.floor(quarterHours / 4);
  const fraction = ["", "¼", "½", "¾"][quarterHours % 4];
  const unit = hours === 1 && fraction === "" ? "hour" : "hours";
  return `about ${hours}${fraction} ${unit}`;
}
