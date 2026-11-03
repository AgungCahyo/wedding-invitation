"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Camera, Maximize2 } from "lucide-react";
import { invitation } from "@/src/data/invitation";
import { isSupabaseConfigured } from "@/src/lib/supabase";
import {
  fetchApprovedPhotos,
  photoUrl,
  subscribePhotos,
  type PhotoRecord,
} from "@/src/lib/photobooth/photo-service";

const SPOT_MS = 7000; // normal time per photo in the spotlight
const FRESH_MS = 12000; // a brand-new photo stays longer
const POLL_MS = 20000; // safety net if realtime drops
const GRID_MAX = 12;
const IDLE_MS = 3000; // hide cursor + controls on the venue screen

const { couple, wedding } = invitation;
const NAMES = `${couple.bride.name.split(" ")[0]} & ${couple.groom.name.split(" ")[0]}`;

const byNewest = (a: PhotoRecord, b: PhotoRecord) =>
  b.created_at.localeCompare(a.created_at);

export function PhotoWall() {
  const [photos, setPhotos] = useState<PhotoRecord[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [spotId, setSpotId] = useState<string | null>(null);
  const [freshId, setFreshId] = useState<string | null>(null);
  const [idle, setIdle] = useState(false);
  const photosRef = useRef<PhotoRecord[]>([]);

  useEffect(() => {
    photosRef.current = photos;
  }, [photos]);

  /* ----------------------------- data + realtime ---------------------------- */

  const reconcile = useCallback(async () => {
    try {
      const fresh = await fetchApprovedPhotos();
      setPhotos(fresh);
    } catch (err) {
      console.error("Photo wall fetch failed:", err);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const first = setTimeout(() => void reconcile(), 0);
    const poll = setInterval(() => void reconcile(), POLL_MS);

    const unsubscribe = subscribePhotos({
      onUpsert: (photo, isNew) => {
        setPhotos((prev) =>
          [photo, ...prev.filter((p) => p.id !== photo.id)].sort(byNewest),
        );
        if (isNew) {
          setSpotId(photo.id); // jump straight to the newest photo
          setFreshId(photo.id);
        }
      },
      onRemove: (id) => setPhotos((prev) => prev.filter((p) => p.id !== id)),
    });

    return () => {
      clearTimeout(first);
      clearInterval(poll);
      unsubscribe();
    };
  }, [reconcile]);

  /* ------------------------------- spotlight ------------------------------- */

  const spotIndex = useMemo(
    () => (spotId ? photos.findIndex((p) => p.id === spotId) : -1),
    [photos, spotId],
  );
  // Fall back to the newest photo when nothing is selected or it was removed.
  const spot = photos[spotIndex >= 0 ? spotIndex : 0];

  useEffect(() => {
    if (photos.length < 2 || !spot) return;
    const delay = spot.id === freshId ? FRESH_MS : SPOT_MS;
    const timer = setTimeout(() => {
      const list = photosRef.current;
      const i = list.findIndex((p) => p.id === spot.id);
      const next = list[(i + 1) % list.length];
      if (next) setSpotId(next.id);
    }, delay);
    return () => clearTimeout(timer);
  }, [spot, freshId, photos.length]);

  /* ----------------------- fullscreen + keep screen awake ------------------- */

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void document.documentElement.requestFullscreen?.();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) =>
      e.key.toLowerCase() === "f" && toggleFullscreen();
    window.addEventListener("keydown", onKey);

    let lock: WakeLockSentinel | null = null;
    const acquire = async () => {
      try {
        lock = (await navigator.wakeLock?.request("screen")) ?? null;
      } catch {
        /* not supported / denied — fine */
      }
    };
    void acquire();
    const onVisible = () =>
      document.visibilityState === "visible" && void acquire();
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("visibilitychange", onVisible);
      void lock?.release();
    };
  }, [toggleFullscreen]);

  // Clean screen for the venue: cursor and controls fade out when untouched.
  useEffect(() => {
    let timer = setTimeout(() => setIdle(true), IDLE_MS);
    const wake = () => {
      setIdle(false);
      clearTimeout(timer);
      timer = setTimeout(() => setIdle(true), IDLE_MS);
    };
    const events = ["mousemove", "keydown", "touchstart"] as const;
    events.forEach((e) => window.addEventListener(e, wake));
    return () => {
      clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, wake));
    };
  }, []);

  /* ----------------------------------- UI ---------------------------------- */

  const grid = photos.slice(0, GRID_MAX);
  const spotDelay = spot && spot.id === freshId ? FRESH_MS : SPOT_MS;
  const spotUrl = spot ? photoUrl(spot.storage_path) : "";

  return (
    <main
      className={`relative min-h-screen lg:h-screen lg:overflow-hidden bg-[#faf8f3] text-[#f5efe6] font-body flex flex-col isolate ${
        idle ? "lg:cursor-none" : ""
      }`}
    >
      {/* Ambient backdrop: the current photo, heavily blurred, glowing behind everything */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <AnimatePresence mode="sync">
          {spot && (
            <motion.img
              key={spot.id}
              src={spotUrl}
              alt=""
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.8, ease: "easeInOut" }}
              className="absolute inset-0 w-full h-full object-cover scale-125 blur-[80px] saturate-[1.25]"
            />
          )}
        </AnimatePresence>
        {/* Soft ivory overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#faf8f3]/20 via-[#faf8f3]/5 to-[#faf8f3]/30" />

        {/* Soft ivory vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_45%,transparent_40%,rgba(250,248,243,0.35)_100%)]" />
      </div>

      {/* Hairline frame around the whole screen */}
      <div className="hidden lg:block absolute inset-[1.4vh] border border-[var(--accent)]/20 pointer-events-none" />

      {!isSupabaseConfigured ? (
        <Message>
          Supabase belum dikonfigurasi
          <span className="block mt-3 text-xs font-body not-italic tracking-normal opacity-60">
            NEXT_PUBLIC_SUPABASE_URL / ANON_KEY
          </span>
        </Message>
      ) : loaded && photos.length === 0 ? (
        <Message>
          <div className="w-20 h-20 mx-auto mb-8 rounded-full border border-[var(--accent)]/40 flex items-center justify-center">
            <Camera
              size={30}
              strokeWidth={1.1}
              className="text-[var(--accent)]"
            />
          </div>
          <span className="block font-maellen text-5xl lg:text-7xl text-[var(--accent)] mb-5">
            {NAMES}
          </span>
          Every moment matters.
          <span className="block mt-4 text-sm not-italic tracking-[0.2em] uppercase opacity-50">
            Scan the invitation · take a photo · join the story
          </span>
        </Message>
      ) : (
        <div className="relative flex-1 min-h-0 flex flex-col lg:flex-row items-stretch gap-10 lg:gap-[3vw] px-6 py-8 lg:px-[3.4vw] lg:py-[4vh]">
          {/* ───────── Left: the couple ───────── */}

          <aside className="lg:w-[23vw] lg:shrink-0 flex flex-col justify-between text-center lg:text-left">
            <div>
              <p className={`${EYEBROW} text-[var(--accent)]`}>
                The Wedding Of
              </p>

              <h1 className="font-maellen text-[clamp(3.2rem,5.4vw,8rem)] leading-[1.02] mt-[2vh] text-[var(--text-primary)]">
                {couple.bride.name.split(" ")[0]}
                <span className="block text-[0.55em] leading-none text-[var(--accent)] my-[0.5vh]">
                  &amp;
                </span>
                {couple.groom.name.split(" ")[0]}
              </h1>

              <div className="mt-[3vh] flex items-center gap-4 justify-center lg:justify-start">
                <span className="h-px w-[3vw] min-w-10 bg-[var(--accent)]/70" />
                <span className="w-1.5 h-1.5 rotate-45 bg-[var(--accent)]" />
              </div>

              <p
                className={`${EYEBROW} mt-[2.6vh] text-[var(--text-secondary)]`}
              >
                {wedding.displayDate}
              </p>
            </div>

            {/* Who took the current photo */}
            <div className="my-10 lg:my-0 min-h-[9vh]">
              <AnimatePresence mode="wait">
                {spot && (
                  <motion.div
                    key={spot.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.6 }}
                  >
                    <p className={`${EYEBROW} text-[var(--accent)]/80`}>
                      Captured by
                    </p>

                    <p className="font-display italic text-[clamp(1.8rem,2.6vw,3.6rem)] leading-tight mt-[1.2vh] text-[var(--text-primary)] break-words">
                      {spot.guest_name}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div>
              <p className="font-display italic text-[clamp(1.05rem,1.35vw,1.9rem)] leading-snug text-[var(--text-secondary)]">
                Captured together,
                <br />
                remembered forever.
              </p>

              <div className="mt-[3vh] flex items-end gap-4 justify-center lg:justify-start">
                <span className="font-display text-[clamp(2.4rem,3.6vw,5rem)] leading-none text-[var(--accent)]">
                  {String(photos.length).padStart(2, "0")}
                </span>

                <span
                  className={`${EYEBROW} pb-[0.6vh] text-[var(--text-secondary)]`}
                >
                  Moments
                  <br />
                  Captured
                </span>
              </div>
            </div>
          </aside>

          {/* ───────── Center: the spotlight ───────── */}
          <section className="flex items-center justify-center lg:shrink-0">
            <div className="relative w-[min(82vw,440px)] lg:w-auto lg:h-full aspect-[3/4] p-[1.6vh] shadow-[0_50px_140px_-30px_rgba(0,0,0,0.9)]">
              {/* gold hairline, offset from the photo like a passe-partout */}
              <div className="absolute inset-0 border border-[var(--accent)]/55 pointer-events-none" />
              <div className="absolute inset-[0.6vh] border border-[var(--border)]/60 pointer-events-none" />

              <div className="relative w-full h-full overflow-hidden bg-black">
                <AnimatePresence mode="popLayout">
                  {spot && (
                    <motion.img
                      key={spot.id}
                      src={spotUrl}
                      alt={`Foto oleh ${spot.guest_name}`}
                      initial={{ opacity: 0, scale: 1.02 }}
                      animate={{ opacity: 1, scale: 1.08 }}
                      exit={{ opacity: 0 }}
                      transition={{
                        opacity: { duration: 1.1, ease: "easeInOut" },
                        scale: {
                          duration: spotDelay / 1000 + 1.5,
                          ease: "linear",
                        }, // slow Ken Burns drift
                      }}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  )}
                </AnimatePresence>

                {/* soft inner vignette */}
                <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_120px_rgba(0,0,0,0.35)]" />

                {spot && spot.id === freshId && (
                  <motion.span
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className={`absolute top-[2vh] left-[2vh] px-4 py-2 bg-black/55 backdrop-blur-md border border-[var(--accent)]/60 text-[var(--accent)] ${EYEBROW}`}
                  >
                    Just Added
                  </motion.span>
                )}

                {/* time-left line */}
                {photos.length > 1 && spot && (
                  <motion.div
                    key={spot.id}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: spotDelay / 1000, ease: "linear" }}
                    className="absolute bottom-0 left-0 h-[2px] w-full origin-left bg-[var(--accent)]/80"
                  />
                )}
              </div>
            </div>
          </section>

          {/* ───────── Right: recent moments ───────── */}
          <section className="flex-1 min-w-0 min-h-0 flex flex-col">
            <div className="flex items-end justify-between mb-[2.6vh]">
              <div>
                <p className={`${EYEBROW} text-[var(--accent)]/80`}>
                  Shared With Love
                </p>
                <h2 className="font-maellen text-[clamp(2rem,2.8vw,4rem)] leading-none mt-[1.2vh] text-[var(--text-primary)]">
                  Recent Moments
                </h2>
              </div>
              <span className="h-px flex-1 mx-[1.6vw] mb-[1.2vh] bg-gradient-to-r from-[var(--accent)]/40 to-transparent" />
            </div>

