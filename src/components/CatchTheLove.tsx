"use client";

import { motion } from "motion/react";
import { Heart } from "lucide-react";
import { startTransition, useCallback, useEffect, useRef, useState } from "react";
import { SectionHeader } from "@/src/components/ui/SectionHeader";
import { easeOut, fadeUp, viewportOnce } from "@/src/lib/motion";
import { PAUSE_AUTOSCROLL_EVENT } from "@/src/lib/floating-bar";
import { GAME, basketTop, createGame, stepGame, type GameState } from "@/src/lib/catch-love";

const BEST_KEY = "undangan-catch-love-best";
const RED = "#d6334a";
const BLACK = "#1c1917";

type Phase = "idle" | "playing" | "done";

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

  for (const h of g.hearts) {
    ctx.save();
    ctx.translate(h.x + Math.sin(h.phase + h.y * 0.025) * 3, h.y);
    ctx.rotate(Math.sin(h.phase + h.y * 0.02) * 0.18);
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
  ctx.fillStyle = pal.accent;
  ctx.beginPath();
  ctx.moveTo(g.basketX - half, top);
  ctx.lineTo(g.basketX + half, top);
  ctx.lineTo(g.basketX + half - inset, top + GAME.BASKET_H);
  ctx.lineTo(g.basketX - half + inset, top + GAME.BASKET_H);
  ctx.closePath();
  ctx.fill();
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

  // +10 / -5
  ctx.save();
  ctx.font = "600 18px system-ui, sans-serif";
  ctx.textAlign = "center";
  for (const p of g.pops) {
    ctx.globalAlpha = Math.max(0, 1 - p.age / 0.7);
    ctx.fillStyle = p.good ? RED : BLACK;
    ctx.fillText(p.text, p.x, p.y - p.age * 46);
  }
  ctx.restore();
}

export function CatchTheLove() {
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
  }, [phase]);

  const start = useCallback(() => {
    gameRef.current = createGame();
    inputRef.current = { targetX: null, left: false, right: false };
    setScore(0);
    setTimeLeft(GAME.DURATION);
    setNewRecord(false);
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

  return (
    <section id="game" className="section bg-[var(--bg-secondary)]">
      <div className="section-inner max-w-md">
        <SectionHeader
          label="Permainan"
          subtitle="Tangkap hati merah, hindari yang hitam. Geser keranjang dengan jari atau mouse, atau pakai tombol panah."
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

          <div className="relative border border-[var(--border)] bg-[var(--bg-primary)] select-none">
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
                    <p className="font-display text-3xl text-[var(--text-primary)]">Catch the Love</p>
                    <ul className="font-body text-sm text-[var(--text-secondary)] space-y-2">
                      <li className="flex items-center justify-center gap-2">
                        <Heart size={14} fill={RED} stroke="none" /> Hati merah +{GAME.RED_POINTS}
                      </li>
                      <li className="flex items-center justify-center gap-2">
                        <Heart size={14} fill={BLACK} stroke="none" /> Hati hitam −{GAME.BLACK_PENALTY}
                      </li>
                      <li>Waktu {GAME.DURATION} detik</li>
                    </ul>
                    {best > 0 && (
                      <p className="eyebrow">Skor tertinggi: {best}</p>
                    )}
                    <button type="button" onClick={start} className="btn-editorial">
                      Mulai
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
                    <button type="button" onClick={start} className="btn-editorial">
                      Main lagi
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
