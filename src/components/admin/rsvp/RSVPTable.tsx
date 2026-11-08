import type { GuestResponse } from "@/src/lib/rsvp-service";
import { formatDate } from "../shared/formatDate";

const EVENT_LABELS: Record<string, string> = { "ngunduh-mantu": "Ngunduh Mantu" };

export function RSVPTable({ responses }: { responses: GuestResponse[] }) {
  if (responses.length === 0) {
    return (
      <p className="text-center text-sm text-[var(--text-tertiary)] py-12">
        Belum ada tamu yang mengisi RSVP.
      </p>
    );
  }

  const statusBadge = (attending: boolean) => (
    <span
      className={`inline-block px-2 py-0.5 text-[10px] uppercase tracking-wider font-body whitespace-nowrap ${
        attending ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
      }`}
    >
      {attending ? "Hadir" : "Tidak Hadir"}
    </span>
  );

  return (
    <>
      {/* HP: kartu per tamu (tabel terlalu lebar untuk layar kecil) */}
      <ul className="md:hidden space-y-3">
        {responses.map((r, i) => (
          <li
            key={r.id ?? i}
            className="border border-[var(--border)] bg-[var(--bg-elevated,#ffffff)] p-4 space-y-2"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="font-display text-lg leading-tight text-[var(--text-primary)] break-words min-w-0">
                {r.name}
              </p>
              {statusBadge(r.attendance === "attending")}
            </div>
            <p className="font-body text-xs text-[var(--text-tertiary)]">
              {r.attendance === "attending" ? `${r.guest_count ?? 1} tamu · ` : ""}
              {formatDate(r.created_at)}
            </p>
            {r.event_responses && Object.keys(r.event_responses).length > 0 && (
              <div className="font-body text-xs text-[var(--text-secondary)] space-y-0.5">
                {Object.entries(r.event_responses).map(([id, v]) => (
                  <p key={id}>
                    {EVENT_LABELS[id] ?? id}: {v === "attending" ? "Hadir" : "Berhalangan"}
                  </p>
                ))}
              </div>
            )}
            {r.message && (
              <p className="font-body text-sm text-[var(--text-secondary)] leading-relaxed break-words">
                {r.message}
              </p>
            )}
          </li>
        ))}
      </ul>

      <div className="hidden md:block overflow-x-auto border border-[var(--border)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[var(--bg-secondary)] text-left">
              <th className="eyebrow font-normal px-4 py-3 whitespace-nowrap">Nama</th>
              <th className="eyebrow font-normal px-4 py-3 whitespace-nowrap">Status</th>
              <th className="eyebrow font-normal px-4 py-3 whitespace-nowrap">Jml Tamu</th>
              <th className="eyebrow font-normal px-4 py-3 whitespace-nowrap">Acara Lain</th>
              <th className="eyebrow font-normal px-4 py-3">Pesan</th>
              <th className="eyebrow font-normal px-4 py-3 whitespace-nowrap">Tanggal</th>
            </tr>
          </thead>
          <tbody>
            {responses.map((r, i) => (
              <tr
                key={r.id ?? i}
                className="border-t border-[var(--border)] hover:bg-[var(--bg-secondary)]/50"
              >
                <td className="px-4 py-3 font-display text-[var(--text-primary)] whitespace-nowrap">
                  {r.name}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span
                    className={`inline-block px-2 py-0.5 text-[10px] uppercase tracking-wider font-body ${
                      r.attendance === "attending"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {r.attendance === "attending" ? "Hadir" : "Tidak Hadir"}
                  </span>
                </td>
                <td className="px-4 py-3 text-[var(--text-secondary)]">
                  {r.attendance === "attending" ? (r.guest_count ?? 1) : "-"}
                </td>
                <td className="px-4 py-3 text-[var(--text-secondary)] whitespace-nowrap text-xs">
                  {r.event_responses && Object.keys(r.event_responses).length > 0 ? (
                    Object.entries(r.event_responses).map(([id, v]) => (
                      <div key={id}>
                        {EVENT_LABELS[id] ?? id}: {v === "attending" ? "Hadir" : "Berhalangan"}
                      </div>
                    ))
                  ) : (
                    <span className="text-[var(--text-tertiary)]">-</span>
                  )}
                </td>
                <td className="px-4 py-3 text-[var(--text-secondary)] max-w-xs">
                  {r.message || <span className="text-[var(--text-tertiary)]">-</span>}
                </td>
                <td className="px-4 py-3 text-[var(--text-tertiary)] whitespace-nowrap text-xs">
                  {formatDate(r.created_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
