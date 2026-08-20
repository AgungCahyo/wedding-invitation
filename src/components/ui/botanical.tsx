export function BotanicalLeaf({
  x,
  y,
  rotate = 0,
  scale = 1,
  flip = false,
  veins = true,
  broad = false,
}: {
  x: number;
  y: number;
  rotate?: number;
  scale?: number;
  flip?: boolean;
  veins?: boolean;
  broad?: boolean;
}) {
  const sy = scale * (broad ? 1.18 : 1) * (flip ? -1 : 1);

  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale} ${sy})`}>
      <path
        d="M0 0C2.4.08 4.6.28 6.4.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.7"
        strokeLinecap="round"
      />
      <path
        d="M6.4.5C8.2-4.8 14.8-8.8 21.6-7.2C26.2-6.2 30.2-3.2 32.8.15C30.4 5.6 25.4 8.6 18.8 7.2C12.4 5.8 8.2 3.1 6.4.75C6.4.65 6.4.55 6.4.5Z"
        fill="currentColor"
        fillOpacity="0.08"
        stroke="currentColor"
        strokeWidth="0.65"
        strokeLinejoin="round"
      />
      <path
        d="M6.6.55C13.2 1.25 21.4 1.15 30.6.25"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.4"
        strokeLinecap="round"
        opacity="0.55"
      />
      {veins && (
        <g
          fill="none"
          stroke="currentColor"
          strokeWidth="0.32"
          strokeLinecap="round"
          opacity="0.4"
        >
          <path d="M10.2.7C11.6-1.5 13.4-3.4 15-4.6" />
          <path d="M14.6.85C16-1.1 18-2.8 19.8-3.8" />
          <path d="M19.4.8C20.6-.4 22.4-1.7 24-2.4" />
          <path d="M24.2.55C25.2-.15 26.4-.75 27.6-1.15" />
          <path d="M10.2.75C12 2.7 13.8 4.4 15.2 5.2" />
          <path d="M14.6.95C16.6 2.8 18.6 4.2 20.2 4.8" />
          <path d="M19.4.9C21 2.2 22.6 3.2 24.2 3.55" />
          <path d="M24.2.65C25.4 1.4 26.6 1.85 27.8 2" />
        </g>
      )}
    </g>
  );
}

export function LeafBud({
  x,
  y,
  rotate = 0,
  scale = 1,
}: {
  x: number;
  y: number;
  rotate?: number;
  scale?: number;
}) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale})`}>
      <path
        d="M0 0C2.6-3.6 6.2-6.2 10-6.6C7-4.4 3.4-1.8 0 0Z"
        fill="currentColor"
        fillOpacity="0.1"
        stroke="currentColor"
        strokeWidth="0.6"
        strokeLinejoin="round"
      />
      <path
        d="M0 0C2.6 3.4 6.2 6 10 6.4C7 4.2 3.4 1.6 0 0Z"
        fill="currentColor"
        fillOpacity="0.1"
        stroke="currentColor"
        strokeWidth="0.6"
        strokeLinejoin="round"
      />
      <path
        d="M0 0C4.2 0 8.4 0 12.6 0"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.55"
        strokeLinecap="round"
      />
    </g>
  );
}
