"use client";

import { motion } from "motion/react";
import { Heart, Trophy } from "lucide-react";
import { startTransition, useCallback, useEffect, useRef, useState } from "react";
import { SectionHeader } from "@/src/components/ui/SectionHeader";
import { CornerFrame } from "@/src/components/ui/CornerFrame";
import { fetchLeaderboard, submitScore, type LeaderboardEntry } from "@/src/lib/game-score-service";
import { easeOut, fadeUp, viewportOnce } from "@/src/lib/motion";
import { PAUSE_AUTOSCROLL_EVENT } from "@/src/lib/floating-bar";
import { CATCH_LOVE_BEST_KEY, CATCH_LOVE_NAME_KEY } from "@/src/constants/storage-keys";
import { getErrorMessage } from "@/src/lib/errors";
import { GAME, basketTop, createGame, stepGame, type GameState } from "@/src/lib/catch-love";

const BEST_KEY = CATCH_LOVE_BEST_KEY;
const NAME_KEY = CATCH_LOVE_NAME_KEY;
const RED = "#d6334a";
const BLACK = "#1c1917";
const GOLD = "#e0a526";

type Phase = "idle" | "playing" | "done";
type SaveState = "idle" | "saving" | "saved" | "error";

function readBest(): number {
  try {
    const n = Number(localStorage.getItem(BEST_KEY));
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
  } catch {
    return 0;
  }
}

function writeBest(n: number) {
  try {
    localStorage.setItem(BEST_KEY, String(n));
  } catch {
    /* mode privat: skor tertinggi hanya berlaku di sesi ini */
  }
}

interface Palette {
  accent: string;
  text: string;
}

function readPalette(): Palette {
  const cs = getComputedStyle(document.documentElement);
  const v = (name: string, fallback: string) => cs.getPropertyValue(name).trim() || fallback;
  return { accent: v("--accent", "#b89a72"), text: v("--text-primary", "#2b2520") };
}

function heartPath(ctx: CanvasRenderingContext2D, s: number) {
  ctx.beginPath();
  ctx.moveTo(0, s * 0.9);
  ctx.bezierCurveTo(-s * 1.4, -s * 0.1, -s * 0.6, -s * 1.1, 0, -s * 0.35);
  ctx.bezierCurveTo(s * 0.6, -s * 1.1, s * 1.4, -s * 0.1, 0, s * 0.9);
  ctx.closePath();
}

