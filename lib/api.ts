import type { Snapshot } from "./types";

export function jsonResponse(body: unknown, init?: ResponseInit): Response {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      ...(init?.headers ?? {}),
    },
  });
}

export function metaFor(snap: Snapshot) {
  return {
    license: "CC-BY-4.0",
    demo: snap.is_demo,
    snapshot_id: snap.id,
    sources: snap.sources_used.map((s) => s.code),
    last_checked: snap.last_checked,
    as_of: snap.as_of,
    data_status: snap.data_status,
    notice:
      "Hantavirus data is reported through national and regional public-health systems. Some numbers are provisional, delayed, or revised.",
  };
}

const CSV_FIELDS = [
  "country",
  "country_code",
  "confirmed_cases",
  "suspected_cases",
  "deaths",
  "active_events",
  "source_name",
  "source_url",
  "source_type",
  "confidence",
  "data_status",
  "report_date",
  "last_checked",
  "last_updated",
] as const;

export function snapshotToCsv(snap: Snapshot): string {
  const header = CSV_FIELDS.join(",");
  const rows = snap.by_country.map((r) =>
    CSV_FIELDS.map((f) => csvCell((r as unknown as Record<string, unknown>)[f])).join(","),
  );
  return [header, ...rows].join("\r\n") + "\r\n";
}

function csvCell(v: unknown): string {
  if (v === null || v === undefined) return "";
  const s = String(v);
  if (/[",\r\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}
