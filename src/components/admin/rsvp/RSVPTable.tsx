import type { GuestResponse } from "@/src/lib/rsvp-service";
import { formatDate } from "../shared/formatDate";

export function RSVPTable({ responses }: { responses: GuestResponse[] }) {
  if (responses.length === 0) {
    return (
      <p className="text-center text-sm text-[var(--text-tertiary)] py-12">
        Belum ada tamu yang mengisi RSVP.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto border border-[var(--border)]">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[var(--bg-secondary)] text-left">
            <th className="eyebrow font-normal px-4 py-3 whitespace-nowrap">Nama</th>
            <th className="eyebrow font-normal px-4 py-3 whitespace-nowrap">Status</th>
            <th className="eyebrow font-normal px-4 py-3 whitespace-nowrap">Jml Tamu</th>
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
                {r.attendance === "attending" ? r.guest_count ?? 1 : "-"}
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
  );
}
