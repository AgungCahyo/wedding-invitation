/**
 * Wedding frames — minimal, typographic, drawn procedurally on a canvas
 * (no image assets). Everything scales from the canvas width, so the same
 * function renders the live preview overlay and the final high-res photo.
 * Colors and fonts come from the active invitation theme.
 *
 * Design rules: hairlines instead of ornaments, one script moment (the
 * names), small tracked caps for details, one short italic line of copy.
 */

export interface FrameTheme {
  accent: string;
  accentMuted: string;
  bg: string;
  text: string;
  displayFont: string; // serif for captions
  scriptFont: string; // calligraphy for names
}

export interface FrameInfo {
  names: string; // "Ayu & Agung"
  date: string; // "04 Desember 2026"
}

export interface WeddingFrame {
  id: string;
  label: string;
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number, t: FrameTheme, info: FrameInfo) => void;
}

type Ctx = CanvasRenderingContext2D;

/* --------------------------------- copywriting -------------------------------- */

const COPY = {
hairline: "A moment worth keeping.",
gallery: "Here for the love, here for the memories.",
monogram: "A little piece of this beautiful day.",
editorial: ["Celebrating love,", "capturing memories."],
arch: "A day to remember, a moment to treasure.",
corner: "Glad to be part of your story.",
band: "CELEBRATE. CAPTURE. REMEMBER.",
circle: "Love brought us together.",
date: "A memory from this special day.",
} as const;

/* ---------------------------------- helpers --------------------------------- */

const WHITE = "#ffffff";
const WHITE_SOFT = "rgba(255,255,255,0.82)";

/** Letter-spaced text that works on every browser (no ctx.letterSpacing). */
function tracked(ctx: Ctx, text: string, x: number, y: number, tracking: number, align: "left" | "center" | "right" = "center") {
  const chars = Array.from(text);
  const widths = chars.map((c) => ctx.measureText(c).width);
  const total = widths.reduce((a, b) => a + b, 0) + tracking * (chars.length - 1);
  let cx = align === "center" ? x - total / 2 : align === "right" ? x - total : x;
  const prev = ctx.textAlign;
  ctx.textAlign = "left";
  chars.forEach((c, i) => {
    ctx.fillText(c, cx, y);
    cx += widths[i] + tracking;
  });
  ctx.textAlign = prev;
}

function trackedWidth(ctx: Ctx, text: string, tracking: number) {
  const chars = Array.from(text);
  return chars.reduce((a, c) => a + ctx.measureText(c).width, 0) + tracking * (chars.length - 1);
}

/** Shrinks a font size until the (tracked) text fits `maxW`. */
function fitSize(ctx: Ctx, make: (size: number) => string, text: string, size: number, tracking: number, maxW: number) {
  let s = size;
  for (let i = 0; i < 14; i++) {
    ctx.font = make(s);
    if (trackedWidth(ctx, text, tracking * (s / size)) <= maxW) break;
    s *= 0.94;
  }
  return s;
}

const display = (t: FrameTheme, size: number, opts: { italic?: boolean; weight?: number } = {}) =>
  `${opts.italic ? "italic " : ""}${opts.weight ?? 500} ${size}px ${t.displayFont}`;

function shadow(ctx: Ctx, blur: number, alpha = 0.35) {
  ctx.shadowColor = `rgba(0,0,0,${alpha})`;
  ctx.shadowBlur = blur;
  ctx.shadowOffsetY = blur * 0.12;
}
function noShadow(ctx: Ctx) {
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
}

