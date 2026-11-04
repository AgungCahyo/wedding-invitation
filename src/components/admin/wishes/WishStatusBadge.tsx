import type { WishStatus } from "@/src/lib/wishes-service";

export function WishStatusBadge({ status }: { status: WishStatus }) {
  const config: Record<WishStatus, { label: string; className: string }> = {
    pending: { label: "Menunggu", className: "bg-amber-100 text-amber-700" },
    approved: { label: "Tayang", className: "bg-emerald-100 text-emerald-700" },
    hidden: { label: "Disembunyikan", className: "bg-[var(--bg-secondary)] text-[var(--text-tertiary)]" },
  };
  const { label, className } = config[status];
  return (
    <span className={`inline-block px-2 py-0.5 text-[10px] uppercase tracking-wider font-body ${className}`}>
      {label}
    </span>
  );
}
