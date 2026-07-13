# TripCanvas Documentation

**Entry point for all contributors.** Start here — do not read every file for every task.

TripCanvas turns scattered travel inspiration into **calm days you will actually enjoy** for the designated planner of an experience-heavy leisure trip.

---

## Current status

> This status table summarizes [PROJECT_CONTROL_PLANE.md](PROJECT_CONTROL_PLANE.md), which remains the canonical operational status source. (checkpoint `ecd6377`)

| Item | Status |
|---|---|
| Phase 1 Trip Pulse | Implemented |
| Phase 1.1 hardening | Implemented · Automatically verified |
| Phase 1.2 independent QA + Nicole acceptance | Independently verified · Product-owner accepted · Closed |
| Phase 1.3 Soft Coastal / Trip Pulse v2 | Independently verified — PO acceptance pending |
| Phase 1.4 verification / acceptance / 2A authorization | Authorized — closure prep in progress |
| Phase 2A / 2B / 2C journey data | Not started — **Phase 2A blocked** |
| Phase 3 map-led Itinerary | Planned — not started |

**Current branch:** `main`
**GitHub:** https://github.com/Nicolercc/travel-agent
**Current authorization:** Phase 1.4 gate work only — no Phase 2A code until Nicole acceptance, green CI, and explicit authorization.

---

## Document authority

| Tier | Documents | Authority |
|---|---|---|
| **Control** | PROJECT_CONTROL_PLANE, DECISION_LOG, RELEASE_GATES | Operational truth |
| **Product** | PRODUCT_STRATEGY, PRODUCT_ROADMAP | What we build and why |
| **Design** | design/SOFT_COASTAL_VISUAL_SYSTEM.md | Visual identity (planned implementation) |
| **Specs** | specs/* | Authorized future behavior |
| **Source** | source/SPAIN_2026_MASTER_TRIP_NOTE.md | Trip **facts** |
| **Code** | artifacts/travel-planner/ | What **exists** today |
| **Archive** | archive/2026-07-product-audit/ | **Historical only** — non-authoritative |

---

## Read this based on your task

| Task | Read (in order) |
|---|---|
| **Every contributor** | [PROJECT_CONTROL_PLANE.md](PROJECT_CONTROL_PLANE.md) |
| **Product strategy** | PRODUCT_STRATEGY · PRODUCT_ROADMAP · DECISION_LOG |
| **Implementation** | PROJECT_CONTROL_PLANE · roadmap phase · relevant `specs/` · RELEASE_GATES |
| **Design implementation** | SOFT_COASTAL_VISUAL_SYSTEM · relevant spec |
| **reviewer review** | PROJECT_CONTROL_PLANE · relevant spec · DECISION_LOG · RELEASE_GATES |
| **QA** | PROJECT_CONTROL_PLANE · relevant spec · RELEASE_GATES · **commit SHA in prompt** |
| **Trip facts** | source/SPAIN_2026_MASTER_TRIP_NOTE.md |

**Orchestration:** [REVIEW_TEAM_OPERATING_MODEL.md](REVIEW_TEAM_OPERATING_MODEL.md)

---

## Active documents

### Control plane

- [PROJECT_CONTROL_PLANE.md](PROJECT_CONTROL_PLANE.md)
- [PRODUCT_STRATEGY.md](PRODUCT_STRATEGY.md)
- [PRODUCT_ROADMAP.md](PRODUCT_ROADMAP.md)
- [REVIEW_TEAM_OPERATING_MODEL.md](REVIEW_TEAM_OPERATING_MODEL.md)
- [RELEASE_GATES.md](RELEASE_GATES.md)
- [DECISION_LOG.md](DECISION_LOG.md)

### Design

- [design/SOFT_COASTAL_VISUAL_SYSTEM.md](design/SOFT_COASTAL_VISUAL_SYSTEM.md)

### Specifications (planned features)

- [specs/TRIP_PULSE_V2_SPEC.md](specs/TRIP_PULSE_V2_SPEC.md)
- [specs/ITINERARY_JOURNEY_MAP_SPEC.md](specs/ITINERARY_JOURNEY_MAP_SPEC.md)

### Source material

- [source/SPAIN_2026_MASTER_TRIP_NOTE.md](source/SPAIN_2026_MASTER_TRIP_NOTE.md)

### Application

- [../README.md](../README.md) — run, build, deploy
- [../artifacts/travel-planner/](../artifacts/travel-planner/) — codebase

---

## Canonical vs archived

**Canonical** — governs current and future work.  
**Archived** — [archive/2026-07-product-audit/](archive/2026-07-product-audit/) records July 2026 audit process. May contain stale branches, terracotta palettes, one-time prompts. **Do not override canonical docs.**

---

## Conflict resolution order

When documents disagree, apply in order:

1. Nicole's explicit current product decisions
2. [DECISION_LOG.md](DECISION_LOG.md)
3. [PROJECT_CONTROL_PLANE.md](PROJECT_CONTROL_PLANE.md)
4. Active files under `specs/`
5. [PRODUCT_STRATEGY.md](PRODUCT_STRATEGY.md) and [PRODUCT_ROADMAP.md](PRODUCT_ROADMAP.md)
6. [source/SPAIN_2026_MASTER_TRIP_NOTE.md](source/SPAIN_2026_MASTER_TRIP_NOTE.md) for **trip facts**
7. **Committed application code** for what is implemented today
8. **Archive** — never controls current work

**Nuance:** Master note = factual truth for migration. Code = present behavior. Specs = authorized future. Archive = history only.

---

## ⚠️ Archive warning

Files under `archive/` are **historical and non-authoritative**. They may reference `product-audit-cleanup`, terracotta leg accents, or outdated phase status. Begin every task at this README or PROJECT_CONTROL_PLANE.
