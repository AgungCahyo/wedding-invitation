interface EditorialRuleProps {
  align?: "left" | "right" | "center";
  width?: string;
  color?: string;
  className?: string;
}

/**
 * A short hairline that sits deliberately off-center — a masthead rule,
 * not a full-width symmetric divider. Asymmetry is the point.
 */
export function EditorialRule({
  align = "left",
  width = "3.5rem",
  color = "var(--accent)",
  className = "",
}: EditorialRuleProps) {
  const alignClass = {
    left: "mr-auto ml-0",
    right: "ml-auto mr-0",
    center: "mx-auto",
  }[align];

  return (
    <div
      aria-hidden="true"
      className={`${alignClass} ${className}`}
      style={{ width, height: 2, backgroundColor: color }}
    />
  );
}
