/* global React, HD */
const { useState } = React;
const { Icon, MetricCard, SectionHead, DemoBanner, Logo, fmt, RouteCtx } = HD;

function Home() {
  const { go } = React.useContext(RouteCtx);
  const s = HD.SUMMARY;
  return (
    <main>
      <DemoBanner variant="strip"/>
      {/* Hero */}
      <section className="container" style={{ padding: "72px 0 56px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.15fr 1fr", gap: 56, alignItems: "center" }} className="hero-grid">
          <div className="col gap-24">
            <div className="row gap-8">
              <span className="eyebrow">Public-health data · v1.0</span>
              <span style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--ink-4)" }}/>
              <span className="eyebrow" style={{ color: "var(--ink-2)" }}>Updated weekly</span>
            </div>
            <h1>Hantavirus<br/>Dashboard.</h1>
            <p style={{ fontSize: 18, lineHeight: 1.5, color: "var(--ink-2)", maxWidth: 540, margin: 0 }}>
              Latest official Hantavirus statistics, outbreak updates, and developer-ready data exports — sourced from WHO, CDC, ECDC, PAHO and national health ministries.
            </p>
            <div className="row gap-12 wrap">
              <button className="btn btn-primary" onClick={() => go("dashboard")}>View Dashboard <Icon name="arrow" size={14}/></button>
              <button className="btn" onClick={() => go("developers")}><Icon name="code" size={14}/> Developer API</button>
            </div>
            <div className="row gap-12 wrap" style={{ marginTop: 8 }}>
              <span className="source-badge">WHO</span>
              <span className="source-badge">CDC</span>
              <span className="source-badge">ECDC</span>
              <span className="source-badge">PAHO</span>
              <span className="source-badge">+ 8 ministries</span>
            </div>
          </div>
          <SummaryPreviewCard onOpen={() => go("dashboard")}/>
        </div>
      </section>

      {/* Trust strip */}
      <section className="container" style={{ paddingBottom: 56 }}>
        <div className="card" style={{ padding: 28, display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1fr", gap: 28, alignItems: "start" }} >
          <div className="col gap-8" style={{ borderRight: "1px solid var(--line)", paddingRight: 28 }}>
            <Icon name="shield" size={18}/>
            <strong style={{ fontWeight: 600 }}>How this data is collected</strong>
            <p className="muted" style={{ margin: 0, fontSize: 13.5, lineHeight: 1.55 }}>
              Hantavirus data is reported through national and regional public-health systems. Some numbers are provisional, delayed, or revised. We separate confirmed from suspected cases and always cite the source.
            </p>
          </div>
          <TrustItem k="5" label="Primary sources" sub="WHO · CDC · ECDC · PAHO · National"/>
          <TrustItem k="8" label="Reporting countries" sub="Updated weekly"/>
          <TrustItem k="2hr" label="Refresh cadence" sub="From source publication"/>
        </div>
      </section>

      {/* Latest outbreak preview */}
      <section className="container" style={{ paddingBottom: 56 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 24 }} className="hero-grid">
          <div className="card" style={{ padding: 28 }}>
            <div className="row between" style={{ marginBottom: 18 }}>
              <span className="eyebrow">Latest outbreak update</span>
              <span className="source-badge">May 6, 2026 · MINSAL/MS-AR</span>
            </div>
            <h2 style={{ marginBottom: 10 }}>Patagonia rural cluster expands to Aysén</h2>
            <p style={{ margin: 0, color: "var(--ink-2)", fontSize: 14.5, lineHeight: 1.6 }}>
              A cluster of 31 confirmed cases in Río Negro Province has been linked epidemiologically to 18 additional cases reported across the border in Chile's Aysén Region. Both ministries have issued occupational guidance for forestry workers and rural residents. Confirmed deaths in the joint event total 14 of 49 confirmed cases.
            </p>
            <div className="row gap-12 wrap" style={{ marginTop: 18 }}>
              <HD.StatusBadge status="active"/>
              <span className="badge"><span className="dot"/>49 confirmed · 12 suspected</span>
              <span className="badge"><span className="dot"/>14 deaths</span>
            </div>
          </div>
          <SourceTransparencyMini/>
        </div>
      </section>

      {/* SEO content section */}
      <section className="container" style={{ paddingBottom: 56 }}>
        <div className="card" style={{ padding: 32 }}>
          <SectionHead eyebrow="About the data" title="What you'll find on this dashboard"/>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 28 }} className="grid-3">
            <SeoBlock title="Latest official statistics" body="Confirmed cases, suspected cases, deaths and active outbreak events — broken down by country, with the publishing source named on every row."/>
            <SeoBlock title="Outbreak event tracking" body="Active and recently-closed events with location, status (active, monitoring, contained), and the date of last official report."/>
            <SeoBlock title="Source transparency" body="Every figure links back to its primary publisher: WHO, CDC, ECDC, PAHO, and national ministries of health. Provisional numbers are clearly labelled."/>
          </div>
        </div>
      </section>
    </main>
  );
}

