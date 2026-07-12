# TripCanvas — Product Strategy

**Status:** Canonical product definition.  
**Last updated:** 2026-07-12
**Checkpoint:** `bec854c` on `main`

---

## Target user

The **designated planner** for an experience-heavy leisure trip — the friend or partner who owns the group's TikTok saves, Instagram pins, and Google Maps stars. They have taste, more inspiration than time, and plan for people who care how the trip *feels* on the ground, not merely whether logistics are complete.

**Not for:** business travelers, collaborative group editing, flight rebooking, or users who want AI-generated itineraries. TripCanvas is a **shaping** tool for a plan the user already has opinions about.

---

## Core problem

Scattered inspiration outgrows realistic days. Generic itinerary tools become spreadsheets. The planner needs to **capture fast**, **triage without guilt**, **shape days that won't collapse**, **secure unforgiving bookings**, and **move through the trip without re-deciding**.

---

## Product promise

**Turn scattered inspiration into calm days you will actually enjoy.**

**Calm means:**

- Each screen answers one primary question.
- The product tells the user what to cut, not only what they added.
- Trip Mode contains zero decisions — acknowledgment and forward motion.
- Visual density decreases as planning progresses.

---

## Jobs to be done (frequency order)

1. **Capture at scroll speed** — save before the idea is lost.
2. **Triage without guilt** — 40 saves, 8 days; what makes the cut?
3. **Shape realistic days** — pacing and load, not just lists.
4. **Secure unforgiving bookings** — confirmations findable under pressure.
5. **Move live without planning** — what's next on the ground?
6. **Pack for the actual trip** — right things, right day.

---

## Product principles

1. **One question per screen** — no duplicate jobs across surfaces.
2. **Truthful readiness** — Trip Pulse, Logistics, and Packing never contradict.
3. **Explicit day semantics** — arrival, transfer, and departure days are logistics-primary, not "missing anchor."
4. **Constraint over accumulation** — backup and do-not-cram are first-class.
5. **Calm over completeness** — beautiful pacing beats checklist tourism.
6. **Portfolio honesty** — no fake AI, no backend theater, no accepted page merely because it builds.

---

## Product boundaries (non-goals)

- No backend, auth, or accounts (portfolio prototype).
- No AI itinerary generation or fake link ingestion.
- No live flight APIs or real-time collaboration.
- No framework migration (React/Vite/Tailwind/shadcn).
- No destination rainbow themes or unrelated per-city color systems.

---

## What makes TripCanvas different

| Spreadsheet / CRUD planner | TripCanvas |
|---|---|
| Flat lists of places | Anchor / booked / planned / optional / backup / do-not-cram |
| Every day looks the same | `TripDayKind` drives readiness and presentation |
| Adds without cutting | Actively surfaces overload and deprioritized ideas |
| Logistics separate from plan | Unified booking readiness across places and logistics |
| Dashboard = grid of days | Trip Pulse = guidance; Itinerary = journey shape |

---

## Information architecture

| Route | Nav label (current) | Primary question | Future label (deferred) |
|---|---|---|---|
| `/` | — | Is this worth my time? | — |
| `/trips` | — | Which trip am I opening? | — |
| `/dashboard` | **Trip Pulse** | What do I need to do right now? | — |
| `/inbox` | Inbox | What's worth a spot on this trip? | Capture (deferred) |
| `/itinerary` | Itinerary | What is the shape of this whole trip? | Journey (deferred) |
| `/day/:id` | — (drill-in) | Is this day realistic? | — |
| `/trip-mode/:id` | — (drill-in) | What's next right now? | — |
| `/logistics` | Logistics | Do I have everything booked? | Wallet (deferred) |
| `/packing` | Packing | Will I have the right things? | — |

**IA rules:** Trip Pulse is not a day grid browser. Itinerary owns whole-trip shape. Day Builder and Trip Mode are reached in context, not primary nav.

---

## Feature-to-user-job map

Status vocabulary: **Planned** · **Partial** · **Implemented** · **Automatically verified** · **Independently verified** · **Product-owner accepted**

### Landing (`/`)

| Dimension | Detail |
|---|---|
| **Problem** | Is this worth my time? |
| **Job** | Sell thesis; route into demo |
| **Value** | Calm, curated planning — not another itinerary app |
| **Success evidence** | Visitor reaches Trip Library or Trip Pulse with clear mental model |
| **Status** | Partial — functional; not editorial flagship |
| **Future** | Soft Coastal hero; demo story arc |

### Trip Library (`/trips`)

| Dimension | Detail |
|---|---|
| **Problem** | Which trip am I opening? |
| **Job** | Trip picker |
| **Value** | Clean portfolio entry |
| **Success evidence** | Single-tap into active trip |
| **Status** | Implemented |
| **Future** | Cover images; Soft Coastal polish |

