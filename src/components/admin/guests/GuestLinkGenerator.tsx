"use client";

import { useState, useEffect, useCallback, useMemo, startTransition } from "react";
import {
  Copy,
  Check,
  Send,
  Trash2,
  Eraser,
  Loader2,
  Pencil,
  MessageCircle,
  RotateCcw,
  Star,
  AlertCircle,
} from "lucide-react";
import { invitation } from "@/src/data/invitation";
import {
  fetchGuestLinks,
  upsertGuestLinks,
  updateGuestLinkDetails,
  deleteGuestLink,
  setGuestCategory,
  type GuestLinkRecord,
} from "@/src/lib/guest-link-service";
import {
  DEFAULT_GUEST_CATEGORY,
  GUEST_CATEGORIES,
  GUEST_CATEGORY_LABELS,
  toGuestCategory,
  type GuestCategory,
} from "@/src/lib/guest-category";
import { formatDate } from "../shared/formatDate";
import type { GeneratedLink } from "../types";
import { buildGuestSegment } from "@/src/lib/guest-token";
import { adminFetch } from "@/src/lib/admin-fetch";
import { normalizeIdPhone } from "@/src/lib/phone";

interface WaRow {
  slug: string;
  phone: string;
  wa_message: string;
  status: "pending" | "sending" | "sent" | "failed";
  error: string | null;
  message: string;
}

const WA_STATUS: Record<WaRow["status"], string> = {
  pending: "Belum dikirim",
  sending: "Mengirim…",
  sent: "Terkirim",
  failed: "Gagal",
};
const BATCH = 25;