<div className="flex-1 min-h-0 overflow-hidden">
  <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-3 gap-[1.2vw] content-start px-3 py-4">
    <AnimatePresence initial={false}>
      {grid.map((p, index) => {
        const active = spot?.id === p.id;

        // Controlled rotation pattern
        const rotations = [-3, 2, -1.5, 3, -2, 1.5];
        const rotation = rotations[index % rotations.length];

        return (
          <motion.button
            key={p.id}
            layout
            type="button"
            onClick={() => setSpotId(p.id)}
            initial={{ opacity: 0, scale: 0.8, rotate: rotation * 1.5 }}
            animate={{
              opacity: active ? 1 : 0.85,
              scale: active ? 1.04 : 1,
              rotate: active ? 0 : rotation,
              zIndex: active ? 10 : 1,
            }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{
              scale: 1.08,
              rotate: 0,
              zIndex: 20,
              transition: { duration: 0.3 },
            }}
            transition={{
              duration: 0.6,
              ease: [0.25, 0.1, 0.25, 1],
            }}
            className={`relative aspect-[3/4] overflow-hidden bg-white p-[5px] pb-[5px] shadow-[0_5px_15px_rgba(43,37,32,0.12)] transition-shadow duration-500 ${
              active
                ? "ring-1 ring-[var(--accent)] shadow-[0_12px_30px_rgba(43,37,32,0.2)]"
                : ""
            }`}
            aria-label={`Foto oleh ${p.guest_name}`}
          >
            <div className="relative w-full h-full overflow-hidden">
              <img
                src={photoUrl(p.storage_path)}
                alt=""
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover"
              />

              {index === 0 && p.id === freshId && (
                <span className="absolute top-1.5 left-1.5 px-2 py-0.5 bg-white/90 backdrop-blur-sm text-[var(--accent)] text-[9px] tracking-[0.25em] uppercase">
                  New
                </span>
              )}
            </div>
          </motion.button>
        );
      })}
    </AnimatePresence>
  </div>
