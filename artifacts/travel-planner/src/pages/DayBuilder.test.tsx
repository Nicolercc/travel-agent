// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppRoutes } from "@/App";
import { renderAt } from "@/test/render";

beforeEach(() => window.sessionStorage.clear());

async function choosePlacement(user: ReturnType<typeof userEvent.setup>, placeName: string, option: string) {
  await user.click(screen.getByRole("combobox", { name: `Section for ${placeName}` }));
  await user.click(await screen.findByRole("option", { name: option }));
}

const verdict = () => within(screen.getByRole("region", { name: "Is this day realistic?" }));
const announcer = () => screen.getByTestId("announcer");

describe("Day Builder — Is this day realistic?", () => {
  it("Aug 1: committing a third stop makes the day Tight; the suggestion makes it Full again, announced once", async () => {
    const user = userEvent.setup();
    renderAt("/day/day-4", <AppRoutes />);
    expect(verdict().getByText("Full")).toBeInTheDocument();

    await choosePlacement(user, "Sa Tuna or Aiguablava", "Planned");
    expect(verdict().getByText("Tight")).toBeInTheDocument();
    expect(verdict().getByText(/spare for delays/)).toBeInTheDocument();
    await waitFor(() => expect(announcer()).toHaveTextContent("Sa Tuna or Aiguablava is now Planned. Sat Aug 1 is now Tight."));

    await user.click(verdict().getByRole("button", { name: "Move to Optional" }));
    expect(verdict().getByText("Full")).toBeInTheDocument();
    await waitFor(() => expect(announcer()).toHaveTextContent("Moved Sa Tuna or Aiguablava to Optional. Sat Aug 1 is now Full."));
    expect(screen.getByRole("heading", { name: "Is this day realistic?" })).toHaveFocus();
  });

  it("keeps keyboard focus on a card's control when it moves to another section (focus follows the card)", async () => {
    const user = userEvent.setup();
    renderAt("/day/day-4", <AppRoutes />);
    await choosePlacement(user, "Sa Tuna or Aiguablava", "Planned");
    await waitFor(() => expect(screen.getByRole("combobox", { name: "Section for Sa Tuna or Aiguablava" })).toHaveFocus());
    expect(within(screen.getByRole("region", { name: "Planned" })).getByRole("combobox", { name: "Section for Sa Tuna or Aiguablava" })).toBeInTheDocument();
  });

  it("choosing a new anchor demotes the previous one, says so, and can be undone", async () => {
    const user = userEvent.setup();
    renderAt("/day/day-3", <AppRoutes />);
    await choosePlacement(user, "Cales Coves, or a nearby final swim", "Anchor");

    const anchor = screen.getByRole("region", { name: "Anchor" });
    expect(within(anchor).getByRole("heading", { name: "Cales Coves, or a nearby final swim" })).toBeInTheDocument();
    expect(within(screen.getByRole("region", { name: "Planned" })).getByRole("heading", { name: "Binibeca Vell" })).toBeInTheDocument();
    const message = "Cales Coves, or a nearby final swim is now the anchor. Binibeca Vell moved to Planned.";
    expect(screen.getByText(message)).toBeInTheDocument();
    await waitFor(() => expect(announcer()).toHaveTextContent(message));

    await user.click(screen.getByRole("button", { name: "Undo" }));
    expect(within(screen.getByRole("region", { name: "Anchor" })).getByRole("heading", { name: "Binibeca Vell" })).toBeInTheDocument();
    await waitFor(() => expect(announcer()).toHaveTextContent("Undone."));
  });

  it("marks optional plans as fitting or not, and never counts them", () => {
    renderAt("/day/day-2", <AppRoutes />);
    const optional = screen.getByRole("region", { name: /Optional/ });
    expect(within(optional).getAllByText("Fits today")).toHaveLength(2);
  });

  it("shows fixed travel and appointments, and labels typical durations as estimates", () => {
    renderAt("/day/day-7", <AppRoutes />);
    expect(within(screen.getByRole("region", { name: "Fixed today" })).getByText("InterContinental checkout (by 12:00 PM)")).toBeInTheDocument();
    expect(screen.getAllByText(/\(typical\)/).length).toBeGreaterThan(0);
    expect(verdict().getByText("Full")).toBeInTheDocument();
    expect(verdict().getByText(/· estimate/)).toBeInTheDocument();
  });

  it("offers booking confirmation from the day for an unconfirmed ticket", async () => {
    const user = userEvent.setup();
    renderAt("/day/day-7", <AppRoutes />);
    await user.click(screen.getAllByRole("button", { name: "Needs confirmation" })[0]);
    expect(await screen.findByRole("dialog", { name: "Add confirmation" })).toBeInTheDocument();
  });
});
