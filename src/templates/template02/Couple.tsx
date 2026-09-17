"use client";

import { motion } from "motion/react";
import { easeOut, fadeUp, viewportOnce } from "@/src/lib/motion";

export function Couple({ guestName = "", guestSlug = "", invitation, invitationId }: {
  guestName?: string;
  guestSlug?: string;
  invitation: any;
  invitationId?: string | undefined;
}) {
  const { groom, bride } = invitation.couple;

  return (
    <section id="couple" className="section bg-[var(--bg-primary)]">
      <div className="section-inner max-w-4xl mx-auto px-6 py-16 md:py-20">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={fadeUp}
          transition={{ ...easeOut, delay: 0.1 }}
          className="mb-12 text-center"
        >
          <h1 className="font-display text-[clamp(2.5rem,6vw,4rem)] tracking-tight leading-none text-[var(--text-primary)] mb-4">
            {groom.name} & {bride.name}
          </h1>
          <p className="font-body text-lg md:text-xl leading-relaxed text-[var(--text-secondary)]">
            {guestName && guestName !== "Tamu"
              ? `Dengan hormat kami undang Bapak/Ibu/Saudara/i ${guestName}`
              : "Dengan hormat kami undang hadir"}
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={fadeUp}
          transition={{ ...easeOut, delay: 0.3 }}
          className="grid gap-8 md:grid-cols-2 items-start"
        >
          {/* Groom Section */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            variants={fadeUp}
            transition={{ ...easeOut, delay: 0.4 }}
            className="space-y-6"
          >
            <h2 className="font-display text-[clamp(1.75rem,4vw,2.5rem)] text-[var(--text-primary)] mb-3">
              Mempelai Pria
            </h2>
            <div className="space-y-2">
              <p className="font-display text-[clamp(1.5rem,3vw,2rem)] font-semibold text-[var(--text-primary)]">
                {groom.name}
              </p>
              <p className="font-body text-sm text-[var(--text-tertiary)]">
                {groom.fullName}
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {groom.parents.map((parent: string, index: number) => (
                  <span key={index} className="text-xs text-[var(--text-secondary)]">
                    {parent}{index < groom.parents.length - 1 ? "," : ""}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Bride Section */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            variants={fadeUp}
            transition={{ ...easeOut, delay: 0.5 }}
            className="space-y-6"
          >
            <h2 className="font-display text-[clamp(1.75rem,4vw,2.5rem)] text-[var(--text-primary)] mb-3">
              Mempelai Wanita
            </h2>
            <div className="space-y-2">
              <p className="font-display text-[clamp(1.5rem,3vw,2rem)] font-semibold text-[var(--text-primary)]">
                {bride.name}
              </p>
              <p className="font-body text-sm text-[var(--text-tertiary)]">
                {bride.fullName}
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {bride.parents.map((parent: string, index: number) => (
                  <span key={index} className="text-xs text-[var(--text-secondary)]">
                    {parent}{index < bride.parents.length - 1 ? "," : ""}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}