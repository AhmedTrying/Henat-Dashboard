/* global React, HD */
const { useState } = React;
const { Icon, SectionHead, DemoBanner } = HD;

const EXAMPLE_JSON = `{
  "data": {
    "as_of": "2026-05-07T14:00:00Z",
    "status": "provisional",
    "totals": {
      "confirmed": 229,
      "suspected": 47,
      "deaths": 59,
      "active_events": 3
    },
    "by_country": [
      {
        "country_code": "AR",
        "country": "Argentina",
        "confirmed": 78,
        "suspected": 14,
        "deaths": 21,
        "last_report": "2026-05-06",
        "source": "Ministerio de Salud, Argentina"
      }
    ]
  },
  "meta": {
    "license": "CC-BY-4.0",
    "demo": true,
    "sources": ["WHO", "CDC", "ECDC", "PAHO"]
  }
}`;

const SAMPLES = {
  curl: `curl -s https://api.hantavirus.example/v1/hantavirus/summary \\
  -H "Accept: application/json"`,
  js: `const res = await fetch(
  "https://api.hantavirus.example/v1/hantavirus/summary",
  { headers: { Accept: "application/json" } }
);
const { data } = await res.json();
console.log(data.totals.confirmed);`,
  py: `import requests

r = requests.get(
    "https://api.hantavirus.example/v1/hantavirus/summary",
    headers={"Accept": "application/json"},
    timeout=10,
)
data = r.json()["data"]
print(data["totals"]["confirmed"])`,
};

