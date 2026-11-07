/**
 * Logika murni "Catch the Love" (tanpa DOM/React) supaya mudah dites.
 * Koordinat logis: lebar W × tinggi H; kanvas hanya menskalakannya.
 */
export const GAME = {
  W: 360,
  H: 480,
  DURATION: 30,
  RED_POINTS: 10,
  BLACK_PENALTY: 5,
  BASKET_W: 84,
  BASKET_H: 40,
  BASKET_BOTTOM: 14,
  BASKET_SPEED: 340, // px/detik untuk kontrol keyboard
  BONUS_SECONDS: 5, // tambahan waktu dari hati emas
  MAX_TIME_HEARTS: 4, // jumlah maksimum hati emas per permainan
  MAX_DURATION: 30 + 5 * 4, // batas atas durasi (dipakai server untuk validasi skor)
} as const;

export type HeartKind = "red" | "black" | "time";

export interface Heart {
  x: number;
  y: number;
  r: number;
  vy: number;
  kind: HeartKind;
  /** Goyangan kecil agar jatuhnya tidak kaku. */
  phase: number;
}

export interface Pop {
  x: number;
  y: number;
  text: string;
  good: boolean;
  kind: HeartKind;
  age: number;
}

export interface GameState {
  hearts: Heart[];
  pops: Pop[];
  basketX: number;
  score: number;
  timeLeft: number;
  elapsed: number;
  spawnIn: number;
  redCaught: number;
  blackCaught: number;
  /** Detik tambahan yang sudah didapat dari hati emas. */
  bonus: number;
  /** Jumlah hati emas yang sudah muncul (dibatasi MAX_TIME_HEARTS). */
  timeSpawned: number;
}

export interface StepInput {
  /** Posisi keranjang yang dituju (pointer), atau null bila tidak ada. */
  targetX: number | null;
  /** -1 kiri, 0 diam, 1 kanan (keyboard). */
  dir: -1 | 0 | 1;
}

export const basketTop = () => GAME.H - GAME.BASKET_BOTTOM - GAME.BASKET_H;

export function clampBasket(x: number) {
  const half = GAME.BASKET_W / 2;
  return Math.max(half, Math.min(GAME.W - half, x));
}

export function createGame(): GameState {
  return {
    hearts: [],
    pops: [],
    basketX: GAME.W / 2,
    score: 0,
    timeLeft: GAME.DURATION,
    elapsed: 0,
    spawnIn: 0.4,
    redCaught: 0,
    blackCaught: 0,
    bonus: 0,
    timeSpawned: 0,
  };
}

function spawn(s: GameState, rand: () => number) {
  // Makin lama makin banyak hati hitam dan makin cepat jatuhnya.
  const progress = Math.min(1, s.elapsed / GAME.DURATION);
  let kind: HeartKind = rand() < 0.22 + progress * 0.13 ? "black" : "red";
  // Hati emas: langka, tidak muncul di awal, dan jumlahnya dibatasi.
  if (s.timeSpawned < GAME.MAX_TIME_HEARTS && s.elapsed > 4 && rand() < 0.07) {
    kind = "time";
    s.timeSpawned++;
  }
  const r = 14 + rand() * 5;
  s.hearts.push({
    x: r + rand() * (GAME.W - r * 2),
    y: -r,
    r,
    vy: 130 + progress * 90 + rand() * 60,
    kind,
    phase: rand() * Math.PI * 2,
  });
}

/**
 * Maju `dt` detik. Mengubah `s` di tempat dan mengembalikan true bila skor berubah.
 * Skor tidak pernah di bawah 0.
 */
export function stepGame(s: GameState, dt: number, input: StepInput, rand: () => number = Math.random): boolean {
  let scoreChanged = false;

  // Keranjang: pointer menimpa, keyboard menggeser.
  if (input.targetX !== null) s.basketX = clampBasket(input.targetX);
  if (input.dir !== 0) s.basketX = clampBasket(s.basketX + input.dir * GAME.BASKET_SPEED * dt);

  s.elapsed += dt;
  s.timeLeft = Math.max(0, GAME.DURATION + s.bonus - s.elapsed);

  s.spawnIn -= dt;
  while (s.spawnIn <= 0 && s.timeLeft > 0) {
    spawn(s, rand);
    s.spawnIn += Math.max(0.32, 0.8 - Math.min(1, s.elapsed / GAME.DURATION) * 0.45);
  }

  const top = basketTop();
  const half = GAME.BASKET_W / 2;
  const alive: Heart[] = [];
  for (const h of s.hearts) {
    h.y += h.vy * dt;
    const inMouth = h.y + h.r * 0.6 >= top && h.y - h.r <= top + 14;
    const aligned = Math.abs(h.x - s.basketX) <= half + h.r * 0.3;
    if (inMouth && aligned) {
      const before = s.score;
      if (h.kind === "time") {
        s.bonus += GAME.BONUS_SECONDS;
        s.timeLeft += GAME.BONUS_SECONDS;
      } else if (h.kind === "red") {
        s.score += GAME.RED_POINTS;
        s.redCaught++;
      } else {
        s.score = Math.max(0, s.score - GAME.BLACK_PENALTY);
        s.blackCaught++;
      }
      scoreChanged ||= s.score !== before;
      s.pops.push({
        x: h.x,
        y: top - 6,
        text:
          h.kind === "time"
            ? `+${GAME.BONUS_SECONDS}s`
            : h.kind === "red"
              ? `+${GAME.RED_POINTS}`
              : `-${GAME.BLACK_PENALTY}`,
        good: h.kind !== "black",
        kind: h.kind,
        age: 0,
      });
      continue;
    }
    if (h.y - h.r <= GAME.H + 10) alive.push(h);
  }
  s.hearts = alive;

  s.pops = s.pops.map((p) => ({ ...p, age: p.age + dt })).filter((p) => p.age < 0.7);
  return scoreChanged;
}