function gradient(ctx: Ctx, w: number, h: number, from: number, to: number, a0: number, a1: number) {
  const g = ctx.createLinearGradient(0, h * from, 0, h * to);
  g.addColorStop(0, `rgba(0,0,0,${a0})`);
  g.addColorStop(1, `rgba(0,0,0,${a1})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, Math.min(h * from, h * to), w, Math.abs(h * to - h * from));
}

function initials(names: string) {
  const parts = names.split("&").map((s) => s.trim()[0]?.toUpperCase() ?? "");
  return parts.filter(Boolean).join(" & ");
}

/** "04 Desember 2026" → { day, month, year }; falls back gracefully. */
function parseDate(date: string) {
  const [day, month, year] = date.trim().split(/\s+/);
  return year ? { day, month, year } : { day: date, month: "", year: "" };
}

function rule(ctx: Ctx, cx: number, y: number, half: number, lw: number, color: string) {
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  ctx.beginPath();
  ctx.moveTo(cx - half, y);
  ctx.lineTo(cx + half, y);
  ctx.stroke();
}

/* ----------------------------------- frames ---------------------------------- */

const FRAMES: WeddingFrame[] = [
  { id: "none", label: "Tanpa Frame", draw: () => {} },

  /** One hairline, one line of copy, names and date. */
  {
    id: "hairline",
    label: "Hairline",
    draw: (ctx, w, h, t, info) => {
      const u = w / 1000;
      gradient(ctx, w, h, 0.6, 1, 0, 0.5);

      ctx.strokeStyle = "rgba(255,255,255,0.8)";
      ctx.lineWidth = 1.5 * u;
      ctx.strokeRect(40 * u, 40 * u, w - 80 * u, h - 80 * u);

      ctx.textBaseline = "alphabetic";
      shadow(ctx, 16 * u);

      ctx.fillStyle = WHITE_SOFT;
      ctx.font = display(t, 36 * u, { italic: true, weight: 400 });
      ctx.textAlign = "center";
      ctx.fillText(COPY.hairline, w / 2, h - 292 * u);

      ctx.fillStyle = WHITE;
      ctx.font = `${92 * u}px ${t.scriptFont}`;
      ctx.fillText(info.names, w / 2, h - 196 * u);
      noShadow(ctx);

      rule(ctx, w / 2, h - 150 * u, 34 * u, 1.5 * u, "rgba(255,255,255,0.7)");

      shadow(ctx, 12 * u, 0.3);
      ctx.fillStyle = WHITE;
      ctx.font = display(t, 20 * u);
      tracked(ctx, info.date.toUpperCase(), w / 2, h - 104 * u, 7 * u);
      noShadow(ctx);
    },
  },

  /** Museum-print matte: paper border, caption underneath. */
  {
    id: "gallery",
    label: "Galeri",
    draw: (ctx, w, h, t, info) => {
      const u = w / 1000;
      const side = 60 * u;
      const top = 60 * u;
      const bottom = 270 * u;
      const winH = h - top - bottom;

      ctx.fillStyle = t.bg;
      ctx.beginPath();
      ctx.rect(0, 0, w, h);
      ctx.rect(side, top, w - side * 2, winH);
      ctx.fill("evenodd");

      ctx.strokeStyle = "rgba(0,0,0,0.14)";
      ctx.lineWidth = 1.5 * u;
      ctx.strokeRect(side, top, w - side * 2, winH);

      ctx.textBaseline = "alphabetic";
      ctx.textAlign = "center";
      const baseY = top + winH;

      ctx.fillStyle = t.text;
      ctx.font = display(t, 44 * u, { italic: true, weight: 400 });
      ctx.fillText(COPY.gallery, w / 2, baseY + 112 * u);

      rule(ctx, w / 2, baseY + 150 * u, 24 * u, 1.5 * u, t.accent);

      ctx.fillStyle = t.accent;
      const line = `${info.names.toUpperCase()}   ·   ${info.date.toUpperCase()}`;
      const s = fitSize(ctx, (n) => display(t, n), line, 19 * u, 5 * u, w - side * 2 - 20 * u);
      ctx.font = display(t, s);
      tracked(ctx, line, w / 2, baseY + 200 * u, 5 * u * (s / (19 * u)));
    },
  },

  /** Initials in a thin circle, quiet line of copy above. */
  {
    id: "monogram",
    label: "Monogram",
    draw: (ctx, w, h, t, info) => {
      const u = w / 1000;
      gradient(ctx, w, h, 0, 0.2, 0.32, 0);
      gradient(ctx, w, h, 0.62, 1, 0, 0.55);

      ctx.textBaseline = "alphabetic";
      ctx.textAlign = "center";
      shadow(ctx, 14 * u);

      ctx.fillStyle = WHITE_SOFT;
      ctx.font = display(t, 36 * u, { italic: true, weight: 400 });
      ctx.fillText(COPY.monogram, w / 2, 112 * u);

      const cy = h - 256 * u;
      noShadow(ctx);
      ctx.strokeStyle = "rgba(255,255,255,0.85)";
      ctx.lineWidth = 1.5 * u;
      ctx.beginPath();
      ctx.arc(w / 2, cy, 70 * u, 0, Math.PI * 2);
      ctx.stroke();

      shadow(ctx, 12 * u, 0.3);
      ctx.fillStyle = WHITE;
      ctx.font = display(t, 48 * u, { italic: true, weight: 400 });
      ctx.textBaseline = "middle";
      ctx.fillText(initials(info.names), w / 2, cy + 3 * u);

      ctx.textBaseline = "alphabetic";
      ctx.font = display(t, 24 * u);
      tracked(ctx, info.names.toUpperCase(), w / 2, h - 120 * u, 9 * u);
      ctx.fillStyle = WHITE_SOFT;
      ctx.font = display(t, 18 * u);
      tracked(ctx, info.date.toUpperCase(), w / 2, h - 80 * u, 7 * u);
      noShadow(ctx);
    },
  },

  /** Magazine-cover layout: masthead, vertical date, two-line copy. */
  {
    id: "editorial",
    label: "Editorial",
    draw: (ctx, w, h, t, info) => {
      const u = w / 1000;
      gradient(ctx, w, h, 0, 0.26, 0.42, 0);
      gradient(ctx, w, h, 0.7, 1, 0, 0.5);

      ctx.textBaseline = "alphabetic";
      shadow(ctx, 14 * u);

      ctx.fillStyle = WHITE_SOFT;
      ctx.font = display(t, 15 * u);
      tracked(ctx, "THE WEDDING ISSUE", w / 2, 84 * u, 9 * u);

      const mast = info.names.toUpperCase();
      const s = fitSize(ctx, (n) => display(t, n, { weight: 500 }), mast, 84 * u, 16 * u, w - 140 * u);
      ctx.fillStyle = WHITE;
      ctx.font = display(t, s, { weight: 500 });
      tracked(ctx, mast, w / 2, 84 * u + s * 0.95, 16 * u * (s / (84 * u)));

      // vertical date, reading bottom-to-top along the left edge
      ctx.save();
      ctx.translate(56 * u, h / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillStyle = WHITE_SOFT;
      ctx.font = display(t, 17 * u);
      ctx.textAlign = "center";
      tracked(ctx, info.date.toUpperCase(), 0, 0, 9 * u);
      ctx.restore();

      ctx.textAlign = "left";
      ctx.fillStyle = WHITE;
      ctx.font = display(t, 52 * u, { italic: true, weight: 400 });
      ctx.fillText(COPY.editorial[0], 90 * u, h - 150 * u);
      ctx.fillText(COPY.editorial[1], 90 * u, h - 150 * u + 58 * u);
      noShadow(ctx);
    },
  },

  /** Single arched window on paper. */
  {
    id: "arch",
    label: "Arch",
    draw: (ctx, w, h, t, info) => {
      const u = w / 1000;
      const mx = 90 * u;
      const top = 80 * u;
      const bottom = h - 300 * u;
      const r = (w - mx * 2) / 2;

      const archPath = () => {
        ctx.moveTo(mx, bottom);
        ctx.lineTo(mx, top + r);
        ctx.arc(w / 2, top + r, r, Math.PI, 0);
        ctx.lineTo(w - mx, bottom);
        ctx.closePath();
      };

      ctx.fillStyle = t.bg;
      ctx.beginPath();
      ctx.rect(0, 0, w, h);
      archPath();
      ctx.fill("evenodd");

      ctx.beginPath();
      archPath();
      ctx.strokeStyle = t.accent;
      ctx.lineWidth = 2 * u;
      ctx.stroke();

      ctx.textAlign = "center";
      ctx.textBaseline = "alphabetic";

      ctx.fillStyle = t.text;
      ctx.font = display(t, 34 * u, { italic: true, weight: 400 });
      ctx.fillText(COPY.arch, w / 2, h - 232 * u);

      ctx.font = `${74 * u}px ${t.scriptFont}`;
      ctx.fillText(info.names, w / 2, h - 140 * u);

      ctx.fillStyle = t.accent;
      ctx.font = display(t, 19 * u);
      tracked(ctx, info.date.toUpperCase(), w / 2, h - 88 * u, 7 * u);
    },
  },

  /** Viewfinder crop marks in the corners. */
  {
    id: "corner",
    label: "Sudut",
    draw: (ctx, w, h, t, info) => {
      const u = w / 1000;
      gradient(ctx, w, h, 0.66, 1, 0, 0.5);

      const m = 48 * u;
      const L = 72 * u;
      ctx.strokeStyle = "rgba(255,255,255,0.9)";
      ctx.lineWidth = 2 * u;
      ([[m, m, 1, 1], [w - m, m, -1, 1], [m, h - m, 1, -1], [w - m, h - m, -1, -1]] as const).forEach(
        ([x, y, sx, sy]) => {
          ctx.beginPath();
          ctx.moveTo(x + sx * L, y);
          ctx.lineTo(x, y);
          ctx.lineTo(x, y + sy * L);
          ctx.stroke();
        }
      );

      ctx.textAlign = "center";
      ctx.textBaseline = "alphabetic";
      shadow(ctx, 14 * u);
      ctx.fillStyle = WHITE_SOFT;
      ctx.font = display(t, 34 * u, { italic: true, weight: 400 });
      ctx.fillText(COPY.corner, w / 2, h - 200 * u);

      ctx.fillStyle = WHITE;
      ctx.font = display(t, 28 * u);
      tracked(ctx, info.names.toUpperCase(), w / 2, h - 144 * u, 10 * u);
      ctx.fillStyle = WHITE_SOFT;
      ctx.font = display(t, 18 * u);
      tracked(ctx, info.date.toUpperCase(), w / 2, h - 104 * u, 7 * u);
      noShadow(ctx);
    },
  },

  /** Clean paper band along the bottom — names left, date right. */
  {
    id: "band",
    label: "Band",
    draw: (ctx, w, h, t, info) => {
      const u = w / 1000;
      const bandH = 168 * u;
      const y0 = h - bandH;
      ctx.fillStyle = t.bg;
      ctx.fillRect(0, y0, w, bandH);
      ctx.strokeStyle = "rgba(0,0,0,0.1)";
      ctx.lineWidth = 1.5 * u;
      ctx.beginPath();
      ctx.moveTo(0, y0);
      ctx.lineTo(w, y0);
      ctx.stroke();

      const pad = 56 * u;
      ctx.textBaseline = "alphabetic";
      ctx.fillStyle = t.accent;
      ctx.font = display(t, 13 * u);
      tracked(ctx, COPY.band, pad, y0 + 56 * u, 6 * u, "left");

      ctx.fillStyle = t.text;
      ctx.textAlign = "left";
      ctx.font = display(t, 58 * u, { italic: true, weight: 400 });
      ctx.fillText(info.names, pad, y0 + 124 * u);

      ctx.fillStyle = t.text;
      ctx.font = display(t, 17 * u);
      tracked(ctx, info.date.toUpperCase(), w - pad, y0 + 122 * u, 6 * u, "right");
    },
  },

  /** Round window on paper. */
  {
    id: "circle",
    label: "Bulat",
    draw: (ctx, w, h, t, info) => {
      const u = w / 1000;
      const cx = w / 2;
      const r = 410 * u;
      const cy = 80 * u + r;

      ctx.fillStyle = t.bg;
      ctx.beginPath();
      ctx.rect(0, 0, w, h);
      ctx.moveTo(cx + r, cy);
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill("evenodd");

      ctx.strokeStyle = t.accent;
      ctx.lineWidth = 2 * u;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = t.accentMuted;
      ctx.lineWidth = 1.5 * u;
      ctx.beginPath();
      ctx.arc(cx, cy, r + 16 * u, 0, Math.PI * 2);
      ctx.stroke();

      ctx.textAlign = "center";
      ctx.textBaseline = "alphabetic";
      ctx.fillStyle = t.text;
      ctx.font = display(t, 36 * u, { italic: true, weight: 400 });
      ctx.fillText(COPY.circle, w / 2, h - 214 * u);

      ctx.font = `${78 * u}px ${t.scriptFont}`;
      ctx.fillText(info.names, w / 2, h - 118 * u);

      ctx.fillStyle = t.accent;
      ctx.font = display(t, 18 * u);
      tracked(ctx, info.date.toUpperCase(), w / 2, h - 66 * u, 7 * u);
    },
  },

  /** No border at all — just the names, signed like a signature. */
  {
    id: "signature",
    label: "Signature",
    draw: (ctx, w, h, t, info) => {
      const u = w / 1000;
      gradient(ctx, w, h, 0.68, 1, 0, 0.42);

      ctx.textAlign = "center";
      ctx.textBaseline = "alphabetic";
      shadow(ctx, 18 * u);
      ctx.fillStyle = WHITE;
      ctx.font = `${116 * u}px ${t.scriptFont}`;
      ctx.fillText(info.names, w / 2, h - 170 * u);
      noShadow(ctx);

      rule(ctx, w / 2, h - 128 * u, 28 * u, 1.5 * u, "rgba(255,255,255,0.7)");

      shadow(ctx, 10 * u, 0.3);
      ctx.fillStyle = WHITE_SOFT;
      ctx.font = display(t, 19 * u);
      tracked(ctx, info.date.toUpperCase(), w / 2, h - 86 * u, 8 * u);
      noShadow(ctx);
    },
  },

  /** Save-the-date: oversized day numeral top-left. */
  {
    id: "date",
    label: "Tanggal",
    draw: (ctx, w, h, t, info) => {
      const u = w / 1000;
      const { day, month, year } = parseDate(info.date);
      gradient(ctx, w, h, 0, 0.34, 0.42, 0);
      gradient(ctx, w, h, 0.7, 1, 0, 0.5);

      const x = 80 * u;
      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";
      shadow(ctx, 16 * u);
      ctx.fillStyle = WHITE;
      ctx.font = display(t, 220 * u, { weight: 500 });
      ctx.fillText(day, x - 6 * u, 270 * u);

      ctx.font = display(t, 28 * u);
      if (month) tracked(ctx, month.toUpperCase(), x, 330 * u, 12 * u, "left");
      ctx.fillStyle = WHITE_SOFT;
      ctx.font = display(t, 22 * u);
      if (year) tracked(ctx, year, x, 372 * u, 12 * u, "left");

      ctx.fillStyle = WHITE;
      ctx.font = display(t, 58 * u, { italic: true, weight: 400 });
      ctx.fillText(COPY.date, x, h - 150 * u);
      ctx.fillStyle = WHITE_SOFT;
      ctx.font = display(t, 20 * u);
      tracked(ctx, info.names.toUpperCase(), x, h - 104 * u, 9 * u, "left");
      noShadow(ctx);
    },
  },
];

const MONTHS_EN: Record<string, string> = {
  januari: "January", februari: "February", maret: "March", mei: "May", juni: "June",
  juli: "July", agustus: "August", oktober: "October", desember: "December",
};

/** Frame typography is English, so Indonesian month names are translated. */
function englishDate(date: string) {
  return date.replace(/[A-Za-z]+/g, (m) => MONTHS_EN[m.toLowerCase()] ?? m);
}

export const WEDDING_FRAMES: WeddingFrame[] = FRAMES.map((f) => ({
  ...f,
  draw: (ctx, w, h, t, info) => f.draw(ctx, w, h, t, { ...info, date: englishDate(info.date) }),
}));

/** Reads the active theme straight from the page's CSS variables. */
export function readFrameTheme(): FrameTheme {
  const cs = getComputedStyle(document.documentElement);
  const v = (name: string, fallback: string) => cs.getPropertyValue(name).trim() || fallback;
  return {
    accent: v("--accent", "#b89a72"),
    accentMuted: v("--accent-muted", "#d4c4b0"),
    bg: v("--bg-primary", "#faf8f3"),
    text: v("--text-primary", "#2b2520"),
    displayFont: v("--font-display", "Georgia, serif"),
    scriptFont: `${v("--font-maellen", "Maellen")}, ${v("--font-display", "Georgia, serif")}`,
  };
}