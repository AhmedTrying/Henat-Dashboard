import { fmtDate, fmtInt } from "@/lib/format";
import type { CountryRecord } from "@/lib/types";
import { DataStatusBadge } from "./DataStatusBadge";
import { SourceBadge } from "./SourceBadge";

export function CountryTable({ rows }: { rows: CountryRecord[] }) {
  const sorted = [...rows].sort((a, b) => b.confirmed_cases - a.confirmed_cases);

  return (
    <div className="card scroll-x">
      <table className="tbl" style={{ minWidth: 720 }}>
        <thead>
          <tr>
            <th>Country</th>
            <th style={{ textAlign: "right" }}>Confirmed</th>
            <th style={{ textAlign: "right" }}>Suspected</th>
            <th style={{ textAlign: "right" }}>Deaths</th>
            <th>Last report</th>
            <th>Source</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((r) => (
            <tr key={r.country_code}>
              <td>
                <div className="row gap-8">
                  <span
                    className="mono"
                    style={{
                      fontSize: 11,
                      padding: "2px 6px",
                      border: "1px solid var(--line)",
                      borderRadius: 4,
                      color: "var(--ink-3)",
                    }}
                  >
                    {r.country_code}
                  </span>
                  <span style={{ fontWeight: 500 }}>{r.country}</span>
                </div>
              </td>
              <td className="num">{fmtInt(r.confirmed_cases)}</td>
              <td className="num">{fmtInt(r.suspected_cases)}</td>
              <td className="num">{fmtInt(r.deaths)}</td>
              <td className="muted" style={{ fontSize: 13 }}>
                {fmtDate(r.report_date)}
              </td>
              <td>
                <SourceBadge name={r.source_name} href={r.source_url} />
              </td>
              <td>
                <DataStatusBadge status={r.data_status} />
              </td>
            </tr>
          ))}
          {sorted.length === 0 ? (
            <tr>
              <td colSpan={7} style={{ textAlign: "center", color: "var(--ink-3)", padding: 24 }}>
                No country data available.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
