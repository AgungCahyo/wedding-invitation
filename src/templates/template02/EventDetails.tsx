"use client";

import { motion } from "motion/react";
import { easeOut, fadeUp, viewportOnce } from "@/src/lib/motion";

export function EventDetails({ guestName = "", guestSlug = "", invitation, invitationId }: {
  guestName?: string;
  guestSlug?: string;
  invitation: any;
  invitationId?: string | undefined;
}) {
  const { events } = invitation;

  return (
    <section id="event-details" className="section bg-[var(--bg-primary)]">
      <div className="section-inner max-w-3xl mx-auto px-6 py-16 md:py-20">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={fadeUp}
          transition={{ ...easeOut, delay: 0.1 }}
          className="mb-12 text-center"
        >
          <h1 className="font-display text-[clamp(2.25rem,5vw,3rem)] tracking-tight leading-none text-[var(--text-primary)] mb-4">
            Detail Acara Pernikahan
          </h1>
          <p className="font-body text-lg md:text-xl leading-relaxed text-[var(--text-secondary)]">
            Mari bersama merayakan momen berharga ini
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={fadeUp}
          transition={{ ...easeOut, delay: 0.3 }}
          className="space-y-8"
        >
          {/* Akad Section */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            variants={fadeUp}
            transition={{ ...easeOut, delay: 0.4 }}
            className="bg-[var(--bg-secondary)] rounded-xl p-6 md:p-8"
          >
            <h2 className="font-display text-[clamp(1.75rem,4vw,2.5rem)] text-[var(--text-primary)] mb-4">
              Akad Nikah
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <p className="font-body text-sm text-[var(--text-tertiary)]">Tanggal</p>
                <p className="font-display text-[clamp(1.25rem,3vw,1.75rem)] font-medium text-[var(--text-primary)]">
                  {events.akad.date}
                </p>
              </div>
              <div className="space-y-2">
                <p className="font-body text-sm text-[var(--text-tertiary)]">Hari</p>
                <p className="font-display text-[clamp(1.25rem,3vw,1.75rem)] font-medium text-[var(--text-primary)]">
                  {events.akad.dayName}
                </p>
              </div>
              <div className="space-y-2">
                <p className="font-body text-sm text-[var(--text-tertiary)]">Waktu</p>
                <p className="font-display text-[clamp(1.25rem,3vw,1.75rem)] font-medium text-[var(--text-primary)]">
                  {events.akad.time}
                </p>
              </div>
              <div className="space-y-2">
                <p className="font-body text-sm text-[var(--text-tertiary)]">Tempat</p>
                <p className="font-body text-[var(--text-secondary)] max-w-[22ch]">
                  {events.akad.venue}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Reception Section */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            variants={fadeUp}
            transition={{ ...easeOut, delay: 0.5 }}
            className="bg-[var(--bg-secondary)] rounded-xl p-6 md:p-8"
          >
            <h2 className="font-display text-[clamp(1.75rem,4vw,2.5rem)] text-[var(--text-primary)] mb-4">
              Resepsi
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <p className="font-body text-sm text-[var(--text-tertiary)]">Tanggal</p>
                <p className="font-display text-[clamp(1.25rem,3vw,1.75rem)] font-medium text-[var(--text-primary)]">
                  {events.reception.date}
                </p>
              </div>
              <div className="space-y-2">
                <p className="font-body text-sm text-[var(--text-tertiary)]">Hari</p>
                <p className="font-display text-[clamp(1.25rem,3vw,1.75rem)] font-medium text-[var(--text-primary)]">
                  {events.reception.dayName}
                </p>
              </div>
              <div className="space-y-2">
                <p className="font-body text-sm text-[var(--text-tertiary)]">Waktu</p>
                <p className="font-display text-[clamp(1.25rem,3vw,1.75rem)] font-medium text-[var(--text-primary)]">
                  {events.reception.time}
                </p>
              </div>
              <div className="space-y-2">
                <p className="font-body text-sm text-[var(--text-tertiary)]">Tempat</p>
                <p className="font-body text-[var(--text-secondary)] max-w-[22ch]">
                  {events.reception.venue}
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}