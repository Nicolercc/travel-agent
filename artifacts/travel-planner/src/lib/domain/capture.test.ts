import { describe, expect, it } from "vitest";
import { LINK_ERROR, buildCapturedPlace, parseCaptureLink, sourceTypeOf, type CaptureInput } from "./capture";

const input = (overrides: Partial<CaptureInput> = {}): CaptureInput => ({
  link: "https://www.tiktok.com/@someone/video/1",
  name: "",
  city: "",
  area: "",
  category: "other",
  notes: "",
  ...overrides,
});

describe("capture link", () => {
  it.each(["https://example.com/a", "http://example.com", "  https://example.com/x  "])("accepts %s", (link) => {
    expect(parseCaptureLink(link)).not.toBeNull();
  });

  it.each(["", "example.com", "www.tiktok.com/x", "javascript:alert(1)", "ftp://example.com", "data:text/html,hi"])("refuses %j", (link) => {
    expect(parseCaptureLink(link)).toBeNull();
    expect(buildCapturedPlace(input({ link }), "p1")).toEqual({ ok: false, errors: { link: LINK_ERROR } });
  });
});

describe("source type (hostname only)", () => {
  it.each([
    ["https://www.tiktok.com/@a/video/1", "tiktok"],
    ["https://vm.tiktok.com/xyz", "tiktok"],
    ["https://www.instagram.com/p/abc", "instagram"],
    ["https://www.google.com/maps/place/Bar", "google-maps"],
    ["https://maps.google.es/?q=x", "google-maps"],
    ["https://maps.app.goo.gl/abc", "google-maps"],
    ["https://www.google.com/search?q=maps", "web"],
    ["https://nottiktok.com/x", "web"],
    ["https://blog.example.com/tiktok.com", "web"],
  ])("%s → %s", (link, type) => {
    expect(sourceTypeOf(parseCaptureLink(link)!)).toBe(type);
  });
});

describe("captured place", () => {
  it("names an unnamed save after the site, never after page content", () => {
    const result = buildCapturedPlace(input(), "p1");
    expect(result).toMatchObject({ ok: true, place: { id: "p1", name: "Saved from tiktok.com", priority: "medium", assignment: null, origin: "user" } });
  });

  it("keeps what the traveler typed, trimmed, and stores the normalized link", () => {
    const result = buildCapturedPlace(input({ name: " Bar Cañete ", city: "Barcelona", area: " El Raval ", category: "bar", notes: " tapas " }), "p2");
    expect(result).toMatchObject({
      ok: true,
      place: { name: "Bar Cañete", city: "Barcelona", area: "El Raval", category: "bar", notes: "tapas", sourceUrl: "https://www.tiktok.com/@someone/video/1" },
    });
  });

  it("does not invent a city or area", () => {
    const result = buildCapturedPlace(input(), "p3");
    expect(result.ok && [result.place.city, result.place.area, result.place.window, result.place.durationMinutes]).toEqual([null, null, null, null]);
  });
});
