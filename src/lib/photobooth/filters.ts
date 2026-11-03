/**
 * Photo effects — a small color-grading pipeline, not CSS-style filters.
 *
 * Every effect is described once as plain numbers (exposure, tone curve,
 * highlights/shadows, white balance, split-toning, skin softening, glow,
 * vignette, grain). The same `applyFilterToCanvas` runs for the live
 * preview and the final photo, so what the guest sees is what they get.
 *
 * Pure pixel math + drawImage only (no `ctx.filter`), so it behaves the
 * same on Safari / iOS as everywhere else.
 */

type RGB = [number, number, number];

export interface PhotoFilter {
  id: string;
  label: string;

  /* tone */
  exposure?: number; // stops, -1..1
  contrast?: number; // S-curve strength, -1..1
  highlights?: number; // -1..1 (negative = recover highlights)
  shadows?: number; // -1..1 (positive = open up shadows)
  fade?: number; // 0..1 lifts the blacks (matte / film look)

  /* color */
  temperature?: number; // -1 cool .. 1 warm
  tint?: number; // -1 green .. 1 magenta
  saturation?: number; // -1..1
  vibrance?: number; // -1..1 (boosts only the muted colors)
  mono?: boolean;
  splitTone?: {
    shadow: RGB; // hue pushed into the shadows
    highlight: RGB; // hue pushed into the highlights
    amount: number; // 0..1
    balance?: number; // -1 (more shadow) .. 1 (more highlight)
  };

  /* finish */
  skin?: number; // 0..1 soft, edge-aware skin smoothing
  glow?: number; // 0..1 soft bloom on highlights
  vignette?: number; // 0..1
  grain?: number; // 0..1 film grain
}