</div>
{/* Special thanks — a quiet credit pinned under the grid */}
<footer className="shrink-0 mt-[2.4vh] pt-[2.2vh] border-t border-[var(--accent)]/25 flex flex-wrap items-baseline justify-center lg:justify-start gap-x-[1.4vw] gap-y-1">
  <span className={`${EYEBROW} text-[var(--text-tertiary)]`}>
    Special Thanks
  </span>
  <span className="font-display italic text-[clamp(1rem,1.25vw,1.8rem)] text-[var(--text-secondary)]">
    Sachi Portrait
    <span
      aria-hidden
      className="mx-[0.8vw] inline-block w-1 h-1 rotate-45 bg-[var(--accent)] align-middle"
    />
    Novel Rumah Jahit
  </span>
</footer>
          </section>
          
        </div>
      )}

      {/* Fullscreen toggle — fades away on the venue screen */}
      <button
        type="button"
        onClick={toggleFullscreen}
        aria-label="Layar penuh (F)"
        className={`fixed bottom-[3vh] right-[2vw] z-20 w-11 h-11 flex items-center justify-center rounded-full border border-white/20 bg-black/40 backdrop-blur-md text-white/70 hover:text-[var(--accent)] hover:border-[var(--accent)] transition-all duration-500 ${
          idle ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        <Maximize2 size={17} strokeWidth={1.4} />
      </button>
    </main>
  );
}

const EYEBROW = "text-[clamp(9px,0.72vw,14px)] tracking-[0.34em] uppercase";

function Message({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex-1 flex items-center justify-center px-8 text-center text-white/70 text-xl lg:text-3xl font-display italic leading-relaxed">
      <div className="max-w-2xl">{children}</div>
    </div>
  );
}
