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
    // Di HP tab bisa digeser ke samping (tidak lagi melebar keluar layar); di layar lebar tetap di tengah.
    <nav
      aria-label="Menu admin"
      className="-mx-4 sm:mx-0 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <div className="flex w-max min-w-full sm:justify-center gap-1 px-4 sm:px-0 border-b border-[var(--border)]">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={(e) => {
              onTabChange(tab.id);
              e.currentTarget.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
            }}
            aria-current={activeTab === tab.id ? "page" : undefined}
            className={`px-3 sm:px-5 py-3 text-[11px] sm:text-xs tracking-[0.15em] sm:tracking-[0.2em] whitespace-nowrap uppercase font-body border-b-2 -mb-px transition-colors ${
              activeTab === tab.id
                ? "border-[var(--accent)] text-[var(--text-primary)]"
                : "border-transparent text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
