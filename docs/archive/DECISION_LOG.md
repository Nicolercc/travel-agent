# TripCanvas — Decision Log

ADR-lite format. Newest first.

---

## D-034 — Phase 2A authorization

| Field | Value |
|---|---|
| **ID** | D-034 |
| **Date / phase** | 2026-07-12 / Phase 1.4 (handoff) |
| **Decision** | Nicole authorizes Phase 2A — Real journey domain model |
| **Rationale** | Phase 1.4 gate criteria met: Phase 1.3 product-owner accepted (D-033), CI-backed green runs on `main` (D-030), clean baseline at `ecd6377` (D-032) |
| **Consequence** | Phase 1.4 is **closed**; Phase 2A implementation is **authorized**; scope limited to domain types, helpers, and validation rules per Itinerary spec — no `mockData.ts` rewrite, no map UI |
| **Revisit if** | Domain model scope expands beyond Phase 2A non-goals or conflicts with accepted Trip Pulse hierarchy |

**Evidence:** Nicole statement (2026-07-12): *"I authorize Phase 2A"*. Prerequisites: D-033 ✅; D-030 CI green ✅; baseline `ecd6377` on `main`.

---

## D-033 — Phase 1.3 product-owner acceptance

| Field | Value |
|---|---|
| **ID** | D-033 |
| **Date / phase** | 2026-07-12 / Phase 1.4 (Gate 6) |
| **Decision** | Nicole product-owner accepts Phase 1.3 — Soft Coastal Design System and Trip Pulse v2 |
| **Rationale** | Gate 6 requires explicit product-owner sign-off before Phase 2A authorization; implementation and independent QA were already verified with CI-backed green runs |
| **Consequence** | Phase 1.3 is **closed**; Phase 1.4 handoff track B is complete; Phase 2A remains blocked until Nicole explicitly authorizes Phase 2A |
| **Revisit if** | Material regressions in Trip Pulse hierarchy, Soft Coastal taste, ribbon keyboard behavior, or Trip Mode controls |