### Trip Pulse (`/dashboard`)

| Dimension | Detail |
|---|---|
| **Problem** | What do I need to do right now? |
| **Job** | Aggregate health, next actions, journey navigation, day preview, shortcuts |
| **Value** | Calm command center |
| **Success evidence** | ≤3 actionable next steps; readiness matches Logistics/Packing |
| **Status** | Implemented · Automatically verified (31 unit tests) · PO acceptance pending |
| **Components** | `TripHero`, `NextBestActions`, `TripReadiness`, `JourneyRibbon`, `DayPreview`, `QuickAccess`, `RouteVisualization` |
| **Future** | [TRIP_PULSE_V2_SPEC.md](specs/TRIP_PULSE_V2_SPEC.md) — Phase 1.3 after Phase 1.2 acceptance |

**Shared domain services:** `trip-metrics`, `booking-readiness`, `day-readiness`, `packing-storage`, `packing-data`, `dates`, `assignment`

### Inbox (`/inbox`)

| Dimension | Detail |
|---|---|
| **Problem** | What's worth a spot on this trip? |
| **Job** | Capture and assign to days/sections |
| **Value** | Triage without guilt |
| **Success evidence** | Unsorted count decreases; correct section assignment |
| **Status** | Partial |
| **Future** | Collapsed capture bar; triage queue; `deletePlace` |

### Itinerary (`/itinerary`)

| Dimension | Detail |
|---|---|
| **Problem** | What is the shape of this whole trip? |
| **Job** | Geographic and narrative orientation |
| **Value** | Flagship journey experience |
| **Success evidence** | User understands arc, pacing, locked vs flexible before drilling in |
| **Status** | Partial — stacked day cards only |
| **Future** | Phase 3 — [ITINERARY_JOURNEY_MAP_SPEC.md](specs/ITINERARY_JOURNEY_MAP_SPEC.md) |

### Day Builder (`/day/:id`)

| Dimension | Detail |
|---|---|
| **Problem** | Is this day realistic? |
| **Job** | Shape via anchor/booked/planned/optional/backup/do-not-cram |
| **Value** | Core IP — pacing-aware planning |
| **Success evidence** | User adjusts before overload |
| **Status** | Partial — strongest functional page; no pace strip |
| **Future** | Pace strip; anchor visual distinction; 44px mobile targets |

### Logistics Wallet (`/logistics`)

| Dimension | Detail |
|---|---|
| **Problem** | Everything booked? Findable under pressure? |
| **Job** | Wallet-style confirmations and links |
| **Value** | Certainty when it matters |
| **Success evidence** | Unresolved items visible; matches Trip Pulse |
| **Status** | Partial — type grouping; unified booking domain in 1.1 |
| **Future** | Needs-attention pinned; leg grouping; emergency pinned |

### Trip Mode (`/trip-mode/:id`)

| Dimension | Detail |
|---|---|
| **Problem** | What's next without deciding? |
| **Job** | Mobile-first day companion |
| **Value** | Zero-decision forward motion |
| **Success evidence** | Complete/skip without opening planner |
| **Status** | Implemented (baseline) |
| **Future** | "Right now" pin; Packing cross-link |

### Packing (`/packing`)

| Dimension | Detail |
|---|---|
| **Problem** | Right things on the right day? |
| **Job** | Outfit notes + checklist |
| **Value** | Practical prep tied to trip |
| **Success evidence** | Full checklist → Trip Pulse packing Ready (31 actionable items) |
| **Status** | Implemented · Automatically verified |
| **Future** | Soft Coastal outfit cards; Trip Mode link |

---

## Explicit product non-features

| Item | Rationale |
|---|---|
| Backend / auth | Portfolio prototype |
| AI ingestion / generation | No fake intelligence |
| Collaboration | Out of scope |
| Live flight APIs | Out of scope |
| Per-destination color themes | Superseded by Soft Coastal system |

---

## Related documents

| Document | Role |
|---|---|
| [PRODUCT_ROADMAP.md](PRODUCT_ROADMAP.md) | Phased delivery |
| [design/SOFT_COASTAL_VISUAL_SYSTEM.md](design/SOFT_COASTAL_VISUAL_SYSTEM.md) | Visual identity |
| [DECISION_LOG.md](DECISION_LOG.md) | Locked decisions |
| [source/SPAIN_2026_MASTER_TRIP_NOTE.md](source/SPAIN_2026_MASTER_TRIP_NOTE.md) | Trip facts |

Historical UX audit content: [archive/2026-07-product-audit/](archive/2026-07-product-audit/) — non-authoritative.
