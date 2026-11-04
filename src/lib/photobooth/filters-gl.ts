/**
 * GPU version of the color-grading pipeline in `filters.ts`.
 *
 * It is a line-by-line port of `applyFilterToCanvas` (same constants, same
 * order of operations) and it reuses the CPU module's own tone LUTs and noise
 * table, so preset values live in exactly one place. The one preview and the
 * final photo both go through this file, which keeps their grading identical.
 *
 * Plain WebGL1 (works on iOS Safari and Android Chrome), no dependencies.
 * `getGlEngine()` returns null whenever the GPU path should not be used
 * (no WebGL, software renderer, lost context, too-small float precision, image
 * larger than the texture limit) and callers then use the CPU pipeline.
 */

import { lutsFor, noise, type PhotoFilter } from "./filters";

export interface GlFilterEngine {
  /** Can an image of this size be processed on the GPU? */
  fits(w: number, h: number): boolean;
  /**
   * Grades `src` and returns the engine's own canvas (same size as `src`).
   * Draw it right away — its contents are only guaranteed until the next
   * render. Returns null when the GPU path can't be used.
   */
  render(src: HTMLCanvasElement, f: PhotoFilter): HTMLCanvasElement | null;
  /** Blocks until the GPU finished (used by the one-off speed calibration). */
  sync(): void;
  /** Give large buffers back (after the full-size photo). */
  release(): void;
  readonly renderer: string;
}

/* --------------------------------- shaders --------------------------------- */

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = vec2(aPos.x * 0.5 + 0.5, 0.5 - aPos.y * 0.5); // v = 0 is the top row
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

// Offscreen blur targets: framebuffer row 0 is NDC y = -1, so map v = 0 (image
// top) there; otherwise the stored blur ends up upside-down.
const VERT_DOWN = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

const PRECISION = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
`;

// Box-average downscale (replaces the CPU's shrink-then-grow blur).
const FRAG_DOWN = `${PRECISION}
varying vec2 vUv;
uniform sampler2D uSrc;
uniform vec2 uStep; // footprint of one target pixel, in source uv
uniform vec2 uN;    // taps per axis
void main() {
  vec2 base = vUv - uStep * 0.5;
  vec3 acc = vec3(0.0);
  float cnt = 0.0;
  for (int j = 0; j < 24; j++) {
    if (float(j) >= uN.y) break;
    float fy = (float(j) + 0.5) / uN.y;
    for (int i = 0; i < 24; i++) {
      if (float(i) >= uN.x) break;
      float fx = (float(i) + 0.5) / uN.x;
      acc += texture2D(uSrc, base + uStep * vec2(fx, fy)).rgb;
      cnt += 1.0;
    }
  }
  gl_FragColor = vec4(acc / cnt, 1.0);
}`;

const FRAG_MAIN = `${PRECISION}
varying vec2 vUv;
uniform sampler2D uSrc;
uniform sampler2D uSkinTex;
uniform sampler2D uGlowTex;
uniform sampler2D uLut;   // 256x1: R,G,B tone curves (exposure/WB/contrast/fade)
uniform sampler2D uNoise; // 256x256 film-grain table
uniform vec2 uSize;
uniform float uHi, uSh, uSat, uVib, uMono, uStAmt, uStBal, uVig, uGrain, uSkin, uGlow;
uniform vec3 uSShift, uHShift;

float luma(vec3 c) { return dot(c, vec3(0.2126, 0.7152, 0.0722)); }

