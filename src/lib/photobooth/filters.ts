/**
 * Photo filters.
 *
 * Each filter is described once as plain numbers. From that we derive:
 *  - a CSS `filter` string  → live video preview
 *  - a per-pixel transform  → the captured photo
 *
 * Why not `ctx.filter` on the canvas? Safari (incl. every iOS browser) does
 * not support it, so guests on iPhones would get unfiltered photos. Pixel
 * math works everywhere and matches the CSS preview.
 */

export interface PhotoFilter {
  id: string;
  label: string;
  grayscale?: number; // 0..1
  sepia?: number; // 0..1
  saturate?: number; // 1 = unchanged
  hueRotate?: number; // degrees
  contrast?: number; // 1 = unchanged
  brightness?: number; // 1 = unchanged
}

export const PHOTO_FILTERS: PhotoFilter[] = [
  { id: "normal", label: "Asli" },
  { id: "warm", label: "Hangat", sepia: 0.22, saturate: 1.15, contrast: 1.03, brightness: 1.03 },
  { id: "soft", label: "Lembut", brightness: 1.08, contrast: 0.9, saturate: 0.95 },
  { id: "rose", label: "Rose", sepia: 0.18, saturate: 1.3, hueRotate: -12, brightness: 1.04 },
  { id: "vintage", label: "Vintage", sepia: 0.55, contrast: 0.92, brightness: 1.05, saturate: 0.85 },
  { id: "bw", label: "Hitam Putih", grayscale: 1, contrast: 1.12 },
];

export function filterToCss(f: PhotoFilter): string {
  const parts: string[] = [];
  if (f.grayscale) parts.push(`grayscale(${f.grayscale})`);
  if (f.sepia) parts.push(`sepia(${f.sepia})`);
  if (f.saturate !== undefined && f.saturate !== 1) parts.push(`saturate(${f.saturate})`);
  if (f.hueRotate) parts.push(`hue-rotate(${f.hueRotate}deg)`);
  if (f.contrast !== undefined && f.contrast !== 1) parts.push(`contrast(${f.contrast})`);
  if (f.brightness !== undefined && f.brightness !== 1) parts.push(`brightness(${f.brightness})`);
  return parts.length ? parts.join(" ") : "none";
}

type Mat3 = [number, number, number, number, number, number, number, number, number];

const IDENTITY: Mat3 = [1, 0, 0, 0, 1, 0, 0, 0, 1];

function mul(a: Mat3, b: Mat3): Mat3 {
  const r = new Array(9).fill(0) as number[];
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 3; j++)
      for (let k = 0; k < 3; k++) r[i * 3 + j] += a[i * 3 + k] * b[k * 3 + j];
  return r as Mat3;
}

// Matrices follow the W3C Filter Effects spec so output matches CSS filters.
function grayscaleM(amount: number): Mat3 {
  const s = 1 - amount;
  return [
    0.2126 + 0.7874 * s, 0.7152 - 0.7152 * s, 0.0722 - 0.0722 * s,
    0.2126 - 0.2126 * s, 0.7152 + 0.2848 * s, 0.0722 - 0.0722 * s,
    0.2126 - 0.2126 * s, 0.7152 - 0.7152 * s, 0.0722 + 0.9278 * s,
  ];
}
function sepiaM(amount: number): Mat3 {
  const s = 1 - amount;
  return [
    0.393 + 0.607 * s, 0.769 - 0.769 * s, 0.189 - 0.189 * s,
    0.349 - 0.349 * s, 0.686 + 0.314 * s, 0.168 - 0.168 * s,
    0.272 - 0.272 * s, 0.534 - 0.534 * s, 0.131 + 0.869 * s,
  ];
}
function saturateM(s: number): Mat3 {
  return [
    0.213 + 0.787 * s, 0.715 - 0.715 * s, 0.072 - 0.072 * s,
    0.213 - 0.213 * s, 0.715 + 0.285 * s, 0.072 - 0.072 * s,
    0.213 - 0.213 * s, 0.715 - 0.715 * s, 0.072 + 0.928 * s,
  ];
}
function hueM(deg: number): Mat3 {
  const a = (deg * Math.PI) / 180;
  const c = Math.cos(a);
  const s = Math.sin(a);
  return [
    0.213 + c * 0.787 - s * 0.213, 0.715 - c * 0.715 - s * 0.715, 0.072 - c * 0.072 + s * 0.928,
    0.213 - c * 0.213 + s * 0.143, 0.715 + c * 0.285 + s * 0.14, 0.072 - c * 0.072 - s * 0.283,
    0.213 - c * 0.213 - s * 0.787, 0.715 - c * 0.715 + s * 0.715, 0.072 + c * 0.928 + s * 0.072,
  ];
}

/** Apply a filter to a canvas in place. No-op for the "normal" filter. */
export function applyFilterToCanvas(canvas: HTMLCanvasElement, f: PhotoFilter) {
  if (filterToCss(f) === "none") return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  let m = IDENTITY;
  if (f.grayscale) m = mul(grayscaleM(f.grayscale), m);
  if (f.sepia) m = mul(sepiaM(f.sepia), m);
  if (f.saturate !== undefined && f.saturate !== 1) m = mul(saturateM(f.saturate), m);
  if (f.hueRotate) m = mul(hueM(f.hueRotate), m);
  const contrast = f.contrast ?? 1;
  const brightness = f.brightness ?? 1;

  const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i], g = d[i + 1], b = d[i + 2];
    let nr = m[0] * r + m[1] * g + m[2] * b;
    let ng = m[3] * r + m[4] * g + m[5] * b;
    let nb = m[6] * r + m[7] * g + m[8] * b;
    nr = (contrast * (nr / 255 - 0.5) + 0.5) * brightness * 255;
    ng = (contrast * (ng / 255 - 0.5) + 0.5) * brightness * 255;
    nb = (contrast * (nb / 255 - 0.5) + 0.5) * brightness * 255;
    d[i] = nr < 0 ? 0 : nr > 255 ? 255 : nr;
    d[i + 1] = ng < 0 ? 0 : ng > 255 ? 255 : ng;
    d[i + 2] = nb < 0 ? 0 : nb > 255 ? 255 : nb;
  }
  ctx.putImageData(img, 0, 0);
}
