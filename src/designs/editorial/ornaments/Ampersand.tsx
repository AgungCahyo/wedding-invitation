interface AmpersandProps {
  size?: number | string;
  color?: string;
  className?: string;
}

/** Large italic serif ampersand — the recurring "brand mark" of this design. */
export function Ampersand({ size = "clamp(1.75rem,4vw,3rem)", color = "var(--accent)", className = "" }: AmpersandProps) {
  return (
    <span
      aria-hidden="true"
      className={`font-display italic select-none ${className}`}
      style={{ fontSize: size, color, display: "inline-block", lineHeight: 1 }}
    >
      &amp;
    </span>
  );
}
