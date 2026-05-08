import { fmtDate, fmtInt } from "@/lib/format";
import type { EventRecord } from "@/lib/types";
import { DataStatusBadge } from "./DataStatusBadge";
import { SourceBadge } from "./SourceBadge";

export function EventTable({ rows }: { rows: EventRecord[] }) {
  return (
    <div className="card scroll-x">
      <table className="tbl" style={{ minWidth: 760 }}>
        <thead>
          <tr>
            <th>Event</th>
            <th>Location</th>
            <th style={{ textAlign: "right" }}>Confirmed</th>
            <th style={{ textAlign: "right" }}>Suspected</th>
            <th style={{ textAlign: "right" }}>Deaths</th>
            <th>Status</th>
            <th>Source</th>
            <th>Last report</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((e) => (
            <tr key={e.id}>
              <td style={{ fontWeight: 500 }}>{e.name}</td>
              <td className="muted" style={{ fontSize: 13 }}>{e.location}</td>
              <td className="num">{fmtInt(e.confirmed_cases)}</td>
              <td className="num">{fmtInt(e.suspected_cases)}</td>
              <td className="num">{fmtInt(e.deaths)}</td>
              <td><DataStatusBadge status={e.status} /></td>
              <td><SourceBadge name={e.source_name} href={e.source_url} /></td>
              <td className="muted" style={{ fontSize: 13 }}>{fmtDate(e.report_date)}</td>
            </tr>
          ))}
          {rows.length === 0 ? (
            <tr>
              <td colSpan={8} style={{ textAlign: "center", color: "var(--ink-3)", padding: 24 }}>
                No active outbreak events.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