void main() {
  // work in 0..255 like the CPU path (skin thresholds are defined there)
  vec3 c = floor(texture2D(uSrc, vUv).rgb * 255.0 + 0.5);

  /* 1 - skin softening */
  if (uSkin > 0.0) {
    vec3 bl = texture2D(uSkinTex, vUv).rgb * 255.0;
    float isSkin = (c.r > c.g && c.g > c.b * 0.9 && c.r - c.b > 14.0 && c.r > 70.0) ? 1.0 : 0.15;
    float edge = abs(dot(c - bl, vec3(0.299, 0.587, 0.114)));
    float keep = 1.0 - smoothstep(6.0, 34.0, edge);
    c += (bl - c) * (uSkin * 0.85 * isSkin * keep);
  }

  /* 2 - exposure / white balance / S-curve / fade (LUT) */
  vec3 idx = floor(clamp(c, 0.0, 255.0));
  vec3 v = vec3(
    texture2D(uLut, vec2((idx.r + 0.5) / 256.0, 0.5)).r,
    texture2D(uLut, vec2((idx.g + 0.5) / 256.0, 0.5)).g,
    texture2D(uLut, vec2((idx.b + 0.5) / 256.0, 0.5)).b
  );

  /* 3 - highlights & shadows */
  float Y = luma(v);
  if (uHi != 0.0 || uSh != 0.0) {
    float lift = uSh * 0.3 * (1.0 - Y) * (1.0 - Y) + uHi * 0.3 * Y * Y;
    v += lift;
    Y += lift;
  }

  /* 4 - glow */
  if (uGlow > 0.0) {
    vec3 gb = texture2D(uGlowTex, vUv).rgb;
    float bloom = smoothstep(0.45, 1.0, luma(gb)) * uGlow * 0.55;
    v.r = 1.0 - (1.0 - v.r) * (1.0 - bloom * (0.85 + gb.r * 0.15));
    v.g = 1.0 - (1.0 - v.g) * (1.0 - bloom * 0.92);
    v.b = 1.0 - (1.0 - v.b) * (1.0 - bloom * (0.8 + gb.b * 0.1));
  }

  /* 5 - saturation + vibrance */
  Y = luma(v);
  if (uMono > 0.5) {
    v = vec3(Y);
  } else if (uSat != 0.0 || uVib != 0.0) {
    float mx = max(v.r, max(v.g, v.b));
    float mn = min(v.r, min(v.g, v.b));
    float factor = 1.0 + uSat + uVib * (1.0 - clamp(mx - mn, 0.0, 1.0) * 1.4);
    v = vec3(Y) + (v - vec3(Y)) * factor;
  }

  /* 6 - split-toning */
  if (uStAmt > 0.0) {
    float t = clamp(Y + uStBal * 0.3, 0.0, 1.0);
    float wS = (1.0 - smoothstep(0.1, 0.7, t)) * uStAmt;
    float wH = smoothstep(0.35, 0.95, t) * uStAmt;
    v += uSShift * wS + uHShift * wH;
  }

  /* 7 - vignette */
  if (uVig > 0.0) {
    vec2 ctr = uSize * 0.5;
    vec2 pc = vec2(floor(gl_FragCoord.x), uSize.y - 1.0 - floor(gl_FragCoord.y));
    float dist = length(pc - ctr) / length(ctr);
    float s = smoothstep(0.35, 1.05, dist);
    float shape = s > 0.0 ? pow(s, 1.4) * 0.85 : 0.0;
    v *= 1.0 - uVig * shape;
  }

  /* 8 - film grain (same table + same index maths as the CPU path) */
  if (uGrain > 0.0) {
    float p = (uSize.y - 1.0 - floor(gl_FragCoord.y)) * uSize.x + floor(gl_FragCoord.x);
    float a = mod(p, 65536.0);
    float a1 = floor(a / 256.0);
    float a0 = a - a1 * 256.0;
    float t = mod(mod(a1 * 7919.0, 256.0) * 256.0 + a0 * 7919.0 + floor(p / 256.0), 65536.0);
    vec2 uv = vec2((mod(t, 256.0) + 0.5) / 256.0, (floor(t / 256.0) + 0.5) / 256.0);
    float n = texture2D(uNoise, uv).r - 0.5;
    float mid = 1.0 - abs(Y * 2.0 - 1.0) * 0.65;
    v += n * uGrain * 0.14 * mid;
  }

  gl_FragColor = vec4(clamp(v, 0.0, 1.0), 1.0);
}`;

/* --------------------------------- engine ---------------------------------- */

const SOFTWARE_RENDERER = /swiftshader|llvmpipe|softpipe|software|basic render/i;
const MAX_TAPS = 24;

interface Target {
  tex: WebGLTexture;
  fbo: WebGLFramebuffer;
  w: number;
  h: number;
}

class Engine implements GlFilterEngine {
  readonly canvas: HTMLCanvasElement;
  readonly renderer: string;
  private gl: WebGLRenderingContext;
  private down: WebGLProgram;
  private main: WebGLProgram;
  private quad: WebGLBuffer;
  private texSrc: WebGLTexture;
  private texLut: WebGLTexture;
  private texNoise: WebGLTexture;
  private texDummy: WebGLTexture;
  private skin: Target | null = null;
  private glow: Target | null = null;
  private srcW = 0;
  private srcH = 0;
  private lastFilter: PhotoFilter | null = null;
  private lastSize = "";
  private maxTex: number;
  private u: Record<string, WebGLUniformLocation | null> = {};
  private ud: Record<string, WebGLUniformLocation | null> = {};

  constructor(canvas: HTMLCanvasElement, gl: WebGLRenderingContext, renderer: string) {
    this.canvas = canvas;
    this.gl = gl;
    this.renderer = renderer;
    this.maxTex = Math.min(gl.getParameter(gl.MAX_TEXTURE_SIZE) as number, 4096);

    this.down = this.program(VERT_DOWN, FRAG_DOWN);
    this.main = this.program(VERT, FRAG_MAIN);
    for (const n of ["uSrc", "uStep", "uN"]) this.ud[n] = gl.getUniformLocation(this.down, n);
    for (const n of [
      "uSrc", "uSkinTex", "uGlowTex", "uLut", "uNoise", "uSize", "uHi", "uSh", "uSat",
      "uVib", "uMono", "uStAmt", "uStBal", "uVig", "uGrain", "uSkin", "uGlow", "uSShift", "uHShift",
    ]) this.u[n] = gl.getUniformLocation(this.main, n);

    this.quad = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quad);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

    gl.disable(gl.DITHER); // dithering would shift 8-bit output values
    gl.disable(gl.BLEND);
    gl.disable(gl.DEPTH_TEST);

    this.texSrc = this.makeTexture(gl.LINEAR);
    this.texLut = this.makeTexture(gl.NEAREST);
    this.texNoise = this.makeTexture(gl.NEAREST);
    this.texDummy = this.makeTexture(gl.LINEAR);
    gl.bindTexture(gl.TEXTURE_2D, this.texDummy);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 255]));

    // grain table: 65536 values in [-0.5, 0.5] stored as bytes
    const nz = noise();
    const bytes = new Uint8Array(256 * 256 * 4);
    for (let i = 0; i < 65536; i++) {
      const b = Math.round((nz[i] + 0.5) * 255);
      bytes[i * 4] = bytes[i * 4 + 1] = bytes[i * 4 + 2] = b;
      bytes[i * 4 + 3] = 255;
    }
    gl.bindTexture(gl.TEXTURE_2D, this.texNoise);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 256, 256, 0, gl.RGBA, gl.UNSIGNED_BYTE, bytes);
  }

  fits(w: number, h: number) {
    return w > 0 && h > 0 && w <= this.maxTex && h <= this.maxTex;
  }

  private program(vs: string, fs: string): WebGLProgram {
    const gl = this.gl;
    const sh = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        throw new Error("shader: " + gl.getShaderInfoLog(s));
      }
      return s;
    };
    const p = gl.createProgram()!;
    gl.attachShader(p, sh(gl.VERTEX_SHADER, vs));
    gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs));
    gl.bindAttribLocation(p, 0, "aPos");
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      throw new Error("link: " + gl.getProgramInfoLog(p));
    }
    return p;
  }

  private makeTexture(filter: number): WebGLTexture {
    const gl = this.gl;
    const t = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return t;
  }

  private target(cur: Target | null, w: number, h: number): Target {
    const gl = this.gl;
    if (cur && cur.w === w && cur.h === h) return cur;
    if (cur) this.freeTarget(cur);
    const tex = this.makeTexture(gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    const fbo = gl.createFramebuffer()!;
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
      throw new Error("framebuffer incomplete");
    }
    return { tex, fbo, w, h };
  }

  private freeTarget(t: Target | null) {
    if (!t) return;
    this.gl.deleteTexture(t.tex);
    this.gl.deleteFramebuffer(t.fbo);
  }

  /** Blur source for skin (div 4) / glow (div 22): same relative sizes as the CPU path. */
  private blur(cur: Target | null, w: number, h: number, divisor: number): Target {
    const gl = this.gl;
    const sw = Math.max(8, Math.round(w / divisor));
    const sh = Math.max(8, Math.round(h / divisor));
    const t = this.target(cur, sw, sh);
    gl.bindFramebuffer(gl.FRAMEBUFFER, t.fbo);
    gl.viewport(0, 0, sw, sh);
    gl.useProgram(this.down);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texSrc);
    gl.uniform1i(this.ud.uSrc, 0);
    gl.uniform2f(this.ud.uStep, 1 / sw, 1 / sh);
    gl.uniform2f(
      this.ud.uN,
      Math.min(MAX_TAPS, Math.max(1, Math.ceil(w / sw))),
      Math.min(MAX_TAPS, Math.max(1, Math.ceil(h / sh)))
    );
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    return t;
  }

  private setFilterUniforms(f: PhotoFilter) {
    const gl = this.gl;
    const u = this.u;
    gl.uniform1f(u.uHi, f.highlights ?? 0);
    gl.uniform1f(u.uSh, f.shadows ?? 0);
    gl.uniform1f(u.uSat, f.saturation ?? 0);
    gl.uniform1f(u.uVib, f.vibrance ?? 0);
    gl.uniform1f(u.uMono, f.mono ? 1 : 0);
    gl.uniform1f(u.uVig, f.vignette ?? 0);
    gl.uniform1f(u.uGrain, f.grain ?? 0);
    gl.uniform1f(u.uSkin, f.skin ?? 0);
    gl.uniform1f(u.uGlow, f.glow ?? 0);

    const st = f.splitTone;
    const shift = (c: [number, number, number]) => {
      const l = (0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]) / 255;
      return [c[0] / 255 - l, c[1] / 255 - l, c[2] / 255 - l];
    };
    const s = st ? shift(st.shadow) : [0, 0, 0];
    const h = st ? shift(st.highlight) : [0, 0, 0];
    gl.uniform1f(u.uStAmt, st ? st.amount : 0);
    gl.uniform1f(u.uStBal, st?.balance ?? 0);
    gl.uniform3f(u.uSShift, s[0], s[1], s[2]);
    gl.uniform3f(u.uHShift, h[0], h[1], h[2]);

    // tone curves — built by the CPU module so both paths share one definition
    const [lr, lg, lb] = lutsFor(f);
    const bytes = new Uint8Array(256 * 4);
    for (let i = 0; i < 256; i++) {
      bytes[i * 4] = Math.round(lr[i] * 255);
      bytes[i * 4 + 1] = Math.round(lg[i] * 255);
      bytes[i * 4 + 2] = Math.round(lb[i] * 255);
      bytes[i * 4 + 3] = 255;
    }
    gl.activeTexture(gl.TEXTURE3);
    gl.bindTexture(gl.TEXTURE_2D, this.texLut);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 256, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, bytes);
  }

  render(src: HTMLCanvasElement, f: PhotoFilter): HTMLCanvasElement | null {
    const gl = this.gl;
    const w = src.width;
    const h = src.height;
    if (!this.fits(w, h) || gl.isContextLost()) return null;

    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, this.quad);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    // 1 — camera frame → texture
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texSrc);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 0);
    if (this.srcW === w && this.srcH === h) {
      gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, gl.RGBA, gl.UNSIGNED_BYTE, src);
    } else {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
      this.srcW = w;
      this.srcH = h;
    }

    // 2 — blurred copies of the untouched photo (skin / glow)
    const needSkin = (f.skin ?? 0) > 0;
    const needGlow = (f.glow ?? 0) > 0;
    if (needSkin) this.skin = this.blur(this.skin, w, h, 4);
    if (needGlow) this.glow = this.blur(this.glow, w, h, 22);

    // 3 — the grading pass, straight to the canvas
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, w, h);
    gl.useProgram(this.main);

    if (this.lastFilter !== f) {
      this.setFilterUniforms(f);
      this.lastFilter = f;
    }
    const sizeKey = `${w}x${h}`;
    if (this.lastSize !== sizeKey) {
      gl.uniform2f(this.u.uSize, w, h);
      this.lastSize = sizeKey;
    }

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texSrc);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, needSkin && this.skin ? this.skin.tex : this.texDummy);
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, needGlow && this.glow ? this.glow.tex : this.texDummy);
    gl.activeTexture(gl.TEXTURE3);
    gl.bindTexture(gl.TEXTURE_2D, this.texLut);
    gl.activeTexture(gl.TEXTURE4);
    gl.bindTexture(gl.TEXTURE_2D, this.texNoise);
    gl.uniform1i(this.u.uSrc, 0);
    gl.uniform1i(this.u.uSkinTex, 1);
    gl.uniform1i(this.u.uGlowTex, 2);
    gl.uniform1i(this.u.uLut, 3);
    gl.uniform1i(this.u.uNoise, 4);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    return this.canvas;
  }

  sync() {
    const gl = this.gl;
    gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4));
  }

  release() {
    this.freeTarget(this.skin);
    this.freeTarget(this.glow);
    this.skin = this.glow = null;
    this.srcW = this.srcH = 0;
    this.lastSize = "";
    this.canvas.width = 1;
    this.canvas.height = 1;
  }
}

/* -------------------------------- singleton -------------------------------- */

let engine: Engine | null = null;
let disabled = false; // permanent for this page load (no support, error, software GPU)
let lost = false;
let allowSoftware = false;

/** Test hook: accept a software renderer (never needed in production). */
export function __allowSoftwareGl(v: boolean) {
  allowSoftware = v;
}

/** Stop using the GPU path for the rest of the session (after any GL error). */
export function disableGl() {
  disabled = true;
  engine = null;
}

export function getGlEngine(): GlFilterEngine | null {
  if (disabled || lost || typeof document === "undefined") return null;
  if (engine) return engine;
  try {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    const gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      premultipliedAlpha: false,
      preserveDrawingBuffer: false,
      powerPreference: "high-performance",
      failIfMajorPerformanceCaveat: !allowSoftware,
    }) as WebGLRenderingContext | null;
    if (!gl) throw new Error("no webgl");

    const hp = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT);
    if (!hp || hp.precision < 23) throw new Error("no highp fragment precision");

    const dbg = gl.getExtension("WEBGL_debug_renderer_info");
    const renderer = dbg ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL)) : "unknown";
    if (!allowSoftware && SOFTWARE_RENDERER.test(renderer)) throw new Error("software renderer");

    canvas.addEventListener("webglcontextlost", (e) => {
      e.preventDefault();
      lost = true;
      engine = null;
    });
    canvas.addEventListener("webglcontextrestored", () => {
      lost = false; // next getGlEngine() builds fresh resources
    });

    engine = new Engine(canvas, gl, renderer);
    return engine;
  } catch (err) {
    console.warn("[photobooth] GPU filter unavailable, using CPU:", err);
    disabled = true;
    engine = null;
    return null;
  }
}
