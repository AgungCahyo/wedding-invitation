interface GeometricLineProps {
  direction?: "horizontal" | "vertical";
  length?: number | string;
  color?: string;
  width?: number;
  className?: string;
}

/** A single stroke line — no flourish, no taper. The modern design's basic unit of separation. */
export function GeometricLine({
  direction = "horizontal",
  length = 48,
  color = "currentColor",
  width = 1,
  className = "",
}: GeometricLineProps) {
  const isHorizontal = direction === "horizontal";
  const style = isHorizontal
    ? { width: typeof length === "number" ? `${length}px` : length, height: width }
    : { height: typeof length === "number" ? `${length}px` : length, width };

  return (
    <span
      aria-hidden="true"
      className={className}
      style={{ display: "inline-block", backgroundColor: color, ...style }}
    />
  );
}