export const PHOTO_FILTERS: PhotoFilter[] = [
  { id: "normal", label: "Asli" },
  {
    id: "airy",
    label: "Airy",
    exposure: 0.22,
    contrast: -0.12,
    highlights: -0.25,
    shadows: 0.35,
    fade: 0.05,
    temperature: 0.06,
    saturation: -0.08,
    vibrance: 0.18,
    skin: 0.5,
    glow: 0.3,
  },
  {
    id: "golden",
    label: "Golden Hour",
    exposure: 0.1,
    contrast: 0.14,
    highlights: -0.3,
    shadows: 0.22,
    temperature: 0.38,
    tint: 0.04,
    saturation: 0.04,
    vibrance: 0.25,
    splitTone: { shadow: [120, 70, 40], highlight: [255, 200, 130], amount: 0.35, balance: 0.2 },
    skin: 0.4,
    glow: 0.45,
    vignette: 0.22,
  },
  {
    id: "film",
    label: "Film",
    exposure: 0.05,
    contrast: 0.1,
    highlights: -0.2,
    shadows: 0.25,
    fade: 0.16,
    temperature: 0.14,
    tint: -0.05,
    saturation: -0.14,
    vibrance: 0.1,
    splitTone: { shadow: [70, 110, 120], highlight: [255, 214, 170], amount: 0.38, balance: 0.1 },
    skin: 0.28,
    glow: 0.2,
    vignette: 0.16,
    grain: 0.38,
  },
  {
    id: "cinema",
    label: "Cinematic",
    exposure: -0.04,
    contrast: 0.34,
    highlights: -0.22,
    shadows: 0.1,
    fade: 0.05,
    temperature: 0.02,
    saturation: -0.1,
    vibrance: 0.2,
    splitTone: { shadow: [20, 90, 110], highlight: [255, 170, 100], amount: 0.55, balance: 0 },
    skin: 0.25,
    glow: 0.15,
    vignette: 0.42,
    grain: 0.14,
  },
  {
    id: "rose",
    label: "Rose Matte",
    exposure: 0.12,
    contrast: -0.05,
    highlights: -0.15,
    shadows: 0.3,
    fade: 0.2,
    temperature: 0.08,
    tint: 0.2,
    saturation: -0.12,
    vibrance: 0.15,
    splitTone: { shadow: [150, 80, 110], highlight: [255, 215, 215], amount: 0.4, balance: 0.15 },
    skin: 0.45,
    glow: 0.3,
    vignette: 0.1,
    grain: 0.1,
  },
  {
    id: "clean",
    label: "Clean",
    exposure: 0.14,
    contrast: 0.12,
    highlights: -0.2,
    shadows: 0.2,
    vibrance: 0.22,
    saturation: 0.02,
    skin: 0.5,
  },
  {
    id: "pastel",
    label: "Pastel",
    exposure: 0.2,
    contrast: -0.1,
    highlights: -0.2,
    shadows: 0.35,
    fade: 0.18,
    temperature: 0.04,
    tint: 0.1,
    saturation: -0.1,
    vibrance: 0.3,
    splitTone: { shadow: [150, 130, 190], highlight: [255, 228, 208], amount: 0.35, balance: 0.1 },
    skin: 0.5,
    glow: 0.3,
  },
  {
    id: "dreamy",
    label: "Dreamy",
    exposure: 0.2,
    contrast: -0.2,
    highlights: -0.3,
    shadows: 0.3,
    fade: 0.1,
    temperature: 0.1,
    saturation: -0.05,
    vibrance: 0.15,
    skin: 0.65,
    glow: 0.85,
    vignette: 0.08,
  },
  {
    id: "sunset",
    label: "Sunset",
    exposure: 0.04,
    contrast: 0.2,
    highlights: -0.25,
    shadows: 0.15,
    temperature: 0.55,
    tint: 0.14,
    saturation: 0.08,
    vibrance: 0.25,
    splitTone: { shadow: [110, 50, 90], highlight: [255, 170, 110], amount: 0.45, balance: 0.15 },
    skin: 0.3,
    glow: 0.5,
    vignette: 0.28,
  },
  {
    id: "vintage",
    label: "Vintage 70s",
    exposure: 0.04,
    contrast: 0.06,
    highlights: -0.2,
    shadows: 0.25,
    fade: 0.26,
    temperature: 0.32,
    tint: -0.04,
    saturation: -0.22,
    splitTone: { shadow: [90, 70, 40], highlight: [255, 225, 170], amount: 0.42, balance: 0.1 },
    glow: 0.15,
    vignette: 0.32,
    grain: 0.55,
  },
  {
    id: "moody",
    label: "Moody",
    exposure: -0.16,
    contrast: 0.3,
    highlights: -0.3,
    shadows: -0.1,
    fade: 0.06,
    temperature: -0.1,
    saturation: -0.18,
    vibrance: 0.1,
    splitTone: { shadow: [30, 70, 70], highlight: [235, 205, 170], amount: 0.4, balance: -0.1 },
    skin: 0.2,
    vignette: 0.55,
    grain: 0.2,
  },
  {
    id: "nordic",
    label: "Nordic",
    exposure: 0.16,
    contrast: 0.02,
    highlights: -0.2,
    shadows: 0.3,
    fade: 0.08,
    temperature: -0.3,
    saturation: -0.2,
    vibrance: 0.1,
    splitTone: { shadow: [70, 100, 130], highlight: [235, 242, 255], amount: 0.3 },
    skin: 0.35,
    glow: 0.2,
  },
  {
    id: "silver",
    label: "Silver",
    mono: true,
    exposure: 0.14,
    contrast: -0.02,
    highlights: -0.2,
    shadows: 0.3,
    fade: 0.16,
    splitTone: { shadow: [70, 80, 95], highlight: [250, 248, 244], amount: 0.2 },
    skin: 0.45,
    glow: 0.3,
    grain: 0.2,
  },
  {
    id: "noir",
    label: "Noir",
    mono: true,
    exposure: 0.02,
    contrast: 0.42,
    highlights: -0.15,
    shadows: 0.05,
    fade: 0.04,
    splitTone: { shadow: [40, 50, 70], highlight: [255, 238, 215], amount: 0.25, balance: 0.1 },
    skin: 0.2,
    glow: 0.12,
    vignette: 0.5,
    grain: 0.42,
  },
];

