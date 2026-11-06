"use client";

import { useCallback, useEffect, useMemo, useState, startTransition } from "react";
import { AlertCircle, Check, Loader2, MessageCircle, Send, RotateCcw } from "lucide-react";
import { adminFetch } from "@/src/lib/admin-fetch";
import { GUEST_CATEGORY_LABELS, toGuestCategory } from "@/src/lib/guest-category";
import { normalizeIdPhone } from "@/src/lib/phone";

interface WaGuestRow {
  slug: string;
  name: string;
  category: string;
  phone: string;
  wa_message: string;
  status: "pending" | "sending" | "sent" | "failed";
  sent_at: string | null;
  error: string | null;
  link: string;
  message: string;
}

const STATUS_LABEL: Record<WaGuestRow["status"], string> = {
  pending: "Belum dikirim",
  sending: "Mengirim…",
  sent: "Terkirim",
  failed: "Gagal",
};
const BATCH = 25;

export function WhatsAppSender() {
  const [rows, setRows] = useState<WaGuestRow[]>([]);
  const [configured, setConfigured] = useState(false);
  const [mode, setMode] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [edits, setEdits] = useState<Record<string, { phone?: string; msg?: string }>>({});
  const [importText, setImportText] = useState("");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ type: "error" | "ok"; text: string } | null>(null);

  const load = useCallback(async () => {
    try {
      const j = await adminFetch<{ configured: boolean; mode: string | null; guests: WaGuestRow[] }>(
        "/api/admin/wa",
        "GET"
      );
      setRows(j.guests);
      setConfigured(j.configured);
      setMode(j.mode);
    } catch (e) {
      setNotice({ type: "error", text: e instanceof Error ? e.message : "Gagal memuat data WhatsApp." });
    }
  }, []);

  useEffect(() => {
    startTransition(() => {
      void load();
    });
  }, [load]);

  const withPhone = useMemo(() => rows.filter((r) => r.phone), [rows]);
  const pendingSlugs = useMemo(
    () => withPhone.filter((r) => r.status === "pending" || r.status === "failed").map((r) => r.slug),
    [withPhone]
  );

  const savePhone = async (r: WaGuestRow) => {
    const draft = edits[r.slug]?.phone;
    if (draft === undefined || draft === r.phone) return;
    try {
      const j = await adminFetch<{ results: { ok: boolean; error?: string }[] }>("/api/admin/wa", "PUT", {
        contacts: [{ slug: r.slug, phone: draft }],
      });
      if (!j.results[0]?.ok) throw new Error(j.results[0]?.error ?? "Gagal menyimpan nomor.");
      setEdits((e) => ({ ...e, [r.slug]: { ...e[r.slug], phone: undefined } }));
      await load();
    } catch (e) {
      setNotice({ type: "error", text: e instanceof Error ? e.message : "Gagal menyimpan nomor." });
    }
  };

  const saveMessage = async (r: WaGuestRow) => {
    const draft = edits[r.slug]?.msg;
    if (draft === undefined) return;
    try {
      const j = await adminFetch<{ results: { ok: boolean; error?: string }[] }>("/api/admin/wa", "PUT", {
        contacts: [{ slug: r.slug, wa_message: draft }],
      });
      if (!j.results[0]?.ok) throw new Error(j.results[0]?.error ?? "Gagal menyimpan pesan.");
      setEdits((e) => ({ ...e, [r.slug]: { ...e[r.slug], msg: undefined } }));
      await load();
    } catch (e) {
      setNotice({ type: "error", text: e instanceof Error ? e.message : "Gagal menyimpan pesan." });
    }
  };

  /** "Nama, 0812…" per line → matched to existing guests by name (case-insensitive). */
  const handleImport = async () => {
    const byName = new Map(rows.map((r) => [r.name.trim().toLowerCase(), r.slug]));
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
        type: bad.length || unmatched.length ? "error" : "ok",
        text:
          `${j.results.length - bad.length} nomor disimpan.` +
          (bad.length ? ` Ditolak: ${bad.map((b) => b.error).join("; ")}.` : "") +
          (unmatched.length ? ` Tidak cocok: ${unmatched.join(" | ")}.` : ""),
      });
      if (!bad.length && !unmatched.length) setImportText("");
      await load();
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
        type: failed ? "error" : "ok",
        text: `${sent} terkirim${failed ? `, ${failed} gagal (lihat kolom status, lalu kirim ulang)` : ""}.`,
      });
    } catch (e) {
      setNotice({ type: "error", text: e instanceof Error ? e.message : "Pengiriman gagal." });
    } finally {
      setProgress(null);
      setBusy(false);
      setSelected(new Set());
      await load();
    }
  };

  const mark = async (slug: string, action: "mark-sent" | "reset") => {
    try {
      await adminFetch("/api/admin/wa", "POST", { action, slugs: [slug] });
      await load();
    } catch (e) {
      setNotice({ type: "error", text: e instanceof Error ? e.message : "Gagal memperbarui status." });
    }
  };

  const toggle = (slug: string) =>
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(slug)) n.delete(slug);
      else n.add(slug);
      return n;
    });

  return (
    <section className="space-y-6 mt-16 pt-10 border-t border-[var(--border)]">
      <div>
        <h2 className="font-display text-2xl leading-tight text-[var(--text-primary)]">Kirim via WhatsApp</h2>
        <p className="font-body text-sm text-[var(--text-secondary)] mt-1">
          Setiap tamu menerima pesan sendiri: nama, link bertoken, acara sesuai kategori, dan catatan pribadi.
          Pesan bisa diubah per tamu (placeholder: {"{nama} {link} {acara} {catatan} {pengantin}"}).
        </p>
      </div>

      <div
        className={`px-4 py-3 font-body text-sm leading-snug ${
          configured ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"
        }`}
      >
        {configured
          ? `Pengiriman otomatis aktif (mode ${mode}).`
          : "Pengiriman otomatis belum aktif (env WHATSAPP_* belum diisi). Kamu tetap bisa kirim manual per tamu lewat tombol “Buka WA”."}
      </div>

      {notice && (
        <div
          role={notice.type === "error" ? "alert" : "status"}
          className={`flex items-start gap-2 px-4 py-3 font-body text-sm leading-snug ${
            notice.type === "error" ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-800"
          }`}
        >
          {notice.type === "error" ? <AlertCircle size={16} className="shrink-0 mt-0.5" /> : <Check size={16} className="shrink-0 mt-0.5" />}
          <span>{notice.text}</span>
        </div>
      )}

      <details className="border border-[var(--border)] p-4">
        <summary className="cursor-pointer font-body text-sm font-medium text-[var(--text-primary)]">
          Impor nomor sekaligus
        </summary>
        <p className="font-body text-[13px] text-[var(--text-tertiary)] mt-2 mb-2">
          Satu tamu per baris: <code>Nama, 08123456789</code>. Nama harus sama dengan nama tamu di daftar.
        </p>
        <textarea
          value={importText}
          onChange={(e) => setImportText(e.target.value)}
          rows={5}
          className="input-editorial w-full"
          placeholder={"Budi Santoso, 0812-3456-7890\nSiti Aminah, +62 813 1111 2222"}
        />
        <button type="button" onClick={handleImport} disabled={busy || !importText.trim()} className="btn-editorial mt-3 disabled:opacity-50">
          Simpan nomor
        </button>
      </details>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={busy || selected.size === 0 || !configured}
          onClick={() => sendMany([...selected])}
          className="btn-editorial-filled inline-flex items-center gap-2 px-5 py-3 disabled:opacity-50"
        >
          <Send size={16} /> Kirim terpilih ({selected.size})
        </button>
        <button
          type="button"
          disabled={busy || pendingSlugs.length === 0 || !configured}
          onClick={() => sendMany(pendingSlugs)}
          className="btn-editorial inline-flex items-center gap-2 disabled:opacity-50"
        >
          Kirim semua yang belum terkirim ({pendingSlugs.length})
        </button>
        {busy && (
          <span className="inline-flex items-center gap-2 font-body text-sm text-[var(--text-secondary)]">
            <Loader2 size={16} className="animate-spin" /> {progress ?? "Memproses…"}
          </span>
        )}
      </div>

      <div className="space-y-3">
        {rows.length === 0 && (
          <p className="font-body text-sm text-[var(--text-tertiary)]">Belum ada tamu. Generate link dulu di atas.</p>
        )}
        {rows.map((r) => {
          const phoneDraft = edits[r.slug]?.phone ?? r.phone;
          const normalized = normalizeIdPhone(phoneDraft);
          const msgDraft = edits[r.slug]?.msg;
          return (
            <div key={r.slug} className="border border-[var(--border)] p-4 space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="checkbox"
                  aria-label={`Pilih ${r.name}`}
                  checked={selected.has(r.slug)}
                  disabled={!r.phone || r.status === "sending"}
                  onChange={() => toggle(r.slug)}
                />
                <span className="font-body font-medium text-[var(--text-primary)]">{r.name}</span>
                <span className="font-body text-[11px] uppercase tracking-wider text-[var(--text-secondary)] border border-[var(--border)] px-2 py-0.5">
                  {GUEST_CATEGORY_LABELS[toGuestCategory(r.category)]}
                </span>
                <span
                  className={`font-body text-xs ${
                    r.status === "sent" ? "text-emerald-700" : r.status === "failed" ? "text-red-700" : "text-[var(--text-tertiary)]"
                  }`}
                  title={r.error ?? undefined}
                >
                  {STATUS_LABEL[r.status]}
                  {r.status === "failed" && r.error ? ` — ${r.error}` : ""}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="tel"
                  inputMode="tel"
                  value={phoneDraft}
                  placeholder="08xxxxxxxxxx"
                  onChange={(e) => setEdits((s) => ({ ...s, [r.slug]: { ...s[r.slug], phone: e.target.value } }))}
                  onBlur={() => savePhone(r)}
                  className="input-editorial w-56"
                  aria-label={`Nomor WhatsApp ${r.name}`}
                />
                {phoneDraft && !normalized && <span className="font-body text-xs text-red-700">Nomor tidak valid</span>}
                {r.phone && (
                  <>
                    <a
                      href={`https://wa.me/${r.phone}?text=${encodeURIComponent(r.message)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-editorial inline-flex items-center gap-2"
                    >
                      <MessageCircle size={14} /> Buka WA
                    </a>
                    {r.status !== "sent" ? (
                      <button type="button" className="btn-editorial" onClick={() => mark(r.slug, "mark-sent")}>
                        Tandai terkirim
                      </button>
                    ) : (
                      <button type="button" className="btn-editorial inline-flex items-center gap-2" onClick={() => mark(r.slug, "reset")}>
                        <RotateCcw size={14} /> Reset status
                      </button>
                    )}
                  </>
                )}
              </div>

              <details>
                <summary className="cursor-pointer font-body text-[13px] text-[var(--text-secondary)]">Pesan untuk {r.name}</summary>
                <textarea
                  value={msgDraft ?? (r.wa_message || r.message)}
                  onChange={(e) => setEdits((s) => ({ ...s, [r.slug]: { ...s[r.slug], msg: e.target.value } }))}
                  rows={10}
                  className="input-editorial w-full mt-2 font-mono text-[13px]"
                />
                <div className="flex gap-3 mt-2">
                  <button type="button" className="btn-editorial" disabled={msgDraft === undefined} onClick={() => saveMessage(r)}>
                    Simpan pesan khusus
                  </button>
                  {(r.wa_message || msgDraft !== undefined) && (
                    <button
                      type="button"
                      className="btn-editorial"
                      onClick={async () => {
                        setEdits((s) => ({ ...s, [r.slug]: { ...s[r.slug], msg: "" } }));
                        await adminFetch("/api/admin/wa", "PUT", { contacts: [{ slug: r.slug, wa_message: "" }] });
                        setEdits((s) => ({ ...s, [r.slug]: { ...s[r.slug], msg: undefined } }));
                        await load();
                      }}
                    >
                      Kembali ke pesan standar
                    </button>
                  )}
                </div>
              </details>
            </div>
          );
        })}
      </div>
    </section>
  );
}
