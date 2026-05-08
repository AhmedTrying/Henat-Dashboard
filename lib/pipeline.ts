// Server-only ingestion pipeline.
// Stages:
//   1. fetch official sources (allowlist)
//   2. extract with Gemini into strict JSON
//   3. validate + normalize
//   4. publish immutable snapshot

import { createHash } from "node:crypto";
import { getSql, type Sql } from "./db";
import { acquireLock, releaseLock } from "./lock";
import { TRUSTED_SOURCES, isTrustedUrl, type TrustedSource } from "./sources";
import { DEMO_SNAPSHOT } from "./demo-data";
import {
  callGeminiExtract,
  PROMPT_VERSION,
  type ExtractionResult,
} from "./gemini";
import type {
  CountryRecord,
  DataStatus,
  EventRecord,
  Snapshot,
  SourceInfo,
  SummaryTotals,
  TimelinePoint,
} from "./types";

const CONFIDENCE_REVIEW = 0.7;
const INGEST_LOCK_KEY = "ingest";
const INGEST_LOCK_TTL_MS = 15 * 60 * 1000; // 15 min — longer than a single run

export interface IngestionResult {
  ok: boolean;
  mode: "live" | "demo-fallback" | "skipped-locked";
  snapshot_id?: string;
  sources_attempted: number;
  sources_extracted: number;
  countries_published: number;
  events_published: number;
  warnings: string[];
}

export async function runIngestion(): Promise<IngestionResult> {
  const sql = getSql();
  const warnings: string[] = [];

  if (!sql) {
    warnings.push(
      "DATABASE_URL is not configured. Skipping live ingestion; database remains untouched.",
    );
    return {
      ok: false,
      mode: "demo-fallback",
      sources_attempted: 0,
      sources_extracted: 0,
      countries_published: 0,
      events_published: 0,
      warnings,
    };
  }

  // Concurrency guard: refuse to run if another pipeline run is in flight.
  const lock = await acquireLock(sql, INGEST_LOCK_KEY, INGEST_LOCK_TTL_MS);
  if (!lock) {
    return {
      ok: false,
      mode: "skipped-locked",
      sources_attempted: 0,
      sources_extracted: 0,
      countries_published: 0,
      events_published: 0,
      warnings: [
        "another ingestion run is in progress (or its lock has not yet expired); skipping",
      ],
    };
  }

  try {
    return await runIngestionLocked(sql, warnings);
  } finally {
    await releaseLock(sql, lock).catch(() => {
      /* swallow — TTL ensures the lock will free itself */
    });
  }
}

