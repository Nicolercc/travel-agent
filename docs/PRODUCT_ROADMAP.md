# TripCanvas — Product Roadmap

Ordered delivery plan. Status vocabulary (use exactly — do not say "complete" for implementation-only):

**Planned** · **Authorized** · **In implementation** · **Implemented** · **Automatically verified** · **Independently verified** · **Product-owner accepted** · **Released** · **Blocked**

---

## Approved sequencing (post–Phase 1.2)

1. **Phase 1.3** — Soft Coastal Design System and Trip Pulse v2 *(independently verified — PO acceptance pending)*
2. **Phase 1.4** — Verification, acceptance, and Phase 2A authorization *(authorized — current gate phase)*
3. **Phase 2A** — Real journey domain model
4. **Phase 2B** — Spain 2026 structured data conversion
5. **Phase 2C** — Journey readiness validation
6. **Phase 3** — Flagship map-led Itinerary
7. **Phases 4–9** — Inbox → Day Builder → Logistics Wallet → Trip Mode → Packing intelligence → Launch readiness

> **Sequencing note:** Nicole approved Soft Coastal (**Phase 1.3**) before journey data migration (**Phases 2A–2C**) as a portfolio-velocity trade-off with documented rework risk (D-028). Map-led Itinerary is **Phase 3**, not a later numbered phase.

> **Gate note:** Phase 1.4 is a non-feature acceptance phase inserted by D-031. It closes Phase 1.3 responsibly and authorizes Phase 2A from a known-good baseline; it is not data-model implementation.

> **Technical-risk note:** A disposable map integration spike is authorized by D-029 before Phase 3. It is not Phase 3 implementation, must not merge production map code, and must not become a trip-fact source.

---

## Phase 0 — Portfolio scaffold & correctness

| Field | Value |
|---|---|
| **User problem** | Credible demo shell; truthful dates and metrics |
| **Product outcome** | Runnable prototype with shared planning-health logic |
| **Scope** | `dates.ts`, `assignment.ts`, day sections, `trip-metrics` foundation |
| **Non-goals** | Full redesign, backend |
| **Dependencies** | Initial scaffold |
| **Implementation owner** | Implementation owner |
| **Review owner** | QA |
| **Acceptance criteria** | Typecheck/build pass; no UTC date rollover; metrics not hardcoded in pages |
| **Status** | **Product-owner accepted** (baseline committed) |

---

## Phase 1 — Trip Pulse

| Field | Value |
|---|---|
| **User problem** | Overview answered competing questions |
| **Product outcome** | Trip Pulse command center at `/dashboard` |
| **Scope** | `trip-pulse/*`, Dashboard, nav label, leg accents, `trip-metrics` extensions |
| **Non-goals** | Itinerary, Inbox, MapLibre, backend, AI |
| **Dependencies** | Phase 0 |
| **Implementation owner** | Implementation owner |
| **Review owner** | reviewer (read-only), QA |
| **Acceptance criteria** | No 8-card day grid; coherent composition; `/dashboard` route; reduced-motion on ribbon |
| **Status** | **Implemented** |

---

## Phase 1.1 — Truthfulness, readiness, and state hardening

| Field | Value |
|---|---|
| **User problem** | Booking/packing/day readiness contradictions |
| **Product outcome** | Shared booking readiness, derived packing totals, `TripDayKind` semantics |
| **Scope** | `booking-readiness`, `day-readiness`, `packing-data`, tests, 1024px grid, Quick Access dedup |
| **Non-goals** | Itinerary, July 28 day, heuristic day rules |
| **Dependencies** | Phase 1 |
| **Implementation owner** | Implementation owner |
| **Review owner** | QA |
| **Acceptance criteria** | Airport hotel affects readiness; packing N/N → Ready; typecheck + 31 tests + build pass |
| **Status** | **Implemented** · **Automatically verified** |

---

## Phase 1.2 — Independent QA and Nicole product-owner acceptance

