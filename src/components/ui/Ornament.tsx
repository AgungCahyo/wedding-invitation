interface OrnamentProps {
  className?: string;
}

/** Small diamond line-art glyph — the repeating jewelry mark of the invitation. */
export function Ornament({ className = "" }: OrnamentProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`w-2.5 h-2.5 text-[var(--accent-muted)] ${className}`}
      aria-hidden="true"
    >
      <path
        d="M8 1.5L14.5 8L8 14.5L1.5 8L8 1.5Z"
        stroke="currentColor"
        strokeWidth="0.9"
      />
      <path
        d="M8 5L11 8L8 11L5 8L8 5Z"
        stroke="currentColor"
        strokeWidth="0.7"
        opacity="0.7"
      />
      <circle cx="8" cy="8" r="0.9" fill="currentColor" />
    </svg>
  );
}
