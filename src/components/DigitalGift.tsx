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
      // Fallback for older browsers
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
          className="space-y-8 md:space-y-10"
        >
          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase font-body text-[var(--text-tertiary)] mb-2">
              Bank
            </p>
            <p className="font-body text-lg md:text-xl text-[var(--text-primary)]">
              {gift.bank}
            </p>
          </div>

          <div className="h-px bg-[var(--border)]" />

          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase font-body text-[var(--text-tertiary)] mb-3">
              Account Number
            </p>
            <div className="flex items-center gap-4 flex-wrap">
              <p className="font-body text-xl md:text-2xl text-[var(--text-primary)] tracking-wider">
                {gift.accountNumber}
              </p>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase font-body text-[var(--text-tertiary)] hover:text-[var(--accent)] transition-colors"
                aria-label="Copy account number"
              >
                {copied ? (
                  <>
                    <Check size={16} strokeWidth={1.5} />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy size={16} strokeWidth={1.5} />
                    Copy Account Number
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="h-px bg-[var(--border)]" />

          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase font-body text-[var(--text-tertiary)] mb-2">
              Account Holder
            </p>
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
          transition={{ ...easeOut, delay: 0.2 }}
          className="text-center text-[var(--text-tertiary)] text-xs md:text-sm font-body mt-12 italic"
        >
          {gift.note}
        </motion.p>
      </div>
    </section>
  );
}
