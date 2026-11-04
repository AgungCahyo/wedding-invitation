import type { PhotoFilter } from "./filters";
import { filterCanvas, releaseGlBuffers, willUseGl } from "./filter-engine";
import type { FrameInfo, FrameTheme, WeddingFrame } from "./frames";

export const PHOTO_ASPECT = 3 / 4; // portrait, like a real photo strip
// Output follows the source: never below 1440px wide (crisp frame typography),
// never above 1800px (keeps filtering fast and memory safe on phones).
export const MIN_OUTPUT_WIDTH = 1440;
export const MAX_OUTPUT_WIDTH = 1800;

export type PhotoSource = HTMLVideoElement | HTMLImageElement;

function sourceSize(src: PhotoSource) {
  return src instanceof HTMLVideoElement
    ? { w: src.videoWidth, h: src.videoHeight }
    : { w: src.naturalWidth, h: src.naturalHeight };
}

/** Draws `src` into the canvas like CSS object-fit: cover. */
export function drawCover(
  ctx: CanvasRenderingContext2D,
  src: PhotoSource,
  cw: number,
  ch: number,
  mirror: boolean
) {
  const { w, h } = sourceSize(src);
  if (!w || !h) return;
  const scale = Math.max(cw / w, ch / h);
  const dw = w * scale;
  const dh = h * scale;
  ctx.save();
  if (mirror) {
    ctx.translate(cw, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(src, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
  ctx.restore();
}

export interface ComposeOptions {
  source: PhotoSource;
  mirror: boolean;
  filter: PhotoFilter;
  frame: WeddingFrame;
  theme: FrameTheme;
  info: FrameInfo;
}

/** Photo → filter → frame, in that order, as a finished canvas. */
export function composePhoto(opts: ComposeOptions): HTMLCanvasElement {
  // Width of the 3:4 crop the source can actually provide.
  const { w: sw, h: sh } = sourceSize(opts.source);
  const cropW = Math.min(sw, sh * PHOTO_ASPECT);
  const outW = Math.round(Math.min(MAX_OUTPUT_WIDTH, Math.max(MIN_OUTPUT_WIDTH, cropW)) / 2) * 2;
  const outH = Math.round(outW / PHOTO_ASPECT);

  const canvas = document.createElement("canvas");
  canvas.width = outW;
  canvas.height = outH;
  // GPU path only draws/uploads this canvas, so it can stay GPU-backed; the
  // CPU fallback reads pixels back and wants a readback-friendly canvas.
  const gpu = willUseGl(outW, outH);
  const ctx = canvas.getContext("2d", gpu ? undefined : { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas tidak tersedia");
  ctx.imageSmoothingQuality = "high";

  drawCover(ctx, opts.source, outW, outH, opts.mirror);
  filterCanvas(canvas, opts.filter); // filter the photo only, not the frame (GPU, or CPU fallback)
  opts.frame.draw(ctx, outW, outH, opts.theme, opts.info);
  if (gpu) releaseGlBuffers(); // full-size GPU buffers aren't needed for the live preview
  return canvas;
}

export function canvasToBlob(canvas: HTMLCanvasElement, quality = 0.95): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Gagal membuat gambar"))),
      "image/jpeg",
      quality
    );
  });
}