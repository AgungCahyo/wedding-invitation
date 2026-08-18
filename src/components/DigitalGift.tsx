"use client";

import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { Copy, Check, Landmark, Wallet } from "lucide-react";
import { invitation } from "@/src/data/invitation";
import { SectionHeader } from "@/src/components/ui/SectionHeader";
import { easeOut, fadeUp, viewportOnce } from "@/src/lib/motion";

export function DigitalGift() {
  const { gift } = invitation;
  const [activeId, setActiveId] = useState(gift.methods[0]?.id);
  const [copied, setCopied] = useState(false);

  const active = gift.methods.find((m) => m.id === activeId) ?? gift.methods[0];

  const handleSelect = (id: string) => {
    setActiveId(id);
    setCopied(false);
  };

  const handleCopy = async () => {
    if (!active) return;
    try {
      await navigator.clipboard.writeText(active.accountNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  if (!active) return null;

  return (
    <section id="gift" className="section bg-[var(--bg-primary)]">
      <div className="section-inner max-w-xl">
        <SectionHeader
          label="Digital Gift"
          subtitle="Jika Anda ingin memberikan hadiah, berikut rekening kami"
        />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={fadeUp}
          transition={easeOut}
        >
          {/* Method tabs */}
          <div
            role="tablist"
            aria-label="Metode pembayaran"
            className="flex flex-wrap items-center justify-center gap-x-7 gap-y-3 mb-10 md:mb-12"
          >
            {gift.methods.map((method) => {
              const isActive = method.id === active.id;
              return (
                <button
                  key={method.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => handleSelect(method.id)}
                  className={`inline-flex items-center gap-1.5 pb-1.5 border-b text-[11px] tracking-[0.18em] uppercase font-body transition-colors ${
                    isActive
                      ? "border-[var(--text-primary)] text-[var(--text-primary)]"
                      : "border-transparent text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
                  }`}
                >
                  {method.type === "bank" ? (
                    <Landmark size={13} strokeWidth={1.5} />
                  ) : (
                    <Wallet size={13} strokeWidth={1.5} />
                  )}
                  {method.label}
                </button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={active.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              className="space-y-0"
            >
              <div className="py-8 md:py-10 border-t border-[var(--border-subtle)]">
                <p className="eyebrow mb-3">
                  {active.type === "bank" ? "Bank" : "E-Wallet"}
                </p>
                <p className="font-body text-base md:text-lg text-[var(--text-primary)]">
                  {active.label}
                </p>
              </div>

              <div className="py-8 md:py-10 border-t border-[var(--border-subtle)]">
                <p className="eyebrow mb-4">
                  {active.type === "bank" ? "Account Number" : "Nomor"}
                </p>
                <div className="flex items-center gap-5 flex-wrap">
                  <p className="font-body text-xl md:text-2xl text-[var(--text-primary)] tracking-[0.08em] tabular-nums">
                    {active.accountNumber}
                  </p>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase font-body text-[var(--text-tertiary)] hover:text-[var(--accent)] transition-colors"
                    aria-label="Copy account number"
                  >
                    {copied ? (
                      <>
                        <Check size={14} strokeWidth={1.5} />
                        <span className="text-[var(--accent)]">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy size={14} strokeWidth={1.5} />
                        Copy
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="py-8 md:py-10 border-t border-b border-[var(--border-subtle)]">
                <p className="eyebrow mb-3">Account Holder</p>
                <p className="font-display text-xl md:text-2xl text-[var(--text-primary)]">
                  {active.accountHolder}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        <motion.p
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={fadeUp}
          transition={{ ...easeOut, delay: 0.15 }}
          className="text-center text-[var(--text-tertiary)] text-xs md:text-sm font-body mt-12 italic leading-relaxed"
        >
          {gift.note}
        </motion.p>
      </div>
    </section>
  );
}