# TripCanvas — Project Control Plane

**Last updated:** 2026-07-12
**Application baseline:** Phase 1.3 independently verified at `bec854c93a4f06a45eb14c83e163129e8cfbba6f`
**Documentation baseline:** Phase 1.4 gate phase authorized

---

## Product promise

**Turn scattered inspiration into calm days you will actually enjoy.**

## Target user

The designated planner for an experience-heavy leisure trip who has saved more ideas than can realistically fit and wants a beautiful, flexible plan without becoming a spreadsheet user.

---

## Current phase status

| Item | Status |
|---|---|
| Product definition | Substantially complete |
| Phase 1 Trip Pulse | **Implemented** |
| Phase 1.1 truthfulness & hardening | **Implemented** · **Automatically verified** |
| Phase 1.2 QA QA + Nicole acceptance | **Independently verified** · **Product-owner accepted** · **Closed** |
| Phase 1.3 Soft Coastal + Trip Pulse v2 | **Independently verified** — product-owner acceptance pending |
| Phase 1.4 verification, acceptance, and 2A authorization | **Authorized** — current gate phase |
| Phase 2A journey domain model | **Not started** |
| Phase 2B Spain structured data | **Not started** |
| Phase 2C journey readiness validation | **Not started** |
| Phase 3 map-led Itinerary | **Planned** |
| New application implementation | **Paused** — awaiting Phase 1.4 acceptance and Phase 2A authorization |

**Last completed implementation:** Phase 1.3 application work on `main`, independently verified on range `98b15e4..bec854c`.
**Active verification/acceptance:** Phase 1.4 — Nicole product-owner acceptance, CI/local automation evidence, merge baseline, and Phase 2A authorization.

---

## Verification and acceptance

| Gate | Status |
|---|---|
| Automated typecheck / test / build | Passed locally at `bec854c` — 6 test files / 48 tests; build passed; CI not yet recorded |
| Independent QA QA (Phase 1.2) | **Approved** — review range `605e8e7..f93653c` |
| Nicole product-owner acceptance (Phase 1.2) | **Accepted** — packing reset and anchor consistency verified manually |
| Independent QA QA (Phase 1.3) | **Approved** — review range `98b15e4..bec854c`; clean tree; responsive/a11y closure passed |
| Nicole product-owner acceptance (Phase 1.3) | **Not recorded** |
| Phase 1.4 authorization | **Authorized** — non-feature gate phase; do not start Phase 2A code |

**Phase 1.2 evidence:** Working tree clean at acceptance; typecheck, test, build, packing-reset reproduction, and anchor-consistency reproduction all passed.

**Phase 1.3 evidence collected (closure pass):** clean tree; typecheck/test/build pass locally; `git diff --check` pass; P2 backlog closed; ribbon mount-scroll guard; Trip Mode 44px complete/skip targets; responsive smoke at 390/768/1024/1440 without page-level horizontal overflow; QA approve verdict.

**Phase 1.4 evidence still required:** Nicole product-owner walkthrough; CI-backed automation when available or explicitly recorded as local-only evidence (D-030); accepted baseline / merge SHA before Phase 2A authorization.

---

## Next authorized application sequence

**Phase 1.4** is the next authorized gate phase:

1. **Phase 1.4** — Verification, acceptance, and Phase 2A authorization
2. **Phase 2A** — Real journey domain model
3. **Phase 2B** — Spain 2026 structured data conversion
4. **Phase 2C** — Journey readiness validation
5. **Phase 3** — Flagship map-led Itinerary

See [PRODUCT_ROADMAP.md](PRODUCT_ROADMAP.md) for Phases 4–9.

**Non-authoritative spike exception:** D-029 authorizes a disposable map integration spike before Phase 3. It is planning evidence only; it must not merge production map code or alter the accepted phase order.

---

## Current blockers

