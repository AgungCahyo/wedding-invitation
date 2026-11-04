/**
 * Picks how a filter is applied: GPU (filters-gl.ts) when it is usable and
 * actually faster on this device, otherwise the original CPU pipeline
 * (filters.ts). Both produce the same grading, so preview and final photo
 * look alike whichever path each one ends up on.
 */

import { applyFilterToCanvas, isNeutral, type PhotoFilter } from "./filters";
import { disableGl, getGlEngine, type GlFilterEngine } from "./filters-gl";

export type FilterBackend = "gl" | "cpu";

// Decided once per page load by the preview's calibration (see
// preview-pipeline.ts). null = not measured yet.
let decided: FilterBackend | null = null;

export function decidedBackend(): FilterBackend | null {
  return decided;
}

export function decideBackend(b: FilterBackend) {
  decided = b;
}

/** The GPU engine, only if this device should use it. */
export function usableGl(): GlFilterEngine | null {
  if (decided === "cpu") return null;
  return getGlEngine();
}

/** After a GL error: stay on the CPU pipeline from now on. */
export function abandonGl() {
  decided = "cpu";
  disableGl();
}

/**
 * Applies `f` to `canvas` in place at full quality. GPU first, CPU if the GPU
 * is unavailable or throws. Returns which path produced the result.
 */
export function filterCanvas(canvas: HTMLCanvasElement, f: PhotoFilter): FilterBackend {
  if (isNeutral(f)) return "cpu";
  const gl = usableGl();
  if (gl && gl.fits(canvas.width, canvas.height)) {
    try {
      const out = gl.render(canvas, f);
      const ctx = canvas.getContext("2d");
      if (out && ctx) {
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = "copy";
        ctx.drawImage(out, 0, 0);
        ctx.globalCompositeOperation = "source-over";
        return "gl";
      }
    } catch (err) {
      console.warn("[photobooth] GPU filter failed, falling back to CPU:", err);
      abandonGl();
    }
  }
  applyFilterToCanvas(canvas, f);
  return "cpu";
}

/** Will `filterCanvas` use the GPU for an image of this size? */
export function willUseGl(w: number, h: number): boolean {
  const gl = usableGl();
  return !!gl && gl.fits(w, h);
}

/** Free GPU buffers sized for the full photo. */
export function releaseGlBuffers() {
  getGlEngine()?.release();
}
