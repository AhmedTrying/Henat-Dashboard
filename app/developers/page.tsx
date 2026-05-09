import type { Metadata } from "next";
import { WarningBanner } from "@/components/WarningBanner";
import { SectionHead } from "@/components/SectionHead";
import { ApiEndpointCard } from "@/components/ApiEndpointCard";
import { CodeBlock } from "@/components/CodeBlock";
import { CodeTabs } from "@/components/CodeTabs";
import { DownloadButton } from "@/components/DownloadButton";
import { Icon } from "@/components/Icon";
import { fmtDateTimeUTC } from "@/lib/format";
import { getLatestSnapshot } from "@/lib/snapshot";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Developer API",
  description:
    "Access Hantavirus statistics through JSON, CSV, and future widgets. Public read-only API with source attribution and provenance.",
  alternates: { canonical: "/developers" },
  openGraph: {
    title: "Hantavirus Developer API",
    description:
      "Access Hantavirus statistics through JSON, CSV, and future widgets.",
    url: "/developers",
  },
};

const ENDPOINTS = [
  { method: "GET" as const, path: "/api/v1/hantavirus/summary",                 description: "Latest global counts and last-updated timestamp." },
  { method: "GET" as const, path: "/api/v1/hantavirus/events",                  description: "All active and recent outbreak events." },
  { method: "GET" as const, path: "/api/v1/hantavirus/countries",               description: "Per-country totals with source and reporting status." },
  { method: "GET" as const, path: "/api/v1/hantavirus/countries/{country_code}", description: "Single-country detail by ISO 3166-1 alpha-2 code." },
  { method: "GET" as const, path: "/api/v1/hantavirus/export/latest.csv",       description: "Latest dataset as CSV (UTF-8, RFC 4180)." },
  { method: "GET" as const, path: "/api/v1/hantavirus/export/latest.json",      description: "Latest dataset as JSON with UTC timestamps." },
];

const CHANGELOG = [
  { date: "2026-05-07", note: "Demo dataset refreshed; added Indonesia entry." },
  { date: "2026-05-01", note: "v1: countries/{code} endpoint published." },
  { date: "2026-04-22", note: "v1: summary, events, countries endpoints published." },
];

