import { DEMO_SNAPSHOT } from "./demo-data";
import { getSql, toIso } from "./db";
import type { Snapshot } from "./types";

interface SnapshotRow {
  id: string;
  as_of: string | Date;
  data_status: Snapshot["data_status"];
  totals: Snapshot["totals"];
  by_country: Snapshot["by_country"];
  events: Snapshot["events"];
  sources_used: Snapshot["sources_used"];
  timeline: Snapshot["timeline"];
  last_checked: string | Date;
  notes: string | null;
}

export async function getLatestSnapshot(): Promise<Snapshot> {
  const sql = getSql();
  if (!sql) return DEMO_SNAPSHOT;

  try {
    const rows = (await sql`
      SELECT id, as_of, data_status, totals, by_country, events,
             sources_used, timeline, last_checked, notes
      FROM snapshots
      ORDER BY as_of DESC
      LIMIT 1
    `) as SnapshotRow[];

    const r = rows[0];
    if (!r) return DEMO_SNAPSHOT;

    const notes = r.notes ?? undefined;
    const isDemo = isDemoSnapshot(notes);

    return {
      id: r.id,
      as_of: toIso(r.as_of),
      data_status: r.data_status,
      totals: r.totals,
      by_country: r.by_country ?? [],
      events: r.events ?? [],
      sources_used: r.sources_used ?? [],
      timeline: r.timeline ?? [],
      last_checked: toIso(r.last_checked),
      is_demo: isDemo,
      notes,
    };
  } catch {
    return DEMO_SNAPSHOT;
  }
}

function isDemoSnapshot(notes?: string): boolean {
  if (!notes) return false;
  const text = notes.toLowerCase();
  return text.includes("demo");
}
