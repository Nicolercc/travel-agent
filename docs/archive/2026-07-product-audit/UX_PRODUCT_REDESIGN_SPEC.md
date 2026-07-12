# TripCanvas — UX & Product Redesign Spec

Author: Principal Product Designer / Travel Product Research / Distinguished Frontend Review
Status: Proposal — no application code has been modified to produce this document.
Scope: `artifacts/travel-planner` (React + Vite + Tailwind, static prototype, localStorage persistence, mock Spain 2026 trip)

---

## 0. Verdict in one paragraph

TripCanvas has the right bones — a genuinely smart triage model (`anchor / booked / planned / optional / backup / do-not-cram`), a defensible product thesis, and a mock dataset with real narrative texture (Cova d'en Xoroi, Montserrat, Paradiso). But every screen renders that model through the same instrument: a cream `Card` with a serif heading, a muted-foreground subline, and a rainbow of ad-hoc Tailwind badge colors that don't belong to any system. The `route` field on `Trip` (`"Menorca → Costa Brava → Barcelona"`) is never drawn. The `cover_image` field exists and is never used. Nothing on screen tells you this is a Mediterranean trip versus a Tokyo trip versus a Patagonia trip — the product has no sense of place. The fix is not a new component library; it's giving the existing data model somewhere more expressive to live.

---

## 1. Target user and jobs to be done

**Primary user:** The designated planner for an experience-heavy leisure trip — the one friend/partner who ends up owning the group's Notes app screenshots, TikTok saves, and Google Maps stars. They have taste, they have more inspiration than time, and they are planning for people (including themselves) who want a trip that *feels* good on the ground, not a trip that's merely logistically complete.

**Jobs to be done, in order of frequency:**

1. **Capture, at the speed of scrolling.** "I just saw this bar on TikTok — save it before I lose it." Near-zero friction, works one-handed, doesn't demand a decision yet.
2. **Triage without guilt.** "I have 40 saves and 8 days. What actually makes the cut?" Needs comparison, not just a form.
3. **Shape a day that won't collapse under its own ambition.** "If I put a beach, a hike, and dinner reservation on the same day, will regret it." Needs constraint-awareness, not just a list.
4. **Secure the unforgiving stuff.** "Is the Sagrada Família ticket actually booked, and where's the confirmation number when I'm standing at the door with no signal?" Needs certainty and offline-grade retrievability.
5. **Move through a day live, without planning during the trip.** "I'm in Barcelona right now, tired, and need to know what's next without deciding anything." Needs a companion, not a dashboard.
6. **Not forget the teal two-piece.** Secondary but emotionally real — packing tied to the actual day, not a generic list.

**Not for:** business travelers, groups needing shared/collaborative editing, day-of flight-tracking/re-booking, or anyone who wants an AI itinerary generated for them. TripCanvas is a *shaping* tool for a plan the user already has opinions about, not a discovery engine.

---

## 2. Product promise and non-goals

**Promise:** Turn scattered inspiration into calm days you will actually enjoy.

**What "calm" has to mean, concretely, or the promise is just a tagline:**
- Every screen answers exactly one question (see §3) — no screen duplicates another's job.
- The product actively tells the user what to cut, not just what they added.
- Trip Mode contains zero decisions — only acknowledgment and forward motion.
- Visual density decreases as the trip gets closer to "done."

**Explicit non-goals (do not build):**
- No real-time collaboration / multiplayer editing.
- No authentication or accounts.
- No AI itinerary generation, AI "assistant," or auto-suggested places.
- No live flight-status or booking APIs.
- No framework migration — stay in React/Vite/Tailwind/shadcn primitives.
- No backend. LocalStorage remains the persistence layer.

---

## 3. The single user question each screen answers

| Screen | Current name | The one question it must answer | Currently answers |
|---|---|---|---|
| `/` | Landing | "Is this worth my time?" | Roughly yes, but the preview card duplicates Dashboard's job instead of *selling* the product |
| `/trips` | Trip Library | "Which trip am I opening?" | Yes, cleanly — smallest page, least broken |
| `/dashboard` | Overview → **Trip Pulse** | "What do I need to do *right now*?" | No — it shows a feature-day card, health warnings, *and* a full day grid, three competing answers |
| `/inbox` | Inbox → **Capture & Triage** | "Of everything I've saved, what's worth a spot on this trip?" | Partially — capture is strong, triage is a flat list with no comparison surface |
| `/itinerary` | Itinerary → **Journey Narrative** | "What is the shape of this whole trip?" | No — it's a vertical list of Overview's day cards with a decorative timeline line; no geography, no arc |
| `/day/:id` | Day Builder | "Is this specific day realistic?" | Yes, functionally — but it doesn't visualize load/pace, only lists sections |
| `/trip-mode/:id` | Trip Mode | "What's next, right now?" | Close — good bones, but still asks the user to scan a full day's sections rather than surfacing just what's next |
| `/logistics` | Logistics → **Travel Wallet** | "Do I have everything booked, and can I find it under pressure?" | Partially — good grouping, but no urgency ordering and "no ref" items don't visually escalate |
| `/packing` | Packing | "Will I have the right things on the right day?" | Yes, reasonably — weakest link is that it's disconnected from Trip Mode |

Two screens are functionally redundant today: **Overview's day grid is Itinerary with worse information** (no vibe line, no overload/anchor indicators beyond a dashed border). One of them must stop being a grid of day cards.

---

## 4. Proposed information architecture

Rename in nav + route (routes can stay technically same paths if avoiding churn is preferred, but labels should change):

```
Trip Pulse   (/dashboard)   — today/next + what needs a decision. NOT a day grid.
Capture      (/inbox)        — the single fast-add surface + swipeable triage queue
Journey      (/itinerary)    — the whole-trip narrative + map/route strip
Day: [name]  (/day/:id)      — reached only by drilling in from Journey or Trip Pulse
Trip Mode    (/trip-mode/:id) — reached only by drilling in from a Day, or the Pulse "Go" button
Wallet       (/logistics)    — renamed from Logistics
Packing      (/packing)      — unchanged
```

Key IA decisions:

- **Kill the day grid on Trip Pulse.** Trip Pulse becomes a single-column "what now" surface: one Now/Next card, a triage queue count, and a health strip. No repeated day cards — that's Journey's job.
- **Journey absorbs "browse all days."** It becomes the spatial/narrative overview: a horizontal route strip (Menorca → Costa Brava → Barcelona) with mini day cards nested under each leg, not a flat vertical list.
- **Day Builder is only reached in context**, never as a primary nav destination — it's not in the sidebar today either, which is correct; keep it that way.
- **Trip Mode remains the only nav-invisible, full-bleed, mobile-first screen.** It should be launchable from Trip Pulse directly for "today," bypassing Day Builder.
- Bottom tab bar on mobile (5 max), collapsing "Journey" and "Trip Pulse" isn't advisable — keep both, they answer different questions.

---

## 5. Detailed redesign specification

### 5.1 Trip Pulse (`/dashboard`)

**Problem:** Three competing structures fight for primacy — a feature-day hero, a health-warning card, and a full day grid that repeats Itinerary. A user glancing at this screen cannot tell what to *do*.

**Redesign:**
- **Single hero, not competing with a grid below it.** The "Now/Next" card (today if in-trip, otherwise next unstarted day) becomes the *entire* top of the page — full width, not `lg:col-span-3` squeezed next to two small cards. Add a destination-accent-colored ambient background derived from the day's city (see §7.4), not the flat `bg-primary`.
- **Delete the day grid entirely.** Replace the "The Days" section with three compact strips: **Unsorted saves** (count + first 3 names + "Sort Inbox" CTA), **Needs a decision** (missing anchors, overloaded days — same data as `computePlanningHealth`, but rendered as a short punch list, max 4 rows, not a card that can grow unbounded), and **Booking gaps** (bookings without links). This is where `health.*` data already computed in `trip-metrics.ts` belongs — Trip Pulse becomes purely an aggregation of `computePlanningHealth` + `getDashboardFeatureDay`, nothing else.
- **"See the whole trip" link** at the bottom routes to Journey — Trip Pulse never tries to be a day browser again.
- Remove the 3-stat grid (`booked/optional/outfit`) inside the hero card if it's not immediately actionable — keep booked+optional counts (useful triage signal) and move outfit note to a smaller secondary line, since Packing already owns outfits.

**Data changes:** none — `trip-metrics.ts` already computes everything needed. This is purely a layout/scope cut.

### 5.2 Capture & Triage (`/inbox`)

**Problem:** `AddSourceForm` is a large multi-field form for what should be a 3-second capture, and the results render as a flat 2-column grid of near-identical cards, forcing the user to scan rather than decide.

**Redesign — split into two distinct modes on the same page:**

1. **Capture bar** (collapsed by default, not the current full form): a single input — "Paste a link or type a place" — that expands inline only when the user starts typing/pasting. Auto-infers source icon (TikTok/IG/Maps/blog) from URL exactly as `inferSourceType` does today. City/area/notes/category become a "details" disclosure the user can skip entirely (defaults already exist: city defaults to trip's primary city, category defaults to `experience`). Optimize for the save, not the metadata.
2. **Triage queue** replaces the filterable grid as the primary interaction: one place at a time, card-sized, with three clear actions — **Assign to a day** (existing `movePlace` + `daySectionForInboxAssignment` logic, unchanged), **Skip for now** (stays in inbox, moves to back of queue), **Discard** (needs a `deletePlace` capability — see §9). Below the queue, keep a collapsed grid/list view ("See all N unsorted") for users who want to browse instead of triage linearly — but triage-one-at-a-time is the default because it matches the actual cognitive task ("is this worth a day slot") better than a grid that invites the same low-commitment scanning the user is trying to escape.
3. Keep search + category filter, but move them to the collapsed grid view, not the triage queue (queue shouldn't be filterable — that defeats forced decision-making).

**Data changes:** requires a `deletePlace(placeId)` action on `TripContext` (currently absent — inbox items can only be moved, never removed, so a rejected save from six months ago has no way to leave the app). This is a real gap, not a style note.

### 5.3 Journey Narrative (`/itinerary`)

**Problem:** A vertical numbered timeline of day cards that is visually pleasant but informationally identical to Trip Pulse's now-deleted grid. It never uses `trip.route`, never shows geography, and "narrative" is aspirational only.

**Redesign:**
- **Route strip header:** render `trip.route` (`"Menorca → Costa Brava → Barcelona"`) as an actual horizontal leg strip — three (or N) segments, each carrying its destination accent color (§7.4) and day-count badge, e.g. `Menorca · 3 days`, `Costa Brava · 1 day`, `Barcelona · 4 days`. This turns a string field that's currently decorative-only into the page's primary orientation device.
- **Group the day list under its leg**, not as one flat list of 8. Within a leg, keep something close to the current card treatment but tighten it: date, title, day_vibe (this is the "narrative" voice — keep it prominent, it's genuinely good copy), anchor name, and a **pace indicator** (see §5.4) instead of a raw place count.
- Cut the decorative vertical gradient line — it implies a single continuous journey but the trip actually has three geographically distinct legs; the route strip carries that job better.
- Each day card's primary action is "Open Day" (→ Day Builder); "Trip Mode" secondary action stays only for days that are anchor-complete (an unplanned day shouldn't offer to "live" it).

**Data changes:** none required — `trip.route` and `days[].city` already carry what's needed to group into legs (split on `→` or add an explicit `leg` field to `TripDay` — see §9 for the tradeoff).

### 5.4 Day Builder (`/day/:id`)

**Problem:** Functionally the strongest page — the anchor/booked/planned/optional/backup/do-not-cram model is genuinely differentiated. But it's an undifferentiated stack of sections with no sense of *load*. A user can't tell at a glance whether the day is "two relaxed stops" or "six stops crammed into six hours."

**Redesign:**
- Add a **pace strip** directly under the day_vibe quote: a simple horizontal bar segmented by section (anchor/booked/planned = "committed time," optional = "if energy allows," backup/do-not-cram = greyed) with a plain-language read-out ("5 active items — comfortable pace" / "8 active items — this day is full"), reusing the existing `isOverloaded` (`>6` active items) threshold from `trip-metrics.ts`. This is the single highest-leverage addition to this screen: it turns "planning" from list management into *pacing* — TripCanvas's actual differentiator.
- Sections stay, but Anchor gets a visually distinct treatment (larger, destination-accent background) since it's the one commitment that defines the day — currently it looks identical to every other section, just first in DOM order.
- "Nearby Ideas" sidebar stays, but its matching logic (`city === city || includes || area === area_context`) should surface *why* something is nearby ("also in Begur") rather than just a bare list — small copy change, no new data.
- Keep the select-dropdown section-reassignment pattern; it's low-ceremony and correct for a keyboard/mouse-heavy desktop task. Do not turn this into drag-and-drop — it adds implementation risk for marginal gain on a form-shaped interaction.

**Data changes:** none — pace strip is entirely derived from existing `day_section` values already on `SavedPlace`.

### 5.5 Trip Mode (`/trip-mode/:id`)

**Problem:** The best-executed screen in the app already. Sticky header, full-bleed anchor treatment, section-by-section reveal — this is close to right. The gap: it still asks the user to scroll past everything to find "what's next," which contradicts the "zero decisions" goal in §2.

**Redesign:**
- Add a **"Right now" pin** at the top, above the Anchor section: the first not-done, not-skipped item in priority order (anchor → booked → planned), rendered large, with Map/Tickets actions, and everything else collapsed under a "Full day" disclosure below it. This is the single change that converts Trip Mode from "a nicely designed list" into "a companion." A tired user standing on a street corner should not have to parse six sections to find the next thing.
- Keep the existing full list below the pin for users who want to look ahead (many travelers do want to preview the day) — just don't make it the first thing rendered.
- Do not add anything else — no maps embed, no weather, no live location. Trip Mode's power is restraint; every design concern in this doc pushes toward *less* on this specific screen, not more.

**Data changes:** none — "next item" is a pure derivation from existing `itemStates` + `day_section` ordering.

### 5.6 Logistics → Travel Wallet (`/logistics`)

**Problem:** Grouped by type (flights/hotels/car/tickets/reservations/emergency) is a reasonable organizing principle for browsing, but the wrong one for the actual job-to-be-done, which is "find the thing I need *right now* under time pressure" and "know what's still unresolved." Missing-ref items ("No ref" badge) don't escalate enough — they're the same visual weight as a fully-booked card with a slightly different corner badge.
- The `Trip.route` legs aren't reflected at all — a traveler mid-trip in Costa Brava has to scan past Menorca hotel info and Barcelona tickets to find what's relevant to *today*.

**Redesign:**
- **Add a "Needs attention" section pinned to the top**, always visible when non-empty: every item missing a `confirmation` or `booking_link`, sorted by date proximity. This reuses exactly the `bookedWithoutLinks`-style logic already in `trip-metrics.ts` (generalize it slightly to cover missing `confirmation` too, not just missing `booking_link`).
- Keep type-grouping below that as the secondary/browse view, but make it collapsible by leg (Menorca / Costa Brava / Barcelona) instead of one long page, since a wallet should feel like "cards I have with me," and a traveler wants "everything for where I am."
- Emergency Info card gets a permanently pinned, non-collapsible position (top-right on desktop, first on mobile) — this is the one category where "browsing to find it" is a design failure. It should never require scrolling.
- The "Add Item" button (currently non-functional, no handler) either needs to work or be removed before any portfolio presentation — a dead CTA is a worse impression than no CTA.

**Data changes:** `LogisticsItem` currently has no `leg`/city association beyond a free-text `address` field — grouping by leg requires either (a) inferring city from `address` text matching (fragile), or (b) adding an explicit `city` field to `LogisticsItem` (recommended, see §9).

### 5.7 Packing (`/packing`)

**Problem:** The weakest visual differentiation but the least broken UX. Two flat sections (outfit-by-day cards, then category checklists) with progress bar. It works, but it's disconnected from the rest of the app — nothing links from Trip Mode to "did I pack for this day," and the outfit notes here duplicate `day.outfit_note`, which is *also* shown in Trip Pulse's hero card and could be shown in Trip Mode.

**Redesign:**
- Keep the structure — it's genuinely fine. The fix here is almost entirely visual: apply destination-accent coloring to each day's outfit card by leg (so Menorca outfit notes read visually "beachy," Barcelona reads "city"), consistent with §7.4.
- Add a single cross-link: on Trip Mode, the outfit note row (already rendered) becomes a tap target to `/packing` so the packing list and the trip-mode outfit note are understood as the same fact, not two separate features that happen to agree.
- Do not add a "smart" auto-generated packing list from place categories — explicitly a non-goal (§2); the current curated, hand-written list is a strength, not a placeholder.

**Data changes:** none.

---

## 6. Desktop, tablet, and mobile behavior per primary screen

General rule across all screens: **the sidebar nav (`Navigation.tsx`) is desktop-only (`md:flex`) and becomes a sheet-triggered drawer below `md`.** That pattern is correct and should be kept unchanged. What needs to change is what happens *inside* the content area at each breakpoint.

| Screen | Desktop (≥1024px) | Tablet (640–1023px) | Mobile (<640px) |
|---|---|---|---|
| **Trip Pulse** | Hero card full-width, 3 health strips as a horizontal row below | Hero full-width, health strips stack 2-up | Hero full-width, health strips stack 1-up, hero drops the ambient photo treatment to a flat accent color to preserve contrast at small size |
| **Capture & Triage** | Capture bar + triage queue side-by-side (queue right, ~60%) | Capture bar full-width above, queue below, grid view 2-up when expanded | Capture bar full-width, triage queue is the *default* view (no grid toggle — grid view moves to a "see all" link only, since scanning a grid on a phone recreates the exact overload problem this redesign is solving) |
| **Journey** | Route strip horizontal with all legs visible, days grouped in a 2-column masonry under each leg | Route strip horizontally scrollable if it overflows, days 1-column under each leg | Route strip becomes a horizontally-scrollable chip row (swipeable), days stack 1-column; leg headers become sticky within their scroll section |
| **Day Builder** | 8/4 column split (sections + Nearby Ideas sidebar), pace strip full-width under header | Sections full-width, Nearby Ideas moves below sections (not sidebar) | Same as tablet; section select-dropdowns get larger touch targets (min 44px height, currently `h-8`/`h-9` — too small for mobile, this is a real a11y/touch-target defect today) |
| **Trip Mode** | Constrained to `max-w-lg` centered even on wide viewports — correct today, keep it; this is a mobile-first screen by design, not a desktop dashboard | Same constrained width | "Right now" pin sticky-visible below the header on scroll (not just at top) so it's always reachable with the thumb |
| **Travel Wallet** | Needs-attention row + 2-column type grid | Needs-attention row + 1-column type grid | Needs-attention row first, Emergency card pinned directly under it (not at the bottom of a `sections` array as it is today — currently Emergency renders last because it's last in the `sections` array, which is backwards for a mobile "I need this now" use case) |
| **Packing** | 2-column outfit cards, 3-column packing categories | 2-column outfit cards, 2-column categories | 1-column throughout, checklist items get 44px+ tap targets (current `text-sm` rows with small icon are borderline for a packing-while-distracted use case) |

Cross-cutting mobile requirement: **every touch target currently sized `h-6`/`h-7`/`h-8` for interactive elements (skip button, complete-toggle, select triggers) should move to a minimum 40–44px hit area on screens below 640px**, even if the visual chip stays small — pad the tap target, not necessarily the visible pill.

---

## 7. Visual direction

### 7.1 Concept: Editorial Travel Atlas

Not a dashboard. Not a booking site. The reference point is a well-art-directed travel magazine spread crossed with an atlas/field-guide — confident typography, generous whitespace, a restrained and *intentional* color system tied to place rather than to UI state, and structure that reads as curated rather than generated. Every screen should feel like it was laid out by someone who has actually been to Menorca, not like a template that accepts any trip.

The current app already has half of this instinct (serif headings, cream/espresso palette, italic day_vibe quotes reading like captions) — the redesign leans into that instinct rather than replacing it, and removes the parts that fight it (rainbow badge colors, generic bordered-card repetition, no imagery or geography anywhere).

### 7.2 Typography

- Keep the serif/sans split (`font-serif` headings, `font-sans` body) — it's the single best-executed decision in the current system and should be preserved, not replaced.
- Upgrade the serif from `Georgia` (system fallback, gets no design credit) to a licensed-feeling editorial serif — e.g. **Fraunces** or **Canela**-adjacent open alternative (**Fraunces** is free, variable, and has the right warmth). This is the highest-leverage single typographic change available.
- Body sans stays `Inter` — correct, don't touch.
- Day-vibe / narrative italic copy (`day.day_vibe`, `day.outfit_note`) should consistently use the serif italic as a recurring "caption" voice across Trip Pulse, Journey, Day Builder, and Trip Mode — right now it's italic in some places and plain muted-foreground in others. Standardize it as a named text style, not an inline utility combo repeated ad hoc.

### 7.3 Color system

The current token system (`index.css`) is a good *neutral* base — warm cream background, espresso foreground, single desaturated primary — and should stay as the **structural** palette (backgrounds, borders, chrome, primary CTAs). The problem is entirely in the **semantic/category** layer:

- `Pills.tsx` currently assigns 11 unrelated hue families to categories (orange/purple/stone/indigo/teal/pink/sky/zinc/cyan/violet/blue) and 5 more to status (green/blue/amber/slate/red) — 16 hues total competing with a deliberately muted structural palette. This reads as generated, not curated.
- **Replace category color-coding with icon + neutral treatment.** Category doesn't need a hue — it needs a small monoline icon (already using `lucide-react` everywhere) next to the label, rendered in `muted-foreground`. Save color entirely for **status**, which is the dimension that actually matters for decision-making (booked vs. optional vs. do-not-cram).
- **Reduce status color to 3 semantic tiers**, not 5 arbitrary hues: **Committed** (booked/anchor — primary/espresso), **Planned** (planned/optional — neutral/secondary), **Deprioritized** (backup/do-not-cram — muted, reduced opacity, no border color at all). This maps directly onto the pace-strip concept in §5.4 and makes status legible as *weight*, not just *label*.

### 7.4 Destination accent system

This is the biggest structural gap: **nothing currently ties color or imagery to place**, despite the entire product being organized around a multi-leg route. Introduce a small, fixed accent-per-leg system:

- Each leg of `trip.route` gets one accent hue, chosen editorially per trip (not algorithmically from a hash — hash-derived colors produce muddy, arbitrary results; a human/curator should assign it once per trip, same spirit as choosing a book cover palette). For the Spain 2026 demo: **Menorca → sun-bleached turquoise**, **Costa Brava → terracotta/burnt orange**, **Barcelona → deep ochre/gold**.
- The accent shows up as: the route-strip leg color (Journey), the ambient background tint behind the Trip Pulse hero and Trip Mode header (low-saturation wash, not a solid fill — text contrast must hold against `--foreground`/`--primary-foreground`), and the outfit-card border tint on Packing.
- Implementation: add 1 CSS custom property per leg (e.g., `--accent-menorca`, `--accent-costa-brava`, `--accent-barcelona`) scoped at the trip level, referenced by `TripDay.city` or a new `leg` field (§9). This stays inside the existing `@theme`/CSS-variable pattern already used in `index.css` — no new theming architecture required.

### 7.5 Image and map usage

- `Trip.cover_image` exists in the type and is `null` in mock data — never rendered anywhere. Populate it for the demo trip and render it: as a hero background on Landing's preview card, and optionally a muted crop behind the Trip Pulse hero.
- No screen currently visualizes geography despite `city`/`area`/`area_context` being present on nearly every record. Recommend a **lightweight static route illustration**, not an embedded interactive map (interactive maps are heavy, need API keys/attribution, and fight the "calm" promise) — a simple SVG/illustrated strip showing the leg order with day markers, styled to match the Editorial Atlas concept, used on Journey's header and optionally Landing. This is illustration, not cartography — accuracy is not the goal, orientation is.
- Photography, if used at all, should be treated as editorial accent (a single well-chosen image per leg, cropped consistently), never as decorative filler behind every card — that would contradict "beauty from structure, not decoration."

### 7.6 Elevation, borders, spacing, motion

- **Borders:** the current `border` + `shadow` combo on every `Card` (see `card.tsx`) is the single biggest source of visual monotony — nearly every piece of content on every screen is a bordered rounded rectangle with the same shadow. Reserve `border + shadow` for genuinely elevated/interactive surfaces (the Trip Pulse hero, Trip Mode's anchor card, modals). Everything else should differentiate through **spacing and typography hierarchy**, not repeated card chrome — e.g., Journey's day entries and Wallet's browse-grid items can be border-less rows separated by rules, not individually boxed.
- **Spacing:** keep the current generous vertical rhythm (`space-y-8`/`space-y-10` patterns) — it contributes to the calm feeling and should be preserved, not tightened.
- **Motion:** the existing `animate-in slide-in-from-bottom-4 duration-700 fade-in` entrance on every page-level container is fine as a one-time page-load flourish but should not be the *only* motion in the product. Add: a short (150–200ms) checked/skip-state transition already partially present in Trip Mode (keep it), and a subtle progress-bar fill animation on Packing (already present) — extend the same "state change should animate, page load should be quiet" principle to Day Builder's pace strip when items move sections.

---

## 8. Shared component inventory

Components to **build or formalize** (new, or promoting an ad hoc pattern into a real component):

1. **`PaceStrip`** — segmented load indicator, used on Day Builder and (compact variant) Trip Pulse hero and Journey day entries. New.
2. **`LegAccent` / `useLegAccent(city)`** — resolves a city/leg to its accent CSS variable. New, small utility + provider.
3. **`RouteStrip`** — horizontal leg navigator used on Journey (full) and Trip Pulse (optional compact breadcrumb). New.
4. **`TriageCard`** — single-item triage interaction (assign/skip/discard) for Inbox's queue mode. New, replaces the current inline grid `Card` usage in `Inbox.tsx`.
5. **`StatusTier`** — replaces `StatusPill`'s 5-color badge with the 3-tier Committed/Planned/Deprioritized treatment from §7.3. Modify existing `Pills.tsx`.
6. **`CategoryTag`** — icon + neutral label, replaces `CategoryPill`'s 11-hue badge. Modify existing `Pills.tsx`.
7. **`NeedsAttentionRow`** — used on both Trip Pulse (health strips) and Travel Wallet (missing-confirmation items) — same underlying shape (title, reason, CTA), should be one component, not two bespoke renderings. New, consolidates existing duplicated JSX in `Dashboard.tsx` and `Logistics.tsx`.
8. **`OutfitNote`** — the italic outfit line currently duplicated across `Dashboard.tsx` (hero card), `TripMode.tsx`, and `Packing.tsx` with three slightly different markups. New, single source of truth for rendering.

Components to **keep unchanged**: `Navigation` structural pattern (sidebar/sheet split), `Button`, `Select`, `Input`/`Textarea`, `AddSourceForm`'s field logic (just re-housed behind a collapsed trigger per §5.2), all shadcn primitives not listed above.

Components to **retire**: the current `Card`-everywhere pattern as a default choice — not deleted (still valid for hero/elevated surfaces) but no longer the reflexive wrapper for every piece of content.

---

## 9. State/data changes required vs. purely visual changes

**Purely visual / no data model change** (safe to implement independently, screen by screen):
- All of §7 (typography, color system, borders/elevation/motion) except the leg-accent CSS variables, which need one new mapping.
- Trip Pulse layout simplification (§5.1) — reuses existing `trip-metrics.ts` outputs.
- Journey's route-strip grouping (§5.3) — `trip.route` string can be parsed client-side (`split('→')`) as a first pass without a schema change.
- Day Builder's pace strip (§5.4) — pure derivation from existing `day_section` values.
- Trip Mode's "Right now" pin (§5.5) — pure derivation from existing `itemStates` + section ordering.
- Packing's leg-accent styling and Trip Mode cross-link (§5.7).

**Requires new state or a new `TripContext` action:**
- `deletePlace(placeId: string)` on `TripContext` — Inbox triage's "Discard" action has no way to remove a place today; only `movePlace`/`updatePlace`/`addPlace` exist. This is a real, pre-existing gap, not a redesign-only need — even today's inbox has no way to reject a bad save.
- **Optional but recommended:** an explicit `leg` field on `TripDay` (e.g., `leg: "Menorca" | "Costa Brava" | "Barcelona"`) rather than inferring legs by splitting `trip.route` or matching `city` strings — string-splitting is fragile the moment a trip has a city visited twice (e.g., a return leg) or a route string with inconsistent formatting. This is the one schema addition worth making; everything else in this spec can be built off existing fields.
- **Optional:** a `city` (or `leg`) field on `LogisticsItem` to support Travel Wallet's leg-grouping (§5.6) without parsing free-text `address`.
- **Optional:** populate `Trip.cover_image` and add a `legAccents: Record<string, { hue: string; label: string }>` map on the trip object (or a static config file) for §7.4 — this can also live entirely outside the data model as a small `data/legAccents.ts` config keyed by city, which is simpler and avoids touching `Trip`/`TripDay` types at all.

**Explicitly NOT required:** any backend, any new persistence mechanism beyond localStorage, any drag-and-drop state machine (Day Builder's select-based reassignment is kept), any collaborative/multi-user state.

---

## 10. Accessibility requirements

1. **Touch targets:** every interactive control must have a minimum 44×44px hit area on viewports below 640px, regardless of visual chip size (§6). Current `h-6`/`h-7`/`h-8` controls (Trip Mode skip button, Day Builder section selects, Packing checklist rows) fail this today.
2. **Color is never the only signal.** The 3-tier status system (§7.3) must pair color with an icon or label, not rely on hue alone — this also directly fixes a pre-existing gap (today's 5-hue status pills have no non-color differentiator beyond text, which is *fine* since text is present, but the coming leg-accent washes must maintain the same discipline).
3. **Contrast:** any ambient/wash background introduced behind hero text (Trip Pulse, Trip Mode header, §7.4) must be tested against WCAG AA for the foreground text sitting on it — accent washes should be low-saturation enough that `--primary-foreground`/`--foreground` text remains compliant without per-instance overrides.
4. **Focus order & keyboard access:** Inbox's new triage-queue interaction (§5.2) must be fully operable via keyboard (assign/skip/discard as focusable buttons, not swipe-only) — swipe gestures, if added later for mobile, must have an equivalent keyboard/button path, not replace it.
5. **Motion:** respect `prefers-reduced-motion` for all `animate-in`/transition classes — currently applied uniformly with no reduced-motion fallback; add `motion-reduce:animate-none` (or equivalent) to page-entrance and state-change animations.
6. **Semantic structure:** day sections (Anchor/Booked/Planned/etc.) and Wallet's Needs-Attention row should use proper heading hierarchy and landmark regions so screen-reader users can navigate by section, matching the sighted "structure over decoration" principle.
7. **Form labeling:** `AddSourceForm`'s inputs currently rely on `placeholder` text as the only label (no associated `<Label>`) — the collapsed capture bar redesign (§5.2) must add proper `<Label>`/`aria-label` associations when it ships, this is a pre-existing gap independent of the redesign.

---

## 11. Exact acceptance criteria per page

**Trip Pulse**
- [ ] No repeated day-card grid exists on this page.
- [ ] Exactly one hero surface renders "now/next" info, full-width.
- [ ] Health signals (missing anchors, overloaded days, unsorted saves, missing links) render as a single consolidated list, max height before requiring a "see all" disclosure.
- [ ] A single link routes to Journey for "browse all days."

**Capture & Triage**
- [ ] Capture input is collapsed to one field by default; expands only on interaction.
- [ ] A place can be saved with zero required fields beyond the pasted link/typed name.
- [ ] Triage queue presents one place at a time with Assign/Skip/Discard actions.
- [ ] Discard actually removes the place from state (`deletePlace` implemented and wired).
- [ ] A secondary "see all unsorted" view remains available with existing search/filter.

**Journey**
- [ ] `trip.route` renders as a visible, segmented leg strip — not just plain text in the header.
- [ ] Days are grouped visually under their leg, not one flat list.
- [ ] Each day entry shows a pace indicator (reused from Day Builder's `isOverloaded` logic), not just a place count.
- [ ] Decorative vertical timeline line is removed or replaced by the route strip.

**Day Builder**
- [ ] A pace strip is visible directly under the day_vibe quote, before any section list.
- [ ] Anchor section is visually distinct (not just first-in-order) from Booked/Planned.
- [ ] All section-reassignment selects meet the 44px mobile touch-target minimum.

**Trip Mode**
- [ ] A single "Right now" item is pinned above the full list, computed from the first not-done/not-skipped item in anchor→booked→planned order.
- [ ] The full section list remains available below the pin, collapsed or scrollable, not removed.
- [ ] No new screens, embeds, or decision points are introduced.

**Travel Wallet**
- [ ] A "Needs attention" section is pinned at the top whenever any item lacks a confirmation or booking link.
- [ ] Emergency Info is pinned near the top on all breakpoints, never requiring scroll-to-bottom.
- [ ] "Add Item" is either functional or removed — no dead CTA ships.
- [ ] Type-grouped browse view remains available below the attention row.

**Packing**
- [ ] Outfit cards carry the leg-accent treatment matching Journey/Trip Pulse.
- [ ] Trip Mode's outfit note links to `/packing`.
- [ ] Checklist rows meet the 44px mobile touch-target minimum.

**Cross-cutting**
- [ ] Category color-coding (11 hues) is removed from `Pills.tsx` / `CategoryPill` in favor of icon + neutral treatment.
- [ ] Status is expressed as 3 tiers (Committed/Planned/Deprioritized), not 5 arbitrary hues.
- [ ] `prefers-reduced-motion` is respected on all `animate-in` usages.
- [ ] Heading font is upgraded from `Georgia` fallback to a licensed/self-hosted editorial serif.

---

## 12. Phased implementation plan

**Phase 0 — Foundations (blocks everything downstream)**
- Swap serif font; formalize `StatusTier`/`CategoryTag` components; add leg-accent CSS variables + `data/legAccents.ts` config; add `deletePlace` to `TripContext`.

**Phase 1 — Highest-leverage screen fixes (independently shippable, no data changes beyond Phase 0)**
- Trip Pulse: remove day grid, consolidate hero + health strip.
- Day Builder: add `PaceStrip`.
- Trip Mode: add "Right now" pin.

These three are ordered first because they are the most visible gap between current state and the product promise ("calm you will actually enjoy") and require no new interaction patterns — only layout and derivation changes.

**Phase 2 — Structural rework (larger surface area, still self-contained per screen)**
- Journey: route-strip + leg-grouped day list.
- Travel Wallet: needs-attention row + pinned Emergency + leg grouping.
- Inbox: collapsed capture bar + triage-queue mode (`TriageCard`), keep grid as secondary view.

**Phase 3 — Polish and connective tissue**
- Packing leg-accent styling + Trip Mode cross-link.
- `NeedsAttentionRow`/`OutfitNote` consolidation to remove duplicated JSX across pages.
- Route illustration (§7.5) on Journey header, `cover_image` population + Landing hero treatment.

**Phase 4 — Accessibility and motion audit pass**
- Touch-target sweep, `prefers-reduced-motion` sweep, focus-order verification on the new triage queue, contrast check on all accent washes.

Each phase should be independently demoable — this is a portfolio prototype, and a half-finished Phase 2 should never leave the app in a worse state than the end of Phase 1.

---

## 13. Features to postpone

- **Drag-and-drop day building.** The select-dropdown reassignment pattern is correct for this product's density of information; drag-and-drop adds real implementation and accessibility risk for a marginal interaction-speed gain. Revisit only if user testing specifically flags the current pattern as friction, not because drag-and-drop is expected by default.
- **Interactive/embedded maps.** Static route illustration (§7.5) delivers the orientation benefit without API keys, attribution requirements, or a heavier dependency footprint. An interactive map is worth revisiting only if a future spatial task (e.g., "show me everything within walking distance of the hotel") actually requires it.
- **Multi-trip comparison / trip templates.** Trip Library's second-trip empty state is fine as a placeholder; building real multi-trip management is a different product surface and not needed for portfolio purposes.
- **Second-item discovery features** (recommendations, "places like this"): explicitly against the non-goals in §2 — this product's value is curation of the user's own taste, not algorithmic suggestion.
- **Offline/PWA packaging for Trip Mode.** Genuinely valuable for the real job-to-be-done (on the ground, possibly no signal) but out of scope for a portfolio-stage prototype; flag as the top post-launch roadmap item instead.

---

## 14. Risks of making the interface pretty but less useful

1. **Accent-wash overreach.** The leg-accent system (§7.4) is the single highest-risk addition — if applied too broadly (every card, every badge) it recreates the exact "16 competing hues" problem this spec is trying to fix, just with 3 hues instead of 11. Accent color must stay reserved for orientation surfaces (hero, route strip, outfit cards) and never bleed into functional status indicators, which must stay in the neutral 3-tier system.
2. **Route illustration becoming decoration instead of orientation.** If the static route graphic (§7.5) is beautiful but doesn't actually help a user understand "where am I in this trip," it's failed regardless of craft — it must always co-render with the actual leg/day data, never stand alone as a header image.
3. **Triage queue slowing down power users.** One-at-a-time triage (§5.2) is right for the *first* pass through a large inbox, but a returning user who already knows exactly which 3 places to assign shouldn't be forced through a linear queue every time — the grid/list secondary view must stay genuinely fast to reach (not buried), or this becomes friction dressed up as thoughtfulness.
4. **Pace strip becoming another badge nobody reads.** If `PaceStrip` doesn't visibly change Trip Pulse and Journey's day summaries (i.e., it's only on Day Builder), it fails to do the one thing that matters most: warning the user *before* they open a day that it's overloaded, not after.
5. **Editorial font/serif upgrade increasing load weight or hurting legibility at small sizes.** A heavier variable serif must be subset and tested at the smallest sizes it's used (Journey's compact day-under-leg entries, Wallet's dense card titles) — "editorial" must not come at the cost of scanability on a phone in bright sunlight, which is this product's actual mobile use case.
6. **Losing the current app's one real strength while fixing its weaknesses.** The `day_vibe`/outfit-note editorial copy and the anchor/booked/planned/optional/backup/do-not-cram model are already differentiated and should be *amplified*, not redesigned away in pursuit of novelty. Every recommendation in this document is scoped to make that existing model more visible, not to replace it.
