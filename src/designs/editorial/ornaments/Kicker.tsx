interface KickerProps {
  index?: string;
  label: string;
  color?: string;
  className?: string;
}

/**
 * A section "kicker" — small index + label pair, styled like a magazine
 * section marker (e.g. "01 — The Story"). Replaces the eyebrow-only pattern
 * with something more editorial and asymmetric.
 */
export function Kicker({ index, label, color = "var(--text-tertiary)", className = "" }: KickerProps) {
  return (
    <div
      aria-hidden="false"
      className={`flex items-baseline gap-2 font-[var(--font-label)] text-[0.6875rem] font-medium uppercase tracking-[0.28em] ${className}`}
      style={{ color }}
    >
      {index && <span style={{ color: "var(--accent)" }}>{index}</span>}
      <span>{label}</span>
    </div>
  );
}
