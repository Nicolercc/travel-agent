// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppRoutes } from "@/App";
import { renderAt } from "@/test/render";

// The demo clock is pinned (Sat Jul 25, 2026); clear any remembered override between tests.
beforeEach(() => window.sessionStorage.clear());

const needsYou = () => screen.getByRole("region", { name: /Needs you/ });
const issueTitles = () => within(needsYou()).getAllByRole("listitem").map((item) => item.querySelector("p + p")?.textContent);

describe("Trip Pulse — Needs you", () => {
  it("resolves a booking in place: the issue disappears, it is announced, and focus moves to the next issue", async () => {
    const user = userEvent.setup();
    renderAt("/dashboard", <AppRoutes />);

    expect(issueTitles()[1]).toBe("Book Sagrada Família timed-entry tickets for around 2:00 PM");
    const sagrada = within(needsYou()).getAllByRole("button", { name: "Add confirmation" })[0];
    expect(sagrada).toHaveAccessibleDescription("Book Sagrada Família timed-entry tickets for around 2:00 PM");
    await user.click(sagrada);

    const dialog = await screen.findByRole("dialog", { name: "Add confirmation" });
    await user.type(within(dialog).getByLabelText("Confirmation or booking reference"), "DEMO-SGF14");
    await user.click(within(dialog).getByRole("button", { name: "Save confirmation" }));

    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(issueTitles()).not.toContain("Book Sagrada Família timed-entry tickets for around 2:00 PM");
    expect(screen.getByTestId("announcer")).toHaveTextContent("Sagrada Família timed entry confirmed.");
    await waitFor(() =>
      expect(document.activeElement).toHaveAccessibleDescription("Book the Cova d'en Xoroi sunset session"),
    );
  });

  it("refuses a placeholder confirmation with an associated error and keeps the issue", async () => {
    const user = userEvent.setup();
    renderAt("/dashboard", <AppRoutes />);
    await user.click(within(needsYou()).getAllByRole("button", { name: "Add confirmation" })[0]);
    const dialog = await screen.findByRole("dialog");
    const field = within(dialog).getByLabelText("Confirmation or booking reference");
    await user.type(field, "TBC");
    await user.click(within(dialog).getByRole("button", { name: "Save confirmation" }));

    expect(field).toHaveAttribute("aria-invalid", "true");
    expect(field).toHaveAccessibleDescription(/placeholder/);
    expect(field).toHaveFocus();
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(issueTitles()).toContain("Book Sagrada Família timed-entry tickets for around 2:00 PM");
  });

  it("marks a task done from the list and keeps focus in the list", async () => {
    const user = userEvent.setup();
    renderAt("/dashboard", <AppRoutes />);
    const first = within(needsYou()).getAllByRole("button", { name: "Mark done" })[0];
    expect(first).toHaveAccessibleDescription(/Menorca car return/);
    first.focus();
    await user.keyboard("{Enter}");

    expect(issueTitles().some((title) => title?.includes("Menorca car return"))).toBe(false);
    expect(screen.getByTestId("announcer")).toHaveTextContent(/^Done: Fix the Menorca car return/);
    expect(document.activeElement).toHaveAccessibleDescription("Book Sagrada Família timed-entry tickets for around 2:00 PM");
  });

  it("shows the top three issues and discloses the rest", async () => {
    const user = userEvent.setup();
    renderAt("/dashboard", <AppRoutes />);
    expect(within(needsYou()).getAllByRole("listitem")).toHaveLength(3);
    const toggle = screen.getByRole("button", { name: "Show 3 more" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    await user.click(toggle);
    expect(within(needsYou()).getAllByRole("listitem")).toHaveLength(6);
    expect(screen.getByRole("button", { name: "Show fewer" })).toHaveAttribute("aria-expanded", "true");
  });

  it("has exactly one h1 and a skip link to main", () => {
    renderAt("/dashboard", <AppRoutes />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("link", { name: "Skip to content" })).toHaveAttribute("href", "#main");
    expect(screen.getByRole("main")).toHaveAttribute("id", "main");
  });
});

describe("Reset demo", () => {
  it("asks first, then restores the seed and announces it", async () => {
    const user = userEvent.setup();
    renderAt("/dashboard", <AppRoutes />);
    const total = () => Number(screen.getByRole("heading", { name: /Needs you/ }).querySelector("span")?.textContent);
    const initial = total();
    await user.click(within(needsYou()).getAllByRole("button", { name: "Mark done" })[0]);
    expect(total()).toBe(initial - 1);

    await user.click(screen.getAllByRole("button", { name: "Reset demo" })[0]);
    const group = screen.getByRole("group", { name: "Reset the demo? Your changes will be lost." });
    expect(within(group).getByRole("button", { name: "Cancel" })).toHaveFocus();
    await user.click(within(group).getByRole("button", { name: "Reset" }));

    expect(screen.getByTestId("announcer")).toHaveTextContent("Demo reset.");
    expect(total()).toBe(initial);
  });
});
