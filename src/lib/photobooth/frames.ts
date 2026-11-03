/**
 * Wedding frames, drawn procedurally on a canvas (no image assets).
 * Everything scales from the canvas width, so the same function renders the
 * live preview overlay and the final high-res photo — what you see is what
 * you get. Colors come from the active invitation theme.
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

/* ---------------------------------- helpers --------------------------------- */

function caption(
  ctx: CanvasRenderingContext2D,
  cx: number,
  y: number,
  u: number,
  t: FrameTheme,
  info: FrameInfo,
  color: string,
  accent: string
) {
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = color;
  ctx.font = `${64 * u}px ${t.scriptFont}`;
  ctx.fillText(info.names, cx, y);

  ctx.fillStyle = accent;
  ctx.font = `500 ${20 * u}px ${t.displayFont}`;
  // letterSpacing is supported on modern canvases; harmless if ignored.
  (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = `${5 * u}px`;
  ctx.fillText(info.date.toUpperCase(), cx, y + 40 * u);
  (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = "0px";
}

function leaf(ctx: CanvasRenderingContext2D, x: number, y: number, len: number, angle: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(len * 0.5, -len * 0.38, len, 0);
  ctx.quadraticCurveTo(len * 0.5, len * 0.38, 0, 0);
  ctx.fill();
  ctx.restore();
}

function blossom(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string, center: string) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = color;
  for (let i = 0; i < 6; i++) {
    ctx.rotate(Math.PI / 3);
    ctx.beginPath();
    ctx.ellipse(r * 0.55, 0, r * 0.55, r * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = center;
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.22, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** A curved branch with leaves + blossoms, drawn for the top-left corner. */
function sprig(ctx: CanvasRenderingContext2D, u: number, t: FrameTheme) {
  const P = [
    [24, 300],
    [30, 160],
    [90, 70],
    [300, 24],
  ].map(([x, y]) => [x * u, y * u]);

  const at = (k: number): [number, number] => {
    const m = 1 - k;
    return [
      m * m * m * P[0][0] + 3 * m * m * k * P[1][0] + 3 * m * k * k * P[2][0] + k * k * k * P[3][0],
      m * m * m * P[0][1] + 3 * m * m * k * P[1][1] + 3 * m * k * k * P[2][1] + k * k * k * P[3][1],
    ];
  };
  const tangent = (k: number) => {
    const [x1, y1] = at(Math.max(0, k - 0.01));
    const [x2, y2] = at(Math.min(1, k + 0.01));
    return Math.atan2(y2 - y1, x2 - x1);
  };

  ctx.strokeStyle = t.accent;
  ctx.lineWidth = 3 * u;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(P[0][0], P[0][1]);
  ctx.bezierCurveTo(P[1][0], P[1][1], P[2][0], P[2][1], P[3][0], P[3][1]);
  ctx.stroke();

  // leaves alternate sides along the stem
  ctx.fillStyle = t.accent;
  ctx.globalAlpha = 0.92;
  for (let i = 0; i < 9; i++) {
    const k = 0.1 + i * 0.1;
    const [x, y] = at(k);
    const side = i % 2 === 0 ? -1 : 1;
    leaf(ctx, x, y, (70 - i * 3) * u, tangent(k) + side * 0.75);
  }
  ctx.globalAlpha = 1;

  ctx.fillStyle = t.accentMuted;
  [0.3, 0.62, 0.86].forEach((k, i) => {
    const [x, y] = at(k);
    leaf(ctx, x, y, 48 * u, tangent(k) + (i % 2 ? 0.55 : -0.55));
  });

  [0.2, 0.5, 0.78].forEach((k, i) => {
    const [x, y] = at(k);
    blossom(ctx, x, y, (26 - i * 3) * u, t.accentMuted, t.accent);
  });
}

/* ----------------------------------- frames ---------------------------------- */

export const WEDDING_FRAMES: WeddingFrame[] = [
  {
    id: "none",
    label: "Tanpa Frame",
    draw: () => {},
  },

  {
    id: "classic",
    label: "Klasik",
    draw: (ctx, w, h, t, info) => {
      const u = w / 1000;
      // soft bottom gradient so the caption reads on any photo
      const g = ctx.createLinearGradient(0, h * 0.72, 0, h);
      g.addColorStop(0, "rgba(0,0,0,0)");
      g.addColorStop(1, "rgba(0,0,0,0.55)");
      ctx.fillStyle = g;
      ctx.fillRect(0, h * 0.72, w, h * 0.28);

      ctx.strokeStyle = t.accentMuted;
      ctx.lineWidth = 3 * u;
      ctx.strokeRect(34 * u, 34 * u, w - 68 * u, h - 68 * u);
      ctx.strokeStyle = t.accent;
      ctx.lineWidth = 1.5 * u;
      ctx.strokeRect(52 * u, 52 * u, w - 104 * u, h - 104 * u);

      caption(ctx, w / 2, h - 118 * u, u, t, info, "#ffffff", t.accentMuted);
    },
  },

  {
    id: "polaroid",
    label: "Polaroid",
    draw: (ctx, w, h, t, info) => {
      const u = w / 1000;
      const side = 44 * u;
      const top = 44 * u;
      const bottom = 220 * u;
      ctx.fillStyle = t.bg;
      // even-odd cut-out: paper border around the photo window
      ctx.beginPath();
      ctx.rect(0, 0, w, h);
      ctx.rect(side, top, w - side * 2, h - top - bottom);
      ctx.fill("evenodd");

      ctx.strokeStyle = "rgba(0,0,0,0.12)";
      ctx.lineWidth = 2 * u;
      ctx.strokeRect(side, top, w - side * 2, h - top - bottom);

      caption(ctx, w / 2, h - bottom + 98 * u, u, t, info, t.text, t.accent);
    },
  },

  {
    id: "floral",
    label: "Floral",
    draw: (ctx, w, h, t, info) => {
      const u = w / 1000;
      const corners: Array<[number, number, number]> = [
        [0, 0, 0], [w, 0, 1], [0, h, 2], [w, h, 3],
      ];
      corners.forEach(([x, y, i]) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(i === 1 || i === 3 ? -1 : 1, i >= 2 ? -1 : 1);
        sprig(ctx, u, t);
        ctx.restore();
      });

      const g = ctx.createLinearGradient(0, h * 0.78, 0, h);
      g.addColorStop(0, "rgba(0,0,0,0)");
      g.addColorStop(1, "rgba(0,0,0,0.5)");
      ctx.fillStyle = g;
      ctx.fillRect(0, h * 0.78, w, h * 0.22);
      caption(ctx, w / 2, h - 84 * u, u, t, info, "#ffffff", t.accentMuted);
    },
  },

  {
    id: "arch",
    label: "Arch",
    draw: (ctx, w, h, t, info) => {
      const u = w / 1000;
      const mx = 90 * u;
      const top = 80 * u;
      const bottom = h - 250 * u;
      const r = (w - mx * 2) / 2;

      // adds the arch to the current path (caller owns beginPath)
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
      ctx.lineWidth = 3 * u;
      ctx.stroke();

      ctx.save();
      ctx.translate(w / 2, top + r);
      ctx.scale((r + 16 * u) / r, (r + 16 * u) / r);
      ctx.translate(-w / 2, -(top + r));
      ctx.beginPath();
      archPath();
      ctx.restore();
      ctx.strokeStyle = t.accentMuted;
      ctx.lineWidth = 1.5 * u;
      ctx.stroke();

      caption(ctx, w / 2, h - 118 * u, u, t, info, t.text, t.accent);
    },
  },
];

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
