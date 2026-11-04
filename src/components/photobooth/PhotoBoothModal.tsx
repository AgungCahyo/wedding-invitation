"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import {
  Camera,
  Check,
  Download,
  Image as ImageIcon,
  RotateCcw,
  Share2,
  SwitchCamera,
  Timer,
  X,
} from "lucide-react";
import { invitation } from "@/src/data/invitation";
import { useCamera } from "@/src/hooks/useCamera";
import { isSupabaseConfigured } from "@/src/lib/supabase";
import { uploadPhoto } from "@/src/lib/photobooth/photo-service";
import { PHOTO_FILTERS, isNeutral } from "@/src/lib/photobooth/filters";
import { PreviewPipeline } from "@/src/lib/photobooth/preview-pipeline";
import { WEDDING_FRAMES, readFrameTheme, type FrameInfo } from "@/src/lib/photobooth/frames";
import {
  PHOTO_ASPECT,
  canvasToBlob,
  composePhoto,
} from "@/src/lib/photobooth/compose";

const { couple, wedding } = invitation;
const FRAME_INFO: FrameInfo = {
  names: `${couple.bride.name.split(" ")[2]} & ${couple.groom.name.split(" ")[0]}`,
  date: wedding.displayDate,
};

// Overlay canvas resolution (CSS scales it to the stage). Final export is
// OUTPUT_WIDTH wide; frames scale from width so both look identical.
const PREVIEW_W = 600;
const PREVIEW_H = Math.round(PREVIEW_W / PHOTO_ASPECT);

// Live color-graded preview is rendered small — same pipeline as the final
// photo, just cheap enough to run on every camera frame.
const FX_W = 300;
const FX_H = Math.round(FX_W / PHOTO_ASPECT);

const COUNTDOWN_SECONDS = 3;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function ensureFonts() {
  const t = readFrameTheme();
  try {
    await Promise.all([
      document.fonts.load(`64px ${t.scriptFont}`),
      document.fonts.load(`500 20px ${t.displayFont}`),
      document.fonts.load(`italic 400 20px ${t.displayFont}`),
    ]);
  } catch {
    /* fall back to whatever is available */
  }
}

interface Result {
  blob: Blob;
  url: string;
}
interface Upload {
  img: HTMLImageElement;
  url: string;
}

const NAME_MAX = 40;
type SendState = "idle" | "sending" | "sent";

