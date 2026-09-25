// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppRoutes } from "@/App";
import { renderAt } from "@/test/render";

beforeEach(() => window.sessionStorage.clear());

const announcer = () => screen.getByTestId("announcer");
const cardNames = () => screen.queryAllByRole("article").map((card) => within(card).getByRole("heading").textContent);

async function assignTo(user: ReturnType<typeof userEvent.setup>, placeName: string, dayOption: RegExp) {
  await user.click(screen.getByRole("combobox", { name: `Assign ${placeName} to a day` }));
  await user.click(await screen.findByRole("option", { name: dayOption }));
}

describe("Inbox — triage", () => {
  it("shows the count as a status and every unsorted save as a card", () => {
    renderAt("/inbox", <AppRoutes />);
    expect(screen.getByText("7 to sort")).toHaveAttribute("role", "status");
    expect(cardNames()).toHaveLength(7);
  });

  it("assigning turns the card into an untimed row with Undo focused; Undo puts it back and focuses its select", async () => {
    const user = userEvent.setup();
    renderAt("/inbox", <AppRoutes />);
    await assignTo(user, "Bar Cañete", /^Tue Aug 4/);

    const undo = screen.getByRole("button", { name: "Undo: put Bar Cañete back in the Inbox" });
    await waitFor(() => expect(undo).toHaveFocus());
    expect(screen.getByText("· Assigned to Tue Aug 4")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open day" })).toHaveAttribute("href", "/day/day-7");
    expect(announcer()).toHaveTextContent("Assigned Bar Cañete to Tue Aug 4 as planned.");
    expect(screen.getByText("6 to sort")).toBeInTheDocument();

    await user.click(undo);
    await waitFor(() => expect(screen.getByRole("combobox", { name: "Assign Bar Cañete to a day" })).toHaveFocus());
    expect(announcer()).toHaveTextContent("Bar Cañete is back in the Inbox.");
    expect(screen.getByText("7 to sort")).toBeInTheDocument();
  });

  it("filters by search, category, and priority, and can clear them", async () => {
    const user = userEvent.setup();
    renderAt("/inbox", <AppRoutes />);
    await user.selectOptions(screen.getByLabelText("Priority"), "medium");
    expect(cardNames()).toEqual(["Syra Coffee", "Bormuth", "Nomad Coffee Lab"]);
    await user.selectOptions(screen.getByLabelText("Category"), "cafe");
    expect(cardNames()).toEqual(["Syra Coffee", "Nomad Coffee Lab"]);
    await user.type(screen.getByLabelText("Search"), "nomad");
    expect(cardNames()).toEqual(["Nomad Coffee Lab"]);
    await user.type(screen.getByLabelText("Search"), "zzz");
    expect(screen.getByText("No saved places match these filters.")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(cardNames()).toHaveLength(7);
    await waitFor(() => expect(screen.getByLabelText("Search")).toHaveFocus());
  });
});

describe("Inbox — capture", () => {
  it("refuses a link that isn't a full web address, with the error tied to the field", async () => {
    const user = userEvent.setup();
    renderAt("/inbox", <AppRoutes />);
    await user.click(screen.getByRole("button", { name: "Save a place" }));
    const dialog = await screen.findByRole("dialog", { name: "Save a place" });
    const link = within(dialog).getByLabelText("Link");
    await user.type(link, "www.tiktok.com/@bar{Enter}");

    expect(link).toHaveAttribute("aria-invalid", "true");
    expect(link).toHaveAccessibleDescription("Enter a full web link starting with https://");
    expect(link).toHaveFocus();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("7 to sort")).toBeInTheDocument();
  });

  it("saves with Enter, names an unnamed save after the site, focuses and announces the new card", async () => {
    const user = userEvent.setup();
    renderAt("/inbox", <AppRoutes />);
    await user.click(screen.getByRole("button", { name: "Save a place" }));
    const dialog = await screen.findByRole("dialog", { name: "Save a place" });
    await user.type(within(dialog).getByLabelText("Link"), "https://www.instagram.com/p/abc{Enter}");

    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    const card = screen.getByRole("article", { name: "Saved from instagram.com" });
    await waitFor(() => expect(card).toHaveFocus());
    expect(cardNames()[0]).toBe("Saved from instagram.com");
    expect(within(card).getByRole("link", { name: /Instagram source/ })).toHaveAttribute("href", "https://www.instagram.com/p/abc");
    expect(announcer()).toHaveTextContent("Saved Saved from instagram.com to Inbox.");
    expect(screen.getByText("8 to sort")).toBeInTheDocument();
  });

  it("capture → assign → the place is in that day, in the placement its priority implies", async () => {
    const user = userEvent.setup();
    renderAt("/inbox", <AppRoutes />);
    await user.click(screen.getByRole("button", { name: "Save a place" }));
    const dialog = await screen.findByRole("dialog", { name: "Save a place" });
    await user.type(within(dialog).getByLabelText(/^Link/), "https://example.com/granja");
    await user.type(within(dialog).getByLabelText(/^Name/), "Granja Dulcinea");
    await user.type(within(dialog).getByLabelText(/^City/), "Barcelona");
    await user.click(within(dialog).getByRole("button", { name: "Save" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());

    await assignTo(user, "Granja Dulcinea", /^Tue Aug 4/);
    expect(announcer()).toHaveTextContent("Assigned Granja Dulcinea to Tue Aug 4 as optional.");
    await user.click(screen.getByRole("link", { name: "Open day" }));
    const optional = await screen.findByRole("region", { name: /Optional/ });
    expect(within(optional).getByRole("heading", { name: "Granja Dulcinea" })).toBeInTheDocument();
  });

  it("can put a new save straight into a day", async () => {
    const user = userEvent.setup();
    renderAt("/inbox", <AppRoutes />);
    await user.click(screen.getByRole("button", { name: "Save a place" }));
    const dialog = await screen.findByRole("dialog", { name: "Save a place" });
    await user.type(within(dialog).getByLabelText(/^Link/), "https://example.com/x");
    await user.type(within(dialog).getByLabelText(/^Name/), "Els Quatre Gats");
    await user.selectOptions(within(dialog).getByLabelText(/^Day/), "day-7");
    await user.click(within(dialog).getByRole("button", { name: "Save" }));

    await waitFor(() => expect(screen.getByRole("button", { name: "Undo: put Els Quatre Gats back in the Inbox" })).toHaveFocus());
    expect(announcer()).toHaveTextContent("Saved Els Quatre Gats to Tue Aug 4 as optional.");
  });

  it("returns focus to Save a place when cancelled", async () => {
    const user = userEvent.setup();
    renderAt("/inbox", <AppRoutes />);
    await user.click(screen.getByRole("button", { name: "Save a place" }));
    await screen.findByRole("dialog");
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.getByRole("button", { name: "Save a place" })).toHaveFocus());
  });
});
