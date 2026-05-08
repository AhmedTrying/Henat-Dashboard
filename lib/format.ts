export function fmtInt(n: number): string {
  return n.toLocaleString("en-US");
}

export function fmtDate(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

export function fmtDateTimeUTC(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    const month = d.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" });
    const day = d.getUTCDate();
    const year = d.getUTCFullYear();
    const hh = String(d.getUTCHours()).padStart(2, "0");
    const mm = String(d.getUTCMinutes()).padStart(2, "0");
    return `${month} ${day}, ${year} · ${hh}:${mm} UTC`;
  } catch {
    return iso;
  }
}

export function calcCFR(deaths: number, confirmed: number): number {
  if (!confirmed) return 0;
  return Math.round((deaths / confirmed) * 1000) / 10;
}
