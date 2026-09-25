// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppRoutes } from "@/App";
import { pageOf } from "@/lib/a11y/route-focus";
import { renderAt } from "./render";
import { setViewportWidth } from "./viewport";

beforeEach(() => window.sessionStorage.clear());

describe("focus on route change (RFC §15)", () => {
  it("groups paths by page", () => {
    expect(pageOf("/day/day-3")).toBe(pageOf("/day/day-4"));
    expect(pageOf("/itinerary")).toBe(pageOf("/itinerary/day-2"));
    expect(pageOf("/inbox")).not.toBe(pageOf("/day/day-3"));
  });

  it("moves focus to the new page's h1 when the page changes", async () => {
    const restore = setViewportWidth(1440);
    const user = userEvent.setup();
    renderAt("/itinerary/day-3", <AppRoutes />);
    await user.click(within(screen.getByRole("region", { name: "Binibeca, Cales Coves, final swim, packing" })).getByRole("link", { name: "Plan this day" }));
    const heading = screen.getByRole("heading", { level: 1, name: "Binibeca, Cales Coves, final swim, packing" });
    await waitFor(() => expect(heading).toHaveFocus());
    restore();
  });

  it("reaches Trip Mode's h1 too (it sits outside the main layout)", async () => {
    const user = userEvent.setup();
    renderAt("/day/day-7", <AppRoutes />);
    await user.click(screen.getByRole("link", { name: "Open Trip Mode" }));
    await waitFor(() => expect(screen.getByRole("heading", { level: 1 })).toHaveFocus());
  });

  it("leaves focus alone when moving within a page", async () => {
    const user = userEvent.setup();
    renderAt("/day/day-3", <AppRoutes />);
    const next = screen.getByRole("link", { name: /next day/i });
    await user.click(next);
    expect(screen.getByRole("heading", { level: 1 })).not.toHaveFocus();
  });
});