/* --------------------------------- helpers --------------------------------- */

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/** Smooth S-curve around mid-grey; k > 0 adds contrast, k < 0 flattens. */
function sCurve(v: number, k: number): number {
  if (k === 0) return v;
  const s = v * v * (3 - 2 * v); // smoothstep
  return k > 0 ? v + (s - v) * k * 1.6 : v + (v - s) * -k * 1.6 * 0.6;
}

const lutCache = new WeakMap<PhotoFilter, [Float32Array, Float32Array, Float32Array]>();

/** Cached: a filter's curves never change, so build them once, not per frame. */
function lutsFor(f: PhotoFilter) {
  let l = lutCache.get(f);
  if (!l) {
    l = buildLuts(f);
    lutCache.set(f, l);
  }
  return l;
}

/** Per-channel 256-entry LUT: exposure → white balance → contrast → fade. */
function buildLuts(f: PhotoFilter): [Float32Array, Float32Array, Float32Array] {
  const gain = Math.pow(2, f.exposure ?? 0);
  const temp = f.temperature ?? 0;
  const tint = f.tint ?? 0;
  const wb: RGB = [
    1 + temp * 0.16 + tint * 0.05,
    1 - Math.abs(temp) * 0.015 - tint * 0.08,
    1 - temp * 0.2 + tint * 0.05,
  ];
  const k = f.contrast ?? 0;
  const fade = f.fade ?? 0;

  return [0, 1, 2].map((c) => {
    const lut = new Float32Array(256);
    for (let i = 0; i < 256; i++) {
      let v = (i / 255) * gain * wb[c];
      v = clamp01(v);
      v = sCurve(v, k);
      // matte: raise the black point, softly roll off the whites
      v = fade ? v * (1 - fade * 0.55) + fade * 0.14 : v;
      lut[i] = clamp01(v);
    }
    return lut;
  }) as [Float32Array, Float32Array, Float32Array];
}

/* ------------------------------ blur (no ctx.filter) ------------------------------ */

interface BlurRig {
  mid: HTMLCanvasElement;
  small: HTMLCanvasElement;
  full: HTMLCanvasElement;
  sw: number;
  sh: number;
}

// One set of canvases per (size, blur) so nothing is re-allocated per frame —
// resizing a canvas every frame is what makes mobile browsers crawl.
const rigs = new Map<string, BlurRig>();

function rigFor(w: number, h: number, divisor: number): BlurRig {
  const key = `${w}x${h}@${divisor}`;
  let rig = rigs.get(key);
  if (!rig) {
    if (rigs.size > 8) rigs.clear();
    const mk = (cw: number, ch: number) => {
      const c = document.createElement("canvas");
      c.width = cw;
      c.height = ch;
      return c;
    };
    const sw = Math.max(8, Math.round(w / divisor));
    const sh = Math.max(8, Math.round(h / divisor));
    rig = { mid: mk(sw * 2, sh * 2), small: mk(sw, sh), full: mk(w, h), sw, sh };
    rigs.set(key, rig);
  }
  return rig;
}

/**
 * Cheap, cross-browser blur: shrink then grow with smoothing. `divisor` is
 * relative to the image so preview and final look alike. Returns pixel data
 * at full size.
 */
