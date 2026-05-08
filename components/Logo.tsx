export function Logo({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2.5" y="2.5" width="19" height="19" rx="3.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M7 15.5 L10.5 9 L13.5 13.5 L17 7.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="17" cy="7.5" r="1.4" fill="currentColor" />
    </svg>
  );
}
