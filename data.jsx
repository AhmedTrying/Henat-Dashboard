/* global React */
const { useState, useEffect, useMemo, createContext, useContext } = React;

// =============== Mock data ===============
const DEMO_TIMESTAMP = "May 7, 2026 · 14:00 UTC";
const DEMO_LAST_CHECKED = "May 8, 2026 · 09:12 UTC";

const SUMMARY = {
  confirmed: 229,
  suspected: 47,
  deaths: 59,
  active: 3,
  cfr: 25.8, // case fatality rate %
  trend7d: { confirmed: +12, suspected: +5, deaths: +2 },
  updated: DEMO_TIMESTAMP,
};

const COUNTRIES = [
  { code: "AR", name: "Argentina",     confirmed: 78, suspected: 14, deaths: 21, last: "May 6, 2026", source: "Min. Salud", status: "provisional" },
  { code: "CL", name: "Chile",         confirmed: 52, suspected:  9, deaths: 14, last: "May 6, 2026", source: "MINSAL",     status: "provisional" },
  { code: "US", name: "United States", confirmed: 34, suspected:  6, deaths:  8, last: "May 5, 2026", source: "CDC",        status: "finalized"   },
  { code: "BR", name: "Brazil",        confirmed: 28, suspected:  8, deaths:  7, last: "May 5, 2026", source: "MS-Brasil",  status: "provisional" },
  { code: "PA", name: "Panama",        confirmed: 14, suspected:  4, deaths:  3, last: "May 4, 2026", source: "MINSA-PA",   status: "under-review"},
  { code: "MY", name: "Malaysia",      confirmed:  9, suspected:  3, deaths:  3, last: "May 3, 2026", source: "KKM",        status: "under-review"},
  { code: "SA", name: "Saudi Arabia",  confirmed:  8, suspected:  2, deaths:  2, last: "May 2, 2026", source: "MoH-SA",     status: "provisional" },
  { code: "ID", name: "Indonesia",     confirmed:  6, suspected:  1, deaths:  1, last: "May 2, 2026", source: "Kemenkes",   status: "under-review"},
];

const EVENTS = [
  { name: "Patagonia rural cluster", loc: "Río Negro, Argentina", confirmed: 31, suspected: 8, deaths: 9,  status: "active",     source: "Min. Salud", last: "May 6, 2026" },
  { name: "Aysén forestry outbreak", loc: "Aysén Region, Chile",  confirmed: 18, suspected: 4, deaths: 5,  status: "active",     source: "MINSAL",     last: "May 6, 2026" },
  { name: "Four Corners advisory",   loc: "New Mexico, USA",      confirmed: 11, suspected: 2, deaths: 3,  status: "monitoring", source: "CDC",        last: "May 5, 2026" },
];

// 24 weeks of timeline data
const TIMELINE = Array.from({ length: 24 }, (_, i) => {
  const base = 6 + Math.sin(i / 3) * 2.5 + i * 0.18;
  const c = Math.max(2, Math.round(base + (i > 16 ? (i - 16) * 1.4 : 0)));
  const s = Math.max(0, Math.round(c * 0.32 + Math.sin(i / 2) * 1.2));
  const d = Math.max(0, Math.round(c * 0.22 + (i > 18 ? 1 : 0)));
  return { week: i + 1, confirmed: c, suspected: s, deaths: d };
});

const SOURCES = [
  { code: "WHO",  name: "World Health Organization",                tier: "Global",   updated: "May 7, 2026", url: "who.int",        status: "ok"   },
  { code: "CDC",  name: "U.S. Centers for Disease Control",         tier: "National", updated: "May 5, 2026", url: "cdc.gov",        status: "ok"   },
  { code: "ECDC", name: "European Centre for Disease Prevention",   tier: "Regional", updated: "May 5, 2026", url: "ecdc.europa.eu", status: "ok"   },
  { code: "PAHO", name: "Pan American Health Organization",         tier: "Regional", updated: "May 6, 2026", url: "paho.org",       status: "ok"   },
  { code: "MoH",  name: "National Health Ministries (8 countries)", tier: "National", updated: "May 6, 2026", url: "various",        status: "delay"},
];

const ENDPOINTS = [
  { method: "GET", path: "/api/v1/hantavirus/summary",                   desc: "Latest global counts and last-updated timestamp." },
  { method: "GET", path: "/api/v1/hantavirus/events",                    desc: "All active and recent outbreak events." },
  { method: "GET", path: "/api/v1/hantavirus/countries",                 desc: "Per-country totals and reporting status." },
  { method: "GET", path: "/api/v1/hantavirus/countries/{country_code}",  desc: "Single-country detail by ISO 3166-1 alpha-2 code." },
  { method: "GET", path: "/api/v1/hantavirus/export/latest.csv",         desc: "Latest dataset as CSV. UTF-8, RFC 4180." },
  { method: "GET", path: "/api/v1/hantavirus/export/latest.json",        desc: "Latest dataset as JSON. UTC timestamps." },
];

