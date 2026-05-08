import type { ReactNode } from "react";

export function SectionHead({
  eyebrow,
  title,
  sub,
  action,
}: {
  eyebrow?: string;
  title: string;
  sub?: string;
  action?: ReactNode;
}) {
  return (
    <div className="row between wrap" style={{ marginBottom: 18, alignItems: "flex-start", gap: 12 }}>
      <div className="col gap-6">
        {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
        <h2>{title}</h2>
        {sub ? (
          <p className="muted" style={{ margin: 0, fontSize: 13.5, maxWidth: 640, lineHeight: 1.55 }}>
            {sub}
          </p>
        ) : null}
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}
