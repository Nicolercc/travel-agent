# Soft Coastal Visual System

**Status:** Canonical design system — **planned for implementation**, not yet applied in code.  
**Supersedes:** Terracotta/saffron/olive destination palettes, rainbow category pills, and per-leg hue themes from the July 2026 audit archive.

---

## Product feel

> A soft coastal travel journal designed by someone fashionable, thoughtful, organized, and slightly romantic.

**Required qualities:** coastal · feminine · polished · romantic without sugary · editorial without cold · cohesive across every destination · calm but not empty · expressive but not decorative for decoration's sake.

---

## Anti-direction

- Beige productivity dashboard
- Corporate readiness report
- Rainbow destination themes
- Terracotta / saffron / olive travel cliché palette
- Boho scrapbook
- Heavy gradients, glassmorphism, random blobs
- Constant animation
- Passport-stamp clichés
- Low-contrast pastel text
- Every card a different color

---

## Raw palette tokens

### Core neutrals

| Token | Hex |
|---|---|
| `--paper` | `#FAF7F2` |
| `--warm-ivory` | `#F4F0EA` |
| `--soft-stone` | `#E9E3DD` |

### Blue family

| Token | Hex |
|---|---|
| `--mist-blue` | `#E1EEF0` |
| `--powder-blue` | `#C9DEE2` |
| `--sea-glass` | `#B6D2D6` |
| `--coastal-blue` | `#78AEB7` |
| `--deep-coastal-blue` | `#467C86` |

### Plum family

| Token | Hex |
|---|---|
| `--mist-lilac` | `#E7DFE8` |
| `--dusty-lilac` | `#CBBECC` |
| `--soft-plum` | `#8A748B` |
| `--deep-plum` | `#5C475E` |

### Text

| Token | Hex |
|---|---|
| `--ink` | `#302A2E` |
| `--muted-ink` | `#746D72` |

### Attention

| Token | Hex |
|---|---|
| `--attention-bg` | `#F2E8EF` |
| `--attention-fg` | `#704E67` |

---

## Semantic tokens

Raw palette feeds semantic roles. Implementation must map these in CSS/Tailwind — do not hardcode unrelated hues in components.

| Role | Typical use |
|---|---|
| **Canvas** | Page background (`--paper`, `--warm-ivory`) |
| **Elevated surface** | Cards on canvas (`--warm-ivory`, subtle border) |
| **Selected surface** | Active day, active rail chip (`--mist-blue`, `--powder-blue`) — **visual north star** |
| **Brand surface** | Hero atmosphere washes (`--sea-glass` at low opacity) |
| **Primary action** | Main CTA (`--deep-coastal-blue` on light text) |
| **Secondary action** | Outline/ghost (`--coastal-blue` border) |
| **Quiet action** | Tertiary links (`--muted-ink`) |
| **Focus** | Focus ring (`--coastal-blue` / `--deep-coastal-blue`) |
| **Ready** | Completed/secured (`--coastal-blue` + label/icon) |
| **In progress** | Partial (`--sea-glass` background) |
| **Attention** | Needs action (`--attention-bg`, `--attention-fg`) |
| **Critical** | Blocking unresolved (`--deep-plum` accent + icon, never color alone) |
| **Route selected** | Active journey segment (`--deep-coastal-blue`) |
| **Route secondary** | Inactive segment (`--dusty-lilac`) |
| **Route unresolved** | Dashed unresolved (`--soft-plum`) |
| **Border subtle** | Dividers (`--soft-stone`) |
| **Text primary** | Body headings (`--ink`) |
| **Text secondary** | Captions (`--muted-ink`) |

### Approximate balance

- 60% paper and warm ivory
- 25% soft blue and sea glass
- 10% plum and lilac
- 5% dark ink and emphasis

---

## Accessibility

**Do not assume every supplied pairing passes WCAG AA.** Verify contrast at implementation time, especially:

- Text on `--mist-blue` / `--powder-blue` selected surfaces
- Attention badges on `--attention-bg`
- Map labels on water/land fills

**Rules:** color never the sole signal; pair hue with icon/label; respect `prefers-reduced-motion`.

---

## Typography

| Role | Treatment |
|---|---|
| **Display** | Fraunces — editorial headlines, trip title |
| **Narrative** | Fraunces italic — `day_vibe`, outfit notes, romantic copy |
| **UI / body** | Inter — controls, lists, metadata |
| **Label** | Inter semibold uppercase tracking — section headers, readiness |

---

## Spacing rhythm

