"use client";

import { useState, useEffect, useCallback, startTransition, type ReactNode } from "react";
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
  EyeOff,
  Eye,
  Clock,
  Pin,
  PinOff,
  Star,
} from "lucide-react";
import { invitation } from "@/src/data/invitation";
import { AdminAuth } from "@/src/components/AdminAuth";
import {
  fetchRSVPResponses,
  getRSVPStats,
  type GuestResponse,
} from "@/src/lib/rsvp-service";
import {
  fetchAllWishesForModeration,
  updateWishStatus,
  deleteWish,
  togglePinWish,
  type WishRecord,
  type WishStatus,
} from "@/src/lib/wishes-service";
import {
  fetchGuestLinks,
  upsertGuestLinks,
  updateGuestLinkDetails,
  type GuestLinkRecord,
} from "@/src/lib/guest-link-service";

interface GeneratedLink {
  id: string;
  slug: string;
  name: string;
  url: string;
  waLink: string;
}

type Tab = "links" | "rsvp" | "wishes";

function LinkGeneratorTab() {
  const [rawInput, setRawInput] = useState("");
  const [baseUrl] = useState(() =>
    typeof window !== "undefined" ? window.location.origin : invitation.meta.url
  );
  const [links, setLinks] = useState<GeneratedLink[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [viewStats, setViewStats] = useState<Record<string, GuestLinkRecord>>({});
  const [isSyncing, setIsSyncing] = useState(false);
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null);
  const [draft, setDraft] = useState<{
    relation: string;
    personal_note: string;
    is_featured: boolean;
  }>({ relation: "", personal_note: "", is_featured: false });
  const [savingSlug, setSavingSlug] = useState<string | null>(null);

  const groomName = invitation.couple.groom.name.split(" ")[0];
  const brideName = invitation.couple.bride.name.split(" ")[0];

  const buildWaMessage = useCallback(
    (guestName: string, guestUrl: string) => {
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
    },
    [groomName, brideName]
  );

  const refreshViewStats = useCallback(async () => {
    try {
      const result = await fetchGuestLinks();
      if (result.success) {
        const bySlug: Record<string, GuestLinkRecord> = {};
        for (const record of result.data) bySlug[record.slug] = record;
        setViewStats(bySlug);

        // Convert existing guest_links back to GeneratedLink format so they
        // render in the list with their URLs + tracking stats intact.
        const existingLinks: GeneratedLink[] = result.data.map((record) => {
          const decodedName = decodeURIComponent(record.slug);
          const url = `${baseUrl || invitation.meta.url}/${record.slug}`;
          const waText = buildWaMessage(decodedName, url);
          const waLink = `https://api.whatsapp.com/send?text=${waText}`;

          return {
            id: record.slug,
            slug: record.slug,
            name: record.name,
            url,
            waLink,
          };
        });

        setLinks(existingLinks);
      }
    } catch {
      // Non-critical for this tab — silently skip, badges just won't show.
    }
  }, [baseUrl, buildWaMessage]);

  useEffect(() => {
    startTransition(() => {
      refreshViewStats();
    });
  }, [refreshViewStats]);

  const handleGenerate = async () => {
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
        slug: encodedName,
        name,
        url,
        waLink,
      };
    });

    setLinks(generated);

    // Persist so we can track opens later — best-effort, doesn't block the
    // admin from copying/sending links even if this fails.
    setIsSyncing(true);
    try {
      await upsertGuestLinks(generated.map((g) => ({ slug: g.slug, name: g.name })));
      await refreshViewStats();
    } finally {
      setIsSyncing(false);
    }
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

  const handleTogglePersonalize = (slug: string) => {
    if (expandedSlug === slug) {
      setExpandedSlug(null);
      return;
    }
    const existing = viewStats[slug];
    setDraft({
      relation: existing?.relation ?? "",
      personal_note: existing?.personal_note ?? "",
      is_featured: existing?.is_featured ?? false,
    });
    setExpandedSlug(slug);
  };

  const handleSavePersonalize = async (slug: string) => {
    setSavingSlug(slug);
    try {
      await updateGuestLinkDetails(slug, {
        relation: draft.relation.trim() || null,
        personal_note: draft.personal_note.trim() || null,
        is_featured: draft.is_featured,
      });
      await refreshViewStats();
      setExpandedSlug(null);
    } catch {
      // Keep panel open so the admin can retry — errors here are rare
      // (config issue) and non-critical to the rest of the tab.
    } finally {
      setSavingSlug(null);
    }
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
            disabled={!rawInput.trim() || isSyncing}
            className="btn-editorial-filled flex-1 inline-flex items-center justify-center gap-2 py-3 disabled:opacity-50"
          >
            <Sparkles size={16} />
            {isSyncing
              ? "Menyimpan..."
              : `Generate Link (${rawInput.split("\n").filter((n) => n.trim()).length})`}
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
            {links.map((item) => {
              const link = viewStats[item.slug];
              const isExpanded = expandedSlug === item.slug;
              const isSaving = savingSlug === item.slug;

              return (
                <div
                  key={item.id}
                  className="bg-[var(--bg-elevated,#ffffff)] border border-[var(--border)] transition-all hover:border-[var(--accent-muted)]"
                >
                  <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1 min-w-0 flex-1">
                      <p className="font-display font-medium text-lg text-[var(--text-primary)] truncate flex items-center gap-1.5">
                        {link?.is_featured && (
                          <Star size={14} className="text-[var(--accent)] shrink-0" fill="currentColor" />
                        )}
                        {item.name}
                      </p>
                      <p className="text-xs text-[var(--text-tertiary)] truncate flex items-center gap-1.5 font-mono">
                        <LinkIcon size={12} className="shrink-0" />
                        <span className="truncate">{item.url}</span>
                      </p>
                      {link?.relation && (
                        <p className="text-xs text-[var(--text-secondary)] font-body italic">
                          {link.relation}
                        </p>
                      )}
                      {link?.first_viewed_at ? (
                        <p className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-body text-emerald-700 bg-emerald-100 px-2 py-0.5 mt-1">
                          <Eye size={11} />
                          Dibuka {formatDate(link.last_viewed_at ?? undefined)}
                          {link.view_count > 1 ? ` · ${link.view_count}x` : ""}
                        </p>
                      ) : (
                        <p className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-body text-[var(--text-tertiary)] bg-[var(--bg-secondary)] px-2 py-0.5 mt-1">
                          <Clock size={11} />
                          Belum dibuka
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0 flex-wrap">
                      <button
                        type="button"
                        onClick={() => handleTogglePersonalize(item.slug)}
                        className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-body border transition-colors ${
                          isExpanded
                            ? "border-[var(--accent)] text-[var(--accent)]"
                            : "border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                        }`}
                        title="Tambah sentuhan personal (relasi, pesan khusus, tamu istimewa)"
                      >
                        <Star size={14} />
                        <span>Personalisasi</span>
                      </button>

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

                  {isExpanded && (
                    <div className="border-t border-[var(--border-subtle)] p-4 sm:p-5 space-y-4 bg-[var(--bg-secondary)]">
                      <div>
                        <label className="eyebrow block mb-2 text-[var(--text-secondary)]">
                          Relasi (opsional)
                        </label>
                        <input
                          type="text"
                          value={draft.relation}
                          onChange={(e) => setDraft((d) => ({ ...d, relation: e.target.value }))}
                          placeholder='mis. "Sahabat SMA", "Sepupu dari mempelai wanita"'
                          className="input-editorial"
                        />
                      </div>
                      <div>
                        <label className="eyebrow block mb-2 text-[var(--text-secondary)]">
                          Pesan Personal (opsional)
                        </label>
                        <textarea
                          value={draft.personal_note}
                          onChange={(e) =>
                            setDraft((d) => ({ ...d, personal_note: e.target.value }))
                          }
                          rows={2}
                          placeholder="Pesan singkat khusus untuk tamu ini — akan tampil di halaman undangan mereka."
                          className="input-editorial resize-none"
                        />
                      </div>
                      <label className="flex items-center gap-2 text-sm font-body text-[var(--text-secondary)] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={draft.is_featured}
                          onChange={(e) =>
                            setDraft((d) => ({ ...d, is_featured: e.target.checked }))
                          }
                          className="w-4 h-4 accent-[var(--accent)]"
                        />
                        Tandai sebagai Tamu Istimewa
                      </label>
                      <div className="flex items-center gap-3 pt-1">
                        <button
                          type="button"
                          onClick={() => handleSavePersonalize(item.slug)}
                          disabled={isSaving}
                          className="btn-editorial-filled px-5 py-2 text-xs disabled:opacity-50"
                        >
                          {isSaving ? "Menyimpan..." : "Simpan"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setExpandedSlug(null)}
                          className="text-xs font-body text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                        >
                          Batal
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
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
    startTransition(() => {
      loadData();
    });
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

function WishStatusBadge({ status }: { status: WishStatus }) {
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

function WishesModerationTab() {
  const [wishes, setWishes] = useState<WishRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<WishStatus | "all">("pending");
  const [pendingActionId, setPendingActionId] = useState<number | null>(null);

  const loadWishes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchAllWishesForModeration();
      if (result.notConfigured) {
        setError("Fitur ucapan belum aktif. Periksa konfigurasi Supabase.");
        return;
      }
      setWishes(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat ucapan.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    startTransition(() => {
      loadWishes();
    });
  }, [loadWishes]);

  const handleSetStatus = async (id: number, status: WishStatus) => {
    setPendingActionId(id);
    try {
      await updateWishStatus(id, status);
      setWishes((prev) => prev.map((w) => (w.id === id ? { ...w, status } : w)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengubah status ucapan.");
    } finally {
      setPendingActionId(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Hapus ucapan ini secara permanen?")) return;
    setPendingActionId(id);
    try {
      await deleteWish(id);
      setWishes((prev) => prev.filter((w) => w.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus ucapan.");
    } finally {
      setPendingActionId(null);
    }
  };

  const handleTogglePin = async (id: number, currentlyPinned: boolean) => {
    setPendingActionId(id);
    try {
      await togglePinWish(id, !currentlyPinned);
      setWishes((prev) =>
        prev.map((w) => (w.id === id ? { ...w, is_pinned: !currentlyPinned } : w))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengubah status pin.");
    } finally {
      setPendingActionId(null);
    }
  };

  const filteredWishes = filter === "all" ? wishes : wishes.filter((w) => w.status === filter);
  const pendingCount = wishes.filter((w) => w.status === "pending").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-1 flex-wrap">
          {(
            [
              { id: "pending", label: `Menunggu${pendingCount > 0 ? ` (${pendingCount})` : ""}` },
              { id: "approved", label: "Tayang" },
              { id: "hidden", label: "Disembunyikan" },
              { id: "all", label: "Semua" },
            ] as const
          ).map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`px-3 py-1.5 text-xs font-body border transition-colors ${
                filter === f.id
                  ? "border-[var(--accent)] text-[var(--text-primary)] bg-[var(--bg-secondary)]"
                  : "border-[var(--border)] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={loadWishes}
          className="inline-flex items-center gap-1.5 text-xs font-body text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <RefreshCw size={13} />
          Muat ulang
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-50 text-red-700 text-sm font-body">
          <AlertCircle size={16} className="shrink-0" />
          {error}
        </div>
      )}

      {isLoading ? (
        <p className="text-center text-sm text-[var(--text-tertiary)] font-body py-12">Memuat ucapan...</p>
      ) : filteredWishes.length === 0 ? (
        <p className="text-center text-sm text-[var(--text-tertiary)] font-body py-12">
          Tidak ada ucapan di kategori ini.
        </p>
      ) : (
        <ul className="space-y-3">
          {filteredWishes.map((wish) => (
            <li
              key={wish.id}
              className="border border-[var(--border)] p-4 sm:p-5 space-y-3 bg-[var(--bg-elevated,#ffffff)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-display text-base text-[var(--text-primary)] flex items-center gap-1.5">
                    {wish.is_pinned && (
                      <Pin size={12} className="text-[var(--accent)] shrink-0" fill="currentColor" />
                    )}
                    {wish.name}
                  </p>
                  <p className="text-[10px] text-[var(--text-tertiary)] font-body mt-0.5">
                    {formatDate(wish.created_at)}
                  </p>
                </div>
                <WishStatusBadge status={wish.status} />
              </div>

              <p className="text-sm text-[var(--text-secondary)] font-body leading-relaxed">
                {wish.message}
              </p>

              <div className="flex items-center gap-2 flex-wrap pt-1">
                {wish.status !== "approved" && (
                  <button
                    type="button"
                    disabled={pendingActionId === wish.id}
                    onClick={() => handleSetStatus(wish.id, "approved")}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-body bg-emerald-600 text-white hover:bg-emerald-700 transition-colors disabled:opacity-50"
                  >
                    <Eye size={13} />
                    Tayangkan
                  </button>
                )}
                {wish.status === "approved" && (
                  <button
                    type="button"
                    disabled={pendingActionId === wish.id}
                    onClick={() => handleTogglePin(wish.id, wish.is_pinned)}
                    title={
                      wish.is_pinned
                        ? "Lepas dari sorotan"
                        : "Sematkan ke bagian atas (mis. ucapan dari orang tua)"
                    }
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-body border transition-colors disabled:opacity-50 ${
                      wish.is_pinned
                        ? "border-[var(--accent)] text-[var(--accent)] bg-[var(--accent)]/10"
                        : "border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    {wish.is_pinned ? <PinOff size={13} /> : <Pin size={13} />}
                    {wish.is_pinned ? "Lepas Sematan" : "Sematkan"}
                  </button>
                )}
                {wish.status !== "hidden" && (
                  <button
                    type="button"
                    disabled={pendingActionId === wish.id}
                    onClick={() => handleSetStatus(wish.id, "hidden")}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-body border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors disabled:opacity-50"
                  >
                    <EyeOff size={13} />
                    Sembunyikan
                  </button>
                )}
                <button
                  type="button"
                  disabled={pendingActionId === wish.id}
                  onClick={() => handleDelete(wish.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-body text-red-600 hover:text-red-700 transition-colors disabled:opacity-50 ml-auto"
                >
                  <Trash2 size={13} />
                  Hapus
                </button>
              </div>
            </li>
          ))}
        </ul>
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
              { id: "wishes", label: "Ucapan" },
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

        {activeTab === "links" ? (
          <LinkGeneratorTab />
        ) : activeTab === "rsvp" ? (
          <RSVPDashboardTab />
        ) : (
          <WishesModerationTab />
        )}
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