export default async function DevelopersPage() {
  const snap = await getLatestSnapshot();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const exampleUrl = `${baseUrl}/api/v1/hantavirus/summary`;

  const exampleJson = JSON.stringify(
    {
      data: {
        as_of: snap.as_of,
        data_status: snap.data_status,
        totals: snap.totals,
        last_checked: snap.last_checked,
      },
      meta: {
        license: "CC-BY-4.0",
        demo: snap.is_demo,
        sources: snap.sources_used.map((s) => s.code),
      },
    },
    null,
    2,
  );

  const codeSamples = [
    {
      id: "curl",
      label: "curl",
      lang: "curl" as const,
      code: `curl -s ${exampleUrl} \\\n  -H "Accept: application/json"`,
    },
    {
      id: "js",
      label: "JavaScript",
      lang: "js" as const,
      code: `const res = await fetch(\n  "${exampleUrl}",\n  { headers: { Accept: "application/json" } }\n);\nconst { data } = await res.json();\nconsole.log(data.totals.confirmed_cases);`,
    },
    {
      id: "py",
      label: "Python",
      lang: "py" as const,
      code: `import requests\n\nr = requests.get(\n    "${exampleUrl}",\n    headers={"Accept": "application/json"},\n    timeout=10,\n)\ndata = r.json()["data"]\nprint(data["totals"]["confirmed_cases"])`,
    },
  ];

  return (
    <main>
      <JsonLd
        data={breadcrumbLd([
          { name: "Home", href: "/" },
          { name: "Developers", href: "/developers" },
        ])}
      />
      {snap.is_demo ? <WarningBanner variant="strip" /> : null}

      {/* Hero */}
      <section className="container" style={{ padding: "60px 0 36px" }}>
        <div
          className="hero-grid"
          style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 56, alignItems: "start" }}
        >
          <div className="col gap-16">
            <span className="eyebrow">API · v1 · Public preview</span>
            <h1>Developer API.</h1>
            <p style={{ fontSize: 17, lineHeight: 1.55, color: "var(--ink-2)", maxWidth: 540, margin: 0 }}>
              Access Hantavirus statistics through JSON, CSV, and future widgets. No authentication for
              read-only endpoints; rate limited to 60 req/min per IP at the edge.
            </p>
            <div className="warn-banner" style={{ maxWidth: 580 }}>
              <Icon name={snap.is_demo ? "warn" : "check"} size={16} />
              <div>
                {snap.is_demo ? (
                  <>
                    <strong style={{ fontWeight: 600 }}>Demo API</strong> — responses currently use demo data.
                    Real official-data integration will be added later.
                  </>
                ) : (
                  <>
                    <strong style={{ fontWeight: 600 }}>Live mode</strong> — responses are generated from the
                    latest official-source ingestion snapshot.
                  </>
                )}
              </div>
            </div>
            <div className="row gap-12 wrap">
              <a href="#endpoints" className="btn btn-primary">
                Get started <Icon name="arrow" size={14} />
              </a>
              <a href="#examples" className="btn">
                <Icon name="code" size={13} /> Code examples
              </a>
            </div>
          </div>

          {/* Base URL card */}
          <div className="card" style={{ padding: 22 }}>
            <div className="row between" style={{ marginBottom: 14 }}>
              <span className="eyebrow">Base URL</span>
              <span className="badge badge-finalized">
                <span className="dot" />
                Operational
              </span>
            </div>
            <div
              className="row between"
              style={{
                padding: "12px 14px",
                background: "var(--bg-sunken)",
                border: "1px solid var(--line)",
                borderRadius: 8,
                gap: 8,
              }}
            >
              <code className="mono" style={{ fontSize: 13.5, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis" }}>
                {baseUrl}/api/v1
              </code>
            </div>
            <KvRow k="Auth" v="None (read-only)" />
            <KvRow k="Rate limit" v="60 req / min / IP" />
            <KvRow k="License" v="CC-BY-4.0" />
            <KvRow k="Last refresh" v={fmtDateTimeUTC(snap.last_checked)} />
          </div>
        </div>
      </section>

      {/* Endpoints */}
      <section id="endpoints" className="container" style={{ paddingBottom: 40 }}>
        <SectionHead eyebrow="Endpoints" title="Available routes" />
        <div
          className="grid-2 stack-mobile"
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
        >
          {ENDPOINTS.map((e) => (
            <ApiEndpointCard key={e.path} method={e.method} path={e.path} description={e.description} />
          ))}
        </div>
      </section>

      {/* Example response + tabs */}
      <section id="examples" className="container" style={{ paddingBottom: 40 }}>
        <div
          className="hero-grid"
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}
        >
          <div className="col gap-12">
            <SectionHead eyebrow="GET /summary" title="Example JSON response" />
            <CodeBlock code={exampleJson} lang="json" />
          </div>
          <div className="col gap-12">
            <SectionHead eyebrow="Quickstart" title="Code examples" />
            <CodeTabs tabs={codeSamples} />
          </div>
        </div>
      </section>

      {/* Exports */}
      <section className="container" style={{ paddingBottom: 40 }}>
        <SectionHead eyebrow="Bulk exports" title="Download the dataset" />
        <div
          className="grid-3 stack-mobile"
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}
        >
          <ExportCard
            ext="csv"
            title="Latest CSV"
            sub="UTF-8 · RFC 4180"
            href="/api/v1/hantavirus/export/latest.csv"
            filename="hantavirus-latest.csv"
          />
          <ExportCard
            ext="json"
            title="Latest JSON"
            sub="UTC timestamps"
            href="/api/v1/hantavirus/export/latest.json"
            filename="hantavirus-latest.json"
          />
          <ExportCard
            ext="zip"
            title="Historical archive"
            sub="Weekly snapshots · coming soon"
            disabled
          />
        </div>
      </section>

      {/* Status + changelog */}
      <section className="container" style={{ paddingBottom: 56 }}>
        <div
          className="hero-grid"
          style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: 20 }}
        >
          <div className="card" style={{ padding: 22 }}>
            <SectionHead eyebrow="Status" title="API status" />
            <div className="col gap-12">
              <StatusRow label="Production" tone="ok" sub="All endpoints responding" />
              <StatusRow label="Data freshness" tone="ok" sub={`Updated ${fmtDateTimeUTC(snap.last_checked)}`} />
              <StatusRow label="Rate limit" tone="ok" sub="60 req/min per IP" />
            </div>
          </div>
          <div className="card" style={{ padding: 22 }}>
            <SectionHead eyebrow="Changelog" title="Recent updates" />
            <div className="col" style={{ gap: 0 }}>
              {CHANGELOG.map((c, i) => (
                <div
                  key={c.date}
                  className="row gap-16"
                  style={{
                    padding: "12px 0",
                    borderBottom: i === CHANGELOG.length - 1 ? "none" : "1px solid var(--line)",
                    alignItems: "flex-start",
                  }}
                >
                  <span className="mono" style={{ fontSize: 11.5, color: "var(--ink-3)", minWidth: 90 }}>
                    {c.date}
                  </span>
                  <span style={{ fontSize: 13.5 }}>{c.note}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function KvRow({ k, v }: { k: string; v: string }) {
  return (
    <div className="row between" style={{ marginTop: 12, fontSize: 12.5 }}>
      <span className="muted">{k}</span>
      <span className="mono" style={{ fontSize: 12 }}>{v}</span>
    </div>
  );
}

function ExportCard({
  ext,
  title,
  sub,
  href,
  filename,
  disabled,
}: {
  ext: string;
  title: string;
  sub: string;
  href?: string;
  filename?: string;
  disabled?: boolean;
}) {
  return (
    <div className="card" style={{ padding: 18, opacity: disabled ? 0.6 : 1 }}>
      <div className="row between" style={{ marginBottom: 10 }}>
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
        {disabled ? (
          <span className="badge"><span className="dot" />Coming soon</span>
        ) : (
          <span className="badge badge-finalized">
            <span className="dot" />
            Ready
          </span>
        )}
      </div>
      <div style={{ fontWeight: 540, fontSize: 14 }}>{title}</div>
      <div className="muted" style={{ fontSize: 12.5, marginTop: 4 }}>{sub}</div>
      <div style={{ marginTop: 14 }}>
        {disabled ? (
          <DownloadButton href="#" label="Download" disabled />
        ) : (
          <DownloadButton href={href!} filename={filename} label="Download" />
        )}
      </div>
    </div>
  );
}

function StatusRow({ label, tone, sub }: { label: string; tone: "ok" | "warn"; sub: string }) {
  const color = tone === "ok" ? "oklch(0.55 0.08 155)" : "var(--warn-ink)";
  return (
    <div
      className="row between"
      style={{ paddingBottom: 12, borderBottom: "1px solid var(--line)", gap: 8 }}
    >
      <div className="col gap-4">
        <span style={{ fontWeight: 500, fontSize: 13.5 }}>{label}</span>
        <span className="muted" style={{ fontSize: 12 }}>{sub}</span>
      </div>
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: color,
          boxShadow:
            tone === "ok"
              ? "0 0 0 4px oklch(0.55 0.08 155 / 0.18)"
              : "0 0 0 4px oklch(0.65 0.13 70 / 0.18)",
        }}
      />
    </div>
  );
}
