"use client";

import { motion } from "motion/react";
import { MapPin } from "lucide-react";
import { invitation } from "@/src/data/invitation";

export function EventDetails() {
  const { akad, reception } = invitation.events;

  const EventCard = ({
    title,
    event,
    index,
  }: {
    title: string;
    event: (typeof akad) | (typeof reception);
    index: number;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: index * 0.2 }}
      viewport={{ once: true }}
      className="bg-white p-8 md:p-12 rounded-none border border-[#e8e3dd]"
    >
      {/* Title */}
      <h3 className="text-2xl md:text-3xl font-display text-[#2b2520] mb-6 md:mb-8">
        {title}
      </h3>

      {/* Event details grid */}
      <div className="space-y-4 md:space-y-6 mb-8 md:mb-10">
        {/* Date */}
        <div>
          <p className="text-[#8b7f76] text-xs tracking-widest font-body mb-2">
            HARI & TANGGAL
          </p>
          <p className="text-[#2b2520] text-lg md:text-xl font-body">
            {event.dayName}, {event.date}
          </p>
        </div>

        {/* Time */}
        <div>
          <p className="text-[#8b7f76] text-xs tracking-widest font-body mb-2">
            WAKTU
          </p>
          <p className="text-[#2b2520] text-lg md:text-xl font-body">
            {event.time}
          </p>
        </div>

        {/* Venue */}
        <div>
          <p className="text-[#8b7f76] text-xs tracking-widest font-body mb-2">
            TEMPAT
          </p>
          <p className="text-[#2b2520] text-lg md:text-xl font-display mb-2">
            {event.venue}
          </p>
          <p className="text-[#5a524a] text-sm md:text-base font-body">
            {event.address}
          </p>
        </div>
      </div>

      {/* Map button */}
      <motion.a
        href={event.mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ x: 4 }}
        whileTap={{ scale: 0.98 }}
        className="inline-flex items-center gap-2 text-[#c9a876] hover:text-[#2b2520] transition-colors text-sm md:text-base font-body"
      >
        <MapPin size={18} />
        View Location
      </motion.a>
    </motion.div>
  );

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
              ACARA KAMI
            </p>
            <div className="flex-1 h-px bg-[#e8e3dd]" />
          </div>
        </motion.div>

        {/* Events grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          <EventCard title="Akad Nikah" event={akad} index={0} />
          <EventCard title="Resepsi" event={reception} index={1} />
        </div>
      </div>
    </section>
  );
}
