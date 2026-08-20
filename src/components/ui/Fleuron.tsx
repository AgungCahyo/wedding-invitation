interface FleuronProps {
  className?: string;
}

/** Jewelry quatrefoil — a small printer's flower between short blocks of type. */
export function Fleuron({ className = "" }: FleuronProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`w-4 h-4 text-[var(--accent-muted)] ${className}`}
      aria-hidden="true"
    >
      {[0, 90, 180, 270].map((deg) => (
        <path
          key={deg}
          d="M16 3.5L18.2 12.2L16 16L13.8 12.2Z"
          transform={`rotate(${deg} 16 16)`}
          stroke="currentColor"
          strokeWidth="0.7"
          strokeLinejoin="round"
        />
      ))}
      <circle cx="16" cy="16" r="5.2" stroke="currentColor" strokeWidth="0.45" opacity="0.5" />
      <circle cx="16" cy="16" r="1.15" fill="currentColor" />
    </svg>
  );
}
