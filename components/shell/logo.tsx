export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <svg
        width="26"
        height="26"
        viewBox="0 0 26 26"
        fill="none"
        aria-hidden
        className="shrink-0 text-brand"
      >
        <rect x="1" y="1" width="24" height="24" rx="6.5" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="13" cy="10.5" r="3.25" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M13 13.75v4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
      {!compact ? (
        <span className="text-[15px] font-semibold tracking-tight text-ink">
          PRIVault
        </span>
      ) : null}
    </div>
  );
}
