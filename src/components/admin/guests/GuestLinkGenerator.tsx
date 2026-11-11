"use client";

import { useState, useEffect, useCallback, useMemo, startTransition, type ReactNode } from "react";
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
  ChevronDown,
  Search,
} from "lucide-react";
import { invitation } from "@/src/data/invitation";
import {
  fetchGuestLinks,
  upsertGuestLinks,
  updateGuestLinkDetails,
  deleteGuestLink,
  setGuestCategory,
  setGuestSide,
  type GuestLinkRecord,
} from "@/src/lib/guest-link-service";
import {
  DEFAULT_GUEST_CATEGORY,
  GUEST_CATEGORIES,
  GUEST_CATEGORY_LABELS,
  toGuestCategory,
  type GuestCategory,
} from "@/src/lib/guest-category";
import {
  GUEST_SIDES,
  GUEST_SIDE_LABELS,
  UNSET_SIDE_LABEL,
  toGuestSide,
  type GuestSide,
} from "@/src/lib/guest-side";
import {
  EMPTY_FILTERS,
  WA_KEY_LABELS,
  buildFacets,
  groupGuests,
  hasActiveFilters,
  matchesFilters,
  type GroupBy,
  type GuestFilters,
  type WaKey,
} from "./guest-grouping";
import { formatDate } from "../shared/formatDate";
import type { GeneratedLink, WaGuestRow } from "@/src/types/guest";
import { buildGuestSegment } from "@/src/lib/guest-token";
import { adminFetch } from "@/src/lib/admin-fetch";
import { normalizeIdPhone } from "@/src/lib/phone";
import { parseGuestLines } from "@/src/lib/guest-input";
import { getErrorMessage } from "@/src/lib/errors";

type WaRow = WaGuestRow;

function Chip({
  active,
  onClick,
  count,
  children,
}: {
  active: boolean;
  onClick: () => void;
  count?: number;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`px-3 py-1.5 text-xs font-body border transition-colors ${
        active
          ? "border-[var(--accent)] text-[var(--text-primary)] bg-[var(--bg-secondary)]"
          : "border-[var(--border)] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
      }`}
    >
      {children}
      {count !== undefined && <span className="ml-1.5 text-[var(--text-tertiary)]">{count}</span>}
    </button>
  );
}

const BADGE_TONES = {
  ok: "bg-emerald-100 text-emerald-700",
  warn: "bg-amber-100 text-amber-700",
  bad: "bg-red-100 text-red-700",
  accent: "bg-[var(--bg-secondary)] text-[var(--accent)]",
  muted: "bg-[var(--bg-secondary)] text-[var(--text-tertiary)]",
} as const;

function Badge({ tone, children }: { tone: keyof typeof BADGE_TONES; children: ReactNode }) {
  return (
    <span
      className={`inline-block px-2 py-0.5 text-[10px] uppercase tracking-wider font-body whitespace-nowrap ${BADGE_TONES[tone]}`}
    >
      {children}
    </span>
  );
}

