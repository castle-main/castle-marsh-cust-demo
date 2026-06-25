# Castle Internal — Customer Research

A searchable directory of customer companies and their **modeled risk exposures**, used for
pre-call discovery: before Castle hops on a call, we open the company here and understand the
political / regulatory / macro events that move their business — and the live prediction
markets that price each one.

Built from the `design_handoff_castle_internal` design system and populated with **39 companies**
snapshotted from the `castle-onboarding-testing` research pipeline (18 fully-normalized + 20
marquee names from the pipeline's JSONB portfolios + the Linea Energy design showcase). The
directory is ordered by most-recently-updated dashboard.

**Access:** the app is gated by a team password — **`excalibur`** (a lightweight presentation
gate held in `sessionStorage`; not hardened auth — the data ships in the bundle).

## Run it

```bash
npm install
npm run dev      # → http://localhost:4040
```

Or a production build:

```bash
npm run build && npm run start   # → http://localhost:4040
```

No database, API keys, or network are required at runtime — all data is baked into a static
snapshot (`src/data/snapshot.json`).

## What's in here

```
src/
  app/
    layout.tsx                 root shell: password gate + top bar + Google Fonts
    page.tsx                   Companies grid (/)
    company/[id]/page.tsx      Company detail (/company/<slug>), statically generated
    globals.css                Castle design tokens + interaction states
  components/
    Gate.tsx                   team-password gate (client)
    TopBar.tsx                 slim top header + sign out (client)
    CompanyGrid.tsx            searchable 3-up card grid (client)
    CompanyDetail.tsx          Overview + Exposures tabs + exposure drawer (client)
  lib/
    types.ts                   raw-snapshot + view-model types
    format.ts                  text cleaning, labels, money/%, monogram, slug
    transform.ts               snapshot → view model (exposures, mix, footprint, risk map)
    linea.ts                   the Linea Energy showcase (pre-built view, ported from the design)
    data.ts                    loads the snapshot, runs the transform, sorts by recency
  data/
    snapshot.json              18 companies, baked in (see "Data" below)
scripts/
    snapshot.mjs               re-generate snapshot.json from the live pipeline
```

## Data

Each company carries real research from the `castle-onboarding-testing` Supabase pipeline:

- **Company profile** — industry, revenue band, employees, regions, supplier/customer
  countries, segments (drives the profile + footprint).
- **Risk events** — title, description, category, severity, timeframe, sources.
- **Linked prediction markets** — Kalshi / Polymarket / Castle-modeled contracts with **live
  implied probabilities**, hedge-allocation %, rationale, resolution date, and sources.

### Modeled exposure is *illustrative*

The source pipeline does **not** carry dollar exposure figures. The "MODELED EXPOSURE" dollar
amounts shown here are **illustrative** — each company's hedge program is sized from its real
revenue band and distributed across exposures by the model's real hedge-allocation weights.
They are labeled `ILLUSTRATIVE` in the UI and footnoted on the Exposures tab. Everything else
(probabilities, severities, categories, market links, sources) is real pipeline data.

The design's fabricated "today's activity" market-moves ticker was intentionally dropped in
favor of a real "What Castle is watching" list, and the design's value-chain map was re-axed to
a "Risk map · by theme" grouping (the source data has no value-chain stages).

## Refreshing the data

`src/data/snapshot.json` is a point-in-time export. To regenerate it from the live pipeline:

```bash
# requires @supabase/supabase-js and the onboarding-testing Supabase credentials
node scripts/snapshot.mjs
```

See `scripts/snapshot.mjs` for the connection/credentials it expects.
