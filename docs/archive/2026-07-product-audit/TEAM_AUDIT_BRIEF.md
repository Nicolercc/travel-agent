# TripCanvas Staff+ Audit Brief

## Mission

Audit TripCanvas as if it is being prepared for a portfolio launch, a senior product critique, and a polished online demo. The desired bar is not "working CRUD." The desired bar is a calm, beautiful, useful consumer travel-planning prototype that feels smarter than a spreadsheet and credible enough to present to a product/design/engineering panel.

## Product Thesis

TripCanvas turns messy travel inspiration into realistic, curated days. The core flow is:

Inbox source save -> assign to day -> Day Builder -> Trip Mode.

The app should help travelers do less, better. It should prevent overstuffed days, make optional ideas easy to use on the ground, and make booked/logistical info easy to find under pressure.

## Current State

- React/Vite/Tailwind app in `artifacts/travel-planner`.
- Mock Spain 2026 demo trip.
- Browser-local persistence for places, Trip Mode item states, and packing checks.
- Static prototype, not a production backend.
- Current branch: `product-audit-cleanup`.
- Important docs: `README.md`, `PRODUCT_AUDIT.md`.

## Target User To Validate

Primary hypothesis: high-intent leisure travelers who save too many places across TikTok, Instagram, Google Maps, blogs, and notes, then need to turn that chaos into a trip they can actually follow.

Likely traits:

- Plans visually and emotionally, not only logistically.
- Wants taste, flexibility, and a sense of calm.
- Travels with many saved ideas but limited time/energy.
- Needs a clean mobile mode during the trip.
- Hates bloated itinerary apps and spreadsheet friction.

## Review Output Format

Return findings in this format:

1. Target user assessment
   - Who is the app really for?
   - Who is it not for?
   - What user pain is sharpest?

2. Highest-impact product opportunities
   - Rank by expected user love, not implementation novelty.
   - Separate "must before portfolio launch" from "later roadmap."

3. UX/UI critique across screen sizes
   - Desktop, tablet, mobile.
   - Navigation, information density, hierarchy, touch targets, empty states, responsiveness.
   - Identify anything that looks generated, generic, or insufficiently premium.

4. Engineering/code quality risks
   - Bugs, state model problems, type-safety gaps, deploy risks, performance issues.

5. Actionable recommendations
   - Each recommendation should include priority: P0, P1, P2, P3.
   - Include file paths when relevant.
   - Favor concrete product/design/code moves over abstract advice.

## Quality Bar

Be direct. Assume the owner wants excellence, not politeness theater. Praise only what is genuinely strong. Call out features that should be deleted, delayed, or repositioned.