function TrustItem({ k, label, sub }) {
  return (
    <div className="col gap-4">
      <div style={{ fontSize: 30, fontWeight: 460, letterSpacing: "-0.02em" }}>{k}</div>
      <div style={{ fontWeight: 500, fontSize: 13.5 }}>{label}</div>
      <div className="muted" style={{ fontSize: 12.5 }}>{sub}</div>
    </div>
  );
}

function SeoBlock({ title, body }) {
  return (
    <div className="col gap-8">
      <h3>{title}</h3>
      <p className="muted" style={{ margin: 0, fontSize: 13.5, lineHeight: 1.6 }}>{body}</p>
    </div>
  );
}

function SummaryPreviewCard({ onOpen }) {
  const s = HD.SUMMARY;
  return (
    <div className="card" style={{ padding: 22, background: "var(--bg-elev)" }}>
      <div className="row between" style={{ marginBottom: 18 }}>
        <div className="row gap-8"><Icon name="pulse" size={14}/><span style={{ fontWeight: 540, fontSize: 14 }}>Global summary</span></div>
        <HD.LastUpdated at={HD.DEMO_TIMESTAMP}/>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <MetricCard label="Confirmed" value={s.confirmed} delta={s.trend7d.confirmed} hint="Lab-confirmed Hantavirus cases"/>
        <MetricCard label="Suspected" value={s.suspected} delta={s.trend7d.suspected} hint="Awaiting confirmation"/>
        <MetricCard label="Deaths" value={s.deaths} delta={s.trend7d.deaths} hint={`CFR ${s.cfr}% · provisional`}/>
        <MetricCard label="Active events" value={s.active} hint="In ≥ 1 country"/>
      </div>
      <div className="row between" style={{ marginTop: 16 }}>
        <span className="muted" style={{ fontSize: 12.5 }}>{s.updated}</span>
        <button className="btn btn-sm btn-ghost" onClick={onOpen}>Open dashboard <Icon name="arrow" size={12}/></button>
      </div>
    </div>
  );
}

function SourceTransparencyMini() {
  return (
    <div className="card" style={{ padding: 22 }}>
      <div className="row between" style={{ marginBottom: 14 }}>
        <span className="eyebrow">Source transparency</span>
        <span className="badge badge-finalized"><span className="dot"/>5 connected</span>
      </div>
      <div className="col" style={{ gap: 10 }}>
        {HD.SOURCES.map(s => (
          <div key={s.code} className="row between" style={{ paddingBottom: 10, borderBottom: "1px solid var(--line)" }}>
            <div className="col" style={{ gap: 2 }}>
              <span style={{ fontWeight: 540, fontSize: 13 }}>{s.code}</span>
              <span className="muted" style={{ fontSize: 11.5 }}>{s.name}</span>
            </div>
            <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>{s.updated}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

window.HD.Home = Home;