export function GuestLinkGenerator() {
  const [rawInput, setRawInput] = useState("");
  // Category applied to NEWLY generated links; existing links keep theirs.
  const [newCategory, setNewCategory] = useState<GuestCategory>(DEFAULT_GUEST_CATEGORY);
  const [newSide, setNewSide] = useState<GuestSide | null>(null);
  const [filters, setFilters] = useState<GuestFilters>(EMPTY_FILTERS);
  const [groupBy, setGroupBy] = useState<GroupBy>("side");
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
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
    side: GuestSide | null;
  }>({ relation: "", personal_note: "", is_featured: false, category: DEFAULT_GUEST_CATEGORY, side: null });
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
  // Tamu per permintaan kirim; dari server, karena gateway perlu batch kecil.
  const [batchSize, setBatchSize] = useState(25);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [edits, setEdits] = useState<Record<string, { phone?: string; msg?: string }>>({});
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
          getErrorMessage(err, "Gagal memuat daftar link.") +
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
    const { guests: parsed, invalid } = parseGuestLines(rawInput);
    if (invalid.length > 0) {
      setNotice({
        type: "error",
        text: `Baris ini belum bisa dibaca (format: Nama, 08123456789): ${invalid.join(" | ")}`,
      });
      return;
    }
    const names = parsed.map((g) => g.name);

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
      // Tamu baru: kategori default Kudus & pihak kosong di DB; terapkan pilihan admin (server-side).
      const freshSlugs = generated.map((g) => g.slug).filter((slug) => !viewStats[slug]);
      if (saved.success && newCategory !== DEFAULT_GUEST_CATEGORY) {
        try {
          await setGuestCategory(freshSlugs, newCategory);
        } catch (err) {
          setNotice({
            type: "error",
            text: `Link dibuat, tapi kategori gagal diatur: ${getErrorMessage(err, "gagal")}`,
          });
        }
      }
      if (saved.success && newSide) {
        try {
          await setGuestSide(freshSlugs, newSide);
        } catch (err) {
          setNotice({
            type: "error",
            text: `Link dibuat, tapi pihak gagal diatur: ${getErrorMessage(err, "gagal")}`,
          });
        }
      }
      // Nomor WhatsApp dari baris "nama, nomor". Nomor yang sama dengan yang sudah
      // tersimpan dilewati, supaya status "terkirim" tamu itu tidak ter-reset.
      const savedPhones = new Map(waRows.map((r) => [r.slug, r.phone]));
      const contacts = parsed
        .filter((g) => g.phone && g.phone !== savedPhones.get(encodeURIComponent(g.name)))
        .map((g) => ({ slug: encodeURIComponent(g.name), phone: g.phone as string }));
      if (saved.success && contacts.length > 0) {
        try {
          const j = await adminFetch<{ results: { slug: string; ok: boolean; error?: string }[] }>(
            "/api/admin/wa",
            "PUT",
            { contacts },
          );
          const bad = j.results.filter((r) => !r.ok);
          setNotice(
            bad.length
              ? {
                  type: "error",
                  text: `Link dibuat, tapi ${bad.length} nomor gagal disimpan: ${bad.map((b) => b.error).join("; ")}.`,
                }
              : {
                  type: "success",
                  text: `${names.length} link dibuat, ${contacts.length} nomor WhatsApp tersimpan.`,
                },
          );
        } catch (err) {
          setNotice({
            type: "error",
            text: `Link dibuat, tapi nomor gagal disimpan: ${getErrorMessage(err, "kesalahan tidak diketahui")}.`,
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
    if (filteredLinks.length === 0) return;
    const text = filteredLinks.map((l) => `${l.name}: ${l.url}`).join("\n");
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
        text: getErrorMessage(err, "Gagal menghapus link."),
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
      side: toGuestSide(existing?.side),
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
      if (draft.side !== toGuestSide(viewStats[slug]?.side)) {
        await setGuestSide([slug], draft.side);
      }
      await refreshViewStats();
      setExpandedSlug(null);
    } catch (err) {
      // Keep the panel open so the admin can retry, and say why it failed.
      setNotice({
        type: "error",
        text:
          getErrorMessage(err, "Gagal menyimpan personalisasi."),
      });
    } finally {
      setSavingSlug(null);
    }
  };

  const loadWa = useCallback(async () => {
    try {
      const j = await adminFetch<{ configured: boolean; mode: string | null; batch?: number; guests: WaRow[] }>(
        "/api/admin/wa",
        "GET"
      );
      setWaRows(j.guests);
      setConfigured(j.configured);
      if (j.batch) setBatchSize(j.batch);
    } catch (e) {
      setNotice({ type: "error", text: getErrorMessage(e, "Gagal memuat data WhatsApp.") });
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

  // Derived on each render. React Compiler is not enabled (see next.config).
  const facetsOf = (item: GeneratedLink) =>
    buildFacets(viewStats[item.slug], waBySlug.get(item.slug));
  const filteredLinks = links
    .filter((l) => matchesFilters(l.name, facetsOf(l), filters))
    .sort((a, b) => a.name.localeCompare(b.name, "id"));
  const groups = groupGuests(filteredLinks, facetsOf, groupBy);
  const counts = {
    side: { groom: 0, bride: 0, unset: 0 },
    category: { kudus: 0, wonogiri: 0 } as Record<GuestCategory, number>,
    wa: { pending: 0, sending: 0, sent: 0, failed: 0, nophone: 0 } as Record<WaKey, number>,
    opened: 0,
    unopened: 0,
  };
  for (const l of links) {
    const f = facetsOf(l);
    counts.side[f.side ?? "unset"]++;
    counts.category[f.category]++;
    counts.wa[f.wa]++;
    if (f.opened) counts.opened++;
    else counts.unopened++;
  }
  const activeFilterCount =
    (filters.side !== "all" ? 1 : 0) +
    (filters.category !== "all" ? 1 : 0) +
    (filters.wa !== "all" ? 1 : 0) +
    (filters.opened !== "all" ? 1 : 0);
  const patchFilters = (patch: Partial<GuestFilters>) => setFilters((f) => ({ ...f, ...patch }));
  // Hanya tamu terpilih yang punya nomor yang bisa dikirimi WhatsApp.
  const sendableSelected = useMemo(
    () => [...selected].filter((sl) => !!waBySlug.get(sl)?.phone),
    [selected, waBySlug],
  );

  const toggleCollapsed = (key: string) =>
    setCollapsed((c) => {
      const n = new Set(c);
      if (n.has(key)) n.delete(key);
      else n.add(key);
      return n;
    });

  const toggleGroupSelected = (slugs: string[], allSelected: boolean) =>
    setSelected((s) => {
      const n = new Set(s);
      for (const sl of slugs) {
        if (allSelected) n.delete(sl);
        else if (waBySlug.get(sl)?.status !== "sending") n.add(sl);
      }
      return n;
    });

  const [bulkBusy, setBulkBusy] = useState(false);
  const bulkApply = async (change: { side?: GuestSide | null; category?: GuestCategory }) => {
    const slugs = [...selected];
    if (slugs.length === 0 || bulkBusy) return;
    setBulkBusy(true);
    setNotice(null);
    try {
      if (change.side !== undefined) await setGuestSide(slugs, change.side);
      if (change.category !== undefined) await setGuestCategory(slugs, change.category);
      await refreshViewStats();
      setSelected(new Set());
      setNotice({ type: "success", text: `${slugs.length} tamu diperbarui.` });
    } catch (e) {
      setNotice({ type: "error", text: getErrorMessage(e, "Gagal memperbarui tamu.") });
    } finally {
      setBulkBusy(false);
    }
  };

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
      setNotice({ type: "error", text: getErrorMessage(e, "Gagal menyimpan nomor.") });
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
      setNotice({ type: "error", text: getErrorMessage(e, "Gagal menyimpan pesan.") });
    }
  };

  const sendMany = async (slugs: string[]) => {
    if (slugs.length === 0 || busy) return;
    if (!window.confirm(`Kirim WhatsApp ke ${slugs.length} tamu sekarang?`)) return;
    setBusy(true);
    setNotice(null);
    let sent = 0;
    let failed = 0;
    let skipped = 0;
    let stopped = false;
    const reasons: string[] = [];
    try {
      for (let i = 0; i < slugs.length; i += batchSize) {
        const chunk = slugs.slice(i, i + batchSize);
        setProgress(`Mengirim ${Math.min(i + batchSize, slugs.length)} / ${slugs.length}…`);
        const j = await adminFetch<{
          sent: number;
          failed: number;
          skipped?: number;
          results?: { slug: string; status: string; error?: string }[];
        }>("/api/admin/wa", "POST", {
          action: "send",
          slugs: chunk,
        });
        sent += j.sent;
        failed += j.failed;
        skipped += j.skipped ?? 0;
        for (const r of j.results ?? []) {
          if (r.status !== "skipped" || !r.error) continue;
          const nm = links.find((l) => l.slug === r.slug)?.name ?? decodeURIComponent(r.slug);
          reasons.push(`${nm}: ${r.error}`);
        }
        // Satu batch gagal semua biasanya berarti token/sesi bermasalah: berhenti, jangan lanjut menghajar gateway.
        if (chunk.length >= 3 && j.failed === chunk.length) {
          stopped = true;
          skipped += slugs.length - i - chunk.length;
          break;
        }
      }
      setNotice({
        type: failed || stopped ? "error" : "success",
        text:
          `${sent} terkirim` +
          (failed ? `, ${failed} gagal (lihat status tamu, lalu kirim ulang)` : "") +
          (skipped
            ? `, ${skipped} dilewati` + (reasons.length ? ` — ${reasons.slice(0, 3).join("; ")}` : " (tekan kirim lagi untuk melanjutkan)")
            : "") +
          (stopped ? ". Pengiriman dihentikan karena satu batch gagal semua — periksa token/sesi provider." : "."),
      });
    } catch (e) {
      setNotice({ type: "error", text: getErrorMessage(e, "Pengiriman gagal.") });
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
      setNotice({ type: "error", text: getErrorMessage(e, "Gagal memperbarui status.") });
    }
  };

  const toggleSelected = (slug: string) =>
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(slug)) n.delete(slug);
      else n.add(slug);
      return n;
    });

  const count = useMemo(() => parseGuestLines(rawInput).guests.length, [rawInput]);
  const iconBtn =
    "p-2 text-[var(--text-tertiary)] border border-[var(--border)] hover:text-[var(--text-primary)] hover:border-[var(--accent)] transition-colors disabled:opacity-50";
  const actionBtn =
    "inline-flex items-center gap-1.5 px-3 py-2 text-xs font-body border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent)] transition-colors disabled:opacity-50";
  const selectCls =
    "h-9 bg-transparent border border-[var(--border)] px-2 text-xs font-body text-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent)]";
  const labelCls = "eyebrow block mb-1";

  // Buka WhatsApp dengan pesan sudah terisi. Memakai endpoint langsung (whatsapp:// di HP,
  // web.whatsapp.com di desktop) supaya tidak lewat redirect wa.me yang bisa merusak emoji.
  // Pesan juga disalin ke clipboard sebagai cadangan bila ada karakter yang tampil rusak.
  const openWhatsApp = (item: GeneratedLink) => {
    const wa = waBySlug.get(item.slug);
    const text = wa?.message ?? decodeURIComponent(item.waLink.split("text=")[1] ?? "");
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const query = `${wa?.phone ? `phone=${wa.phone}&` : ""}text=${encodeURIComponent(text)}`;
    void navigator.clipboard.writeText(text).catch(() => {});
    if (isMobile) {
      window.location.href = `whatsapp://send?${query}`;
    } else {
      window.open(`whatsapp://send?${query}`, "_blank", "noopener,noreferrer");
    }
  };

  const renderRow = (item: GeneratedLink) => {
    const link = viewStats[item.slug];
    const wa = waBySlug.get(item.slug);
    const f = facetsOf(item);
    const isExpanded = expandedSlug === item.slug;
    const isSaving = savingSlug === item.slug;
    const isConfirming = confirmDeleteSlug === item.slug;
    const isDeleting = deletingSlug === item.slug;
    const phoneDraft = edits[item.slug]?.phone ?? wa?.phone ?? "";
    const msgDraft = edits[item.slug]?.msg;

    const meta = [
      f.side ? GUEST_SIDE_LABELS[f.side] : null,
      link ? GUEST_CATEGORY_LABELS[f.category] : null,
      link?.relation || null,
      wa?.phone || null,
    ].filter(Boolean);

    return (
      <div key={item.id}>
        <div className="px-4 py-3.5 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <input
              type="checkbox"
              aria-label={`Pilih ${item.name}`}
              checked={selected.has(item.slug)}
              disabled={wa?.status === "sending"}
              onChange={() => toggleSelected(item.slug)}
              className="mt-2 w-4 h-4 accent-[var(--accent)] shrink-0"
            />
            <div className="min-w-0 flex-1">
              <p className="font-display text-lg leading-tight text-[var(--text-primary)] flex items-center gap-1.5">
                {link?.is_featured && (
                  <Star size={13} className="text-[var(--accent)] shrink-0" fill="currentColor" />
                )}
                <span className="truncate" title={item.url}>
                  {item.name}
                </span>
              </p>
              {meta.length > 0 && (
                <p className="font-body text-xs text-[var(--text-tertiary)] mt-0.5 truncate">
                  {meta.join(" · ")}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                {f.wa === "sent" ? (
                  <Badge tone="ok">WA terkirim</Badge>
                ) : f.wa === "failed" ? (
                  <Badge tone="bad">WA gagal</Badge>
                ) : f.wa === "sending" ? (
                  <Badge tone="warn">Mengirim…</Badge>
                ) : f.wa === "pending" ? (
                  <Badge tone="muted">WA belum dikirim</Badge>
                ) : (
                  <Badge tone="muted">Tanpa nomor</Badge>
                )}
                {f.opened ? (
                  <Badge tone="accent">
                    Dibuka{link && link.view_count > 1 ? ` ${link.view_count}x` : ""}
                    {link?.last_viewed_at ? ` · ${formatDate(link.last_viewed_at)}` : ""}
                  </Badge>
                ) : (
                  <Badge tone="muted">Belum dibuka</Badge>
                )}
              </div>
              {f.wa === "failed" && wa?.error && (
                <p className="font-body text-xs text-red-700 mt-1.5">{wa.error}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 pl-7 lg:pl-0">
            <button
              type="button"
              onClick={() => handleCopySingle(item.id, item.url)}
              className={actionBtn}
              title="Salin link undangan"
            >
              {copiedId === item.id ? <Check size={14} /> : <Copy size={14} />}
              {copiedId === item.id ? "Tersalin" : "Salin"}
            </button>
            <button
              type="button"
              onClick={() => openWhatsApp(item)}
              className={`${actionBtn} !text-[var(--accent)] !border-[var(--accent)]`}
              title="Buka WhatsApp dengan pesan terisi"
            >
              <MessageCircle size={14} />
              WA
            </button>
            <button
              type="button"
              onClick={() => handleTogglePersonalize(item.slug)}
              className={`${iconBtn} ${isExpanded ? "!text-[var(--accent)] !border-[var(--accent)]" : ""}`}
              title="Edit tamu"
              aria-label="Edit tamu"
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
              title="Hapus tamu"
              aria-label="Hapus tamu"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className="border-t border-[var(--border-subtle)] px-4 py-5 space-y-5 bg-[var(--bg-secondary)]">
            <div className="grid sm:grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <label className={labelCls}>Nomor WhatsApp</label>
                <input
                  type="tel"
                  inputMode="tel"
                  value={phoneDraft}
                  placeholder="08xxxxxxxxxx"
                  onChange={(e) =>
                    setEdits((st) => ({ ...st, [item.slug]: { ...st[item.slug], phone: e.target.value } }))
                  }
                  onBlur={() => savePhone(item.slug)}
                  className="input-editorial !py-2"
                />
                {phoneDraft && !normalizeIdPhone(phoneDraft) && (
                  <span className="font-body text-xs text-red-700">Nomor tidak valid</span>
                )}
              </div>
              <div>
                <label className={labelCls}>Relasi</label>
                <input
                  type="text"
                  value={draft.relation}
                  onChange={(e) => setDraft((d) => ({ ...d, relation: e.target.value }))}
                  placeholder='mis. "Sahabat SMA"'
                  className="input-editorial !py-2"
                />
              </div>
              <div>
                <label className={labelCls}>Pihak</label>
                <select
                  value={draft.side ?? ""}
                  onChange={(e) => setDraft((d) => ({ ...d, side: toGuestSide(e.target.value) }))}
                  className="input-editorial !py-2"
                >
                  <option value="">{UNSET_SIDE_LABEL}</option>
                  {GUEST_SIDES.map((x) => (
                    <option key={x} value={x}>
                      {GUEST_SIDE_LABELS[x]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Kategori (acara yang terlihat)</label>
                <select
                  value={draft.category}
                  onChange={(e) => setDraft((d) => ({ ...d, category: toGuestCategory(e.target.value) }))}
                  className="input-editorial !py-2"
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
              <label className={labelCls}>Pesan personal (tampil di halaman undangan)</label>
              <textarea
                value={draft.personal_note}
                onChange={(e) => setDraft((d) => ({ ...d, personal_note: e.target.value }))}
                rows={2}
                placeholder="Pesan singkat khusus untuk tamu ini."
                className="input-editorial resize-none !py-2"
              />
            </div>

            <label className="flex items-center gap-2 text-sm font-body text-[var(--text-secondary)] cursor-pointer">
              <input
                type="checkbox"
                checked={draft.is_featured}
                onChange={(e) => setDraft((d) => ({ ...d, is_featured: e.target.checked }))}
                className="w-4 h-4 accent-[var(--accent)]"
              />
              Tamu istimewa
            </label>

            <div className="flex items-center gap-5">
              <button
                type="button"
                onClick={() => handleSavePersonalize(item.slug)}
                disabled={isSaving}
                className="btn-editorial-filled !w-auto !px-8 !py-3"
              >
                {isSaving ? "Menyimpan..." : "Simpan"}
              </button>
              <button type="button" onClick={() => setExpandedSlug(null)} className="btn-editorial !text-[var(--text-tertiary)] !border-transparent">
                Batal
              </button>
            </div>

            {wa && (
              <details className="border-t border-[var(--border)] pt-4">
                <summary className="cursor-pointer eyebrow">Pesan WhatsApp &amp; status kirim</summary>
                <p className="font-body text-xs text-[var(--text-tertiary)] mt-3">
                  Placeholder: {"{nama} {link} {acara} {catatan} {pengantin}"}
                </p>
                <textarea
                  value={msgDraft ?? (wa.wa_message || wa.message)}
                  onChange={(e) =>
                    setEdits((st) => ({ ...st, [item.slug]: { ...st[item.slug], msg: e.target.value } }))
                  }
                  rows={9}
                  className="w-full mt-2 p-3 bg-[var(--bg-primary)] border border-[var(--border)] font-mono text-[13px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                />
                <div className="flex flex-wrap items-center gap-5 mt-3">
                  <button
                    type="button"
                    className="btn-editorial"
                    disabled={msgDraft === undefined}
                    onClick={() => saveMessage(item.slug)}
                  >
                    Simpan pesan
                  </button>
                  <button
                    type="button"
                    className="btn-editorial"
                    onClick={() => {
                      void navigator.clipboard.writeText(msgDraft ?? (wa.wa_message || wa.message));
                    }}
                  >
                    Salin pesan
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
                    (wa.status !== "sent" && wa.status !== "sending" ? (
                      <button type="button" className="btn-editorial" onClick={() => mark(item.slug, "mark-sent")}>
                        Tandai terkirim
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn-editorial inline-flex items-center gap-1.5"
                        onClick={() => mark(item.slug, "reset")}
                      >
                        <RotateCcw size={12} /> Reset status
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
              Hapus <strong className="font-semibold">{item.name}</strong>? Statistik dan personalisasinya ikut
              terhapus.
            </p>
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => handleDelete(item)}
                disabled={isDeleting}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-body bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-60"
              >
                {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                {isDeleting ? "Menghapus..." : "Ya, hapus"}
              </button>
              <button
                type="button"
                onClick={() => setConfirmDeleteSlug(null)}
                disabled={isDeleting}
                className="text-xs font-body text-red-800/70 hover:text-red-900 transition-colors disabled:opacity-50"
              >
                Batal
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const filterRow = (label: string, chips: ReactNode) => (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
      <span className="eyebrow sm:w-24 shrink-0">{label}</span>
      <div className="flex flex-wrap gap-1.5">{chips}</div>
    </div>
  );

  return (
    <div className="space-y-10">
      {/* Tambah tamu */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border)] p-5 sm:p-6 space-y-5">
        <div>
          <label htmlFor="guest-names" className="eyebrow block mb-2">
            Tambah tamu
          </label>
          <textarea
            id="guest-names"
            rows={4}
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
            placeholder={"Nama tamu, nomor hp"}
            className="w-full bg-[var(--bg-primary)] border border-[var(--border)] p-3 text-[0.9375rem] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] resize-y leading-relaxed font-body placeholder:text-[var(--text-tertiary)]"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-[1fr_1fr_auto] gap-4 items-end">
          <div>
            <label htmlFor="guest-side" className={labelCls}>
              Pihak
            </label>
            <select
              id="guest-side"
              value={newSide ?? ""}
              onChange={(e) => setNewSide(toGuestSide(e.target.value))}
              className="input-editorial !py-2"
            >
              <option value="">{UNSET_SIDE_LABEL}</option>
              {GUEST_SIDES.map((x) => (
                <option key={x} value={x}>
                  {GUEST_SIDE_LABELS[x]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="guest-category" className={labelCls}>
              Kategori
            </label>
            <select
              id="guest-category"
              value={newCategory}
              onChange={(e) => setNewCategory(toGuestCategory(e.target.value))}
              className="input-editorial !py-2"
            >
              {GUEST_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {GUEST_CATEGORY_LABELS[c]}
                </option>
              ))}
            </select>
          </div>
          <div className="col-span-2 sm:col-span-1 flex items-center gap-2">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={!rawInput.trim() || isSyncing}
              className="btn-editorial-filled flex-1 sm:w-auto sm:px-8"
            >
              {isSyncing ? "Menyimpan..." : `Buat Link${count ? ` (${count})` : ""}`}
            </button>
            {rawInput.length > 0 && (
              <button
                type="button"
                onClick={handleClear}
                className={iconBtn}
                title="Bersihkan kolom"
                aria-label="Bersihkan kolom"
              >
                <Eraser size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      {notice && (
        <div
          role={notice.type === "error" ? "alert" : "status"}
          className={`flex items-start gap-2 px-4 py-3 font-body text-sm leading-snug ${
            notice.type === "error" ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-800"
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

      {/* Daftar tamu */}
      {links.length > 0 && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2 border-b border-[var(--border)] pb-4">
            <h2 className="font-display text-xl text-[var(--text-primary)]">
              Daftar Tamu <span className="font-body text-[13px] text-[var(--text-tertiary)]">· {links.length}</span>
            </h2>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              {configured && pendingSlugs.length > 0 && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => sendMany(pendingSlugs)}
                  className="btn-editorial inline-flex items-center gap-1.5"
                >
                  <Send size={12} /> Kirim WA ke yang belum ({pendingSlugs.length})
                </button>
              )}
              <button type="button" onClick={handleCopyAll} className="btn-editorial inline-flex items-center gap-1.5">
                {copiedAll ? <Check size={12} /> : <Copy size={12} />}
                {copiedAll ? "Tersalin" : hasActiveFilters(filters) ? "Salin yang tampil" : "Salin semua"}
              </button>
            </div>
          </div>

          {busy && (
            <p className="inline-flex items-center gap-2 font-body text-sm text-[var(--text-secondary)]">
              <Loader2 size={16} className="animate-spin" /> {progress ?? "Memproses…"}
            </p>
          )}

          {/* Cari, kelompokkan, filter */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]"
                />
                <input
                  type="search"
                  value={filters.q}
                  onChange={(e) => patchFilters({ q: e.target.value })}
                  placeholder="Cari nama tamu…"
                  aria-label="Cari nama tamu"
                  className="h-9 w-full bg-transparent border border-[var(--border)] pl-9 pr-3 text-sm font-body text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent)]"
                />
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 font-body text-xs text-[var(--text-tertiary)]">
                  Kelompokkan
                  <select
                    value={groupBy}
                    onChange={(e) => setGroupBy(e.target.value as GroupBy)}
                    className={selectCls}
                  >
                    <option value="side">Pihak</option>
                    <option value="category">Kategori</option>
                    <option value="wa">Status WA</option>
                    <option value="opened">Status dibuka</option>
                    <option value="none">Tanpa grup</option>
                  </select>
                </label>
                <button
                  type="button"
                  onClick={() => setShowFilters((v) => !v)}
                  aria-expanded={showFilters}
                  className={`h-9 px-3 text-xs font-body border transition-colors inline-flex items-center gap-1.5 ${
                    showFilters || activeFilterCount > 0
                      ? "border-[var(--accent)] text-[var(--text-primary)]"
                      : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)]"
                  }`}
                >
                  Filter
                  {activeFilterCount > 0 && (
                    <span className="bg-[var(--accent)] text-white text-[10px] leading-none px-1.5 py-1">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {showFilters && (
              <div className="border border-[var(--border)] bg-[var(--bg-secondary)] p-4 space-y-3">
                {filterRow(
                  "Pihak",
                  <>
                    <Chip active={filters.side === "all"} onClick={() => patchFilters({ side: "all" })}>
                      Semua
                    </Chip>
                    {GUEST_SIDES.map((x) => (
                      <Chip
                        key={x}
                        active={filters.side === x}
                        count={counts.side[x]}
                        onClick={() => patchFilters({ side: x })}
                      >
                        {GUEST_SIDE_LABELS[x]}
                      </Chip>
                    ))}
                    <Chip
                      active={filters.side === "unset"}
                      count={counts.side.unset}
                      onClick={() => patchFilters({ side: "unset" })}
                    >
                      {UNSET_SIDE_LABEL}
                    </Chip>
                  </>,
                )}
                {filterRow(
                  "Kategori",
                  <>
                    <Chip active={filters.category === "all"} onClick={() => patchFilters({ category: "all" })}>
                      Semua
                    </Chip>
                    {GUEST_CATEGORIES.map((c) => (
                      <Chip
                        key={c}
                        active={filters.category === c}
                        count={counts.category[c]}
                        onClick={() => patchFilters({ category: c })}
                      >
                        {GUEST_CATEGORY_LABELS[c]}
                      </Chip>
                    ))}
                  </>,
                )}
                {filterRow(
                  "Status WA",
                  <>
                    <Chip active={filters.wa === "all"} onClick={() => patchFilters({ wa: "all" })}>
                      Semua
                    </Chip>
                    {(["pending", "sent", "failed", "nophone"] as WaKey[]).map((k) => (
                      <Chip
                        key={k}
                        active={filters.wa === k}
                        count={counts.wa[k]}
                        onClick={() => patchFilters({ wa: k })}
                      >
                        {WA_KEY_LABELS[k]}
                      </Chip>
                    ))}
                  </>,
                )}
                {filterRow(
                  "Undangan",
                  <>
                    <Chip active={filters.opened === "all"} onClick={() => patchFilters({ opened: "all" })}>
                      Semua
                    </Chip>
                    <Chip
                      active={filters.opened === "opened"}
                      count={counts.opened}
                      onClick={() => patchFilters({ opened: "opened" })}
                    >
                      Sudah dibuka
                    </Chip>
                    <Chip
                      active={filters.opened === "unopened"}
                      count={counts.unopened}
                      onClick={() => patchFilters({ opened: "unopened" })}
                    >
                      Belum dibuka
                    </Chip>
                  </>,
                )}
              </div>
            )}

            {hasActiveFilters(filters) && (
              <p className="flex flex-wrap items-center gap-x-3 font-body text-xs text-[var(--text-tertiary)]">
                <span>
                  Menampilkan {filteredLinks.length} dari {links.length} tamu
                </span>
                <button
                  type="button"
                  onClick={() => setFilters(EMPTY_FILTERS)}
                  className="text-[var(--accent)] hover:underline"
                >
                  Reset filter
                </button>
              </p>
            )}
          </div>

          {filteredLinks.length === 0 ? (
            <p className="border border-[var(--border)] px-4 py-10 text-center font-body text-sm text-[var(--text-tertiary)]">
              Tidak ada tamu yang cocok.
            </p>
          ) : (
            <div className="space-y-8">
              {groups.map((group) => {
                const isCollapsed = groupBy !== "none" && collapsed.has(group.key);
                const slugs = group.items.map((i) => i.slug);
                const allSelected = slugs.every((sl) => selected.has(sl));
                const sentCount = group.items.filter((i) => facetsOf(i).wa === "sent").length;
                const openedCount = group.items.filter((i) => facetsOf(i).opened).length;
                return (
                  <section key={group.key}>
                    {groupBy !== "none" && (
                      <div className="flex items-center gap-3 pb-2.5">
                        <input
                          type="checkbox"
                          aria-label={`Pilih semua di ${group.label}`}
                          checked={allSelected}
                          onChange={() => toggleGroupSelected(slugs, allSelected)}
                          className="w-4 h-4 accent-[var(--accent)]"
                        />
                        <button
                          type="button"
                          onClick={() => toggleCollapsed(group.key)}
                          aria-expanded={!isCollapsed}
                          className="flex flex-1 items-center gap-2 text-left min-w-0"
                        >
                          <ChevronDown
                            size={14}
                            className={`shrink-0 text-[var(--text-tertiary)] transition-transform ${
                              isCollapsed ? "-rotate-90" : ""
                            }`}
                          />
                          <span className="eyebrow !text-[var(--text-primary)] truncate">{group.label}</span>
                          <span className="font-body text-xs text-[var(--text-tertiary)] shrink-0">
                            {group.items.length}
                          </span>
                        </button>
                        <span className="hidden sm:inline font-body text-xs text-[var(--text-tertiary)] shrink-0">
                          WA terkirim {sentCount}/{group.items.length} · dibuka {openedCount}/{group.items.length}
                        </span>
                      </div>
                    )}
                    {!isCollapsed && (
                      <div className="divide-y divide-[var(--border-subtle)] border border-[var(--border)] bg-[var(--bg-elevated,#ffffff)]">
                        {group.items.map((item) => renderRow(item))}
                      </div>
                    )}
                  </section>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Aksi untuk tamu terpilih */}
      {selected.size > 0 && (
        <div className="sticky bottom-4 z-10 flex flex-wrap items-center gap-3 border border-[var(--accent)] bg-[var(--bg-elevated,#ffffff)] px-4 py-3 shadow-sm">
          <span className="font-body text-sm font-medium text-[var(--text-primary)]">
            {selected.size} dipilih
          </span>
          <select
            aria-label="Atur pihak untuk tamu terpilih"
            value=""
            disabled={bulkBusy}
            onChange={(e) => {
              const v = e.target.value;
              if (v) bulkApply({ side: v === "unset" ? null : toGuestSide(v) });
            }}
            className={selectCls}
          >
            <option value="">Atur pihak…</option>
            {GUEST_SIDES.map((x) => (
              <option key={x} value={x}>
                {GUEST_SIDE_LABELS[x]}
              </option>
            ))}
            <option value="unset">Kosongkan pihak</option>
          </select>
          <select
            aria-label="Atur kategori untuk tamu terpilih"
            value=""
            disabled={bulkBusy}
            onChange={(e) => {
              const v = e.target.value;
              if (v) bulkApply({ category: toGuestCategory(v) });
            }}
            className={selectCls}
          >
            <option value="">Atur kategori…</option>
            {GUEST_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {GUEST_CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>
          {configured && (
            <button
              type="button"
              disabled={busy || sendableSelected.length === 0}
              onClick={() => sendMany(sendableSelected)}
              className={actionBtn}
            >
              <Send size={14} /> Kirim WA ({sendableSelected.length})
            </button>
          )}
          {bulkBusy && <Loader2 size={14} className="animate-spin text-[var(--text-tertiary)]" />}
          <button
            type="button"
            onClick={() => setSelected(new Set())}
            className="ml-auto font-body text-xs text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
          >
            Batal pilih
          </button>
        </div>
      )}
    </div>
  );
}
