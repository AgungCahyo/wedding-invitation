"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { Link2 } from "lucide-react";
import { invitation } from "@/src/data/invitation";

export function Couple() {
  const { groom, bride } = invitation.couple;

  return (
    <section className="section bg-[#faf8f3]">
      <div className="section-inner">
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
              MEMPELAI
            </p>
            <div className="flex-1 h-px bg-[#e8e3dd]" />
          </div>
        </motion.div>

        {/* Couple layout - groom and bride side by side on desktop, stacked on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 lg:gap-16">
          {/* Groom */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="flex flex-col items-center"
          >
            {/* Photo */}
            <div className="relative w-full aspect-[3/4] mb-8 md:mb-10 overflow-hidden bg-[#f5f3f0]">
              <Image
                src={groom.photo}
                alt={groom.name}
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* Name */}
            <h2 className="text-3xl md:text-4xl font-display text-[#2b2520] mb-3 text-center">
              {groom.name}
            </h2>

            {/* Parents */}
            <div className="text-center mb-6">
              {groom.parents.map((parent, i) => (
                <p key={i} className="text-[#5a524a] text-sm font-body mb-1">
                  {parent}
                </p>
              ))}
            </div>

            {/* Social link */}
            {groom.socialLinks?.instagram && (
              <motion.a
                href={groom.socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                className="text-[#8b7f76] hover:text-[#c9a876] transition-colors"
              >
                <Link2 size={20} />
              </motion.a>
            )}
          </motion.div>

          {/* Bride */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="flex flex-col items-center"
          >
            {/* Photo */}
            <div className="relative w-full aspect-[3/4] mb-8 md:mb-10 overflow-hidden bg-[#f5f3f0]">
              <Image
                src={bride.photo}
                alt={bride.name}
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* Name */}
            <h2 className="text-3xl md:text-4xl font-display text-[#2b2520] mb-3 text-center">
              {bride.name}
            </h2>

            {/* Parents */}
            <div className="text-center mb-6">
              {bride.parents.map((parent, i) => (
                <p key={i} className="text-[#5a524a] text-sm font-body mb-1">
                  {parent}
                </p>
              ))}
            </div>

            {/* Social link */}
            {bride.socialLinks?.instagram && (
              <motion.a
                href={bride.socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                className="text-[#8b7f76] hover:text-[#c9a876] transition-colors"
              >
                <Link2 size={20} />
              </motion.a>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
