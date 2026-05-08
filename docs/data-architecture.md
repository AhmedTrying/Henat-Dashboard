# Data architecture

This document explains how Hantavirus statistics flow from raw official sources into the public dashboard, and the reasoning behind the schema.

## Goals

1. **Auditability.** For every number on the dashboard we can point to: the source URL, the moment it was fetched, the raw text, the model + prompt that parsed it, and the confidence we assigned.
2. **Confirmed vs suspected separation.** The schema and the API never collapse confirmed and suspected counts into one number.
3. **Immutable publishing.** What the public sees does not change underneath them. Each refresh produces a new snapshot row; old snapshots remain queryable.
4. **Demo-safe by default.** If the database is empty, unconfigured, or all sources fail, the public site falls back to a built-in demo snapshot so it never serves a broken page.

## Pipeline

```
trusted source allowlist
        │
        ▼
[1] fetch official sources              → raw_fetches            (provenance)
        │
        ▼
[2] extract with Gemini → strict JSON   → extractions            (model output)
        │
        ▼
[3] validate + normalize                → country_records,       (typed records)
                                          event_records
        │
        ▼
[4] aggregate latest-per-country
    + publish immutable snapshot        → snapshots              (what the API serves)
```

Public reads always go through `snapshots`. The other tables exist to back up *why* a snapshot looks the way it does.

## Tables

### `trusted_sources` — configurable allowlist

```sql
code text unique          -- "WHO", "CDC", "MS-AR", ...
name text                 -- human-readable
tier source_tier          -- 'global' | 'regional' | 'national'
url text                  -- where to fetch
country_code text         -- ISO alpha-2, optional
enabled boolean           -- toggles a source on/off without code changes
```

Reasoning: the set of trusted sources should be tunable by an operator without redeploying the app. The pipeline reads this table (the `lib/sources.ts` constant is a fallback / seed mirror).

### `raw_fetches` — provenance / audit

```sql
source_code text
source_url text
fetched_at timestamptz
http_status int
content_hash text
content_excerpt text         -- first 8KB of the response (for review)
unique (source_code, content_hash)  -- dedupe identical fetches
```

Reasoning: we keep enough to **prove** what the source said at fetch time, but cap the size so we don't accidentally store giant HTML blobs. The unique-on-hash index avoids reprocessing unchanged content.

### `extractions` — Gemini output

```sql
raw_fetch_id uuid          -- link back to the exact raw text
model text                 -- e.g. "gemini-2.5-pro"
prompt_version text        -- bump when we change the system prompt
parsed jsonb               -- the structured JSON returned
confidence numeric(4,3)    -- 0..1, copied to records derived from this row
errors jsonb
```

Reasoning: the parsed JSON is the single source of truth for downstream normalization. Storing the model + prompt version means we can reproduce or re-run an extraction later when models change.

### `country_records` — normalized country×source rows

```sql
country, country_code
confirmed_cases, suspected_cases, deaths, active_events
source_name, source_url, source_type
confidence
data_status  data_status   -- 'provisional' | 'finalized' | 'under_review'
report_date date
last_checked, last_updated
extraction_id              -- where this record came from

unique (country_code, source_name, report_date)
index (country_code, report_date desc)
index (data_status)
```

Reasoning:
- The unique key dedupes the case where ingestion runs twice for the same source on the same `report_date` — re-running is safe and updates in place.
- We keep one row per `(country_code, source_name, report_date)` so when two sources disagree on the same country, both opinions are kept and the snapshot publisher can pick.
- `data_status='under_review'` is set automatically when `confidence < 0.7` so that low-confidence extractions never appear as "provisional" or "finalized" without human approval.

### `event_records` — outbreak events

Same provenance/confidence story as `country_records`, with `status enum('active','monitoring','contained')` and the canonical fields the user asked for.

### `snapshots` — immutable public view

```sql
as_of timestamptz
data_status data_status      -- worst-of: under_review > provisional > finalized
totals jsonb                 -- { confirmed_cases, suspected_cases, deaths, active_events }
by_country jsonb             -- denormalized array of CountryRecord
events jsonb                 -- denormalized array of EventRecord
sources_used jsonb           -- which sources contributed to this snapshot
timeline jsonb               -- 24-week series
last_checked timestamptz
notes text
created_at timestamptz default now()
```

A trigger blocks UPDATE and DELETE, so once published a snapshot cannot mutate. The public API reads the most recent row by `as_of desc`.

### Access model on Neon

The Neon deployment uses a single Postgres role accessed via `DATABASE_URL`. The application code is the trust boundary:

- **Read path** — `lib/snapshot.ts` is the only module that touches the database for public reads, and it queries only `snapshots`. The HTTP API never exposes `raw_fetches`, `extractions`, `country_records`, or `event_records`.
- **Write path** — only `lib/pipeline.ts` and `scripts/seed.ts` write, and both run server-side with `DATABASE_URL` available only to the server runtime.
- The `snapshots_immutable` trigger remains the on-disk guardrail against accidental mutation of published snapshots.

If you need RLS later (e.g. exposing the DB through PostgREST), the migrations are pure Postgres — re-add `ALTER TABLE … ENABLE ROW LEVEL SECURITY` plus policies in a follow-up migration without touching the existing schema.

## Data quality flags

The `data_status` enum is the single quality dimension shown in the UI:

| value | when | UI badge |
|---|---|---|
| `finalized` | source explicitly says "final", confidence ≥ 0.7 | Finalized |
| `provisional` | confidence ≥ 0.7 but source says "provisional" or doesn't say | Provisional |
| `under_review` | confidence < 0.7 OR fields missing OR extraction errored | Under review |

Snapshot-level `data_status` is the worst case across the contributing country rows.

## Why a "publish snapshot" stage at all?

Three reasons:

1. **Read latency.** The public `/api/v1/...` endpoints become a single jsonb fetch instead of joining 4 tables.
2. **Stability.** If Gemini changes its output format and a re-run fails, the previous snapshot still serves correctly.
3. **History.** Future "weekly archive" exports come for free — they're just older snapshot rows.

## Extending the pipeline

- To add a new source: insert a row into `trusted_sources` (or update the `TRUSTED_SOURCES` constant and re-seed). The pipeline picks it up on the next run.
- To change the extraction shape: edit `lib/gemini.ts`, bump `PROMPT_VERSION`, and either run `npm run ingest:once` or wait for the cron.
- To support multi-source reconciliation: extend `aggregateLatestPerCountry` in `lib/pipeline.ts` — currently we keep newest-then-highest-confidence per country.
