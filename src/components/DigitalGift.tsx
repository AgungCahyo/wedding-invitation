"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { invitation } from "@/src/data/invitation";
import { SectionHeader } from "@/src/components/ui/SectionHeader";
import { easeOut, fadeUp, viewportOnce } from "@/src/lib/motion";

export function DigitalGift() {
  const { gift } = invitation;
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(gift.accountNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

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
          className="space-y-0"
        >
          <div className="py-8 md:py-10 border-t border-[var(--border-subtle)]">
            <p className="eyebrow mb-3">Bank</p>
            <p className="font-body text-base md:text-lg text-[var(--text-primary)]">
              {gift.bank}
            </p>
          </div>

          <div className="py-8 md:py-10 border-t border-[var(--border-subtle)]">
            <p className="eyebrow mb-4">Account Number</p>
            <div className="flex items-center gap-5 flex-wrap">
              <p className="font-body text-xl md:text-2xl text-[var(--text-primary)] tracking-[0.08em] tabular-nums">
                {gift.accountNumber}
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
              {gift.accountHolder}
            </p>
          </div>
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
