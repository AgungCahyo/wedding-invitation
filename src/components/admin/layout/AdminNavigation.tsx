import type { AdminTab } from "../types";

const TABS = [
  { id: "links", label: "Generator Link" },
  { id: "rsvp", label: "Rekap RSVP" },
  { id: "wishes", label: "Ucapan" },
  { id: "photos", label: "Foto" },
] as const satisfies ReadonlyArray<{ id: AdminTab; label: string }>;

export function AdminNavigation({
  activeTab,
  onTabChange,
}: {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
}) {
  return (
    <div className="flex items-center justify-center gap-1 border-b border-[var(--border)]">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onTabChange(tab.id)}
          className={`px-5 py-3 text-xs tracking-[0.2em] uppercase font-body border-b-2 -mb-px transition-colors ${
            activeTab === tab.id
              ? "border-[var(--accent)] text-[var(--text-primary)]"
              : "border-transparent text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