function blurredData(src: HTMLCanvasElement, divisor: number): Uint8ClampedArray {
  const w = src.width;
  const h = src.height;
  const rig = rigFor(w, h, divisor);

  const mctx = rig.mid.getContext("2d")!;
  mctx.imageSmoothingQuality = "high";
  mctx.drawImage(src, 0, 0, rig.mid.width, rig.mid.height);

  const sctx = rig.small.getContext("2d")!;
  sctx.imageSmoothingQuality = "high";
  sctx.drawImage(rig.mid, 0, 0, rig.sw, rig.sh);

  const fctx = rig.full.getContext("2d", { willReadFrequently: true })!;
  fctx.imageSmoothingEnabled = true;
  fctx.imageSmoothingQuality = "high";
  fctx.drawImage(rig.small, 0, 0, w, h);
  return fctx.getImageData(0, 0, w, h).data;
}

/* ---- precomputed tables (vignette shape + film grain) ---- */

const vigMasks = new Map<string, Float32Array>();

function vignetteMask(w: number, h: number): Float32Array {
  const key = `${w}x${h}`;
  let m = vigMasks.get(key);
  if (!m) {
    if (vigMasks.size > 4) vigMasks.clear();
    m = new Float32Array(w * h);
    const cx = w / 2;
    const cy = h / 2;
    const maxD = Math.hypot(cx, cy);
    for (let y = 0, p = 0; y < h; y++) {
      for (let x = 0; x < w; x++, p++) {
        const dist = Math.hypot(x - cx, y - cy) / maxD;
        m[p] = Math.pow(smooth(0.35, 1.05, dist), 1.4) * 0.85;
      }
    }
    vigMasks.set(key, m);
  }
  return m;
}

let noiseTable: Float32Array | null = null;
function noise(): Float32Array {
  if (!noiseTable) {
    noiseTable = new Float32Array(65536);
    let seed = 1337;
    for (let i = 0; i < 65536; i++) {
      seed = (seed * 1664525 + 1013904223) | 0;
      noiseTable[i] = ((seed >>> 8) & 0xffff) / 65535 - 0.5;
    }
  }
  return noiseTable;
}

/* ------------------------------- the pipeline -------------------------------- */

/** True when the filter leaves the photo untouched. */
export function isNeutral(f: PhotoFilter): boolean {
  return (
    !f.exposure && !f.contrast && !f.highlights && !f.shadows && !f.fade &&
    !f.temperature && !f.tint && !f.saturation && !f.vibrance && !f.mono &&
    !f.splitTone && !f.skin && !f.glow && !f.vignette && !f.grain
  );
}

