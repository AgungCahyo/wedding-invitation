"use client";

import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect, useRef } from "react";
import { Pin, ChevronLeft, ChevronRight } from "lucide-react";
import { SectionHeader } from "@/src/components/ui/SectionHeader";
import { easeOut, fadeUp, viewportOnce } from "@/src/lib/motion";
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

/**
 * Horizontal, swipeable card row using native CSS scroll-snap — no extra
 * carousel library needed. Arrow buttons are a pointer-device enhancement
 * on top of native touch/trackpad swipe, which is the primary way most
 * guests (on mobile) will actually navigate this.
 */
function HorizontalScroller({
  children,
  ariaLabel,
  showArrows = true,
}: {
  children: React.ReactNode;
  ariaLabel: string;
  showArrows?: boolean;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const pauseAutoSlideRef = useRef(false);

  useEffect(() => {
    let animationFrame: number;
    let previousTime = performance.now();

    const animate = (time: number) => {
      const el = scrollerRef.current;
      const elapsed = time - previousTime;
      previousTime = time;

      if (el && !pauseAutoSlideRef.current) {
        const track = el.firstElementChild;
        const secondSet = track?.children[1] as HTMLElement | undefined;
        const loopWidth = secondSet?.offsetLeft ?? 0;
        el.scrollLeft += elapsed * 0.025;
        if (loopWidth > 0 && el.scrollLeft >= loopWidth) {
          el.scrollLeft -= loopWidth;
        }
      }

      animationFrame = window.requestAnimationFrame(animate);
    };

    animationFrame = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(animationFrame);
  }, []);

  const scrollByCard = (direction: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-scroll-card]");
    const step = card ? card.offsetWidth + 16 : el.clientWidth * 0.8;
    const track = el.firstElementChild;
    const secondSet = track?.children[1] as HTMLElement | undefined;
    const loopWidth = secondSet?.offsetLeft ?? 0;

    if (loopWidth === 0) {
      el.scrollBy({ left: step * direction, behavior: "smooth" });
      return;
    }

    let target = el.scrollLeft + step * direction;
    if (target >= loopWidth) target -= loopWidth;
    if (target < 0) target += loopWidth;
    el.scrollTo({ left: target, behavior: "smooth" });
  };

  return (
    <div
      className="relative"
      onMouseEnter={() => {
        pauseAutoSlideRef.current = true;
      }}
      onMouseLeave={() => {
        pauseAutoSlideRef.current = false;
      }}
      onFocus={() => {
        pauseAutoSlideRef.current = true;
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          pauseAutoSlideRef.current = false;
        }
      }}
    >
      <div
        ref={scrollerRef}
        role="region"
        aria-label={ariaLabel}
        className="overflow-x-auto scroll-pl-[clamp(1.25rem,4vw,2.5rem)] px-[clamp(1.25rem,4vw,2.5rem)] -mx-[clamp(1.25rem,4vw,2.5rem)] pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        <div className="flex w-max gap-4">
          <div className="flex shrink-0 gap-4">{children}</div>
          <div className="flex shrink-0 gap-4" aria-hidden="true">
            {children}
          </div>
        </div>
      </div>

      {showArrows && (
        <>
          <button
            type="button"
            onClick={() => scrollByCard(-1)}
            aria-label="Ucapan sebelumnya"
            className="absolute left-0 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--border)]/60 bg-[var(--bg-primary)]/70 text-[var(--text-tertiary)] opacity-60 backdrop-blur-sm transition-all hover:border-[var(--accent)] hover:text-[var(--accent)] hover:opacity-100"
          >
            <ChevronLeft size={14} strokeWidth={1.5} />
          </button>
          <button
            type="button"
            onClick={() => scrollByCard(1)}
            aria-label="Ucapan berikutnya"
            className="absolute right-0 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--border)]/60 bg-[var(--bg-primary)]/70 text-[var(--text-tertiary)] opacity-60 backdrop-blur-sm transition-all hover:border-[var(--accent)] hover:text-[var(--accent)] hover:opacity-100"
          >
            <ChevronRight size={14} strokeWidth={1.5} />
          </button>
        </>
      )}
    </div>
  );
}

