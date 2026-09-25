# Accessibility

**Claim we can make:** Built and tested against WCAG 2.2 AA criteria, with automated axe checks on every route in CI
and a documented manual keyboard pass. Known gaps are listed below. We don't claim "WCAG compliant".

## Contract (RFC-001 §15)

| Rule | How it's met | Checked by |
|---|---|---|
| One meaningful h1, no skipped levels | Every route has one h1 (the page subject; Trip Mode's is the day title) | axe (`page-has-heading-one`, `heading-order`) in jsdom |
| Landmarks | Header, labelled nav, one `main` per route, including Trip Mode, 404, and error screens | axe (`landmark-*`, `region`) |
| Skip link | "Skip to content" is the first focusable element on every screen | `Dashboard.test`, `TripMode.test` |
| Keyboard | Every flow works by keyboard; no button does nothing | `no-dead-controls.test` (14 routes), e2e ribbon test |
| Focus restoration | Defined targets after move, assign, resolve, dialog close, undo, and route change (focus goes to the new h1) | page tests, `route-focus.test`; each focus rule was mutation-checked |
| Focus visibility | One 2px ring from the `--ring` token on every focusable element, including links | global `:focus-visible` rule + `.focus-ring` |
| Form names | Visible labels in sheets and filters; errors tied by `aria-describedby` + `aria-invalid`, with focus moved to the field | `Inbox.test`, `Dashboard.test` |
| Announcements | One app-level live region; each change announced once | page tests assert the exact text |
| Non-color status | Verdicts, booking state, and progress are always words ("Full · estimate", "unconfirmed", "Done") | review + tests |
| Contrast | Two text tokens darkened (muted ink 44%→39% lightness; status-progress text) after axe found failures | axe with contrast in Playwright, 7 routes × 2 widths |
| Reflow | No horizontal scroll at 320px | e2e |
| Touch targets | ≥44px in Trip Mode and for primary mobile actions | browser measurement (E9) |
| Route diagram | A labelled image with a text summary, not focusable; the timeline is the equivalent | `Itinerary.test` |
| Error recovery | Error screens have an h1 that receives focus, plus "Reload" and "Reset demo data" | `ErrorBoundary.test` |
| Reduced motion | Page fades are ≤200ms and `motion-safe`; under `prefers-reduced-motion`, all animation and transitions settle instantly | CSS |

## Automated checks

- `src/test/axe.test.tsx`: axe-core on 12 routes at 390px and 1440px layouts in jsdom (all rules except color
  contrast, which needs layout).
- `e2e/demo.spec.ts`: axe (WCAG 2.0/2.1/2.2 A and AA tags, contrast included) on 7 routes at 390×844 and 1440×900 in
  Chromium, plus the demo script, zero console errors, and 320px reflow.

## Manual test log

| Date | Check | Result |
|---|---|---|
| 2026-09-23 | Keyboard: Trip Pulse → resolve booking → focus to the next issue | Pass (browser, and automated) |
| 2026-09-23 | Keyboard: Day Builder placement change; focus follows the card; anchor demotion + Undo | Pass (automated) |
| 2026-09-23 | Keyboard: Itinerary row → full view on narrow screens → "Back to trip" returns focus to the row | Pass (automated) |
| 2026-09-23 | Trip Mode at 390px: target sizes measured in the browser | Pass (all ≥44px) |
| 2026-09-23 | Layout at 320, 390, 820, 1440px | Pass (no horizontal scroll) |
| — | VoiceOver on Safari (macOS) | **Not done yet** (owner) |
| — | iPhone Safari on a real device | **Not done yet** (owner) |
| — | 400% browser zoom at 1280px | **Not done yet** (covered in part by the 320px reflow check) |
| — | Grayscale pass | **Not done yet** (every status also has text) |

## Known gaps

- No screen-reader pass on real assistive technology yet (see the log).
- Fonts load from Google Fonts. If that fails, text falls back to system fonts, which is fine for access but is a
  third-party request (see the README).
- Radix Select popovers follow Radix's own keyboard model. We haven't tested them with every screen reader.
- The chosen backup in Trip Mode lasts for the session only (by design), so a reload forgets it.
