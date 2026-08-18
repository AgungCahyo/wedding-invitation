"use client";

import { motion, AnimatePresence } from "motion/react";
import { useMemo, useState } from "react";
import { Copy, Check, Landmark, Wallet } from "lucide-react";
import { invitation } from "@/src/data/invitation";
import { SectionHeader } from "@/src/components/ui/SectionHeader";
import { easeOut, fadeUp, viewportOnce } from "@/src/lib/motion";

type Owner = "groom" | "bride";

export function DigitalGift() {
  const { gift, couple } = invitation;

  const owners: { id: Owner; name: string }[] = [
    { id: "groom", name: couple.groom.name },
    { id: "bride", name: couple.bride.name },
  ];

  const [activeOwner, setActiveOwner] = useState<Owner>("groom");

  const ownerMethods = useMemo(
    () => gift.methods.filter((m) => m.owner === activeOwner),
    [gift.methods, activeOwner]
  );

  const [activeId, setActiveId] = useState<string | undefined>(
    ownerMethods[0]?.id
  );
  const [copied, setCopied] = useState(false);

  const active =
    ownerMethods.find((m) => m.id === activeId) ?? ownerMethods[0];

  const handleSelectOwner = (owner: Owner) => {
    setActiveOwner(owner);
    const firstMethod = gift.methods.find((m) => m.owner === owner);
    setActiveId(firstMethod?.id);
    setCopied(false);
  };

  const handleSelectMethod = (id: string) => {
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
          {/* Owner selector — Mempelai Pria / Mempelai Wanita */}
          <div
            role="tablist"
            aria-label="Pilih mempelai"
            className="flex items-center justify-center gap-0 mb-8 md:mb-10 border border-[var(--border)] max-w-sm mx-auto"
          >
            {owners.map((owner) => {
              const isActive = owner.id === activeOwner;
              return (
                <button
                  key={owner.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => handleSelectOwner(owner.id)}
                  className={`flex-1 py-3 px-3 text-[11px] tracking-[0.18em] uppercase font-body transition-colors duration-300 ${
                    isActive
                      ? "bg-[var(--text-primary)] text-[var(--bg-primary)]"
                      : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
                  }`}
                >
                  {owner.name.split(" ")[0]}
                </button>
              );
            })}
          </div>

          {/* Method tabs, scoped to the selected mempelai */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeOwner}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <div
                role="tablist"
                aria-label="Metode pembayaran"
                className="flex flex-wrap items-center justify-center gap-x-7 gap-y-3 mb-10 md:mb-12"
              >
                {ownerMethods.map((method) => {
                  const isActive = method.id === active.id;
                  return (
                    <button
                      key={method.id}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => handleSelectMethod(method.id)}
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

              <div className="space-y-0">
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