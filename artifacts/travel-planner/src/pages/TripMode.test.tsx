// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppRoutes } from "@/App";
import { renderAt } from "@/test/render";

beforeEach(() => window.sessionStorage.clear());

const nowNext = () => within(screen.getByRole("region", { name: "Now and next" }));
const nextBar = () => within(screen.getByRole("complementary", { name: "Next up" }));
const announcer = () => screen.getByTestId("announcer");

describe("Trip Mode", () => {
  it("keeps keyboard focus on an item after marking it done, and says so in the button name", async () => {
    const user = userEvent.setup();
    renderAt("/trip-mode/day-2", <AppRoutes />);

    const [toggle] = screen.getAllByRole("button", { name: /^Mark .+ done$/ }).filter((button) => !button.closest("aside"));
    toggle.focus();
    await user.keyboard("{Enter}");

    expect(document.activeElement).toBe(toggle);
    expect(toggle).toHaveAccessibleName(/^Undo done: .+$/);
  });

  it("at 2:00 PM on Jul 28 the flight is Next, with the airport steps, and its confirmation can be copied", () => {
    renderAt("/trip-mode/day-0?now=2026-07-28T14:00", <AppRoutes />);
    expect(nowNext().getByText("Nothing scheduled right now.")).toBeInTheDocument();
    const next = nowNext().getByRole("heading", { name: "Next" }).parentElement!;
    expect(within(next).getByText("DL128 · JFK → Barcelona")).toBeInTheDocument();
    expect(within(next).getByText("Arrive at JFK · 3:45 PM")).toBeInTheDocument();
    expect(nextBar().getByRole("button", { name: "Mark DL128 · JFK → Barcelona done" })).toBeInTheDocument();
    const travel = within(screen.getByRole("region", { name: "Today's travel" }));
    expect(travel.getByRole("button", { name: "Copy DL128 · JFK → Barcelona confirmation" })).toBeInTheDocument();
    expect(screen.getByText("Now 2:00 PM")).toBeInTheDocument();
  });

  it("Done in the Next bar advances Next, keeps focus, and announces what's next", async () => {
    const user = userEvent.setup();
    renderAt("/trip-mode/day-4?now=2026-08-01T05:10", <AppRoutes />);
    expect(nowNext().getByText("Wake up")).toBeInTheDocument();
    const done = nextBar().getByRole("button", { name: "Mark Cala en Porter → Menorca Airport (car return) done" });
    done.focus();
    await user.keyboard("{Enter}");

    await waitFor(() => expect(announcer()).toHaveTextContent("Done. Next: FR6882 · Menorca → Barcelona, dep 7:50 AM."));
    expect(done).toHaveFocus();
    expect(done).toHaveAccessibleName("Mark FR6882 · Menorca → Barcelona done");
  });

  it("previews other dates: nothing is Now, and the header says so", () => {
    renderAt("/trip-mode/day-7", <AppRoutes />);
    expect(screen.getAllByText(/Previewing Tue Aug 4/)[0]).toBeInTheDocument();
    expect(nowNext().getByText("Nothing yet: this day hasn't started.")).toBeInTheDocument();
    expect(within(nowNext().getByRole("heading", { name: "Next" }).parentElement!).getByText("InterContinental checkout (by 12:00 PM)")).toBeInTheDocument();
  });

  it("skipping a plan offers its backups; choosing one makes it Next without re-planning", async () => {
    const user = userEvent.setup();
    renderAt("/trip-mode/day-2?now=2026-07-30T09:00", <AppRoutes />);
    await user.click(screen.getByRole("button", { name: "Skip Cala Macarella & Macarelleta" }));
    expect(screen.getByText("Backups for this:")).toBeInTheDocument();
    const choose = screen.getByRole("button", { name: "Do Boat day instead of the coves instead" });
    await user.click(choose);
    expect(choose).toHaveAttribute("aria-pressed", "true");
    expect(nextBar().getByText("Boat day instead of the coves")).toBeInTheDocument();
    await waitFor(() => expect(announcer()).toHaveTextContent("Next: Boat day instead of the coves."));
  });

  it("says when a skipped plan has no backup, and links to replan", async () => {
    const user = userEvent.setup();
    renderAt("/trip-mode/day-3?now=2026-07-31T09:00", <AppRoutes />);
    await user.click(screen.getByRole("button", { name: "Skip Binibeca Vell" }));
    expect(screen.getByText(/No backup planned/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Replan in Day Builder" })).toHaveAttribute("href", "/day/day-3");
  });

  it("puts critical open tasks at the top, with a way to resolve them", () => {
    renderAt("/trip-mode/day-3", <AppRoutes />);
    expect(screen.getByText("1 critical task is still open")).toBeInTheDocument();
    expect(screen.getByText(/Fix the Menorca car return/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Resolve in Day Builder" })).toHaveAttribute("href", "/day/day-3");
  });

  it("leaves planning out: no verdicts, placement controls, or do-not-cram list", () => {
    renderAt("/trip-mode/day-7", <AppRoutes />);
    expect(screen.queryByText(/Comfortable|Overloaded|Is this day realistic/)).toBeNull();
    expect(screen.queryByRole("combobox")).toBeNull();
    expect(screen.queryByText(/Do not cram/i)).toBeNull();
    expect(screen.getByText("Day notes")).toBeInTheDocument();
  });

  it("has one main, one h1 (the day title), and a skip link", () => {
    renderAt("/trip-mode/day-7", <AppRoutes />);
    expect(screen.getAllByRole("main")).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Barcelona city, Gaudí, and the airport-hotel move");
    expect(screen.getByRole("link", { name: "Skip to content" })).toHaveAttribute("href", "#main");
  });

  it("explains an unknown day and links out", () => {
    renderAt("/trip-mode/day-99", <AppRoutes />);
    expect(screen.getByRole("heading", { level: 1, name: "Day not found" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Go to the Itinerary" })).toHaveAttribute("href", "/itinerary");
  });
});