const CHANGELOG = [
  { date: "May 7, 2026", note: "Demo dataset refreshed; added Indonesia entry." },
  { date: "May 1, 2026", note: "v1: countries/{code} endpoint published." },
  { date: "Apr 22, 2026", note: "v1: summary, events, countries endpoints published." },
];

// =============== Context ===============
const RouteCtx = createContext({ route: "home", go: () => {} });
const TweakCtx = createContext({});

// =============== Primitives ===============
function Logo({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2.5" y="2.5" width="19" height="19" rx="3.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M7 15.5 L10.5 9 L13.5 13.5 L17 7.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="17" cy="7.5" r="1.4" fill="currentColor" />
    </svg>
  );
}

function Icon({ name, size = 16 }) {
  const s = size;
  const p = { width: s, height: s, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" };
  const map = {
    arrow: <svg {...p}><path d="M5 12h14M13 6l6 6-6 6"/></svg>,
    download: <svg {...p}><path d="M12 4v12m0 0 4-4m-4 4-4-4M5 20h14"/></svg>,
    info: <svg {...p}><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>,
    warn: <svg {...p}><path d="M10.3 3.86 2 18a2 2 0 0 0 1.71 3h16.58A2 2 0 0 0 22 18L13.71 3.86a2 2 0 0 0-3.42 0Z"/><path d="M12 9v4M12 17h.01"/></svg>,
    check: <svg {...p}><path d="M20 6 9 17l-5-5"/></svg>,
    ext: <svg {...p}><path d="M14 4h6v6M20 4l-9 9M19 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5"/></svg>,
    code: <svg {...p}><path d="m8 9-4 3 4 3M16 9l4 3-4 3M14 5l-4 14"/></svg>,
    chart: <svg {...p}><path d="M3 3v18h18"/><path d="m7 15 4-4 3 3 5-6"/></svg>,
    table: <svg {...p}><rect x="3" y="4" width="18" height="16" rx="1.5"/><path d="M3 10h18M9 4v16"/></svg>,
    menu: <svg {...p}><path d="M4 7h16M4 12h16M4 17h16"/></svg>,
    close: <svg {...p}><path d="M6 6l12 12M6 18 18 6"/></svg>,
    refresh: <svg {...p}><path d="M3 12a9 9 0 0 1 15.5-6.3L21 8M21 4v4h-4M21 12a9 9 0 0 1-15.5 6.3L3 16M3 20v-4h4"/></svg>,
    pulse: <svg {...p}><path d="M3 12h4l2-7 4 14 2-7h6"/></svg>,
    globe: <svg {...p}><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>,
    shield: <svg {...p}><path d="M12 3 4 6v6c0 5 3.5 8.5 8 9 4.5-.5 8-4 8-9V6l-8-3Z"/></svg>,
  };
  return map[name] || null;
}

function Pill({ children, tone = "neutral" }) {
  const cls = `badge ${tone === "neutral" ? "" : `badge-${tone}`}`;
  return <span className={cls}>{children}</span>;
}

function StatusBadge({ status }) {
  const map = {
    "provisional":  { label: "Provisional",  cls: "badge-provisional" },
    "finalized":    { label: "Finalized",    cls: "badge-finalized"   },
    "under-review": { label: "Under review", cls: "badge-review"      },
    "active":       { label: "Active",       cls: "badge-active"      },
    "monitoring":   { label: "Monitoring",   cls: "badge-monitoring"  },
    "contained":    { label: "Contained",    cls: "badge-contained"   },
  };
  const m = map[status] || { label: status, cls: "" };
  return <span className={`badge ${m.cls}`}><span className="dot"/>{m.label}</span>;
}

function SourceBadge({ name }) {
  return <span className="source-badge">{name}</span>;
}

function LastUpdated({ at = DEMO_TIMESTAMP, prefix = "Updated" }) {
  return (
    <span className="badge" style={{ background: "transparent", borderColor: "var(--line)" }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--ok)", boxShadow: "0 0 0 3px oklch(0.55 0.08 155 / 0.18)" }}/>
      <span className="muted" style={{ fontSize: 11.5, fontFamily: "var(--font-mono)", letterSpacing: 0 }}>{prefix} · {at}</span>
    </span>
  );
}

function fmt(n) { return n.toLocaleString("en-US"); }

window.HD = window.HD || {};
Object.assign(window.HD, {
  SUMMARY, COUNTRIES, EVENTS, TIMELINE, SOURCES, ENDPOINTS, CHANGELOG,
  DEMO_TIMESTAMP, DEMO_LAST_CHECKED,
  RouteCtx, TweakCtx,
  Logo, Icon, Pill, StatusBadge, SourceBadge, LastUpdated, fmt,
});
