// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import axe from "axe-core";
import { AppRoutes } from "@/App";
import { renderAt } from "./render";
import { setViewportWidth } from "./viewport";

/**
 * axe on every route (RFC §15/§16). jsdom has no layout, so rules that need it (color contrast)
 * are disabled here and run for real in the Playwright e2e suite.
 */
const ROUTES = [
  "/",
  "/dashboard",
  "/inbox",
  "/itinerary",
  "/itinerary/day-3",
  "/day/day-2",
  "/day/day-7",
  "/trip-mode/day-0?now=2026-07-28T14:00",
  "/trip-mode/day-7",
  "/logistics",
  "/packing",
  "/nope",
];

beforeEach(() => window.sessionStorage.clear());

async function violations() {
  const results = await axe.run(document.body, { rules: { "color-contrast": { enabled: false } } });
  return results.violations.map((violation) => `${violation.id}: ${violation.nodes.map((node) => node.target.join(" ")).join(", ")}`);
}

describe.each([390, 1440])("axe at %ipx", (width) => {
  it.each(ROUTES)("%s has no violations", async (route) => {
    const restore = setViewportWidth(width);
    renderAt(route, <AppRoutes />);
    expect(await violations()).toEqual([]);
    restore();
  });
});
