/* global React, HD */
const { useState } = React;
const { Icon, MetricCard, SectionHead, DemoBanner, TimelineChart, CountryTable, EventTable, Disclaimer, StatusBadge, SourceBadge, fmt } = HD;

function Dashboard() {
  const s = HD.SUMMARY;
  const [region, setRegion] = useState("global");
  const [chartView, setChartView] = useState("all");
  return (
    <main>
      <DemoBanner variant="strip"/>
      <section className="container" style={{ padding: "36px 0 28px" }}>
        <div className="row between wrap gap-12" style={{ alignItems: "flex-end" }}>
          <div className="col gap-8">
            <span className="eyebrow">Public statistics</span>
            <h1 style={{ fontSize: 36 }}>Hantavirus Statistics Dashboard</h1>
            <div className="row gap-8 wrap" style={{ marginTop: 4 }}>
              <HD.LastUpdated at={HD.DEMO_TIMESTAMP}/>
              <span className="badge"><Icon name="globe" size={12}/>8 countries</span>
              <StatusBadge status="provisional"/>
            </div>
          </div>
          <div className="row gap-8 wrap">
            <div className="row gap-4" style={{ background: "var(--bg-sunken)", padding: 3, borderRadius: 8, border: "1px solid var(--line)" }}>
              {["global","americas","europe","asia"].map(r => (
                <button key={r} onClick={() => setRegion(r)} className="btn btn-sm" style={{ background: region === r ? "var(--bg-elev)" : "transparent", borderColor: region === r ? "var(--line)" : "transparent", textTransform: "capitalize" }}>{r}</button>
              ))}
            </div>
            <button className="btn btn-sm"><Icon name="download" size={13}/> CSV</button>
            <button className="btn btn-sm"><Icon name="download" size={13}/> JSON</button>
            <button className="btn btn-sm btn-ghost"><Icon name="refresh" size={13}/></button>
          </div>
        </div>
      </section>

      {/* Summary cards */}
      <section className="container" style={{ paddingBottom: 32 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }} className="metrics-grid">
          <MetricCard label="Confirmed cases" value={s.confirmed} delta={s.trend7d.confirmed} hint="Lab-confirmed"/>
          <MetricCard label="Suspected cases" value={s.suspected} delta={s.trend7d.suspected} hint="Awaiting confirmation"/>
          <MetricCard label="Deaths" value={s.deaths} delta={s.trend7d.deaths} hint={`CFR ${s.cfr}%`}/>
          <MetricCard label="Active events" value={s.active} hint="Tracked outbreaks"/>
          <MetricCard label="Last updated" value="14:00" hint={`UTC · ${HD.DEMO_TIMESTAMP.split("·")[0].trim()}`} emphasis/>
        </div>
      </section>

      {/* Timeline */}
      <section className="container" style={{ paddingBottom: 32 }}>
        <div className="card" style={{ padding: 24 }}>
          <SectionHead
            eyebrow="Last 24 weeks"
            title="Reported cases over time"
            sub="Provisional weekly counts of confirmed and suspected Hantavirus cases, with deaths overlaid."
            action={
              <div className="row gap-4" style={{ background: "var(--bg-sunken)", padding: 3, borderRadius: 8, border: "1px solid var(--line)" }}>
                {["all","confirmed","deaths"].map(v => (
                  <button key={v} onClick={() => setChartView(v)} className="btn btn-sm" style={{ background: chartView === v ? "var(--bg-elev)" : "transparent", borderColor: chartView === v ? "var(--line)" : "transparent", textTransform: "capitalize" }}>{v}</button>
                ))}
              </div>
            }
          />
          <TimelineChart height={280} showSuspected={chartView === "all"} showDeaths={chartView !== "confirmed"}/>
          <div className="row gap-16 wrap" style={{ marginTop: 12, paddingTop: 14, borderTop: "1px solid var(--line)", fontSize: 12 }}>
            <Legend color="var(--accent)" label="Confirmed"/>
            <Legend color="var(--ink-3)" label="Suspected" dashed/>
            <Legend color="var(--warn-ink)" label="Deaths"/>
            <span className="muted" style={{ marginLeft: "auto", fontSize: 11.5, fontFamily: "var(--font-mono)" }}>Source: aggregated from WHO, CDC, ECDC, PAHO, ministries</span>
          </div>
        </div>
      </section>

      {/* Country ranking + Source/Freshness panel */}
      <section className="container" style={{ paddingBottom: 32 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.55fr 1fr", gap: 20 }} className="hero-grid">
          <div className="col gap-12">
            <SectionHead eyebrow="By country" title="Country ranking" sub="Sortable. Confirmed and suspected counts shown separately."/>
            <CountryTable/>
          </div>
          <div className="col gap-20">
            <FreshnessPanel/>
            <SourcePanel/>
          </div>
        </div>
      </section>

      {/* Active events */}
      <section className="container" style={{ paddingBottom: 32 }}>
        <SectionHead eyebrow="Outbreak tracking" title="Active outbreak events"/>
        <EventTable/>
      </section>

      {/* Downloads + disclaimer */}
      <section className="container" style={{ paddingBottom: 56 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 20 }} className="hero-grid">
          <div className="card col gap-16" style={{ padding: 24 }}>
            <SectionHead eyebrow="Downloads" title="Get the data"/>
            <p className="muted" style={{ margin: 0, fontSize: 13.5, lineHeight: 1.55 }}>
              Today's snapshot in two formats. Each file includes per-source provenance and last-updated timestamps.
            </p>
            <div className="col gap-8">
              <DownloadRow label="Latest snapshot — CSV" sub="UTF-8 · RFC 4180 · 18 KB" ext="csv"/>
              <DownloadRow label="Latest snapshot — JSON" sub="UTC timestamps · 24 KB" ext="json"/>
              <DownloadRow label="Historical archive" sub="Coming soon · weekly snapshots" ext="zip" disabled/>
            </div>
          </div>
          <Disclaimer/>
        </div>
      </section>
    </main>
  );
}

function Legend({ color, label, dashed }) {
  return (
    <span className="row gap-6">
      <span style={{ width: 18, height: 2, background: dashed ? `repeating-linear-gradient(90deg, ${color} 0 4px, transparent 4px 7px)` : color, display: "inline-block" }}/>
      <span style={{ fontSize: 12, color: "var(--ink-2)" }}>{label}</span>
    </span>
  );
}

function FreshnessPanel() {
  return (
    <div className="card" style={{ padding: 22 }}>
      <SectionHead eyebrow="Data freshness" title="When this updated"/>
      <div className="col" style={{ gap: 12 }}>
        <FreshRow k="Last checked" v={HD.DEMO_LAST_CHECKED}/>
        <FreshRow k="Last updated by source" v={HD.DEMO_TIMESTAMP}/>
        <FreshRow k="Next scheduled refresh" v="May 8, 2026 · 18:00 UTC"/>
        <div className="row between" style={{ paddingTop: 12, borderTop: "1px solid var(--line)" }}>
          <span className="muted" style={{ fontSize: 12.5 }}>Data status</span>
          <StatusBadge status="provisional"/>
        </div>
      </div>
    </div>
  );
}

function FreshRow({ k, v }) {
  return (
    <div className="row between">
      <span className="muted" style={{ fontSize: 12.5 }}>{k}</span>
      <span className="mono" style={{ fontSize: 12, color: "var(--ink)" }}>{v}</span>
    </div>
  );
}

function SourcePanel() {
  return (
    <div className="card" style={{ padding: 22 }}>
      <SectionHead eyebrow="Source transparency" title="Where this data comes from"/>
      <div className="col" style={{ gap: 12 }}>
        {HD.SOURCES.map(s => (
          <div key={s.code} className="row between" style={{ paddingBottom: 12, borderBottom: "1px solid var(--line)" }}>
            <div className="col gap-4">
              <div className="row gap-8">
                <span style={{ fontWeight: 540, fontSize: 13 }}>{s.code}</span>
                <span className="badge" style={{ height: 18, padding: "0 6px", fontSize: 10.5 }}>{s.tier}</span>
              </div>
              <span className="muted" style={{ fontSize: 11.5 }}>{s.name}</span>
            </div>
            <div className="col" style={{ alignItems: "flex-end", gap: 4 }}>
              <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>{s.updated}</span>
              <span className="badge" style={{ height: 18, padding: "0 6px", fontSize: 10.5, color: s.status === "ok" ? "oklch(0.42 0.06 155)" : "var(--warn-ink)", borderColor: s.status === "ok" ? "oklch(0.55 0.08 155 / 0.3)" : "oklch(0.65 0.13 70 / 0.3)" }}>
                <span className="dot"/>{s.status === "ok" ? "Connected" : "Delayed"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DownloadRow({ label, sub, ext, disabled }) {
  return (
    <div className="row between" style={{ padding: "12px 14px", border: "1px solid var(--line)", borderRadius: 8, background: disabled ? "var(--bg-sunken)" : "var(--bg-elev)", opacity: disabled ? 0.6 : 1 }}>
      <div className="row gap-12">
        <span className="mono" style={{ fontSize: 11, padding: "3px 7px", border: "1px solid var(--line-strong)", borderRadius: 4, color: "var(--ink-2)", textTransform: "uppercase" }}>{ext}</span>
        <div className="col">
          <span style={{ fontWeight: 500, fontSize: 13.5 }}>{label}</span>
          <span className="muted" style={{ fontSize: 11.5 }}>{sub}</span>
        </div>
      </div>
      <button className="btn btn-sm" disabled={disabled}><Icon name="download" size={13}/> Download</button>
    </div>
  );
}

window.HD.Dashboard = Dashboard;
