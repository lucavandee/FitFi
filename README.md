# FitFi

A personalized fashion and outfit recommendation web app. Users complete a short style quiz, optionally upload a selfie for color analysis or mood photos for aesthetic profiling, and receive ranked outfit recommendations linked to affiliate retailers.

Status: production. Active development.

## Stack

| Layer | Tech |
|---|---|
| Framework | Vite 5 + React 18 + TypeScript 5 |
| Styling | Tailwind CSS 3.4, Plus Jakarta Sans |
| Routing | React Router DOM v6 |
| State / data | TanStack React Query |
| Animation | Framer Motion |
| Database, auth, storage, edge functions | Supabase |
| OAuth | Google (`@react-oauth/google`) |
| Payments | Stripe Checkout + Customer Portal |
| Hosting | Netlify (static build + edge functions) |
| Tests | Vitest (unit), Playwright (e2e) |
| Runtime | Node 20.x, pnpm 9.12 |

## What's in here

- `src/` — React app: pages, components, content, recommendation logic.
- `supabase/functions/` — 17 edge functions handling mood-photo and selfie analysis, outfit-photo intake, AI mood-tag generation, Stripe checkout and webhook, contact email, and Daisycon affiliate-feed import.
- `supabase/migrations/` — Postgres schema and Row-Level Security policies.
- `netlify/` — Netlify edge functions and routing config.
- `e2e/` — Playwright end-to-end tests.
- `docs/` — Developer reference, design system, terminology guide.
- `docs/archive/` — Historical audit, fix, and setup notes.

## Local development

```bash
pnpm install
cp .env.example .env   # fill in your Supabase keys
pnpm dev
```

Required environment variables:

| Variable | Purpose |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key |

Optional:

| Variable | Purpose |
|---|---|
| `VITE_GTAG_ID` | Google Analytics 4 measurement ID |
| `VITE_AWIN_ENABLED` | Enable AWIN affiliate link tracking |
| `VITE_CONTACT_EMAIL` | Contact form recipient |

## Common scripts

| Command | What it does |
|---|---|
| `pnpm dev` | Vite dev server |
| `pnpm build` | Production build |
| `pnpm typecheck` | TypeScript type-check, no emit |
| `pnpm lint` | ESLint over `**/*.{ts,tsx}` |
| `pnpm test` | Vitest unit tests |
| `pnpm test:e2e` | Playwright end-to-end tests |
| `pnpm design:check` | Design-system compliance check |
| `pnpm scan:secrets` | Local secret scan |

## Deployment

Production builds run on Netlify. Vite produces a static site; runtime work happens in Netlify edge functions (`netlify/`) and Supabase edge functions (`supabase/functions/`).

## Documentation

- [`CHANGELOG.md`](CHANGELOG.md) — Release notes.
- [`ROADMAP.md`](ROADMAP.md) — Upcoming work.
- [`CLAUDE.md`](CLAUDE.md) — Conventions for AI-assisted edits.
- [`docs/FITFI_DEV_REFERENCE.md`](docs/FITFI_DEV_REFERENCE.md) — UI development reference.
- [`docs/DESIGN_SYSTEM_QUICK_REFERENCE.md`](docs/DESIGN_SYSTEM_QUICK_REFERENCE.md) — Design tokens and component classes.
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — End-to-end pipeline, signals, what runs client-side vs in edge functions, trade-offs.
- [`docs/TERMINOLOGY_CONSISTENCY_GUIDE.md`](docs/TERMINOLOGY_CONSISTENCY_GUIDE.md) — Terminology conventions across marketing and product surfaces.

## Related

- [**fitfi-recommender-langgraph**](https://github.com/lucavandee/fitfi-recommender-langgraph) — Python LangGraph port of this repo's recommendation pipeline, with an eval suite. Built as a framework-learning exercise; not a replacement for the production engine.
