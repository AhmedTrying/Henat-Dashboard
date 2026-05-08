import type { JSX } from "react";

export type IconName =
  | "arrow"
  | "download"
  | "info"
  | "warn"
  | "check"
  | "ext"
  | "code"
  | "chart"
  | "table"
  | "menu"
  | "close"
  | "refresh"
  | "pulse"
  | "globe"
  | "shield";

export function Icon({ name, size = 16 }: { name: IconName; size?: number }) {
  const p = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  const map: Record<IconName, JSX.Element> = {
    arrow: <svg {...p}><path d="M5 12h14M13 6l6 6-6 6" /></svg>,
    download: <svg {...p}><path d="M12 4v12m0 0 4-4m-4 4-4-4M5 20h14" /></svg>,
    info: <svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></svg>,
    warn: <svg {...p}><path d="M10.3 3.86 2 18a2 2 0 0 0 1.71 3h16.58A2 2 0 0 0 22 18L13.71 3.86a2 2 0 0 0-3.42 0Z" /><path d="M12 9v4M12 17h.01" /></svg>,
    check: <svg {...p}><path d="M20 6 9 17l-5-5" /></svg>,
    ext: <svg {...p}><path d="M14 4h6v6M20 4l-9 9M19 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5" /></svg>,
    code: <svg {...p}><path d="m8 9-4 3 4 3M16 9l4 3-4 3M14 5l-4 14" /></svg>,
    chart: <svg {...p}><path d="M3 3v18h18" /><path d="m7 15 4-4 3 3 5-6" /></svg>,
    table: <svg {...p}><rect x="3" y="4" width="18" height="16" rx="1.5" /><path d="M3 10h18M9 4v16" /></svg>,
    menu: <svg {...p}><path d="M4 7h16M4 12h16M4 17h16" /></svg>,
    close: <svg {...p}><path d="M6 6l12 12M6 18 18 6" /></svg>,
    refresh: <svg {...p}><path d="M3 12a9 9 0 0 1 15.5-6.3L21 8M21 4v4h-4M21 12a9 9 0 0 1-15.5 6.3L3 16M3 20v-4h4" /></svg>,
    pulse: <svg {...p}><path d="M3 12h4l2-7 4 14 2-7h6" /></svg>,
    globe: <svg {...p}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></svg>,
    shield: <svg {...p}><path d="M12 3 4 6v6c0 5 3.5 8.5 8 9 4.5-.5 8-4 8-9V6l-8-3Z" /></svg>,
  };

  return map[name] ?? null;
}
