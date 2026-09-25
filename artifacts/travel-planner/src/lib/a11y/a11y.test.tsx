// @vitest-environment jsdom
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AnnouncerProvider, useAnnounce } from "./announcer";
import { useFocusAfterRender } from "./focus";

function Announcing() {
  const announce = useAnnounce();
  return <button onClick={() => announce("Shuttle confirmed.")}>Confirm</button>;
}

describe("announcer", () => {
  it("renders each message in the shared polite region, and re-announces a repeat as a new node", async () => {
    const user = userEvent.setup();
    render(
      <AnnouncerProvider>
        <Announcing />
      </AnnouncerProvider>,
    );
    const region = screen.getByTestId("announcer");
    expect(region).toHaveAttribute("aria-live", "polite");
    await user.click(screen.getByRole("button"));
    const first = region.firstChild;
    expect(region).toHaveTextContent("Shuttle confirmed.");
    await user.click(screen.getByRole("button"));
    expect(region.firstChild).not.toBe(first);
  });
});

function Removable() {
  const [items, setItems] = useState(["a", "b", "c"]);
  const focusLater = useFocusAfterRender();
  return (
    <ul>
      {items.map((item, index) => (
        <li key={item}>
          <button
            id={`item-${item}`}
            onClick={() => {
              focusLater(`item-${items[index + 1]}`, "heading");
              setItems(items.filter((i) => i !== item));
            }}
          >
            Resolve {item}
          </button>
        </li>
      ))}
      <h2 id="heading" tabIndex={-1}>Heading</h2>
    </ul>
  );
}

describe("focus after render", () => {
  it("moves focus to the next item when the focused one disappears, then to the fallback", async () => {
    const user = userEvent.setup();
    render(<Removable />);
    const first = screen.getByRole("button", { name: "Resolve a" });
    first.focus();
    await user.keyboard("{Enter}");
    expect(screen.getByRole("button", { name: "Resolve b" })).toHaveFocus();
    act(() => screen.getByRole("button", { name: "Resolve c" }).focus());
    await user.keyboard("{Enter}");
    expect(screen.getByRole("heading", { name: "Heading" })).toHaveFocus();
  });
});