async function runIngestionLocked(
  sql: Sql,
  warnings: string[],
): Promise<IngestionResult> {
  const allCountries: CountryRecord[] = [];
  const allEvents: EventRecord[] = [];
  const sourcesUsed: SourceInfo[] = [];
  let sourcesExtracted = 0;

  const sources = await loadEnabledSources(sql, warnings);
  const now = new Date().toISOString();

  for (const src of sources) {
    try {
      const fetched = await fetchSource(src);
      if (!fetched.ok) {
        warnings.push(`fetch failed for ${src.code}: status ${fetched.status}`);
        sourcesUsed.push({
          code: src.code,
          name: src.name,
          tier: src.tier,
          url: src.url,
          last_updated: now,
          status: "error",
        });
        continue;
      }

      const contentHash = sha256(fetched.text);
      const cleanedText = compactSourceText(fetched.text);
      const excerpt = cleanedText.slice(0, 8000);

      // raw_fetches: dedupe on (source_code, content_hash). On conflict, refresh
      // fetched_at so we can prove we re-checked even if content was unchanged.
      const rawRows = (await sql`
        INSERT INTO raw_fetches (source_code, source_url, fetched_at, http_status, content_hash, content_excerpt)
        VALUES (${src.code}, ${src.url}, ${now}, ${fetched.status}, ${contentHash}, ${excerpt})
        ON CONFLICT (source_code, content_hash) DO UPDATE
          SET fetched_at = EXCLUDED.fetched_at,
              http_status = EXCLUDED.http_status
        RETURNING id
      `) as { id: string }[];

      const rawId = rawRows[0]?.id;
      if (!rawId) {
        warnings.push(`raw_fetches insert failed for ${src.code}`);
        continue;
      }

      const extraction = await callGeminiExtract({
        sourceUrl: src.url,
        sourceCode: src.code,
        rawText: cleanedText,
      });

      const extRows = (await sql`
        INSERT INTO extractions (raw_fetch_id, model, prompt_version, parsed, confidence)
        VALUES (
          ${rawId},
          ${process.env.GEMINI_MODEL || "gemini-2.5-pro"},
          ${PROMPT_VERSION},
          ${JSON.stringify(extraction.result)}::jsonb,
          ${extraction.result.confidence}
        )
        RETURNING id
      `) as { id: string }[];

      const extId = extRows[0]?.id;
      if (!extId) {
        warnings.push(`extractions insert failed for ${src.code}`);
        continue;
      }

      const { countries, events } = normalize(
        extraction.result,
        src,
        extId,
        now,
        warnings,
      );

      // Persist normalized records — one upsert per row keeps the SQL simple
      // and per-source counts low (~10-20 rows). Conflict columns mirror the
      // unique indexes from migration 0001.
      for (const c of countries) {
        await sql`
          INSERT INTO country_records (
            country, country_code, confirmed_cases, suspected_cases, deaths, active_events,
            source_name, source_url, source_type, confidence, data_status, report_date,
            last_checked, last_updated, extraction_id
          ) VALUES (
            ${c.country}, ${c.country_code}, ${c.confirmed_cases}, ${c.suspected_cases},
            ${c.deaths}, ${c.active_events}, ${c.source_name}, ${c.source_url},
            ${c.source_type}, ${c.confidence}, ${c.data_status}, ${c.report_date},
            ${c.last_checked}, ${c.last_updated}, ${extId}
          )
          ON CONFLICT (country_code, source_name, report_date) DO UPDATE SET
            confirmed_cases = EXCLUDED.confirmed_cases,
            suspected_cases = EXCLUDED.suspected_cases,
            deaths = EXCLUDED.deaths,
            active_events = EXCLUDED.active_events,
            confidence = EXCLUDED.confidence,
            data_status = EXCLUDED.data_status,
            last_checked = EXCLUDED.last_checked,
            last_updated = EXCLUDED.last_updated,
            extraction_id = EXCLUDED.extraction_id
        `;
      }

      for (const e of events) {
        await sql`
          INSERT INTO event_records (
            external_id, name, location, country, country_code,
            confirmed_cases, suspected_cases, deaths, status,
            source_name, source_url, source_type, confidence, data_status,
            report_date, last_checked, last_updated, extraction_id
          ) VALUES (
            ${e.id}, ${e.name}, ${e.location}, ${e.country}, ${e.country_code},
            ${e.confirmed_cases}, ${e.suspected_cases}, ${e.deaths}, ${e.status},
            ${e.source_name}, ${e.source_url}, ${e.source_type}, ${e.confidence},
            ${e.data_status}, ${e.report_date}, ${e.last_checked}, ${e.last_updated},
            ${extId}
          )
          ON CONFLICT (country_code, name, report_date) DO UPDATE SET
            confirmed_cases = EXCLUDED.confirmed_cases,
            suspected_cases = EXCLUDED.suspected_cases,
            deaths = EXCLUDED.deaths,
            status = EXCLUDED.status,
            confidence = EXCLUDED.confidence,
            data_status = EXCLUDED.data_status,
            last_checked = EXCLUDED.last_checked,
            last_updated = EXCLUDED.last_updated,
            extraction_id = EXCLUDED.extraction_id
        `;
      }

      allCountries.push(...countries);
      allEvents.push(...events);

      sourcesUsed.push({
        code: src.code,
        name: src.name,
        tier: src.tier,
        url: src.url,
        last_updated: now,
        status: "ok",
      });
      sourcesExtracted += 1;
    } catch (err) {
      warnings.push(
        `pipeline error for ${src.code}: ${err instanceof Error ? err.message : "unknown"}`,
      );
    }
  }

  // Stage 4: publish immutable snapshot if we have anything to publish.
  if (allCountries.length === 0 && allEvents.length === 0) {
    warnings.push("no records extracted; skipping snapshot publication");
    return {
      ok: false,
      mode: "demo-fallback",
      sources_attempted: sources.length,
      sources_extracted: sourcesExtracted,
      countries_published: 0,
      events_published: 0,
      warnings,
    };
  }

  const totalsByCountry = aggregateLatestPerCountry(allCountries);
  const totals: SummaryTotals = {
    confirmed_cases: totalsByCountry.reduce((a, c) => a + c.confirmed_cases, 0),
    suspected_cases: totalsByCountry.reduce((a, c) => a + c.suspected_cases, 0),
    deaths: totalsByCountry.reduce((a, c) => a + c.deaths, 0),
    active_events: allEvents.filter((e) => e.status === "active").length,
  };

  const overallStatus: DataStatus = totalsByCountry.some((c) => c.data_status === "under_review")
    ? "under_review"
    : totalsByCountry.every((c) => c.data_status === "finalized")
    ? "finalized"
    : "provisional";

  const notes = warnings.length ? warnings.join("; ").slice(0, 1000) : null;
  const timeline = await buildTimeline(sql, now, totals);

  const snapRows = (await sql`
    INSERT INTO snapshots (as_of, data_status, totals, by_country, events, sources_used, timeline, last_checked, notes)
    VALUES (
      ${now},
      ${overallStatus},
      ${JSON.stringify(totals)}::jsonb,
      ${JSON.stringify(totalsByCountry)}::jsonb,
      ${JSON.stringify(allEvents)}::jsonb,
      ${JSON.stringify(sourcesUsed)}::jsonb,
      ${JSON.stringify(timeline)}::jsonb,
      ${now},
      ${notes}
    )
    RETURNING id
  `) as { id: string }[];

  const snapId = snapRows[0]?.id;
  if (!snapId) {
    warnings.push("snapshot insert failed");
    return {
      ok: false,
      mode: "demo-fallback",
      sources_attempted: sources.length,
      sources_extracted: sourcesExtracted,
      countries_published: 0,
      events_published: 0,
      warnings,
    };
  }

  return {
    ok: true,
    mode: "live",
    snapshot_id: snapId,
    sources_attempted: sources.length,
    sources_extracted: sourcesExtracted,
    countries_published: totalsByCountry.length,
    events_published: allEvents.length,
    warnings,
  };
}

