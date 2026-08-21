interface DotAccentProps {
  size?: number;
  count?: number;
  gap?: number;
  color?: string;
  className?: string;
}

/** A single dot, or a small horizontal cluster of dots for rhythm/emphasis. */
export function DotAccent({
  size = 6,
  count = 1,
  gap = 8,
  color = "currentColor",
  className = "",
}: DotAccentProps) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex items-center ${className}`}
      style={{ gap }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          style={{
            width: size,
            height: size,
            borderRadius: "9999px",
            backgroundColor: color,
            display: "inline-block",
          }}
        />
      ))}
    </span>
  );
}
