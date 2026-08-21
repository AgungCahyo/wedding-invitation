"use client";

import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";
import { Pin } from "lucide-react";
import { ModernSection } from "@/src/designs/modern/layout/ModernSection";
import { SectionLabel } from "@/src/designs/modern/layout/SectionLabel";
import { fadeUpModern, viewportOnce } from "@/src/designs/modern/motion";
import { saveWish, fetchWishes } from "@/src/lib/wishes-service";

interface Wish {
  id: number;
  name: string;
  message: string;
  date: string;
  isPinned: boolean;
}

const NAME_MAX = 60;
const MESSAGE_MAX = 300;

function formatWishDate(date: string) {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function WishCard({ wish }: { wish: Wish }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      variants={fadeUpModern}
      className="py-5 border-t border-[var(--border)]"
    >
      <div className="flex items-baseline justify-between gap-4 mb-2">
        <div className="flex items-center gap-2">
          {wish.isPinned && <Pin size={11} strokeWidth={2} className="text-[var(--accent)]" />}
          <h4 className="font-body text-sm font-medium">{wish.name}</h4>
        </div>
        <time
          dateTime={wish.date}
          className="text-[10px] font-body tracking-[0.08em] shrink-0 text-[var(--text-tertiary)]"
        >
          {formatWishDate(wish.date)}
        </time>
      </div>
      <p className="font-body text-sm leading-relaxed text-[var(--text-secondary)]">{wish.message}</p>
    </motion.div>
  );
}

export function Wishes({ guestName = "" }: { guestName?: string }) {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [unavailable, setUnavailable] = useState(false);
  const [newName, setNewName] = useState(guestName);
  const [newWish, setNewWish] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    const loadWishes = async () => {
      try {
        setIsFetching(true);
        const result = await fetchWishes();
        if (result.notConfigured) {
          setUnavailable(true);
        } else if (result.success) {
          setWishes(result.data);
        }
      } catch (error) {
        console.error("Error loading wishes:", error);
      } finally {
        setIsFetching(false);
      }
    };
    loadWishes();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newName.trim() || !newWish.trim() || isLoading) return;
    setIsLoading(true);
    setSubmitError(null);
    try {
      const result = await saveWish(newName, newWish);
      if (result.success) {
        const refreshed = await fetchWishes();
        if (refreshed.success) setWishes(refreshed.data);
        setNewWish("");
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 4000);
      }
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Gagal menyimpan ucapan. Silakan coba lagi."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ModernSection id="wishes" tone="muted">
      <SectionLabel index="06">Ucapan</SectionLabel>

      {unavailable ? (
        <p className="font-body text-sm text-[var(--text-secondary)]">
          Fitur ucapan sedang tidak tersedia saat ini.
        </p>
      ) : (
        <motion.form
          onSubmit={handleSubmit}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={fadeUpModern}
          className="max-w-md mb-12 space-y-4"
        >
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nama Anda"
            maxLength={NAME_MAX}
            className="w-full bg-transparent border-0 border-b border-[var(--border)] py-2.5 font-body text-sm capitalize focus:outline-none focus:border-[var(--accent)]"
            disabled={isLoading}
          />
          <textarea
            value={newWish}
            onChange={(e) => setNewWish(e.target.value)}
            placeholder="Tulis ucapan atau doa..."
            rows={3}
            maxLength={MESSAGE_MAX}
            className="w-full bg-transparent border-0 border-b border-[var(--border)] py-2.5 font-body text-sm resize-none focus:outline-none focus:border-[var(--accent)]"
            disabled={isLoading}
          />
          <div className="flex items-center justify-between gap-4">
            <button
              type="submit"
              disabled={isLoading || !newName.trim() || !newWish.trim()}
              className="px-6 py-2.5 text-[11px] font-body font-medium tracking-[0.16em] uppercase text-white bg-[var(--accent)] disabled:opacity-60"
            >
              {isLoading ? "Mengirim..." : "Kirim"}
            </button>
            <span className="text-[10px] font-body tabular-nums text-[var(--text-tertiary)]">
              {newWish.length}/{MESSAGE_MAX}
            </span>
          </div>

          <AnimatePresence mode="wait">
            {submitted && (
              <motion.p
                key="success"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-sm font-body text-[var(--accent)]"
              >
                Terima kasih atas ucapannya
              </motion.p>
            )}
            {submitError && (
              <motion.p
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-red-600/80 text-sm font-body"
              >
                {submitError}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.form>
      )}

      {isFetching ? (
        <p className="text-sm font-body text-[var(--text-tertiary)]">Memuat ucapan...</p>
      ) : wishes.length === 0 ? (
        <p className="text-sm font-body text-[var(--text-tertiary)]">Belum ada ucapan.</p>
      ) : (
        <div className="max-w-md">
          {wishes.map((wish) => (
            <WishCard key={wish.id} wish={wish} />
          ))}
        </div>
      )}
    </ModernSection>
  );
}
