"use client";

import { useState, useEffect, useCallback, startTransition } from "react";
import {
  Copy,
  Check,
  Send,
  Sparkles,
  Trash2,
  Eraser,
  Loader2,
  Link as LinkIcon,
  Eye,
  Clock,
  Star,
  AlertCircle,
} from "lucide-react";
import { invitation } from "@/src/data/invitation";
import {
  fetchGuestLinks,
  upsertGuestLinks,
  updateGuestLinkDetails,
  deleteGuestLink,
  type GuestLinkRecord,
} from "@/src/lib/guest-link-service";
import { formatDate } from "../shared/formatDate";
import type { GeneratedLink } from "../types";

export function GuestLinkGenerator() {
  const [rawInput, setRawInput] = useState("");
  const [baseUrl] = useState(() =>
    typeof window !== "undefined"
      ? window.location.origin
      : invitation.meta.url,
  );
  const [links, setLinks] = useState<GeneratedLink[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [viewStats, setViewStats] = useState<Record<string, GuestLinkRecord>>(
    {},
  );
  const [isSyncing, setIsSyncing] = useState(false);
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null);
  const [draft, setDraft] = useState<{
    relation: string;
    personal_note: string;
    is_featured: boolean;
  }>({ relation: "", personal_note: "", is_featured: false });
  const [savingSlug, setSavingSlug] = useState<string | null>(null);
  const [notice, setNotice] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);
  const [confirmDeleteSlug, setConfirmDeleteSlug] = useState<string | null>(
    null,
  );
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);

  const groomName = invitation.couple.groom.name.split(" ")[0];
  const brideName = invitation.couple.bride.name.split(" ")[2];

  const buildWaMessage = useCallback(
    (guestName: string, guestUrl: string) => {
      const lines = [
        `Assalamu'alaikum Wr. Wb.`,
        ``,
        `Dengan penuh kebahagiaan, kami ingin mengundang Bapak/Ibu/Saudara/i *${guestName}* untuk hadir dan turut memberikan doa restu pada hari pernikahan kami.`,
        ``,
        `Berikut kami sampaikan tautan undangan pernikahan kami:`,
        `🔗 ${guestUrl}`,
        ``,
        `Besar harapan kami Bapak/Ibu/Saudara/i dapat berkenan hadir dan berbagi kebahagiaan bersama kami.`,
        ``,
        `Terima kasih atas perhatian dan doa yang diberikan.`,
        ``,
        `Wassalamu'alaikum Wr. Wb.`,
        `*${groomName} & ${brideName}*`,
      ];
      return encodeURIComponent(lines.join("\n"));
    },
    [groomName, brideName],
  );

  const refreshViewStats = useCallback(async () => {
    try {
      const result = await fetchGuestLinks();
      if (result.success) {
        const bySlug: Record<string, GuestLinkRecord> = {};
        for (const record of result.data) bySlug[record.slug] = record;
        setViewStats(bySlug);

        // Convert saved guest_links back to GeneratedLink format so they render
        // with their URLs + tracking stats. Links generated in this session but
        // not (yet) saved stay in the list instead of being wiped by this refresh.
        const saved: GeneratedLink[] = result.data.map((record) => {
          const url = `${baseUrl || invitation.meta.url}/${record.slug}`;
          return {
            id: record.slug,
            slug: record.slug,
            name: record.name,
            url,
            waLink: `https://api.whatsapp.com/send?text=${buildWaMessage(record.name, url)}`,
          };
        });
        const savedSlugs = new Set(saved.map((l) => l.slug));
        setLinks((prev) => [
          ...prev.filter((l) => !savedSlugs.has(l.slug)),
          ...saved,
        ]);
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
    const names = [
      ...new Set(
        rawInput
          .split("\n")
          .map((n) => n.trim())
          .filter((n) => n.length > 0),
      ),
    ];

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
    setNotice(null);
    try {
      const saved = await upsertGuestLinks(
        generated.map((g) => ({ slug: g.slug, name: g.name })),
      );
      if (!saved.success) {
        setNotice({
          type: "error",
          text: "Link dibuat, tapi gagal disimpan ke database — statistik “dibuka” tidak akan terlacak untuk link ini.",
        });
      }
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

  // Only clears the textarea — saved links stay in the list (use Hapus per tamu to remove one).
  const handleClear = () => setRawInput("");

  const handleDelete = async (item: GeneratedLink) => {
    setDeletingSlug(item.slug);
    setNotice(null);
    try {
      // Links generated this session but never saved have nothing to delete server-side.
      if (viewStats[item.slug]) await deleteGuestLink(item.slug);
      setLinks((prev) => prev.filter((l) => l.slug !== item.slug));
      setViewStats((prev) => {
        const next = { ...prev };
        delete next[item.slug];
        return next;
      });
      if (expandedSlug === item.slug) setExpandedSlug(null);
      setConfirmDeleteSlug(null);
      setNotice({
        type: "success",
        text: `Link untuk “${item.name}” sudah dihapus.`,
      });
    } catch (err) {
      setNotice({
        type: "error",
        text: err instanceof Error ? err.message : "Gagal menghapus link.",
      });
    } finally {
      setDeletingSlug(null);
    }
  };

  const handleTogglePersonalize = (slug: string) => {
    setConfirmDeleteSlug(null);
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
    setNotice(null);
    try {
      await updateGuestLinkDetails(slug, {
        relation: draft.relation.trim() || null,
        personal_note: draft.personal_note.trim() || null,
        is_featured: draft.is_featured,
      });
      await refreshViewStats();
      setExpandedSlug(null);
    } catch (err) {
      // Keep the panel open so the admin can retry, and say why it failed.
      setNotice({
        type: "error",
        text:
          err instanceof Error ? err.message : "Gagal menyimpan personalisasi.",
      });
    } finally {
      setSavingSlug(null);
    }
  };

  return (
    <div className="space-y-10">
      {/* Input Card */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border)] p-6 sm:p-8 space-y-6">
        <div>
          <label
            htmlFor="guest-names"
            className="block font-body text-sm font-medium text-[var(--text-primary)]"
          >
            Daftar nama tamu
          </label>
          <p className="font-body text-[13px] leading-snug text-[var(--text-tertiary)] mt-1 mb-3">
            Satu nama per baris. Nama yang sudah ada tidak akan diduplikasi.
          </p>
          <textarea
            id="guest-names"
            rows={6}
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
            placeholder={
              "Contoh:\nBudi Santoso\nSiti Nurhaliza & Partner\nKeluarga Pak Ahmad"
            }
            className="w-full bg-[var(--bg-primary)] border border-[var(--border)] p-4 text-[0.9375rem] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] resize-y leading-relaxed font-body placeholder:text-[var(--text-tertiary)]"
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

          {rawInput.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              className="p-3 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] border border-[var(--border)] hover:border-[var(--accent)] transition-colors"
              title="Bersihkan kolom nama"
              aria-label="Bersihkan kolom nama"
            >
              <Eraser size={18} />
            </button>
          )}
        </div>
      </div>

      {notice && (
        <div
          role={notice.type === "error" ? "alert" : "status"}
          className={`flex items-start gap-2 px-4 py-3 font-body text-sm leading-snug ${
            notice.type === "error"
              ? "bg-red-50 text-red-700"
              : "bg-emerald-50 text-emerald-800"
          }`}
        >
          {notice.type === "error" ? (
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
          ) : (
            <Check size={16} className="shrink-0 mt-0.5" />
          )}
          <span>{notice.text}</span>
        </div>
      )}

      {/* Generated Links List */}
      {links.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
            <div className="min-w-0">
              <h2 className="font-display text-2xl leading-tight text-[var(--text-primary)]">
                Daftar Link
              </h2>
              <p className="font-body text-[13px] text-[var(--text-tertiary)] mt-0.5">
                {links.length} tamu
              </p>
            </div>
            <button
              type="button"
              onClick={handleCopyAll}
              className="inline-flex items-center gap-2 font-body text-[13px] font-medium text-[var(--accent)] hover:underline shrink-0"
            >
              {copiedAll ? (
                <>
                  <Check size={14} /> Tersalin semua
                </>
              ) : (
                <>
                  <Copy size={14} /> Salin semua
                </>
              )}
            </button>
          </div>

          <div className="space-y-4">
            {links.map((item) => {
              const link = viewStats[item.slug];
              const isExpanded = expandedSlug === item.slug;
              const isSaving = savingSlug === item.slug;
              const isConfirming = confirmDeleteSlug === item.slug;
              const isDeleting = deletingSlug === item.slug;

              return (
                <div
                  key={item.id}
                  className="bg-[var(--bg-elevated,#ffffff)] border border-[var(--border)] transition-all hover:border-[var(--accent-muted)]"
                >
                  <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1 min-w-0 flex-1">
                      <p className="font-display font-semibold text-xl sm:text-[1.375rem] leading-tight text-[var(--text-primary)] truncate flex items-center gap-1.5">
                        {link?.is_featured && (
                          <Star
                            size={14}
                            className="text-[var(--accent)] shrink-0"
                            fill="currentColor"
                          />
                        )}
                        {item.name}
                      </p>
                      <p className="font-body text-[13px] text-[var(--text-tertiary)] truncate flex items-center gap-1.5">
                        <LinkIcon size={12} className="shrink-0" />
                        <span className="truncate">{item.url}</span>
                      </p>
                      {link?.relation && (
                        <p className="font-body text-[13px] italic text-[var(--text-secondary)]">
                          {link.relation}
                        </p>
                      )}
                      {link?.first_viewed_at ? (
                        <p className="inline-flex items-center gap-1.5 text-xs font-medium font-body text-emerald-700 bg-emerald-100 px-2 py-1 mt-1">
                          <Eye size={11} />
                          Dibuka {formatDate(link.last_viewed_at ?? undefined)}
                          {link.view_count > 1 ? ` · ${link.view_count}x` : ""}
                        </p>
                      ) : (
                        <p className="inline-flex items-center gap-1.5 text-xs font-medium font-body text-[var(--text-tertiary)] bg-[var(--bg-secondary)] px-2 py-1 mt-1">
                          <Clock size={11} />
                          Belum dibuka
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0 flex-wrap">
                      <button
                        type="button"
                        onClick={() => handleTogglePersonalize(item.slug)}
                        className={`inline-flex items-center gap-1.5 px-3 py-2 text-[13px] font-medium font-body border transition-colors ${
                          isExpanded
                            ? "border-[var(--accent)] text-[var(--accent)]"
                            : "border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                        }`}
                        title="Tambah sentuhan personal (relasi, pesan khusus, tamu istimewa)"
                      >
                        <Star size={15} />
                        <span>Personalisasi</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCopySingle(item.id, item.url)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-[13px] font-medium font-body border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent)] transition-colors"
                        title="Copy URL"
                      >
                        {copiedId === item.id ? (
                          <>
                            <Check size={15} className="text-green-600" />
                            <span>Tersalin</span>
                          </>
                        ) : (
                          <>
                            <Copy size={15} />
                            <span>Salin</span>
                          </>
                        )}
                      </button>

                      <a
                        href={item.waLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-[13px] font-medium font-body bg-emerald-600 text-white hover:bg-emerald-700 transition-colors rounded-none"
                      >
                        <Send size={15} />
                        <span>Kirim WA</span>
                      </a>

                      <button
                        type="button"
                        onClick={() => {
                          setExpandedSlug(null);
                          setConfirmDeleteSlug(isConfirming ? null : item.slug);
                        }}
                        disabled={isDeleting}
                        className={`inline-flex items-center gap-1.5 px-3 py-2 text-[13px] font-medium font-body border transition-colors disabled:opacity-50 ${
                          isConfirming
                            ? "border-red-600/50 text-red-700 bg-red-50"
                            : "border-[var(--border)] text-[var(--text-secondary)] hover:text-red-700 hover:border-red-600/40"
                        }`}
                        title="Hapus link tamu ini"
                      >
                        <Trash2 size={15} />
                        <span>Hapus</span>
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-[var(--border-subtle)] p-4 sm:p-5 space-y-4 bg-[var(--bg-secondary)]">
                      <div>
                        <label className="block mb-1 font-body text-[13px] font-medium text-[var(--text-secondary)]">
                          Relasi{" "}
                          <span className="font-normal text-[var(--text-tertiary)]">
                            (opsional)
                          </span>
                        </label>
                        <input
                          type="text"
                          value={draft.relation}
                          onChange={(e) =>
                            setDraft((d) => ({
                              ...d,
                              relation: e.target.value,
                            }))
                          }
                          placeholder='mis. "Sahabat SMA", "Sepupu dari mempelai wanita"'
                          className="input-editorial"
                        />
                      </div>
                      <div>
                        <label className="block mb-1 font-body text-[13px] font-medium text-[var(--text-secondary)]">
                          Pesan personal{" "}
                          <span className="font-normal text-[var(--text-tertiary)]">
                            (opsional)
                          </span>
                        </label>
                        <textarea
                          value={draft.personal_note}
                          onChange={(e) =>
                            setDraft((d) => ({
                              ...d,
                              personal_note: e.target.value,
                            }))
                          }
                          rows={2}
                          placeholder="Pesan singkat khusus untuk tamu ini — akan tampil di halaman undangan mereka."
                          className="input-editorial resize-none"
                        />
                      </div>
                      <label className="flex items-center gap-2 text-[0.9375rem] font-body text-[var(--text-secondary)] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={draft.is_featured}
                          onChange={(e) =>
                            setDraft((d) => ({
                              ...d,
                              is_featured: e.target.checked,
                            }))
                          }
                          className="w-4 h-4 accent-[var(--accent)]"
                        />
                        Tandai sebagai tamu istimewa
                      </label>
                      <div className="flex items-center gap-3 pt-1">
                        <button
                          type="button"
                          onClick={() => handleSavePersonalize(item.slug)}
                          disabled={isSaving}
                          className="btn-editorial-filled px-5 py-2 disabled:opacity-50"
                        >
                          {isSaving ? "Menyimpan..." : "Simpan"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setExpandedSlug(null)}
                          className="text-[13px] font-medium font-body text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                        >
                          Batal
                        </button>
                      </div>
                    </div>
                  )}

                  {isConfirming && (
                    <div className="border-t border-red-600/20 bg-red-50 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <p className="font-body text-sm leading-snug text-red-800">
                        Hapus link{" "}
                        <strong className="font-semibold">{item.name}</strong>?
                        Statistik “dibuka” dan personalisasinya ikut terhapus.
                        Tindakan ini tidak bisa dibatalkan.
                      </p>
                      <div className="flex items-center gap-3 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleDelete(item)}
                          disabled={isDeleting}
                          className="inline-flex items-center gap-1.5 px-4 py-2 text-[13px] font-medium font-body bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-60"
                        >
                          {isDeleting ? (
                            <Loader2 size={15} className="animate-spin" />
                          ) : (
                            <Trash2 size={15} />
                          )}
                          {isDeleting ? "Menghapus..." : "Ya, hapus"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteSlug(null)}
                          disabled={isDeleting}
                          className="text-[13px] font-medium font-body text-red-800/70 hover:text-red-900 transition-colors disabled:opacity-50"
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
