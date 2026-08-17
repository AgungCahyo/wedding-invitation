"use client";

import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { invitation } from "@/src/data/invitation";
import { SectionHeader } from "@/src/components/ui/SectionHeader";
import { easeOut, fadeUp, viewportOnce } from "@/src/lib/motion";
import { saveWish, fetchWishes } from "@/src/lib/wishes-service";

interface Wish {
  id: number;
  name: string;
  message: string;
  date: string;
}

export function Wishes() {
  const [wishes, setWishes] = useState<Wish[]>(invitation.wishes);
  const [newWish, setNewWish] = useState("");
  const [newName, setNewName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Fetch wishes on mount
  useEffect(() => {
    const loadWishes = async () => {
      try {
        setIsFetching(true);
        const result = await fetchWishes();
        if (result.success) {
          // Combine server wishes with local wishes (server first)
          setWishes([...result.data, ...invitation.wishes]);
        }
      } catch (error) {
        console.error("Error loading wishes:", error);
        // Fall back to local wishes if fetch fails
      } finally {
        setIsFetching(false);
      }
    };

    loadWishes();
  }, []);

  const handleAddWish = async () => {
    if (!newName.trim() || !newWish.trim()) return;

    setIsLoading(true);
    setSubmitError(null);

    try {
      const result = await saveWish(newName, newWish);
      if (result.success) {
        setWishes([
          {
            id: result.data.id,
            name: result.data.name,
            message: result.data.message,
            date: result.data.created_at.split("T")[0],
          },
          ...wishes,
        ]);
        setNewWish("");
        setNewName("");
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

  const inputClass =
    "w-full bg-transparent border-b border-[var(--border)] py-3 text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent)] transition-colors font-body text-sm";

  return (
    <section id="wishes" className="section bg-[var(--bg-secondary)]">
      <div className="section-inner max-w-2xl">
        <SectionHeader label="Wishes" />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={fadeUp}
          transition={easeOut}
          className="mb-12 md:mb-16 space-y-4"
        >
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nama Anda"
            className={inputClass}
            aria-label="Nama untuk ucapan"
            disabled={isLoading}
          />
          <textarea
            value={newWish}
            onChange={(e) => setNewWish(e.target.value)}
            placeholder="Tulis ucapan atau doa..."
            rows={3}
            className={`${inputClass} resize-none`}
            aria-label="Ucapan"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={handleAddWish}
            disabled={isLoading}
            className="text-[11px] tracking-[0.25em] uppercase font-body text-[var(--text-primary)] border-b border-[var(--text-primary)] pb-1 hover:text-[var(--accent)] hover:border-[var(--accent)] transition-colors disabled:opacity-60"
          >
            {isLoading ? "Mengirim..." : "Kirim Ucapan"}
          </button>
          {submitError && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-600/80 text-sm font-body"
            >
              {submitError}
            </motion.p>
          )}
        </motion.div>

        <ul className="space-y-10 md:space-y-12">
          {isFetching ? (
            <motion.li
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-[var(--text-tertiary)] text-sm font-body py-8"
            >
              Memuat ucapan...
            </motion.li>
          ) : wishes.length === 0 ? (
            <motion.li
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-[var(--text-tertiary)] text-sm font-body py-8"
            >
              Belum ada ucapan. Jadilah yang pertama!
            </motion.li>
          ) : (
            wishes.map((wish, index) => (
              <motion.li
                key={wish.id}
                initial="hidden"
                whileInView="visible"
                viewport={viewportOnce}
                variants={fadeUp}
                transition={{ ...easeOut, delay: index * 0.06 }}
                className="border-t border-[var(--border)] pt-8"
              >
                <div className="flex items-baseline justify-between gap-4 mb-4">
                  <h4 className="font-display text-lg md:text-xl text-[var(--text-primary)]">
                    {wish.name}
                  </h4>
                  <time
                    dateTime={wish.date}
                    className="text-[10px] text-[var(--text-tertiary)] font-body tracking-widest shrink-0"
                  >
                    {new Date(wish.date).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </time>
                </div>
                <p className="font-display text-base md:text-lg text-[var(--text-secondary)] italic leading-relaxed">
                  &ldquo;{wish.message}&rdquo;
                </p>
              </motion.li>
            ))
          )}
        </ul>
      </div>
    </section>
  );
}
