# TripCanvas — Project Control Plane

**Last updated:** 2026-07-12
**Application baseline:** `ecd6377` — Initial TripCanvas baseline on `main`
**GitHub remote:** https://github.com/Nicolercc/travel-agent
**Documentation baseline:** Phase 2A authorized

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
| Phase 1.1 truthfulness & hardening | **Implemented** · **Automatically verified** (consolidated at `ecd6377`) |
| Phase 1.2 independent QA + Nicole acceptance | **Independently verified** · **Product-owner accepted** · **Closed** |
| Phase 1.3 Soft Coastal + Trip Pulse v2 | **Product-owner accepted** · **Closed** |
| Phase 1.4 verification, acceptance, and 2A authorization | **Closed** |
| Phase 2A journey domain model | **Implemented** · **Automatically verified** (local; CI pending) — not yet consumed by UI |
| Phase 2B Spain structured data | **In implementation** — structured dataset + `mockData.ts` corrections landed; not yet consumed by UI |
| Phase 2C journey readiness validation | **Not started** |
| Phase 3 map-led Itinerary | **Planned** |
| New application implementation | **Authorized** — Phase 2A; Phase 2B pending explicit authorization |

**Repository reset:** Clean single-commit history on `main` at `ecd6377`, pushed to GitHub. Prior commit ranges are superseded; application evidence is consolidated in this baseline.

**Active implementation phase:** Phase 2A implemented (D-034); Phase 2B in implementation pending explicit authorization.

---

## Verification and acceptance

| Gate | Status |
|---|---|
| Automated typecheck / test / build | **Passed locally** at `ecd6377` — 6 test files / 48 tests; build passed |
| GitHub Actions CI | **Passed (CI-backed)** — green on `ecd6377` and `6096a81` ([run #29206845270](https://github.com/Nicolercc/travel-agent/actions/runs/29206845270), [run #29219042442](https://github.com/Nicolercc/travel-agent/actions/runs/29219042442)) |
| Independent QA (Phase 1.2) | **Approved** — evidence consolidated at `ecd6377` |
| Nicole product-owner acceptance (Phase 1.2) | **Accepted** — packing reset and anchor consistency verified manually |
| Independent QA (Phase 1.3) | **Approved** — evidence consolidated at `ecd6377`; responsive/a11y closure passed |
| Nicole product-owner acceptance (Phase 1.3) | **Accepted** — 2026-07-12; Nicole: *"I accept Phase 1.3"* (D-033) |
| Phase 1.4 authorization | **Closed** — gate complete (D-034) |
| Phase 2A authorization | **Authorized** — 2026-07-12; Nicole: *"I authorize Phase 2A"* (D-034) |

**Phase 1.4 evidence collected:** clean GitHub baseline pushed to `main` at `ecd6377`; local typecheck/test/build pass; docs/control-plane sync; CI workflow committed; Phase 1.3 product-owner acceptance (D-033); Phase 2A authorization (D-034).

**Phase 1.4 optional follow-up:** accepted-baseline tag on `main` (Nicole-owned commit).

---

## Next authorized application sequence

**Phase 2B** is the current implementation phase:

1. **Phase 2A** — Real journey domain model *(implemented)*
2. **Phase 2B** — Spain 2026 structured data conversion *(in implementation — authorization pending)*
3. **Phase 2C** — Journey readiness validation
4. **Phase 3** — Flagship map-led Itinerary

See [PRODUCT_ROADMAP.md](PRODUCT_ROADMAP.md) for Phases 4–9.

**Non-authoritative spike exception:** D-029 authorizes a disposable map integration spike before Phase 3. It is planning evidence only; it must not merge production map code or alter the accepted phase order.

---

## Current blockers

| Blocker | Notes |
|---|---|
| `mockData.ts` vs master note conflicts | 12 documented — corrections applied to `mockData.ts` in Phase 2B work; §0 resolution not yet independently verified |
| Phase 2B authorization | `mockData.ts` corrections and `src/data/journey/` exceed D-034's stated Phase 2A scope — Nicole to ratify or narrow |
| Journey dataset not consumed by UI | `src/data/journey/` and `src/lib/journey/` are exercised only by tests; UI still reads `mockData.ts` |
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
- Clean GitHub baseline on `main` at `ecd6377` supersedes prior history (D-032)

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
4. **Reviewer / QA:** read-only unless explicitly reassigned.
5. Do not invent accepted or independently verified work.
6. When blocked, stop — do not expand scope.

**Current authorization:** Phase 2A is **authorized** (D-034) and implemented. Phase 2B data work exists in the tree but still needs explicit authorization. Do not expand into map UI or MapLibre. D-029 permits only a disposable, non-authoritative map spike before Phase 3.

---

## Stop conditions

Stop and escalate to strategy owner → Nicole when:

- Phase not listed as Authorized or In implementation
- Working tree not clean before an implementation pass
- Conflicting specs without DECISION_LOG resolution
- Request touches `mockData.ts`, MapLibre, or Phase 2A+ code without authorization
- Another contributor is actively editing application code
