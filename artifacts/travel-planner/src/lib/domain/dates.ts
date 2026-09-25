import { format } from "date-fns";

/** Calendar date stored as YYYY-MM-DD (no time or timezone). */
export type DateOnlyString = string;

const DATE_ONLY_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function isDateOnlyString(value: string): value is DateOnlyString {
  return DATE_ONLY_RE.test(value);
}

/**
 * Parse a date-only string as a local calendar date (midnight local time).
 * Avoids UTC rollover when formatting in US timezones.
 */
export function parseDateOnly(dateOnly: DateOnlyString): Date {
  const match = DATE_ONLY_RE.exec(dateOnly);
  if (!match) {
    throw new Error(`Expected date-only string YYYY-MM-DD, got: ${dateOnly}`);
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  return new Date(year, month - 1, day);
}

export function formatDateOnly(dateOnly: DateOnlyString, formatStr: string): string {
  return format(parseDateOnly(dateOnly), formatStr);
}

export function formatDateOnlyLocale(
  dateOnly: DateOnlyString,
  options: Intl.DateTimeFormatOptions,
  locales: Intl.LocalesArgument = "en-US",
): string {
  return parseDateOnly(dateOnly).toLocaleDateString(locales, options);
}

/** Format a local Date as YYYY-MM-DD for comparison with date-only fields. */
export function toLocalDateOnlyString(date: Date): DateOnlyString {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
