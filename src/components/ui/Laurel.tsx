interface LaurelProps {
  className?: string;
}

/** Short bay leaf — silhouette only. Veins turn to noise at wreath scale. */
function WreathLeaf({
  x,
  y,
  rotate,
  scale,
  flip,
}: {
  x: number;
  y: number;
  rotate: number;
  scale: number;
  flip?: boolean;
}) {
  return (
    <g
      transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale} ${flip ? -scale : scale})`}
    >
      <path
        d="M0 0C4.5-1 9.5-7.2 18.5 0C9.5 6.6 4.5 1.1 0 0Z"
        fill="currentColor"
        fillOpacity="0.1"
        stroke="currentColor"
        strokeWidth="0.7"
        strokeLinejoin="round"
      />
      <path
        d="M1.2 0C7 .4 12.5.35 17.2 0"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.35"
        strokeLinecap="round"
        opacity="0.45"
      />
    </g>
  );
}

const CX = 80;
const CY = 86;
const RX = 50;
const RY = 60;

/** Degrees along the left ellipse, bottom → upper-left. */
const LEFT_ANGLES = [100, 114, 128, 142, 156, 170, 184, 198, 212];

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

function leftLeaf(deg: number, index: number) {
  const t = toRad(deg);
  const x = CX + RX * Math.cos(t);
  const y = CY + RY * Math.sin(t);
  const tangent = (Math.atan2(RY * Math.cos(t), -RX * Math.sin(t)) * 180) / Math.PI;
  const scale = 0.72 - index * 0.028;

  return {
    x,
    y,
    rotate: tangent - 14,
    scale,
    flip: index % 2 === 1,
  };
}

const LEFT = LEFT_ANGLES.map(leftLeaf);

/**
 * Open horseshoe wreath. Leaves sit on an ellipse so spacing and
 * heading stay even — the previous version was hand-aimed and collapsed
 * into a scribble at monogram size.
 */
export function Laurel({ className = "" }: LaurelProps) {
  return (
    <svg
      viewBox="0 0 160 168"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`w-full h-full overflow-visible text-[var(--accent)] ${className}`}
      aria-hidden="true"
    >
      <path
        d="M71.3 145.1A50 60 0 0 1 37.6 54.2"
        stroke="currentColor"
        strokeWidth="0.65"
        strokeLinecap="round"
        opacity="0.7"
      />
      <path
        d="M88.7 145.1A50 60 0 0 0 122.4 54.2"
        stroke="currentColor"
        strokeWidth="0.65"
        strokeLinecap="round"
        opacity="0.7"
      />

      {LEFT.map((leaf, i) => (
        <WreathLeaf key={`l-${i}`} {...leaf} />
      ))}
      {LEFT.map((leaf, i) => (
        <WreathLeaf
          key={`r-${i}`}
          x={2 * CX - leaf.x}
          y={leaf.y}
          rotate={-leaf.rotate}
          scale={leaf.scale}
          flip={!leaf.flip}
        />
      ))}
    </svg>
  );
}
