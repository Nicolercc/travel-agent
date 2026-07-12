# TripCanvas

A calm travel planning prototype that turns messy saves into realistic curated days.

## Project documentation

Start with the [TripCanvas documentation system](docs/README.md) for the
current phase, product strategy, active specifications, team responsibilities,
and release gates.

## Run Locally

```sh
pnpm install
pnpm run dev
```

## Quality Checks

```sh
pnpm run typecheck
pnpm run test
pnpm run build
```

## Deploy

Recommended for a portfolio demo:

- Platform: Vercel or Netlify
- Build command: `pnpm run build`
- Output directory: `artifacts/travel-planner/dist/public`

This repo is currently an interactive prototype with mock data and browser-local persistence, not a production travel-data backend.
