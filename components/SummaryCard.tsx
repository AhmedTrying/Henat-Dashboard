import { fmtInt } from "@/lib/format";

export function SummaryCard({
  label,
  value,
  hint,
  emphasis,
}: {
  label: string;
  value: number | string;
  hint?: string;
  emphasis?: boolean;
}) {
  return (
    <div
      className="card col gap-8"
      style={{
        padding: 16,
        background: emphasis ? "var(--accent-soft)" : "var(--bg-elev)",
        borderColor: emphasis ? "oklch(0.50 0.075 215 / 0.25)" : "var(--line)",
      }}
    >
      <div
        className="eyebrow"
        style={{ color: emphasis ? "var(--accent-ink)" : "var(--ink-3)" }}
      >
        {label}
      </div>
      <div
        className="mono"
        style={{
          fontSize: 30,
          fontWeight: 500,
          letterSpacing: "-0.02em",
          fontVariantNumeric: "tabular-nums",
          color: emphasis ? "var(--accent-ink)" : "var(--ink)",
        }}
      >
        {typeof value === "number" ? fmtInt(value) : value}
      </div>
      {hint ? (
        <div
          className="muted"
          style={{ fontSize: 12, color: emphasis ? "var(--accent-ink)" : "var(--ink-3)" }}
        >
          {hint}
        </div>
      ) : null}
    </div>
  );
}
