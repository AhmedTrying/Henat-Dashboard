# Hantavirus Dashboard

Latest official Hantavirus statistics, outbreak updates, and developer-ready data exports — aggregated from WHO, CDC, ECDC, PAHO and national health ministries.

> **Demo build.** All data should be treated as illustrative until the source pipeline is connected to live official feeds.

## ⚠ Security first

Before running this app you must:

1. Read [`SECURITY.md`](./SECURITY.md).
2. **Revoke and rotate** the Gemini API key that was previously shared in this workspace.
3. Place the new key in `.env.local` (local) and Vercel project env (deploy). Never commit `.env*` files with real values.

## Stack

- Next.js 15 (App Router) + React 19
- TypeScript (strict)
- Tailwind CSS
- Recharts + react-simple-maps
- **Neon Postgres** (serverless, accessed via `@neondatabase/serverless`)
- Gemini API as extraction assistant (server-side only)
- Vercel deployment with cron-triggered ingestion

## Pages

| Path | What |
|---|---|
| `/` | Hero, global summary, choropleth, latest outbreak preview, source transparency |
| `/dashboard` | Summary cards, 24-week timeline, country ranking, active events, downloads, disclaimer |
| `/developers` | Endpoint catalogue, example responses, code samples, exports, status, changelog |

## Public API

All endpoints are read-only and unauthenticated. Each response includes a `meta` block with the snapshot id, license, and source codes.

| Endpoint | Description |
|---|---|
| `GET /api/v1/hantavirus/summary` | Global totals and last-updated timestamp |
| `GET /api/v1/hantavirus/events` | Active and recent outbreak events |
| `GET /api/v1/hantavirus/countries` | Per-country totals |
| `GET /api/v1/hantavirus/countries/{country_code}` | Single country (ISO 3166-1 alpha-2) |
| `GET /api/v1/hantavirus/export/latest.csv` | CSV export of the latest snapshot |
| `GET /api/v1/hantavirus/export/latest.json` | JSON export of the latest snapshot |

The internal cron endpoint `/api/internal/ingest` requires `Authorization: Bearer <secret>`. The route resolves the secret in this order:

1. **`CRON_SECRET`** (preferred) — Vercel Cron automatically attaches this as a Bearer token when the env var is set on the project.
2. **`INGEST_CRON_SECRET`** (fallback) — kept for backward compatibility with earlier deploys.

If neither is set the endpoint returns `503` and refuses to run rather than allowing unauthenticated calls.

## Local setup

```bash
# 1. Install
npm install

# 2. Environment
cp .env.example .env.local
# fill in: DATABASE_URL, GEMINI_API_KEY, CRON_SECRET, NEXT_PUBLIC_SITE_URL
```

Without `DATABASE_URL` the app still runs — it serves the built-in demo snapshot. Without `GEMINI_API_KEY` the ingestion script returns `mode: "demo-fallback"` and does not modify the database.

```bash
# 3. Run
npm run dev
# → http://localhost:3000
```

### Database (Neon)

