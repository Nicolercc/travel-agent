import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * The demo script (RFC §25), end to end in a real browser: no console errors, axe clean (including
 * color contrast, which jsdom can't check), persistence across reloads, and recovery from bad storage.
 */

const errors = new Map<Page, string[]>();

const isLocal = (url: string) => url.startsWith("http://localhost");

test.beforeEach(async ({ page }) => {
  // Hermetic: the only off-origin request is the Google Fonts stylesheet; block it so runs don't
  // depend on the network (text falls back to system fonts), and ignore only those blocked loads.
  await page.route((url) => !isLocal(url.toString()), (route) => route.abort());
  const list: string[] = [];
  errors.set(page, list);
  page.on("console", (message) => {
    if (message.type() !== "error") return;
    if (message.text().startsWith("Failed to load resource") && !isLocal(message.location().url)) return;
    list.push(message.text());
  });
  page.on("pageerror", (error) => list.push(error.message));
});

test.afterEach(async ({ page }) => {
  expect(errors.get(page), "console errors").toEqual([]);
});

async function expectAxeClean(page: Page) {
  // Let the ≤200 ms page fade finish so contrast is measured on the settled page.
  await page.waitForTimeout(300);
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
  expect(results.violations.map((violation) => `${violation.id}: ${violation.nodes.map((node) => node.target.join(" ")).join(", ")}`)).toEqual([]);
}

const ROUTES = ["/dashboard", "/inbox", "/itinerary", "/day/day-7", "/trip-mode/day-0?now=2026-07-28T14:00", "/logistics", "/packing"];

for (const route of ROUTES) {
  test(`axe is clean on ${route}`, async ({ page }) => {
    await page.goto(route);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expectAxeClean(page);
  });
}

test("Trip Pulse: resolve an issue in place, and every surface agrees", async ({ page }) => {
  await page.goto("/dashboard");
  const needsYou = page.getByRole("region", { name: /Needs you/ });
  const count = async () => Number(await needsYou.getByRole("heading").first().locator("span").textContent());
  const before = await count();
  await needsYou.getByRole("button", { name: "Mark done" }).first().click();
  await expect.poll(count).toBe(before - 1);
  await expect(page.getByTestId("announcer")).toHaveText(/^Done: /);
});

test("the ribbon is keyboard-operable: arrows reach Aug 1", async ({ page }) => {
  await page.goto("/dashboard");
  const tabs = page.getByRole("tablist", { name: "Trip days" });
  await tabs.getByRole("tab", { selected: true }).focus();
  await page.keyboard.press("Home");
  for (let step = 0; step < 4; step++) await page.keyboard.press("ArrowRight");
  await expect(tabs.getByRole("tab", { selected: true })).toContainText("Aug 1");
});

test("Day Builder: a third stop makes Aug 1 Tight; the suggestion makes it Full; a new anchor demotes the old one", async ({ page }) => {
  await page.goto("/day/day-4");
  const verdict = page.getByRole("region", { name: "Is this day realistic?" });
  await expect(verdict).toContainText("Full");

  await page.getByRole("combobox", { name: "Section for Sa Tuna or Aiguablava" }).click();
  await page.getByRole("option", { name: "Planned" }).click();
  await expect(verdict).toContainText("Tight");
  await verdict.getByRole("button", { name: "Move to Optional" }).click();
  await expect(verdict).toContainText("Full");

  await page.getByRole("combobox", { name: "Section for Begur old town and lunch" }).click();
  await page.getByRole("option", { name: "Anchor" }).click();
  const demotion = /Begur old town and lunch is now the anchor\. .+ moved to Planned\./;
  await expect(page.getByRole("main").getByText(demotion)).toBeVisible();
  await expect(page.getByTestId("announcer")).toHaveText(demotion);
});

test("Itinerary: bases, legs, and the overnight DL128 on two days", async ({ page }) => {
  await page.goto("/itinerary");
  await expect(page.getByRole("link", { name: /^Wed Jul 29, Arrival, .*sleeps in Cala en Porter/ })).toBeVisible();
  await expect(page.getByRole("list", { name: "Travel on Tue Jul 28" })).toContainText("continues overnight");
  await expect(page.getByRole("list", { name: "Travel on Wed Jul 29" })).toContainText("arrives, left Jul 28");
});

test("Trip Mode at 2:00 PM on Jul 28: the flight is Next, and its confirmation copies", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/trip-mode/day-0?now=2026-07-28T14:00");
  await expect(page.getByRole("complementary", { name: "Next up" })).toContainText("DL128 · JFK → Barcelona");
  await page.getByRole("button", { name: "Copy DL128 · JFK → Barcelona confirmation" }).click();
  await expect(page.getByTestId("announcer")).toHaveText("Copied DL128 · JFK → Barcelona confirmation.");
  expect(await page.evaluate(() => navigator.clipboard.readText())).toMatch(/^DEMO-/);
});

test("progress survives a reload", async ({ page }) => {
  await page.goto("/trip-mode/day-2?now=2026-07-30T09:00");
  const done = page.getByRole("button", { name: /^Mark .+ done$/ }).first();
  const name = (await done.getAttribute("aria-label"))!.replace(/^Mark (.+) done$/, "$1");
  await done.click();
  await page.reload();
  await expect(page.getByRole("button", { name: `Undo done: ${name}` })).toBeVisible();
});

test("corrupt storage: the demo resets and says so", async ({ page }) => {
  await page.goto("/dashboard");
  await page.evaluate(() => window.localStorage.setItem("tripcanvas:state", "{}"));
  await page.reload();
  await expect(page.getByText("Saved demo data couldn't be read, so the demo was reset.")).toBeVisible();
  await expect(page.getByRole("heading", { level: 1, name: "Trip Pulse" })).toBeVisible();
});

test("no horizontal scroll at 320 px", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  for (const route of ROUTES) {
    await page.goto(route);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), route).toBe(true);
  }
});
