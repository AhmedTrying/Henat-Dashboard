-- Hantavirus Dashboard — initial schema
-- Plain Postgres (Neon-compatible). Run with:
--   psql "$DATABASE_URL" -f db/migrations/0001_init.sql

create extension if not exists "pgcrypto";

-- =====================================================================
-- Enums
-- =====================================================================
do $$ begin
  create type data_status as enum ('provisional', 'finalized', 'under_review');
exception when duplicate_object then null; end $$;

do $$ begin
  create type event_status as enum ('active', 'monitoring', 'contained');
exception when duplicate_object then null; end $$;

do $$ begin
  create type source_tier as enum ('global', 'regional', 'national');
exception when duplicate_object then null; end $$;

-- =====================================================================
-- Trusted source allowlist (configurable)
-- =====================================================================
create table if not exists trusted_sources (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  tier source_tier not null,
  url text not null,
  country_code text,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_trusted_sources_enabled on trusted_sources (enabled);
create index if not exists idx_trusted_sources_country on trusted_sources (country_code);

-- =====================================================================
-- Raw fetch capture (provenance / audit)
-- =====================================================================
create table if not exists raw_fetches (
  id uuid primary key default gen_random_uuid(),
  source_id uuid references trusted_sources(id) on delete set null,
  source_code text not null,
  source_url text not null,
  fetched_at timestamptz not null default now(),
  http_status int,
  content_hash text,
  content_excerpt text,
  notes text
);

create index if not exists idx_raw_fetches_source_code on raw_fetches (source_code, fetched_at desc);
create unique index if not exists ux_raw_fetches_dedupe on raw_fetches (source_code, content_hash);

-- =====================================================================
-- Gemini extractions (parsed structured JSON)
-- =====================================================================
create table if not exists extractions (
  id uuid primary key default gen_random_uuid(),
  raw_fetch_id uuid references raw_fetches(id) on delete cascade,
  model text not null,
  prompt_version text not null,
  extracted_at timestamptz not null default now(),
  parsed jsonb not null,
  confidence numeric(4,3) not null default 0,
  errors jsonb
);

create index if not exists idx_extractions_raw_fetch on extractions (raw_fetch_id);
create index if not exists idx_extractions_confidence on extractions (confidence desc);

-- =====================================================================
-- Normalized country records (one row per country/source/report_date)
-- =====================================================================
create table if not exists country_records (
  id uuid primary key default gen_random_uuid(),
  country text not null,
  country_code text not null,
  confirmed_cases int not null default 0 check (confirmed_cases >= 0),
  suspected_cases int not null default 0 check (suspected_cases >= 0),
  deaths int not null default 0 check (deaths >= 0),
  active_events int not null default 0 check (active_events >= 0),
  source_name text not null,
  source_url text not null,
  source_type source_tier not null,
  confidence numeric(4,3) not null default 0,
  data_status data_status not null default 'under_review',
  report_date date not null,
  last_checked timestamptz not null default now(),
  last_updated timestamptz not null default now(),
  extraction_id uuid references extractions(id) on delete set null,
  created_at timestamptz not null default now()
);

create unique index if not exists ux_country_records_dedupe
  on country_records (country_code, source_name, report_date);
create index if not exists idx_country_records_country_date
  on country_records (country_code, report_date desc);
create index if not exists idx_country_records_status
  on country_records (data_status);

-- =====================================================================
-- Outbreak event records
-- =====================================================================
create table if not exists event_records (
  id uuid primary key default gen_random_uuid(),
  external_id text,
  name text not null,
  location text not null,
  country text not null,
  country_code text not null,
  confirmed_cases int not null default 0 check (confirmed_cases >= 0),
  suspected_cases int not null default 0 check (suspected_cases >= 0),
  deaths int not null default 0 check (deaths >= 0),
  status event_status not null default 'monitoring',
  source_name text not null,
  source_url text not null,
  source_type source_tier not null,
  confidence numeric(4,3) not null default 0,
  data_status data_status not null default 'under_review',
  report_date date not null,
  last_checked timestamptz not null default now(),
  last_updated timestamptz not null default now(),
  extraction_id uuid references extractions(id) on delete set null,
  created_at timestamptz not null default now()
);

create unique index if not exists ux_event_records_dedupe
  on event_records (country_code, name, report_date);
create index if not exists idx_event_records_status
  on event_records (status, report_date desc);

-- =====================================================================
-- Published immutable snapshots (what the public API serves)
-- =====================================================================
create table if not exists snapshots (
  id uuid primary key default gen_random_uuid(),
  as_of timestamptz not null,
  data_status data_status not null default 'provisional',
  totals jsonb not null,
  by_country jsonb not null,
  events jsonb not null,
  sources_used jsonb not null,
  timeline jsonb not null default '[]'::jsonb,
  last_checked timestamptz not null,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists idx_snapshots_as_of on snapshots (as_of desc);

-- Snapshots are append-only. Block updates and deletes via trigger.
create or replace function snapshots_immutable()
returns trigger language plpgsql as $$
begin
  raise exception 'snapshots are immutable';
end $$;

drop trigger if exists trg_snapshots_no_update on snapshots;
create trigger trg_snapshots_no_update
  before update or delete on snapshots
  for each row execute function snapshots_immutable();
