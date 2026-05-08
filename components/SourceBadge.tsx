export function SourceBadge({
  name,
  href,
}: {
  name: string;
  href?: string;
}) {
  if (href) {
    return (
      <a className="source-badge" href={href} target="_blank" rel="noopener noreferrer">
        {name}
      </a>
    );
  }
  return <span className="source-badge">{name}</span>;
}
