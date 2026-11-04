/**
 * Live preview renderer. One instance owns the work canvases, so switching
 * presets or resizing never re-allocates anything per frame.
 *
 * Backend choice is measured, not assumed: the first time a filtered preview
 * runs, a handful of frames are timed on the GPU path and on the CPU path on
 * this very device, and the faster one is kept (GPU must win by a clear
 * margin). If WebGL is missing, is a software renderer, or throws, the CPU
 * pipeline is used — the original code, unchanged.
 */

import { applyFilterToCanvas, type PhotoFilter } from "./filters";
import { getGlEngine } from "./filters-gl";
import { abandonGl, decideBackend, decidedBackend, usableGl, type FilterBackend } from "./filter-engine";
import { drawCover, type PhotoSource } from "./compose";

interface Work {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
}

const GPU_MUST_BE_FASTER_BY = 0.85; // GPU ms must be < 85% of CPU ms to be picked

export class PreviewPipeline {
  private tctx: CanvasRenderingContext2D;
  private gpuWork: Work | null = null;
  private cpuWork: Work | null = null;

  constructor(private target: HTMLCanvasElement) {
    const ctx = target.getContext("2d");
    if (!ctx) throw new Error("Canvas tidak tersedia");
    this.tctx = ctx;
  }

  /** Backend used for the last frame (null until the first frame ran). */
  get backend(): FilterBackend | null {
    return decidedBackend();
  }

  private work(kind: "gpu" | "cpu", w: number, h: number): Work {
    let wk = kind === "gpu" ? this.gpuWork : this.cpuWork;
    if (!wk) {
      const canvas = document.createElement("canvas");
      // GPU path never reads pixels back; CPU path reads every frame.
      const ctx = canvas.getContext("2d", kind === "cpu" ? { willReadFrequently: true } : undefined);
      if (!ctx) throw new Error("Canvas tidak tersedia");
      ctx.imageSmoothingQuality = "high";
      wk = { canvas, ctx };
      if (kind === "gpu") this.gpuWork = wk;
      else this.cpuWork = wk;
    }
    if (wk.canvas.width !== w || wk.canvas.height !== h) {
      wk.canvas.width = w;
      wk.canvas.height = h;
    }
    return wk;
  }

  private renderGpu(src: PhotoSource, mirror: boolean, f: PhotoFilter): boolean {
    const engine = usableGl();
    if (!engine) return false;
    const w = this.target.width;
    const h = this.target.height;
    const wk = this.work("gpu", w, h);
    drawCover(wk.ctx, src, w, h, mirror);
    const out = engine.render(wk.canvas, f);
    if (!out) return false;
    this.tctx.drawImage(out, 0, 0);
    return true;
  }

  private renderCpu(src: PhotoSource, mirror: boolean, f: PhotoFilter) {
    const w = this.target.width;
    const h = this.target.height;
    const wk = this.work("cpu", w, h);
    drawCover(wk.ctx, src, w, h, mirror);
    applyFilterToCanvas(wk.canvas, f);
    this.tctx.drawImage(wk.canvas, 0, 0);
  }

  /** Times both paths on real frames from this device and keeps the faster. */
  private calibrate(src: PhotoSource, mirror: boolean, f: PhotoFilter) {
    const engine = getGlEngine();
    if (!engine) {
      decideBackend("cpu");
      return;
    }
    const median = (a: number[]) => {
      const s = a.slice(1).sort((x, y) => x - y); // first run pays one-off setup
      return s[Math.floor((s.length - 1) / 2)];
    };
    const gpuMs: number[] = [];
    const cpuMs: number[] = [];
    try {
      for (let i = 0; i < 5; i++) {
        const t = performance.now();
        if (!this.renderGpu(src, mirror, f)) throw new Error("gpu render unavailable");
        engine.sync(); // include GPU time, not just command submission
        gpuMs.push(performance.now() - t);
      }
    } catch (err) {
      console.warn("[photobooth] GPU preview failed, using CPU:", err);
      abandonGl();
      return;
    }
    for (let i = 0; i < 3; i++) {
      const t = performance.now();
      this.renderCpu(src, mirror, f);
      cpuMs.push(performance.now() - t);
    }
    decideBackend(median(gpuMs) < median(cpuMs) * GPU_MUST_BE_FASTER_BY ? "gl" : "cpu");
  }

  /** Draws one graded frame into the target canvas. */
  render(src: PhotoSource, mirror: boolean, f: PhotoFilter) {
    if (decidedBackend() === null) this.calibrate(src, mirror, f);

    if (decidedBackend() === "gl") {
      try {
        if (this.renderGpu(src, mirror, f)) return;
      } catch (err) {
        console.warn("[photobooth] GPU preview failed, using CPU:", err);
        abandonGl();
      }
    }
    this.renderCpu(src, mirror, f);
  }
}
