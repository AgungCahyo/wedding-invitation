"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { Link2 } from "lucide-react";
import { invitation } from "@/src/data/invitation";
import { SectionHeader } from "@/src/components/ui/SectionHeader";
import { easeOut, fadeUp, viewportOnce } from "@/src/lib/motion";

function PersonBlock({
  role,
  name,
  fullName,
  parents,
  photo,
  socialLinks,
  align,
  delay,
  offsetClass,
}: {
  role: string;
  name: string;
  fullName: string;
  parents: string[];
  photo: string;
  socialLinks?: { instagram?: string };
  align: "left" | "right";
  delay: number;
  offsetClass: string;
}) {
  const isLeft = align === "left";

  return (
    <motion.article
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      variants={fadeUp}
      transition={{ ...easeOut, delay }}
      className={`flex flex-col ${offsetClass} ${
        isLeft
          ? "items-center md:items-end md:text-right"
          : "items-center md:items-start md:text-left"
      } text-center`}
    >
      <div
        className={`relative w-full max-w-[280px] md:max-w-[320px] aspect-[3/4] mb-8 md:mb-10 overflow-hidden ${
          isLeft ? "md:mr-0" : "md:ml-0"
        }`}
      >
        <Image
          src={photo}
          alt={name}
          fill
          className="object-cover object-top"
          sizes="(max-width: 768px) 280px, 320px"
        />
      </div>

      <p className="eyebrow mb-4">{role}</p>

      <h2 className="display-heading text-[clamp(1.75rem,4vw,2.5rem)] mb-1">
        {name}
      </h2>
      <p className="text-[var(--text-tertiary)] text-sm font-body mb-8">
        {fullName}
      </p>

      <div className="space-y-1.5 mb-8">
        {parents.map((parent) => (
          <p
            key={parent}
            className="text-[var(--text-secondary)] text-sm font-body leading-relaxed"
          >
            {parent}
          </p>
        ))}
      </div>

      {socialLinks?.instagram && (
        <a
          href={socialLinks.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-[var(--text-tertiary)] hover:text-[var(--accent)] transition-colors text-[10px] tracking-[0.2em] uppercase font-body"
          aria-label={`Instagram ${name}`}
        >
          <Link2 size={14} strokeWidth={1.5} />
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

        <div className="relative max-w-5xl mx-auto">
          <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex-col items-center z-10 pointer-events-none">
            <span className="font-display text-5xl lg:text-6xl text-[var(--accent-muted)] italic leading-none">
              &amp;
            </span>
            <span className="w-px h-16 bg-[var(--border)] mt-6" aria-hidden="true" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-12 lg:gap-20">
            <PersonBlock
              role="Mempelai Pria"
              {...groom}
              align="left"
              delay={0}
              offsetClass="md:-mt-6 lg:-mt-10"
            />
            <PersonBlock
              role="Mempelai Wanita"
              {...bride}
              align="right"
              delay={0.12}
              offsetClass="md:mt-10 lg:mt-16"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
