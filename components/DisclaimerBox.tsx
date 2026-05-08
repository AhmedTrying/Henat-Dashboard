import { Icon } from "./Icon";

export const DISCLAIMER_TEXT =
  "Hantavirus data is reported through national and regional public-health systems. Some numbers are provisional, delayed, or revised. This dashboard separates confirmed official data from suspected or media-reported information.";

export function DisclaimerBox() {
  return (
    <aside
      className="card col gap-12"
      style={{ padding: 24 }}
      aria-label="Public-health disclaimer"
    >
      <div className="row gap-8" style={{ color: "var(--ink-2)" }}>
        <Icon name="info" size={16} />
        <span className="eyebrow" style={{ color: "var(--ink-2)" }}>Public-health disclaimer</span>
      </div>
      <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: "var(--ink-2)" }}>
        {DISCLAIMER_TEXT}
      </p>
      <p
        className="muted"
        style={{ margin: 0, fontSize: 12.5, lineHeight: 1.55 }}
      >
        This dashboard is informational only and is not a substitute for clinical advice. For
        suspected exposure or symptoms, contact your local public-health authority.
      </p>
    </aside>
  );
}
