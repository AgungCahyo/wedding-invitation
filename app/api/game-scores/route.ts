import { NextResponse } from "next/server";
import { fail, serviceClient } from "@/src/lib/admin-server";
import { GAME } from "@/src/lib/catch-love";

/**
 * Leaderboard "Catch the Love".
 *  GET  → 50 skor terbaik (UI menampilkannya dalam daftar yang bisa di-scroll).
 *  POST → simpan skor terbaik per nama (hanya naik, tidak pernah turun).
 * Validasi sederhana supaya skor mustahil (mis. 99999) ditolak.
 */
export const dynamic = "force-dynamic";

const TOP_N = 50;
// Batas teoretis: interval spawn minimum 0.32 dtk selama durasi maksimum
// (termasuk semua tambahan waktu).
const MAX_RED = Math.ceil(GAME.MAX_DURATION / 0.32) + 2;
const MAX_SCORE = MAX_RED * GAME.RED_POINTS;

const cleanName = (v: unknown) =>
  typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, 40) : "";

async function topScores(db: NonNullable<ReturnType<typeof serviceClient>>) {
  const { data, error } = await db
    .from("game_scores")
    .select("name, score")
    .order("score", { ascending: false })
    .order("updated_at", { ascending: true })
    .limit(TOP_N);
  if (error) throw error;
  return data ?? [];
}

export async function GET() {
  const db = serviceClient();
  if (!db) return fail("Leaderboard belum aktif.", 500);
  try {
    return NextResponse.json({ scores: await topScores(db) });
  } catch (e) {
    console.error("Error loading leaderboard:", e);
    return fail("Gagal memuat leaderboard.", 500);
  }
}

export async function POST(req: Request) {
  const db = serviceClient();
  if (!db) return fail("Leaderboard belum aktif.", 500);

  const body = (await req.json().catch(() => ({}))) as { name?: unknown; score?: unknown };
  const name = cleanName(body.name);
  const score = Number(body.score);
  if (!name) return fail("Nama tidak valid.", 400);
  if (!Number.isInteger(score) || score < 0 || score > MAX_SCORE || score % 5 !== 0) {
    return fail("Skor tidak valid.", 400);
  }

  const nameKey = name.toLowerCase();
  try {
    const { data: prev, error: readErr } = await db
      .from("game_scores")
      .select("score, plays")
      .eq("name_key", nameKey)
      .maybeSingle();
    if (readErr) throw readErr;

    const isNewBest = !prev || score > prev.score;
    const { error: writeErr } = prev
      ? await db
          .from("game_scores")
          .update({
            name,
            plays: prev.plays + 1,
            ...(isNewBest ? { score, updated_at: new Date().toISOString() } : {}),
          })
          .eq("name_key", nameKey)
      : await db.from("game_scores").insert({ name_key: nameKey, name, score });
    if (writeErr) throw writeErr;

    return NextResponse.json({ success: true, isNewBest, scores: await topScores(db) });
  } catch (e) {
    console.error("Error saving score:", e);
    return fail("Gagal menyimpan skor. Silakan coba lagi.", 500);
  }
}
