"use client";

import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { SectionHeader } from "@/src/components/ui/SectionHeader";
import { easeOut, fadeUp, viewportOnce } from "@/src/lib/motion";
import { saveWish, fetchWishes } from "@/src/lib/wishes-service";

interface Wish {
  id: number;
  name: string;
  message: string;
  date: string;
}

const NAME_MAX = 60;
const MESSAGE_MAX = 300;

const PAGE_SIZE = 6;

export function Wishes({ guestName = "" }: { guestName?: string }) {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [newWish, setNewWish] = useState("");
  const [newName, setNewName] = useState(guestName);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [unavailable, setUnavailable] = useState(false);

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const visibleWishes = wishes.slice(0, visibleCount);
  const hasMore = visibleCount < wishes.length;
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
        setWishes((prev) => [
          {
            id: result.data.id,
            name: result.data.name,
            message: result.data.message,
            date: result.data.created_at.split("T")[0],
          },
          ...prev,
        ]);
        setNewWish("");
        setNewName("");
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 3000);
      }
    } catch (error) {
      console.error("Error saving wish:", error);
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Gagal menyimpan ucapan. Silakan coba lagi."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="wishes" className="section bg-[var(--bg-secondary)]">
      <div className="section-inner max-w-2xl">
        <SectionHeader label="Wishes" />

        {unavailable ? (
          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            variants={fadeUp}
            transition={easeOut}
            className="text-center text-[var(--text-tertiary)] text-sm font-body mb-12 md:mb-16"
          >
            Fitur ucapan sedang tidak tersedia saat ini.
          </motion.p>
        ) : (
          <motion.form
            onSubmit={handleSubmit}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            variants={fadeUp}
            transition={easeOut}
            className="mb-12 md:mb-16 space-y-5"
          >
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Nama Anda"
              maxLength={NAME_MAX}
              className="input-editorial"
              aria-label="Nama untuk ucapan"
              disabled={isLoading}
            />
            <textarea
              value={newWish}
              onChange={(e) => setNewWish(e.target.value)}
              placeholder="Tulis ucapan atau doa..."
              rows={3}
              maxLength={MESSAGE_MAX}
              className="input-editorial resize-none"
              aria-label="Ucapan"
              disabled={isLoading}
            />
            <div className="flex items-center justify-between gap-4">
              <button
                type="submit"
                disabled={isLoading || !newName.trim() || !newWish.trim()}
                className="btn-editorial"
              >
                {isLoading ? "Mengirim..." : "Kirim Ucapan"}
              </button>
              <span className="text-[10px] text-[var(--text-tertiary)] font-body tabular-nums">
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
                  className="text-[var(--accent)] text-sm font-body"
                >
                  Terima kasih atas ucapannya.
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

        <ul
          className={
            wishes.length > 0
              ? "columns-1 md:columns-2 md:gap-x-10"
              : "space-y-0"
          }
        >
          {isFetching ? (
            <motion.li
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-[var(--text-tertiary)] text-sm font-body py-12"
            >
              Memuat ucapan...
            </motion.li>
          ) : wishes.length === 0 ? (
            <motion.li
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-[var(--text-tertiary)] text-sm font-body py-12"
            >
              Belum ada ucapan. Jadilah yang pertama!
            </motion.li>
          ) : (
            visibleWishes.map((wish, index) => (
              <motion.li
                key={wish.id}
                initial="hidden"
                whileInView="visible"
                viewport={viewportOnce}
                variants={fadeUp}
                transition={{ ...easeOut, delay: Math.min(index, 5) * 0.05 }}
                className="relative break-inside-avoid mb-8 md:mb-10 pt-8 border-t border-[var(--border-subtle)]"
              >
                <span
                  aria-hidden="true"
                  className="absolute -top-1 left-0 font-display text-5xl md:text-6xl leading-none text-[var(--accent-muted)] opacity-40 select-none"
                >
                  &ldquo;
                </span>
                <div className="pl-8 md:pl-9">
                  <p className="font-display text-base md:text-lg text-[var(--text-secondary)] italic leading-relaxed mb-5">
                    {wish.message}
                  </p>
                  <div className="flex items-baseline justify-between gap-4">
                    <h4 className="font-body text-sm text-[var(--text-primary)] tracking-[0.02em]">
                      {wish.name}
                    </h4>
                    <time dateTime={wish.date} className="eyebrow shrink-0">
                      {new Date(wish.date).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </time>
                  </div>
                </div>
              </motion.li>
            ))
          )}
        </ul>

        {!isFetching && hasMore && (
          <div className="flex justify-center mt-4 md:mt-6">
            <button
              type="button"
              onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
              className="btn-editorial"
            >
              Tampilkan Lebih Banyak
            </button>
          </div>
        )}
      </div>
    </section>
  );
}