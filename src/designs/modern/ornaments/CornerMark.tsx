interface CornerMarkProps {
  size?: number;
  corner?: "TL" | "TR" | "BL" | "BR";
  color?: string;
  className?: string;
}

/** A single-line corner bracket (not double, unlike Design 1's CornerFrame). One mark, one corner. */
export function CornerMark({
  size = 18,
  corner = "TL",
  color = "currentColor",
  className = "",
}: CornerMarkProps) {
  const positionClass = {
    TL: "top-0 left-0",
    TR: "top-0 right-0 -scale-x-100",
    BL: "bottom-0 left-0 -scale-y-100",
    BR: "bottom-0 right-0 -scale-x-100 -scale-y-100",
  }[corner];

  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 18 18"
      fill="none"
      className={`absolute ${positionClass} ${className}`}
    >
      <path d="M0 0 H10 M0 0 V10" stroke={color} strokeWidth="1.5" />
    </svg>
  );
}
