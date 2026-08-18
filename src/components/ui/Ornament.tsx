interface OrnamentProps {
    className?: string;
  }
  
  /** Small diamond line-art glyph — repeated motif used across section headers,
   *  dividers, and timeline breaks to keep decoration consistent, not random. */
  export function Ornament({ className = "" }: OrnamentProps) {
    return (
      <svg
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`w-2.5 h-2.5 text-[var(--accent-muted)] ${className}`}
        aria-hidden="true"
      >
        <path
          d="M8 1L14 8L8 15L2 8L8 1Z"
          stroke="currentColor"
          strokeWidth="1"
          fill="none"
        />
        <circle cx="8" cy="8" r="1" fill="currentColor" />
      </svg>
    );
  }