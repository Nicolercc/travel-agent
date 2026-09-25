# Decisions

The engineering decisions that shape the code, condensed from the full log (archived in
[archive/DECISION_LOG.md](archive/DECISION_LOG.md)) and RFC-001. Each says what was decided, why, and what it costs.

## 1. No backend, accounts, network APIs, or AI

**Decision.** The app is client-only: static seed data plus one `localStorage` key.
**Why.** The product question is whether a day is realistic, and that can be answered completely on the client.
Fake AI or a mock backend would add surface that proves nothing.
**Cost.** One device, one trip, no sharing. Capture takes only what the traveler types; it never reads the linked
page.

## 2. One model: a static seed plus one mutable `Place`

**Decision.** Trip structure (days, bases, legs, fixed events, bookings, tasks) is static. Anything the traveler can
do is a `Place`, and its only mutable part is its assignment (day and placement). The three earlier models (saved
places, itinerary events, logistics items) were merged into it through an explicit mapping table, not fuzzy matching,
because fuzzy matching paired the wrong beaches.
**Why.** Three models with overlapping facts made Trip Pulse and the Itinerary disagree.
**Cost.** A one-time migration (v1/v2 → v3) with an ID map, and the seed-merge decisions listed in the RFC-001
completion report.

## 3. One reducer enforces the invariants

**Decision.** Every change goes through `transition(state, action, seed) → { state, effects }`. It rejects actions
that would break an invariant and does compound changes atomically (choosing a new anchor demotes the old one in the
same step). `validateTripState` checks the result in tests.
**Why.** An invariant enforced in one place can't be forgotten by a page. Returned effects let pages announce and
undo without the state layer knowing about UI.
**Cost.** Every feature needs an action. That's intentional friction.

## 4. Derived facts are never stored

**Decision.** Verdicts, readiness, issues, "booked", trip phase, and now/next are computed by selectors, memoized
per state object. Components and pages can't import domain rule modules (lint-enforced).
**Why.** If two screens read one selector, they can't disagree. A test checks Trip Pulse, the Itinerary, and Day
Builder against each other.
**Cost.** Selectors take `(state, seed)` everywhere. The memo cache is keyed by object identity, so state must stay
immutable.

## 5. The realistic-day engine is explainable, and every number lives in one file

**Decision.** A day's verdict comes from a busy-block model (fixed events, travel buffers, committed plans,
transitions) against a day window and an energy budget. It's deterministic, monotonic, and isolated per day. Every
constant is in `planning-heuristics.ts`. Estimates are labelled ("about 2 hours (typical)", "Full · estimate").
**Why.** A verdict the traveler can't check is worse than none. Centralized constants make the heuristics
reviewable and tunable without hunting through components.
**Cost.** The numbers are judgment calls, and the UI says so. See [DAY_LOAD.md](DAY_LOAD.md).

## 6. Never throw on stored data

**Decision.** Storage is read through an adapter that never throws. Stored data is validated with zod, record by
record: bad records are dropped and reported, and anything unreadable reseeds with a visible notice. If storage fails,
the app keeps working in memory and says so.
**Why.** The prototype could be blanked by one bad `localStorage` value. That crash is now covered by a table of
corruption cases.
**Cost.** A little more code at the boundary, and a repair pass on every load.

## 7. A pinned demo clock

**Decision.** "Now" is Sat Jul 25, 2026, 10:00, overridable with `?now=` and remembered per tab. Domain code takes
the clock as an argument.
**Why.** The trip is in the past; with the real clock the demo read "Trip completed". A pinned clock makes the demo,
and every time-based test, reproducible.
**Cost.** The header shows the demo date, so nobody mistakes it for today.

## 8. An SVG route diagram, not a map

**Decision.** The Itinerary shows a small equirectangular diagram of real coordinates, with no tiles, roads, zoom,
or geocoding. It's labelled with a text summary and isn't focusable; the timeline is the accessible equivalent.
**Why.** The question is "how far apart are my bases, and which moves are flights?" A map library would add weight,
a network dependency, and an accessibility burden without answering it better.
**Cost.** No street-level detail. "Open in Maps" links hand that job to a real map app.
