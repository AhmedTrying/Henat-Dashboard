import type { Metadata } from "next";
import { WarningBanner } from "@/components/WarningBanner";
import { SummaryCard } from "@/components/SummaryCard";
import { LastUpdatedBadge } from "@/components/LastUpdatedBadge";
import { SectionHead } from "@/components/SectionHead";
import { DataStatusBadge } from "@/components/DataStatusBadge";
import { CountryTable } from "@/components/CountryTable";
import { EventTable } from "@/components/EventTable";
import { TimelineSection } from "@/components/TimelineSection";
import { DownloadButton } from "@/components/DownloadButton";
import { DisclaimerBox } from "@/components/DisclaimerBox";
import { Icon } from "@/components/Icon";
import { getLatestSnapshot } from "@/lib/snapshot";
import { fmtDateTimeUTC } from "@/lib/format";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbLd, datasetLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Hantavirus Statistics Dashboard",
  description:
    "Latest official Hantavirus statistics — confirmed cases, suspected cases, deaths, and active outbreak events. Sources, timestamps and provisional flags shown on every figure.",
  alternates: { canonical: "/dashboard" },
  openGraph: {
    title: "Hantavirus Statistics Dashboard",
    description:
      "Confirmed and suspected cases, deaths and active outbreak events with source attribution.",
    url: "/dashboard",
  },
};

export default async function DashboardPage() {
  const snap = await getLatestSnapshot();
  const t = snap.totals;

  const activeEvents = snap.events.filter((e) => e.status === "active");

  return (
    <main>
      <JsonLd
        data={breadcrumbLd([
          { name: "Home", href: "/" },
          { name: "Dashboard", href: "/dashboard" },
        ])}
      />
      <JsonLd
        data={datasetLd({
          name: "Hantavirus statistics — latest snapshot",
          description:
            "Latest official Hantavirus statistics aggregated from WHO, CDC, ECDC, PAHO and national health ministries. Confirmed and suspected cases tracked separately.",
          path: "/dashboard",
          publisherName: "Hantavirus Dashboard",
          keywords: ["Hantavirus", "outbreak", "public health", "epidemiology"],
          variableMeasured: [
            "confirmed_cases",
            "suspected_cases",
            "deaths",
            "active_events",
          ],
          modifiedIso: snap.as_of,
        })}
      />
      {snap.is_demo ? <WarningBanner variant="strip" /> : null}

      <section className="container" style={{ padding: "36px 0 28px" }}>
        <div className="row between wrap gap-12" style={{ alignItems: "flex-end" }}>
          <div className="col gap-8">
            <span className="eyebrow">Public statistics</span>
            <h1 style={{ fontSize: 36 }}>Hantavirus Statistics Dashboard</h1>
            <div className="row gap-8 wrap" style={{ marginTop: 4 }}>
              <LastUpdatedBadge at={snap.as_of} />
              <span className="badge">
                <Icon name="globe" size={12} />
                {snap.by_country.length} countries
              </span>
              <DataStatusBadge status={snap.data_status} />
            </div>
          </div>
          <div className="row gap-8 wrap">
            <DownloadButton
              href="/api/v1/hantavirus/export/latest.csv"
              label="CSV"
              filename="hantavirus-latest.csv"
              variant="sm"
            />
            <DownloadButton
              href="/api/v1/hantavirus/export/latest.json"
              label="JSON"
              filename="hantavirus-latest.json"
              variant="sm"
            />
          </div>
        </div>
      </section>

      {/* Summary cards */}
      <section className="container" style={{ paddingBottom: 32 }}>
        <div
          className="dashboard-metrics"
          style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}
        >
          <SummaryCard label="Confirmed cases" value={t.confirmed_cases} hint="Lab-confirmed" />
          <SummaryCard label="Suspected cases" value={t.suspected_cases} hint="Awaiting confirmation" />
          <SummaryCard label="Deaths" value={t.deaths} hint="Provisional" />
          <SummaryCard label="Active events" value={t.active_events} hint="Tracked outbreaks" />
          <SummaryCard
            label="Last updated"
            value={fmtDateTimeUTC(snap.as_of).split(" · ")[1] ?? ""}
            hint={fmtDateTimeUTC(snap.as_of).split(" · ")[0] ?? ""}
            emphasis
          />
        </div>
      </section>

      {/* Timeline */}
      <section className="container" style={{ paddingBottom: 32 }}>
        <TimelineSection data={snap.timeline} />
      </section>

      {/* Country ranking + Source/Freshness */}
      <section className="container" style={{ paddingBottom: 32 }}>
        <div
          className="hero-grid"
          style={{ display: "grid", gridTemplateColumns: "1.55fr 1fr", gap: 20 }}
        >
          <div className="col gap-12">
            <SectionHead
              eyebrow="By country"
              title="Country ranking"
              sub="Confirmed and suspected counts shown separately, with source and provisional/finalized status on every row."
            />
            <CountryTable rows={snap.by_country} />
          </div>
          <div className="col gap-20">
            <FreshnessPanel
              lastChecked={snap.last_checked}
              asOf={snap.as_of}
              status={snap.data_status}
            />
            <SourcePanel snap={snap} />
          </div>
        </div>
      </section>

      {/* Active events */}
      <section className="container" style={{ paddingBottom: 32 }}>
        <SectionHead
          eyebrow="Outbreak tracking"
          title="Active outbreak events"
          sub="Events flagged as Active by the publishing source. Monitoring and Contained events appear in the API."
        />
        <EventTable rows={activeEvents.length ? activeEvents : snap.events} />
      </section>

      {/* Downloads + disclaimer */}
      <section className="container" style={{ paddingBottom: 56 }}>
        <div
          className="hero-grid"
          style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 20 }}
        >
          <div className="card col gap-16" style={{ padding: 24 }}>
            <SectionHead eyebrow="Downloads" title="Get the data" />
            <p className="muted" style={{ margin: 0, fontSize: 13.5, lineHeight: 1.55 }}>
              Today&rsquo;s snapshot in two formats. Each file includes per-source provenance and
              last-updated timestamps.
            </p>
            <div className="col gap-8">
              <DownloadRow
                label="Latest snapshot — CSV"
                sub="UTF-8 · RFC 4180"
                ext="csv"
                href="/api/v1/hantavirus/export/latest.csv"
                filename="hantavirus-latest.csv"
              />
              <DownloadRow
                label="Latest snapshot — JSON"
                sub="UTC timestamps"
                ext="json"
                href="/api/v1/hantavirus/export/latest.json"
                filename="hantavirus-latest.json"
              />
              <DownloadRow
                label="Historical archive"
                sub="Coming soon · weekly snapshots"
                ext="zip"
                disabled
              />
            </div>
          </div>
          <DisclaimerBox />
        </div>
      </section>
    </main>
  );
}

