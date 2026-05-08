/* global React, HD */
const { useState, useMemo } = React;
const { Icon, StatusBadge, SourceBadge, Pill, fmt, TIMELINE } = HD;

// ============== Summary metric card ==============
function MetricCard({ label, value, delta, hint, tone = "neutral", emphasis = false }) {
  const trendColor = delta == null ? null : delta > 0 ? "var(--warn-ink)" : "oklch(0.45 0.07 155)";
  const trendArrow = delta == null ? "" : delta > 0 ? "▲" : "▼";
  return (
    <div className="card col" style={{ padding: 18, gap: 14, minHeight: 132, background: emphasis ? "var(--bg-sunken)" : "var(--bg-elev)" }}>
      <div className="row between">
        <span className="eyebrow">{label}</span>
        {delta != null && (
          <span className="mono" style={{ fontSize: 11, color: trendColor, letterSpacing: 0 }}>
            {trendArrow} {Math.abs(delta)} · 7d
          </span>
        )}
      </div>
      <div className="col gap-4">
        <div style={{ fontSize: 36, fontWeight: 460, letterSpacing: "-0.025em", fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>
          {typeof value === "number" ? fmt(value) : value}
        </div>
        {hint && <div className="muted" style={{ fontSize: 12.5 }}>{hint}</div>}
      </div>
    </div>
  );
}

// ============== Timeline chart (SVG) ==============
function TimelineChart({ height = 260, showSuspected = true, showDeaths = true }) {
  const W = 1000;
  const H = height;
  const padX = 40, padTop = 24, padBot = 36;
  const data = TIMELINE;
  const maxY = Math.max(...data.map(d => d.confirmed)) * 1.15;
  const x = (i) => padX + (i / (data.length - 1)) * (W - padX * 2);
  const y = (v) => padTop + (1 - v / maxY) * (H - padTop - padBot);

  const line = (key) => data.map((d, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${y(d[key]).toFixed(1)}`).join(" ");
  const area = data.map((d, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${y(d.confirmed).toFixed(1)}`).join(" ")
              + ` L ${x(data.length - 1).toFixed(1)} ${y(0).toFixed(1)} L ${x(0).toFixed(1)} ${y(0).toFixed(1)} Z`;

  const ticks = [0, 0.25, 0.5, 0.75, 1].map(t => Math.round(maxY * t));
  const xTicks = [0, 6, 12, 18, 23];

  return (
    <div style={{ width: "100%", overflow: "hidden" }}>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: "100%", height, display: "block" }}>
        <defs>
          <linearGradient id="confArea" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.18"/>
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0"/>
          </linearGradient>
        </defs>
        {ticks.map((t, i) => (
          <g key={i}>
            <line x1={padX} x2={W - padX} y1={y(t)} y2={y(t)} stroke="var(--line)" strokeDasharray={i === 0 ? "" : "2 4"} />
            <text x={padX - 8} y={y(t) + 4} textAnchor="end" fontSize="10" fontFamily="var(--font-mono)" fill="var(--ink-3)">{t}</text>
          </g>
        ))}
        {xTicks.map((i) => (
          <text key={i} x={x(i)} y={H - 14} textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" fill="var(--ink-3)">W{i + 1}</text>
        ))}
        <path d={area} fill="url(#confArea)" />
        <path d={line("confirmed")} fill="none" stroke="var(--accent)" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round"/>
        {showSuspected && <path d={line("suspected")} fill="none" stroke="var(--ink-3)" strokeWidth="1.4" strokeDasharray="4 3" strokeLinejoin="round"/>}
        {showDeaths && <path d={line("deaths")} fill="none" stroke="var(--warn-ink)" strokeWidth="1.4" strokeLinejoin="round"/>}
        {data.map((d, i) => (
          <circle key={i} cx={x(i)} cy={y(d.confirmed)} r="2" fill="var(--accent)"/>
        ))}
      </svg>
    </div>
  );
}

// ============== Country table ==============
function CountryTable({ rows = HD.COUNTRIES, sortable = true }) {
  const [sort, setSort] = useState({ key: "confirmed", dir: "desc" });
  const sorted = useMemo(() => {
    const r = [...rows];
    r.sort((a, b) => {
      const av = a[sort.key], bv = b[sort.key];
      if (typeof av === "number") return sort.dir === "desc" ? bv - av : av - bv;
      return sort.dir === "desc" ? String(bv).localeCompare(String(av)) : String(av).localeCompare(String(bv));
    });
    return r;
  }, [rows, sort]);
  const Th = ({ k, children, num }) => (
    <th onClick={() => sortable && setSort(s => ({ key: k, dir: s.key === k && s.dir === "desc" ? "asc" : "desc" }))}
        style={{ cursor: sortable ? "pointer" : "default", textAlign: num ? "right" : "left", userSelect: "none" }}>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
        {children}
        {sortable && sort.key === k && <span style={{ opacity: 0.5 }}>{sort.dir === "desc" ? "↓" : "↑"}</span>}
      </span>
    </th>
  );
  return (
    <div className="card scroll-x">
      <table className="tbl">
        <thead>
          <tr>
            <Th k="name">Country</Th>
            <Th k="confirmed" num>Confirmed</Th>
            <Th k="suspected" num>Suspected</Th>
            <Th k="deaths" num>Deaths</Th>
            <Th k="last">Last report</Th>
            <Th k="source">Source</Th>
            <Th k="status">Status</Th>
          </tr>
        </thead>
        <tbody>
          {sorted.map(c => (
            <tr key={c.code}>
              <td>
                <div className="row gap-8">
                  <span style={{ width: 22, height: 16, background: "var(--bg-sunken)", borderRadius: 2, fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--ink-3)", display: "inline-flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--line)" }}>{c.code}</span>
                  <span style={{ fontWeight: 500 }}>{c.name}</span>
                </div>
              </td>
              <td className="num" style={{ textAlign: "right" }}>{fmt(c.confirmed)}</td>
              <td className="num" style={{ textAlign: "right", color: "var(--ink-2)" }}>{fmt(c.suspected)}</td>
              <td className="num" style={{ textAlign: "right" }}>{fmt(c.deaths)}</td>
              <td style={{ color: "var(--ink-2)", fontFamily: "var(--font-mono)", fontSize: 12.5 }}>{c.last}</td>
              <td><SourceBadge name={c.source}/></td>
              <td><StatusBadge status={c.status}/></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ============== Event table ==============
function EventTable({ rows = HD.EVENTS }) {
  return (
    <div className="card scroll-x">
      <table className="tbl">
        <thead>
          <tr>
            <th>Event</th>
            <th>Location</th>
            <th style={{ textAlign: "right" }}>Confirmed</th>
            <th style={{ textAlign: "right" }}>Suspected</th>
            <th style={{ textAlign: "right" }}>Deaths</th>
            <th>Status</th>
            <th>Source</th>
            <th>Last report</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((e, i) => (
            <tr key={i}>
              <td style={{ fontWeight: 500 }}>{e.name}</td>
              <td style={{ color: "var(--ink-2)" }}>{e.loc}</td>
              <td className="num" style={{ textAlign: "right" }}>{fmt(e.confirmed)}</td>
              <td className="num" style={{ textAlign: "right", color: "var(--ink-2)" }}>{fmt(e.suspected)}</td>
              <td className="num" style={{ textAlign: "right" }}>{fmt(e.deaths)}</td>
              <td><StatusBadge status={e.status}/></td>
              <td><SourceBadge name={e.source}/></td>
              <td style={{ color: "var(--ink-2)", fontFamily: "var(--font-mono)", fontSize: 12.5 }}>{e.last}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ============== Section header ==============
function SectionHead({ eyebrow, title, action, sub }) {
  return (
    <div className="row between wrap gap-12" style={{ alignItems: "flex-end", marginBottom: 16 }}>
      <div className="col gap-6">
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h2>{title}</h2>
        {sub && <div className="muted" style={{ fontSize: 14, maxWidth: 640 }}>{sub}</div>}
      </div>
      {action}
    </div>
  );
}

// ============== Disclaimer ==============
function Disclaimer() {
  return (
    <div className="card" style={{ padding: 22, background: "var(--bg-sunken)" }}>
      <div className="row gap-8" style={{ marginBottom: 8 }}>
        <Icon name="shield" size={16}/>
        <strong style={{ fontWeight: 600, fontSize: 14 }}>Public-health disclaimer</strong>
      </div>
      <p className="muted" style={{ margin: 0, fontSize: 13.5, lineHeight: 1.6, maxWidth: 760 }}>
        Hantavirus is reported through national and regional public-health systems with varying schedules. Numbers shown may be provisional, delayed, or revised as cases are confirmed and investigations close. Confirmed and suspected counts are kept separate. This site aggregates publicly available data and does not replace guidance from your local health authority.
      </p>
    </div>
  );
}

window.HD.MetricCard = MetricCard;
window.HD.TimelineChart = TimelineChart;
window.HD.CountryTable = CountryTable;
window.HD.EventTable = EventTable;
window.HD.SectionHead = SectionHead;
window.HD.Disclaimer = Disclaimer;