function draw(ctx: CanvasRenderingContext2D, g: GameState, pal: Palette, dpr: number) {
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, GAME.W, GAME.H);

  // Latar lembut dari warna aksen tema (otomatis ikut palet).
  const bg = ctx.createRadialGradient(GAME.W / 2, GAME.H, 20, GAME.W / 2, GAME.H, GAME.H);
  bg.addColorStop(0, pal.accent + "33");
  bg.addColorStop(1, pal.accent + "00");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, GAME.W, GAME.H);

  for (const h of g.hearts) {
    ctx.save();
    ctx.translate(h.x + Math.sin(h.phase + h.y * 0.025) * 3, h.y);
    ctx.rotate(Math.sin(h.phase + h.y * 0.02) * 0.18);
    if (h.kind === "time") {
      // Koin waktu emas: lingkaran + jarum jam, beda bentuk dari hati.
      const r = h.r * 1.05;
      ctx.shadowColor = GOLD;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fillStyle = GOLD;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = "rgba(255,255,255,0.9)";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.7, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, -r * 0.45);
      ctx.lineTo(0, 0);
      ctx.lineTo(r * 0.32, r * 0.2);
      ctx.stroke();
      ctx.restore();
      continue;
    }
    heartPath(ctx, h.r);
    ctx.fillStyle = h.kind === "red" ? RED : BLACK;
    ctx.fill();
    // kilau kecil
    ctx.beginPath();
    ctx.ellipse(-h.r * 0.45, -h.r * 0.45, h.r * 0.22, h.r * 0.13, -0.6, 0, Math.PI * 2);
    ctx.fillStyle = h.kind === "red" ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.18)";
    ctx.fill();
    ctx.restore();
  }

  // Keranjang
  const top = basketTop();
  const half = GAME.BASKET_W / 2;
  const inset = 9;
  ctx.save();
  ctx.shadowColor = pal.accent;
  ctx.shadowBlur = 16;
  ctx.fillStyle = pal.accent;
  ctx.beginPath();
  ctx.moveTo(g.basketX - half, top);
  ctx.lineTo(g.basketX + half, top);
  ctx.lineTo(g.basketX + half - inset, top + GAME.BASKET_H);
  ctx.lineTo(g.basketX - half + inset, top + GAME.BASKET_H);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;
  // anyaman
  ctx.strokeStyle = "rgba(255,255,255,0.35)";
  ctx.lineWidth = 1;
  for (let i = 1; i < 5; i++) {
    const x = g.basketX - half + (GAME.BASKET_W * i) / 5;
    ctx.beginPath();
    ctx.moveTo(x, top + 4);
    ctx.lineTo(x + (i - 2.5) * -1.6, top + GAME.BASKET_H);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(g.basketX - half + 3, top + GAME.BASKET_H * 0.55);
  ctx.lineTo(g.basketX + half - 3, top + GAME.BASKET_H * 0.55);
  ctx.stroke();
  // bibir keranjang
  ctx.fillStyle = pal.text;
  ctx.globalAlpha = 0.85;
  ctx.fillRect(g.basketX - half - 3, top - 3, GAME.BASKET_W + 6, 5);
  ctx.restore();

  // Percikan kecil saat menangkap hati merah
  ctx.save();
  for (const p of g.pops) {
    if (!p.good) continue;
    const t = p.age / 0.7;
    ctx.globalAlpha = Math.max(0, 1 - t);
    ctx.fillStyle = pal.accent;
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(p.x + Math.cos(a) * t * 28, p.y + 6 + Math.sin(a) * t * 18, 2.2 * (1 - t) + 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();

  // +10 / -5
  ctx.save();
  ctx.font = "600 18px system-ui, sans-serif";
  ctx.textAlign = "center";
  for (const p of g.pops) {
    ctx.globalAlpha = Math.max(0, 1 - p.age / 0.7);
    ctx.fillStyle = p.kind === "time" ? GOLD : p.good ? RED : BLACK;
    ctx.fillText(p.text, p.x, p.y - p.age * 46);
  }
  ctx.restore();
}

export function CatchTheLove({ guestName }: { guestName?: string } = {}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<GameState>(createGame());
  const inputRef = useRef<{ targetX: number | null; left: boolean; right: boolean }>({
    targetX: null,
    left: false,
    right: false,
  });
  const bestRef = useRef(0);
  const visibleRef = useRef(true);

  const [phase, setPhase] = useState<Phase>("idle");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number>(GAME.DURATION);
  const [best, setBest] = useState(0);
  const [newRecord, setNewRecord] = useState(false);
  const [board, setBoard] = useState<LeaderboardEntry[] | null>(null);
  const [boardError, setBoardError] = useState(false);
  const [playerName, setPlayerName] = useState(guestName?.trim() ?? "");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [saveError, setSaveError] = useState("");

  const loadBoard = useCallback(() => {
    fetchLeaderboard()
      .then((rows) => {
        setBoard(rows);
        setBoardError(false);
      })
      .catch(() => setBoardError(true));
  }, []);

  useEffect(() => {
    loadBoard();
  }, [loadBoard]);

  // Nama pemain: dari link tamu, atau terakhir yang diketik di perangkat ini.
  useEffect(() => {
    if (guestName?.trim()) return;
    try {
      const saved = localStorage.getItem(NAME_KEY);
      if (saved) startTransition(() => setPlayerName(saved));
    } catch {
      /* abaikan */
    }
  }, [guestName]);

  const save = useCallback(async (name: string, finalScore: number) => {
    const clean = name.trim();
    if (!clean || finalScore <= 0) return;
    setSaveState("saving");
    setSaveError("");
    try {
      const res = await submitScore(clean, finalScore);
      setBoard(res.scores);
      setSaveState("saved");
      try {
        localStorage.setItem(NAME_KEY, clean);
      } catch {
        /* abaikan */
      }
    } catch (e) {
      setSaveState("error");
      setSaveError(getErrorMessage(e, "Gagal menyimpan skor."));
    }
  }, []);

  // Skor tertinggi dari perangkat ini.
  useEffect(() => {
    const saved = readBest();
    bestRef.current = saved;
    startTransition(() => setBest(saved));
  }, []);

  // Ukuran kanvas (tajam di layar retina) + gambar awal.
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = GAME.W * dpr;
    canvas.height = GAME.H * dpr;
    draw(ctx, gameRef.current, readPalette(), dpr);
  }, []);

  // Jeda bila kanvas tidak terlihat (tamu menggulir pergi).
  useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([entry]) => {
      visibleRef.current = entry.intersectionRatio >= 0.4;
    }, { threshold: [0, 0.4, 1] });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Loop permainan
  useEffect(() => {
    if (phase !== "playing") return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const g = gameRef.current;
    const input = inputRef.current;

    let pal = readPalette();
    let palAt = performance.now();
    let last = performance.now();
    let shownSecs: number = GAME.DURATION;
    let raf = 0;

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      if (visibleRef.current) {
        const dir = (input.right ? 1 : 0) - (input.left ? 1 : 0);
        const changed = stepGame(g, dt, { targetX: input.targetX, dir: dir as -1 | 0 | 1 });
        if (changed) setScore(g.score);
        const secs = Math.ceil(g.timeLeft);
        if (secs !== shownSecs) {
          shownSecs = secs;
          setTimeLeft(secs);
        }
      }

      if (now - palAt > 500) {
        pal = readPalette();
        palAt = now;
      }
      draw(ctx, g, pal, dpr);

      if (g.timeLeft <= 0) {
        setScore(g.score);
        setTimeLeft(0);
        if (g.score > bestRef.current) {
          bestRef.current = g.score;
          writeBest(g.score);
          setBest(g.score);
          setNewRecord(true);
        }
        setPhase("done");
        if (guestName?.trim()) void save(guestName, g.score);
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    const onKey = (down: boolean) => (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === "arrowleft" || k === "a") input.left = down;
      else if (k === "arrowright" || k === "d") input.right = down;
      else return;
      if (down) input.targetX = null; // keyboard mengambil alih dari pointer
      e.preventDefault();
    };
    const onKeyDown = onKey(true);
    const onKeyUp = onKey(false);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [phase, guestName, save]);

  const start = useCallback(() => {
    gameRef.current = createGame();
    inputRef.current = { targetX: null, left: false, right: false };
    setScore(0);
    setTimeLeft(GAME.DURATION);
    setNewRecord(false);
    setSaveState("idle");
    setSaveError("");
    setPhase("playing");
    // Auto-scroll halaman harus berhenti selama bermain.
    window.dispatchEvent(new Event(PAUSE_AUTOSCROLL_EVENT));
    wrapRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, []);

  const movePointer = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (phase !== "playing") return;
    const rect = e.currentTarget.getBoundingClientRect();
    inputRef.current.targetX = ((e.clientX - rect.left) / rect.width) * GAME.W;
  };

  const needsName = phase === "done" && !guestName?.trim() && saveState !== "saved";
  const myKey = playerName.trim().toLowerCase();

  return (
    <section
      id="game"
      className="section relative overflow-hidden bg-[var(--bg-secondary)]"
      style={{
        backgroundImage:
          "radial-gradient(ellipse at 50% 0%, color-mix(in srgb, var(--accent) 16%, transparent), transparent 65%)",
      }}
    >
      <div className="section-inner max-w-md">
        <SectionHeader
          label="Mini Game"
          subtitle="Kumpulkan score sebanyak mungkin!"
        />

        <motion.div
          ref={wrapRef}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={fadeUp}
          transition={easeOut}
        >
          <div className="grid grid-cols-3 text-center mb-4" aria-live="off">
            {[
              { label: "Skor", value: score },
              { label: "Waktu", value: `${timeLeft}s` },
              { label: "Terbaik", value: best },
            ].map((item) => (
              <div key={item.label}>
                <p className="eyebrow mb-1">{item.label}</p>
                <p className="font-display text-2xl tabular-nums text-[var(--text-primary)]">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="relative p-3 text-[var(--accent)]">
            <CornerFrame />
            <div className="relative border border-[var(--border)] bg-[var(--bg-primary)] select-none shadow-[0_18px_40px_-24px_color-mix(in_srgb,var(--accent)_70%,transparent)]">
              <canvas
                ref={canvasRef}
                onPointerDown={(e) => {
                  if (phase !== "playing") return;
                  e.currentTarget.setPointerCapture(e.pointerId);
                  movePointer(e);
                }}
                onPointerMove={movePointer}
                style={{ touchAction: phase === "playing" ? "none" : "pan-y" }}
                className="block w-full h-auto"
                role="img"
                aria-label="Area permainan: geser keranjang untuk menangkap hati merah dan menghindari hati hitam"
              />

              {phase !== "playing" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-[var(--bg-primary)]/85 backdrop-blur-[2px] px-8 text-center">
                  {phase === "idle" ? (
                    <>
                      <Heart size={28} fill={RED} stroke="none" className="animate-pulse" aria-hidden />
                      <p className="font-display text-3xl text-[var(--text-primary)]">Catch the Love</p>
                      <ul className="font-body text-sm text-[var(--text-secondary)] space-y-2">
                        <li className="flex items-center justify-center gap-2">
                          <Heart size={14} fill={RED} stroke="none" /> +{GAME.RED_POINTS}
                        </li>
                        <li className="flex items-center justify-center gap-2">
                          <Heart size={14} fill={BLACK} stroke="none" /> −{GAME.BLACK_PENALTY}
                        </li>
                        <li className="flex items-center justify-center gap-2">
                          <span
                            aria-hidden
                            className="inline-block w-3.5 h-3.5 rounded-full"
                            style={{ background: GOLD }}
                          />+{GAME.BONUS_SECONDS}s
                        </li>
                        <li>Waktu {GAME.DURATION} detik</li>
                      </ul>
                      <button type="button" onClick={start} className="btn-editorial-filled !w-auto !px-10">
                        Mulai Bermain
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="eyebrow">Waktu habis</p>
                      <p className="font-display text-6xl tabular-nums text-[var(--text-primary)] leading-none">
                        {score}
                      </p>
                      <p className="font-body text-sm text-[var(--text-secondary)]">
                        {newRecord ? "Rekor baru! 🎉" : `Skor tertinggi: ${best}`}
                      </p>

                      {needsName && score > 0 && (
                        <form
                          className="w-full flex flex-col items-center gap-3"
                          onSubmit={(e) => {
                            e.preventDefault();
                            void save(playerName, score);
                          }}
                        >
                          <input
                            value={playerName}
                            onChange={(e) => setPlayerName(e.target.value)}
                            maxLength={40}
                            placeholder="Namamu untuk papan peringkat"
                            aria-label="Nama untuk papan peringkat"
                            className="w-full border-b border-[var(--border)] bg-transparent py-2 text-center font-body text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
                          />
                          <button
                            type="submit"
                            disabled={!playerName.trim() || saveState === "saving"}
                            className="btn-editorial"
                          >
                            {saveState === "saving" ? "Menyimpan…" : "Simpan skor"}
                          </button>
                        </form>
                      )}
                      {saveState === "saved" && (
                        <p className="eyebrow">Skor tersimpan di papan peringkat</p>
                      )}
                      {saveState === "saving" && guestName?.trim() && (
                        <p className="eyebrow">Menyimpan skor…</p>
                      )}
                      {saveState === "error" && (
                        <p className="font-body text-xs text-[var(--text-secondary)]">
                          {saveError}{" "}
                          <button
                            type="button"
                            className="underline"
                            onClick={() => void save(playerName || guestName || "", score)}
                          >
                            Coba lagi
                          </button>
                        </p>
                      )}

                      <button type="button" onClick={start} className="btn-editorial">
                        Main lagi
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Papan peringkat */}
          <div className="mt-10">
            <div className="flex items-center justify-center gap-2 mb-5 text-[var(--accent)]">
              <Trophy size={16} strokeWidth={1.5} aria-hidden />
              <p className="eyebrow !mb-0">Papan Peringkat</p>
            </div>
            {boardError ? (
              <p className="text-center font-body text-sm text-[var(--text-secondary)]">
                Papan peringkat belum bisa dimuat.{" "}
                <button type="button" className="underline" onClick={loadBoard}>
                  Coba lagi
                </button>
              </p>
            ) : board === null ? (
              <p className="text-center font-body text-sm text-[var(--text-tertiary)]">Memuat…</p>
            ) : board.length === 0 ? (
              <p className="text-center font-body text-sm text-[var(--text-secondary)]">
                Belum ada skor. Jadilah yang pertama!
              </p>
            ) : (
              <ol className="max-h-40 overflow-y-auto overscroll-contain border-y border-[var(--border)] [scrollbar-width:thin]">
                {board.map((row, i) => {
                  const mine = myKey !== "" && row.name.toLowerCase() === myKey;
                  return (
                    <li
                      key={`${row.name}-${i}`}
                      className={`flex items-baseline gap-4 py-3 border-b border-[var(--border)] last:border-b-0 ${
                        mine ? "bg-[var(--accent)]/10 px-3" : "px-3"
                      }`}
                    >
                      <span
                        className={`w-6 font-display tabular-nums ${
                          i === 0 ? "text-[var(--accent)] text-lg" : "text-[var(--text-tertiary)]"
                        }`}
                      >
                        {i + 1}
                      </span>
                      <span className="flex-1 truncate font-body text-sm capitalize text-[var(--text-primary)]">
                        {row.name}
                      </span>
                      <span className="font-display text-lg tabular-nums text-[var(--text-primary)]">
                        {row.score}
                      </span>
                    </li>
                  );
                })}
              </ol>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
