import { NextResponse } from "next/server";
import { guard } from "@/src/server/admin-guard";
import { fail, readJson } from "@/src/server/http";
import { invitation } from "@/src/data/invitation";
import { normalizeIdPhone } from "@/src/lib/phone";
import {
  composeGuestMessage,
  guestLink,
  templateSummary,
  type WaGuest,
} from "@/src/server/wa-compose";
import { sendWhatsApp, waConfig, waInfo } from "@/src/server/whatsapp";
import { sleep } from "@/src/lib/sleep";

/**
 * Admin-only WhatsApp outbox for guest invitation links.
 *   GET  → guests with phone/status + the exact message each one will get
 *   PUT  → save contacts: [{ slug, phone?, wa_message? }]
 *   POST → { action: "send" | "mark-sent" | "reset", slugs, force? }
 * Sending claims each guest atomically (status pending/failed → sending), so
 * double-clicks or two admin tabs can never message the same guest twice.
 * Provider (meta | fonnte | waha) is chosen by env, see src/server/whatsapp.ts;
 * gateways are sent one at a time with a random pause, in small batches.
 */
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_PER_CALL = 50;
/** Stop starting new sends after this, so the function ends before maxDuration. */
const TIME_BUDGET_MS = 45_000;

interface Row extends WaGuest {
  phone?: string | null;
  wa_status?: string | null;
  wa_sent_at?: string | null;
  wa_error?: string | null;
}

const baseUrl = () => process.env.NEXT_PUBLIC_SITE_URL || invitation.meta.url;

export async function GET(req: Request) {
  const g = await guard(req);
  if (!g.db) return g.res!;
  const { data, error } = await g.db.from("guest_links").select("*").order("created_at", { ascending: true });
  if (error) {
    return fail(`${error.message} — pastikan migration 009–011 sudah dijalankan.`, 500);
  }
  const cfg = waConfig();
  const info = cfg ? waInfo(cfg) : null;
  const guests = ((data ?? []) as Row[]).map((r) => ({
    slug: r.slug,
    name: r.name,
    category: r.category ?? "kudus",
    phone: r.phone ?? "",
    wa_message: r.wa_message ?? "",
    status: r.wa_status ?? "pending",
    sent_at: r.wa_sent_at ?? null,
    error: r.wa_error ?? null,
    link: guestLink(r, baseUrl()),
    message: composeGuestMessage(r, baseUrl()),
  }));
  return NextResponse.json({
    configured: Boolean(cfg),
    mode: info?.label ?? null,
    /** Tamu per permintaan kirim yang pantas untuk provider ini. */
    batch: info?.clientBatch ?? 25,
    guests,
  });
}

export async function PUT(req: Request) {
  const g = await guard(req);
  if (!g.db) return g.res!;
  const { contacts } = await readJson<{
    contacts?: { slug?: unknown; phone?: unknown; wa_message?: unknown }[];
  }>(req);
  if (!Array.isArray(contacts) || contacts.length === 0 || contacts.length > 500) {
    return fail("Permintaan tidak valid.", 400);
  }

  const results: { slug: string; ok: boolean; error?: string }[] = [];
  for (const c of contacts) {
    if (typeof c.slug !== "string" || !c.slug) {
      results.push({ slug: String(c.slug), ok: false, error: "slug tidak valid" });
      continue;
    }
    const patch: Record<string, unknown> = {};
    if (c.phone !== undefined) {
      const raw = typeof c.phone === "string" ? c.phone.trim() : "";
      if (raw === "") patch.phone = null;
      else {
        const n = normalizeIdPhone(raw);
        if (!n) {
          results.push({ slug: c.slug, ok: false, error: `Nomor tidak valid: ${raw}` });
          continue;
        }
        patch.phone = n;
      }
      // a changed number is a new recipient → eligible for sending again
      patch.wa_status = "pending";
      patch.wa_error = null;
    }
    if (c.wa_message !== undefined) {
      if (typeof c.wa_message !== "string" || c.wa_message.length > 1500) {
        results.push({ slug: c.slug, ok: false, error: "Pesan terlalu panjang (maks 1500)." });
        continue;
      }
      patch.wa_message = c.wa_message.trim() || null;
    }
    if (Object.keys(patch).length === 0) continue;
    const { data, error } = await g.db.from("guest_links").update(patch).eq("slug", c.slug).select("slug");
    results.push(
      error ? { slug: c.slug, ok: false, error: error.message } : data?.length ? { slug: c.slug, ok: true } : { slug: c.slug, ok: false, error: "Tamu tidak ditemukan" }
    );
  }
  return NextResponse.json({ results });
}

