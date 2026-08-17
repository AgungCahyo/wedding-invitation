"use client";

import { motion } from "motion/react";
import { invitation } from "@/src/data/invitation";

export function Quote() {
  const { main, quranic, quranicTranslation } = invitation.quote;

  return (
    <section className="section bg-white">
      <div className="section-inner">
        <div className="max-w-3xl mx-auto">
          {/* Main quote */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12 md:mb-16"
          >
            <p className="text-2xl md:text-4xl lg:text-5xl font-display text-[#2b2520] leading-relaxed italic">
              "{main}"
            </p>
          </motion.div>

          {/* Divider */}
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="flex items-center justify-center gap-4 mb-12 md:mb-16"
          >
            <div className="flex-1 h-px bg-[#e8e3dd]" />
            <div className="w-2 h-2 rounded-full bg-[#c9a876]" />
            <div className="flex-1 h-px bg-[#e8e3dd]" />
          </motion.div>

          {/* Quranic quote */}
          {quranic && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <p className="text-lg md:text-xl text-[#8b7f76] font-display mb-3 italic">
                {quranic}
              </p>
              <p className="text-sm md:text-base text-[#5a524a] font-body">
                {quranicTranslation}
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
