// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppRoutes } from "@/App";
import { renderAt } from "@/test/render";
import { setViewportWidth } from "@/test/viewport";

let restoreViewport = () => {};
beforeEach(() => window.sessionStorage.clear());
afterEach(() => restoreViewport());

const row = (name: RegExp) => screen.getByRole("link", { name });
const travel = (date: string) => screen.getByRole("list", { name: `Travel on ${date}` });
const announcer = () => screen.getByTestId("announcer");

describe("Itinerary — wide (≥1024px)", () => {
  beforeEach(() => (restoreViewport = setViewportWidth(1440)));

  it("groups days into region sections, each an ordered list, with every day's night, verdict, and critical tasks", () => {
    renderAt("/itinerary", <AppRoutes />);
    const regions = screen.getAllByRole("heading", { level: 2 }).map((heading) => heading.textContent);
    expect(regions.slice(0, 4)).toEqual(["Transit, Jul 28", "Menorca, Jul 29 – Jul 31", "Costa Brava, Aug 1", "Barcelona, Aug 2 – Aug 5"]);
    const rows = screen.getAllByRole("link", { name: /^(Tue|Wed|Thu|Fri|Sat|Sun|Mon) / });
    expect(rows).toHaveLength(9);
    for (const link of rows) expect(link.getAttribute("aria-label")).toMatch(/(sleeps in .+|overnight in transit|flies home), (Comfortable|Full|Tight|Overloaded)/);
    expect(row(/^Fri Jul 31, Experience, Binibeca, Cales Coves, final swim, packing, sleeps in Cala en Porter, Comfortable/)).toBeInTheDocument();
    const menorca = screen.getByRole("region", { name: "Menorca, Jul 29 – Jul 31" });
    expect(menorca.querySelector(":scope > ol")?.children).toHaveLength(3);
  });

  it("selects the demo's next day by default and shows it in the panel with the Route diagram", () => {
    renderAt("/itinerary", <AppRoutes />);
    expect(row(/^Tue Jul 28/)).toHaveAttribute("aria-current", "true");
    const panel = screen.getByRole("region", { name: "JFK departure" });
    expect(within(panel).getByRole("link", { name: "Plan this day" })).toHaveAttribute("href", "/day/day-0");
    expect(within(panel).getByRole("link", { name: "Start Trip Mode" })).toHaveAttribute("href", "/trip-mode/day-0");
    const diagram = within(panel).getByRole("img", { name: /^Route diagram\. 4 bases: Cala en Porter, Tossa de Mar, Barcelona, Sant Boi de Llobregat; 4 flights/ });
    expect(diagram).not.toHaveAttribute("tabindex");
    expect(diagram.querySelector("svg")).toHaveAttribute("focusable", "false");
  });

  it("selecting a day puts it in the URL, moves aria-current, updates the panel, and announces it", async () => {
    const user = userEvent.setup();
    const { location } = renderAt("/itinerary", <AppRoutes />);
    await user.click(row(/^Fri Jul 31/));
    expect(location.history?.at(-1)).toBe("/itinerary/day-3");
    expect(row(/^Fri Jul 31/)).toHaveAttribute("aria-current", "true");
    expect(row(/^Tue Jul 28/)).not.toHaveAttribute("aria-current");
    const panel = screen.getByRole("region", { name: "Binibeca, Cales Coves, final swim, packing" });
    expect(within(panel).getByText("Binibeca Vell")).toBeInTheDocument();
    await waitFor(() => expect(announcer()).toHaveTextContent("Showing Friday, July 31: Binibeca, Cales Coves, final swim, packing."));
    expect(row(/^Fri Jul 31/)).toHaveFocus();
  });

  it("opens a day straight from its URL", () => {
    renderAt("/itinerary/day-7", <AppRoutes />);
    expect(row(/^Tue Aug 4/)).toHaveAttribute("aria-current", "true");
    expect(screen.getByRole("region", { name: "Barcelona city, Gaudí, and the airport-hotel move" })).toBeInTheDocument();
  });

  it("falls back to the first day, with a notice, for an unknown day in the URL", () => {
    renderAt("/itinerary/day-99", <AppRoutes />);
    expect(screen.getByText("There is no day “day-99” in this trip, so the first day is shown.")).toHaveAttribute("role", "status");
    expect(row(/^Tue Jul 28/)).toHaveAttribute("aria-current", "true");
  });

  it("shows the overnight DL128 under both days: continuing on Jul 28 and arriving on Jul 29 (INV-7)", () => {
    renderAt("/itinerary", <AppRoutes />);
    const departure = within(travel("Tue Jul 28")).getByText("DL128 · JFK → Barcelona").parentElement!;
    expect(departure).toHaveTextContent("dep 6:55 PM → arr 8:45 AM Jul 29 · about 7¾ hours · continues overnight");
    const arrival = within(travel("Wed Jul 29")).getByText("DL128 · JFK → Barcelona").parentElement!;
    expect(arrival).toHaveTextContent("arrives, left Jul 28");
  });

  it("says when a leg's booking is not confirmed, in words", () => {
    renderAt("/itinerary", <AppRoutes />);
    // The FrontAir shuttle has no booking at all; confirmed legs never say "unconfirmed".
    expect(within(travel("Wed Jul 29")).queryByText("unconfirmed")).toBeNull();
    expect(within(travel("Tue Aug 4")).getByText(/Transfer to the FrontAir hotel/)).toBeInTheDocument();
    expect(within(travel("Tue Aug 4")).getByText("and 3 local moves during the day")).toBeInTheDocument();
  });
});

describe("Itinerary — medium (768–1023px)", () => {
  beforeEach(() => (restoreViewport = setViewportWidth(820)));

  it("expands the selected day inline under its row and shows the diagram strip above the timeline", async () => {
    const user = userEvent.setup();
    renderAt("/itinerary", <AppRoutes />);
    expect(screen.queryByRole("heading", { level: 3 })).toBeNull();
    expect(screen.getByRole("img", { name: /^Route diagram/ })).toBeInTheDocument();
    await user.click(row(/^Sat Aug 1/));
    const item = screen.getByTestId("itinerary-day-day-4");
    expect(within(item).getByRole("heading", { level: 3, name: "Menorca to Barcelona, Costa Brava road trip" })).toBeInTheDocument();
  });
});

describe("Itinerary — narrow (<768px)", () => {
  beforeEach(() => (restoreViewport = setViewportWidth(390)));

  it("has no panel or diagram until a day is chosen; the day then opens as a full view and Back returns focus to its row", async () => {
    const user = userEvent.setup();
    const { location } = renderAt("/itinerary", <AppRoutes />);
    expect(screen.queryByRole("img", { name: /Route diagram/ })).toBeNull();
    expect(screen.queryByRole("link", { name: "Plan this day" })).toBeNull();

    await user.click(row(/^Thu Jul 30/));
    expect(location.history?.at(-1)).toBe("/itinerary/day-2");
    const heading = screen.getByRole("heading", { level: 1, name: "Menorca coves, culture, and Ciutadella" });
    await waitFor(() => expect(heading).toHaveFocus());
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);

    await user.click(screen.getByRole("link", { name: "Back to trip" }));
    await waitFor(() => expect(row(/^Thu Jul 30/)).toHaveFocus());
  });
});
