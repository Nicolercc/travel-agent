# Is this day realistic? — the day-load engine

TripCanvas answers one question for every day: **will this day actually work?** The answer is one of
four ordinal verdicts, the reasons behind it, and — when a day is Tight or Overloaded — the single
change that helps most.

| Verdict | Meaning to a traveler |
|---|---|
| **Comfortable** | Room to wander. |
| **Full** | A full day with some breathing room. |
| **Tight** | It fits, with little room for delays or too much effort for the day's energy. |
| **Overloaded** | It does not fit as planned: plans overlap, or they need more time than the day has. |

Code: `artifacts/travel-planner/src/lib/domain/day-load.ts` (engine) and
`planning-heuristics.ts` (every number the engine uses). Tests: `day-load.test.ts`.

## Honesty rules

The numbers are **planning heuristics, not measurements**. So:

- Durations are shown rounded to 15 minutes and prefixed "about"; no percentages are ever shown.
- When most committed time comes from category estimates, the verdict carries an **estimate**
  label and the reason "Based mostly on typical durations. Add times to firm this up."
- Verdicts are words, never scores.

## Inputs

Everything is derived from the trip model — nothing is typed in as "load".

| Input | Source | Rule |
|---|---|---|
| Usable day | `DAY_WINDOW` | 08:30–22:00 |
| Busy blocks | Timed flight / ferry / train legs, blocking appointments | A flight blocks from *departure − buffer* (150 min international, 90 other) to *arrival + 45 min*. A leg that departed earlier blocks from the start of the day; a leg that leaves the trip (the flight home) or lands tomorrow blocks to the end of the day. Appointments (`airport`, `pickup`, `return`, `departure`) block their window, 30 min if only a start is known. |
| Committed plans | Places placed **anchor** or **planned** | Duration = the plan's own duration, else its time window, else a labelled category estimate. |
| Optional plans | Places placed **optional** | Never counted. Each is marked *fits* / *won't fit*. |
| Backup, do-not-cram | Placements | Never counted anywhere in load. |
| Moves | Day start (origin) → plans → overnight base | 15 min same area, 30 min same city, 60 min different city. Timed plans in time order, then untimed plans in plan order. |
| Energy | Plan effort (or category default) + a long-haul arrival | low 1 · medium 2 · high 3, against the day's energy mode (calm travel day 3 · soft 4 · medium 6 · full-controlled 7 · full 8). |

## Algorithm

```
available  = usable day − union(busy blocks)
committed  = Σ plan durations + Σ moves
slack      = available − committed
verdict    = Overloaded  if any overlap, or committed > available
             Tight       if energy > budget, or (plans exist and (slack < 60 min or committed/available > 0.85))
             Full        if plans exist and (committed/available > 0.60 or energy = budget)
             Comfortable otherwise
```

**Reasons**, in this order: `TIME_CONFLICT`, `OVER_CAPACITY`, `LOW_SLACK`, `ENERGY_OVER_BUDGET`,
`MANY_AREAS` (more than 2 areas; not on road-trip days), `SHORT_WINDOW` (under 6 hours free),
`TRAVEL_DAY_SQUEEZE` (more than one plan on a flight, arrival, or departure day),
`OPTIONAL_WONT_FIT`, `MOSTLY_ESTIMATED`, `NO_ANCHOR` (experience-type days only).

**Optional fit:** an optional plan fits when inserting it into the day's sequence (with its moves)
stays within the available time and it overlaps nothing.

**Suggestion** (Tight or Overloaded only): try demoting each non-anchor committed plan to optional.
Among the demotions that improve the day (a better verdict, or the same verdict with fewer
reasons), pick the **lowest-priority** plan; within a priority, the bigger improvement, then the
longer plan, then id order. The anchor is never suggested.

## Guarantees (each is a test)

- **Deterministic** — integer minutes, no clock, no I/O; equal input → equal output; input is not mutated.
- **Monotonic** — committing an optional plan never improves a day; demoting a plan never worsens it
  (the move estimates satisfy the triangle inequality, so inserting a stop never shortens a route).
- **Isolated** — optional, backup, and do-not-cram plans never change committed load or the verdict.
- **Suggestions help** — applying a suggestion always produces the promised, strictly better result.
- **Centralized** — `day-load.ts` contains no numeric literals besides 0 and 1.

## Pinned outcomes for the Spain 2026 seed

| Day | Verdict | Why |
|---|---|---|
| Tue Jul 28 — JFK departure | Comfortable | Nothing planned; about 7½ hours at home before the airport. |
| Wed Jul 29 — arrival | Comfortable | Layover and Cova are optional; both fit. Committing Cova → **Tight** (energy on a long-haul arrival day). |
| Thu Jul 30 — coves | Full | Two coves plus the Ciutadella evening. Adding Turqueta and Líthica → **Overloaded**; the suggestion cuts a medium-priority extra, never a must-do. |
| Fri Jul 31 — Binibeca | Comfortable | A soft day. |
| Sat Aug 1 — road trip | Full | Committing the third stop (Sa Tuna) → **Tight**, matching the trip's own rule "two beaches max"; the suggestion is Sa Tuna itself. |
| Sun Aug 2 — La Roca | Comfortable | |
| Mon Aug 3 — Montserrat | Comfortable · estimate | Montserrat plans have no durations yet. |
| Tue Aug 4 — Barcelona | Full · estimate | Vintage shops, Sagrada Família at 2:00 PM, Passeig de Gràcia, and the hotel move. |
| Wed Aug 5 — departure | Comfortable | No free time (`SHORT_WINDOW`), and nothing planned. |

## Decisions made during implementation (deviations from RFC-001 §7)

1. **Busy blocks instead of one window.** RFC §7 described a single window narrowed at each end.
   Jul 29 has a Barcelona morning, a midday flight, and a Menorca evening, which one window cannot
   represent. Subtracting blocks from the usable day generalizes the RFC rule (it reduces to it on
   simple days).
2. **Check-in / check-out times do not block.** "Check-in from 3:00 PM" is not a 3:00 PM
   appointment; treating it as one made La Roca (3:00 PM) conflict with the hotel check-in.
3. **Suggestion is priority-first.** RFC §7 ranked the biggest improvement first. On the overloaded
   Jul 30 scenario that suggested cutting the must-do Ciutadella evening instead of the extras just
   added. Travelers protect their must-dos, so priority now leads; improvement breaks ties.
4. **No MANY_AREAS on road-trip days.** Covering several towns is the point of a road trip.
5. **Transitions compare city before area.** Two "Old Town" areas in different towns are not a
   15-minute walk.
6. **Pinned expectations differ from RFC §7's design targets:** Aug 4 is **Full**, not Tight (the
   engine counts about 4½ hours of slack once check-out is non-blocking), and Jul 28 has no
   `SHORT_WINDOW` (about 7½ hours are free before leaving for JFK). The Tight → Full demonstration
   moves to Aug 1, where it follows the trip's own "two beaches max" rule.

Changing any heuristic is a product decision: update `planning-heuristics.ts`, record the reason
here, and update the pinned outcomes.
