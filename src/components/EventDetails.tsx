"use client";

import { motion } from "motion/react";
import { MapPin } from "lucide-react";
import { invitation } from "@/src/data/invitation";
import { SectionHeader } from "@/src/components/ui/SectionHeader";
import { easeOut, fadeUp, viewportOnce } from "@/src/lib/motion";

type EventData = (typeof invitation.events)["akad"];

function EventBlock({
  title,
  event,
  index,
}: {
  title: string;
  event: EventData;
  index: number;
}) {
  return (
    <motion.article
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      variants={fadeUp}
      transition={{ ...easeOut, delay: index * 0.15 }}
      className="py-10 md:py-14 border-t border-[var(--border)]"
    >
      <h3 className="font-display text-3xl md:text-4xl text-[var(--text-primary)] mb-8 md:mb-10">
        {title}
      </h3>

      <dl className="space-y-6 md:space-y-8">
        <div>
          <dt className="text-[var(--text-tertiary)] text-[10px] tracking-[0.3em] uppercase font-body mb-2">
            Hari &amp; Tanggal
          </dt>
          <dd className="font-display text-xl md:text-2xl text-[var(--text-primary)]">
            {event.dayName}, {event.date}
          </dd>
        </div>

        <div>
          <dt className="text-[var(--text-tertiary)] text-[10px] tracking-[0.3em] uppercase font-body mb-2">
            Waktu
          </dt>
          <dd className="font-body text-lg md:text-xl text-[var(--text-primary)]">
            {event.time}
          </dd>
        </div>

        <div>
          <dt className="text-[var(--text-tertiary)] text-[10px] tracking-[0.3em] uppercase font-body mb-2">
            Lokasi
          </dt>
          <dd>
            <p className="font-display text-xl md:text-2xl text-[var(--text-primary)] mb-2">
              {event.venue}
            </p>
            <p className="font-body text-sm md:text-base text-[var(--text-secondary)] leading-relaxed max-w-md">
              {event.address}
            </p>
          </dd>
        </div>
      </dl>

      <a
        href={event.mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 mt-8 md:mt-10 text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors text-xs tracking-[0.2em] uppercase font-body group"
      >
        <MapPin size={16} strokeWidth={1.5} className="group-hover:scale-110 transition-transform" />
        View Location
      </a>
    </motion.article>
  );
}

export function EventDetails() {
  const { akad, reception } = invitation.events;

  return (
    <section id="events" className="section bg-[var(--bg-primary)]">
      <div className="section-inner max-w-5xl">
        <SectionHeader label="Event Details" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-16 lg:gap-24 border-b border-[var(--border)]">
          <EventBlock title="Akad Nikah" event={akad} index={0} />
          <EventBlock title="Resepsi" event={reception} index={1} />
        </div>
      </div>
    </section>
  );
}
