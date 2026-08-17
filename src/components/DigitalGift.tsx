"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { invitation } from "@/src/data/invitation";

export function DigitalGift() {
  const { gift } = invitation;
  const [copied, setCopied] = useState(false);

  const handleCopyAccountNumber = () => {
    navigator.clipboard.writeText(gift.accountNumber);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <section className="section bg-[#faf8f3]">
      <div className="section-inner max-w-2xl">
        {/* Section title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16 md:mb-24"
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="flex-1 h-px bg-[#e8e3dd]" />
            <p className="text-[#8b7f76] text-xs tracking-widest font-body">
              HADIAH DIGITAL
            </p>
            <div className="flex-1 h-px bg-[#e8e3dd]" />
          </div>
          <p className="text-[#5a524a] text-base md:text-lg font-body mt-6">
            Jika Anda ingin memberikan hadiah, berikut rekening kami
          </p>
        </motion.div>

        {/* Gift card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="bg-white p-8 md:p-12 border border-[#e8e3dd]"
        >
          {/* Bank name */}
          <div className="mb-8">
            <p className="text-[#8b7f76] text-xs tracking-widest font-body mb-2">
              BANK
            </p>
            <p className="text-[#2b2520] text-lg md:text-xl font-body">
              {gift.bank}
            </p>
          </div>

          {/* Divider */}
          <div className="h-px bg-[#e8e3dd] mb-8" />

          {/* Account number */}
          <div className="mb-8">
            <p className="text-[#8b7f76] text-xs tracking-widest font-body mb-3">
              NOMOR REKENING
            </p>
            <div className="flex items-center gap-3">
              <p className="text-[#2b2520] text-xl md:text-2xl font-body font-mono">
                {gift.accountNumber}
              </p>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleCopyAccountNumber}
                className="text-[#8b7f76] hover:text-[#c9a876] transition-colors"
                title="Copy to clipboard"
              >
                {copied ? (
                  <Check size={20} className="text-[#c9a876]" />
                ) : (
                  <Copy size={20} />
                )}
              </motion.button>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-[#e8e3dd] mb-8" />

          {/* Account holder */}
          <div>
            <p className="text-[#8b7f76] text-xs tracking-widest font-body mb-2">
              ATAS NAMA
            </p>
            <p className="text-[#2b2520] text-lg md:text-xl font-body">
              {gift.accountHolder}
            </p>
          </div>

          {/* Copy feedback */}
          {copied && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center text-[#c9a876] text-sm mt-6 font-body"
            >
              Nomor rekening telah disalin!
            </motion.p>
          )}
        </motion.div>

        {/* Alternative note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center text-[#8b7f76] text-xs md:text-sm font-body mt-8"
        >
          Kehadiran Anda adalah hadiah terbesar bagi kami. 💝
        </motion.p>
      </div>
    </section>
  );
}