function Developers() {
  const [tab, setTab] = useState("curl");
  const [copied, setCopied] = useState(false);
  const copy = (s) => {
    navigator.clipboard?.writeText(s);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  return (
    <main>
      <DemoBanner variant="strip"/>
      {/* Hero */}
      <section className="container" style={{ padding: "60px 0 40px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 56, alignItems: "start" }} className="hero-grid">
          <div className="col gap-16">
            <span className="eyebrow">API · v1 · Public preview</span>
            <h1>Developer API.</h1>
            <p style={{ fontSize: 17, lineHeight: 1.55, color: "var(--ink-2)", maxWidth: 540, margin: 0 }}>
              Access Hantavirus statistics through JSON, CSV, and future widgets. No authentication for read-only endpoints; rate limited to 60 req/min per IP.
            </p>
            <div className="warn-banner" style={{ maxWidth: 580 }}>
              <Icon name="warn" size={16}/>
              <div><strong style={{ fontWeight: 600 }}>Demo API</strong> — responses currently use demo data. Real official-data integration will be added later.</div>
            </div>
            <div className="row gap-12">
              <button className="btn btn-primary">Get started <Icon name="arrow" size={14}/></button>
              <button className="btn"><Icon name="ext" size={13}/> OpenAPI spec</button>
            </div>
          </div>
          <BaseUrlCard onCopy={copy} copied={copied}/>
        </div>
      </section>

      {/* Endpoints */}
      <section className="container" style={{ paddingBottom: 40 }}>
        <SectionHead eyebrow="Endpoints" title="Available routes"/>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }} className="grid-2">
          {HD.ENDPOINTS.map(e => <EndpointCard key={e.path} ep={e}/>)}
        </div>
      </section>

      {/* Example response + tabs */}
      <section className="container" style={{ paddingBottom: 40 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }} className="hero-grid">
          <div className="col gap-12">
            <SectionHead eyebrow="GET /summary" title="Example JSON response"/>
            <CodeBlock code={EXAMPLE_JSON} lang="json" onCopy={() => copy(EXAMPLE_JSON)}/>
          </div>
          <div className="col gap-12">
            <SectionHead eyebrow="Quickstart" title="Code examples"
              action={
                <div className="row gap-4" style={{ background: "var(--bg-sunken)", padding: 3, borderRadius: 8, border: "1px solid var(--line)" }}>
                  {["curl","js","py"].map(t => (
                    <button key={t} onClick={() => setTab(t)} className="btn btn-sm" style={{ background: tab === t ? "var(--bg-elev)" : "transparent", borderColor: tab === t ? "var(--line)" : "transparent" }}>
                      {t === "curl" ? "curl" : t === "js" ? "JavaScript" : "Python"}
                    </button>
                  ))}
                </div>
              }
            />
            <CodeBlock code={SAMPLES[tab]} lang={tab} onCopy={() => copy(SAMPLES[tab])}/>
          </div>
        </div>
      </section>

      {/* Exports */}
      <section className="container" style={{ paddingBottom: 40 }}>
        <SectionHead eyebrow="Bulk exports" title="Download the dataset"/>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }} className="grid-3">
          <ExportCard ext="csv" title="Latest CSV" sub="UTF-8 · RFC 4180 · 18 KB"/>
          <ExportCard ext="json" title="Latest JSON" sub="UTC timestamps · 24 KB"/>
          <ExportCard ext="zip" title="Historical archive" sub="Weekly snapshots · coming soon" disabled/>
        </div>
      </section>

      {/* Status + changelog */}
      <section className="container" style={{ paddingBottom: 56 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: 20 }} className="hero-grid">
          <div className="card" style={{ padding: 22 }}>
            <SectionHead eyebrow="Status" title="API status"/>
            <div className="col gap-12">
              <StatusRow label="Production" tone="ok" sub="All endpoints responding · p50 142ms"/>
              <StatusRow label="Data freshness" tone="ok" sub={`Updated ${HD.DEMO_LAST_CHECKED}`}/>
              <StatusRow label="Rate limit" tone="ok" sub="60 req/min per IP"/>
            </div>
          </div>
          <div className="card" style={{ padding: 22 }}>
            <SectionHead eyebrow="Changelog" title="Recent updates"/>
            <div className="col" style={{ gap: 0 }}>
              {HD.CHANGELOG.map((c, i) => (
                <div key={i} className="row gap-16" style={{ padding: "12px 0", borderBottom: i === HD.CHANGELOG.length - 1 ? "none" : "1px solid var(--line)", alignItems: "flex-start" }}>
                  <span className="mono" style={{ fontSize: 11.5, color: "var(--ink-3)", minWidth: 90 }}>{c.date}</span>
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

function BaseUrlCard({ onCopy, copied }) {
  const url = "https://api.hantavirus.example/v1";
  return (
    <div className="card" style={{ padding: 22 }}>
      <div className="row between" style={{ marginBottom: 14 }}>
        <span className="eyebrow">Base URL</span>
        <span className="badge badge-finalized"><span className="dot"/>Operational</span>
      </div>
      <div className="row between" style={{ padding: "12px 14px", background: "var(--bg-sunken)", border: "1px solid var(--line)", borderRadius: 8 }}>
        <code className="mono" style={{ fontSize: 13.5, color: "var(--ink)" }}>{url}</code>
        <button className="btn btn-sm" onClick={() => onCopy(url)}>{copied ? <><Icon name="check" size={12}/>Copied</> : "Copy"}</button>
      </div>
      <div className="row between" style={{ marginTop: 14, fontSize: 12.5 }}>
        <span className="muted">Auth</span>
        <span className="mono">None (read-only)</span>
      </div>
      <div className="row between" style={{ marginTop: 8, fontSize: 12.5 }}>
        <span className="muted">Rate limit</span>
        <span className="mono">60 req / min / IP</span>
      </div>
      <div className="row between" style={{ marginTop: 8, fontSize: 12.5 }}>
        <span className="muted">License</span>
        <span className="mono">CC-BY-4.0</span>
      </div>
    </div>
  );
}

function EndpointCard({ ep }) {
  return (
    <div className="card" style={{ padding: 16 }}>
      <div className="row gap-8" style={{ marginBottom: 8 }}>
        <span className="mono" style={{ fontSize: 10.5, padding: "2px 6px", borderRadius: 4, background: "oklch(0.50 0.075 215 / 0.12)", color: "var(--accent-ink)", fontWeight: 600, letterSpacing: 0.04 }}>{ep.method}</span>
        <code className="mono" style={{ fontSize: 13, color: "var(--ink)" }}>{ep.path}</code>
      </div>
      <p className="muted" style={{ margin: 0, fontSize: 13, lineHeight: 1.5 }}>{ep.desc}</p>
    </div>
  );
}

function ExportCard({ ext, title, sub, disabled }) {
  return (
    <div className="card" style={{ padding: 18, opacity: disabled ? 0.6 : 1 }}>
      <div className="row between" style={{ marginBottom: 10 }}>
        <span className="mono" style={{ fontSize: 11, padding: "3px 7px", border: "1px solid var(--line-strong)", borderRadius: 4, color: "var(--ink-2)", textTransform: "uppercase" }}>{ext}</span>
        {disabled ? <HD.StatusBadge status="under-review"/> : <span className="badge badge-finalized"><span className="dot"/>Ready</span>}
      </div>
      <div style={{ fontWeight: 540, fontSize: 14 }}>{title}</div>
      <div className="muted" style={{ fontSize: 12.5, marginTop: 4 }}>{sub}</div>
      <button className="btn btn-sm" style={{ marginTop: 14, width: "100%", justifyContent: "center" }} disabled={disabled}>
        <Icon name="download" size={13}/> Download
      </button>
    </div>
  );
}

function StatusRow({ label, tone, sub }) {
  const color = tone === "ok" ? "oklch(0.55 0.08 155)" : "var(--warn-ink)";
  return (
    <div className="row between" style={{ paddingBottom: 12, borderBottom: "1px solid var(--line)" }}>
      <div className="col gap-4">
        <span style={{ fontWeight: 500, fontSize: 13.5 }}>{label}</span>
        <span className="muted" style={{ fontSize: 12 }}>{sub}</span>
      </div>
      <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, boxShadow: `0 0 0 4px ${tone === "ok" ? "oklch(0.55 0.08 155 / 0.18)" : "oklch(0.65 0.13 70 / 0.18)"}` }}/>
    </div>
  );
}

function CodeBlock({ code, lang, onCopy }) {
  const lines = code.split("\n");
  return (
    <div className="codeblock" style={{ position: "relative" }}>
      <div className="row between" style={{ padding: "8px 12px", borderBottom: "1px solid var(--line)", background: "var(--bg-elev)" }}>
        <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>{lang}</span>
        <button className="btn btn-sm btn-ghost" onClick={onCopy} style={{ height: 24, padding: "0 8px", fontSize: 11.5 }}>Copy</button>
      </div>
      <pre style={{ margin: 0, padding: 14 }}>
        {lines.map((ln, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "28px 1fr", gap: 12 }}>
            <span style={{ color: "var(--ink-4)", textAlign: "right", userSelect: "none" }}>{i + 1}</span>
            <span>{highlight(ln, lang)}</span>
          </div>
        ))}
      </pre>
    </div>
  );
}

