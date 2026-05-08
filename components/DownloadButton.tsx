import { Icon } from "./Icon";

export function DownloadButton({
  href,
  label = "Download",
  filename,
  variant = "default",
  disabled,
}: {
  href: string;
  label?: string;
  filename?: string;
  variant?: "default" | "primary" | "sm";
  disabled?: boolean;
}) {
  const cls =
    variant === "primary"
      ? "btn btn-primary"
      : variant === "sm"
      ? "btn btn-sm"
      : "btn";
  if (disabled) {
    return (
      <button className={cls} disabled>
        <Icon name="download" size={13} /> {label}
      </button>
    );
  }
  return (
    <a className={cls} href={href} download={filename ?? true}>
      <Icon name="download" size={13} /> {label}
    </a>
  );
}
