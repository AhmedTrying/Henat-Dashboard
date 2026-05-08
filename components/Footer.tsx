import Link from "next/link";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer style={{ borderTop: "1px solid var(--line)", marginTop: 24, paddingTop: 36, paddingBottom: 36 }}>
      <div
        className="container footer-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "1.6fr 1fr 1fr 1fr",
          gap: 32,
        }}
      >
        <div className="col gap-12">
          <div className="row gap-8" style={{ fontWeight: 540 }}>
            <Logo size={18} />
            <span>Hantavirus Dashboard</span>
          </div>
          <p className="muted" style={{ margin: 0, fontSize: 13, lineHeight: 1.55, maxWidth: 360 }}>
            Latest official Hantavirus statistics aggregated from WHO, CDC, ECDC, PAHO and national
            ministries of health. Demo build — not for clinical decisions.
          </p>
        </div>
        <FooterCol title="Product">
          <Link href="/">Home</Link>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/developers">Developers</Link>
        </FooterCol>
        <FooterCol title="Data">
          <Link href="/api/v1/hantavirus/summary">/v1/summary</Link>
          <Link href="/api/v1/hantavirus/countries">/v1/countries</Link>
          <Link href="/api/v1/hantavirus/events">/v1/events</Link>
          <Link href="/api/v1/hantavirus/export/latest.csv">CSV export</Link>
        </FooterCol>
        <FooterCol title="Sources">
          <a href="https://www.who.int" target="_blank" rel="noopener noreferrer">WHO</a>
          <a href="https://www.cdc.gov" target="_blank" rel="noopener noreferrer">CDC</a>
          <a href="https://www.ecdc.europa.eu" target="_blank" rel="noopener noreferrer">ECDC</a>
          <a href="https://www.paho.org" target="_blank" rel="noopener noreferrer">PAHO</a>
        </FooterCol>
      </div>
      <div
        className="container row between wrap"
        style={{ marginTop: 28, paddingTop: 18, borderTop: "1px solid var(--line)", fontSize: 12, color: "var(--ink-3)" }}
      >
        <span>© {new Date().getUTCFullYear()} Hantavirus Dashboard · Demo build</span>
        <span className="mono">Data licensed CC-BY-4.0 where compatible with source terms.</span>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="col gap-8">
      <span className="eyebrow">{title}</span>
      <div className="col gap-6" style={{ fontSize: 13.5 }}>
        {children}
      </div>
    </div>
  );
}
