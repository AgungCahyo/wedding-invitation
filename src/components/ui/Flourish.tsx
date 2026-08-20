import { BotanicalLeaf } from "./botanical";

interface FlourishProps {
  className?: string;
}

function Side() {
  return (
    <g>
      <path
        d="M8 22H84"
        stroke="currentColor"
        strokeWidth="0.7"
        strokeLinecap="round"
        fill="none"
      />
      <BotanicalLeaf x={84} y={22} rotate={-12} scale={0.7} flip />
      <BotanicalLeaf x={80} y={22.5} rotate={22} scale={0.5} />
    </g>
  );
}

/** Stationery rule that resolves into two small engraved leaves. */
export function Flourish({ className = "" }: FlourishProps) {
  return (
    <svg
      viewBox="0 0 240 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`w-40 md:w-52 h-auto text-[var(--accent)] ${className}`}
      aria-hidden="true"
    >
      <Side />
      <path
        d="M120 14L129 22L120 30L111 22Z"
        stroke="currentColor"
        strokeWidth="0.75"
        fill="currentColor"
        fillOpacity="0.1"
      />
      <circle cx="120" cy="22" r="1.15" fill="currentColor" />
      <g transform="matrix(-1 0 0 1 240 0)">
        <Side />
      </g>
    </svg>
  );
}
