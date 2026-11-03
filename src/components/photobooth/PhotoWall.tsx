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
const GRID_MAX = 15;

const { couple, wedding } = invitation;
const NAMES = `${couple.bride.name.split(" ")[0]} & ${couple.groom.name.split(" ")[0]}`;

const byNewest = (a: PhotoRecord, b: PhotoRecord) =>
  b.created_at.localeCompare(a.created_at);

export function PhotoWall() {
  const [photos, setPhotos] = useState<PhotoRecord[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [spotId, setSpotId] = useState<string | null>(null);
  const [freshId, setFreshId] = useState<string | null>(null);
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
          [photo, ...prev.filter((p) => p.id !== photo.id)].sort(byNewest)
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
    [photos, spotId]
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
    const onKey = (e: KeyboardEvent) => e.key.toLowerCase() === "f" && toggleFullscreen();
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
    const onVisible = () => document.visibilityState === "visible" && void acquire();
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("visibilitychange", onVisible);
      void lock?.release();
    };
  }, [toggleFullscreen]);

   /* ----------------------------------- UI ---------------------------------- */

  const grid = photos.slice(0, GRID_MAX);

  return (
    <main className="relative min-h-screen lg:h-screen lg:overflow-hidden bg-[var(--bg-primary)] text-[var(--text-primary)] font-body flex flex-col isolate">
      {/* Ambient background */}
      <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute -top-48 -left-48 w-[500px] h-[500px] rounded-full bg-[var(--accent)] opacity-[0.035] blur-[120px]" />
        <div className="absolute -bottom-48 -right-48 w-[500px] h-[500px] rounded-full bg-[var(--accent)] opacity-[0.035] blur-[120px]" />
      </div>

      {/* Header */}
      <header className="relative shrink-0 px-6 lg:px-12 pt-7 lg:pt-9 pb-6">
        <div className="flex items-center justify-between gap-5">
          <div className="flex items-center gap-4 lg:gap-6">
            <div className="hidden sm:flex w-11 h-11 items-center justify-center border border-[var(--border)] rounded-full text-[var(--accent)]">
              <Camera size={19} strokeWidth={1.2} />
            </div>

            <div>
              <p className="eyebrow opacity-70">
                Wedding Celebration · Photo Gallery
              </p>

              <h1 className="font-maellen text-4xl lg:text-6xl leading-none text-[var(--accent)] mt-2">
                {NAMES}
              </h1>

              <p className="mt-2 text-[10px] lg:text-xs tracking-[0.2em] uppercase text-[var(--text-tertiary)]">
                {wedding.displayDate}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-5 lg:gap-8">
            <div className="text-right">
              <p className="font-display text-3xl lg:text-5xl leading-none">
                {String(photos.length).padStart(2, "0")}
              </p>
              <p className="eyebrow mt-2 opacity-60">Captured Moments</p>
            </div>

            <div className="w-px h-10 bg-[var(--border)]" />

            <button
              type="button"
              onClick={toggleFullscreen}
              aria-label="Layar penuh (F)"
              className="group w-11 h-11 lg:w-12 lg:h-12 flex items-center justify-center rounded-full border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition-all duration-300"
            >
              <Maximize2
                size={17}
                strokeWidth={1.4}
                className="transition-transform duration-300 group-hover:scale-110"
              />
            </button>
          </div>
        </div>

        <div className="mt-7 lg:mt-9 h-px bg-[var(--border)] opacity-70" />
      </header>

      {/* Content */}
      {!isSupabaseConfigured ? (
        <Message>
          Supabase belum dikonfigurasi
          <span className="block mt-3 text-xs font-body not-italic tracking-normal opacity-60">
            NEXT_PUBLIC_SUPABASE_URL / ANON_KEY
          </span>
        </Message>
      ) : loaded && photos.length === 0 ? (
        <Message>
          <div className="w-20 h-20 mx-auto mb-7 rounded-full border border-[var(--border)] flex items-center justify-center">
            <Camera
              size={30}
              strokeWidth={1.1}
              className="text-[var(--accent)]"
            />
          </div>

          <span className="block font-maellen text-4xl lg:text-5xl text-[var(--accent)] mb-4">
            Every Moment Matters
          </span>

          Belum ada foto yang dibagikan.
          <span className="block mt-3 text-sm font-body not-italic opacity-60">
            Ambil foto melalui undangan digital dan jadilah bagian dari cerita
            hari ini.
          </span>
        </Message>
      ) : (
        <div className="flex-1 min-h-0 grid gap-8 lg:gap-12 px-6 lg:px-12 pb-7 lg:pb-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">

          {/* Main Spotlight */}
          <section className="min-h-0 flex flex-col items-center justify-center">
            <div className="w-full flex items-center justify-between mb-4 lg:mb-5">
              <p className="eyebrow opacity-70">The Moment</p>

              <span className="text-[10px] tracking-[0.2em] uppercase text-[var(--text-tertiary)]">
                Live Gallery
              </span>
            </div>

            <div className="relative w-full flex-1 min-h-0 flex items-center justify-center">
              <div className="relative bg-[var(--bg-elevated)] border border-[var(--border)] p-3 lg:p-4 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.35)] max-h-full">
                {/* Decorative corners */}
                <div className="absolute -top-2 -left-2 w-8 h-8 border-t border-l border-[var(--accent)] opacity-70 pointer-events-none" />
                <div className="absolute -top-2 -right-2 w-8 h-8 border-t border-r border-[var(--accent)] opacity-70 pointer-events-none" />
                <div className="absolute -bottom-2 -left-2 w-8 h-8 border-b border-l border-[var(--accent)] opacity-70 pointer-events-none" />
                <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b border-r border-[var(--accent)] opacity-70 pointer-events-none" />

                <div className="relative bg-black overflow-hidden w-[min(70vw,380px)] aspect-[3/4] lg:w-auto lg:h-[calc(100vh-17rem)] lg:max-h-[680px]">
                  <AnimatePresence mode="popLayout">
                    {spot && (
                      <motion.img
                        key={spot.id}
                        src={photoUrl(spot.storage_path)}
                        alt={`Foto oleh ${spot.guest_name}`}
                        initial={{ opacity: 0, scale: 1.04 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{
                          duration: 0.8,
                          ease: [0.25, 0.1, 0.25, 1],
                        }}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    )}
                  </AnimatePresence>

                  {spot && spot.id === freshId && (
                    <motion.span
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute top-4 left-4 px-4 py-2 bg-[var(--bg-primary)]/90 backdrop-blur-sm text-[var(--text-primary)] text-[9px] tracking-[0.25em] uppercase border border-[var(--border)]"
                    >
                      Just Added
                    </motion.span>
                  )}
                </div>
              </div>
            </div>

            {/* Guest name */}
            <div className="w-full text-center mt-5 lg:mt-6">
              <AnimatePresence mode="wait">
                {spot && (
                  <motion.div
                    key={spot.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.4 }}
                  >
                    <p className="font-display italic text-2xl lg:text-3xl text-[var(--text-primary)]">
                      {spot.guest_name}
                    </p>

                    <p className="eyebrow mt-2 opacity-50">
                      A moment to remember
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>

          {/* Photo Collection */}
          <section className="min-h-0 flex flex-col pt-1">
            <div className="flex items-end justify-between mb-5 lg:mb-7">
              <div>
                <p className="eyebrow opacity-60 mb-2">
                  Shared With Love
                </p>

                <h2 className="font-maellen text-3xl lg:text-4xl text-[var(--accent)]">
                  Recent Moments
                </h2>
              </div>

              <p className="text-[10px] tracking-[0.15em] uppercase text-[var(--text-tertiary)] pb-1">
                {grid.length} / {GRID_MAX}
              </p>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto lg:overflow-hidden">
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4 content-start">
                <AnimatePresence initial={false}>
                  {grid.map((p, index) => (
                    <motion.button
                      key={p.id}
                      layout
                      type="button"
                      onClick={() => setSpotId(p.id)}
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.85 }}
                      transition={{
                        duration: 0.45,
                        ease: [0.25, 0.1, 0.25, 1],
                      }}
                      className={`group relative aspect-[3/4] overflow-hidden bg-[var(--bg-secondary)] border transition-all duration-300 ${
                        spot?.id === p.id
                          ? "border-[var(--accent)] ring-1 ring-[var(--accent)]"
                          : "border-[var(--border)] hover:border-[var(--accent)]"
                      }`}
                      aria-label={`Foto oleh ${p.guest_name}`}
                    >
                      <img
                        src={photoUrl(p.storage_path)}
                        alt=""
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />

                      {/* Image overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />

                      {spot?.id === p.id && (
                        <div className="absolute inset-0 border-2 border-[var(--accent)] pointer-events-none" />
                      )}

                      {index === 0 && p.id === freshId && (
                        <span className="absolute top-2 left-2 px-2 py-1 bg-[var(--bg-primary)]/90 backdrop-blur-sm text-[var(--text-primary)] text-[8px] tracking-widest uppercase">
                          New
                        </span>
                      )}
                    </motion.button>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 lg:mt-7 pt-5 border-t border-[var(--border)] flex items-center justify-between gap-4">
              <div>
                <p className="font-display italic text-lg text-[var(--text-secondary)]">
                  Captured together, remembered forever.
                </p>
                <p className="text-[9px] tracking-[0.18em] uppercase text-[var(--text-tertiary)] mt-2">
                  {wedding.displayDate}
                </p>
              </div>

              <div className="hidden sm:block text-[var(--accent)] opacity-60">
                <Camera size={22} strokeWidth={1} />
              </div>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

function Message({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 flex items-center justify-center px-8 text-center text-[var(--text-secondary)] text-lg lg:text-xl font-display italic leading-relaxed">
      <div className="max-w-xl">{children}</div>
    </div>
  );
}