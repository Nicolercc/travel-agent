// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import { act, cleanup, fireEvent, screen } from "@testing-library/react";
import { AppRoutes } from "@/App";
import { renderAt } from "./render";

/**
 * Release gate (RFC §26): no control may do nothing. Every enabled button on every route is clicked in a
 * fresh render and must change something observable — the DOM, the URL, focus, or an announcement.
 */
const ROUTES = [
  "/",
  "/dashboard",
  "/inbox",
  "/itinerary",
  "/itinerary/day-3",
  "/itinerary/nope",
  "/day/day-2",
  "/day/day-7",
  "/trip-mode/day-1",
  "/trip-mode/day-7",
  "/logistics",
  "/packing",
  "/nope",
];

beforeEach(() => window.sessionStorage.clear());

function observe(location: { history?: string[] }) {
  return {
    html: document.body.innerHTML,
    url: location.history?.join("|") ?? "",
    focus: document.activeElement?.outerHTML ?? "",
  };
}

describe("no dead controls", () => {
  it.each(ROUTES)("every enabled button on %s does something", (route) => {
    renderAt(route, <AppRoutes />);
    const count = screen.queryAllByRole("button").length;
    cleanup();

    const dead: string[] = [];
    for (let index = 0; index < count; index++) {
      const view = renderAt(route, <AppRoutes />);
      const button = screen.queryAllByRole("button")[index];
      // A disabled control says it is unavailable; it is not a dead end.
      if (!button || button.hasAttribute("disabled")) {
        cleanup();
        continue;
      }
      const label = button.getAttribute("aria-label") ?? button.textContent?.trim() ?? `#${index}`;
      const before = observe(view.location);
      act(() => {
        fireEvent.pointerDown(button);
        fireEvent.mouseDown(button);
        fireEvent.click(button);
      });
      const after = observe(view.location);
      if (before.html === after.html && before.url === after.url && before.focus === after.focus) dead.push(label);
      cleanup();
    }
    expect(dead).toEqual([]);
  });
});