interface TrustedSourceRow {
  code: string;
  name: string;
  tier: string;
  url: string;
  country_code: string | null;
  enabled: boolean;
}

async function loadEnabledSources(
  sql: Sql,
  warnings: string[],
): Promise<TrustedSource[]> {
  try {
    const rows = (await sql`
      SELECT code, name, tier, url, country_code, enabled
      FROM trusted_sources
      WHERE enabled = true
      ORDER BY code ASC
    `) as TrustedSourceRow[];

    const parsed = rows
      .map((r): TrustedSource | null => {
        const tier = parseSourceTier(r.tier);
        if (!tier) return null;
        if (!isHttpUrl(r.url)) return null;
        const source: TrustedSource = {
          code: String(r.code),
          name: String(r.name),
          tier,
          url: String(r.url),
          enabled: true,
        };
        if (r.country_code) {
          source.country_code = String(r.country_code).toUpperCase();
        }
        return source;
      })
      .filter((v): v is TrustedSource => v !== null);

    if (parsed.length > 0) return parsed;
    warnings.push(
      "trusted_sources table has no valid enabled rows; falling back to built-in source list",
    );
  } catch (err) {
    warnings.push(
      `failed to load trusted_sources from database; fallback used: ${
        err instanceof Error ? err.message : "unknown"
      }`,
    );
  }
  return TRUSTED_SOURCES.filter((s) => s.enabled);
}

interface FetchedSource {
  ok: boolean;
  status: number;
  text: string;
}

