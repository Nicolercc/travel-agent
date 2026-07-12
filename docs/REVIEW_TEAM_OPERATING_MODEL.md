# TripCanvas — Review Team Operating Model

**Status:** Canonical orchestration document.
Historical one-time prompts live in [archive/2026-07-product-audit/](archive/2026-07-product-audit/) — **non-authoritative**.

---

## Roles

### Nicole — Product owner

- Final product and visual authority
- Approves or rejects user-facing behavior
- Resolves taste and priority decisions
- Authorizes phase start, waivers, and commits

### strategy owner — Product and engineering lead

- Controls integration, sequencing, scope, acceptance criteria
- Converts product intent into phase briefs
- Reconciles conflicting review recommendations
- Does **not** edit application code

### Implementation owner

- Only role that edits `artifacts/travel-planner/**` during authorized phases
- May edit `docs/**` when assigned a documentation phase
- Must not expand scope independently or auto-start next phase
- Returns evidence and handoff after every pass
- Commits only when Nicole explicitly requests

### reviewer — Read-only Distinguished reviewer

- Reviews specifications, architecture, accessibility, product coherence
- Does **not** edit application code unless explicitly reassigned

### QA — Independent verification engineer

- Reviews **committed** diffs and interaction/state behavior
- Produces approve / request-changes verdicts
- Does **not** redesign accepted direction or edit code concurrently with the implementation owner
- "Independent" means read-only second-pass QA against a stated range; stronger independence comes from different methods such as CI, automated a11y scans, visual checks, and reproducible browser smoke tests

---

## One-writer rule

1. Only **one** contributor edits application code at a time.
2. That role is the **implementation owner**, only within an authorized phase.
3. reviewer and QA file findings; they do not patch.
4. Documentation passes: one assigned writer (this pass: implementation owner on `docs/**` only).

---

## No concurrent code edits

- Never assign implementation owner and QA implementation tasks in parallel on the same branch.
- Serialize: Implementation owner implements → commits (when authorized) → QA verifies.
- If QA finds P0 issues, implementation owner gets a **fix scope** before next phase.

---

## Phase workflow

```
1. strategy owner defines phase → brief references PRODUCT_ROADMAP + active spec
2. Nicole authorizes phase (or delegates in prompt)
3. Implementation owner preconditions: clean tree, branch, typecheck/test/build baseline
4. Implementation owner implements → validates → implementation handoff
5. Nicole requests commit (optional) → atomic commit on feature branch
6. QA: read-only second-pass QA on stated commit range → QA verdict
7. reviewer: read-only review (if scheduled)
8. strategy owner synthesizes → go/no-go
9. Nicole: product-owner acceptance gate
10. Update PROJECT_CONTROL_PLANE + DECISION_LOG if decisions made
```

**Status progression:** Planned → Authorized → In implementation → Implemented → Automatically verified → Independently verified → Product-owner accepted → Released

**Verification honesty:** Keep the status vocabulary, but do not overclaim it. local local commands are evidence; **Automatically verified** should be CI-backed or explicitly marked as local-only evidence. QA approval is second-pass verification, not a substitute for automated checks or Nicole's product-owner judgment.

---

## Preconditions (implementation)

Before the implementation owner edits application code:

- [ ] `git status` clean (or only expected WIP on assigned branch)
- [ ] Correct branch per control plane
- [ ] Phase status Authorized or In implementation
- [ ] Active spec read (`docs/specs/` for feature work)
- [ ] Baseline: `pnpm run typecheck && pnpm run test && pnpm run build`

---

## Stop conditions

Stop and escalate (strategy owner → Nicole) when:

- Unauthorized phase or scope creep
- Dirty tree before implementation baseline
- Spec conflict without DECISION_LOG resolution
- Acceptance gate required but not satisfied
- Concurrent writer detected
- MapLibre, data migration, or visual system requested outside authorized phase

---

## Clarification rule

If domain types make a requirement impossible without guessing: ask Nicole or strategy owner **at most three precise questions**, then stop. Do not improvise product behavior.

---

## Standard implementation handoff (implementation owner)

```markdown
## Phase [N] — [Name] Handoff

### Checkpoint
- Branch:
- Commit (if committed):
- Baseline: typecheck / test / build

### Behavior changed
- [User-visible bullet]

### Files touched
- `path` — why

### Validation
- typecheck: PASS/FAIL
- test: PASS/FAIL (N)
- build: PASS/FAIL

### Gaps / deferred
- [Explicit]

### Blockers
- [If any]

### Suggested commit message
[When Nicole requests commit]
```

---

## Standard reviewer handoff (reviewer)

```markdown
## Review — [Phase or scope]

### Verdict
[Approve / request changes / blocked]

### P0 / P1 findings
| Severity | Issue | Path | Recommendation |

### Product coherence
[Brief]

### Architecture / a11y
[Brief]

### Recommended next action
[For strategy owner/Nicole]
```

Use [archive audit brief](archive/2026-07-product-audit/TEAM_AUDIT_BRIEF.md) output shape for deep audits — archive is reference only.

---

## Standard QA verdict (QA)

```markdown
## QA Verdict — [Phase]

### Commit range
`[base]..[head]` (e.g. `85970c4..fad3a29`)

### Verdict
**Approve** | **Request changes**

### Release gates
| Gate | Pass/Fail | Notes |

### Findings (severity order)
| P | Issue | Repro | Path |

### Interaction states tested
- [ ] Navigation / persistence / reset
- [ ] Readiness truth (bookings, packing, day kinds)
- [ ] 390 / 768 / 1024 / 1440 layouts
- [ ] Keyboard / reduced motion (where applicable)
- [ ] Automated checks reviewed (CI if available; local-only limitation stated)

### Blockers for acceptance
[List]
```

---

## Commit ownership

- **Nicole** authorizes commits.
- **Implementation owner** executes `git commit` only when asked.
- Commits must be **atomic** and message reflects *why*.
- Never force-push `main` without explicit request.

---

## Branch ownership

| Branch type | Purpose |
|---|---|
| `fix/*`, `feat/*` | Application implementation |
| `docs/*` | Documentation passes (this branch) |
| `main` | Released / accepted checkpoints |

QA QA references **exact commit range** supplied in task prompt.

---

## Updating documentation after acceptance

When Nicole accepts a phase:

1. Update [PROJECT_CONTROL_PLANE.md](PROJECT_CONTROL_PLANE.md) status table
2. Update [PRODUCT_ROADMAP.md](PRODUCT_ROADMAP.md) phase status
3. Add ADR to [DECISION_LOG.md](DECISION_LOG.md) if new locked decision
4. Update [RELEASE_GATES.md](RELEASE_GATES.md) gate rows

---

## Communicating commit ranges

strategy owner or Nicole supplies in QA prompt:

```
Commit range: BASE_SHA..HEAD_SHA
Branch: feature-or-gate-branch-name
Phase: current phase name
Spec: relevant spec path, if applicable
```

QA verifies **committed** history only unless explicitly told to review working tree.

---

## Historical prompts vs canonical instructions

| Use | Source |
|---|---|
| **Current work** | This file + PROJECT_CONTROL_PLANE + active specs |
| **Historical context** | [archive/2026-07-product-audit/](archive/2026-07-product-audit/) |

Archived prompts must not override canonical docs. Reusable templates live in this file; feature-specific scope lives in `docs/specs/`.

---

## Token-efficient routing

Contributors read **only** what their task requires — see [README.md](README.md) routing table. Do not read the full archive or master note unless the task requires trip facts or historical context.
