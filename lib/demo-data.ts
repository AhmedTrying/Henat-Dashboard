import type {
  CountryRecord,
  EventRecord,
  Snapshot,
  SourceInfo,
  TimelinePoint,
} from "./types";

const AS_OF = "2026-05-07T14:00:00Z";
const LAST_CHECKED = "2026-05-08T09:12:00Z";

function record(
  partial: Omit<CountryRecord, "last_checked" | "last_updated">,
): CountryRecord {
  return {
    ...partial,
    last_checked: LAST_CHECKED,
    last_updated: AS_OF,
  };
}

const COUNTRIES: CountryRecord[] = [
  record({ country: "Argentina",     country_code: "AR", confirmed_cases: 78, suspected_cases: 14, deaths: 21, active_events: 1, source_name: "Ministerio de Salud, Argentina", source_url: "https://www.argentina.gob.ar/salud", source_type: "national", confidence: 0.92, data_status: "provisional", report_date: "2026-05-06" }),
  record({ country: "Chile",         country_code: "CL", confirmed_cases: 52, suspected_cases:  9, deaths: 14, active_events: 1, source_name: "MINSAL",                          source_url: "https://www.minsal.cl/",            source_type: "national", confidence: 0.90, data_status: "provisional", report_date: "2026-05-06" }),
  record({ country: "United States", country_code: "US", confirmed_cases: 34, suspected_cases:  6, deaths:  8, active_events: 1, source_name: "CDC",                              source_url: "https://www.cdc.gov/hantavirus/",   source_type: "national", confidence: 0.97, data_status: "finalized",   report_date: "2026-05-05" }),
  record({ country: "Brazil",        country_code: "BR", confirmed_cases: 28, suspected_cases:  8, deaths:  7, active_events: 0, source_name: "Ministério da Saúde, Brasil",     source_url: "https://www.gov.br/saude/pt-br",    source_type: "national", confidence: 0.88, data_status: "provisional", report_date: "2026-05-05" }),
  record({ country: "Panama",        country_code: "PA", confirmed_cases: 14, suspected_cases:  4, deaths:  3, active_events: 0, source_name: "MINSA Panamá",                     source_url: "https://www.minsa.gob.pa/",         source_type: "national", confidence: 0.62, data_status: "under_review", report_date: "2026-05-04" }),
  record({ country: "Malaysia",      country_code: "MY", confirmed_cases:  9, suspected_cases:  3, deaths:  3, active_events: 0, source_name: "KKM",                              source_url: "https://www.moh.gov.my/",            source_type: "national", confidence: 0.58, data_status: "under_review", report_date: "2026-05-03" }),
  record({ country: "Saudi Arabia",  country_code: "SA", confirmed_cases:  8, suspected_cases:  2, deaths:  2, active_events: 0, source_name: "MoH Saudi Arabia",                 source_url: "https://www.moh.gov.sa/",            source_type: "national", confidence: 0.81, data_status: "provisional", report_date: "2026-05-02" }),
  record({ country: "Indonesia",     country_code: "ID", confirmed_cases:  6, suspected_cases:  1, deaths:  1, active_events: 0, source_name: "Kemenkes",                         source_url: "https://www.kemkes.go.id/",          source_type: "national", confidence: 0.55, data_status: "under_review", report_date: "2026-05-02" }),
];

const EVENTS: EventRecord[] = [
  {
    id: "evt-patagonia",
    name: "Patagonia rural cluster",
    location: "Río Negro, Argentina",
    country: "Argentina",
    country_code: "AR",
    confirmed_cases: 31,
    suspected_cases: 8,
    deaths: 9,
    status: "active",
    source_name: "Ministerio de Salud, Argentina",
    source_url: "https://www.argentina.gob.ar/salud",
    source_type: "national",
    confidence: 0.92,
    data_status: "provisional",
    report_date: "2026-05-06",
    last_checked: LAST_CHECKED,
    last_updated: AS_OF,
  },
  {
    id: "evt-aysen",
    name: "Aysén forestry outbreak",
    location: "Aysén Region, Chile",
    country: "Chile",
    country_code: "CL",
    confirmed_cases: 18,
    suspected_cases: 4,
    deaths: 5,
    status: "active",
    source_name: "MINSAL",
    source_url: "https://www.minsal.cl/",
    source_type: "national",
    confidence: 0.90,
    data_status: "provisional",
    report_date: "2026-05-06",
    last_checked: LAST_CHECKED,
    last_updated: AS_OF,
  },
  {
    id: "evt-four-corners",
    name: "Four Corners advisory",
    location: "New Mexico, USA",
    country: "United States",
    country_code: "US",
    confirmed_cases: 11,
    suspected_cases: 2,
    deaths: 3,
    status: "monitoring",
    source_name: "CDC",
    source_url: "https://www.cdc.gov/hantavirus/",
    source_type: "national",
    confidence: 0.95,
    data_status: "finalized",
    report_date: "2026-05-05",
    last_checked: LAST_CHECKED,
    last_updated: AS_OF,
  },
];

const SOURCES: SourceInfo[] = [
  { code: "WHO",  name: "World Health Organization",                    tier: "global",   url: "https://www.who.int",       last_updated: "2026-05-07T00:00:00Z", status: "ok" },
  { code: "CDC",  name: "U.S. Centers for Disease Control",             tier: "national", url: "https://www.cdc.gov",        last_updated: "2026-05-05T00:00:00Z", status: "ok" },
  { code: "ECDC", name: "European Centre for Disease Prevention",       tier: "regional", url: "https://www.ecdc.europa.eu", last_updated: "2026-05-05T00:00:00Z", status: "ok" },
  { code: "PAHO", name: "Pan American Health Organization",             tier: "regional", url: "https://www.paho.org",       last_updated: "2026-05-06T00:00:00Z", status: "ok" },
  { code: "MoH",  name: "National Health Ministries (8 countries)",     tier: "national", url: "various",                    last_updated: "2026-05-06T00:00:00Z", status: "delay" },
];

const TIMELINE: TimelinePoint[] = Array.from({ length: 24 }, (_, i) => {
  const base = 6 + Math.sin(i / 3) * 2.5 + i * 0.18;
  const c = Math.max(2, Math.round(base + (i > 16 ? (i - 16) * 1.4 : 0)));
  const s = Math.max(0, Math.round(c * 0.32 + Math.sin(i / 2) * 1.2));
  const d = Math.max(0, Math.round(c * 0.22 + (i > 18 ? 1 : 0)));
  const start = new Date(Date.UTC(2025, 10, 17));
  start.setUTCDate(start.getUTCDate() + i * 7);
  return {
    week: i + 1,
    period_start: start.toISOString().slice(0, 10),
    confirmed: c,
    suspected: s,
    deaths: d,
  };
});

export const DEMO_SNAPSHOT: Snapshot = {
  id: "demo-snapshot",
  as_of: AS_OF,
  data_status: "provisional",
  totals: {
    confirmed_cases: COUNTRIES.reduce((a, c) => a + c.confirmed_cases, 0),
    suspected_cases: COUNTRIES.reduce((a, c) => a + c.suspected_cases, 0),
    deaths: COUNTRIES.reduce((a, c) => a + c.deaths, 0),
    active_events: EVENTS.filter((e) => e.status === "active").length,
  },
  by_country: COUNTRIES,
  events: EVENTS,
  sources_used: SOURCES,
  timeline: TIMELINE,
  last_checked: LAST_CHECKED,
  is_demo: true,
  notes: "Built-in demo dataset. Connect official sources before public launch.",
};
