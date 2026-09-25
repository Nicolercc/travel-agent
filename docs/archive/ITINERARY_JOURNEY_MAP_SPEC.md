# TripCanvas — Journey Map Specification

**Status:** **Planned** — not implemented. MapLibre is **not installed** in the application.  
**Phase:** 3 — Flagship map-led Itinerary.  
**Dependencies:** Phase 2A (domain model) · Phase 2B (Spain structured data) · Phase 2C (readiness validation).  
**Scope:** `artifacts/travel-planner` (React + Vite + Tailwind + wouter, static prototype, localStorage persistence).

**Authoritative references (active work):**

| Concern | Document |
|---|---|
| Visual system | [SOFT_COASTAL_VISUAL_SYSTEM.md](../design/SOFT_COASTAL_VISUAL_SYSTEM.md) — supersedes §12 terracotta/olive/burgundy destination palettes in this file |
| Trip facts | the private master trip note (kept outside the public repository) |
| Day readiness | Phase 1.1 `TripDayKind` + `day-readiness.ts` — logistics-primary for arrival/transfer/departure |
| Sequencing | [PRODUCT_ROADMAP.md](../PRODUCT_ROADMAP.md) |

Source of truth for trip content: the private master trip note (kept outside the public repository) ("the master note"). Where the master note and `src/data/mockData.ts` conflict, the master note wins — conflicts are documented, not silently resolved.

**Active Itinerary direction (summary):** Flagship map-led journey; sticky map on desktop; compact nine-day journey rail; **one expanded selected day**; fixed / flexible / strong-maybe / skip-if-tired / unresolved content; Soft blue–plum map styling; selected route in deep coastal blue; secondary route in dusty lilac; unresolved route in soft plum dashes; ivory route halo; no random transport colors; no decorative autoplay; map consumes structured journey data, not UI prose; fully usable fallback when map fails.

---

## 0. Source conflicts between the master note and `mockData.ts`

This section exists so nothing downstream is built on a fact the app currently gets wrong. Every row is a real discrepancy found by direct comparison; none are invented.

| # | Topic | `mockData.ts` says | Master note says | Resolution |
|---|---|---|---|---|
| 1 | July 28 | No `TripDay` exists for July 28 at all | Full themed day: JFK departure, DL128 6:55 PM | Add a `TripDay` for July 28, `dayType: "flight"`. Trip currently silently starts "mid-flight." |
| 2 | Barcelona↔Menorca flights | `mockLogistics.log-1`: one record, "Flight to Menorca," date `2026-07-28`, time `8:45 AM`, route "Barcelona El Prat → Menorca Airport" | Two distinct flights: DL128 JFK→BCN (departs Jul 28 6:55 PM, **arrives Jul 29 8:45 AM**) and FR7509 BCN→MAH (**departs Jul 29 3:50 PM**, arrives 4:50 PM) | Split into two `TravelLeg` records. The existing record conflates an arrival time with a different route and the wrong date. |
| 3 | Menorca rental car | Absent from `mockLogistics` entirely | DoYouSpain **DEMO-CARMNR1**, Autos Menorca NR, pickup Jul 29 5:00 PM, **voucher return Aug 1 8:00 AM — impossible against the 7:50 AM flight** | Add as a `BookingReference` + `UnresolvedTask` with `priority: "critical"`. This is the single highest-stakes unresolved item in the trip and today it doesn't exist in the app at all. |
| 4 | Barcelona/Costa Brava car | `log-5`/`log-6`: company "Avis," ref `AVIS-48821`, pickup "Avis Blanes Station," return Aug 2 4:00 PM | DoYouSpain **DEMO-CARBCN2**, Drivalia Rent A Car, pickup Barcelona Airport Aug 1 9:00 AM, **voucher return Aug 3 12:00 PM, desired return before 9:00 AM Aug 3** | Replace with correct provider/ref/dates. The return date is off by a full day (Aug 2 vs. Aug 3), and the early-return gap (12:00 PM voucher vs. ~8:30–9:00 AM desired) is itself an `UnresolvedTask`. |
| 5 | Tossa de Mar stay | Missing from `mockLogistics` entirely | **Gran Hotel Reymar**, confirmed, Aug 1–2, Avinguda Mar Menuda s/n | Add as a `BookingReference`/hotel leg. An entire overnight base is currently invisible to the app. |
| 6 | Menorca stay | "Hotel Rural Morvedra Nou," check-in `2026-07-28` 2:00 PM | **holiday rental (condo)**, Carrer de la Mediterrània, Cala en Porter, check-in after 4:00 PM **July 29** | Correct the property type, name, and date. Check-in on Jul 28 is impossible — the traveler is still mid-flight that day. |
| 7 | Airport hotel (Aug 4–5) | `log-4`: `confirmation: null, booking_link: null`, "Still looking for options" | **Confirmed**: Alexandre FrontAir Congress Hotel, phone on file, free shuttle advertised (shuttle *time* not yet reserved) | Mark the stay itself confirmed; keep only "confirm exact shuttle departure" as the unresolved task — currently the whole booking reads as unresolved when it isn't. |
| 8 | Sagrada Família | `place-sagrada`: `status: "booked"`, `booking_link` present, time `4:30 PM` | **"Status: HIGH PRIORITY, NOT BOOKED,"** target ~2:00 PM | This is the most consequential conflict — the app currently tells the user a critical, time-sensitive, sell-out-risk ticket is booked when it is not. Must render as `unresolved`, not `confirmed`. |
| 9 | Els Encants (Aug 4) | `mockDays.day-7` still includes "Mercat dels Encants," `day_section: planned`, 9:00 AM | Encants is **closed Tuesdays**; master note explicitly retires this plan and substitutes bakery + curated vintage shops | Remove Encants from Aug 4's planned events; replace with a `considered`-status vintage/bakery block, not a `planned` one, since the exact shops are still unresolved ("final store list was never fully extracted"). |
| 10 | Cova d'en Xoroi | `mockDays.day-3` (Jul 31) themed "Beach Day / Cova d'en Xoroi," `status: "booked"` | Cova is a **Jul 29 or 30, NOT BOOKED**, strong-maybe, sunset-only. Jul 31's real theme is Binibeca + Cales Coves + packing + resolving the car-return crisis | Move Cova to Jul 29/30 as an unresolved strong-maybe event; rebuild Jul 31 around Binibeca/Cales Coves/packing. |
| 11 | La Roca Village | Absent from `mockDays.day-5` (Aug 2) notes entirely | Explicit **must do**, 2–4 hours, target arrival 3–5 PM | Add as a fixed-window flexible event on Aug 2. |
| 12 | Aug 5 departure timing | "Leave hotel by 10 AM" for a flight that... | ...departs **10:55 AM** — leaving the hotel at 10:00 AM for a 10:55 AM flight is not survivable; master note has wake 6:30–7:00 AM, Terminal 1 target 7:45–8:00 AM | Correct the fixed timeline; this is a factual planning error, not a style choice. |

Every one of these is carried into §11's day-by-day conversion as either a corrected fact, an explicit `unresolved` task, or a documented `considered`-not-`planned` status. None are silently dropped.

---

## 1. Target user jobs served by the Itinerary/Journey Map

Primary user (per `UX_PRODUCT_REDESIGN_SPEC.md` §1, unchanged): the designated planner of a rich, visually- and emotionally-driven leisure trip, planning for people who want a trip that feels good on the ground, not merely logistically complete.

Jobs this screen specifically serves, in priority order:

1. **"Where am I, geographically, in this whole trip?"** — orientation across a multi-leg, multi-transport-mode route (flight → flight → car → train/funicular → flight), not just a list of dates.
2. **"What's actually locked vs. still soft?"** — at a glance, which events are fixed (flight times, hotel check-ins, timed tickets) vs. flexible (a cove choice, an evening option), and which of those flexible slots are unresolved bookings vs. deliberate flexibility.
3. **"What's the emotional shape of this day, and do I have the energy for it?"** — road-trip day vs. soft arrival day vs. full city day read completely differently; the map and rail must communicate pacing, not just geography.
4. **"If I'm tired, what do I actually cut?"** — the must-do / strong-maybe / skip-if-tired hierarchy needs to be visible *before* the day starts, not discovered mid-day.
5. **"What still needs a decision or a booking before I leave?"** — Sagrada Família, Cova d'en Xoroi, the Menorca car-return conflict, Líthica, Montserrat transport — these are trip-critical and currently invisible as a class.
6. **"Show me the trip as something worth being excited about."** — this is also the flagship screen for a portfolio/demo audience; it has to read as a premium travel product, not a scheduling tool.

---

## 2. Why the current stacked-card itinerary fails

`Itinerary.tsx` (current implementation, read in full):

- Renders one vertical list of `Card`s, one per `TripDay`, connected by a decorative gradient line (`Itinerary.tsx:38`). No geography at all — `trip.route` is rendered as a plain string in the header (`Itinerary.tsx:28`) and never visualized.
- Day "completeness" is reduced to a single boolean: `hasAnchor = !!anchor` (`Itinerary.tsx:13,16`). A day with a flight, a car pickup, a hotel check-in, and four flexible stops but no `day_section: "anchor"` place renders identically to a genuinely empty day — a dashed amber border and an `AlertCircle` (`Itinerary.tsx:52,71-75`). This is the exact problem the product correction targets: readiness is not a single anchor-shaped fact.
- Every day card exposes the same three states — `booked` count, `planned` count, anchor — regardless of whether the day is a flight day, a road-trip day, or a mountain day. A flight day has no meaningful "anchor"; a road-trip day's meaningful unit is the sequence of stops, not a count.
- No distinction between **fixed** (a flight departs at 6:55 PM whether you like it or not) and **flexible** (choose Sa Tuna or Aiguablava) events — both would currently just be `SavedPlace` records with a `day_section`.
- No transportation modeling. The trip is fundamentally defined by its transitions — two international flights, two domestic flights, two rental cars with return-time conflicts, a train + funicular to Montserrat, an airport shuttle — and none of this exists as first-class data. `LogisticsItem` has a flat `type` enum (`flight | hotel | car_rental | ticket | reservation | emergency`) with no origin/destination, no coordinates, and no link to the days it spans.
- No must-do / strong-maybe / skip-if-tired hierarchy — `SavedPlace.priority` (`must | high | medium | low`) is a flat scalar that doesn't map cleanly onto the master note's actual three-tier day-of-energy model, and it's never rendered as a hierarchy on Itinerary at all (only via badge color in Day Builder).
- No unresolved-task visibility. The master note's single most load-bearing fact — the Menorca car has an impossible return time before a 7:50 AM flight — has nowhere to live in the current data model or UI.
- `Card`-everywhere visual monotony (already flagged in `UX_PRODUCT_REDESIGN_SPEC.md` §7.6) makes a nine-day, multi-leg trip look like nine identical rounded rectangles.

Net effect: the current Itinerary answers "list the days" and nothing else. It cannot answer "where," "what's locked," "what's the pace," or "what's still at risk" — which are the four things a planner actually opens this screen to check.

