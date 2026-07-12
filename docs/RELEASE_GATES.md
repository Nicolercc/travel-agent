# TripCanvas — Release Gates

No phase reaches **Product-owner accepted** or **Released** without applicable gates.  
Status: ✅ Pass · ⏳ Pending · ❌ Fail · N/A · Waived (ADR required)

---

## Gate 1 — Product

| Field | Value |
|---|---|
| **Required evidence** | Scope matches authorized phase; non-goals respected; user-visible behavior matches spec; gaps documented |
| **Who verifies** | strategy owner (scope) + Nicole (judgment) |
| **Blocks** | Acceptance, next phase authorization |
| **Recorded in** | QA verdict, PROJECT_CONTROL_PLANE |

**Phase 1.2:** ✅ Nicole walkthrough accepted (packing reset + anchor consistency)

---

## Gate 2 — Design and responsive

| Field | Value |
|---|---|
| **Required evidence** | Layout hierarchy at **390px**, **768px**, **1024px**, **1440px**; Soft Coastal direction (when authorized); no generic UI regression |
| **Who verifies** | Nicole (visual) + QA (responsive) |
| **Blocks** | Acceptance; launch (Phase 9) |
| **Recorded in** | QA verdict, Nicole sign-off |

**Explicit breakpoints:**

| Width | Requirements |
|---|---|
| **390px** | Single column; 44px touch targets; no horizontal scroll trap |
| **768px** | Tablet layouts; rail/map stack per spec |
| **1024px** | Desktop grid (Trip Pulse 12-col); sidebar nav |
| **1440px** | Max-width container; map-dominant Itinerary when implemented |

**Phase 1.1:** ⏳ QA responsive pending; touch targets deferred to Phase 1.3 P2 backlog

---

## Gate 3 — Engineering

| Field | Value |
|---|---|
| **Required evidence** | `typecheck` + `test` + `build` pass; domain logic in shared modules; focused tests; clean documented tree |
| **Who verifies** | Implementation owner (run) + QA (diff review) |
| **Blocks** | Merge recommendation, next implementation phase |
| **Recorded in** | Implementation handoff |

**Automation rule:** A local verification run is evidence, not durable automatic verification. For a phase to claim **Automatically verified**, the same required checks should pass in CI or another repeatable automated gate. If CI is unavailable, record the limitation explicitly in the phase verdict.

**Phase 1.1:** ✅ Automatically verified (31 tests at `fad3a29`)

**Phase 1.2:** ✅ Automatically verified (48 tests at `f93653c`); blocker remediation commits `e60a7b7`, `f93653c`

**Phase 1.3:** ✅ Locally verified at `bec854c` (48 tests, typecheck, build, `git diff --check`) — CI-backed automation not yet recorded (D-030)

---

## Gate 4 — Accessibility

| Field | Value |
|---|---|
| **Required evidence** | **Keyboard** operability on primary flows; **reduced motion** honored; focus visible; color not sole signal; semantic landmarks; useful accessible names; automated a11y scan when a browser surface is available |
| **Who verifies** | QA + Nicole |
| **Blocks** | Launch (Phase 9); Phase 1.3 Trip Pulse v2 / Phase 3 Itinerary acceptance |
| **Recorded in** | QA verdict |

**Phase 1.1:** Journey Ribbon contract ✅; reduced motion on scroll ✅; touch targets and icon labels deferred to Phase 1.3 P2 backlog

**Phase 1.3:** ✅ QA closure pass approved on clean range `98b15e4..bec854c`; mobile tab order and Trip Mode 44px targets verified

---

## Gate 5 — Independent QA

| Field | Value |
|---|---|
| **Required evidence** | QA diff review on stated commit range; **interaction/state** tests; **truthful readiness** (bookings, packing, day kinds); **no contradictory states**; **persistence/reset** |
| **Who verifies** | QA only |
| **Blocks** | Phase 1.2 product-owner acceptance |
| **Recorded in** | QA verdict template in [REVIEW_TEAM_OPERATING_MODEL.md](REVIEW_TEAM_OPERATING_MODEL.md) |

