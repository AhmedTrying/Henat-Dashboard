"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { Logo } from "./Logo";
import { Icon } from "./Icon";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/developers", label: "Developers" },
] as const;

export function Navbar() {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onResize = () => {
      if (window.innerWidth > 760) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 30,
        background: "color-mix(in oklch, var(--bg) 88%, transparent)",
        backdropFilter: "saturate(140%) blur(8px)",
        borderBottom: "1px solid var(--line)",
      }}
    >
      <div className="container row between" style={{ height: 60 }}>
        <Link
          href="/"
          className="row gap-8"
          style={{ fontWeight: 540, letterSpacing: "-0.01em" }}
          onClick={close}
        >
          <Logo size={20} />
          <span>Hantavirus Dashboard</span>
        </Link>

        <nav className="row gap-4 hide-mobile" aria-label="Primary">
          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="btn btn-sm btn-ghost">
              {l.label}
            </Link>
          ))}
          <Link href="/developers" className="btn btn-sm">
            <Icon name="code" size={13} /> API
          </Link>
        </nav>

        <button
          type="button"
          className="btn btn-sm show-mobile"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((v) => !v)}
        >
          <Icon name={open ? "close" : "menu"} size={16} />
        </button>
      </div>

      <div
        id={panelId}
        className="mobile-menu"
        data-open={open ? "true" : "false"}
        hidden={!open}
      >
        <nav
          className="container col gap-6"
          aria-label="Mobile primary"
          style={{ paddingTop: 12, paddingBottom: 16 }}
        >
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="mobile-menu-link"
              onClick={close}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/developers"
            className="btn btn-sm mobile-menu-cta"
            onClick={close}
          >
            <Icon name="code" size={13} /> API
          </Link>
        </nav>
      </div>
    </header>
  );
}
