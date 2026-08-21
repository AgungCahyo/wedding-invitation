interface SectionLabelProps {
  index?: string;
  children: React.ReactNode;
  className?: string;
}

export function SectionLabel({ index, children, className = "" }: SectionLabelProps) {
  return (
    <div className={`flex items-center gap-3 mb-8 ${className}`}>
      {index && (
        <span className="text-[10px] font-body font-medium tabular-nums tracking-[0.2em] text-[var(--accent)]">
          {index}
        </span>
      )}
      <p className="text-[11px] font-body font-medium tracking-[0.28em] uppercase text-[var(--text-tertiary)]">
        {children}
      </p>
    </div>
  );
}