| Field | Value |
|---|---|
| **User problem** | Phase 1 / 1.1 not yet independently verified or PO-accepted; P1 state-consistency defects |
| **Product outcome** | Recorded QA verdict + Nicole acceptance; packing reset and anchor readiness aligned |
| **Scope** | Independent QA; blocker remediation; PO walkthrough; gate updates — evidence consolidated at `ecd6377` |
| **Non-goals** | New features beyond P1 fixes, data migration, visual refresh |
| **Dependencies** | Phase 1.1 automatically verified |
| **Implementation owner** | Primary implementer (blocker remediation); QA (QA); Nicole (acceptance) |
| **Review owner** | strategy owner (synthesis) |
| **Acceptance criteria** | [RELEASE_GATES.md](RELEASE_GATES.md) Gates 5–6 pass; packing reset clears canonical state; Day Builder and Trip Pulse agree on anchor status |
| **Status** | **Independently verified** · **Product-owner accepted** · **Closed** |

**Verification evidence (2026-07-10):** Working tree clean; typecheck passed; 6 test files / 48 tests passed; build passed; packing-reset and anchor-consistency reproduction passed (QA + Nicole).

---

## Phase 1.3 — Soft Coastal Design System and Trip Pulse v2

| Field | Value |
|---|---|
| **User problem** | Visual system fragmented; hierarchy not yet editorial; known P2 quality gaps |
| **Product outcome** | Soft Coastal tokens applied; Trip Pulse hierarchy per [TRIP_PULSE_V2_SPEC.md](specs/TRIP_PULSE_V2_SPEC.md) |
| **Scope** | [SOFT_COASTAL_VISUAL_SYSTEM.md](design/SOFT_COASTAL_VISUAL_SYSTEM.md), CSS tokens, Trip Pulse composition pass |
| **Non-goals** | Readiness algorithm changes; MapLibre; data migration |
| **Dependencies** | Phase 1.2 product-owner accepted |
| **Implementation owner** | Implementation owner |
| **Review owner** | Nicole (visual), QA (responsive/a11y) |
| **Acceptance criteria** | Hierarchy: journey → selected day → guidance → readiness → shortcuts; north-star selected surface; gates at 390/768/1024/1440 |
| **Status** | **Independently verified** — product-owner acceptance pending |

**Sequencing risk:** This phase intentionally ships visual hierarchy before the Phase 2A-2C data foundation. Do not change readiness algorithms, trip facts, or `mockData.ts` conflicts in this phase. Phase 2B must include a Trip Pulse reconciliation review after structured data lands.

**Independent QA evidence (2026-07-12):** QA approved Phase 1.3 closure; evidence consolidated in clean baseline `ecd6377` on `main`. Local verification: typecheck passed; 6 test files / 48 tests passed; build passed; `git diff --check` passed; Trip Pulse responsive/a11y smoke passed at 390 / 768 / 1024 / 1440.

### Phase 1.3 quality backlog (P2 — closed in implementation)

Carry forward from QA Phase 1.2 review; addressed during Phase 1.3:

| Item | Closure |
|---|---|
| Mobile menu target is 36×36 | ✅ 44×44 + `aria-label` (`Navigation.tsx`) |
| Day Builder add controls are 24×24 | ✅ 44×44 + labels (`DayBuilder.tsx`) |
| Some icon controls lack accessible names | ✅ Trip Mode, Day Builder, mobile nav |
| Journey Ribbon “Needs logistics” label clips at 390px | ✅ `break-words` / `min-w-0` (`JourneyRibbon.tsx`) |
| Some legacy Link/Button nesting remains | ✅ `Button asChild` pattern across routes |
| Some legacy route motion is not reduced-motion gated | ✅ `page-enter`, `motion-safe:` utilities |
| Day-readiness test labeled road-trip uses a mountain fixture | ✅ `day-4` / `place-tossa` fixture |
| Trip Mode complete toggles below 44px (QA Phase 1.3) | ✅ 44×44 hit targets + preserved `aria-label`s (closure pass) |
| Ribbon mount `scrollIntoView` breaks mobile tab order (QA Phase 1.3) | ✅ Mount-scroll guard (closure pass) |

---

## Phase 1.4 — Verification, acceptance, and Phase 2A authorization

