import Link from "next/link";
import type { Metadata } from "next";
import { WarningBanner } from "@/components/WarningBanner";
import { SummaryCard } from "@/components/SummaryCard";
import { LastUpdatedBadge } from "@/components/LastUpdatedBadge";
import { SectionHead } from "@/components/SectionHead";
import { Icon } from "@/components/Icon";
import { SourceBadge } from "@/components/SourceBadge";
import { DataStatusBadge } from "@/components/DataStatusBadge";
import { WorldChoropleth } from "@/components/WorldChoropleth";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbLd, faqLd } from "@/lib/seo";
import { getLatestSnapshot } from "@/lib/snapshot";
import { fmtDate, fmtDateTimeUTC } from "@/lib/format";

export const metadata: Metadata = {
  title: "Hantavirus Dashboard — Latest official statistics",
  description:
    "Latest official Hantavirus statistics, outbreak updates, and developer-ready data exports. Aggregated from WHO, CDC, ECDC, PAHO and national health ministries.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Hantavirus Dashboard — Latest official statistics",
    description:
      "Latest official Hantavirus statistics, outbreak updates, and developer-ready data exports.",
    url: "/",
  },
};

export default async function HomePage() {
  const snap = await getLatestSnapshot();
  const t = snap.totals;
  const featured = snap.events.find((e) => e.status === "active") ?? snap.events[0];

  // FAQ placeholder hook — wired but inert. Pass real Q&A items here when
  // they're written; until then `faqLd(undefined)` emits nothing rather than
  // fabricating content.
  const faqItems = undefined;

  return (
    <main>
      <JsonLd data={breadcrumbLd([{ name: "Home", href: "/" }])} />
      <JsonLd data={faqLd(faqItems)} />
      {snap.is_demo ? <WarningBanner variant="strip" /> : null}

      {/* Hero */}
      <section className="container" style={{ padding: "72px 0 48px" }}>
        <div
          className="hero-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1.15fr 1fr",
            gap: 56,
            alignItems: "center",
          }}
        >
          <div className="col gap-24">
            <div className="row gap-8 wrap">
              <span className="eyebrow">Public-health data · v1.0</span>
              <span style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--ink-4)" }} />
              <span className="eyebrow" style={{ color: "var(--ink-2)" }}>Updated weekly</span>
            </div>
            <h1>
              Hantavirus
              <br />
              Dashboard.
            </h1>
            <p
              style={{
                fontSize: 18,
                lineHeight: 1.5,
                color: "var(--ink-2)",
                maxWidth: 540,
                margin: 0,
              }}
            >
              Latest official Hantavirus statistics, outbreak updates, and developer-ready data exports —
              sourced from WHO, CDC, ECDC, PAHO and national health ministries.
            </p>
            <div className="row gap-12 wrap">
              <Link href="/dashboard" className="btn btn-primary">
                View Dashboard <Icon name="arrow" size={14} />
              </Link>
              <Link href="/developers" className="btn">
                <Icon name="code" size={14} /> Developer API
              </Link>
            </div>
            <div className="row gap-12 wrap" style={{ marginTop: 8 }}>
              {snap.sources_used.slice(0, 4).map((s) => (
                <SourceBadge key={s.code} name={s.code} href={s.url} />
              ))}
              <span className="source-badge">+ ministries</span>
            </div>
          </div>

          {/* Summary preview card */}
          <div className="card" style={{ padding: 22 }}>
            <div className="row between" style={{ marginBottom: 18 }}>
              <div className="row gap-8">
                <Icon name="pulse" size={14} />
                <span style={{ fontWeight: 540, fontSize: 14 }}>Global summary</span>
              </div>
              <LastUpdatedBadge at={snap.as_of} />
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
              className="metrics-grid"
            >
              <SummaryCard label="Confirmed" value={t.confirmed_cases} hint="Lab-confirmed cases" />
              <SummaryCard label="Suspected" value={t.suspected_cases} hint="Awaiting confirmation" />
              <SummaryCard label="Deaths" value={t.deaths} hint="Provisional" />
              <SummaryCard label="Active events" value={t.active_events} hint="In ≥ 1 country" />
            </div>
            <div className="row between" style={{ marginTop: 16 }}>
              <span className="muted" style={{ fontSize: 12.5 }}>
                Latest official statistics · {fmtDateTimeUTC(snap.as_of)}
              </span>
              <Link href="/dashboard" className="btn btn-sm btn-ghost">
                Open <Icon name="arrow" size={12} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Global distribution — choropleth */}
      <section className="container" style={{ paddingBottom: 56 }}>
        <div className="card" style={{ padding: 28 }}>
          <SectionHead
            eyebrow="Global distribution"
            title="Where reported cases are concentrated"
            sub="Latest official statistics shaded by country. Confirmed and suspected counts are kept separate; deaths are shown in a distinct ramp. Hover or focus a country for its current value."
          />
          <WorldChoropleth countries={snap.by_country} />
        </div>
      </section>

      {/* Trust strip */}
      <section className="container" style={{ paddingBottom: 56 }}>
        <div
          className="card stack-mobile"
          style={{
            padding: 28,
            display: "grid",
            gridTemplateColumns: "1.4fr 1fr 1fr 1fr",
            gap: 28,
            alignItems: "start",
          }}
        >
          <div className="col gap-8 trust-strip__lead" style={{ borderRight: "1px solid var(--line)", paddingRight: 28 }}>
            <Icon name="shield" size={18} />
            <strong style={{ fontWeight: 600 }}>How this data is collected</strong>
            <p className="muted" style={{ margin: 0, fontSize: 13.5, lineHeight: 1.55 }}>
              Hantavirus data is reported through national and regional public-health systems. Some
              numbers are provisional, delayed, or revised. We separate confirmed from suspected cases
              and always cite the source.
            </p>
          </div>
          <TrustItem k={String(snap.sources_used.length)} label="Primary sources" sub="WHO · CDC · ECDC · PAHO · National" />
          <TrustItem k={String(snap.by_country.length)} label="Reporting countries" sub="Updated weekly" />
          <TrustItem k="24h" label="Refresh cadence" sub="From source publication" />
        </div>
      </section>

      {/* Latest outbreak update */}
      <section className="container" style={{ paddingBottom: 56 }}>
        <div
          className="hero-grid"
          style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 24 }}
        >
          {featured ? (
            <article className="card" style={{ padding: 28 }}>
              <div className="row between wrap" style={{ marginBottom: 18, gap: 8 }}>
                <span className="eyebrow">Latest outbreak update</span>
                <SourceBadge name={`${fmtDate(featured.report_date)} · ${featured.source_name}`} />
              </div>
              <h2 style={{ marginBottom: 10 }}>{featured.name}</h2>
              <p style={{ margin: 0, color: "var(--ink-2)", fontSize: 14.5, lineHeight: 1.6 }}>
                {featured.confirmed_cases} confirmed, {featured.suspected_cases} suspected and{" "}
                {featured.deaths} death{featured.deaths === 1 ? "" : "s"} reported in {featured.location}.
                Confirmed and suspected cases are tracked separately; figures are provisional and may be
                revised by the publishing ministry.
              </p>
              <div className="row gap-12 wrap" style={{ marginTop: 18 }}>
                <DataStatusBadge status={featured.status} />
                <span className="badge">
                  <span className="dot" />
                  {featured.confirmed_cases} confirmed · {featured.suspected_cases} suspected
                </span>
                <span className="badge">
                  <span className="dot" />
                  {featured.deaths} death{featured.deaths === 1 ? "" : "s"}
                </span>
              </div>
            </article>
          ) : null}

          {/* Source transparency mini */}
          <div className="card" style={{ padding: 22 }}>
            <div className="row between" style={{ marginBottom: 14 }}>
              <span className="eyebrow">Source transparency</span>
              <span className="badge badge-finalized">
                <span className="dot" />
                {snap.sources_used.length} connected
              </span>
            </div>
            <div className="col" style={{ gap: 10 }}>
              {snap.sources_used.map((s) => (
                <div
                  key={s.code}
                  className="row between"
                  style={{ paddingBottom: 10, borderBottom: "1px solid var(--line)" }}
                >
                  <div className="col" style={{ gap: 2 }}>
                    <span style={{ fontWeight: 540, fontSize: 13 }}>{s.code}</span>
                    <span className="muted" style={{ fontSize: 11.5 }}>{s.name}</span>
                  </div>
                  <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>
                    {fmtDate(s.last_updated)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SEO content section */}
      <section className="container" style={{ paddingBottom: 72 }}>
        <div className="card" style={{ padding: 32 }}>
          <SectionHead eyebrow="About the data" title="What you'll find on this dashboard" />
          <div
            className="grid-3 stack-mobile"
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 28 }}
          >
            <SeoBlock
              title="Latest official statistics"
              body="Confirmed cases, suspected cases, deaths and active outbreak events — broken down by country, with the publishing source named on every row."
            />
            <SeoBlock
              title="Outbreak event tracking"
              body="Active and recently-closed events with location, status (active, monitoring, contained), and the date of last official report."
            />
            <SeoBlock
              title="Source transparency"
              body="Every figure links back to its primary publisher: WHO, CDC, ECDC, PAHO, and national ministries of health. Provisional numbers are clearly labelled."
            />
          </div>
        </div>
      </section>
    </main>
  );
}

function TrustItem({ k, label, sub }: { k: string; label: string; sub: string }) {
  return (
    <div className="col gap-4">
      <div style={{ fontSize: 30, fontWeight: 460, letterSpacing: "-0.02em" }}>{k}</div>
      <div style={{ fontWeight: 500, fontSize: 13.5 }}>{label}</div>
      <div className="muted" style={{ fontSize: 12.5 }}>{sub}</div>
    </div>
  );
}

function SeoBlock({ title, body }: { title: string; body: string }) {
  return (
    <div className="col gap-8">
      <h3>{title}</h3>
      <p className="muted" style={{ margin: 0, fontSize: 13.5, lineHeight: 1.6 }}>{body}</p>
    </div>
  );
}
