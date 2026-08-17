interface FloralAccentProps {
  className?: string;
}

export function FloralAccent({ className = "" }: FloralAccentProps) {
  return (
    <svg
      viewBox="0 0 120 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`w-24 md:w-28 h-auto text-[var(--accent)] opacity-60 ${className}`}
      aria-hidden="true"
    >
      <path
        d="M60 20C60 20 45 8 30 12C15 16 12 28 20 32C28 36 40 30 60 20Z"
        stroke="currentColor"
        strokeWidth="0.75"
        fill="none"
      />
      <path
        d="M60 20C60 20 75 8 90 12C105 16 108 28 100 32C92 36 80 30 60 20Z"
        stroke="currentColor"
        strokeWidth="0.75"
        fill="none"
      />
      <path
        d="M60 20V8M60 20V32"
        stroke="currentColor"
        strokeWidth="0.75"
        strokeLinecap="round"
      />
      <circle cx="60" cy="20" r="2" fill="currentColor" opacity="0.5" />
    </svg>
  );
}