export function GuestLinkGenerator() {
  const [rawInput, setRawInput] = useState("");
  // Category applied to NEWLY generated links; existing links keep theirs.
  const [newCategory, setNewCategory] = useState<GuestCategory>(DEFAULT_GUEST_CATEGORY);
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
    category: GuestCategory;
  }>({ relation: "", personal_note: "", is_featured: false, category: DEFAULT_GUEST_CATEGORY });
  const [savingSlug, setSavingSlug] = useState<string | null>(null);
  const [notice, setNotice] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);
  const [confirmDeleteSlug, setConfirmDeleteSlug] = useState<string | null>(
    null,
  );
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);

  // WhatsApp state (phone numbers, send status, per-guest message)
  const [waRows, setWaRows] = useState<WaRow[]>([]);
  const [configured, setConfigured] = useState(false);
  const [mode, setMode] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [edits, setEdits] = useState<Record<string, { phone?: string; msg?: string }>>({});
  const [importText, setImportText] = useState("");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);

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
          // Link carries the secret token so restricted events can't be unlocked by guessing the name.
          const url = `${baseUrl || invitation.meta.url}/${buildGuestSegment(record.slug, record.access_token)}`;
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
    } catch (err) {
      // Without the saved records the links below lack their secret token, so say so.
      setNotice({
        type: "error",
        text:
          (err instanceof Error ? err.message : "Gagal memuat daftar link.") +
          " Link yang tampil mungkin belum berisi token — muat ulang sebelum membagikan.",
      });
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

    // Two different guests with the same name would collapse into ONE link
    // (slug = name) and share its category. Block when a name already exists
    // under another category; same category = re-copying the same guest's link.
    const clashes = names.filter((n) => {
      const existing = viewStats[encodeURIComponent(n)];
      return existing && toGuestCategory(existing.category) !== newCategory;
    });
    if (clashes.length > 0) {
      setNotice({
        type: "error",
        text: `Nama sudah terdaftar dengan kategori lain: ${clashes.join(", ")}. Jika ini tamu berbeda, beri pembeda pada namanya (mis. “${clashes[0]} (Wonogiri)”) agar punya link sendiri.`,
      });
      return;
    }

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
      // New guests default to Kudus in the DB; apply the chosen category (server-side).
      if (saved.success && newCategory !== DEFAULT_GUEST_CATEGORY) {
        const freshSlugs = generated.map((g) => g.slug).filter((slug) => !viewStats[slug]);
        try {
          await setGuestCategory(freshSlugs, newCategory);
        } catch (err) {
          setNotice({
            type: "error",
            text:
              err instanceof Error
                ? `Link dibuat, tapi kategori gagal diatur: ${err.message}`
                : "Link dibuat, tapi kategori gagal diatur.",
          });
        }
      }
      await refreshViewStats();
      await loadWa();
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
      setWaRows((prev) => prev.filter((r) => r.slug !== item.slug));
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
      category: toGuestCategory(existing?.category),
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
      if (draft.category !== toGuestCategory(viewStats[slug]?.category)) {
        await setGuestCategory([slug], draft.category);
      }
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

  const loadWa = useCallback(async () => {
    try {
      const j = await adminFetch<{ configured: boolean; mode: string | null; guests: WaRow[] }>(
        "/api/admin/wa",
        "GET"
      );
      setWaRows(j.guests);
      setConfigured(j.configured);
      setMode(j.mode);
    } catch (e) {
      setNotice({ type: "error", text: e instanceof Error ? e.message : "Gagal memuat data WhatsApp." });
    }
  }, []);

  useEffect(() => {
    startTransition(() => {
      void loadWa();
    });
  }, [loadWa]);

  const waBySlug = useMemo(() => new Map(waRows.map((r) => [r.slug, r])), [waRows]);
  const pendingSlugs = useMemo(
    () => waRows.filter((r) => r.phone && (r.status === "pending" || r.status === "failed")).map((r) => r.slug),
    [waRows]
  );

  const putContact = async (
    slug: string,
    body: { phone?: string; wa_message?: string },
    failText: string
  ) => {
    const j = await adminFetch<{ results: { ok: boolean; error?: string }[] }>("/api/admin/wa", "PUT", {
      contacts: [{ slug, ...body }],
    });
    if (!j.results[0]?.ok) throw new Error(j.results[0]?.error ?? failText);
  };

  const savePhone = async (slug: string) => {
    const draft = edits[slug]?.phone;
    if (draft === undefined || draft === (waBySlug.get(slug)?.phone ?? "")) return;
    try {
      await putContact(slug, { phone: draft }, "Gagal menyimpan nomor.");
      setEdits((e) => ({ ...e, [slug]: { ...e[slug], phone: undefined } }));
      await loadWa();
    } catch (e) {
      setNotice({ type: "error", text: e instanceof Error ? e.message : "Gagal menyimpan nomor." });
    }
  };

  const saveMessage = async (slug: string, value?: string) => {
    const draft = value ?? edits[slug]?.msg;
    if (draft === undefined) return;
    try {
      await putContact(slug, { wa_message: draft }, "Gagal menyimpan pesan.");
      setEdits((e) => ({ ...e, [slug]: { ...e[slug], msg: undefined } }));
      await loadWa();
    } catch (e) {
      setNotice({ type: "error", text: e instanceof Error ? e.message : "Gagal menyimpan pesan." });
    }
  };

  /** "Nama, 0812…" per line → matched to existing guests by name (case-insensitive). */
  const handleImport = async () => {
    const byName = new Map(links.map((l) => [l.name.trim().toLowerCase(), l.slug]));
    const contacts: { slug: string; phone: string }[] = [];
    const unmatched: string[] = [];
    for (const line of importText.split("\n")) {
      const t = line.trim();
      if (!t) continue;
      const m = t.match(/^(.*?)[\s,;\t|]+([+\d][\d\s\-+().]{7,})$/);
      const slug = m ? byName.get(m[1].trim().toLowerCase()) : undefined;
      if (!m || !slug) unmatched.push(t);
      else contacts.push({ slug, phone: m[2] });
    }
    if (contacts.length === 0) {
      setNotice({ type: "error", text: "Tidak ada baris yang cocok. Format: Nama, 08123456789 (nama harus sama dengan nama tamu)." });
      return;
    }
    setBusy(true);
    try {
      const j = await adminFetch<{ results: { slug: string; ok: boolean; error?: string }[] }>("/api/admin/wa", "PUT", { contacts });
      const bad = j.results.filter((x) => !x.ok);
      setNotice({
        type: bad.length || unmatched.length ? "error" : "success",
        text:
          `${j.results.length - bad.length} nomor disimpan.` +
          (bad.length ? ` Ditolak: ${bad.map((b) => b.error).join("; ")}.` : "") +
          (unmatched.length ? ` Tidak cocok: ${unmatched.join(" | ")}.` : ""),
      });
      if (!bad.length && !unmatched.length) setImportText("");
      await loadWa();
    } catch (e) {
      setNotice({ type: "error", text: e instanceof Error ? e.message : "Impor gagal." });
    } finally {
      setBusy(false);
    }
  };

  const sendMany = async (slugs: string[]) => {
    if (slugs.length === 0 || busy) return;
    if (!window.confirm(`Kirim WhatsApp ke ${slugs.length} tamu sekarang?`)) return;
    setBusy(true);
    setNotice(null);
    let sent = 0;
    let failed = 0;
    try {
      for (let i = 0; i < slugs.length; i += BATCH) {
        setProgress(`Mengirim ${Math.min(i + BATCH, slugs.length)} / ${slugs.length}…`);
        const j = await adminFetch<{ sent: number; failed: number }>("/api/admin/wa", "POST", {
          action: "send",
          slugs: slugs.slice(i, i + BATCH),
        });
        sent += j.sent;
        failed += j.failed;
      }
      setNotice({
        type: failed ? "error" : "success",
        text: `${sent} terkirim${failed ? `, ${failed} gagal (lihat status tamu, lalu kirim ulang)` : ""}.`,
      });
    } catch (e) {
      setNotice({ type: "error", text: e instanceof Error ? e.message : "Pengiriman gagal." });
    } finally {
      setProgress(null);
      setBusy(false);
      setSelected(new Set());
      await loadWa();
    }
  };

  const mark = async (slug: string, action: "mark-sent" | "reset") => {
    try {
      await adminFetch("/api/admin/wa", "POST", { action, slugs: [slug] });
      await loadWa();
    } catch (e) {
      setNotice({ type: "error", text: e instanceof Error ? e.message : "Gagal memperbarui status." });
    }
  };

  const toggleSelected = (slug: string) =>
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(slug)) n.delete(slug);
      else n.add(slug);
      return n;
    });

  const count = rawInput.split("\n").filter((n) => n.trim()).length;
  const iconBtn =
    "p-2 text-[var(--text-tertiary)] border border-[var(--border)] hover:text-[var(--text-primary)] hover:border-[var(--accent)] transition-colors disabled:opacity-50";
  const smallBtn =
    "inline-flex items-center gap-1.5 px-3 py-2 text-[13px] font-medium font-body border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent)] transition-colors";

  return (
    <div className="space-y-8">
      {/* Input */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border)] p-5 sm:p-6 space-y-4">
        <div>
          <label
            htmlFor="guest-names"
            className="block font-body text-sm font-medium text-[var(--text-primary)] mb-2"
          >
            Nama tamu{" "}
            <span className="font-normal text-[var(--text-tertiary)]">
              · satu nama per baris
            </span>
          </label>
          <textarea
            id="guest-names"
            rows={4}
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
            placeholder={"Budi Santoso\nSiti Nurhaliza & Partner\nKeluarga Pak Ahmad"}
            className="w-full bg-[var(--bg-primary)] border border-[var(--border)] p-3 text-[0.9375rem] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] resize-y leading-relaxed font-body placeholder:text-[var(--text-tertiary)]"
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end gap-3">
          <div className="sm:w-56">
            <label
              htmlFor="guest-category"
              className="block font-body text-[13px] text-[var(--text-secondary)] mb-1"
            >
              Kategori untuk link baru
            </label>
            <select
              id="guest-category"
              value={newCategory}
              onChange={(e) => setNewCategory(toGuestCategory(e.target.value))}
              className="input-editorial"
            >
              {GUEST_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {GUEST_CATEGORY_LABELS[c]}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 flex-1">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={!rawInput.trim() || isSyncing}
              className="btn-editorial-filled flex-1"
            >
              {isSyncing ? "Menyimpan..." : `Buat Link${count ? ` (${count})` : ""}`}
            </button>
            {rawInput.length > 0 && (
              <button
                type="button"
                onClick={handleClear}
                className={iconBtn}
                title="Bersihkan kolom nama"
                aria-label="Bersihkan kolom nama"
              >
                <Eraser size={16} />
              </button>
            )}
          </div>
        </div>

        <p className="font-body text-xs leading-snug text-[var(--text-tertiary)]">
          Tamu Wonogiri melihat Akad &amp; Resepsi + Ngunduh Mantu, tamu Kudus hanya Akad &amp; Resepsi. Tamu bernama sama perlu pembeda, mis. “Budi (Wonogiri)”.
        </p>
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

      {/* Unified guest list */}
      {links.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-baseline justify-between gap-4 border-b border-[var(--border)] pb-3">
            <h2 className="font-display text-xl text-[var(--text-primary)]">
              Daftar Tamu{" "}
              <span className="font-body text-[13px] text-[var(--text-tertiary)]">
                · {links.length} tamu
              </span>
            </h2>
            <button
              type="button"
              onClick={handleCopyAll}
              className="inline-flex items-center gap-1.5 font-body text-[13px] font-medium text-[var(--accent)] hover:underline shrink-0"
            >
              {copiedAll ? <Check size={14} /> : <Copy size={14} />}
              {copiedAll ? "Tersalin" : "Salin semua"}
            </button>
          </div>

          <details className="border border-[var(--border)] px-4 py-3 bg-[var(--bg-secondary)]">
            <summary className="cursor-pointer font-body text-sm font-medium text-[var(--text-primary)]">
              Kirim massal &amp; impor nomor
            </summary>
            <div className="space-y-4 mt-3">
              <p
                className={`px-3 py-2 font-body text-[13px] leading-snug ${
                  configured ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"
                }`}
              >
                {configured
                  ? `Pengiriman otomatis aktif (mode ${mode}). Centang tamu di daftar, lalu kirim.`
                  : "Pengiriman otomatis belum aktif (env WHATSAPP_* belum diisi). Gunakan tombol WA per tamu untuk kirim manual."}
              </p>

              <div>
                <p className="font-body text-[13px] text-[var(--text-tertiary)] mb-2">
                  Impor nomor: satu tamu per baris, <code>Nama, 08123456789</code> (nama harus sama).
                </p>
                <textarea
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  rows={3}
                  className="input-editorial w-full"
                  placeholder={"Budi Santoso, 0812-3456-7890\nSiti Aminah, +62 813 1111 2222"}
                />
                <button
                  type="button"
                  onClick={handleImport}
                  disabled={busy || !importText.trim()}
                  className="btn-editorial mt-3 disabled:opacity-50"
                >
                  Simpan nomor
                </button>
              </div>

              {configured && (
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    disabled={busy || selected.size === 0}
                    onClick={() => sendMany([...selected])}
                    className={`${smallBtn} disabled:opacity-50`}
                  >
                    <Send size={14} /> Kirim terpilih ({selected.size})
                  </button>
                  <button
                    type="button"
                    disabled={busy || pendingSlugs.length === 0}
                    onClick={() => sendMany(pendingSlugs)}
                    className={`${smallBtn} disabled:opacity-50`}
                  >
                    Kirim semua yang belum ({pendingSlugs.length})
                  </button>
                  {busy && (
                    <span className="inline-flex items-center gap-2 font-body text-sm text-[var(--text-secondary)]">
                      <Loader2 size={16} className="animate-spin" /> {progress ?? "Memproses…"}
                    </span>
                  )}
                </div>
              )}
            </div>
          </details>

          <div className="divide-y divide-[var(--border-subtle)] border border-[var(--border)] bg-[var(--bg-elevated,#ffffff)]">
            {links.map((item) => {
              const link = viewStats[item.slug];
              const wa = waBySlug.get(item.slug);
              const isExpanded = expandedSlug === item.slug;
              const isSaving = savingSlug === item.slug;
              const isConfirming = confirmDeleteSlug === item.slug;
              const isDeleting = deletingSlug === item.slug;
              const opened = !!link?.first_viewed_at;
              const phoneDraft = edits[item.slug]?.phone ?? wa?.phone ?? "";
              const msgDraft = edits[item.slug]?.msg;
              const waHref = wa?.phone
                ? `https://wa.me/${wa.phone}?text=${encodeURIComponent(wa.message)}`
                : item.waLink;

              const meta = [
                link ? GUEST_CATEGORY_LABELS[toGuestCategory(link.category)] : null,
                link?.relation || null,
                wa?.phone ? wa.phone : null,
              ].filter(Boolean);

              return (
                <div key={item.id}>
                  <div className="px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      {configured && (
                        <input
                          type="checkbox"
                          aria-label={`Pilih ${item.name}`}
                          checked={selected.has(item.slug)}
                          disabled={!wa?.phone || wa.status === "sending"}
                          onChange={() => toggleSelected(item.slug)}
                          className="mt-1.5 w-4 h-4 accent-[var(--accent)]"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-display text-lg leading-tight text-[var(--text-primary)] truncate flex items-center gap-1.5">
                          {link?.is_featured && (
                            <Star
                              size={13}
                              className="text-[var(--accent)] shrink-0"
                              fill="currentColor"
                            />
                          )}
                          <span className="truncate" title={item.url}>
                            {item.name}
                          </span>
                        </p>
                        <p className="font-body text-xs text-[var(--text-tertiary)] mt-0.5 flex items-center gap-x-3 gap-y-0.5 flex-wrap">
                          {meta.length > 0 && <span>{meta.join(" · ")}</span>}
                          <span
                            className={`inline-flex items-center gap-1 ${
                              opened ? "text-[var(--accent)]" : ""
                            }`}
                          >
                            <span
                              className={`inline-block w-1.5 h-1.5 rounded-full ${
                                opened ? "bg-[var(--accent)]" : "bg-[var(--border)]"
                              }`}
                            />
                            {opened
                              ? `Dibuka ${formatDate(link.last_viewed_at ?? undefined)}${
                                  link.view_count > 1 ? ` · ${link.view_count}x` : ""
                                }`
                              : "Belum dibuka"}
                          </span>
                          {wa && (
                            <span
                              className={
                                wa.status === "sent"
                                  ? "text-[var(--accent)]"
                                  : wa.status === "failed"
                                    ? "text-red-700"
                                    : ""
                              }
                              title={wa.error ?? undefined}
                            >
                              WA: {WA_STATUS[wa.status]}
                              {wa.status === "failed" && wa.error ? ` — ${wa.error}` : ""}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleCopySingle(item.id, item.url)}
                        className={smallBtn}
                        title="Salin link"
                      >
                        {copiedId === item.id ? <Check size={14} /> : <Copy size={14} />}
                        {copiedId === item.id ? "Tersalin" : "Salin"}
                      </button>
                      <a
                        href={waHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${smallBtn} !text-[var(--accent)] !border-[var(--accent)]`}
                        title={wa?.phone ? "Buka WhatsApp ke nomor tamu" : "Buka WhatsApp (pilih kontak)"}
                      >
                        <MessageCircle size={14} />
                        WA
                      </a>
                      <button
                        type="button"
                        onClick={() => handleTogglePersonalize(item.slug)}
                        className={`${iconBtn} ${
                          isExpanded ? "!text-[var(--accent)] !border-[var(--accent)]" : ""
                        }`}
                        title="Detail: nomor, personalisasi, pesan WA"
                        aria-label="Detail tamu"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setExpandedSlug(null);
                          setConfirmDeleteSlug(isConfirming ? null : item.slug);
                        }}
                        disabled={isDeleting}
                        className={`${iconBtn} hover:!text-red-700 hover:!border-red-600/40`}
                        title="Hapus link"
                        aria-label="Hapus link"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-[var(--border-subtle)] p-4 space-y-3 bg-[var(--bg-secondary)]">
                      <div className="grid sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block mb-1 font-body text-[13px] text-[var(--text-secondary)]">
                            Nomor WhatsApp
                          </label>
                          <input
                            type="tel"
                            inputMode="tel"
                            value={phoneDraft}
                            placeholder="08xxxxxxxxxx"
                            onChange={(e) =>
                              setEdits((s) => ({ ...s, [item.slug]: { ...s[item.slug], phone: e.target.value } }))
                            }
                            onBlur={() => savePhone(item.slug)}
                            className="input-editorial"
                          />
                          {phoneDraft && !normalizeIdPhone(phoneDraft) && (
                            <span className="font-body text-xs text-red-700">Nomor tidak valid</span>
                          )}
                        </div>
                        <div>
                          <label className="block mb-1 font-body text-[13px] text-[var(--text-secondary)]">
                            Relasi
                          </label>
                          <input
                            type="text"
                            value={draft.relation}
                            onChange={(e) =>
                              setDraft((d) => ({ ...d, relation: e.target.value }))
                            }
                            placeholder='mis. "Sahabat SMA"'
                            className="input-editorial"
                          />
                        </div>
                        <div>
                          <label className="block mb-1 font-body text-[13px] text-[var(--text-secondary)]">
                            Kategori
                          </label>
                          <select
                            value={draft.category}
                            onChange={(e) =>
                              setDraft((d) => ({
                                ...d,
                                category: toGuestCategory(e.target.value),
                              }))
                            }
                            className="input-editorial"
                          >
                            {GUEST_CATEGORIES.map((c) => (
                              <option key={c} value={c}>
                                {GUEST_CATEGORY_LABELS[c]}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block mb-1 font-body text-[13px] text-[var(--text-secondary)]">
                          Pesan personal (tampil di halaman undangan)
                        </label>
                        <textarea
                          value={draft.personal_note}
                          onChange={(e) =>
                            setDraft((d) => ({ ...d, personal_note: e.target.value }))
                          }
                          rows={2}
                          placeholder="Pesan singkat khusus untuk tamu ini."
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
                        Tamu istimewa
                      </label>
                      <div className="flex items-center gap-4 pt-1">
                        <button
                          type="button"
                          onClick={() => handleSavePersonalize(item.slug)}
                          disabled={isSaving}
                          className="btn-editorial-filled !w-auto !inline-block !px-6 !py-2.5"
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

                      {wa && (
                        <details className="border-t border-[var(--border-subtle)] pt-3">
                          <summary className="cursor-pointer font-body text-[13px] text-[var(--text-secondary)]">
                            Pesan WhatsApp &amp; status kirim
                          </summary>
                          <p className="font-body text-xs text-[var(--text-tertiary)] mt-2">
                            Placeholder: {"{nama} {link} {acara} {catatan} {pengantin}"}
                          </p>
                          <textarea
                            value={msgDraft ?? (wa.wa_message || wa.message)}
                            onChange={(e) =>
                              setEdits((s) => ({ ...s, [item.slug]: { ...s[item.slug], msg: e.target.value } }))
                            }
                            rows={9}
                            className="input-editorial w-full mt-2 font-mono text-[13px]"
                          />
                          <div className="flex flex-wrap items-center gap-4 mt-2">
                            <button
                              type="button"
                              className="btn-editorial disabled:opacity-50"
                              disabled={msgDraft === undefined}
                              onClick={() => saveMessage(item.slug)}
                            >
                              Simpan pesan
                            </button>
                            {(wa.wa_message || msgDraft !== undefined) && (
                              <button
                                type="button"
                                className="btn-editorial"
                                onClick={async () => {
                                  try {
                                    await saveMessage(item.slug, "");
                                  } catch {
                                    /* notice already set in saveMessage */
                                  }
                                }}
                              >
                                Pesan standar
                              </button>
                            )}
                            {wa.phone &&
                              (wa.status !== "sent" ? (
                                <button type="button" className="btn-editorial" onClick={() => mark(item.slug, "mark-sent")}>
                                  Tandai terkirim
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  className="btn-editorial inline-flex items-center gap-1.5"
                                  onClick={() => mark(item.slug, "reset")}
                                >
                                  <RotateCcw size={13} /> Reset status
                                </button>
                              ))}
                          </div>
                        </details>
                      )}
                    </div>
                  )}

                  {isConfirming && (
                    <div className="border-t border-red-600/20 bg-red-50 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <p className="font-body text-sm leading-snug text-red-800">
                        Hapus <strong className="font-semibold">{item.name}</strong>?
                        Statistik dan personalisasinya ikut terhapus.
                      </p>
                      <div className="flex items-center gap-3 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleDelete(item)}
                          disabled={isDeleting}
                          className="inline-flex items-center gap-1.5 px-4 py-2 text-[13px] font-medium font-body bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-60"
                        >
                          {isDeleting ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Trash2 size={14} />
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