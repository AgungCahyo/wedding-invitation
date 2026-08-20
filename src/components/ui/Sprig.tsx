import { BotanicalLeaf, LeafBud } from "./botanical";

interface SprigProps {
  className?: string;
  mirrored?: boolean;
}

const LEAVES = [
  { x: 31.5, y: 156, rotate: -124, scale: 1.02, flip: true },
  { x: 33, y: 150, rotate: -56, scale: 0.98, flip: false },
  { x: 30, y: 126, rotate: -128, scale: 1, flip: true },
  { x: 35, y: 119, rotate: -52, scale: 0.96, flip: false },
  { x: 28.5, y: 96, rotate: -118, scale: 0.92, flip: true },
  { x: 34.5, y: 89, rotate: -62, scale: 0.88, flip: false },
  { x: 29, y: 68, rotate: -126, scale: 0.8, flip: true },
  { x: 35, y: 61, rotate: -50, scale: 0.76, flip: false },
  { x: 30.5, y: 42, rotate: -116, scale: 0.66, flip: true },
  { x: 34, y: 36, rotate: -58, scale: 0.62, flip: false },
];

/** Olive sprig — curved stem, lanceolate leaves with midrib and veins. */
export function Sprig({ className = "", mirrored = false }: SprigProps) {
  return (
    <svg
      viewBox="0 0 64 176"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`h-28 w-auto text-[var(--accent-muted)] ${className}`}
      aria-hidden="true"
      style={mirrored ? { transform: "scaleX(-1)" } : undefined}
    >
      <path
        d="M32 168C29.5 140 37 116 31 90C25.5 66 35 42 32.5 18"
        stroke="currentColor"
        strokeWidth="0.85"
        strokeLinecap="round"
        fill="none"
      />
      {LEAVES.map((leaf, i) => (
        <BotanicalLeaf key={i} {...leaf} />
      ))}
      <LeafBud x={32.5} y={18} rotate={-90} scale={0.72} />
    </svg>
  );
}