export function Wishes({ guestName = "" }: { guestName?: string }) {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [newWish, setNewWish] = useState("");
  const [newName, setNewName] = useState(guestName);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [unavailable, setUnavailable] = useState(false);

  const pinnedWishes = wishes.filter((w) => w.isPinned);
  const regularWishes = wishes.filter((w) => !w.isPinned);
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
        if (refreshed.success) {
          setWishes(refreshed.data);
        }
        setNewWish("");
        setNewName("");
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 4000);
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
        <SectionHeader label="Ucapan" />

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
              className="input-editorial capitalize"
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

        {!isFetching && pinnedWishes.length > 0 && (
          <div className="mb-10 md:mb-12">
            {pinnedWishes.length === 1 ? (
              // Single pinned wish — spotlight card, no carousel chrome needed.
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={viewportOnce}
                variants={fadeUp}
                transition={easeOut}
                className="relative border border-[var(--accent)]/30 bg-[var(--bg-primary)] px-6 py-6 md:px-8 md:py-7 max-w-lg mx-auto"
              >
                <div className="flex items-center gap-1.5 mb-4 text-[var(--accent)]">
                  <Pin size={12} strokeWidth={2} />
                  <span className="eyebrow text-[var(--accent)]">Ucapan Keluarga</span>
                </div>
                <p className="font-display text-base md:text-lg text-[var(--text-secondary)] italic leading-relaxed mb-5">
                  {pinnedWishes[0].message}
                </p>
                <div className="flex items-baseline justify-between gap-4">
                  <h4 className="font-body text-sm text-[var(--text-primary)] tracking-[0.02em]">
                    {pinnedWishes[0].name}
                  </h4>
                  <time dateTime={pinnedWishes[0].date} className="eyebrow shrink-0">
                    {formatWishDate(pinnedWishes[0].date)}
                  </time>
                </div>
              </motion.div>
            ) : (
              // Multiple pinned wishes — its own compact carousel, styled
              // distinctly (accent border + larger card) so it still reads
              // as "highlighted" rather than blending into the regular row.
              <HorizontalScroller ariaLabel="Ucapan keluarga yang disematkan">
                {pinnedWishes.map((wish) => (
                  <motion.div
                    key={wish.id}
                    data-scroll-card
                    initial="hidden"
                    whileInView="visible"
                    viewport={viewportOnce}
                    variants={fadeUp}
                    transition={easeOut}
                    className="relative shrink-0 w-[82vw] sm:w-[360px] snap-center border border-[var(--accent)]/30 bg-[var(--bg-primary)] px-6 py-6 md:px-7 md:py-7"
                  >
                    <div className="flex items-center gap-1.5 mb-4 text-[var(--accent)]">
                      <Pin size={12} strokeWidth={2} />
                      <span className="eyebrow text-[var(--accent)]">Ucapan Keluarga</span>
                    </div>
                    <p className="font-display text-base text-[var(--text-secondary)] italic leading-relaxed mb-5">
                      {wish.message}
                    </p>
                    <div className="flex items-baseline justify-between gap-4">
                      <h4 className="font-body text-sm text-[var(--text-primary)] tracking-[0.02em]">
                        {wish.name}
                      </h4>
                      <time dateTime={wish.date} className="eyebrow shrink-0">
                        {formatWishDate(wish.date)}
                      </time>
                    </div>
                  </motion.div>
                ))}
              </HorizontalScroller>
            )}
          </div>
        )}

        {isFetching ? (
          <p className="text-center text-[var(--text-tertiary)] text-sm font-body py-12">
            Memuat ucapan...
          </p>
        ) : wishes.length === 0 ? (
          <p className="text-center text-[var(--text-tertiary)] text-sm font-body py-12">
            Belum ada ucapan.
          </p>
        ) : regularWishes.length === 0 ? null : (
          <HorizontalScroller ariaLabel="Ucapan tamu">
            {regularWishes.map((wish) => (
              <motion.div
                key={wish.id}
                data-scroll-card
                initial="hidden"
                whileInView="visible"
                viewport={viewportOnce}
                variants={fadeUp}
                transition={easeOut}
                className="shrink-0 w-[78vw] sm:w-[300px] snap-center border-t border-[var(--border-subtle)] pt-8"
              >
                <p className="font-display text-base text-[var(--text-secondary)] italic leading-relaxed mb-5 line-clamp-6">
                  {wish.message}
                </p>
                <div className="flex items-baseline justify-between gap-4">
                  <h4 className="font-body text-sm text-[var(--text-primary)] tracking-[0.02em]">
                    {wish.name}
                  </h4>
                  <time dateTime={wish.date} className="eyebrow shrink-0">
                    {formatWishDate(wish.date)}
                  </time>
                </div>
              </motion.div>
            ))}
          </HorizontalScroller>
        )}
      </div>
    </section>
  );
}