| Blocker | Notes |
|---|---|
| `mockData.ts` vs master note conflicts | 12 documented — resolved in Phase 2B |
| July 28 `TripDay` missing | Deferred to Phase 2B |
| Phase 1.3 product-owner acceptance | Nicole PO walkthrough — **not recorded** |
| Phase 1.4 automation evidence | CI-backed gates not recorded; local evidence exists (D-030 limitation) |
| Phase 1.3 P2 quality backlog | **Closed** in implementation (see [PRODUCT_ROADMAP.md](PRODUCT_ROADMAP.md)) |
| Map first-install risk | Disposable spike authorized by D-029; production implementation remains Phase 3 |

---

## Locked decisions

- **Trip Pulse** nav label for `/dashboard`
- React/Vite/Tailwind; no backend/auth; no fake AI
- Implementation owner; reviewer read-only; QA verifies; strategy owner scopes; Nicole approves
- `TripDayKind` readiness semantics (no anchor-only heuristics)
- Current `SavedPlace` assignment is authoritative for anchor status (not static `anchor_place_id`)
- Master note = trip fact authority; code = implementation truth for what exists today
- **Soft Coastal** blue–plum system — not terracotta destination themes
- No page accepted merely because it builds
- Phase 1.3 before data foundation accepts bounded rework risk (D-028)
- Early map spike is disposable planning evidence only, not Phase 3 implementation (D-029)
- "Automatically verified" should be CI-backed when available (D-030)
- Phase 1.4 is a non-feature gate phase before Phase 2A (D-031)

Full log: [DECISION_LOG.md](DECISION_LOG.md)

---

## Document map

| Document | Role |
|---|---|
| [README.md](README.md) | **Only entry point** |
| [PRODUCT_STRATEGY.md](PRODUCT_STRATEGY.md) | Product definition |
| [PRODUCT_ROADMAP.md](PRODUCT_ROADMAP.md) | Phases |
| [REVIEW_TEAM_OPERATING_MODEL.md](REVIEW_TEAM_OPERATING_MODEL.md) | Role orchestration |
| [RELEASE_GATES.md](RELEASE_GATES.md) | Quality gates |
| [DECISION_LOG.md](DECISION_LOG.md) | ADRs |
| [design/SOFT_COASTAL_VISUAL_SYSTEM.md](design/SOFT_COASTAL_VISUAL_SYSTEM.md) | Visual identity |
| [specs/TRIP_PULSE_V2_SPEC.md](specs/TRIP_PULSE_V2_SPEC.md) | Phase 1.3 spec |
| [specs/ITINERARY_JOURNEY_MAP_SPEC.md](specs/ITINERARY_JOURNEY_MAP_SPEC.md) | Phase 3 spec |
| [source/SPAIN_2026_MASTER_TRIP_NOTE.md](source/SPAIN_2026_MASTER_TRIP_NOTE.md) | Trip facts |
| [archive/2026-07-product-audit/](archive/2026-07-product-audit/) | Historical — non-authoritative |

---

## May work proceed?

1. Read this file and [README.md](README.md) routing for your role.
2. Confirm branch and authorized phase in [PRODUCT_ROADMAP.md](PRODUCT_ROADMAP.md).
3. **Implementation owner:** edit code only in an authorized implementation phase on the assigned branch.
4. **reviewer / QA:** read-only unless explicitly reassigned.
5. Do not invent accepted or independently verified work.
6. When blocked, stop — do not expand scope.

**Current authorization:** Phase 1.4 gate work is **authorized**. Phase 1.3 application work is independently verified at `bec854c`, but **do not start Phase 2A+** until Nicole product-owner acceptance is recorded and Phase 2A is explicitly authorized. D-029 permits only a disposable, non-authoritative map spike before Phase 3.

---

## Stop conditions

Stop and escalate to strategy owner → Nicole when:

- Phase not listed as Authorized or In implementation
- Working tree not clean before an implementation pass
- Conflicting specs without DECISION_LOG resolution
- Request touches `mockData.ts`, MapLibre, or Phase 2A+ code without authorization
- Another contributor is actively editing application code
