# Trip Pulse v2 — Specification

**Status:** **Independently verified** — product-owner acceptance pending.
**Phase:** 1.3 — Soft Coastal Design System and Trip Pulse v2.
**Depends on:** Phase 1.2 closure (QA independent QA + Nicole product-owner acceptance).
**Does not modify:** Readiness truth model (`booking-readiness`, `day-readiness`, `packing-storage`) unless separately authorized.
**Branch:** `main` — QA approved review range `98b15e4..bec854c`.

---

## Purpose

Refine Trip Pulse hierarchy and emotional experience under the [Soft Coastal Visual System](../design/SOFT_COASTAL_VISUAL_SYSTEM.md). This is **not a recolor** — it is a composition and priority pass.

**Visual north star:** The current light-blue selected-day card surface (`--mist-blue` / `--powder-blue` family).

---

## Target hierarchy (top to bottom)

1. **Journey** — navigate the trip; ribbon/rail is primary
2. **Selected day** — one expanded day context (atmosphere + logistics or anchor story)
3. **Guidance** — next best actions, "before you go"
4. **Readiness** — compact truthful dimensions
5. **Navigation shortcuts** — Quick Access (deduplicated against guidance)

---

## Hero atmosphere

- Soft coastal wash derived from brand surface tokens — not destination rainbow
- Trip title, phase label (days until / traveling / completed), date range
- Optional cover imagery when available — editorial crop, not full-bleed noise
- Fraunces display typography

---

## Selected-day position

- **Immediately below journey navigation** — not competing with hero stats grid
- Selected surface: mist/powder blue wash (north star)
- Content by `TripDayKind`:
  - Logistics-primary days: secured travel logistics list
  - Anchor-required days: anchor + pace summary
- Day vibe in narrative italic (Fraunces)
- Single primary CTA: Open Day Builder or Trip Mode when appropriate

---

## "Before you go" presentation

- Replaces scattered health warnings
- Max 3 prioritized actions from `computeNextBestActions`
- Plain language; attention surface for blocking items
- No duplicate Quick Access links for same destinations

---

## Compact truthful readiness

- Dimensions: bookings, packing, itinerary shape (per `TripDayKind` rules)
- Chips: Ready · In progress · Needs attention
- Must match Logistics and Packing pages — no contradictions

---

## Journey navigation

- Preserve Journey Ribbon accessibility contract (`tablist` / `tab` / `tabpanel`)
- `scrollIntoView` on select; `prefers-reduced-motion` respected
- Status badges from `getDayRibbonStatus` — not anchor-only
- Route visualization: compact SVG strip (no MapLibre on Trip Pulse)

---

## Button hierarchy

Per Soft Coastal system: one primary per section; secondary outline; quiet ghost for tertiary.

---

## Blue–plum application

| Area | Token direction |
|---|---|
| Page canvas | Paper / warm ivory |
| Selected day | Mist / powder blue |
| Readiness attention | Attention bg/fg |
| Primary CTA | Deep coastal blue |
| Secondary links | Coastal blue outline |
| Critical unresolved | Deep plum accent + icon |

---

## Responsive behavior

| Breakpoint | Layout |
|---|---|
| **390px** | Single column; journey rail horizontal scroll; readiness below guidance |
| **768px** | Same stack; wider selected-day card |
| **1024px** | 12-column grid: journey + selected day left; readiness + shortcuts right |
| **1440px** | Max width container; preserve hierarchy |

---

## Accessibility preservation

- Do not replace ribbon keyboard contract
- Focus rings on all interactive controls
- Status never color-only
- Touch targets ≥44px at 390px
- Reduced motion on scroll and enter animations

---

## Non-goals

- MapLibre on Trip Pulse
- Itinerary redesign
- Readiness algorithm changes
- New backend or AI features
- Destination-specific color themes

---

## Acceptance criteria

- [x] Hierarchy matches § Target hierarchy — journey above selected day above guidance (editorial hero precedes journey)
- [x] Selected day uses mist/powder blue north-star surface
- [x] ≤3 next-best actions; Quick Access deduplicated
- [x] Readiness dimensions truthful vs Logistics/Packing (logic unchanged in Phase 1.3)
- [x] Ribbon a11y contract preserved (keyboard + reduced-motion scroll; mount-scroll guard in closure pass)
- [x] Passes design gate at 390 / 768 / 1024 / 1440 (no page-level horizontal overflow observed)
- [ ] Nicole product-owner acceptance recorded
- [x] QA independent QA pass on interaction states (`98b15e4..bec854c`)

---

## Current implementation (Phase 1.3)

Phase 1.3 applied Soft Coastal semantic tokens, journey-first Trip Pulse composition, P2 interaction-quality fixes, and closure hardening (`JourneyRibbon` mount-scroll guard, Trip Mode 44px complete/skip targets). Readiness algorithms and `mockData.ts` were not modified.

**Pending before acceptance:** Nicole product-owner walkthrough; CI-backed automation when available or local-only limitation recorded per D-030.
