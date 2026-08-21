"use client";

import { motion, AnimatePresence } from "motion/react";
import { useMemo, useState } from "react";
import { invitation } from "@/src/data/invitation";
import { ModernSection } from "@/src/designs/modern/layout/ModernSection";
import { SectionLabel } from "@/src/designs/modern/layout/SectionLabel";

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
    <ModernSection id="gift">
      <AnimatePresence mode="wait">
        {!isRevealed ? (
          <motion.div key="teaser" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <SectionLabel index="07">Tanda Kasih</SectionLabel>
            <p className="font-body text-sm mb-6 max-w-sm text-[var(--text-secondary)] -mt-2">
              {gift.note}
            </p>
            <button
              type="button"
              onClick={() => setIsRevealed(true)}
              className="px-6 py-2.5 text-[11px] font-body font-medium tracking-[0.16em] uppercase text-white bg-[var(--accent)]"
            >
              Lihat Rekening
            </button>
          </motion.div>
        ) : (
          <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <SectionLabel index="07">Tanda Kasih</SectionLabel>

            <div role="tablist" className="flex items-center gap-2 mb-8 -mt-2">
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
                    className={`px-4 py-2 text-[11px] font-body tracking-[0.1em] uppercase border transition-colors ${
                      isActive
                        ? "border-[var(--text-primary)] bg-[var(--text-primary)] text-[var(--bg-primary)]"
                        : "border-[var(--border)]"
                    }`}
                  >
                    {owner.name}
                  </button>
                );
              })}
            </div>

            {bank && (
              <div className="py-5 border-t border-[var(--border)]">
                <p className="text-[11px] font-body tracking-[0.15em] uppercase mb-2 text-[var(--text-tertiary)]">
                  {bank.label}
                </p>
                <p className="font-body text-xl tracking-[0.04em] tabular-nums mb-1">{bank.accountNumber}</p>
                <p className="font-body text-sm mb-3 text-[var(--text-secondary)]">{bank.accountHolder}</p>
                <button
                  type="button"
                  onClick={() => handleCopy(bank.accountNumber, "bank")}
                  className="text-[11px] font-body tracking-[0.12em] uppercase underline underline-offset-4 text-[var(--accent)]"
                >
                  {copied === "bank" ? "Tersalin" : "Salin Nomor"}
                </button>
              </div>
            )}

            {ewallet && (
              <div className="py-5 border-t border-[var(--border)]">
                <p className="text-[11px] font-body tracking-[0.15em] uppercase mb-2 text-[var(--text-tertiary)]">
                  {ewalletLabels}
                </p>
                <p className="font-body text-xl tracking-[0.04em] tabular-nums mb-1">
                  {ewallet.accountNumber}
                </p>
                <p className="font-body text-sm mb-3 text-[var(--text-secondary)]">{ewallet.accountHolder}</p>
                <button
                  type="button"
                  onClick={() => handleCopy(ewallet.accountNumber, "ewallet")}
                  className="text-[11px] font-body tracking-[0.12em] uppercase underline underline-offset-4 text-[var(--accent)]"
                >
                  {copied === "ewallet" ? "Tersalin" : "Salin Nomor"}
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => setIsRevealed(false)}
              className="mt-6 text-[11px] font-body tracking-[0.12em] uppercase text-[var(--text-tertiary)]"
            >
              Sembunyikan
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </ModernSection>
  );
}