**Evidence:** Nicole statement (2026-07-12): *"I accept Phase 1.3"*. Accepted application baseline: `ecd6377` on `main`. CI-backed verification: [run #29206845270](https://github.com/Nicolercc/travel-agent/actions/runs/29206845270), [run #29219042442](https://github.com/Nicolercc/travel-agent/actions/runs/29219042442).

---

## D-032 — Clean GitHub baseline reset

| Field | Value |
|---|---|
| **ID** | D-032 |
| **Date / phase** | 2026-07-12 / Phase 1.4 |
| **Decision** | Reset repository to a clean single-commit baseline on `main` at `ecd6377`, pushed to https://github.com/Nicolercc/travel-agent, superseding prior git history |
| **Rationale** | Portfolio-ready GitHub presence requires no legacy provider attribution, no old history, and a known-good demo baseline |
| **Consequence** | All phase evidence references consolidate to `ecd6377`; prior commit SHAs and feature-branch names are historical only and must not appear in active control-plane docs |
| **Revisit if** | A new accepted baseline is tagged after Phase 1.3 product-owner acceptance |

**Evidence:** Local typecheck passed; 6 test files / 48 tests passed; build passed; `.github/workflows/ci.yml` present; pushed to `main`.

---

## D-031 — Phase 1.4 inserted as acceptance and 2A authorization gate

| Field | Value |
|---|---|
| **ID** | D-031 |
| **Date / phase** | 2026-07-12 / Phase 1.4 |
| **Decision** | Insert Phase 1.4 between Phase 1.3 and Phase 2A for final verification, Nicole product-owner acceptance, repeatable automation, merge prep, and explicit Phase 2A authorization |
| **Rationale** | Phase 1.3 implementation is independently verified, but Phase 2A should not start until acceptance evidence, baseline hygiene, and automation expectations are recorded |
| **Consequence** | Phase 1.4 is a non-feature gate phase; it must not modify `mockData.ts`, readiness logic, trip facts, MapLibre, or Phase 2A domain code |
| **Revisit if** | Nicole waives Gate 6 or CI remains unavailable after local verification is recorded |

**Evidence:** QA approved Phase 1.3 closure; evidence consolidated in clean baseline `ecd6377`. Local verification: typecheck passed; 6 test files / 48 tests passed; build passed; responsive/a11y smoke passed at 390 / 768 / 1024 / 1440.

---

## D-030 — CI-backed gates and demo reliability

| Field | Value |
|---|---|
| **ID** | D-030 |
| **Date / phase** | 2026-07-12 / Process hardening |
| **Decision** | "Automatically verified" requires repeatable automation, preferably CI, for typecheck, tests, build, and applicable accessibility/performance checks |
| **Rationale** | A one-time local verification run is useful evidence, but it becomes stale after the next commit |
| **Consequence** | Release gates now distinguish local evidence from CI-backed verification; Phase 3 and Phase 9 must include demo reliability, fallback, and performance-budget evidence |
| **Revisit if** | CI is unavailable for the repository |

**Evidence (2026-07-12):** GitHub Actions CI green on `main` at `ecd6377` ([run #29206845270](https://github.com/Nicolercc/travel-agent/actions/runs/29206845270)) and `6096a81` ([run #29219042442](https://github.com/Nicolercc/travel-agent/actions/runs/29219042442)); verified via GitHub API.

---

## D-029 — Map integration spike before Phase 3

| Field | Value |
|---|---|
| **ID** | D-029 |
| **Date / phase** | 2026-07-12 / Technical risk |
| **Decision** | A disposable, non-authoritative MapLibre / PMTiles / deck.gl spike may run before Phase 3 without starting Phase 3 implementation |
| **Rationale** | First-install map risk is high: bundle size, tile loading, browser behavior, sticky-panel interaction, and library compatibility should be learned before the flagship Itinerary phase |
| **Consequence** | Spike work must not merge production map code, alter the roadmap order, or become a trip-fact source; findings are archived and feed Phase 3 planning |
| **Revisit if** | Phase 3 scope or mapping stack changes |

---

## D-028 — Phase 1.3 before data foundation accepts bounded rework risk

| Field | Value |
|---|---|
| **ID** | D-028 |
| **Date / phase** | 2026-07-12 / Phase 1.3 sequencing |
| **Decision** | Keep Phase 1.3 Soft Coastal + Trip Pulse v2 before Phases 2A-2C, while explicitly accepting rework risk when the real journey model and structured Spain data land |
| **Rationale** | Portfolio velocity matters: Soft Coastal tokens and the Trip Pulse screenshot create value sooner, even though composition may need reconciliation after data migration |
| **Consequence** | Phase 1.3 must avoid readiness-algorithm and trip-fact churn; Phase 2B includes a UI reconciliation review for Trip Pulse surfaces touched by structured data |
| **Revisit if** | Phase 2A/2B introduces domain changes that invalidate Phase 1.3 hierarchy |

---

## D-027 — Phase 1.3 P2 backlog from Phase 1.2 QA

| Field | Value |
|---|---|
| **ID** | D-027 |
| **Date / phase** | 2026-07-10 / Phase 1.2 close |
| **Decision** | Seven P2 findings from QA Phase 1.2 review are deferred to Phase 1.3 quality backlog — not Phase 1.2 blockers |
| **Rationale** | Phase 1.2 scope was state-consistency only; a11y/responsive polish belongs in Soft Coastal pass |
| **Consequence** | Backlog recorded in PRODUCT_ROADMAP and RELEASE_GATES; Phase 1.2 closed without P2 remediation |
| **Revisit if** | Phase 1.3 acceptance |

**P2 items:** mobile menu 36×36; Day Builder add controls 24×24; unnamed icon controls; Journey Ribbon “Needs logistics” clip at 390px; legacy Link/Button nesting; legacy route motion not reduced-motion gated; day-readiness road-trip test uses mountain fixture.

---

## D-026 — Phase 1.2 accepted

| Field | Value |
|---|---|
| **ID** | D-026 |
| **Date / phase** | 2026-07-10 / Phase 1.2 |
| **Decision** | Phase 1.2 is **Independently verified**, **Product-owner accepted**, and **Closed** |
| **Rationale** | Independent QA approved Phase 1.2; Nicole manually verified packing reset and anchor consistency; evidence consolidated at `ecd6377` |
| **Consequence** | Phase 1.3 application implementation authorized |
| **Revisit if** | Regression found in accepted flows |

**Evidence:** Working tree clean; typecheck passed; 6 test files / 48 tests passed; build passed; packing-reset and anchor-consistency reproduction passed.

---

## D-025 — Visual refresh planned until verified

| Field | Value |
|---|---|
| **ID** | D-025 |
| **Date / phase** | 2026-07-10 / Documentation |
| **Decision** | Soft Coastal and Trip Pulse v2 remain **Planned** until implemented, automatically verified, independently verified, and product-owner accepted |
| **Rationale** | Do not conflate documentation approval with shipped UI |
| **Consequence** | Current code retains legacy leg-accent tokens until Phase 1.3 |
| **Revisit if** | Phase 1.3 acceptance recorded |

---

## D-024 — Map explanatory, not decorative

| Field | Value |
|---|---|
| **ID** | D-024 |
| **Date / phase** | 2026-07-10 / Itinerary spec |
| **Decision** | Journey map consumes structured journey data; no decorative autoplay; fallback when map fails |
| **Rationale** | Map must answer geographic and readiness questions |
| **Consequence** | Itinerary spec requires data foundation before UI |
| **Revisit if** | Map scope reduced for portfolio |

---

## D-023 — Map-led Itinerary: one expanded day

| Field | Value |
|---|---|
| **ID** | D-023 |
| **Date / phase** | 2026-07-10 / Itinerary spec |
| **Decision** | Flagship Itinerary uses sticky map + compact rail + **one** expanded selected day panel |
| **Rationale** | Hierarchy and calm over stacked duplicate cards |
| **Consequence** | Phase 3 scope defined in ITINERARY_JOURNEY_MAP_SPEC |
| **Revisit if** | Mobile-only constraints require variant |

---

## D-022 — Trip Pulse hierarchy

| Field | Value |
|---|---|
| **ID** | D-022 |
| **Date / phase** | 2026-07-10 / Trip Pulse v2 spec |
| **Decision** | Trip Pulse v2 hierarchy: journey → selected day → guidance → readiness → shortcuts |
| **Rationale** | Emotional experience and scan order |
| **Consequence** | TRIP_PULSE_V2_SPEC is authoritative for Phase 1.3 visual pass |
| **Revisit if** | PO rejects after prototype |

---

## D-021 — Light-blue selected day as north star

| Field | Value |
|---|---|
| **ID** | D-021 |
| **Date / phase** | 2026-07-10 / Soft Coastal |
| **Decision** | Mist/powder blue selected-day surface is the visual north star |
| **Rationale** | Existing UI already points toward correct emotional tone |
| **Consequence** | Design and Trip Pulse v2 specs reference this surface |
| **Revisit if** | Accessibility audit requires adjustment |

---

## D-020 — No terracotta/saffron/olive primary brand

| Field | Value |
|---|---|
| **ID** | D-020 |
| **Date / phase** | 2026-07-10 / Soft Coastal |
| **Decision** | Orange, terracotta, saffron, burgundy, olive are **not** the primary visible brand system |
| **Rationale** | Avoid travel-cliché palette and rainbow destination themes |
| **Consequence** | SOFT_COASTAL_VISUAL_SYSTEM supersedes archived UX spec §7.4 leg hues |
| **Revisit if** | Nicole explicitly revisits brand direction |

---

## D-019 — Destination personality without color themes

| Field | Value |
|---|---|
| **ID** | D-019 |
| **Date / phase** | 2026-07-10 / Soft Coastal |
| **Decision** | Destination character via imagery, texture, route geometry, copy — not unrelated per-destination color themes |
| **Rationale** | Cohesive blue–plum system across Menorca, Costa Brava, Barcelona, Montserrat |
| **Consequence** | Replace per-leg terracotta/turquoise/gold accents in future implementation |
| **Revisit if** | Multi-trip product requires per-trip palettes (out of scope) |

---

## D-018 — Soft Coastal blue–plum product system

| Field | Value |
|---|---|
| **ID** | D-018 |
| **Date / phase** | 2026-07-10 / Design |
| **Decision** | Canonical visual identity is Soft Coastal blue–plum per SOFT_COASTAL_VISUAL_SYSTEM.md |
| **Rationale** | "Soft coastal travel journal" — fashionable, organized, slightly romantic |
| **Consequence** | Phase 1.3 implements tokens; archive terracotta directions |
| **Revisit if** | PO rejects after Phase 1.3 mockup |

---

## D-017 — Archive historical prompts

| Field | Value |
|---|---|
| **ID** | D-017 |
| **Date / phase** | 2026-07-10 / Documentation |
| **Decision** | July 2026 audit prompts and UX redesign proposal archived under `docs/archive/2026-07-product-audit/` — non-authoritative |
| **Rationale** | Prevent stale prompts from overriding canonical operating model |
| **Consequence** | REVIEW_TEAM_OPERATING_MODEL is sole orchestration source |
| **Revisit if** | New audit round creates new archive folder |

---

## D-016 — One canonical source per concern

| Field | Value |
|---|---|
| **ID** | D-016 |
| **Date / phase** | 2026-07-10 / Documentation |
| **Decision** | One source of truth per concern; conflict order in docs/README.md |
| **Rationale** | Reduce workflow drift and duplicate maps |
| **Consequence** | FEATURE_SERVICE_MAP merged into PRODUCT_STRATEGY; reviews/ dissolved |
| **Revisit if** | Repo splits packages |

---

## D-015 — Documentation entry point

| Field | Value |
|---|---|
| **ID** | D-015 |
| **Date / phase** | 2026-07-10 / Documentation |
| **Decision** | `docs/README.md` is the only documentation entry point; PROJECT_CONTROL_PLANE is operational dashboard |
| **Rationale** | Token-efficient task routing |
| **Consequence** | Restructured docs/ tree |
| **Revisit if** | External docs site added |

---

## D-014 — No page accepted because code builds

| Field | Value |
|---|---|
| **ID** | D-014 |
| **Date / phase** | 2026-07-10 / Phase 1.1 |
| **Decision** | Acceptance requires Nicole sign-off per RELEASE_GATES, not green CI alone |
| **Rationale** | Portfolio bar is product quality |
| **Consequence** | Phase 1.1 not product-owner accepted |
| **Revisit if** | Automated visual regression substitutes |

---

## D-013 — July 28 day deferred to structured data phase

| Field | Value |
|---|---|
| **ID** | D-013 |
| **Date / phase** | 2026-07-10 / Phase 1.1 |
| **Decision** | July 28 `TripDay` not added in 1.1; report gap |
| **Rationale** | Full itinerary in Phase 2B structured data |
| **Consequence** | Trip starts Jul 28; first day Jul 29 in mock data |
| **Revisit if** | Phase 2B begins |

---

## D-012 — Explicit TripDayKind for readiness

| Field | Value |
|---|---|
| **ID** | D-012 |
| **Date / phase** | 2026-07-10 / Phase 1.1 |
| **Decision** | `TripDayKind` drives readiness; logistics-primary for arrival/transfer/departure |
| **Rationale** | No anchor-only heuristics |
| **Consequence** | `day-readiness.ts` in codebase |
| **Revisit if** | New day types in domain foundation |

---

## D-011 — Unified booking readiness

| Field | Value |
|---|---|
| **ID** | D-011 |
| **Date / phase** | 2026-07-10 / Phase 1.1 |
| **Decision** | `computeBookingReadiness()` over SavedPlace + LogisticsItem |
| **Rationale** | Pulse/Logistics contradiction fix |
| **Consequence** | `booking-readiness.ts` |
| **Revisit if** | Phase 2B data changes confirmations |

---

## D-010 — Packing total from shared data

| Field | Value |
|---|---|
| **ID** | D-010 |
| **Date / phase** | 2026-07-10 / Phase 1.1 |
| **Decision** | `packing-data.ts` canonical; 31 actionable items |
| **Rationale** | Hardcoded 33 broke Ready state |
| **Consequence** | Shared keys with Packing page |
| **Revisit if** | List content changes |

---

## D-009 — Trip Pulse navigation label

| Field | Value |
|---|---|
| **ID** | D-009 |
| **Date / phase** | 2026-07-10 / Phase 1 |
| **Decision** | Nav label **Trip Pulse** for `/dashboard` |
| **Rationale** | PO lock |
| **Consequence** | Other nav renames deferred |
| **Revisit if** | Full IA rename approved |

---

## D-008 — Master note as trip fact authority

| Field | Value |
|---|---|
| **ID** | D-008 |
| **Date / phase** | 2026-07-10 / Data planning |
| **Decision** | the private master trip note (kept outside the public repository) wins over `mockData.ts` on conflict |
| **Rationale** | 12 documented conflicts |
| **Consequence** | Phase 2B migration |
| **Revisit if** | Demo trip changes |

---

## D-007 — Itinerary as flagship journey (Phase 3)

| Field | Value |
|---|---|
| **ID** | D-007 |
| **Date / phase** | 2026-07-10 / Planning |
| **Decision** | Map-led Itinerary after data foundation |
| **Rationale** | Geographic orientation job |
| **Consequence** | ITINERARY_JOURNEY_MAP_SPEC; MapLibre planned not installed |
| **Revisit if** | Map scope changes |

---

## D-006 — Role implementation split

| Field | Value |
|---|---|
| **ID** | D-006 |
| **Date / phase** | 2026-07-10 |
| **Decision** | Implementation owner implements; reviewer reviews; QA verifies; strategy owner scopes |
| **Rationale** | One writer |
| **Consequence** | REVIEW_TEAM_OPERATING_MODEL |
| **Revisit if** | Tooling changes |

---

## D-005 — No backend / auth / fake AI

| Field | Value |
|---|---|
| **ID** | D-005 |
| **Date / phase** | Product definition |
| **Decision** | Mock data + localStorage; no AI theater |
| **Rationale** | Portfolio honesty |
| **Consequence** | Client-side only |
| **Revisit if** | Production pivot |

---

## D-004 — React/Vite/Tailwind lock

| Field | Value |
|---|---|
| **ID** | D-004 |
| **Date / phase** | Product definition |
| **Decision** | No framework migration |
| **Rationale** | Polish over replatform |
| **Consequence** | Current stack |
| **Revisit if** | Deploy requires otherwise |

---

## D-003 — Core triage model

| Field | Value |
|---|---|
| **ID** | D-003 |
| **Date / phase** | Pre–Phase 0 |
| **Decision** | anchor / booked / planned / optional / backup / do-not-cram |
| **Rationale** | Differentiator |
| **Consequence** | Day Builder, Inbox, Trip Mode |
| **Revisit if** | Extend only — do not replace lightly |

---

## D-002 — Product promise

| Field | Value |
|---|---|
| **ID** | D-002 |
| **Date / phase** | Product definition |
| **Decision** | Turn scattered inspiration into calm days you will actually enjoy. |
| **Rationale** | Emotional + practical positioning |
| **Consequence** | Guides all phases |
| **Revisit if** | Positioning research |

---

## D-001 — Target user

| Field | Value |
|---|---|
| **ID** | D-001 |
| **Date / phase** | Product definition |
| **Decision** | Designated planner, experience-heavy leisure |
| **Rationale** | Sharp portfolio wedge |
| **Consequence** | Feature evaluation lens |
| **Revisit if** | User research pivot |

---

## Sequencing ADR (Nicole-approved 2026-07-10)

| Field | Value |
|---|---|
| **ID** | D-SEQ-01 |
| **Decision** | After Phase 1.2 acceptance: Soft Coastal (**Phase 1.3**) → journey domain (**Phase 2A**) → Spain data (**Phase 2B**) → readiness validation (**Phase 2C**) → map Itinerary (**Phase 3**) |
| **Rationale** | Visual identity before data migration; full data foundation before map UI |
| **Consequence** | Canonical phase numbering in PRODUCT_ROADMAP |
| **Revisit if** | Nicole reprioritizes |