function FreshnessPanel({
  lastChecked,
  asOf,
  status,
}: {
  lastChecked: string;
  asOf: string;
  status: "provisional" | "finalized" | "under_review";
}) {
  return (
    <div className="card" style={{ padding: 22 }}>
      <SectionHead eyebrow="Data freshness" title="When this updated" />
      <div className="col" style={{ gap: 12 }}>
        <FreshRow k="Last checked" v={fmtDateTimeUTC(lastChecked)} />
        <FreshRow k="Last updated by source" v={fmtDateTimeUTC(asOf)} />
        <FreshRow k="Refresh cadence" v="Daily (Vercel Hobby cron)" />
        <div
          className="row between"
          style={{ paddingTop: 12, borderTop: "1px solid var(--line)" }}
        >
          <span className="muted" style={{ fontSize: 12.5 }}>Data status</span>
          <DataStatusBadge status={status} />
        </div>
      </div>
    </div>
  );
}

function FreshRow({ k, v }: { k: string; v: string }) {
  return (
    <div className="row between">
      <span className="muted" style={{ fontSize: 12.5 }}>{k}</span>
      <span className="mono" style={{ fontSize: 12, color: "var(--ink)" }}>{v}</span>
    </div>
  );
}

function SourcePanel({ snap }: { snap: Awaited<ReturnType<typeof getLatestSnapshot>> }) {
  return (
    <div className="card" style={{ padding: 22 }}>
      <SectionHead eyebrow="Source transparency" title="Where this data comes from" />
      <div className="col" style={{ gap: 12 }}>
        {snap.sources_used.map((s) => (
          <div
            key={s.code}
            className="row between"
            style={{ paddingBottom: 12, borderBottom: "1px solid var(--line)" }}
          >
            <div className="col gap-4">
              <div className="row gap-8">
                <span style={{ fontWeight: 540, fontSize: 13 }}>{s.code}</span>
                <span className="badge" style={{ height: 18, padding: "0 6px", fontSize: 10.5 }}>
                  {s.tier}
                </span>
              </div>
              <span className="muted" style={{ fontSize: 11.5 }}>{s.name}</span>
            </div>
            <div className="col" style={{ alignItems: "flex-end", gap: 4 }}>
              <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>
                {fmtDateTimeUTC(s.last_updated).split(" · ")[0]}
              </span>
              <span
                className="badge"
                style={{
                  height: 18,
                  padding: "0 6px",
                  fontSize: 10.5,
                  color: s.status === "ok" ? "oklch(0.42 0.06 155)" : "var(--warn-ink)",
                  borderColor:
                    s.status === "ok"
                      ? "oklch(0.55 0.08 155 / 0.3)"
                      : "oklch(0.65 0.13 70 / 0.3)",
                }}
              >
                <span className="dot" />
                {s.status === "ok" ? "Connected" : s.status === "delay" ? "Delayed" : "Error"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DownloadRow({
  label,
  sub,
  ext,
  href,
  filename,
  disabled,
}: {
  label: string;
  sub: string;
  ext: string;
  href?: string;
  filename?: string;
  disabled?: boolean;
}) {
  return (
    <div
      className="row between"
      style={{
        padding: "12px 14px",
        border: "1px solid var(--line)",
        borderRadius: 8,
        background: disabled ? "var(--bg-sunken)" : "var(--bg-elev)",
        opacity: disabled ? 0.6 : 1,
        gap: 12,
        flexWrap: "wrap",
      }}
    >
      <div className="row gap-12">
        <span
          className="mono"
          style={{
            fontSize: 11,
            padding: "3px 7px",
            border: "1px solid var(--line-strong)",
            borderRadius: 4,
            color: "var(--ink-2)",
            textTransform: "uppercase",
          }}
        >
          {ext}
        </span>
        <div className="col">
          <span style={{ fontWeight: 500, fontSize: 13.5 }}>{label}</span>
          <span className="muted" style={{ fontSize: 11.5 }}>{sub}</span>
        </div>
      </div>
      {disabled ? (
        <DownloadButton href="#" label="Download" disabled variant="sm" />
      ) : (
        <DownloadButton href={href!} filename={filename} label="Download" variant="sm" />
      )}
    </div>
  );
}