async function fetchSource(src: TrustedSource): Promise<FetchedSource> {
  try {
    const res = await fetch(src.url, {
      headers: {
        Accept: "text/html, application/json;q=0.9, */*;q=0.8",
        "User-Agent": "HantavirusDashboard/1.0 (+https://github.com/)",
      },
      signal: AbortSignal.timeout(20_000),
    });
    const text = await res.text();
    return { ok: res.ok, status: res.status, text };
  } catch {
    return { ok: false, status: 0, text: "" };
  }
}

function compactSourceText(raw: string): string {
  return raw
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function sha256(s: string): string {
  return createHash("sha256").update(s).digest("hex");
}

function normalize(
  ex: ExtractionResult,
  src: TrustedSource,
  _extractionId: string,
  nowIso: string,
  warnings: string[],
): { countries: CountryRecord[]; events: EventRecord[] } {
  const status: DataStatus =
    ex.confidence >= CONFIDENCE_REVIEW ? "provisional" : "under_review";
  const today = nowIso.slice(0, 10);
  const countries: CountryRecord[] = [];
  const events: EventRecord[] = [];
  let rejectedCountries = 0;
  let rejectedEvents = 0;
  let warnedOnUrl = false;
  const sourceCountryCode = src.country_code?.toUpperCase();

  for (const c of ex.countries) {
    const countryCode = normalizeCountryCode(c.country_code);
    const reportDate = normalizeReportDate(c.report_date, today);
    if (!countryCode || !reportDate) {
      rejectedCountries += 1;
      continue;
    }
    if (sourceCountryCode && countryCode !== sourceCountryCode) {
      rejectedCountries += 1;
      continue;
    }

    const safeSourceUrl = preferredSourceUrl(c.source_url, src.url);
    if (!warnedOnUrl && c.source_url && safeSourceUrl !== c.source_url) {
      warnings.push(
        `ignored untrusted extracted source_url for ${src.code}; fallback to trusted source url`,
      );
      warnedOnUrl = true;
    }

    countries.push({
      country: c.country,
      country_code: countryCode,
      confirmed_cases: c.confirmed_cases,
      suspected_cases: c.suspected_cases,
      deaths: c.deaths,
      active_events: c.active_events,
      source_name: src.name,
      source_url: safeSourceUrl,
      source_type: src.tier,
      confidence: ex.confidence,
      data_status: status,
      report_date: reportDate,
      last_checked: nowIso,
      last_updated: nowIso,
    });
  }

  for (const e of ex.events) {
    const countryCode = normalizeCountryCode(e.country_code);
    const reportDate = normalizeReportDate(e.report_date, today);
    if (!countryCode || !reportDate || !e.name) {
      rejectedEvents += 1;
      continue;
    }
    if (sourceCountryCode && countryCode !== sourceCountryCode) {
      rejectedEvents += 1;
      continue;
    }

    const safeSourceUrl = preferredSourceUrl(e.source_url, src.url);
    if (!warnedOnUrl && e.source_url && safeSourceUrl !== e.source_url) {
      warnings.push(
        `ignored untrusted extracted source_url for ${src.code}; fallback to trusted source url`,
      );
      warnedOnUrl = true;
    }

    events.push({
      id: cryptoId(`${countryCode}|${e.name}|${reportDate}`),
      name: e.name,
      location: e.location,
      country: e.country,
      country_code: countryCode,
      confirmed_cases: e.confirmed_cases,
      suspected_cases: e.suspected_cases,
      deaths: e.deaths,
      status: e.status,
      source_name: src.name,
      source_url: safeSourceUrl,
      source_type: src.tier,
      confidence: ex.confidence,
      data_status: status,
      report_date: reportDate,
      last_checked: nowIso,
      last_updated: nowIso,
    });
  }

  if (rejectedCountries > 0 || rejectedEvents > 0) {
    warnings.push(
      `${src.code}: filtered ${rejectedCountries} country rows and ${rejectedEvents} event rows during validation`,
    );
  }

  return { countries, events };
}

function normalizeCountryCode(code: string): string | null {
  const normalized = String(code ?? "").toUpperCase().trim();
  if (!/^[A-Z]{2}$/.test(normalized)) return null;
  return normalized;
}

function normalizeReportDate(value: string, today: string): string | null {
  const date = String(value ?? "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  if (date < "2000-01-01") return null;
  if (date > today) return null;
  return date;
}

function preferredSourceUrl(extracted: string, fallback: string): string {
  const candidate = String(extracted ?? "").trim();
  if (!candidate) return fallback;
  return isTrustedUrl(candidate) ? candidate : fallback;
}

async function buildTimeline(
  sql: Sql,
  nowIso: string,
  currentTotals: SummaryTotals,
): Promise<TimelinePoint[]> {
  try {
    const rows = (await sql`
      SELECT as_of, totals
      FROM snapshots
      ORDER BY as_of DESC
      LIMIT 23
    `) as Array<{ as_of: string | Date; totals: unknown }>;

    const historical = rows
      .map((row) => {
        const totals = parseTotals(row.totals);
        if (!totals) return null;
        const period = toDateOnly(row.as_of);
        if (!period) return null;
        return {
          period_start: period,
          confirmed: totals.confirmed_cases,
          suspected: totals.suspected_cases,
          deaths: totals.deaths,
        };
      })
      .filter((p): p is Omit<TimelinePoint, "week"> => !!p)
      .sort((a, b) => a.period_start.localeCompare(b.period_start));

    const current = {
      period_start: nowIso.slice(0, 10),
      confirmed: currentTotals.confirmed_cases,
      suspected: currentTotals.suspected_cases,
      deaths: currentTotals.deaths,
    };

    const merged = [...historical, current];
    const deduped = dedupeByPeriodStart(merged).slice(-24);
    return deduped.map((point, idx) => ({
      week: idx + 1,
      ...point,
    }));
  } catch {
    return DEMO_SNAPSHOT.timeline;
  }
}

function cryptoId(seed: string): string {
  return createHash("sha1").update(seed).digest("hex").slice(0, 16);
}

function aggregateLatestPerCountry(rows: CountryRecord[]): CountryRecord[] {
  // For each country_code, prefer the row with the most recent report_date,
  // then highest confidence.
  const byCode = new Map<string, CountryRecord>();
  for (const r of rows) {
    const cur = byCode.get(r.country_code);
    if (!cur) {
      byCode.set(r.country_code, r);
      continue;
    }
    const newer = r.report_date > cur.report_date;
    const equal = r.report_date === cur.report_date;
    if (newer || (equal && r.confidence > cur.confidence)) {
      byCode.set(r.country_code, r);
    }
  }
  return Array.from(byCode.values()).sort(
    (a, b) => b.confirmed_cases - a.confirmed_cases,
  );
}

function parseSourceTier(value: string): TrustedSource["tier"] | null {
  if (value === "global" || value === "regional" || value === "national") {
    return value;
  }
  return null;
}

function isHttpUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function parseTotals(value: unknown): SummaryTotals | null {
  if (!value || typeof value !== "object") return null;
  const obj = value as Record<string, unknown>;
  return {
    confirmed_cases: nonNegInt(obj.confirmed_cases),
    suspected_cases: nonNegInt(obj.suspected_cases),
    deaths: nonNegInt(obj.deaths),
    active_events: nonNegInt(obj.active_events),
  };
}

function toDateOnly(value: Date | string): string | null {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  const text = String(value);
  if (/^\d{4}-\d{2}-\d{2}/.test(text)) return text.slice(0, 10);
  return null;
}

function dedupeByPeriodStart(
  points: Omit<TimelinePoint, "week">[],
): Omit<TimelinePoint, "week">[] {
  const byDate = new Map<string, Omit<TimelinePoint, "week">>();
  for (const point of points) {
    byDate.set(point.period_start, point);
  }
  return Array.from(byDate.values()).sort((a, b) =>
    a.period_start.localeCompare(b.period_start),
  );
}

function nonNegInt(v: unknown): number {
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.floor(n);
}

export type { Snapshot };
