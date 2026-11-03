import { applyFilterToCanvas, type PhotoFilter } from "./filters";
import type { FrameInfo, FrameTheme, WeddingFrame } from "./frames";

export const PHOTO_ASPECT = 3 / 4; // portrait, like a real photo strip
export const OUTPUT_WIDTH = 1080;
export const OUTPUT_HEIGHT = Math.round(OUTPUT_WIDTH / PHOTO_ASPECT); // 1440

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
  const canvas = document.createElement("canvas");
  canvas.width = OUTPUT_WIDTH;
  canvas.height = OUTPUT_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas tidak tersedia");

  drawCover(ctx, opts.source, OUTPUT_WIDTH, OUTPUT_HEIGHT, opts.mirror);
  applyFilterToCanvas(canvas, opts.filter); // filter the photo only, not the frame
  opts.frame.draw(ctx, OUTPUT_WIDTH, OUTPUT_HEIGHT, opts.theme, opts.info);
  return canvas;
}

export function canvasToBlob(canvas: HTMLCanvasElement, quality = 0.88): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Gagal membuat gambar"))),
      "image/jpeg",
      quality
    );
  });
}