- Generous vertical rhythm (`space-y-8`–`12` between major sections)
- Tighter inside cards (`space-y-3`–`5`)
- Mobile: preserve breathing room; do not compress to dashboard density

---

## Corner radius

- Page sections: `rounded-2xl`
- Chips/rail items: `rounded-xl`
- Buttons: `rounded-lg`–`xl` by hierarchy
- Avoid pill overload — reserve full pills for status chips only

---

## Borders and elevation

- Default content: spacing + typography hierarchy, not boxed cards everywhere
- Elevated: hero, selected day, modals — subtle border (`--soft-stone`) + minimal shadow
- No shadow on every list row

---

## Button hierarchy

1. **Primary** — deep coastal blue fill; one per viewport section
2. **Secondary** — outline coastal blue
3. **Quiet** — text/ghost muted ink
4. **Destructive** — rare; plum attention, not red alarm

---

## Cards and selected states

- **Default card:** warm ivory surface, subtle border
- **Selected day card:** mist/powder blue wash — **north star for Trip Pulse v2 and Itinerary selected panel**
- **Hover:** slight background shift, no scale bounce

---

## Status presentation

Three tiers for planning weight (not eleven category hues):

| Tier | Meaning | Treatment |
|---|---|---|
| **Committed** | Booked, anchor | Ink + coastal accent |
| **Planned** | Planned, optional | Neutral secondary |
| **Deprioritized** | Backup, do-not-cram | Muted, reduced opacity |

Readiness dimensions: compact truthful chips — Ready / In progress / Needs attention.

---

## Icons

- Lucide monoline, `muted-ink` default
- Status icons paired with text
- No emoji as UI chrome

---

## Map styling (Itinerary)

Map is **explanatory, not decorative.**

| Element | Treatment |
|---|---|
| Water | Mist/sea-glass family |
| Land | Paper/warm ivory |
| Selected route | `--deep-coastal-blue` solid |
| Secondary route | `--dusty-lilac` |
| Unresolved route | `--soft-plum` dashed |
| Route halo | Ivory/paper outline for legibility |
| Transport | No random per-mode colors — weight and dash pattern only |
| Markers | Coastal blue fill; unresolved = icon badge + label |

**Fallback:** Static route strip in same palette when MapLibre unavailable.

---

## Motion

- Page enter: quiet fade (respect reduced motion)
- State changes: 150–200ms (check/skip, readiness)
- Map camera: smooth default; `jumpTo` when reduced motion
- No autoplay journey animation

---

## Responsive principles

| Breakpoint | Intent |
|---|---|
| **390px** | Mobile primary; 44px touch targets; single column |
| **768px** | Tablet; rail below map; no horizontal trap |
| **1024px** | Desktop split; sticky map + rail |
| **1440px** | Max content width; map dominant on Itinerary |

---

## Destination expression

Personality through **imagery, texture, route geometry, and copy** — not unrelated color themes.

| Destination | Expression |
|---|---|
| **Menorca** | Water contours; spacious rounded composition; mist-blue emphasis |
| **Costa Brava** | Cliff/coastline geometry; stronger coastal-blue route form; same palette |
| **Barcelona** | Architectural grid; sharper rhythm; plum line details; no new hue family |
| **Montserrat** | Topographic linework; dusty lilac + pale blue; no olive requirement |

---

## Do / Don't

| Do | Don't |
|---|---|
| Use selected mist-blue surface for active day | Assign terracotta per Costa Brava leg |
| Keep one cohesive blue–plum system | Rainbow category pills |
| Let map explain geography | Decorative map with no data binding |
| Pair status color with label/icon | Rely on hue alone |
| Verify contrast at implementation | Ship pastel-on-pastel without check |

---

## Implementation status

| Item | Status |
|---|---|
| Design tokens documented | Canonical (this file) |
| CSS variables in app | Implemented — `--sc-*` tokens in `artifacts/travel-planner/src/index.css`. Two text tokens were darkened for WCAG AA contrast (muted ink 44%→39% lightness; status-progress text 40%). |
| Trip Pulse v2 visual pass | Shipped, then revised by RFC-001 — [TRIP_PULSE_V2_SPEC.md](TRIP_PULSE_V2_SPEC.md) |
| Itinerary map styling | Not built. The Itinerary uses a small SVG Route diagram instead of a map (see [ARCHITECTURE.md](../ARCHITECTURE.md)); the map spec is archived: [ITINERARY_JOURNEY_MAP_SPEC.md](../archive/ITINERARY_JOURNEY_MAP_SPEC.md) |
