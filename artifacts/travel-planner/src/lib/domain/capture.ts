import type { ItemCategory, Place } from "./types";

/**
 * Capture (RFC §11): saving a link to the Inbox. Nothing is inferred from page content — the only
 * things derived from the link are its hostname (for a fallback name) and the kind of source.
 */
export const LINK_ERROR = "Enter a full web link starting with https://";

export type SourceType = "tiktok" | "instagram" | "google-maps" | "web";

export const SOURCE_LABEL: Record<SourceType, string> = {
  tiktok: "TikTok",
  instagram: "Instagram",
  "google-maps": "Google Maps",
  web: "Web",
};

export function parseCaptureLink(value: string): URL | null {
  try {
    const url = new URL(value.trim());
    return url.protocol === "http:" || url.protocol === "https:" ? url : null;
  } catch {
    return null;
  }
}

const hostIs = (host: string, domain: string) => host === domain || host.endsWith(`.${domain}`);

/** From the hostname (and, for Google, the path) only. */
export function sourceTypeOf(url: URL): SourceType {
  const host = url.hostname.toLowerCase();
  if (hostIs(host, "tiktok.com")) return "tiktok";
  if (hostIs(host, "instagram.com")) return "instagram";
  const google = /^(www\.|maps\.)?google\.[a-z.]+$/.test(host);
  if ((google && (host.startsWith("maps.") || url.pathname.startsWith("/maps"))) || host === "maps.app.goo.gl" || (host === "goo.gl" && url.pathname.startsWith("/maps"))) {
    return "google-maps";
  }
  return "web";
}

export const displayHost = (url: URL) => url.hostname.replace(/^www\./, "");

export interface CaptureInput {
  link: string;
  name: string;
  city: string;
  area: string;
  category: ItemCategory;
  notes: string;
}

export type CaptureResult = { ok: true; place: Place } | { ok: false; errors: { link: string } };

/** A new, unassigned user place. Priority starts at medium; the day placement rule decides the rest. */
export function buildCapturedPlace(input: CaptureInput, id: string): CaptureResult {
  const url = parseCaptureLink(input.link);
  if (!url) return { ok: false, errors: { link: LINK_ERROR } };
  return {
    ok: true,
    place: {
      id,
      name: input.name.trim() || `Saved from ${displayHost(url)}`,
      city: input.city.trim() || null,
      area: input.area.trim() || null,
      category: input.category,
      priority: "medium",
      notes: input.notes.trim(),
      sourceUrl: url.toString(),
      durationMinutes: null,
      energyCost: null,
      window: null,
      bookingId: null,
      origin: "user",
      assignment: null,
    },
  };
}
