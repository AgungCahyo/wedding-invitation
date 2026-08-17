"use client";

import { motion } from "motion/react";
import { invitation } from "@/src/data/invitation";

export function Closing() {
  const { closing } = invitation;

  return (
    <section className="section bg-white min-h-[60vh] md:min-h-[70vh] flex items-center">
      <div className="section-inner w-full">
        <div className="max-w-3xl mx-auto text-center">
          {/* Message */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-2xl md:text-4xl lg:text-5xl font-display text-[#2b2520] mb-12 md:mb-16 leading-relaxed"
          >
            {closing.message}
          </motion.p>

          {/* Divider */}
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="w-16 h-px bg-[#c9a876] mx-auto mb-12 md:mb-16"
          />

          {/* Couple name */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl lg:text-6xl font-display text-[#2b2520]"
          >
            {closing.couple}
          </motion.h2>

          {/* Decorative dots */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            viewport={{ once: true }}
            className="mt-12 md:mt-16 flex items-center justify-center gap-3"
          >
            <div className="w-2 h-2 rounded-full bg-[#c9a876]" />
            <div className="w-2 h-2 rounded-full bg-[#c9a876]" />
            <div className="w-2 h-2 rounded-full bg-[#c9a876]" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
