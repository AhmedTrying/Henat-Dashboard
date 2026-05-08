/* global React, HD */
const { useState, useEffect } = React;
const { Logo, Icon, RouteCtx } = HD;

function Navbar() {
  const { route, go } = React.useContext(RouteCtx);
  const [open, setOpen] = useState(false);
  const link = (id, label) => (
    <a
      key={id}
      onClick={(e) => { e.preventDefault(); go(id); setOpen(false); }}
      href={`#/${id === "home" ? "" : id}`}
      style={{
        padding: "8px 12px",
        borderRadius: 6,
        fontSize: 14,
        color: route === id ? "var(--ink)" : "var(--ink-2)",
        background: route === id ? "var(--bg-sunken)" : "transparent",
        fontWeight: route === id ? 500 : 450,
        cursor: "pointer",
      }}
    >
      {label}
    </a>
  );
  return (
    <header style={{ borderBottom: "1px solid var(--line)", background: "var(--bg)", position: "sticky", top: 0, zIndex: 30, backdropFilter: "saturate(140%) blur(8px)" }}>
      <div className="container row between" style={{ height: 60 }}>
        <a href="#/" onClick={(e) => { e.preventDefault(); go("home"); }} className="row gap-8" style={{ cursor: "pointer" }}>
          <Logo size={20} />
          <span style={{ fontWeight: 540, letterSpacing: "-0.015em", fontSize: 15 }}>Hantavirus Dashboard</span>
          <span className="badge" style={{ height: 19, padding: "0 7px", fontSize: 10.5, marginLeft: 4, color: "var(--warn-ink)", background: "var(--warn-soft)", borderColor: "oklch(0.65 0.13 70 / 0.3)" }}>DEMO</span>
        </a>
        <nav className="row gap-4 hide-mobile">
          {link("home", "Home")}
          {link("dashboard", "Dashboard")}
          {link("developers", "Developers")}
        </nav>
        <div className="row gap-8 hide-mobile">
          <button className="btn btn-sm" onClick={() => go("developers")}>API <Icon name="arrow" size={13}/></button>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={() => setOpen(!open)} style={{ display: "none" }} data-mobile-menu>
          <Icon name={open ? "close" : "menu"} />
        </button>
      </div>
      {open && (
        <div className="container col gap-4" style={{ paddingBottom: 12 }}>
          {link("home", "Home")}
          {link("dashboard", "Dashboard")}
          {link("developers", "Developers")}
        </div>
      )}
      <style>{`@media (max-width: 760px) { [data-mobile-menu] { display: inline-flex !important; } }`}</style>
    </header>
  );
}

function Footer() {
  const { go } = React.useContext(RouteCtx);
  return (
    <footer style={{ borderTop: "1px solid var(--line)", marginTop: 80, padding: "40px 0 56px", background: "var(--bg-sunken)" }}>
      <div className="container">
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 40, alignItems: "start" }} className="footer-grid">
          <div className="col gap-12" style={{ maxWidth: 360 }}>
            <div className="row gap-8"><Logo size={20}/><span style={{ fontWeight: 540 }}>Hantavirus Dashboard</span></div>
            <p className="muted" style={{ margin: 0, fontSize: 13.5, lineHeight: 1.55 }}>
              An independent, open data project aggregating publicly reported Hantavirus statistics. Not affiliated with any health ministry.
            </p>
            <div className="row gap-8 wrap">
              <span className="source-badge">v1.0 · Demo</span>
              <span className="source-badge">MIT License</span>
            </div>
          </div>
          <FootCol title="Product" items={[["Home","home"],["Dashboard","dashboard"],["Developer API","developers"]]} go={go}/>
          <FootCol title="Data" items={[["WHO","ext"],["CDC","ext"],["ECDC","ext"],["PAHO","ext"]]} ext />
          <FootCol title="About" items={[["Methodology","ext"],["Source list","ext"],["Disclaimer","ext"],["Contact","ext"]]} ext />
        </div>
        <div className="divider" style={{ margin: "32px 0 20px" }}/>
        <div className="row between wrap gap-12" style={{ fontSize: 12, color: "var(--ink-3)" }}>
          <span>© 2026 Hantavirus Dashboard · Demo build</span>
          <span className="mono">Data shown is illustrative. Not for clinical or policy use.</span>
        </div>
      </div>
      <style>{`@media (max-width: 760px) { .footer-grid { grid-template-columns: 1fr 1fr !important; gap: 28px !important; } }`}</style>
    </footer>
  );
}

function FootCol({ title, items, ext, go }) {
  return (
    <div className="col gap-8">
      <div className="eyebrow">{title}</div>
      <div className="col gap-6">
        {items.map(([label, id]) => (
          <a key={label}
             href={ext ? "#" : `#/${id === "home" ? "" : id}`}
             onClick={(e) => { e.preventDefault(); if (!ext && go) go(id); }}
             style={{ fontSize: 13.5, color: "var(--ink-2)", cursor: "pointer" }}>
            {label}{ext && <span style={{ marginLeft: 6, opacity: 0.5 }}>↗</span>}
          </a>
        ))}
      </div>
    </div>
  );
}

function DemoBanner({ variant = "default" }) {
  if (variant === "strip") {
    return (
      <div className="warn-banner-strip">
        <div className="container row between wrap gap-12">
          <div className="row gap-8">
            <Icon name="warn" size={14}/>
            <span><strong style={{ fontWeight: 600 }}>Demo data</strong> — connect official sources before public launch.</span>
          </div>
          <span className="mono" style={{ fontSize: 11.5, opacity: 0.85 }}>Last refresh: {HD.DEMO_LAST_CHECKED}</span>
        </div>
      </div>
    );
  }
  return (
    <div className="warn-banner">
      <Icon name="warn" size={16}/>
      <div style={{ flex: 1 }}>
        <strong style={{ fontWeight: 600 }}>Demo data</strong> — connect official sources before public launch. All numbers below are illustrative.
      </div>
      <span className="mono" style={{ fontSize: 11.5, opacity: 0.85 }}>{HD.DEMO_LAST_CHECKED}</span>
    </div>
  );
}

window.HD.Navbar = Navbar;
window.HD.Footer = Footer;
window.HD.DemoBanner = DemoBanner;
