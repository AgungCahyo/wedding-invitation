interface QuoteMarkProps {
  size?: number;
  color?: string;
  className?: string;
}

/**
 * Oversized serif quotation mark used as a standalone decorative glyph —
 * the editorial equivalent of a floral flourish, but typographic.
 */
export function QuoteMark({ size = 72, color = "var(--accent)", className = "" }: QuoteMarkProps) {
  return (
    <span
      aria-hidden="true"
      className={`font-display select-none ${className}`}
      style={{
        fontSize: size,
        color,
        lineHeight: 0.6,
        display: "inline-block",
      }}
    >
      &ldquo;
    </span>
  );
}