**Phase 1.2:** ✅ Approved — review range `605e8e7..f93653c`; working tree clean; packing-reset and anchor-consistency reproduction passed

**Phase 1.3:** ✅ Approved — review range `98b15e4..bec854c`; clean tree; typecheck/test/build pass; responsive and a11y closure verified

---

## Gate 6 — Product-owner acceptance

| Field | Value |
|---|---|
| **Required evidence** | Nicole walkthrough; explicit accept/reject; demo story coherence |
| **Who verifies** | Nicole only |
| **Blocks** | Authorization of Phase 1.3+ implementation |
| **Recorded in** | DECISION_LOG or PROJECT_CONTROL_PLANE update |

**Rule:** **No page accepted merely because it builds.**

**Phase 1.2:** ✅ Accepted — Nicole verified packing reset and anchor consistency manually

**Phase 1.3:** ⏳ Not accepted — Nicole walkthrough pending after QA approve

---

## Gate 7 — Commit and deployment

| Field | Value |
|---|---|
| **Required evidence** | Gates 1–6 pass or waived; **clean Git state**; **atomic commits**; no secrets; post-deploy smoke; known-good demo path |
| **Who verifies** | Nicole (authorize) + implementation owner (execute) |
| **Blocks** | Deploy, public demo |
| **Recorded in** | Git history, deploy notes |

---

## Gate 8 — Demo reliability and performance

| Field | Value |
|---|---|
| **Required evidence** | Pinned known-good demo dataset; reset path works; public-demo routes do not crash; map/tile fallback when applicable; bundle or Lighthouse budget recorded for map-heavy phases |
| **Who verifies** | Implementation owner (automation) + QA (smoke) + Nicole (demo judgment) |
| **Blocks** | Phase 3 acceptance; launch (Phase 9); public portfolio demo |
| **Recorded in** | QA verdict, deploy notes |

**Phase 3 minimum:** MapLibre / PMTiles / deck.gl integration must have a non-crashing fallback and recorded performance evidence before the Itinerary can be accepted.

---

## Cross-cutting requirements

| Requirement | Gates |
|---|---|
| Truthful readiness (Pulse ↔ Logistics ↔ Packing) | 3, 5 |
| No contradictory UI states | 5 |
| Persistence survives refresh; reset restores demo | 5 |
| Keyboard behavior | 4, 5 |
| Reduced motion | 4 |
| Automated a11y coverage where practical | 3, 4 |
| Clean tree before implementation baseline | 3, 7 |
| Demo reliability and fallback paths | 7, 8 |
| Map bundle/performance budget | 8 |

---

## Waiver process

Nicole waives with written reason → ADR in [DECISION_LOG.md](DECISION_LOG.md). strategy owner records scope. Implementation owner does not self-waive.

---

## Phase gate summary

| Transition | Minimum |
|---|---|
| **1.1 → 1.2 (acceptance)** | Engineering ✅; Gates 5–6 ✅ |
| **1.2 → 1.3 (Soft Coastal visual)** | Phase 1.2 product-owner accepted ✅ |
| **1.3 → 1.4 (acceptance gate)** | Phase 1.3 implementation independently verified ✅ |
| **1.4 → 2A → 2B → 2C (data foundation)** | Phase 1.3 product-owner accepted; Phase 2A explicitly authorized |
| **2C → 3 (map-led Itinerary)** | Phases 2A, 2B, 2C complete; D-029 spike findings reviewed if performed |
| **→ Launch (Phase 9)** | All eight gates |

**Approved sequence after acceptance:** Phase 1.3 → Phase 1.4 → Phase 2A → Phase 2B → Phase 2C → Phase 3

**Phase 1.3 P2 backlog** (Phase 1.2 carry-forward): **closed in implementation** — see [PRODUCT_ROADMAP.md](PRODUCT_ROADMAP.md) closure table. Final QA QA approved; Nicole acceptance still required.
