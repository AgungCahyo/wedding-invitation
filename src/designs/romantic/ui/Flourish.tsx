interface FlourishProps {
  className?: string;
}

/**
 * Horizontal stationery rule: hairline, a small C-scroll, and the site's
 * diamond motif. One mark, used at a few moments — not a repeating wallpaper.
 */
export function Flourish({ className = "" }: FlourishProps) {
  return (
    <svg
      viewBox="0 0 240 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`w-40 md:w-52 h-auto text-[var(--accent)] ${className}`}
      aria-hidden="true"
    >
      <g stroke="currentColor" strokeLinecap="round">
        <path d="M8 18H78" strokeWidth="0.7" />
        <path
          d="M78 18C86 18 88.5 10 96 10C102.5 10 105 15 111 18"
          strokeWidth="0.7"
        />
        <path
          d="M86 18C90.5 14.5 95 14.5 99.5 18"
          strokeWidth="0.55"
          opacity="0.7"
        />
      </g>

      <path
        d="M120 10L129 18L120 26L111 18Z"
        stroke="currentColor"
        strokeWidth="0.75"
        fill="none"
      />
      <circle cx="120" cy="18" r="1.15" fill="currentColor" />

      <g
        stroke="currentColor"
        strokeLinecap="round"
        transform="matrix(-1 0 0 1 240 0)"
      >
        <path d="M8 18H78" strokeWidth="0.7" />
        <path
          d="M78 18C86 18 88.5 10 96 10C102.5 10 105 15 111 18"
          strokeWidth="0.7"
        />
        <path
          d="M86 18C90.5 14.5 95 14.5 99.5 18"
          strokeWidth="0.55"
          opacity="0.7"
        />
      </g>
    </svg>
  );
}