1. Create a project at [neon.tech](https://neon.tech) and copy the **pooled** connection string into `DATABASE_URL` (must include `?sslmode=require`).
2. Apply the SQL migrations in order:

```bash
psql "$DATABASE_URL" -f db/migrations/0001_init.sql
psql "$DATABASE_URL" -f db/migrations/0002_seed_sources.sql
psql "$DATABASE_URL" -f db/migrations/0003_pipeline_locks.sql
```

If `psql` isn't installed, paste each file into the Neon SQL editor.

`0001_init.sql` creates the schema (enums, tables, indexes, immutable-snapshot trigger). `0002_seed_sources.sql` seeds the `trusted_sources` allowlist. `0003_pipeline_locks.sql` adds the run-guard table used by the ingestion lock.

3. (Optional) seed the demo snapshot so the dashboard reads from the DB:

```bash
npm run seed
```

### Run one ingestion cycle

```bash
npm run ingest:once
```

This walks the trusted-source allowlist, fetches each URL, sends content through Gemini for structured extraction, normalizes records, and publishes a new immutable snapshot.

If `DATABASE_URL` or `GEMINI_API_KEY` is missing, the script returns `mode: "demo-fallback"` and does not modify the database. If another run is already in progress (lock held), it returns `mode: "skipped-locked"`.

### Real-data activation checklist

1. Apply all migrations in `db/migrations/`.
2. Set `DATABASE_URL` and `GEMINI_API_KEY` locally.
3. Run `npm run ingest:once` and confirm output contains `"mode": "live"` and `"ok": true`.
4. Start the app and confirm `GET /api/v1/hantavirus/summary` returns `"is_demo": false`.
5. In Vercel, set the same server env vars plus `CRON_SECRET`, redeploy, then trigger `/api/internal/ingest` once manually to verify auth + ingestion.

## Scripts

| Command | What |
|---|---|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Run production build |
| `npm run lint` | ESLint (flat config, fails on warnings — CI-friendly) |
| `npm run typecheck` | Stub `.next/types` then run `tsc --noEmit` (deterministic on a clean checkout) |
| `npm run seed` | Seed `trusted_sources` + insert demo snapshot |
| `npm run ingest:once` | Run one ingestion pass locally |

## Deployment (Vercel)

### 1) Publish to GitHub

If this folder is not yet a Git repository:

```bash
git init
git branch -M main
git add .
git commit -m "Initial Hantavirus dashboard MVP"
```

Create an empty GitHub repository, then connect and push:

```bash
git remote add origin https://github.com/<your-org-or-user>/<repo-name>.git
git push -u origin main
```

### 2) Import in Vercel

2. Import on Vercel.
3. Add the env vars from [`.env.example`](./.env.example) under **Settings → Environment Variables**. Mark `DATABASE_URL`, `GEMINI_API_KEY`, and `CRON_SECRET` as **server-only** (no `NEXT_PUBLIC_` prefix).
4. The `vercel.json` already declares the cron job. On each deploy, Vercel will automatically wire `/api/internal/ingest` to run on the configured schedule and send `Authorization: Bearer $CRON_SECRET`.

### Cron schedule — Hobby vs Pro

The default `vercel.json` schedule is `0 */6 * * *` (every 6 hours). This is **Pro-plan friendly**.

- **Vercel Hobby**: limited to **at most one cron invocation per day**. If you deploy on Hobby you must change the schedule to e.g. `0 6 * * *` (once per day) before the first deploy, or the cron job will be rejected.
- **Vercel Pro / Enterprise**: 6h is fine. You can also tighten further (`0 */3 * * *`) if your sources publish more frequently.

Edit the `schedule` field in `vercel.json` to switch.

## Architecture deep-dive

See [`docs/data-architecture.md`](./docs/data-architecture.md) for table-by-table schema reasoning, pipeline stages, and how confirmed vs suspected separation is enforced top-to-bottom.

## Project structure

```
app/                     Next.js App Router pages and API routes
  api/v1/hantavirus/     Public read-only endpoints
  api/internal/ingest/   Cron-protected ingestion endpoint
components/              Reusable UI primitives (server + client)
lib/
  db.ts                  Neon SQL helper (tagged-template HTTP driver)
  demo-data.ts           Built-in demo snapshot (fallback)
  gemini.ts              Server-side Gemini extractor (strict JSON)
  lock.ts                Pipeline run-guard (DB-backed lock w/ TTL)
  pipeline.ts            Fetch → extract → normalize → publish
  snapshot.ts            Reads latest snapshot, falls back to demo
  sources.ts             Trusted source allowlist
  types.ts               Shared TypeScript types
db/migrations/           SQL schema + seed (plain Postgres)
scripts/                 Seed + one-shot ingestion + typecheck prep
docs/                    Architecture notes
SECURITY.md              Key rotation + secret-handling rules
vercel.json              Cron schedule for ingestion
```

## Disclaimer

Hantavirus data is reported through national and regional public-health systems. Some numbers are provisional, delayed, or revised. This dashboard separates confirmed official data from suspected or media-reported information. It is informational only and is not a substitute for clinical advice.
