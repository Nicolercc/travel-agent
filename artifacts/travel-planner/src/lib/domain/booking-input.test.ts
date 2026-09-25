import { describe, expect, it } from "vitest";
import { validateBookingInput } from "./booking-input";

describe("booking input", () => {
  it("accepts a reference with an optional safe link", () => {
    expect(validateBookingInput(" DEMO-SGF14 ", "")).toEqual({ ok: true, value: { confirmation: "DEMO-SGF14", link: null } });
    expect(validateBookingInput("ABC123", "https://sagradafamilia.org/")).toEqual({
      ok: true,
      value: { confirmation: "ABC123", link: "https://sagradafamilia.org/" },
    });
  });

  it("requires a confirmation and refuses placeholders (INV-4)", () => {
    expect(validateBookingInput("", "")).toMatchObject({ ok: false, errors: { confirmation: expect.stringContaining("Enter") } });
    expect(validateBookingInput("TBC", "")).toMatchObject({ ok: false, errors: { confirmation: expect.stringContaining("placeholder") } });
  });

  it.each(["javascript:alert(1)", "sagradafamilia.org", "ftp://files.example.com"])("refuses unsafe link %j", (link) => {
    expect(validateBookingInput("ABC123", link)).toMatchObject({ ok: false, errors: { link: expect.stringContaining("https://") } });
  });
});