function highlight(line, lang) {
  if (lang === "json") {
    const parts = [];
    let rest = line;
    const re = /("[^"]*")(\s*:)?|(\b\d+(?:\.\d+)?\b)|(\btrue\b|\bfalse\b|\bnull\b)/g;
    let last = 0, m, idx = 0;
    while ((m = re.exec(rest)) !== null) {
      if (m.index > last) parts.push(<span key={idx++}>{rest.slice(last, m.index)}</span>);
      if (m[1]) {
        const isKey = !!m[2];
        parts.push(<span key={idx++} className={isKey ? "code-tk-key" : "code-tk-str"}>{m[1]}</span>);
        if (isKey) parts.push(<span key={idx++}>{m[2]}</span>);
      } else if (m[3]) parts.push(<span key={idx++} className="code-tk-num">{m[3]}</span>);
      else if (m[4]) parts.push(<span key={idx++} className="code-tk-num">{m[4]}</span>);
      last = re.lastIndex;
    }
    if (last < rest.length) parts.push(<span key={idx++}>{rest.slice(last)}</span>);
    return parts;
  }
  if (lang === "py") {
    return line.split(/(#[^\n]*$|"[^"]*"|\b(?:import|from|print|requests|get|json)\b)/g).map((part, i) => {
      if (/^#/.test(part)) return <span key={i} className="code-tk-com">{part}</span>;
      if (/^"/.test(part)) return <span key={i} className="code-tk-str">{part}</span>;
      if (/^(import|from)$/.test(part)) return <span key={i} className="code-tk-key">{part}</span>;
      if (/^(print|get|json|requests)$/.test(part)) return <span key={i} className="code-tk-fn">{part}</span>;
      return <span key={i}>{part}</span>;
    });
  }
  if (lang === "js") {
    return line.split(/(\/\/[^\n]*$|"[^"]*"|`[^`]*`|\b(?:const|await|fetch|console|log|async)\b)/g).map((part, i) => {
      if (/^\/\//.test(part)) return <span key={i} className="code-tk-com">{part}</span>;
      if (/^["`]/.test(part)) return <span key={i} className="code-tk-str">{part}</span>;
      if (/^(const|await|async)$/.test(part)) return <span key={i} className="code-tk-key">{part}</span>;
      if (/^(fetch|console|log)$/.test(part)) return <span key={i} className="code-tk-fn">{part}</span>;
      return <span key={i}>{part}</span>;
    });
  }
  // curl
  return line.split(/("[^"]*"|\bcurl\b|\b-[A-Za-z]+\b|https?:\/\/\S+)/g).map((part, i) => {
    if (/^curl$/.test(part)) return <span key={i} className="code-tk-key">{part}</span>;
    if (/^-/.test(part)) return <span key={i} className="code-tk-fn">{part}</span>;
    if (/^"/.test(part)) return <span key={i} className="code-tk-str">{part}</span>;
    if (/^https?:/.test(part)) return <span key={i} className="code-tk-str">{part}</span>;
    return <span key={i}>{part}</span>;
  });
}

window.HD.Developers = Developers;
