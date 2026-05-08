import type { DataStatus, EventStatus } from "@/lib/types";

const map: Record<string, { label: string; cls: string }> = {
  provisional: { label: "Provisional", cls: "badge-provisional" },
  finalized: { label: "Finalized", cls: "badge-finalized" },
  under_review: { label: "Under review", cls: "badge-review" },
  active: { label: "Active", cls: "badge-active" },
  monitoring: { label: "Monitoring", cls: "badge-monitoring" },
  contained: { label: "Contained", cls: "badge-contained" },
};

export function DataStatusBadge({ status }: { status: DataStatus | EventStatus }) {
  const m = map[status] ?? { label: status, cls: "" };
  return (
    <span className={`badge ${m.cls}`}>
      <span className="dot" />
      {m.label}
    </span>
  );
}