| Field | Value |
|---|---|
| **User problem** | Phase 1.3 is implemented and independently verified, but not yet product-owner accepted or baselined for data work |
| **Product outcome** | Recorded Nicole acceptance, repeatable automation path, clean merge baseline, and explicit Phase 2A authorization |
| **Scope** | Final QA evidence sync; Nicole product-owner walkthrough; CI workflow for typecheck/test/build if available; docs/control-plane sync; merge/tag/baseline prep; Phase 2A authorization checklist |
| **Non-goals** | New Trip Pulse features; Soft Coastal redesign; `mockData.ts` changes; readiness algorithm changes; journey domain model; MapLibre |
| **Dependencies** | Phase 1.3 independent QA approval — consolidated at `ecd6377` |
| **Implementation owner** | Implementation owner for docs/automation; Nicole for acceptance; QA for verification evidence |
| **Review owner** | Nicole (product-owner), QA (verification evidence) |
| **Acceptance criteria** | Gates 3 / 5 / 6 are passed or explicitly limited; Phase 1.3 marked Product-owner accepted if Nicole signs off; clean accepted baseline recorded at `ecd6377`; Phase 2A marked Authorized only after acceptance and green CI |
| **Status** | **Authorized** — closure prep in progress |

### Phase 1.4 task breakdown

| Track | Task | Owner | Done when |
|---|---|---|---|
| A — Verification | Record QA approval on clean baseline `ecd6377` | QA | Gate 5 status updated ✅ |
| A — Automation | Add CI for `pnpm run typecheck`, `pnpm run test`, `pnpm run build` | Implementation owner | Workflow committed at `ecd6377` ✅; **GitHub green run pending** |
| A — Automation | Optional repeatable browser smoke for mobile ribbon and Trip Mode 44px targets | Implementation owner | Script or documented local procedure exists |
| B — Product acceptance | Nicole walkthrough: Trip Pulse hierarchy, Soft Coastal taste, ribbon keyboard, Trip Mode controls | Nicole | Explicit accept / request polish / reject recorded |
| C — Documentation | Sync roadmap, control plane, release gates, and Trip Pulse spec | Implementation owner | No status contradictions remain ✅ |
| D — Handoff | Tag accepted baseline and authorize Phase 2A | Nicole / implementation owner | Phase 2A starts from accepted SHA — **blocked** |

**Stop rule:** Phase 2A code does not start until Nicole product-owner acceptance is recorded, GitHub CI is green, and Phase 2A is explicitly authorized.

---

## Phase 2A — Real journey domain model

| Field | Value |
|---|---|
| **User problem** | Flat types cannot express travel legs, fixed/flexible tiers, unresolved tasks |
| **Product outcome** | Typed journey domain model (not yet full content migration) |
| **Scope** | Types, domain helpers, validation rules — per Itinerary spec data model sections |
| **Non-goals** | Map UI, full mock data rewrite |
| **Dependencies** | Phase 1.4 acceptance and Phase 2A authorization |
| **Implementation owner** | Implementation owner |
| **Review owner** | reviewer (architecture read-only) |
| **Acceptance criteria** | Model supports legs, events, unresolved tasks, `TripDayKind`; no UI prose as source |
| **Status** | **Not started** — **blocked** (Gate 6 + green CI required) |

---

## Phase 2B — Spain 2026 structured data conversion

| Field | Value |
|---|---|
| **User problem** | `mockData.ts` contradicts master note (12 conflicts) |
| **Product outcome** | Mock data aligned to [source note](source/SPAIN_2026_MASTER_TRIP_NOTE.md) |
| **Scope** | `mockData.ts`, logistics, places, days including July 28 |
| **Non-goals** | Journey Map UI |
| **Dependencies** | Phase 2A domain types |
| **Implementation owner** | Implementation owner |
| **Review owner** | reviewer, QA |
| **Acceptance criteria** | Conflicts in Itinerary spec §0 resolved; booking readiness still truthful |
| **Status** | **Not started** |

---

## Phase 2C — Journey readiness validation

| Field | Value |
|---|---|
| **User problem** | Readiness rules untested against full nine-day structured trip |
| **Product outcome** | `day-readiness` + booking readiness validated on complete dataset |
| **Scope** | Tests, Trip Pulse/Logistics consistency on migrated data |
| **Non-goals** | New UI surfaces |
| **Dependencies** | Phase 2B |
| **Implementation owner** | Implementation owner |
| **Review owner** | QA |
| **Acceptance criteria** | All day kinds correct; no contradictory readiness states |
| **Status** | **Not started** |

---

## Phase 3 — Flagship map-led Itinerary