---

## 3. New information architecture

```
/itinerary                     Journey Map (replaces the stacked-card list)
  ├── Route header             Trip title, date range, leg summary chips
  ├── TripJourneyMap            Full-trip geographic view (MapLibre)
  ├── JourneyRail                Horizontal, scroll-synced day rail (successor to JourneyRibbon)
  └── SelectedDayPanel          Expandable storytelling panel for the active day
        ├── Day header          Date, dayType badge, energy mode, readiness chip
        ├── Fixed timeline       Flights/trains/check-ins in time order
        ├── Flexible blocks      Grouped by must-do / strong-maybe / skip-if-tired
        ├── Unresolved tasks     Inline, not buried
        └── Map focus            Selecting the day re-frames TripJourneyMap to that day's leg/stops

/day/:id                        Day Builder — unchanged ownership, still the deep-edit surface
/trip-mode/:id                  Trip Mode — unchanged for this phase, becomes a map consumer in a later phase (§13)
```

Key IA decisions:

- **Itinerary becomes the single geographic + narrative source of truth for the whole trip.** Trip Pulse keeps its "what now" job (per the prior spec); Itinerary keeps "what is the shape of this whole trip," now genuinely geographic.
- **The day rail and the map are the same selection state**, not two separate widgets that happen to agree — see §6.
- **Day Builder is unchanged in scope.** It remains the deep single-day editing surface; Journey Map does not duplicate its section-reassignment UI. Journey Map is for orientation and storytelling; Day Builder is for editing.
- **No new top-level route.** `/itinerary` is redesigned in place; no additional nav entry.

---

## 4. Interaction models — desktop, tablet, mobile

### Desktop (≥1024px)

- Map and rail share the top of the page: **map is the dominant surface** (approx. 62% width), rail is a **vertical** list docked right (approx. 38%), not horizontal — desktop has room for a scannable vertical list with more per-row detail (date, title, dayType icon, readiness chip) than the mobile chip format.
- Selecting a rail row cross-fades the map to that day's focus state (§5) and expands `SelectedDayPanel` **below the map**, full width, so fixed/flexible/unresolved content has room to breathe (multi-column where useful: fixed timeline left, flexible tiers right).
- Hover on a map marker highlights the corresponding rail row (and vice versa) — a light two-way affordance, not a hard requirement for functionality.

### Tablet (640–1023px)

