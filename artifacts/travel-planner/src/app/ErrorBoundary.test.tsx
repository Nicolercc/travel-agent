// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { LEGACY_KEYS, STATE_KEY } from "@/lib/persistence/load";
import { ErrorBoundary, resetStoredDemoData } from "./ErrorBoundary";

function Boom(): never {
  throw new Error("boom");
}

describe("ErrorBoundary", () => {
  it("replaces a crashed page with a recoverable screen and moves focus to its heading", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <ErrorBoundary scope="app">
        <Boom />
      </ErrorBoundary>,
    );
    const heading = screen.getByRole("heading", { level: 1, name: "Something went wrong on this page." });
    expect(screen.getByRole("main")).toContainElement(heading);
    expect(heading).toHaveFocus();
    expect(screen.getByRole("button", { name: "Reload" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reset demo data" })).toBeInTheDocument();
    spy.mockRestore();
  });

  it("uses an alert region, not a second main landmark, inside the app shell", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <ErrorBoundary scope="page">
        <Boom />
      </ErrorBoundary>,
    );
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.queryByRole("main")).toBeNull();
    spy.mockRestore();
  });

  it("reset clears current and legacy demo data", () => {
    window.localStorage.setItem(STATE_KEY, "{}");
    window.localStorage.setItem(LEGACY_KEYS.placesV2, "[]");
    window.localStorage.setItem("unrelated", "keep");
    resetStoredDemoData();
    expect(window.localStorage.getItem(STATE_KEY)).toBeNull();
    expect(window.localStorage.getItem(LEGACY_KEYS.placesV2)).toBeNull();
    expect(window.localStorage.getItem("unrelated")).toBe("keep");
  });
});
