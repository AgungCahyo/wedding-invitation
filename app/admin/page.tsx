"use client";

import { useState, useEffect, useCallback, type ReactNode } from "react";
import {
  Copy,
  Check,
  Send,
  Sparkles,
  Trash2,
  Link as LinkIcon,
  Users,
  UserCheck,
  UserX,
  UtensilsCrossed,
  Download,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { invitation } from "@/src/data/invitation";
import { AdminAuth } from "@/src/components/AdminAuth";
import {
  fetchRSVPResponses,
  getRSVPStats,
  type GuestResponse,
} from "@/src/lib/rsvp-service";

interface GeneratedLink {
  id: string;
  name: string;
  url: string;
  waLink: string;
}

type Tab = "links" | "rsvp";

function LinkGeneratorTab() {
  const [rawInput, setRawInput] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [links, setLinks] = useState<GeneratedLink[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setBaseUrl(window.location.origin);
    } else {
      setBaseUrl(invitation.meta.url);
    }
  }, []);

  const groomName = invitation.couple.groom.name.split(" ")[0];
  const brideName = invitation.couple.bride.name.split(" ")[0];

  const buildWaMessage = (guestName: string, guestUrl: string) => {
    const lines = [
      `Tanpa mengurangi rasa hormat, kami mengundang Bapak/Ibu/Saudara/i *${guestName}* untuk berkenan hadir dan memberikan doa restu pada pernikahan kami.`,
      ``,
      `📌 *Berikut link undangan Anda:*`,
      guestUrl,
      ``,
      `Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir.`,
      ``,
      `Wassalamu'alaikum Wr. Wb.`,
      `*${groomName} & ${brideName}*`,
    ];
    return encodeURIComponent(lines.join("\n"));
  };

  const handleGenerate = () => {
    const names = rawInput
      .split("\n")
      .map((n) => n.trim())
      .filter((n) => n.length > 0);

    if (names.length === 0) return;

    const generated: GeneratedLink[] = names.map((name, index) => {
      const encodedName = encodeURIComponent(name);
      const url = `${baseUrl || invitation.meta.url}/${encodedName}`;
      const waText = buildWaMessage(name, url);
      const waLink = `https://api.whatsapp.com/send?text=${waText}`;

      return {
        id: `${index}-${name}`,
        name,
        url,
        waLink,
      };
    });

    setLinks(generated);
  };

  const handleCopySingle = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleCopyAll = () => {
    if (links.length === 0) return;
    const text = links.map((l) => `${l.name}: ${l.url}`).join("\n");
    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2500);
  };

  const handleClear = () => {
    setRawInput("");
    setLinks([]);
  };

  return (
    <div className="space-y-10">
      {/* Input Card */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border)] p-6 sm:p-8 space-y-6">
        <div>
          <label htmlFor="guest-names" className="eyebrow block mb-3 text-[var(--text-secondary)]">
            Daftar Nama Tamu (Satu Nama per Baris)
          </label>
          <textarea
            id="guest-names"
            rows={6}
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
            placeholder={"Contoh:\nBudi Santoso\nSiti Nurhaliza & Partner\nKeluarga Pak Ahmad"}
            className="w-full bg-[var(--bg-primary)] border border-[var(--border)] p-4 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] resize-y leading-relaxed font-body placeholder:text-[var(--text-tertiary)]"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={!rawInput.trim()}
            className="btn-editorial-filled flex-1 inline-flex items-center justify-center gap-2 py-3 disabled:opacity-50"
          >
            <Sparkles size={16} />
            Generate Link ({rawInput.split("\n").filter((n) => n.trim()).length})
          </button>

          {links.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              className="p-3 text-[var(--text-tertiary)] hover:text-red-600 border border-[var(--border)] hover:border-red-600/30 transition-colors"
              title="Bersihkan"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Generated Links List */}
      {links.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
            <h2 className="font-display text-xl text-[var(--text-primary)]">
              Hasil Link ({links.length} Tamu)
            </h2>
            <button
              type="button"
              onClick={handleCopyAll}
              className="inline-flex items-center gap-2 text-xs tracking-wider uppercase font-body text-[var(--accent)] hover:underline"
            >
              {copiedAll ? (
                <>
                  <Check size={14} /> Tersalin Semua!
                </>
              ) : (
                <>
                  <Copy size={14} /> Copy Semua (Format List)
                </>
              )}
            </button>
          </div>

          <div className="space-y-4">
            {links.map((item) => (
              <div
                key={item.id}
                className="bg-[var(--bg-elevated,#ffffff)] border border-[var(--border)] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-[var(--accent-muted)]"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <p className="font-display font-medium text-lg text-[var(--text-primary)] truncate">
                    {item.name}
                  </p>
                  <p className="text-xs text-[var(--text-tertiary)] truncate flex items-center gap-1.5 font-mono">
                    <LinkIcon size={12} className="shrink-0" />
                    <span className="truncate">{item.url}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleCopySingle(item.id, item.url)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-body border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent)] transition-colors"
                    title="Copy URL"
                  >
                    {copiedId === item.id ? (
                      <>
                        <Check size={14} className="text-green-600" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        <span>Copy</span>
                      </>
                    )}
                  </button>

                  <a
                    href={item.waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-body bg-emerald-600 text-white hover:bg-emerald-700 transition-colors rounded-none"
                  >
                    <Send size={14} />
                    <span>Kirim WA</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
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

function escapeCSVField(value: string | number | null | undefined): string {
  const str = String(value ?? "");
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function formatDate(iso?: string): string {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleString("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

function RSVPDashboardTab() {
  const [responses, setResponses] = useState<GuestResponse[]>([]);
  const [stats, setStats] = useState({ total: 0, attending: 0, notAttending: 0, totalGuests: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [responsesResult, statsResult] = await Promise.all([
        fetchRSVPResponses(),
        getRSVPStats(),
      ]);

      if (!responsesResult.success) {
        setError("Fitur RSVP belum aktif. Periksa konfigurasi Supabase.");
        return;
      }

      setResponses(responsesResult.data);
      setStats(statsResult.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat data RSVP.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleExportCSV = () => {
    if (responses.length === 0) return;

    const headers = ["Nama", "Status", "Jumlah Tamu", "Pesan", "Tanggal"];
    const rows = responses.map((r) => [
      escapeCSVField(r.name),
      escapeCSVField(r.attendance === "attending" ? "Hadir" : "Tidak Hadir"),
      escapeCSVField(r.attendance === "attending" ? r.guest_count ?? 1 : 0),
      escapeCSVField(r.message ?? ""),
      escapeCSVField(formatDate(r.created_at)),
    ]);

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\r\n");
    // Prefix with a BOM so Excel opens UTF-8 (Indonesian names/diacritics) correctly.
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `rsvp-${invitation.couple.groom.name.split(" ")[0].toLowerCase()}-${invitation.couple.bride.name.split(" ")[0].toLowerCase()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-[var(--text-tertiary)] gap-2 text-sm">
        <RefreshCw size={16} className="animate-spin" />
        Memuat data RSVP...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[var(--bg-secondary)] border border-[var(--border)] p-8 text-center space-y-3">
        <AlertCircle size={24} className="mx-auto text-red-600" />
        <p className="text-sm text-[var(--text-secondary)]">{error}</p>
        <button type="button" onClick={loadData} className="btn-editorial mt-2">
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Users size={18} />} label="Total Respon" value={stats.total} />
        <StatCard icon={<UserCheck size={18} />} label="Hadir" value={stats.attending} />
        <StatCard icon={<UserX size={18} />} label="Tidak Hadir" value={stats.notAttending} />
        <StatCard icon={<UtensilsCrossed size={18} />} label="Est. Porsi Catering" value={stats.totalGuests} />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
        <h2 className="font-display text-xl text-[var(--text-primary)]">
          Tanggapan Tamu ({responses.length})
        </h2>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={loadData}
            className="inline-flex items-center gap-1.5 text-xs tracking-wider uppercase font-body text-[var(--text-secondary)] hover:text-[var(--accent)]"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
          <button
            type="button"
            onClick={handleExportCSV}
            disabled={responses.length === 0}
            className="inline-flex items-center gap-1.5 text-xs tracking-wider uppercase font-body text-[var(--accent)] hover:underline disabled:opacity-40 disabled:hover:no-underline"
          >
            <Download size={14} />
            Export ke CSV
          </button>
        </div>
      </div>

      {/* Table */}
      {responses.length === 0 ? (
        <p className="text-center text-sm text-[var(--text-tertiary)] py-12">
          Belum ada tamu yang mengisi RSVP.
        </p>
      ) : (
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
      )}
    </div>
  );
}

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("links");

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] py-12 px-4 sm:px-6 lg:px-8 font-body">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <p className="eyebrow tracking-widest text-xs uppercase text-[var(--accent)]">
            Admin Panel
          </p>
          <h1 className="font-display text-3xl sm:text-4xl text-[var(--text-primary)]">
            Kelola Undangan
          </h1>
          <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto">
            Buat link undangan personal dan pantau tanggapan RSVP tamu.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex items-center justify-center gap-1 border-b border-[var(--border)]">
          {(
            [
              { id: "links", label: "Generator Link" },
              { id: "rsvp", label: "Rekap RSVP" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
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

        {activeTab === "links" ? <LinkGeneratorTab /> : <RSVPDashboardTab />}
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <AdminAuth>
      <AdminDashboard />
    </AdminAuth>
  );
}