- Map on top (reduced height, ~45vh), **horizontal** rail directly below it (matches mobile's rail orientation — tablet doesn't have room for desktop's vertical list without excessive scroll).
- `SelectedDayPanel` renders below the rail, single column.
- Map remains interactive (pan/zoom) but default zoom favors the current leg over the whole-trip view to keep controls reachable with a thumb in portrait tablet use.

### Mobile (<640px)

- **Map is collapsible, not primary.** Default state: a compact "leg strip" (static SVG-quality rendering, reusing the visual language of the existing `RouteVisualization` component but extended to 6 legs — see §12) at the top, ~96px tall, showing the whole route at a glance without needing pan/zoom.
- Tapping the leg strip expands a **full-screen map sheet** (a modal/sheet, not inline) — this avoids fighting the user's scroll gesture with the map's pan gesture, which is the single most common mobile-map failure mode.
- The horizontal `JourneyRail` (successor to `JourneyRibbon`, same `role="tablist"` pattern) sits below the leg strip, unchanged interaction model from the existing implementation (already accessible — see the prior Trip Pulse audit).
- `SelectedDayPanel` is the primary scroll surface — fixed timeline first, then must-do, then strong-maybe, then skip-if-tired, then unresolved tasks, in that order, matching the master note's own per-day structure.
- Playback controls (§8) collapse into a single "Play the journey" button that opens the full-screen map sheet already in playback mode, rather than trying to animate a 96px strip.

---

## 5. Exact map behavior

**Library: MapLibre GL JS.** Evaluated against the alternatives:

- **MapLibre GL JS (recommended).** Open-source, no API key required for the base map when paired with a free-tier vector source (e.g., MapTiler's free tier, or a self-hosted style) or even a static raster fallback. Full GeoJS on support, custom marker/layer control, smooth flyTo/fitBounds camera animation, mature React bindings (`react-map-gl` supports a MapLibre adapter, or use the imperative API directly in a thin wrapper — recommended, see §14). This is the correct tool: the trip needs real pan/zoom/fitBounds camera control over a real coastline, which static SVG illustration (the current `RouteVisualization` approach) cannot do once the geography includes actual coastal route legs, not just three abstract dots.
- **Leaflet.** Viable alternative, lighter weight, but weaker GeoJSON-driven styling ergonomics and no built-in vector tile rendering — would need a raster tile provider, which looks worse for a "premium coastal" visual identity than MapLibre's vector styling (custom water/land color control).
- **deck.gl.** Explicitly not needed. deck.gl earns its complexity for large-scale data visualization (millions of points, GPU-accelerated aggregation). This trip has ~9 days, ~10 travel legs, ~40 point locations. Adding deck.gl here would be over-engineering for the problem size — declined per the technical direction.
- **Static SVG illustration only (current approach, extended).** Kept as the **mobile default/collapsed state and the no-JS/offline fallback** (§17), but not as the primary interactive surface — it cannot do real fitBounds/flyTo camera work or accurately represent the Costa Brava road-trip's actual coastline shape.

### Map data model

- **GeoJSON `FeatureCollection`** for the whole trip, built at build time from the structured data in §9 (not fetched at runtime — this is a static prototype, no backend).
- One `LineString` feature per `TravelLeg` (flight legs rendered as a great-circle-ish curved dashed line even though flights don't literally follow it; car/train/walk legs rendered as an actual routed or straight-line path depending on fidelity available — see below).
- One `Point` feature per `Location` (airports, hotels, coves, landmarks, viewpoints).
- Flight legs use a **synthetic curved arc** (quadratic Bézier approximation between origin/destination coordinates) since real flight paths aren't meaningful at this zoom level — this matches the visual language already established in `RouteVisualization.tsx`'s `Q` curve.
- Road-trip legs (Costa Brava, Aug 1) use **straight-line segments between waypoints** (Blanes → Begur → Tossa) rather than a road-routing API — no backend, no third-party routing dependency; the point-to-point line is honest about the level of fidelity (an illustrated route, not turn-by-turn navigation) and matches the "illustration, not cartography" principle already established for `RouteVisualization` in the prior spec.

### Camera behavior

- **Whole-trip view (default on load):** `map.fitBounds()` over all `Location` coordinates with generous padding, so Menorca, Costa Brava, and Barcelona are all visible at once.
- **Day-selected view:** `map.flyTo()` (or `fitBounds` if the day spans multiple distant points, e.g. the Aug 1 road-trip day) framing that day's relevant locations, ~700ms duration, eased — this is a "purposeful transition," matching the technical direction's Motion guidance (§8).
- **Leg-hover/leg-focus (desktop only):** hovering a `JourneyRail` row previews that day's frame via a faster, subtler camera nudge (300ms) without committing the selection — commit only on click/Enter, matching standard preview-vs-select UX.
- Zoom is clamped per view type: whole-trip view min zoom ~6 (keeps Spain-scale context), day view min zoom ~11 (keeps a town/coastal area legible without ocean-scale emptiness).

### Layers

1. `base` — vector style tuned to the coastal palette (§12): warm limestone land tone, Mediterranean sea blue, no default OSM candy-color roads/POI clutter (custom minimal style, or a filtered subset of a free vector style).
2. `route-legs` — `LineString` layer, styled per transport mode (§7).
3. `route-legs-active` — a duplicate of the selected day's leg(s), rendered with higher opacity/width and a subtle animated dash-offset (respecting reduced motion — see §8) to draw the eye without relying on color alone.
4. `locations` — `Point` layer, custom marker per location kind + status (confirmed/planned/unresolved — see §7 for the marker spec).
5. `locations-selected` — the active day's locations, rendered at a larger size with a halo, on top of the base `locations` layer.

---

## 6. Day selection and map synchronization

**Single source of truth: `selectedDayId` (string), owned by the `Itinerary` page component** (mirrors the existing Trip Pulse pattern in `Dashboard.tsx:47` — reuse the same shape, not a new pattern).

Synchronization contract (all four surfaces read/write the same value, never fork local copies):

```
selectedDayId (string)
   │
   ├─▶ JourneyRail        — aria-selected + roving tabindex driven by selectedDayId (same pattern as
   │                         the existing JourneyRibbon: role="tablist", role="tab", aria-controls)
   ├─▶ TripJourneyMap      — flyTo/fitBounds driven by selectedDayId → resolves to that day's
   │                         TravelLeg + Location set
   ├─▶ SelectedDayPanel    — content driven by selectedDayId, role="tabpanel",
   │                         aria-labelledby={`journey-tab-${selectedDayId}`} (same association
   │                         pattern already implemented correctly in DayPreview.tsx)
   └─▶ URL                 — ?day={dayId} query param (see §15) — not a route param, so the map/
                             rail state is shareable/bookmarkable without changing the page identity
```

- Selection can originate from **any** of the three interactive surfaces (rail click/keyboard, map marker click, "next/previous day" controls in `SelectedDayPanel`) — all three call the same `setSelectedDayId`, there is no primary/secondary hierarchy that could desync.
- Map marker click behavior: clicking a `Location` point that belongs to a day *other* than the currently selected day re-selects that day (marker → day is a many-to-one relationship; clicking any of a day's markers selects that day).
- On mount, `selectedDayId` initializes from the URL query param if present and valid, else from the same "featured day" logic already implemented in `trip-metrics.ts` (`getDashboardFeatureDay`) — reused, not reinvented, so Trip Pulse and Itinerary agree on "today" by default.

---

## 7. Transport modes and visual treatment

| Mode | Line style | Marker | Notes |
|---|---|---|---|
| **Flight** | Dashed curved arc, 2px, leg-accent color at 70% opacity | Custom plane glyph (rotated to bearing), filled circle behind for contrast | Two flights exist: DL128 (Jul 28–29) and the two Ryanair legs (Jul 29, Aug 1) — each a separate `TravelLeg` |
| **Car (rental)** | Solid line, 3px, leg-accent color, subtle drop shadow | Custom car glyph at current/next waypoint | Two rental cars — Menorca (Jul 29–Aug 1) and Costa Brava/Barcelona (Aug 1–3) — each its own `TravelLeg` chain with distinct `bookingRef` |
| **Train (FGC)** | Solid line, 2px, dotted rail-tie texture pattern if MapLibre pattern-fill is feasible; else solid with a subtle dash | Custom train glyph | Plaça Espanya → Monistrol de Montserrat, Aug 3 |
| **Funicular/cable car** | Short steep dashed segment | Custom funicular glyph (distinct from train — a small incline-car icon) | Cremallera or Aeri, Aug 3, optional Sant Joan/Santa Cova sub-legs |
| **Walking** | Thin dotted line, 1.5px, neutral gray (walking legs are not leg-accent colored — they're connective tissue, not a "leg" of the trip) | No marker (implied by proximity) | e.g., Barcelona terminal transfer on foot to the shuttle stop, Montserrat viewpoint walks |
| **Shuttle/transfer** | Thin dashed line, neutral gray | Small shuttle-bus glyph | Airport inter-terminal shuttle (Jul 29), FrontAir hotel shuttle (Aug 5) |
| **Stay (no movement)** | N/A | Custom "pin + roof" hotel/stay glyph, colored by leg accent, larger than point-of-interest markers | Airbnb, Gran Hotel Reymar, InterContinental, Alexandre FrontAir — these anchor the map as much as any activity |

**Marker status treatment (independent of mode — layered on top):**

- `confirmed` — solid fill, full opacity.
- `planned` — solid fill, 85% opacity, no additional decoration (this is the default "normal" state — most events are `planned`, not `confirmed`, and that's fine; `planned` should not look alarming).
- `considered` — outlined only (stroke, no fill), signaling "not committed" without using a warning color.
- `unresolved` — solid fill **plus** a small corner badge (an exclamation glyph, not color alone — satisfies "no meaning through color alone") and a warmer accent ring. Applied uniformly to **any** location/event/leg whose `PlanStatus` is `unresolved` — this is a status-level treatment, not a priority-level one. Examples in this trip include Sagrada Família and the Menorca car return (`priority: critical`) as well as Cova d'en Xoroi and the Barcelona/Costa Brava car's early return (`priority: high`) — all four get the same marker badge; it is `SelectedDayPanel`'s `UnresolvedTaskBanner` (§14), not the map marker, that differentiates severity (persistent and non-dismissible for `critical`, dismissible-once-resolved for `high`/`medium`/`low`). Not every "considered" idea gets this treatment — `considered` is its own, calmer outline-only state — see §9 status model.

This satisfies the accessibility requirement directly: status is never carried by hue alone (glyph + fill/outline/badge combination), matching the discipline already established for `StatusTier`/`CategoryTag` in the prior redesign spec.

---

## 8. Playback behavior

**Purpose:** let a viewer (the traveler, or someone the trip is being shown to) watch the whole nine-day arc unfold geographically, rather than manually clicking through each day — this is the single most "flagship demo" feature in the spec, and it should be genuinely delightful, not a gimmick.

### Standard behavior (motion allowed)

- A "Play the journey" control (desktop: a small transport-style play button near the rail; mobile: the single button that opens the full-screen map sheet in playback mode, per §4).
- On play: `selectedDayId` advances automatically through the 9 days in order, each day holding for a duration proportional to its content density (a flight day holds shorter than a five-stop road-trip day — target 2.5–4.5s per day, tunable), with the existing `flyTo` camera transition between them (§5) providing the actual motion.
- Use **Motion** (per technical direction) for the non-map chrome that needs to animate in sync: the `SelectedDayPanel` content cross-fades/slides (not the map itself — MapLibre owns its own camera animation, Motion should not fight it) and the active `JourneyRail` chip's progress indicator (a thin fill bar under the active chip showing time-until-advance) is a Motion-driven value.
- Playback is **pausable at any time** by clicking any rail day directly (this exits playback and behaves as a normal manual selection) or a dedicated pause control.
- Playback does not loop by default — it stops on day 9 (Aug 5) and shows a subtle "replay" affordance.

### `prefers-reduced-motion` behavior

- The `flyTo` camera animation duration drops to near-zero (MapLibre supports `essential: true` / instantaneous `jumpTo` in place of `flyTo` when reduced motion is detected) — the camera still moves to the correct frame, it just doesn't animate the pan/zoom tween.
- The `JourneyRail` progress-fill indicator is replaced by a static "N/9" counter — no continuously animating fill bar.
- `SelectedDayPanel` content changes via an instant swap (no cross-fade/slide), matching the same `motion-safe:` discipline already correctly established in `index.css`'s `trip-pulse-enter` utility from the previous phase.
- Auto-advance **timing itself is preserved** (day N still holds for its duration and then advances) — reduced motion means "don't animate the transition," not "don't have playback." This mirrors the existing codebase convention of guarding `animate-in`/transform classes with `motion-safe:`, not removing the underlying interaction.
- Detection: standard `window.matchMedia("(prefers-reduced-motion: reduce)")`, read once at mount and via a change listener (users can toggle OS-level reduced motion mid-session).

---

## 9. Structured data model

All types are additive — none of the existing `SavedPlace`/`TripDay`/`LogisticsItem` shapes need to be deleted; the itinerary system reads a richer parallel model and Day Builder/Trip Mode continue reading the existing `SavedPlace` model unchanged in this phase (convergence is a later-phase concern, §13/§21).

```ts
// ── Enums ──────────────────────────────────────────────────────────────────

export type DayType =
  | "flight"      // a day whose primary structure is international/domestic air travel
  | "arrival"     // landing into a new base, soft by design, not "empty"
  | "experience"  // a day organized around one or two defining activities (coves, Ciutadella)
  | "road-trip"   // a day defined by multiple geographically sequential stops + a drive
  | "city"        // a day based in one city with multiple flexible options
  | "mountain"    // a day involving elevation change / alternate transport (Montserrat)
  | "departure";  // the final transition home

export type EnergyMode =
  | "controlled"       // deliberately paced, low emotional/physical demand (travel days)
  | "soft"             // gentle, adaptable, no pressure to perform (arrival/packing days)
  | "soft-adaptable"    // soft but with real content available if energy allows
  | "medium"           // a normal day, some structure, some flex
  | "full"             // high content density, requires real energy
  | "full-controlled"; // high content but time-boxed by hard transitions (travel + activity combined)

export type EventTier = "must-do" | "strong-maybe" | "skip-if-tired";

export type PlanStatus =
  | "confirmed"   // booked, reference on file
  | "planned"     // in the working itinerary, not necessarily reserved
  | "considered"  // researched/optioned, not committed
  | "unresolved"; // requires a decision or booking before it can be trusted

export type TransportMode =
  | "flight" | "car" | "train" | "funicular" | "cable-car" | "walk" | "shuttle" | "ferry";

// ── Core entities ────────────────────────────────────────────────────────────

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface Location {
  id: string;
  name: string;
  kind:
    | "airport" | "hotel" | "beach" | "town" | "landmark"
    | "viewpoint" | "restaurant" | "shop" | "nightlife" | "nature";
  city: string;          // matches existing TripDay.city / SavedPlace.city vocabulary
  region: "Menorca" | "Costa Brava" | "Barcelona" | "Transit"; // aligns with the existing leg-accent
                          // system for the three Spain legs; "Transit" covers non-Spain / connective
                          // locations that have no leg accent — JFK (day-0, day-8) is the only instance
                          // in this trip. "Transit" locations render with the neutral gray transport
                          // treatment from §7, never a leg-accent color.
  coordinates: GeoPoint;
  address?: string;
}

export interface BookingReference {
  id: string;
  provider: string;               // "Delta", "Ryanair", "DoYouSpain / Drivalia", "Cova d'en Xoroi", ...
  confirmationNumber: string | null; // null when status is "unresolved"
  status: PlanStatus;
  bookingLink?: string | null;
  notes?: string;
}

export interface TravelLeg {
  id: string;
  dayId: string;                  // primary day this leg is associated with (departure day)
  mode: TransportMode;
  fromLocationId: string;
  toLocationId: string;
  departure?: { time: string; date: string } | null; // date is a DateOnlyString, reuses src/lib/dates.ts
  arrival?: { time: string; date: string } | null;
  bookingRefId?: string | null;   // references BookingReference.id
  status: PlanStatus;
  label: string;                  // "DL128 · JFK → BCN"
}

export interface ItineraryEvent {
  id: string;
  dayId: string;
  locationId: string;
  title: string;
  fixed: boolean;                 // true = hard time commitment (flight, timed ticket, check-in);
                                   // false = flexible (choose Sa Tuna or Aiguablava)
  tier: EventTier | null;         // null only for purely logistical fixed events (e.g. a car return
                                   // isn't "must-do" tourism content, it's a constraint — see readiness §10)
  status: PlanStatus;
  timeWindow?: { start: string; end?: string } | null; // "2:00 PM" style, or a range
  durationMinutes?: number;
  bookingRefId?: string | null;
  notes?: string;
  energyCost: "low" | "medium" | "high"; // feeds pace/readiness math, distinct from EnergyMode (day-level)
}

export interface UnresolvedTask {
  id: string;
  dayId: string;
  label: string;
  priority: "critical" | "high" | "medium" | "low"; // "critical" reserved for trip-breaking conflicts
                                                       // (e.g. the Menorca car-return/flight conflict)
  relatedBookingRefId?: string | null;
  relatedEventId?: string | null;
}

export interface JourneyDay {
  id: string;                     // "day-0" (Jul 28) through "day-8" (Aug 5) — see §11 for the id shift
  date: string;                   // DateOnlyString
  dayType: DayType;
  title: string;
  emotionalTheme: string;         // the master note's "Theme:" line, verbatim in spirit
  energyMode: EnergyMode;
  originLocationId: string | null;
  destinationLocationId: string | null;
  overnightBaseLocationId: string | null; // null only for Jul 28 (in-flight, no base yet)
  fixedEventIds: string[];
  flexibleEventIds: string[];
  legIds: string[];
  unresolvedTaskIds: string[];
  dayVibe: string;                // preserved narrative-voice field, same role as existing TripDay.day_vibe
  outfitNote: string | null;      // preserved from existing TripDay shape
}
```

**Why `ItineraryEvent.tier` is nullable, and why fixed ≠ tiered:** the master note's must-do/strong-maybe/skip-if-tired hierarchy applies to *experiential* content (a cove, a viewpoint, a bar), not to logistics (a car return, a terminal transfer). Forcing a car-return task into "must-do" would be technically true but semantically wrong — it's not tourism content, it's a constraint. Readiness logic (§10) treats fixed logistics and tiered experiences as separate inputs.

**Cross-day display vs. entity ownership:** several entities in §11 legitimately appear on two days — `leg-dl128` is listed under both day-0 (departure) and day-1 (arrival); the Menorca car-return `UnresolvedTask` is listed under both day-3 (the decision) and day-4 (its execution). `TravelLeg.dayId` and `UnresolvedTask.dayId` are singular and denote **primary/owning attribution only** (used for default sort order and "which day is this fact really about"). `JourneyDay.legIds`, `fixedEventIds`, `flexibleEventIds`, and `unresolvedTaskIds` are **independently authored reference arrays**, not derived by filtering every entity's `dayId` against the day — a day's arrays may include an id whose own `dayId` points elsewhere, by design, whenever §11 calls for cross-day visibility. Phase 0's data-authoring step (§19) must populate these arrays explicitly, not generate them by a `dayId` filter.

**Mapping the requested data categories onto the types above, for traceability:** "accommodations" is not a separate interface — it is the combination of a `Location` with `kind: "hotel"`, a `BookingReference` for that stay, and the owning day's `overnightBaseLocationId` pointer. A dedicated `Accommodation` type would only duplicate those three facts. Separately, "optional" (as named in the original request's confirmed/planned/optional/considered vocabulary) is **not** a `PlanStatus` value here — it is expressed at the tier level (`EventTier: "strong-maybe" | "skip-if-tired"`), since in this trip's data "an activity is optional" and "a booking's confirmation state" are orthogonal facts (a strong-maybe activity can still be `confirmed`, `considered`, or `unresolved`). `PlanStatus` uses `unresolved` in place of a bare "optional" precisely to keep those two axes from collapsing into one ambiguous value.

---

## 10. Readiness logic by day type

**Product correction implemented directly here:** no day type computes readiness from "does it have an anchor." Each `DayType` has its own readiness formula, all returning the same `ReadinessStage` shape (`"needs-attention" | "in-progress" | "ready"`) already established in `trip-metrics.ts` so Trip Pulse can consume these without inventing a second vocabulary.

```ts
export interface DayReadiness {
  dayId: string;
  stage: "needs-attention" | "in-progress" | "ready";
  summary: string;               // human-readable, day-type-specific
  blockingTasks: UnresolvedTask[]; // tasks with priority "critical" or "high" only
}
```

| Day type | Readiness inputs | Formula (informal) |
|---|---|---|
| **flight** | All `TravelLeg`s of mode `flight`/`shuttle` on this day have `status: confirmed` or `planned`; zero `critical` unresolved tasks | `ready` iff every leg has a real confirmation number **and** no critical unresolved tasks reference this day. A flight day is never judged by "anchor" — it has no anchor concept. |
| **arrival** | Overnight base `BookingReference.status`; any `fixed` events (e.g., car pickup) confirmed/planned; any `high`/`critical`-priority `UnresolvedTask` referencing this day, even one tied to a flexible/strong-maybe event | `ready` iff the night's stay is `confirmed`, all `fixed` events are `confirmed`/`planned`, **and** no `high`/`critical`-priority `UnresolvedTask` is open. **Which** cove, **which** layover option, **which** evening plan are open *choices* and are explicitly **excluded** from readiness. A missing *booking* on strong-maybe content (e.g., Cova d'en Xoroi not yet reserved) is not the same as an open choice — it still downgrades the stage. Softness is about pacing, never about hiding a real booking gap. |
| **experience** | At least one `must-do` event with `status !== "unresolved"`; overnight base confirmed | `ready` iff the day has ≥1 committed must-do experience and no critical unresolved tasks. A day can be `ready` with zero `confirmed` bookings if its must-do content is genuinely just "go to this beach," which requires no booking — booking-status and readiness are related but not identical. |
| **road-trip** | All waypoint `Location`s resolved (no missing coordinates); rental car `BookingReference` confirmed; overnight base at the destination confirmed | `ready` iff the car is confirmed, the destination stay is confirmed, and the route sequence is non-empty. Individual stop choices (Sa Tuna vs. Aiguablava) are explicitly flexible and do not block readiness. |
| **city** | Overnight base confirmed; zero `critical` unresolved tasks tied to must-do events | `ready` iff base is confirmed and no must-do event is `unresolved`. A city day's strong-maybes and considered options never block readiness — that's the entire point of "strong maybe." |
| **mountain** | Transport leg (train/funicular) `status !== unresolved`; a confirmed or planned return-transport reference exists | `ready` iff the outbound and return transport are at least `planned` (full `confirmed` not required — FGC doesn't require advance booking) and no critical task (e.g., "confirm last descent") is still open. |
| **departure** | Final transport leg confirmed; airport-hotel/shuttle confirmed if applicable | `ready` iff the international departure leg is `confirmed` and any shuttle/transfer dependency is at least `planned`. |

**General rule across all seven day types, not just arrival:** a `high`/`critical`-priority `UnresolvedTask` always counts against readiness, regardless of whether it's attached to a `fixed` or `flexible` event. This is why day-4 and day-6 read `in-progress` on carried-over tasks even though their own formulas only mention "confirmed" bookings — the carried task is the actual blocker, not the day type's normal flexible content. Only the *choice itself* (which cove, which evening option) is excluded; a real booking gap never is, no matter which tier it's attached to.

**Explicit non-input, every day type:** presence or absence of a `day_section: "anchor"` place, or any single "anchor" concept at all. The word "anchor" does not appear in this readiness model — it's retired for Itinerary/Journey Map. (Day Builder's existing anchor concept is untouched in this phase; see §21.)

**Aggregate trip readiness** (consumed by Trip Pulse) = the existing `computeTripReadiness` pattern, extended with one new dimension: `"Days ready: N of 9"` computed from the table above, replacing any future temptation to reuse the old `anchoredDays / days.length` ratio from `trip-metrics.ts:280`.

---

## 11. Every July 28 – August 5 day, converted

Day IDs are renumbered `day-0` through `day-8` to include July 28 (currently missing — see §0 conflict #1). If preserving existing IDs is preferred for migration simplicity, `day-1` through `day-8` can stay as-is and July 28 becomes `day-0`, inserted before today's `day-1` — either works; the important fix is that **July 28 must exist as a day**.

---

### day-0 · Tuesday, July 28 — JFK Departure

- **Day type:** `flight`
- **Title / theme:** "Transition Into Travel Mode" — controlled and calm, not yet Spain.
- **Origin → destination:** New York (JFK) → in-flight (no destination location yet; arrival is day-1)
- **Overnight base:** none (in-flight overnight)
- **Fixed events:** Arrive JFK 3:45–4:15 PM · Check in for DL128 · Depart JFK 6:55 PM
- **Flexible events:** none — this is a pure logistics day by design
- **Travel legs:** `leg-dl128` (flight, JFK → BCN, departs Jul 28 6:55 PM, arrives Jul 29 8:45 AM — spans midnight, owned by day-0 as the departure day)
- **Map locations:** JFK (airport)
- **Selected-day route:** single point (JFK) plus the outbound arc of `leg-dl128` previewing into day-1's frame
- **Must do:** Check in for DL128; board with valuables and one fresh outfit in personal item
- **Strong maybe:** — (none; this day is intentionally unstructured beyond logistics)
- **Skip if tired:** Staying awake through the whole flight for entertainment
- **Unresolved tasks:** "Complete Delta online check-in when it opens" (`priority: medium`)
- **Booking dependencies:** `DL128` — confirmed
- **Energy mode:** `controlled`
- **Readiness:** `ready` (flight confirmed, no critical unresolved tasks)
- **Warnings/conflicts:** none
- **Mobile presentation:** Single fixed-event card ("Depart JFK 6:55 PM"), no rail expansion needed, map shows JFK only
- **Map presentation:** Zoomed to JFK + a preview arc toward Barcelona; whole-trip view still accessible via pinch-out

---

### day-1 · Wednesday, July 29 — Barcelona Arrival, Layover, Menorca Arrival

- **Day type:** `arrival`
- **Title / theme:** "Long-Haul Arrival, Airport Reset, Cinematic Menorca Introduction" — soft and adaptable.
- **Origin → destination:** Barcelona (BCN, in transit) → Cala en Porter, Menorca
- **Overnight base:** Cala en Porter holiday rental — **confirmed** (correcting §0 conflict #6)
- **Fixed events:** DL128 arrives BCN T1 8:45 AM · Terminal 1→2 shuttle transfer · FR7509 departs T2 3:50 PM · Arrives Menorca 4:50 PM · Menorca car pickup 5:00 PM
- **Flexible events:** Layover Option A (lounge/recovery — eat a real, substantial meal; if Canudas Terminal 2 lounge access is confirmed, rest there rather than in the terminal seating) / B (luggage storage + one compact, geographically tight Barcelona micro-visit, back at T2 by ~1:15 PM or earlier) / C (airport-only survival mode) — mutually exclusive, chosen day-of based on energy and flight punctuality
- **Travel legs:** `leg-dl128` (arrival half, from day-0) · `leg-t1-t2-shuttle` (shuttle, walk+shuttle) · `leg-fr7509` (flight, BCN→MAH) · `leg-car-menorca-pickup` (car, airport → Cala en Porter)
- **Map locations:** BCN Airport (T1 + T2), Menorca Airport, Cala en Porter (stay)
- **Selected-day route:** BCN → MAH arc, then a short driving line MAH → Cala en Porter
- **Must do:** Make the terminal transfer; catch the Menorca flight; pick up the car; check in; eat
- **Strong maybe:** Cova d'en Xoroi sunset session — **only if** energy ≥7/10, car pickup smooth, session timing fits (moved here from `mockDays.day-3`, correcting §0 conflict #10)
- **Skip if tired:** Leaving the airport during the layover (i.e., default to Option A/C over B); dressing up for a late cave-club night; any pressure to "start the trip perfectly"
- **Unresolved tasks:** Cova d'en Xoroi reservation (`priority: high`, not yet booked); Canudas lounge eligibility/guest access (`priority: low`)
- **Booking dependencies:** `DL128` confirmed · `FR7509` confirmed (ref DEMO-FR4K2Q) · Menorca car `DEMO-CARMNR1` confirmed-but-conflicted (see day-3) · Cala en Porter stay confirmed
- **Energy mode:** `soft-adaptable`
- **Readiness:** `in-progress` — flights, car pickup, and the stay are all confirmed, and the layover A/B/C choice is correctly excluded from readiness (that's an open choice, not a gap). What actually keeps this day at `in-progress` is the `high`-priority Cova d'en Xoroi `UnresolvedTask` — a real booking gap on strong-maybe content, per §10's general rule. If the Cova reservation is made (or explicitly deferred past this day), day-1 recomputes to `ready`.
- **Warnings/conflicts:** None yet for this specific day (the car-return conflict surfaces on day-3/day-4, not here) — but the Cova reservation gap is visible as an `unresolved` task starting today since it's a valid target day
- **Mobile presentation:** A three-option flexible block (A/B/C) rendered as a single-select choice card, not three separate list items — matches how the master note actually frames it (one decision, three modes)
- **Map presentation:** Full BCN→Menorca arc as the hero frame; Cala en Porter marker highlighted as the day's destination

---

### day-2 · Thursday, July 30 — Menorca Coves, Culture, and Ciutadella

- **Day type:** `experience`
- **Title / theme:** "Turquoise Water, Scenic Driving, Ciutadella After Dark" — full but not frantic.
- **Origin → destination:** Cala en Porter → coves (south coast) → Ciutadella → Cala en Porter
- **Overnight base:** Cala en Porter (unchanged)
- **Fixed events:** none — this is the trip's most genuinely flexible day
- **Flexible events:** Choose max 2 of {Cala Mitjana, Cala Macarella/Macarelleta, Cala Turqueta} · Optional Líthica (60–90 min) · Ciutadella evening · Optional boat-day alternative (mutually exclusive with the land-cove plan)
- **Travel legs:** `leg-drive-coves` (car, Cala en Porter → coves), `leg-drive-ciutadella` (car, coves → Ciutadella), `leg-drive-return` (car, Ciutadella → Cala en Porter)
- **Map locations:** Cala Mitjana, Cala Macarella, Cala Macarelleta, Cala Turqueta, Líthica, Ciutadella (old town + harbor)
- **Selected-day route:** a loop — Cala en Porter → 1–2 cove pins → Líthica (optional) → Ciutadella → back
- **Must do:** One excellent water experience; Ciutadella evening
- **Strong maybe:** Second cove; Líthica; Cova sunset (backup slot if not used day-1)
- **Skip if tired:** Second cove; Líthica; any long remote-beach hike; forcing both boat and land plans into one day
- **Unresolved tasks:** Boat-day decision (`priority: medium` — cost/weather-dependent, explicitly optional per master note); Líthica ticket/hours confirmation (`priority: low`)
- **Booking dependencies:** none required for the default land plan; boat alternative would add a new `BookingReference` if chosen
- **Energy mode:** `full`
- **Readiness:** `ready` — no fixed logistics block this day; readiness for an `experience` day requires ≥1 committed must-do (Ciutadella evening qualifies) with no critical unresolved tasks, which holds
- **Warnings/conflicts:** "Do not add three more beaches after this pair" — surfaced as a soft guardrail in the `SelectedDayPanel`, not a blocking warning
- **Mobile presentation:** Cove options rendered as a horizontally swipeable choice set (max 2 selectable), Ciutadella as a single anchored evening card
- **Map presentation:** South-coast loop framed with all three cove options visible, even though only 1–2 will be chosen — lets the user see the tradeoff spatially

---

### day-3 · Friday, July 31 — Binibeca, Cales Coves, Final Swim, Packing

- **Day type:** `experience` (soft)
- **Title / theme:** "Whitewashed Architecture, a Final Soft Coastal Day, Calm Departure Prep" — soft energy.
- **Origin → destination:** Cala en Porter → Binibeca Vell → Cales Coves (or nearby) → Cala en Porter
- **Overnight base:** Cala en Porter (last night)
- **Fixed events:** **Menorca car-return decision must be executed tonight** (this is the day's real fixed constraint, even though it's not a clock-timed "event" — modeled as a `fixed: true` `ItineraryEvent` with no time window, tier `null`, since it's logistics, not tourism, per §9)
- **Flexible events:** Binibeca Vell wander (1–1.5 hrs) · Cales Coves or nearby final swim · Naveta des Tudons (considered, optional, only if it fits) · Terrace wine/vermouth or quiet dinner
- **Travel legs:** `leg-drive-binibeca`, `leg-drive-cales-coves`, `leg-drive-return-cep`
- **Map locations:** Binibeca Vell, Cales Coves, Cala en Porter
- **Selected-day route:** short south-coast loop, visually calmer/shorter than day-2's
- **Must do:** Binibeca; pack; **resolve the car return**
- **Strong maybe:** Cales Coves; final swim
- **Skip if tired:** Boat day (if not used day-2); north-coast beaches; Es Grau kayaking; multiple archaeological stops
- **Unresolved tasks:** **Menorca car return vs. 7:50 AM flight conflict** (`priority: critical` — the only `critical`-priority task in the entire trip; the voucher return time of 8:00 AM Aug 1 is literally after the flight departs) — this is the headline `unresolved` marker on the map for this leg, and it must render distinctly (§7's `unresolved` badge) on both day-3 and day-4, since it's a decision made on day-3 that executes on day-4
- **Booking dependencies:** `DEMO-CARMNR1` (Menorca car) — confirmed booking, **unresolved logistics**
- **Energy mode:** `soft`
- **Readiness:** `needs-attention` — this is the one `arrival`/`experience`-family day that is correctly flagged as not-ready, because the car-return conflict is a real, trip-breaking unresolved task, not a soft-day false positive. This is the readiness system working as intended: day-3 is genuinely at risk, unlike day-1's soft layover ambiguity, which is not.
- **Warnings/conflicts:** **Hard conflict, must resolve before sleeping**: voucher return 8:00 AM Aug 1 vs. flight departure 7:50 AM Aug 1. Rendered as a persistent, non-dismissible banner in `SelectedDayPanel` for day-3, not just a list item.
- **Mobile presentation:** The car-return conflict renders above the fold, before Binibeca — logistics-critical unresolved tasks always sort first in the mobile stack regardless of chronological order within the day
- **Map presentation:** Cala en Porter stays centered; the Menorca Airport marker is shown with the `unresolved`/critical badge even though the actual drive to the airport is technically day-4's leg — cross-day visibility for critical tasks is intentional (§9's `UnresolvedTask.relatedBookingRefId` allows a task to be referenced from an adjacent day's panel)

---

### day-4 · Saturday, August 1 — Menorca to Barcelona, Costa Brava Road Trip

- **Day type:** `road-trip`
- **Title / theme:** "Transition, Botanical Beauty, Catalan Coastal Elegance, Tossa Soft Luxury" — full travel day.
- **Origin → destination:** Cala en Porter → Menorca Airport → Barcelona Airport → Blanes → Begur → (Sa Tuna or Aiguablava) → Tossa de Mar
- **Overnight base:** Gran Hotel Reymar, Tossa de Mar — **confirmed** (correcting §0 conflict #5, which had this stay missing entirely)
- **Fixed events:** Wake 5:00–5:30 AM · Car return ~6:00–6:30 AM (executing day-3's resolved decision) · FR6882 departs 7:50 AM · Arrives BCN T2 8:45 AM · Drivalia pickup 9:00 AM · Realistic road departure ~10:00–10:30 AM
- **Flexible events:** Marimurtra Botanical Garden (1.5–2 hrs) · Begur old town + lunch (2–3 hrs) · one cove (Sa Tuna or Aiguablava) · Tossa evening (Vila Vella, dinner, gelato, hotel pool/spa)
- **Travel legs:** `leg-fr6882` (flight, MAH→BCN) · `leg-car-pickup-drivalia` (car, BCN Airport, start of the second rental) · `leg-drive-marimurtra`, `leg-drive-begur`, `leg-drive-cove`, `leg-drive-tossa` (sequential road-trip legs, all mode `car`)
- **Map locations:** Menorca Airport, Barcelona Airport, Marimurtra (Blanes), Begur, Sa Tuna, Aiguablava, Tossa de Mar (Gran Hotel Reymar)
- **Selected-day route:** the trip's longest single-day route — this is the canonical "road-trip day" map frame, `fitBounds` across all five stops rather than a single `flyTo` target
- **Must do:** Marimurtra; Begur; Tossa night
- **Strong maybe:** One cove (Sa Tuna or Aiguablava)
- **Skip if tired:** A second cove; long coastal walks; any detour that creates a rushed hotel arrival
- **Unresolved tasks:** Confirmation that the Menorca car-return plan from day-3 actually executed cleanly (`priority: high`, resolves day-3's critical task retroactively — modeled as the same `UnresolvedTask` id, just displayed on both days until marked resolved)
- **Booking dependencies:** `DEMO-CARBCN2` (Drivalia, Barcelona/Costa Brava car) confirmed · Gran Hotel Reymar confirmed
- **Energy mode:** `full-controlled`
- **Readiness:** `in-progress` until the day-3 car-return task is confirmed resolved; `ready` once it is, since the destination stay and rental are both confirmed and the road-trip readiness formula doesn't require the specific cove choice to be locked
- **Warnings/conflicts:** "If arrival to Tossa runs later than planned, skip another cove rather than sacrifice the Tossa evening" — rendered as day-of guidance text in `SelectedDayPanel`, not a hard system warning
- **Mobile presentation:** A true sequential itinerary — this is the one day where the mobile view should feel like following a route, with each stop as a card in visual sequence matching the map's line direction
- **Map presentation:** The whole five-stop arc is the hero frame for this day; playback (§8) should hold noticeably longer on this day than on lighter days given its content density

---

### day-5 · Sunday, August 2 — Tossa Morning, La Roca Village, Barcelona

- **Day type:** `city`
- **Title / theme:** "Slow Seaside Morning, Shopping, a Gentle Barcelona Landing" — medium energy.
- **Origin → destination:** Tossa de Mar → La Roca Village → Barcelona
- **Overnight base:** InterContinental Barcelona — confirmed, check-in after 3:00 PM
- **Fixed events:** Hotel checkout by 11:00 AM (Gran Hotel Reymar standard) · InterContinental check-in after 3:00 PM
- **Flexible events:** Tossa morning coffee/Vila Vella/optional Mar Menuda swim · Optional Camí de Ronda S'Agaró (only if energy ≥7/10) · **La Roca Village (2–4 hrs, target arrival 3–5 PM)** — restored per §0 conflict #11 · Evening choice: hotel spa/pool reset, Montjuïc sunset, or Poble-sec tapas
- **Travel legs:** `leg-drive-la-roca` (Tossa → La Roca Village) · `leg-drive-bcn` (La Roca Village → InterContinental)
- **Map locations:** Tossa de Mar, La Roca Village, InterContinental Barcelona, Montjuïc (evening option)
- **Selected-day route:** Tossa → La Roca → Barcelona, a clear westward/southward transition line
- **Must do:** La Roca Village; InterContinental check-in
- **Strong maybe:** Vila Vella morning; Montjuïc sunset
- **Skip if tired:** S'Agaró walk; Gothic Quarter at night; any club/late speakeasy
- **Unresolved tasks:** InterContinental parking rate/garage confirmation (`priority: low`) — "Parking Sotano" explicitly flagged in the master note as an unconfirmed, non-actionable lead, not a real plan
- **Booking dependencies:** InterContinental confirmed; DIVA/tax-free paperwork process for La Roca purchases (informational, not a booking)
- **Energy mode:** `medium`
- **Readiness:** `ready` — overnight base confirmed, must-do (La Roca) requires no booking, no critical unresolved tasks
- **Warnings/conflicts:** "Do not add Cala Pola and a long S'Agaró walk if La Roca shopping matters" — mutually-exclusive flexible options, surfaced as a choice, not two independent items
- **Mobile presentation:** La Roca Village gets a dedicated, larger card (it's the day's must-do and it's shopping-specific — worth a DIVA/tax-free reminder inline) rather than being flattened into a generic stop list
- **Map presentation:** Three-point transition frame (Tossa → La Roca → Barcelona); evening options render as pins around the InterContinental marker once the day's main route completes

---

### day-6 · Monday, August 3 — Car Return and Montserrat

- **Day type:** `mountain`
- **Title / theme:** "Logistics First, Spiritual Reset Second" — medium energy.
- **Origin → destination:** InterContinental Barcelona → Drivalia (Sant Boi) → Plaça Espanya → Montserrat → back to Barcelona
- **Overnight base:** InterContinental Barcelona (unchanged — luggage stays, room booked through Aug 4)
- **Fixed events:** Wake 7:00 AM · Leave hotel 7:45–8:00 AM · **Car return target 8:30–9:00 AM (unconfirmed against a noon voucher — correcting §0 conflict #4)** · FGC departs Plaça Espanya (exact time TBC, generally hourly)
- **Flexible events:** Mode A (soft spiritual — basilica, viewpoint, return ~4 PM) / Mode B (balanced default — adds Sant Joan funicular, ~5–6 PM return) / Mode C (full nature day — only with confirmed last descent) — mutually exclusive energy modes chosen day-of
- **Travel legs:** `leg-drive-car-return` (car, InterContinental → Drivalia Sant Boi) · `leg-taxi-placa-espanya` (car/taxi, Sant Boi → Plaça Espanya) · `leg-fgc-montserrat` (train, Plaça Espanya → Monistrol de Montserrat) · `leg-cremallera-or-aeri` (funicular/cable-car, up the mountain)
- **Map locations:** InterContinental, Drivalia Sant Boi office, Plaça Espanya, Montserrat (basilica + monastery square + Sant Joan viewpoint)
- **Selected-day route:** two distinct segments — an early urban logistics loop (hotel→Sant Boi→Plaça Espanya), then a mountain ascent line — rendered as two connected but visually distinct legs (urban = neutral gray per §7's walk/shuttle convention extended to short car legs; mountain = leg-accent colored)
- **Must do:** Car return; Basilica/Black Madonna area; one proper viewpoint
- **Strong maybe:** Sant Joan funicular; short scenic walk
- **Skip if tired:** Funicular-plus-long-hike combination; full club night; any late night that weakens the final Barcelona day
- **Unresolved tasks:** Early car return before 9:00 AM not yet confirmed by Drivalia (`priority: high`) · exact FGC schedule/last descent not confirmed (`priority: medium`) · Sant Joan/Santa Cova funicular operating status not confirmed (`priority: low`)
- **Booking dependencies:** `DEMO-CARBCN2` return — unresolved against voucher terms
- **Energy mode:** `medium`
- **Readiness:** `needs-attention` — the mountain-day formula requires outbound/return transport at least `planned` and no critical open task; the early-return conflict here is `high`, not `critical` (there's no hard flight to miss, just a voucher mismatch and a wasted extra hour), so this reads as `needs-attention` rather than the `critical`-driven `needs-attention` state on day-3 — same stage label, genuinely different severity, which the `summary` text must communicate ("confirm early return" vs. day-3's "resolve before the flight")
- **Warnings/conflicts:** Never begin the hike option (Mode C) without confirmed last-transport timing
- **Mobile presentation:** Logistics segment (car return) collapsed by default with a "logistics complete" checkbox-style affordance once resolved, so the mountain content doesn't get buried under morning admin on a screen the user is checking mid-trip
- **Map presentation:** Two-phase camera: urban loop first (brief), then a dedicated ascent frame — this is a good playback (§8) showcase moment, since the elevation change is real and MapLibre's pitch/bearing controls can convey it

---

### day-7 · Tuesday, August 4 — Barcelona City, Gaudí, Vintage Substitute, Airport-Hotel Transition

- **Day type:** `city`
- **Title / theme:** "Architecture, Vintage, Food, Elegance, a Soft Final Transition" — full but controlled.
- **Origin → destination:** InterContinental Barcelona → (bakery/vintage area) → Sagrada Família → Passeig de Gràcia → Alexandre FrontAir Congress Hotel
- **Overnight base:** Alexandre FrontAir Congress Hotel — **confirmed** (correcting §0 conflict #7)
- **Fixed events:** Checkout InterContinental by noon · **Sagrada Família timed entry, target ~2:00 PM — status NOT BOOKED** (correcting §0 conflict #8, the single most consequential data conflict in the whole trip)
- **Flexible events:** Bakery + curated vintage shops (**replacing Els Encants — closed Tuesdays**, correcting §0 conflict #9) · Passeig de Gràcia architecture walk (Casa Batlló/Casa Milà exteriors) · one optional evening choice from {Gothic Quarter/El Born wander, Bunkers del Carmel sunset, one speakeasy (Monk or Paradiso, max one)}
- **Travel legs:** `leg-walk-vintage`, `leg-walk-sagrada`, `leg-walk-passeig`, `leg-drive-frontair` (transfer to airport-hotel)
- **Map locations:** Bakery/vintage area (El Born/Gothic, exact shops unresolved), Sagrada Família, Passeig de Gràcia, Alexandre FrontAir Congress Hotel (Sant Boi)
- **Selected-day route:** a compact central-Barcelona walking cluster, then a single longer transfer line out to the airport-hotel in Sant Boi
- **Must do:** Sagrada Família; Passeig de Gràcia; move to airport hotel; confirm airport transfer
- **Strong maybe:** El Born/Gothic wander; one bakery; one speakeasy
- **Skip if tired:** Bunkers del Carmel; multiple nightlife venues; trying to recreate the closed-Encants plan by crisscrossing the city
- **Unresolved tasks:** **Book Sagrada Família tickets** (`priority: critical` — sell-out risk, timed entry, high-priority per the master note itself) · finalize which 2–3 vintage shops (`priority: medium`, "final store list was never fully extracted") · exact bakery branch/hours (`priority: low`) · FrontAir shuttle departure time (`priority: medium`)
- **Booking dependencies:** Sagrada Família — **unresolved**, must render as such, not as `place-sagrada`'s current fabricated `booked` status; Alexandre FrontAir stay confirmed
- **Energy mode:** `full`
- **Readiness:** `needs-attention` — a `city`-type day is `ready` only if no must-do event is `unresolved`; Sagrada Família is both must-do and unresolved, so this day is correctly flagged, unlike the current app which shows it as fully booked
- **Warnings/conflicts:** Els Encants closed-Tuesday substitution is shown as a **resolved correction with a note**, not a live warning (the master note already made the decision — "keep Montserrat on Monday, replace Encants with curated vintage Tuesday") — the UI should show *why* the plan changed, once, not nag about it
- **Mobile presentation:** Sagrada Família's unresolved/critical badge sits at the very top of the day panel, above the fold — this is the one booking action most likely to actually get done if surfaced aggressively enough
- **Map presentation:** Central Barcelona cluster rendered tightly zoomed (walking-scale), then a clear "leaving the city" transition line to Sant Boi as the day's closing beat — a good emotional pacing moment for playback, matching the master note's own "soft final transition" framing

---

### day-8 · Wednesday, August 5 — Barcelona to JFK

- **Day type:** `departure`
- **Title / theme:** "Calm Ending, No Chaos"
- **Origin → destination:** Alexandre FrontAir Congress Hotel → Barcelona Terminal 1 → JFK
- **Overnight base:** none (departure day)
- **Fixed events:** Wake 6:30–7:00 AM · Hotel shuttle · **Target Terminal 1 arrival 7:45–8:00 AM** (correcting §0 conflict #12 — the current "leave hotel by 10 AM" note is impossible against a 10:55 AM departure) · DL129 departs 10:55 AM · Scheduled JFK arrival 1:36 PM
- **Flexible events:** none by design — "no last-minute city excursion, no leisurely late checkout" is explicit in the master note
- **Travel legs:** `leg-frontair-shuttle` (shuttle, hotel → BCN T1) · `leg-dl129` (flight, BCN → JFK)
- **Map locations:** Alexandre FrontAir Congress Hotel, Barcelona Airport T1, JFK
- **Selected-day route:** short shuttle line, then the return international arc mirroring day-0's outbound arc — a nice visual bookend for playback's final frame
- **Must do:** Confirm shuttle seat/time the night before; validate DIVA/tax-free paperwork before checking any relevant goods; make the 10:55 AM flight
- **Strong maybe:** none
- **Skip if tired:** N/A — this day has no discretionary content to skip; that's the design intent
- **Unresolved tasks:** Confirm FrontAir shuttle departure time reservation (`priority: high` — this is the load-bearing logistics task for the whole day)
- **Booking dependencies:** `DL129` confirmed
- **Energy mode:** `controlled`
- **Readiness:** `in-progress` until the shuttle time is confirmed the night before (day-7's task); `ready` once confirmed — the `departure` formula explicitly requires the shuttle/transfer dependency to be at least `planned`, and it currently sits at `unresolved` until reserved
- **Warnings/conflicts:** none beyond the shuttle-confirmation dependency
- **Mobile presentation:** Minimal — a single fixed timeline, no flexible-tier sections rendered at all (an empty strong-maybe/skip-if-tired section should simply not render, not show as empty state chrome)
- **Map presentation:** The closing frame of the whole-trip playback — FrontAir → T1 → the outbound arc back to JFK, deliberately mirroring day-0's opening frame for a sense of narrative closure

---

## 12. Coastal visual system

> **⚠️ Superseded for active work:** Use [SOFT_COASTAL_VISUAL_SYSTEM.md](../design/SOFT_COASTAL_VISUAL_SYSTEM.md). The terracotta, olive, and burgundy tokens below are **historical spec content** retained for architectural context only. Implementation must use blue–plum Soft Coastal map styling: selected route `--deep-coastal-blue`, secondary `--dusty-lilac`, unresolved dashed `--soft-plum`, ivory halo.

Extends, does not replace, the leg-accent system already established in `src/data/legAccents.ts` and `index.css` (`--leg-menorca`, `--leg-costa-brava`, `--leg-barcelona`).

| Token | Role | Approx. HSL direction | Usage |
|---|---|---|---|
| **Mediterranean sea** | Map water fill, hero backgrounds | Deep desaturated teal-blue, `≈ 205 45% 30%` | MapLibre water layer, ambient wash behind the Journey Map header |
| **Limestone** | Base/land fill, card surfaces on Journey Map | Warm off-white/stone, `≈ 40 25% 92%` | Map land layer, `SelectedDayPanel` background — ties to Menorca/Ciutadella's actual stone-street palette described in the master note |
| **Terracotta** | Costa Brava accent reinforcement, road-trip leg lines | Warm burnt orange, `≈ 22 55% 48%` (close to the existing `--leg-costa-brava: 22 48% 46%` — treat as the same token, not a new one) | Road-trip day markers, Begur/Tossa stop pins |
| **Botanical olive** | Nature/garden content (Marimurtra, Montserrat, Líthica) | Muted olive-green, `≈ 78 22% 38%` | New token, `--accent-botanical`; used for `experience`/`mountain` day-type badges and nature-kind `Location` markers, distinct from the existing three leg colors since it's a *content-category* accent, not a *geography* accent |
| **Barcelona saffron** | Barcelona city energy, Sagrada/Gaudí content | Warm gold, close to existing `--leg-barcelona: 38 58% 42%` | Reuse existing token — do not introduce a competing gold |
| **Barcelona burgundy** | Nightlife/evening content (Paradiso, Monk, speakeasy tier) | Deep wine red, `≈ 350 40% 32%` | New token, `--accent-nightlife`; used sparingly, only for nightlife-kind markers and the "strong-maybe evening" tier indicator — this is the system's one deliberately saturated accent, reserved so it doesn't compete with the calmer daytime palette |

**Discipline, carried over from the prior spec's Risk #1 (accent-wash overreach):** the two new tokens (botanical olive, nightlife burgundy) are **content-category** accents, not per-leg geography accents — they must never replace the existing Menorca/Costa Brava/Barcelona leg coloring on the map or rail. They apply only to marker-kind styling and tier badges within a day panel. If a future contributor is tempted to add a fourth "mountain leg" color, that's the wrong instinct — Montserrat is geographically part of the Barcelona leg; its distinctiveness comes from the botanical-olive *content* accent on its markers, not a new geographic color.

Typography, borders, elevation, and motion inherit the Editorial Travel Atlas direction already established in `UX_PRODUCT_REDESIGN_SPEC.md` §7 without modification — Fraunces serif for headings, restrained card usage, generous vertical rhythm.

---

## 13. Shared `TripJourneyMap` architecture

One map component, three consumers, one config surface controlling what's shown:

```ts
export interface TripJourneyMapProps {
  mode: "whole-trip" | "single-day" | "leg-preview";
  selectedDayId?: string;              // required for "single-day"
  focusLegId?: string;                 // required for "leg-preview" (e.g. Trip Mode's next-leg preview)
  interactive: boolean;                // false = decorative/static (used in tight spaces), true = full pan/zoom
  showPlayback: boolean;                // only true on the Itinerary page
  onDaySelect?: (dayId: string) => void; // omitted where selection isn't applicable (e.g. a read-only preview)
  height: "compact" | "standard" | "full-bleed";
}
```

| Consumer | `mode` | `interactive` | `showPlayback` | Notes |
|---|---|---|---|---|
| **Itinerary (Journey Map)** | `whole-trip` (default) / `single-day` (on select) | `true` | `true` | Full implementation, owns `selectedDayId`, described throughout this spec |
| **Trip Pulse (Hero)** | *(not a `TripJourneyMap` consumer)* | — | — | **Decision, matching §18: Trip Pulse does not load MapLibre.** It keeps the existing `RouteVisualization` SVG component permanently — not as a fallback or a loading state, but as the intended, final implementation for this surface. Trip Pulse's compact hero needs orientation, not real pan/zoom, and excluding it here is what keeps MapLibre's bundle cost off the app's most-visited page (§18). If a future redesign genuinely needs a live map on Trip Pulse, that is new scope requiring its own tradeoff discussion, not an assumed extension of this table. |
| **Selected Day (within Itinerary)** | `single-day` | `true` | `false` | Same map instance as the whole-trip view, just re-framed — not a separate mounted component (avoids double MapLibre instances on one page, which is expensive) |
| **Trip Mode (future, §21)** | `leg-preview` | `false`, `height: "compact"` | `false` | Postponed to a later phase — shows only the "next" location as a small static-feeling frame, deliberately minimal per Trip Mode's "zero decisions" design principle from the prior spec; must not become a second interactive map competing with Trip Mode's restraint |

**One underlying MapLibre instance per mounted `TripJourneyMap`** — the shared architecture is in the **data layer and prop contract**, not a singleton map instance across pages (pages unmount/remount via wouter, so a cross-page singleton isn't viable or necessary).

---

## 14. Component hierarchy

```
Itinerary (page)
├── JourneyHeader
│   ├── trip title, date range
│   └── LegSummaryChips           (Menorca · 3 days / Costa Brava · 1 day / Barcelona · 4 days,
│                                    reusing the parseRouteLegs pattern from data/legAccents.ts)
├── TripJourneyMap
│   ├── MapCanvas                 (thin imperative wrapper around the MapLibre instance — see §18)
│   ├── MapLayers                 (base / route-legs / route-legs-active / locations / locations-selected)
│   ├── MapMarker                 (per-mode custom marker, per §7's table)
│   └── PlaybackControls          (play/pause, progress; only rendered when showPlayback)
├── JourneyRail                    (successor to JourneyRibbon — same a11y contract, extended to 9 days
│                                    and desktop's vertical-list variant per §4)
│   └── JourneyRailItem            (per-day: date, dayType icon, readiness chip, energy-mode indicator)
└── SelectedDayPanel
    ├── DayPanelHeader              (date, dayType badge, energy mode, readiness chip)
    ├── FixedTimeline               (chronological fixed events + travel legs)
    ├── TieredEventList              (grouped: must-do / strong-maybe / skip-if-tired)
    │   └── EventCard                (status glyph per §7, booking link if confirmed)
    ├── UnresolvedTaskBanner         (persistent for `critical`, dismissible-once-resolved for others)
    └── DayNavControls               (previous/next day, keyboard-accessible)
```

`DayPreview` (existing, from the Trip Pulse phase) is **not reused verbatim** here — `SelectedDayPanel` supersedes it for Itinerary's richer needs (fixed/flexible split, unresolved tasks) while Trip Pulse's `DayPreview` can stay as-is or later be simplified to compose `SelectedDayPanel` in a compact mode; that convergence is optional polish, not required for this phase.

---

## 15. State ownership and URL behavior

- **`selectedDayId`** — owned by the `Itinerary` page component (`useState`), same pattern as `Dashboard.tsx`. Not lifted to `TripContext` — it's page-local UI state, not shared trip data.
- **`mapViewMode`** (`"whole-trip" | "single-day"`) — derived, not stored: `whole-trip` when `selectedDayId` is null, `single-day` otherwise. No separate state variable needed.
- **`playbackState`** (`"idle" | "playing" | "paused"`) — owned by `Itinerary`, resets to `idle` on unmount (not persisted — replaying is a session-local delight feature, not a saved preference).
- **URL:** `?day={dayId}` query parameter on `/itinerary`, read on mount, written via `history.replaceState` (not `pushState` — day selection shouldn't spam browser back-button history; back should exit the page, not step through 9 days) on every selection change.
  - Example: `/itinerary?day=day-4` deep-links directly to the Costa Brava road-trip day, map pre-framed, panel pre-expanded.
  - Playback state is **not** URL-encoded — starting playback from a shared link would be a surprising, unrequested autoplay experience; a shared link always opens paused on the specified day.
- **No new `TripContext` state.** The structured data model in §9 is read-only, static, generated data (like `mockData.ts` and `mockLogistics` today) — it does not need to go through the mutable trip-state context unless a future phase adds editing of itinerary events (not in scope here).

---

## 16. Accessibility

- **Map is never the only source of information.** Every fact rendered on the map (a location, a leg, a status) has a corresponding text representation in `JourneyRail`/`SelectedDayPanel` — a screen-reader user loses zero information with the map absent. The map `<canvas>` element itself is `aria-hidden="true"` with `role="img"` and a text `aria-label` summarizing the current view ("Map showing the Costa Brava road trip: Blanes, Begur, Tossa de Mar").
- **`JourneyRail` keyboard/tab model is inherited unchanged** from the existing, already-correct `JourneyRibbon` implementation (`role="tablist"`, roving `tabIndex`, Arrow/Home/End, `aria-controls`/`aria-labelledby` pairing with the panel) — this is proven working and must not be redesigned, only extended to 9 items and the desktop vertical variant (same semantics, different visual layout).
- **Selected-day-in-overflow fix carried forward:** the prior Trip Pulse review flagged that the initially selected tab could load off-screen in the horizontal rail with no scroll-into-view. This spec requires a mount-time `scrollIntoView({ block: "nearest", inline: "center" })` (or the vertical-list equivalent on desktop) on the initially selected `JourneyRailItem` — not optional here, since a 9-day rail overflows far more aggressively than the 8-day Trip Pulse ribbon did.
- **Status is never color-only** — carried through from §7's marker spec (glyph + fill treatment) and the existing `StatusTier`/`CategoryTag` discipline from the prior redesign spec.
- **Map keyboard interaction:** MapLibre's canvas is not independently keyboard-navigable in a meaningful way for this use case (panning a map with arrow keys is a poor experience for a 9-stop trip). Instead, **all map interaction is achievable via the rail and panel alone** — clicking/tapping the map is a mouse/touch convenience, not a required interaction path. This is the correct accessibility strategy for a decorative-but-informative map: make the non-map path complete, don't force map keyboard-navigation to be excellent.
- **Playback is fully pausable and never auto-starts.** `prefers-reduced-motion` handling per §8. Playback also must not auto-start on page load under any circumstance — it's user-initiated only, avoiding both a motion-sensitivity issue and a "why is my screen doing something I didn't ask for" issue.
- **Contrast:** the coastal palette's sea/limestone map colors are for the map surface, not text backgrounds — where `SelectedDayPanel` sits on a limestone-tinted surface, body text uses the existing `--foreground`/`--muted-foreground` tokens already verified against the app's neutral palette, not new low-contrast pairings invented for this spec.
- **Focus order:** `SelectedDayPanel` content order (fixed → must-do → strong-maybe → skip-if-tired → unresolved) is both the visual order and the DOM/tab order — no visual reordering via CSS that would desync sighted and keyboard/screen-reader navigation.

---

## 17. Error, empty, and offline fallback states

| Condition | Fallback |
|---|---|
| MapLibre fails to load (network blocked, WebGL unavailable, script error) | Render the existing `RouteVisualization`-style static SVG strip (extended to the full leg set) in place of the interactive map — same component contract (`TripJourneyMapProps`), a `StaticRouteFallback` component satisfies the same props minus real pan/zoom. The rail and panel are **fully functional without the map** since they don't depend on it (per §16's accessibility strategy, this fallback is nearly free — the "no-map path" already has to be complete for a11y reasons). |
| No network / fully offline | Map tiles/style must be either bundled locally (a small static style + minimal vector subset covering only Spain's relevant bounding box, acceptable given this is a fixed, known itinerary — not a general-purpose map) or fall back to `StaticRouteFallback` immediately. Given "no backend" and "static prototype" constraints, **bundling a minimal offline-capable style is the recommended approach** over relying on a live tile CDN at demo time. |
| A `Location` is missing coordinates (data error) | That point is simply omitted from the map layer (filtered at the GeoJSON-build step) but still renders normally in `SelectedDayPanel` text — a missing coordinate degrades the map, never the content. |
| `selectedDayId` in the URL doesn't match any known day | Fall back to the default "featured day" logic (§6), and `history.replaceState` the URL to the corrected value rather than showing an error state — a stale/bad link should self-heal, not dead-end. |
| Empty tiers (a day with no `strong-maybe` events) | Section simply doesn't render (per §11's day-8 example) — no "nothing here yet" empty-state chrome for what is a legitimately empty, intentional category. |
| Playback interrupted mid-animation (user navigates away) | `Itinerary`'s unmount cleanly cancels any in-flight `flyTo`/timer via a `useEffect` cleanup — no dangling camera animation callbacks firing against an unmounted map instance. |

---

## 18. Performance strategy

- **MapLibre GL JS bundle cost is real** (~200–250KB gzipped for the core library) — mitigate via **route-based code splitting**: the map bundle loads only when `/itinerary` is visited, via dynamic `import()`, not in the main bundle that every page pays for. Trip Pulse's compact map usage (§13) either lazy-loads the same chunk (accepting the cost only if the user reaches Trip Pulse, which they always do first — so in practice it may load early anyway) or uses the `RouteVisualization` SVG fallback permanently, avoiding the cost on the most-visited page. **Recommendation: keep Trip Pulse on the lightweight SVG `RouteVisualization` permanently** (not just as an error fallback) — the map's real value is Itinerary's exploratory, multi-day use case; Trip Pulse's compact hero doesn't need real pan/zoom, and this halves the pages that pay MapLibre's bundle cost.
- **GeoJSON payload is small and static** — ~40 locations, ~15 legs for a 9-day trip. No pagination, streaming, or virtualization needed; the entire dataset is a single small JSON module bundled at build time (matches the existing `mockData.ts` pattern exactly — no runtime fetch).
- **Map style should be a minimal custom style**, not a full-featured general-purpose vector style — fewer layers to parse and rasterize, faster initial paint, and it enforces the intentional "editorial, not Google Maps" visual identity from §12 as a side effect.
- **Playback's `flyTo` calls are debounced/queued**, not fired concurrently — a rapid double-click during playback must not queue two competing camera animations; a single `isAnimating` guard on the map wrapper prevents overlapping `flyTo` calls.
- **`JourneyRail`'s marker↔row hover sync (desktop)** should be throttled (e.g., via `requestAnimationFrame`), not fired on every raw `mousemove`/map `mousemove` event, to avoid layout thrash on a 9-item list synced to map hover state.
- **Reduced-motion path is also a performance win**, not just an accessibility one — `jumpTo` instead of `flyTo` is cheaper to compute, so the reduced-motion code path doubles as a low-power-device-friendly path.

---

## 19. Phased implementation plan

**Phase 0 — Data foundation (blocks everything downstream)**
- Author the structured data files: `src/data/journeyDays.ts`, `journeyEvents.ts`, `travelLegs.ts`, `locations.ts`, `bookingReferences.ts`, `unresolvedTasks.ts` — implementing the §9 interfaces, populated from §11's day-by-day conversion (the corrected, master-note-accurate version, not the current `mockData.ts` facts).
- Implement `computeDayReadiness(day, ...)` per §10's per-type formulas in a new `src/lib/journey-readiness.ts`.
- Add the two new CSS tokens from §12 (`--accent-botanical`, `--accent-nightlife`) to `index.css`, alongside the existing three leg-accent variables.
- **No UI changes in this phase.** Pure data + pure functions, unit-testable in isolation (mirrors the existing `trip-metrics.test.ts` pattern).

**Phase 1 — Static route visualization upgrade (no MapLibre yet)**
- Extend `RouteVisualization.tsx` to render all travel legs (not just the 3 city-to-city arcs) using the new leg data, still SVG-based.
- Build `JourneyRail` as the 9-day, desktop-vertical/mobile-horizontal successor to `JourneyRibbon`, wired to the new day data and `computeDayReadiness` — but still pointing at the *old* `Itinerary` page layout, not yet the full Journey Map page.
- Build `SelectedDayPanel` (fixed timeline, tiered events, unresolved tasks) as a standalone component, tested against `day-3`'s and `day-7`'s data specifically (the two days with the richest conflict/unresolved content) as the hardest cases.
- **This phase is independently demoable and ships real value (correct data, correct readiness, no more "anchor" false negatives) even if MapLibre integration slips.**

**Phase 2 — MapLibre integration**
- Add MapLibre GL JS as a dependency, behind route-based code splitting (`/itinerary` only, per §18).
- Build `TripJourneyMap` with `mode: "whole-trip"` and `mode: "single-day"` only (skip `leg-preview` — that's Phase 4/Trip Mode territory).
- Implement the layer stack from §5 (base/route-legs/route-legs-active/locations/locations-selected) and the custom markers from §7.
- Wire `selectedDayId` synchronization (§6) between `JourneyRail`, the map, and `SelectedDayPanel`.
- Implement the `StaticRouteFallback` from §17 and verify the map-failure path actually degrades gracefully (test by blocking the map script in devtools).

**Phase 3 — Playback and polish**
- Implement playback (§8): auto-advance, camera choreography, `prefers-reduced-motion` handling, Motion-driven progress indicator.
- Implement URL state (§15): `?day=` query param read/write.
- Full accessibility pass against §16's checklist, including the mount-time `scrollIntoView` fix and the "map absent, nothing lost" audit.
- Visual QA against §12's coastal palette across all four breakpoints in §4.

**Phase 4 — Postponed (see §21)**

---

## 20. Per-phase acceptance criteria

**Phase 0**
- [ ] All 9 days (July 28–Aug 5) exist as `JourneyDay` records — July 28 is no longer missing.
- [ ] Every §0 conflict has a corrected data representation (Sagrada unresolved, Menorca car present with critical task, Gran Hotel Reymar present, airport hotel confirmed, Encants removed from planned events, Cova moved off day-3, La Roca Village present on day-5).
- [ ] `computeDayReadiness` returns the correct stage for all 9 days per §10's table, verified by unit test (mirroring `trip-metrics.test.ts`'s existing style) — specifically: day-3 and day-6 are `needs-attention`/`in-progress` for genuinely different reasons (critical vs. high-priority task), and day-1/day-2 are *not* flagged just because they lack a single "anchor."
- [ ] No test or type references the word "anchor" as a readiness input for Journey Map data.

**Phase 1**
- [ ] `JourneyRail` renders 9 days, keyboard nav (Arrow/Home/End) works identically to the existing `JourneyRibbon`'s verified behavior.
- [ ] `SelectedDayPanel` for day-3 shows the car-return conflict as a persistent, non-dismissible, above-the-fold banner.
- [ ] `SelectedDayPanel` for day-7 shows Sagrada Família as `unresolved` (not `confirmed`) and the Encants substitution as a resolved-with-note, not a live warning.
- [ ] Empty tiers (day-0, day-8's `strong-maybe`) render no section, not empty-state chrome.
- [ ] `RouteVisualization` extension covers all travel legs, not just 3 static city arcs; visually distinguishable transport modes per §7's table even in SVG form.

**Phase 2**
- [ ] `TripJourneyMap` loads only on `/itinerary` (verified via network tab / bundle analysis — MapLibre chunk absent from `/dashboard`'s initial load).
- [ ] Selecting any `JourneyRailItem` re-frames the map to that day within ~700ms, verified for all 9 days including day-4's five-stop `fitBounds` case.
- [ ] Clicking a map marker selects the correct day and updates the rail + panel in sync — no desync between the three surfaces under rapid clicking.
- [ ] Disabling network/blocking the map script results in `StaticRouteFallback` rendering with zero console errors and zero loss of day-selection functionality.
- [ ] All marker states (confirmed/planned/considered/unresolved) are visually distinguishable in a grayscale/color-blind simulation (glyph + fill, not hue alone).

**Phase 3**
- [ ] Playback advances through all 9 days automatically, camera animates via `flyTo`, holds duration roughly scales with content density (day-4 measurably longer than day-0/day-8).
- [ ] With OS-level `prefers-reduced-motion` enabled: camera uses `jumpTo` (no visible pan/zoom tween), rail progress indicator is a static counter, `SelectedDayPanel` content swaps instantly — verified by toggling the OS setting mid-session, not just at load.
- [ ] `/itinerary?day=day-4` on a fresh load lands directly on day-4, map pre-framed, panel pre-expanded, rail scrolled so day-4 is visible without user action.
- [ ] Full keyboard-only pass: a user with no mouse can select every day, read every fixed/flexible/unresolved item, and understand the map's current focus via `aria-label` alone — verified by an actual screen-reader pass (VoiceOver or NVDA), not just DOM inspection.
- [ ] Lighthouse/axe pass shows no new contrast or ARIA violations introduced by the coastal palette or new components.

---

## 21. What must be postponed

- **Trip Mode integration (`leg-preview` map mode).** Trip Mode's design principle is "zero decisions, restraint above all" (per the prior redesign spec); adding a live map there risks becoming exactly the kind of dashboard-creep that spec explicitly warned against. Revisit only after Phase 3 ships and there's a specific, restrained interaction in mind (e.g., a single static "you are here → next stop" frame, not a pannable map) — not before.
- **Editing itinerary events from the Journey Map UI.** This phase is read/orientation-only. Editing (moving an event's tier, resolving a task, changing a booking status) stays in Day Builder/Logistics for now. Converging the data models (§9's new types vs. the existing `SavedPlace`/`LogisticsItem`) so that an edit in one place reflects everywhere is real architectural work and should be its own follow-up spec, not bundled here.
- **Real road-routing (turn-by-turn) for the Costa Brava day.** Straight-line waypoint segments (§5) are the correct fidelity for this product's "illustration, not cartography" principle — do not add a routing API/dependency later without a genuine new requirement (e.g., real-time navigation in a future Trip Mode), which is out of scope for a static portfolio prototype.
- **Live flight/transit status.** Explicitly a non-goal already (`UX_PRODUCT_REDESIGN_SPEC.md` §2) — nothing in this spec should be read as reopening that; all flight/train times here are static planning data, not live feeds.
- **Booking execution (actually reserving Sagrada Família, Cova d'en Xoroi, etc. through the app).** This spec models bookings as data (status, confirmation number) — it does not add a booking flow. "Unresolved" tasks link out to the relevant provider (per the master note's own source list) but the app does not become a booking service.
- **Boat-day alternative as a fully modeled itinerary branch.** The master note treats the July 30 boat option as a genuine either/or with land coves, not yet decided. Modeling both branches as first-class, fully switchable itinerary states (rather than the current "documented as a `considered`/`unresolved` alternative in the day-2 text") is more state-machine complexity than this phase needs — represent it as prose/considered-status for now, revisit only if the boat is actually booked.
- **Fourth+ coastal accent tokens for future trips.** The palette in §12 is tuned specifically to Spain 2026's three legs plus two content-category accents. A future multi-trip version of TripCanvas would need a per-trip palette assignment system (foreshadowed but explicitly out of scope in the prior redesign spec's §7.4) — not addressed here.
- **Any backend.** Restated explicitly here even though it's already structural throughout (§9's data is static and build-time-bundled, §15 adds no `TripContext` state) — this spec introduces zero network calls, zero persistence beyond the existing localStorage patterns, and zero server. Not a future phase; a permanent constraint for this product.
- **Any AI/LLM-generated content or "smart suggestion" feature** (auto-picking a cove, auto-resolving a booking conflict, an itinerary chatbot, etc.). Nothing in this spec proposes one, and none should be added under the banner of "Phase 4 polish" — this mirrors the identical non-goal already established in `UX_PRODUCT_REDESIGN_SPEC.md` §2 and the technical direction's explicit "do not add fake AI."