export async function POST(req: Request) {
  const g = await guard(req);
  if (!g.db) return g.res!;
  const body = await readJson<{ action?: unknown; slugs?: unknown; force?: unknown }>(req);
  const slugs = body.slugs;
  if (
    !Array.isArray(slugs) ||
    slugs.length === 0 ||
    slugs.length > MAX_PER_CALL ||
    !slugs.every((s) => typeof s === "string" && s.length > 0 && s.length <= 200)
  ) {
    return fail(`Pilih 1–${MAX_PER_CALL} tamu per permintaan.`, 400);
  }
  const list = slugs as string[];

  if (body.action === "mark-sent" || body.action === "reset") {
    const patch =
      body.action === "mark-sent"
        ? { wa_status: "sent", wa_sent_at: new Date().toISOString(), wa_error: null }
        : { wa_status: "pending", wa_error: null };
    const { data, error } = await g.db.from("guest_links").update(patch).in("slug", list).select("slug");
    if (error) return fail(error.message, 500);
    return NextResponse.json({ updated: data?.length ?? 0 });
  }

  if (body.action !== "send") return fail("Aksi tidak dikenal.", 400);

  const cfg = waConfig();
  if (!cfg) {
    return fail(
      "Pengiriman otomatis belum dikonfigurasi. Atur WHATSAPP_PROVIDER (meta | fonnte | waha) beserta env-nya (lihat docs/WHATSAPP.md). Gunakan kirim manual.",
      503
    );
  }

  const info = waInfo(cfg);
  if (list.length > info.maxPerCall) {
    return fail(`Provider ${info.label}: maksimal ${info.maxPerCall} tamu per permintaan.`, 400);
  }

  // Atomic claim: only rows still pending/failed (or any non-sending with force) are taken.
  const eligible = body.force === true ? ["pending", "failed", "sent"] : ["pending", "failed"];
  const { data: claimed, error: claimErr } = await g.db
    .from("guest_links")
    .update({ wa_status: "sending", wa_error: null })
    .in("slug", list)
    .in("wa_status", eligible)
    .not("phone", "is", null)
    .select("*");
  if (claimErr) return fail(claimErr.message, 500);

  const rows = (claimed ?? []) as Row[];
  const claimedSlugs = new Set(rows.map((r) => r.slug));
  const unclaimed = list.filter((s) => !claimedSlugs.has(s));
  const results: { slug: string; status: string; error?: string }[] = [];

  // Jelaskan kenapa tiap tamu dilewati, supaya admin tahu apa yang harus dibenahi.
  if (unclaimed.length > 0) {
    const { data: current } = await g.db
      .from("guest_links")
      .select("slug, phone, wa_status")
      .in("slug", unclaimed);
    const bySlug = new Map(
      ((current ?? []) as { slug: string; phone: string | null; wa_status: string }[]).map((c) => [c.slug, c])
    );
    for (const s of unclaimed) {
      const c = bySlug.get(s);
      const reason = !c
        ? "tamu tidak ditemukan di database"
        : !c.phone
          ? "nomor WhatsApp kosong"
          : c.wa_status === "sent"
            ? "sudah berstatus terkirim (pakai Reset status bila ingin kirim ulang)"
            : c.wa_status === "sending"
              ? "masih berstatus mengirim — kemungkinan macet, pakai Reset status"
              : `tidak bisa diklaim (status ${c.wa_status})`;
      results.push({ slug: s, status: "skipped", error: reason });
    }
  }

  const deadline = Date.now() + TIME_BUDGET_MS;
  const notReached: Row[] = [];
  let next = 0;
  const worker = async () => {
    while (next < rows.length) {
      const r = rows[next++];
      // Waktu habis: jangan kirim lagi, kembalikan ke antrean di bawah.
      if (Date.now() > deadline) {
        notReached.push(r);
        continue;
      }
      let res: Awaited<ReturnType<typeof sendWhatsApp>>;
      try {
        const base = baseUrl();
        res = await sendWhatsApp(cfg, {
          to: r.phone as string,
          text: composeGuestMessage(r, base),
          params: [r.name, guestLink(r, base), templateSummary(r, base)],
        });
      } catch (e) {
        res = { ok: false, error: e instanceof Error ? e.message.slice(0, 300) : "Gagal menyusun pesan." };
      }
      const patch = res.ok
        ? { wa_status: "sent", wa_sent_at: new Date().toISOString(), wa_message_id: res.id, wa_error: null }
        : { wa_status: "failed", wa_error: res.error };
      await g.db!.from("guest_links").update(patch).eq("slug", r.slug);
      results.push(res.ok ? { slug: r.slug, status: "sent" } : { slug: r.slug, status: "failed", error: res.error });
      // Gateway non-resmi: jeda acak supaya tidak terlihat seperti blast.
      const [lo, hi] = info.delayMs;
      if (hi > 0 && next < rows.length) await sleep(lo + Math.random() * (hi - lo));
    }
  };
  await Promise.all(Array.from({ length: Math.min(info.concurrency, rows.length) }, worker));

  if (notReached.length > 0) {
    await g.db
      .from("guest_links")
      .update({ wa_status: "pending" })
      .in("slug", notReached.map((r) => r.slug))
      .eq("wa_status", "sending");
    for (const r of notReached) results.push({ slug: r.slug, status: "skipped" });
  }

  return NextResponse.json({
    sent: results.filter((r) => r.status === "sent").length,
    failed: results.filter((r) => r.status === "failed").length,
    skipped: results.filter((r) => r.status === "skipped").length,
    results,
  });
}
