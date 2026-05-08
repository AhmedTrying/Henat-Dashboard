export function ApiEndpointCard({
  method,
  path,
  description,
}: {
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  description: string;
}) {
  return (
    <div className="card" style={{ padding: 16 }}>
      <div className="row gap-8" style={{ marginBottom: 8 }}>
        <span
          className="mono"
          style={{
            fontSize: 10.5,
            padding: "2px 6px",
            borderRadius: 4,
            background: "oklch(0.50 0.075 215 / 0.12)",
            color: "var(--accent-ink)",
            fontWeight: 600,
            letterSpacing: 0.04,
          }}
        >
          {method}
        </span>
        <code className="mono" style={{ fontSize: 13, color: "var(--ink)" }}>
          {path}
        </code>
      </div>
      <p className="muted" style={{ margin: 0, fontSize: 13, lineHeight: 1.5 }}>
        {description}
      </p>
    </div>
  );
}
