/**
 * The Nexora mark: three stacked documents.
 *
 * The stack is the product in one image — an answer is never one document, it
 * is several layered and compared. The two behind are held back in opacity so
 * the front one reads as the current version and the others as what it
 * supersedes.
 *
 * Drawn with currentColor so it works on the paper ground and on the violet
 * sidebar without a second asset.
 */
export default function Logo({
  size = 32,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      role="img"
      aria-label="Nexora Guardian"
      className={className}
    >
      {/* Back sheet — the oldest version */}
      <rect x="4" y="16" width="26" height="28" rx="4" fill="currentColor" opacity="0.28" />
      {/* Middle sheet */}
      <rect x="10" y="10" width="26" height="28" rx="4" fill="currentColor" opacity="0.5" />
      {/* Front sheet — current, and the only one that carries content */}
      <rect x="17" y="4" width="27" height="28" rx="4.5" fill="currentColor" />
      <circle cx="37.5" cy="11.5" r="2.6" fill="#FFFFFF" />
      <rect x="22" y="16" width="16" height="2" rx="1" fill="#FFFFFF" />
      <rect x="22" y="21" width="10" height="2" rx="1" fill="#FFFFFF" />
    </svg>
  );
}

/** Logo plus wordmark, for the sidebar head and the landing page. */
export function Wordmark({
  compact = false,
  className = "",
}: {
  compact?: boolean;
  className?: string;
}) {
  return (
    <span className={`flex items-center gap-2.5 ${className}`}>
      <Logo size={compact ? 26 : 30} className="shrink-0" />
      {!compact && (
        <span className="flex min-w-0 flex-col leading-none">
          <span className="font-serif text-[15px] font-bold tracking-[0.02em]">
            NEXORA GUARDIAN
          </span>
          <span className="mt-1 truncate text-[10.5px] opacity-70">
            Enterprise knowledge trust
          </span>
        </span>
      )}
    </span>
  );
}
