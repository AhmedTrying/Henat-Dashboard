import { Icon } from "./Icon";

export function WarningBanner({
  variant = "strip",
  message = "Demo data — connect official sources before public launch.",
}: {
  variant?: "strip" | "card";
  message?: string;
}) {
  if (variant === "card") {
    return (
      <div className="warn-banner" role="status">
        <Icon name="warn" size={16} />
        <span>{message}</span>
      </div>
    );
  }
  return (
    <div className="warn-banner-strip" role="status">
      <div className="container row gap-8" style={{ justifyContent: "center", flexWrap: "wrap" }}>
        <Icon name="warn" size={14} />
        <strong style={{ fontWeight: 600 }}>Demo data</strong>
        <span aria-hidden style={{ opacity: 0.6 }}>·</span>
        <span>connect official sources before public launch.</span>
      </div>
    </div>
  );
}