export function PhotoBoothModal({
  onClose,
  guestName = "-",
}: {
  onClose: () => void;
  guestName?: string;
}) {
  const { videoRef, status, facing, canSwitch, switchCamera, retry } = useCamera();

  const [frameId, setFrameId] = useState(WEDDING_FRAMES[1].id);
  const [filterId, setFilterId] = useState(PHOTO_FILTERS[0].id);
  const [tab, setTab] = useState<"frame" | "filter">("frame");
  const [timerOn, setTimerOn] = useState(false);
  const [count, setCount] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [flash, setFlash] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [upload, setUpload] = useState<Upload | null>(null);

  // Sending to the event screen — strictly opt-in, per photo.
  const [consent, setConsent] = useState(false);
  const [sendState, setSendState] = useState<SendState>("idle");
  const [nameInput, setNameInput] = useState(guestName === "-" ? "" : guestName);

  const overlayRef = useRef<HTMLCanvasElement>(null);
  const fxRef = useRef<HTMLCanvasElement>(null);
  const fxScale = useRef(1); // preview resolution factor, tuned to the device
  const pipelineRef = useRef<PreviewPipeline | null>(null); // owns the work canvases; survives preset changes
  const fileRef = useRef<HTMLInputElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const aliveRef = useRef(true);

  const frame = useMemo(() => WEDDING_FRAMES.find((f) => f.id === frameId)!, [frameId]);
  const filter = useMemo(() => PHOTO_FILTERS.find((f) => f.id === filterId)!, [filterId]);
  const neutral = isNeutral(filter);
  const mirror = facing === "user" && !upload;
  const cameraReady = status === "ready";
  const canNativeShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

  /* ---------------------------- lifecycle / chrome --------------------------- */

  useEffect(() => {
    aliveRef.current = true;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // Pause the invitation's auto-scroll while the booth is open (it listens
    // for wheel/touch to hand control back to the guest).
    window.dispatchEvent(new Event("wheel"));
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      aliveRef.current = false;
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  // Free blob URLs when they're replaced / on unmount.
  useEffect(() => {
    return () => {
      if (result) URL.revokeObjectURL(result.url);
    };
  }, [result]);
  useEffect(() => {
    return () => {
      if (upload) URL.revokeObjectURL(upload.url);
    };
  }, [upload]);

  // Live frame overlay — same draw code as the final photo.
  useEffect(() => {
    const canvas = overlayRef.current;
    if (!canvas) return;
    let cancelled = false;
    const draw = () => {
      const ctx = canvas.getContext("2d");
      if (!ctx || cancelled) return;
      ctx.clearRect(0, 0, PREVIEW_W, PREVIEW_H);
      frame.draw(ctx, PREVIEW_W, PREVIEW_H, readFrameTheme(), FRAME_INFO);
    };
    draw();
    void ensureFonts().then(draw); // redraw once fonts are ready
    return () => {
      cancelled = true;
    };
  }, [frame]);

  // Live graded preview: camera frame (or picked photo) → same filter pipeline.
  // Runs outside React (refs + canvas only), once per *new* camera frame, and
  // never faster than the device can finish a frame.
  useEffect(() => {
    const canvas = fxRef.current;
    if (!canvas || neutral || result) return;
    let pipeline: PreviewPipeline;
    try {
      pipeline = pipelineRef.current ??= new PreviewPipeline(canvas);
    } catch {
      return;
    }
    const video = videoRef.current;
    const useVideoCallback =
      !upload && !!video && typeof video.requestVideoFrameCallback === "function";

    let raf = 0;
    let vfc = 0;
    let nextAt = 0;
    let avg = 0; // moving average of one frame's CPU-side cost (ms)
    let cooldown = 0;
    let stopped = false;

    const schedule = () => {
      if (stopped || upload) return; // a picked photo is rendered once
      if (useVideoCallback && video) vfc = video.requestVideoFrameCallback(render);
      else raf = requestAnimationFrame(render);
    };

    const render = (now: number) => {
      if (stopped) return;
      const src = upload ? upload.img : videoRef.current;
      if (src && (upload || cameraReady) && now >= nextAt) {
        // preview-only resolution; the saved photo is always full quality
        const cw = Math.round(FX_W * fxScale.current);
        if (canvas.width !== cw) {
          canvas.width = cw;
          canvas.height = Math.round(cw / PHOTO_ASPECT);
        }
        const t0 = performance.now();
        pipeline.render(src, mirror, filter);
        const cost = performance.now() - t0;

        // Never queue frames faster than the phone can finish them, and
        // trade preview resolution (not filter quality) when it's too slow.
        avg = avg ? avg * 0.7 + cost * 0.3 : cost;
        nextAt = performance.now() + Math.max(45, cost * 1.4);
        if (cooldown > 0) cooldown--;
        else if (avg > 55 && fxScale.current > 0.55) {
          fxScale.current = Math.max(0.55, fxScale.current * 0.8);
          cooldown = 12;
        } else if (avg < 16 && fxScale.current < 1) {
          fxScale.current = Math.min(1, fxScale.current * 1.15);
          cooldown = 30;
        }
      }
      schedule();
    };

    schedule();
    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      if (vfc && video && typeof video.cancelVideoFrameCallback === "function") {
        video.cancelVideoFrameCallback(vfc);
      }
    };
  }, [neutral, filter, upload, cameraReady, mirror, result, videoRef]);

  /* --------------------------------- actions -------------------------------- */

  const capture = async () => {
    if (busy) return;
    const source = upload ? upload.img : videoRef.current;
    if (!source || (!upload && !cameraReady)) return;

    setBusy(true);
    setError(null);
    try {
      if (!upload && timerOn) {
        for (let n = COUNTDOWN_SECONDS; n > 0; n--) {
          setCount(n);
          await sleep(1000);
          if (!aliveRef.current) return;
        }
        setCount(null);
      }

      setFlash(true);
      setTimeout(() => aliveRef.current && setFlash(false), 220);

      await ensureFonts();
      // let the flash / countdown paint before the (main-thread) compose runs
      await Promise.race([new Promise<void>((r) => requestAnimationFrame(() => r())), sleep(100)]);
      await sleep(0);
      if (!aliveRef.current) return;
      const canvas = composePhoto({
        source,
        mirror,
        filter,
        frame,
        theme: readFrameTheme(),
        info: FRAME_INFO,
      });
      const blob = await canvasToBlob(canvas);
      if (!aliveRef.current) return;
      setConsent(false);
      setSendState("idle");
      setResult({ blob, url: URL.createObjectURL(blob) });
    } catch {
      if (aliveRef.current) setError("Gagal mengambil foto. Silakan coba lagi.");
    } finally {
      if (aliveRef.current) {
        setBusy(false);
        setCount(null);
      }
    }
  };

  const fileName = () => `photobooth-${FRAME_INFO.names.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-${Date.now()}.jpg`;

  const download = () => {
    if (!result) return;
    const a = document.createElement("a");
    a.href = result.url;
    a.download = fileName();
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const share = async () => {
    if (!result) return;
    const file = new File([result.blob], fileName(), { type: "image/jpeg" });
    const data = {
      files: [file],
      title: invitation.meta.title,
      text: `Bersama ${FRAME_INFO.names} — ${FRAME_INFO.date}`,
    };
    try {
      if (navigator.canShare && !navigator.canShare({ files: [file] })) {
        download();
        return;
      }
      await navigator.share(data);
    } catch (err) {
      // AbortError = guest closed the share sheet; nothing to do.
      if (!(err instanceof DOMException && err.name === "AbortError")) download();
    }
  };

  const retake = () => {
    setResult(null);
    setConsent(false);
    setSendState("idle");
    setError(null);
  };

  const sendToScreen = async () => {
    if (!result || !consent || sendState !== "idle") return;
    setSendState("sending");
    setError(null);
    try {
      await uploadPhoto(result.blob, nameInput.trim().slice(0, NAME_MAX) || "-");
      if (aliveRef.current) setSendState("sent");
    } catch (err) {
      console.error("Photo upload failed:", err);
      if (aliveRef.current) {
        setSendState("idle");
        setError("Foto belum terkirim. Periksa koneksi lalu coba lagi.");
      }
    }
  };

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => setUpload({ img, url });
    img.onerror = () => {
      URL.revokeObjectURL(url);
      setError("Foto tidak bisa dibuka. Coba file lain.");
    };
    img.src = url;
  };

  /* ----------------------------------- UI ----------------------------------- */

  const cameraMessage: Record<string, string> = {
    starting: "Mengaktifkan kamera… izinkan akses kamera saat diminta.",
    denied: "Akses kamera ditolak. Izinkan kamera lewat pengaturan browser, atau pilih foto dari galeri.",
    unsupported: "Kamera tidak tersedia di browser ini. Coba buka undangan di Chrome/Safari, atau pilih foto dari galeri.",
    error: "Kamera tidak bisa diakses. Pastikan tidak dipakai aplikasi lain, atau pilih foto dari galeri.",
  };
  const showCameraMessage = !upload && !cameraReady;

  const chips = tab === "frame" ? WEDDING_FRAMES : PHOTO_FILTERS;
  const activeId = tab === "frame" ? frameId : filterId;
  const pick = (id: string) => (tab === "frame" ? setFrameId(id) : setFilterId(id));

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label="Wedding Photo Booth"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[100] flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)] font-body"
    >
      {/* top bar */}
      <div className="flex items-center justify-between px-4 h-[52px] shrink-0">
        <p className="eyebrow">Photo Booth</p>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Tutup photo booth"
          className="w-9 h-9 flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
        >
          <X size={20} strokeWidth={1.5} />
        </button>
      </div>

      {/* stage */}
      <div className="flex-1 min-h-0 flex items-center justify-center px-4">
        <div
          className="relative overflow-hidden bg-black ring-[6px] ring-[var(--bg-elevated)] shadow-[0_18px_44px_-18px_rgba(0,0,0,0.35)] outline outline-1 outline-[var(--border)] outline-offset-[6px]"
          style={{
            aspectRatio: "3 / 4",
            width: `min(100%, calc((100dvh - ${result && isSupabaseConfigured ? 410 : 290}px) * 0.75))`,
          }}
        >
          {/* live camera — stays mounted so the stream isn't re-attached */}
          <video
            ref={videoRef}
            playsInline
            muted
            autoPlay
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              transform: mirror ? "scaleX(-1)" : undefined,
              visibility: upload || !neutral ? "hidden" : "visible",
            }}
          />
          {upload && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={upload.url}
              alt="Foto yang dipilih"
              className="absolute inset-0 w-full h-full object-cover"
              style={{ visibility: neutral ? "visible" : "hidden" }}
            />
          )}

          {/* graded preview (hidden when the filter is "Asli") */}
          <canvas
            ref={fxRef}
            width={FX_W}
            height={FX_H}
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ visibility: neutral ? "hidden" : "visible" }}
          />

          <canvas
            ref={overlayRef}
            width={PREVIEW_W}
            height={PREVIEW_H}
            className="absolute inset-0 w-full h-full pointer-events-none"
          />

          {showCameraMessage && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center bg-black/70">
              <Camera size={28} strokeWidth={1.25} className="text-white/70" />
              <p className="text-sm text-white/80 leading-relaxed max-w-[16rem]">
                {cameraMessage[status]}
              </p>
              {status !== "starting" && (
                <div className="flex flex-col gap-2 w-full max-w-[14rem]">
                  {status !== "unsupported" && (
                    <button
                      type="button"
                      onClick={retry}
                      className="px-4 py-2.5 border border-white/40 text-[11px] tracking-[0.2em] uppercase hover:bg-white/10"
                    >
                      Coba lagi
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="px-4 py-2.5 bg-white text-black text-[11px] tracking-[0.2em] uppercase"
                  >
                    Pilih dari galeri
                  </button>
                </div>
              )}
            </div>
          )}

          {count !== null && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <motion.span
                key={count}
                initial={{ opacity: 0, scale: 1.4 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35 }}
                className="font-display text-[7rem] leading-none text-white drop-shadow-[0_2px_16px_rgba(0,0,0,0.5)]"
              >
                {count}
              </motion.span>
            </div>
          )}

          <div
            className="absolute inset-0 bg-white pointer-events-none transition-opacity duration-200"
            style={{ opacity: flash ? 0.9 : 0 }}
          />

          {/* result */}
          {result && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={result.url}
              alt="Hasil foto"
              className="absolute inset-0 w-full h-full object-cover bg-black"
            />
          )}

          {upload && !result && (
            <button
              type="button"
              onClick={() => setUpload(null)}
              className="absolute top-3 left-3 px-3 py-1.5 bg-black/60 text-[10px] tracking-[0.18em] uppercase"
            >
              ← Kamera
            </button>
          )}
        </div>
      </div>

      {/* controls */}
      <div className="shrink-0 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
        {error && <p className="text-center text-xs text-red-700 mb-2 px-4">{error}</p>}

        {result ? (
          <div className="px-4 pt-1 pb-3 space-y-3 max-h-[48dvh] overflow-y-auto">
            {isSupabaseConfigured && (
              <div className="max-w-md mx-auto border border-[var(--border)] bg-[var(--bg-elevated)] p-3.5 space-y-3 text-left">
                {sendState === "sent" ? (
                  <p className="flex items-center gap-2 text-sm text-emerald-700">
                    <Check size={16} /> Terkirim! Fotomu akan tampil di layar acara.
                  </p>
                ) : (
                  <>
                    <label className="block">
                      <span className="text-[10px] tracking-[0.2em] uppercase text-[var(--text-tertiary)]">
                        Nama di layar (opsional)
                      </span>
                      <input
                        type="text"
                        value={nameInput}
                        maxLength={NAME_MAX}
                        onChange={(e) => setNameInput(e.target.value)}
                        placeholder="Namamu"
                        className="mt-1 capitalize w-full bg-transparent border-b border-[var(--border)] py-1.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent)]"
                      />
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={consent}
                        onChange={(e) => setConsent(e.target.checked)}
                        className="mt-0.5 w-4 h-4 shrink-0 accent-[var(--accent)]"
                      />
                      <span className="text-xs text-[var(--text-secondary)] leading-relaxed">
                        Saya setuju foto ini disimpan dan ditampilkan di layar besar pada acara
                        pernikahan, bersama nama di atas. Foto tidak dikirim kalau kotak ini tidak
                        dicentang.
                      </span>
                    </label>

                    <button
                      type="button"
                      onClick={sendToScreen}
                      disabled={!consent || sendState === "sending"}
                      className="w-full py-3 bg-[var(--text-primary)] text-[var(--bg-primary)] text-[11px] tracking-[0.2em] uppercase transition-colors hover:bg-[var(--accent)] disabled:opacity-40"
                    >
                      {sendState === "sending" ? "Mengirim…" : "Kirim ke Layar Acara"}
                    </button>
                  </>
                )}
              </div>
            )}

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={retake}
                className="flex items-center gap-2 px-4 py-3 border border-[var(--border)] text-[var(--text-secondary)] text-[11px] tracking-[0.2em] uppercase hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
              >
                <RotateCcw size={14} /> Ulangi
              </button>
              <button
                type="button"
                onClick={download}
                className="flex items-center gap-2 px-5 py-3 border border-[var(--accent)] text-[var(--text-primary)] text-[11px] tracking-[0.2em] uppercase hover:bg-[var(--accent)] hover:text-[var(--bg-primary)] transition-colors"
              >
                <Download size={14} /> Unduh
              </button>
              {canNativeShare && (
                <button
                  type="button"
                  onClick={share}
                  className="flex items-center gap-2 px-4 py-3 border border-[var(--border)] text-[var(--text-secondary)] text-[11px] tracking-[0.2em] uppercase hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
                >
                  <Share2 size={14} /> Bagikan
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* tabs */}
            <div className="flex justify-center gap-6 mb-2 text-[10px] tracking-[0.25em] uppercase">
              {(["frame", "filter"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  aria-pressed={tab === t}
                  className={`pb-1 border-b ${
                    tab === t
                      ? "border-[var(--text-primary)] text-[var(--text-primary)]"
                      : "border-transparent text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
                  }`}
                >
                  {t === "frame" ? "Frame" : "Filter"}
                </button>
              ))}
            </div>

            {/* chips */}
            <div
              className="flex gap-2 overflow-x-auto px-4 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              role="listbox"
              aria-label={tab === "frame" ? "Pilih frame" : "Pilih filter"}
            >
              {chips.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  role="option"
                  aria-selected={activeId === c.id}
                  onClick={() => pick(c.id)}
                  className={`shrink-0 px-4 py-2 text-[11px] tracking-[0.15em] uppercase border transition-colors ${
                    activeId === c.id
                      ? "bg-[var(--text-primary)] border-[var(--text-primary)] text-[var(--bg-primary)]"
                      : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* shutter row: gallery · shutter · flip */}
            <div className="grid grid-cols-[1fr_auto_1fr] items-center px-6">
              <div className="flex items-center gap-2 justify-self-start">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  aria-label="Pilih foto dari galeri"
                  className="w-11 h-11 flex items-center justify-center border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
                >
                  <ImageIcon size={18} strokeWidth={1.5} />
                </button>
                {!upload && (
                  <button
                    type="button"
                    onClick={() => setTimerOn((v) => !v)}
                    aria-pressed={timerOn}
                    aria-label={timerOn ? "Timer 3 detik aktif" : "Timer mati"}
                    className={`w-11 h-11 flex items-center justify-center border ${
                      timerOn ? "border-[var(--accent)] text-[var(--accent)]" : "border-[var(--border)] text-[var(--text-tertiary)]"
                    }`}
                  >
                    <Timer size={18} strokeWidth={1.5} />
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={capture}
                disabled={busy || (!upload && !cameraReady)}
                aria-label="Ambil foto"
                className="w-[72px] h-[72px] rounded-full border-[3px] border-[var(--text-primary)] flex items-center justify-center disabled:opacity-40"
              >
                <span className="w-[56px] h-[56px] rounded-full bg-[var(--accent)] active:scale-90 transition-transform" />
              </button>

              <div className="justify-self-end">
                {canSwitch && !upload ? (
                  <button
                    type="button"
                    onClick={switchCamera}
                    disabled={busy}
                    aria-label="Ganti kamera depan/belakang"
                    className="w-11 h-11 flex items-center justify-center border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors disabled:opacity-40"
                  >
                    <SwitchCamera size={18} strokeWidth={1.5} />
                  </button>
                ) : (
                  <span className="w-11 h-11" aria-hidden="true" />
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="user"
        onChange={onPickFile}
        className="hidden"
      />
    </motion.div>
  );
}