-- Lightweight run-guard for the ingestion pipeline.
-- One row per logical job key. Acquisition is conditional on either
--   (a) no row exists for that key, or
--   (b) the existing row's `expires_at` is in the past (stale lock).
-- Stale locks are auto-evicted by the runtime helper (lib/lock.ts) before
-- attempting acquisition, so a crashed pipeline run cannot wedge future runs.

create table if not exists pipeline_locks (
  key text primary key,
  holder text not null,
  acquired_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create index if not exists idx_pipeline_locks_expires_at
  on pipeline_locks (expires_at);
