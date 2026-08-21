interface CornerFrameProps {
  className?: string;
  /** Inset from the positioned parent. */
  insetClassName?: string;
  markClassName?: string;
}

function CornerMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path d="M40 1H1V40" stroke="currentColor" strokeWidth="0.75" />
      <path
        d="M40 6H6V40"
        stroke="currentColor"
        strokeWidth="0.5"
        opacity="0.45"
      />
    </svg>
  );
}

/**
 * Letterpress-style double-line corners. Sit inside a `relative` parent.
 * Uses currentColor — set text color on the wrapper.
 */
export function CornerFrame({
  className = "",
  insetClassName = "inset-4 md:inset-8",
  markClassName = "w-8 h-8 md:w-11 md:h-11",
}: CornerFrameProps) {
  return (
    <div
      className={`pointer-events-none absolute ${insetClassName} ${className}`}
      aria-hidden="true"
    >
      <CornerMark className={`absolute top-0 left-0 ${markClassName}`} />
      <CornerMark className={`absolute top-0 right-0 ${markClassName} rotate-90`} />
      <CornerMark className={`absolute bottom-0 right-0 ${markClassName} rotate-180`} />
      <CornerMark className={`absolute bottom-0 left-0 ${markClassName} -rotate-90`} />
    </div>
  );
}
