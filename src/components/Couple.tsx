"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { Link2 } from "lucide-react";
import { invitation } from "@/src/data/invitation";
import { SectionHeader } from "@/src/components/ui/SectionHeader";
import { easeOut, fadeUp, viewportOnce } from "@/src/lib/motion";

function PersonCard({
  name,
  fullName,
  parents,
  photo,
  socialLinks,
  align,
  delay,
}: {
  name: string;
  fullName: string;
  parents: string[];
  photo: string;
  socialLinks?: { instagram?: string };
  align: "left" | "right";
  delay: number;
}) {
  return (
    <motion.article
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      variants={fadeUp}
      transition={{ ...easeOut, delay }}
      className={`flex flex-col ${align === "right" ? "md:items-end md:text-right" : "md:items-start md:text-left"} items-center text-center`}
    >
      <div className="relative w-full max-w-sm aspect-[3/4] mb-8 md:mb-10 overflow-hidden">
        <Image
          src={photo}
          alt={name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 400px"
        />
        <div className="absolute inset-0 ring-1 ring-inset ring-[var(--border)]/40 pointer-events-none" />
      </div>

      <p className="text-[var(--text-tertiary)] text-[10px] tracking-[0.3em] uppercase font-body mb-3">
        {align === "left" ? "Mempelai Pria" : "Mempelai Wanita"}
      </p>

      <h2 className="font-display text-3xl md:text-4xl text-[var(--text-primary)] mb-1">
        {name}
      </h2>
      <p className="text-[var(--text-tertiary)] text-sm font-body mb-6">
        {fullName}
      </p>

      <div className="space-y-1 mb-6">
        {parents.map((parent) => (
          <p key={parent} className="text-[var(--text-secondary)] text-sm font-body">
            {parent}
          </p>
        ))}
      </div>

      {socialLinks?.instagram && (
        <a
          href={socialLinks.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-[var(--text-tertiary)] hover:text-[var(--accent)] transition-colors text-xs tracking-widest uppercase font-body"
          aria-label={`Instagram ${name}`}
        >
          <Link2 size={16} strokeWidth={1.5} />
          Instagram
        </a>
      )}
    </motion.article>
  );
}

export function Couple() {
  const { groom, bride } = invitation.couple;

  return (
    <section id="couple" className="section bg-[var(--bg-primary)]">
      <div className="section-inner">
        <SectionHeader label="The Couple" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-20 lg:gap-28 max-w-5xl mx-auto">
          <PersonCard
            {...groom}
            align="left"
            delay={0}
          />
          <PersonCard
            {...bride}
            align="right"
            delay={0.15}
          />
        </div>
      </div>
    </section>
  );
}
