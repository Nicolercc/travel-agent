import { describe, expect, it } from "vitest";
import { applyBookingOverride, bookingState, isBookingSecured, isRealReference } from "./bookings";
import type { Booking } from "./types";

const booking = (overrides: Partial<Booking> = {}): Booking => ({
  id: "book-test",
  kind: "ticket",
  provider: "Provider",
  title: "Test",
  confirmation: null,
  link: null,
  notes: null,
  ...overrides,
});

describe("booking truth (INV-3/INV-4)", () => {
  it("is secured only by a real confirmation reference", () => {
    expect(isBookingSecured(booking({ confirmation: "DEMO-ABC123" }))).toBe(true);
    expect(isBookingSecured(booking({ link: "https://example.com/" }))).toBe(false);
  });

  it.each(["", "   ", "TBC", "tbd", "pending", "N/A", "—".replace("—", "-"), "???"])(
    "treats %j as a placeholder, not a confirmation",
    (value) => {
      expect(isRealReference(value)).toBe(false);
    },
  );

  it("distinguishes secured, linked, and missing", () => {
    expect(bookingState(booking({ confirmation: "DEMO-1234" }))).toBe("secured");
    expect(bookingState(booking({ link: "https://example.com/" }))).toBe("linked");
    expect(bookingState(booking())).toBe("missing");
  });

  it("layers the traveler's confirmation over the seed booking", () => {
    const resolved = applyBookingOverride(booking({ link: "https://seed.example/" }), {
      confirmation: "  DEMO-SAGRADA ",
      link: null,
    });
    expect(resolved.confirmation).toBe("DEMO-SAGRADA");
    expect(resolved.link).toBe("https://seed.example/");
    expect(isBookingSecured(resolved)).toBe(true);
  });

  it("ignores placeholder overrides instead of erasing a real seed confirmation", () => {
    const resolved = applyBookingOverride(booking({ confirmation: "DEMO-SEED1" }), { confirmation: "TBC", link: null });
    expect(resolved.confirmation).toBe("DEMO-SEED1");
  });
});
