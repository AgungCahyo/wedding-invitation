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
    <main className="min-h-screen lg:h-screen lg:overflow-hidden bg-[var(--bg-primary)] text-[var(--text-primary)] font-body flex flex-col">
      <header className="flex items-center justify-between gap-4 px-6 lg:px-10 py-4 lg:py-6 shrink-0">
        <div>
          <p className="eyebrow">Wedding Photo Booth</p>
          <h1 className="font-maellen text-4xl lg:text-6xl leading-none text-[var(--accent)] mt-1">
            {NAMES}
          </h1>
        </div>
        <div className="flex items-center gap-5">
          <div className="text-right hidden sm:block">
            <p className="text-2xl lg:text-4xl font-display leading-none">{photos.length}</p>
            <p className="eyebrow mt-1">foto</p>
          </div>
          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label="Layar penuh (F)"
            className="w-10 h-10 flex items-center justify-center border border-[var(--border)] text-[var(--text-tertiary)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition-colors"
          >
            <Maximize2 size={16} strokeWidth={1.5} />
          </button>
        </div>
      </header>

      {!isSupabaseConfigured ? (
        <Message>Supabase belum dikonfigurasi (NEXT_PUBLIC_SUPABASE_URL / ANON_KEY).</Message>
      ) : loaded && photos.length === 0 ? (
        <Message>
          <Camera size={36} strokeWidth={1.2} className="mx-auto mb-4 text-[var(--accent)]" />
          Belum ada foto. Buka undangan digital, ambil foto, lalu kirim ke layar ini!
        </Message>
      ) : (
        <div className="flex-1 min-h-0 grid gap-6 lg:gap-10 px-6 lg:px-10 pb-6 lg:pb-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
          {/* spotlight */}
          <section className="min-h-0 flex flex-col items-center justify-center gap-4">
            <div className="bg-[var(--bg-elevated)] border border-[var(--border)] p-3 lg:p-4 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.35)] max-w-full">
              <div className="relative bg-black overflow-hidden w-full max-w-sm aspect-[3/4] lg:w-auto lg:max-w-full lg:h-[calc(100vh-17rem)]">
                <AnimatePresence mode="popLayout">
                  {spot && (
                    <motion.img
                      key={spot.id}
                      src={photoUrl(spot.storage_path)}
                      alt={`Foto oleh ${spot.guest_name}`}
                      initial={{ opacity: 0, scale: 1.04 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  )}
                </AnimatePresence>
                {spot && spot.id === freshId && (
                  <span className="absolute top-4 left-4 px-3 py-1 bg-[var(--bg-primary)] text-[var(--text-primary)] text-xs tracking-[0.25em] uppercase">
                    Baru
                  </span>
                )}
              </div>
            </div>
            {spot && (
              <p className="font-display italic text-2xl lg:text-3xl text-[var(--text-primary)]">
                {spot.guest_name}
              </p>
            )}
          </section>

          {/* recent grid */}
          <section className="min-h-0 flex flex-col">
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2 lg:gap-3 content-start">
              <AnimatePresence initial={false}>
                {grid.map((p) => (
                  <motion.button
                    key={p.id}
                    layout
                    type="button"
                    onClick={() => setSpotId(p.id)}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                    className={`relative aspect-[3/4] overflow-hidden bg-[var(--bg-secondary)] border border-[var(--border)] transition-shadow ${
                      spot?.id === p.id ? "ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-[var(--bg-primary)]" : ""
                    }`}
                    aria-label={`Foto oleh ${p.guest_name}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photoUrl(p.storage_path)}
                      alt=""
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>
            <p className="mt-auto pt-6 text-center text-[var(--text-tertiary)] text-xs lg:text-sm tracking-wide">
              Ambil fotomu lewat undangan digital · {wedding.displayDate}
            </p>
          </section>
        </div>
      )}
    </main>
  );
}

function Message({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 flex items-center justify-center px-8 text-center text-[var(--text-secondary)] text-lg lg:text-2xl font-display italic leading-relaxed">
      <div className="max-w-xl">{children}</div>
    </div>
  );
}