/** Apply a filter to a canvas in place. No-op for the "normal" filter. */
export function applyFilterToCanvas(canvas: HTMLCanvasElement, f: PhotoFilter) {
  if (isNeutral(f)) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const w = canvas.width;
  const h = canvas.height;
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;

  const skinAmt = f.skin ?? 0;
  const glowAmt = f.glow ?? 0;
  // blur is taken from the untouched photo, so grab it before editing
  const skinBlur = skinAmt > 0 ? blurredData(canvas, 4) : null;
  const glowBlur = glowAmt > 0 ? blurredData(canvas, 22) : null;

  const [lutR, lutG, lutB] = lutsFor(f);
  const hi = f.highlights ?? 0;
  const sh = f.shadows ?? 0;
  const sat = f.saturation ?? 0;
  const vib = f.vibrance ?? 0;
  const vig = f.vignette ?? 0;
  const grain = f.grain ?? 0;
  const st = f.splitTone;

  // split-tone as a luma-preserving chroma shift
  const toShift = (c: RGB): RGB => {
    const l = (0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]) / 255;
    return [c[0] / 255 - l, c[1] / 255 - l, c[2] / 255 - l];
  };
  const sShift = st ? toShift(st.shadow) : [0, 0, 0];
  const hShift = st ? toShift(st.highlight) : [0, 0, 0];
  const bal = st?.balance ?? 0;

  const vigMask = vig ? vignetteMask(w, h) : null;
  const grainTable = grain ? noise() : null;

  for (let p = 0, i = 0; p < w * h; p++, i += 4) {
    let r = d[i];
    let g = d[i + 1];
    let b = d[i + 2];

    /* 1 — skin softening: edge-aware blend toward a blurred copy, skin tones only */
    if (skinBlur) {
      const bl = skinBlur[i], bg = skinBlur[i + 1], bb = skinBlur[i + 2];
      const isSkin = r > g && g > b * 0.9 && r - b > 14 && r > 70 ? 1 : 0.15;
      const edge = Math.abs(0.299 * (r - bl) + 0.587 * (g - bg) + 0.114 * (b - bb));
      const keep = 1 - smooth(6, 34, edge); // flat areas get smoothed, edges stay crisp
      const k = skinAmt * 0.85 * isSkin * keep;
      r += (bl - r) * k;
      g += (bg - g) * k;
      b += (bb - b) * k;
    }

    /* 2 — exposure / white balance / S-curve / fade via LUT */
    let R = lutR[r | 0];
    let G = lutG[g | 0];
    let B = lutB[b | 0];

    /* 3 — highlights & shadows (luminance-masked) */
    let Y = 0.2126 * R + 0.7152 * G + 0.0722 * B;
    if (hi || sh) {
      const lift = sh * 0.3 * (1 - Y) * (1 - Y) + hi * 0.3 * Y * Y;
      R += lift;
      G += lift;
      B += lift;
      Y += lift;
    }

    /* 4 — glow: soft bloom from the blurred highlights (screen blend) */
    if (glowBlur) {
      const gy = (0.2126 * glowBlur[i] + 0.7152 * glowBlur[i + 1] + 0.0722 * glowBlur[i + 2]) / 255;
      const bloom = smooth(0.45, 1, gy) * glowAmt * 0.55;
      R = 1 - (1 - R) * (1 - bloom * (0.85 + (glowBlur[i] / 255) * 0.15));
      G = 1 - (1 - G) * (1 - bloom * 0.92);
      B = 1 - (1 - B) * (1 - bloom * (0.8 + (glowBlur[i + 2] / 255) * 0.1));
    }

    /* 5 — saturation + vibrance (vibrance protects already-vivid colors) */
    Y = 0.2126 * R + 0.7152 * G + 0.0722 * B;
    if (f.mono) {
      R = G = B = Y;
    } else if (sat || vib) {
      const mx = Math.max(R, G, B);
      const mn = Math.min(R, G, B);
      const factor = 1 + sat + vib * (1 - clamp01(mx - mn) * 1.4);
      R = Y + (R - Y) * factor;
      G = Y + (G - Y) * factor;
      B = Y + (B - Y) * factor;
    }

    /* 6 — split-toning */
    if (st) {
      const t = clamp01(Y + bal * 0.3);
      const wS = (1 - smooth(0.1, 0.7, t)) * st.amount;
      const wH = smooth(0.35, 0.95, t) * st.amount;
      R += sShift[0] * wS + hShift[0] * wH;
      G += sShift[1] * wS + hShift[1] * wH;
      B += sShift[2] * wS + hShift[2] * wH;
    }

    /* 7 — vignette */
    if (vigMask) {
      const m = 1 - vig * vigMask[p];
      R *= m;
      G *= m;
      B *= m;
    }

    /* 8 — film grain (strongest in the mids) */
    if (grainTable) {
      const n = grainTable[(p * 7919 + (p >>> 8)) & 65535];
      const mid = 1 - Math.abs(Y * 2 - 1) * 0.65;
      const gAmt = n * grain * 0.14 * mid;
      R += gAmt;
      G += gAmt;
      B += gAmt;
    }

    d[i] = R < 0 ? 0 : R > 1 ? 255 : R * 255;
    d[i + 1] = G < 0 ? 0 : G > 1 ? 255 : G * 255;
    d[i + 2] = B < 0 ? 0 : B > 1 ? 255 : B * 255;
  }

  ctx.putImageData(img, 0, 0);
}