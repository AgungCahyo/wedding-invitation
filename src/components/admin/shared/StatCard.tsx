import type { ReactNode } from "react";

export function StatCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="bg-[var(--bg-elevated,#ffffff)] border border-[var(--border)] p-5 flex items-center gap-4">
      <div className="w-10 h-10 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--accent)] shrink-0">
        {icon}
      </div>
      <div>
        <p className="font-display text-2xl text-[var(--text-primary)] leading-none">{value}</p>
        <p className="eyebrow mt-1.5 text-[var(--text-tertiary)]">{label}</p>
      </div>
    </div>
  );
}
