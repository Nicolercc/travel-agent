# TripCanvas Product Audit

## Executive Read

TripCanvas has a strong product core: it is not "another itinerary CRUD app." The differentiated promise is turning messy travel inspiration into realistic, calm days you can actually use while traveling.

The current app is a polished clickable prototype. It is close to portfolio-ready as a static product demo, but not yet production-grade. The right next move is to deploy the demo, write the case study, and only then decide whether the app deserves a real backend.

## What Is Working

- Clear product spine: Inbox -> Day Builder -> Trip Mode.
- Good mental model: anchor, booked, planned, optional, backup, and do-not-cram.
- Trip Mode is correctly treated as the hero surface.
- Planning Health makes the product feel smarter than a spreadsheet without pretending to be AI.
- Mock Spain data is specific enough to make the app feel real.
- The code is already split into pages, context, types, data, layout, and UI primitives.
- Demo interactions now persist locally, so the app survives refreshes during a walkthrough.
- Source intake is honest: users add a title, city, area, category, notes, and a source link without pretending scraping exists.

## What Was Missing Before Cleanup

- Host-specific files, plugins, comments, and metadata were still present.
- The repo contained unused backend, database, generated API, script, and mockup sandbox scaffolding.
- The Vite app required host-specific environment variables to run.
- Metadata still referenced the original scaffold instead of the product.
- The repo looked more complex than the product actually is, which weakens portfolio presentation.

## Product Gaps To Close Next

1. Improve Day Builder ergonomics.
   - Add drag-and-drop ordering.
   - Add time windows and travel-time warnings.
   - Add quick section moves with icon buttons, not only select menus.

2. Strengthen Trip Mode.
   - Add "Now / Next / Later" grouping.
   - Add offline-friendly saved state.
   - Add quick links for maps, tickets, hotel, and transit.
   - Add "I'm tired" or "nearby only" filters to reveal backups.

3. Improve planning intelligence.
   - Warn when a day has too many walking-heavy items.
   - Show missing reservations, missing addresses, and long-distance mismatches.
   - Surface "near this area" suggestions using city + neighborhood, not GPS.

4. Sharpen the visual system.
   - Current warm editorial direction is pleasant, but a little monochrome.
   - Add a tighter brand palette with one confident accent color.
   - Use real destination imagery sparingly for landing/trip-library polish.
   - Keep operational screens calm, dense, and scannable.

5. Add quality gates.
   - Unit-test planning-health helpers once extracted.
   - Add Playwright smoke tests for the core flow.
   - Add deploy preview checks before portfolio publication.

## Second-Pass Audit Findings

- The biggest remaining product risk is not feature count; it is whether the core flow feels effortless on mobile.
- The app should be presented as an interactive prototype, not a production SaaS.
- The current best demo path is: Landing -> Spain Demo -> Inbox -> save a source -> assign it to a day -> Day Builder -> Trip Mode -> mark one item done -> refresh to show persistence.
- The next meaningful engineering move is extracting planning-health logic into pure helpers with tests.
- The next meaningful design move is replacing the text-heavy landing preview with stronger destination imagery and tighter visual contrast.

## Engineering Recommendation

Keep the current app static for the portfolio launch. Do not pretend it is a full production SaaS yet. A polished deployed prototype with a crisp case study is more credible than a half-wired backend.

Suggested build sequence from here:

1. Deploy the static prototype on Vercel or Netlify.
2. Write a concise portfolio case study around the core flow.
3. Extract planning logic into pure tested helpers.
4. Run mobile visual QA on Landing, Inbox, Day Builder, and Trip Mode.
5. Add Supabase auth/database only when you want real private trips.
6. Add AI/link ingestion as a deliberate feature, not a hidden dependency.

## Portfolio Recommendation

Deploy it. Do not leave it only as open source.

Best portfolio positioning:

- Live demo: deployed TripCanvas Spain prototype.
- GitHub repo: public if you are comfortable showing the implementation.
- Case study: explain the product problem, product principles, interaction model, tradeoffs, and roadmap.
- Honest status label: "interactive prototype" or "product prototype."

Recommended deploy target: Vercel for speed and clean preview URLs. Netlify is also fine. Use the root command `pnpm run build` and output directory `artifacts/travel-planner/dist/public`.

## Open Source Recommendation

Keep the repo public only if the code remains clean and no personal travel details, private URLs, or API keys are present. For a portfolio, public source helps when the repo demonstrates taste and engineering hygiene. If the next phase adds private trip data or paid API keys, keep the production repo private and publish a sanitized demo repo.

## Founder-Level Product Bar

TripCanvas should feel like:

- faster than a spreadsheet,
- calmer than Google Maps lists,
- less generic than Notion,
- more useful on the sidewalk than a PDF itinerary,
- opinionated enough to say "do less today."

That last point is the soul of the product. The app should not help users cram more into a trip. It should help them make better days.