| Field | Value |
|---|---|
| **User problem** | Itinerary is a stacked list with no geography |
| **Product outcome** | Map-led journey per [ITINERARY_JOURNEY_MAP_SPEC.md](specs/ITINERARY_JOURNEY_MAP_SPEC.md) |
| **Scope** | MapLibre integration (first install), rail, selected-day panel, fallback |
| **Non-goals** | Trip Pulse redesign; Day Builder scope change |
| **Dependencies** | Phase 2A, Phase 2B, Phase 2C |
| **Implementation owner** | Implementation owner |
| **Review owner** | Nicole, reviewer, QA |
| **Acceptance criteria** | Sticky map desktop; one expanded day; Soft Coastal map styling; structured data only; map fallback; no demo crash path; bundle/performance budget recorded |
| **Status** | **Planned** — MapLibre **not installed** |

**Pre-Phase 3 spike:** A throwaway MapLibre / PMTiles / deck.gl proof may be created before Phase 3 to validate bundle size, tile loading, and sticky-panel behavior. Spike findings are planning evidence only and do not alter the phase status.

---

## Phase 4 — Inbox (Capture & Triage)

| Field | Value |
|---|---|
| **User problem** | Heavy capture form; flat triage grid |
| **Product outcome** | Fast capture + one-at-a-time triage; `deletePlace` |
| **Scope** | Inbox page per product strategy |
| **Non-goals** | AI ingestion |
| **Dependencies** | Phase 2B stable data model |
| **Implementation owner** | Implementation owner |
| **Review owner** | QA, Nicole |
| **Acceptance criteria** | Capture &lt;3 taps; keyboard triage; mobile queue default |
| **Status** | **Planned** |

---

## Phase 5 — Day Builder redesign

| Field | Value |
|---|---|
| **User problem** | No pace/load visualization |
| **Product outcome** | Pace strip; anchor visual distinction |
| **Scope** | Day Builder per product strategy |
| **Non-goals** | Drag-and-drop |
| **Dependencies** | Phase 2B data |
| **Implementation owner** | Implementation owner |
| **Review owner** | QA, Nicole |
| **Acceptance criteria** | Overload visible; anchor primary; 44px mobile targets |
| **Status** | **Planned** |

---

## Phase 6 — Logistics Wallet

| Field | Value |
|---|---|
| **User problem** | Type grouping hides urgency |
| **Product outcome** | Needs-attention pinned; leg grouping; emergency pinned |
| **Scope** | Logistics page |
| **Non-goals** | Live APIs |
| **Dependencies** | Phase 2B booking data |
| **Implementation owner** | Implementation owner |
| **Review owner** | QA, Nicole |
| **Acceptance criteria** | Matches Trip Pulse; emergency reachable |
| **Status** | **Planned** |

---

## Phase 7 — Trip Mode enhancements

| Field | Value |
|---|---|
| **User problem** | Full-day scan to find next item |
| **Product outcome** | "Right now" pin |
| **Scope** | Trip Mode |
| **Non-goals** | Maps, weather, location |
| **Dependencies** | Phase 2B data |
| **Implementation owner** | Implementation owner |
| **Review owner** | QA, Nicole |
| **Acceptance criteria** | First undone item pinned; full day below |
| **Status** | **Planned** |

---

## Phase 8 — Packing intelligence

| Field | Value |
|---|---|
| **User problem** | Packing disconnected from Trip Mode |
| **Product outcome** | Soft Coastal outfit cards; Trip Mode cross-link |
| **Scope** | Packing page |
| **Non-goals** | Auto-generated lists |
| **Dependencies** | Phase 1.3 visual system |
| **Implementation owner** | Implementation owner |
| **Review owner** | Nicole |
| **Acceptance criteria** | Outfit tied to trip; link from Trip Mode |
| **Status** | **Planned** |

---

## Phase 9 — Launch readiness

| Field | Value |
|---|---|
| **User problem** | Portfolio must survive senior critique |
| **Product outcome** | All release gates; deployable demo |
| **Scope** | Landing, Library, a11y, deploy, case study |
| **Non-goals** | Production SaaS |
| **Dependencies** | Prior phases per prioritization |
| **Implementation owner** | Implementation owner |
| **Review owner** | reviewer, QA, Nicole |
| **Acceptance criteria** | All [RELEASE_GATES.md](RELEASE_GATES.md) gates |
| **Status** | **Planned** |
