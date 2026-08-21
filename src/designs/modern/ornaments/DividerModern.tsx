interface DividerModernProps {
  width?: string;
  style?: "solid" | "dotted";
  color?: string;
  className?: string;
}

/** Simple horizontal divider — solid line, or a dotted row for lighter sections. */
export function DividerModern({
  width = "100%",
  style = "solid",
  color = "#e8e8e8",
  className = "",
}: DividerModernProps) {
  if (style === "dotted") {
    return (
      <div
        aria-hidden="true"
        className={`flex items-center gap-2 ${className}`}
        style={{ width }}
      >
        {Array.from({ length: 24 }).map((_, i) => (
          <span
            key={i}
            style={{
              width: 3,
              height: 3,
              borderRadius: "9999px",
              backgroundColor: color,
              flexShrink: 0,
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      aria-hidden="true"
      className={className}
      style={{ width, height: 1, backgroundColor: color }}
    />
  );
}
