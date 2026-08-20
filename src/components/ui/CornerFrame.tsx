import { BotanicalLeaf } from "./botanical";

interface CornerFrameProps {
  className?: string;
  insetClassName?: string;
  markClassName?: string;
  variant?: "line" | "botanical";
}

function CornerMark({
  className = "",
  variant = "line",
}: {
  className?: string;
  variant?: "line" | "botanical";
}) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path d="M64 1.2H1.2V64" stroke="currentColor" strokeWidth="0.75" />
      <path
        d="M64 7.5H7.5V64"
        stroke="currentColor"
        strokeWidth="0.5"
        opacity="0.4"
      />
      {variant === "botanical" && (
        <>
          <BotanicalLeaf x={8} y={6.5} rotate={4} scale={0.72} veins={false} />
          <BotanicalLeaf x={6.5} y={8} rotate={86} scale={0.72} flip veins={false} />
          <BotanicalLeaf x={9} y={9} rotate={44} scale={0.46} flip veins={false} />
        </>
      )}
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
  variant = "line",
}: CornerFrameProps) {
  return (
    <div
      className={`pointer-events-none absolute ${insetClassName} ${className}`}
      aria-hidden="true"
    >
      <CornerMark variant={variant} className={`absolute top-0 left-0 ${markClassName}`} />
      <CornerMark variant={variant} className={`absolute top-0 right-0 ${markClassName} rotate-90`} />
      <CornerMark variant={variant} className={`absolute bottom-0 right-0 ${markClassName} rotate-180`} />
      <CornerMark variant={variant} className={`absolute bottom-0 left-0 ${markClassName} -rotate-90`} />
    </div>
  );
}
