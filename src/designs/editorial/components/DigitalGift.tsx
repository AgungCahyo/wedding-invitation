"use client";

import { motion, AnimatePresence } from "motion/react";
import { useMemo, useState } from "react";
import { invitation } from "@/src/data/invitation";
import { SectionHeader } from "@/src/designs/editorial/ui/SectionHeader";
import { editorialEasing } from "@/src/designs/editorial/motion";

type Owner = "groom" | "bride";

export function DigitalGift() {
  const { gift, couple } = invitation;

  const owners: { id: Owner; name: string }[] = [
    { id: "bride", name: couple.bride.name.split(" ")[0] },
    { id: "groom", name: couple.groom.name.split(" ")[0] },
  ];

  const [isRevealed, setIsRevealed] = useState(false);
  const [activeOwner, setActiveOwner] = useState<Owner>("groom");
  const [copied, setCopied] = useState<"bank" | "ewallet" | null>(null);

  const methods = useMemo(
    () => gift.methods.filter((m) => m.owner === activeOwner),
    [gift.methods, activeOwner]
  );

  const bank = methods.find((m) => m.type === "bank");
  const ewallet = methods.find((m) => m.type === "ewallet");
  const ewalletLabels = methods
    .filter((m) => m.type === "ewallet")
    .map((m) => m.label)
    .join(" · ");

  const handleCopy = async (value: string, key: "bank" | "ewallet") => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      setTimeout(() => setCopied(null), 2500);
    } catch {
      setCopied(null);
    }
  };

  return (
    <section id="gift" className="section bg-[var(--bg-primary)]">
      <div className="section-inner max-w-xl">
        <AnimatePresence mode="wait">
          {!isRevealed ? (
            <motion.div
              key="teaser"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4, ease: editorialEasing }}
            >
              <SectionHeader index="05" label="Tanda Kasih" />
              <p className="font-body text-sm md:text-base text-[var(--text-secondary)] leading-relaxed max-w-sm mb-10">
                {gift.note}
              </p>
              <button type="button" onClick={() => setIsRevealed(true)} className="btn-editorial">
                Lihat Rekening
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4, ease: editorialEasing }}
            >
              <SectionHeader
                index="05"
                label="Tanda Kasih"
                subtitle="Jika berkenan memberikan tanda kasih, berikut rekening kami."
              />

              <div role="tablist" aria-label="Pilih mempelai" className="flex items-center gap-10 mb-12 md:mb-14">
                {owners.map((owner) => {
                  const isActive = owner.id === activeOwner;
                  return (
                    <button
                      key={owner.id}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => {
                        setActiveOwner(owner.id);
                        setCopied(null);
                      }}
                      className={`text-[11px] tracking-[0.2em] uppercase font-body pb-1 border-b transition-colors ${
                        isActive
                          ? "text-[var(--text-primary)] border-[var(--text-primary)]"
                          : "text-[var(--text-tertiary)] border-transparent hover:text-[var(--text-secondary)]"
                      }`}
                    >
                      {owner.name}
                    </button>
                  );
                })}
              </div>

              {bank && (
                <div className="py-8 border-t border-[var(--border-subtle)]">
                  <p
                    className="mb-3 text-[0.625rem] font-medium uppercase tracking-[0.25em]"
                    style={{ fontFamily: "var(--font-label)", color: "var(--text-tertiary)" }}
                  >
                    {bank.label}
                  </p>
                  <p className="font-body text-xl md:text-2xl text-[var(--text-primary)] tracking-[0.08em] tabular-nums mb-2">
                    {bank.accountNumber}
                  </p>
                  <p className="font-display text-lg md:text-xl text-[var(--text-primary)] mb-5">
                    {bank.accountHolder}
                  </p>
                  <button type="button" onClick={() => handleCopy(bank.accountNumber, "bank")} className="btn-editorial">
                    {copied === "bank" ? "Tersalin" : "Salin Nomor"}
                  </button>
                </div>
              )}

              {ewallet && (
                <div className="py-8 border-t border-b border-[var(--border-subtle)]">
                  <p
                    className="mb-3 text-[0.625rem] font-medium uppercase tracking-[0.25em]"
                    style={{ fontFamily: "var(--font-label)", color: "var(--text-tertiary)" }}
                  >
                    {ewalletLabels}
                  </p>
                  <p className="font-body text-xl md:text-2xl text-[var(--text-primary)] tracking-[0.08em] tabular-nums mb-2">
                    {ewallet.accountNumber}
                  </p>
                  <p className="font-display text-lg md:text-xl text-[var(--text-primary)] mb-5">
                    {ewallet.accountHolder}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleCopy(ewallet.accountNumber, "ewallet")}
                    className="btn-editorial"
                  >
                    {copied === "ewallet" ? "Tersalin" : "Salin Nomor"}
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={() => setIsRevealed(false)}
                className="mt-10 block btn-editorial text-[var(--text-tertiary)] border-[var(--text-tertiary)]"
              >
                Sembunyikan
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
