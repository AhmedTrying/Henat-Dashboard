import { fmtDateTimeUTC } from "@/lib/format";

export function LastUpdatedBadge({
  at,
  prefix = "Updated",
}: {
  at: string;
  prefix?: string;
}) {
  return (
    <span
      className="badge"
      style={{ background: "transparent", borderColor: "var(--line)" }}
      title={at}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: "var(--ok)",
          boxShadow: "0 0 0 3px oklch(0.55 0.08 155 / 0.18)",
        }}
      />
      <span
        className="muted"
        style={{ fontSize: 11.5, fontFamily: "JetBrains Mono, monospace", letterSpacing: 0 }}
      >
        {prefix} · {fmtDateTimeUTC(at)}
      </span>
    </span>
  );
}
