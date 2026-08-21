"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { invitation } from "@/src/data/invitation";
import { getBlurDataURL } from "@/src/data/blur-placeholders";
import { SectionHeader } from "@/src/designs/editorial/ui/SectionHeader";
import { Ampersand } from "@/src/designs/editorial/ornaments/Ampersand";
import { editorialEasing, fadeUpEditorial, viewportOnce } from "@/src/designs/editorial/motion";

function PersonBlock({
  index,
  role,
  name,
  fullName,
  parents,
  parentLabel,
  photo,
  socialLinks,
  reverse,
  delay,
}: {
  index: string;
  role: string;
  name: string;
  fullName: string;
  parents: string[];
  parentLabel: string;
  photo: string;
  socialLinks?: { instagram?: string };
  reverse?: boolean;
  delay: number;
}) {
  return (
    <motion.article
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      variants={fadeUpEditorial}
      transition={{ delay, duration: 0.9, ease: editorialEasing }}
      className={`grid grid-cols-1 md:grid-cols-[1fr_1.3fr] gap-8 md:gap-12 items-center ${
        reverse ? "md:[&>*:first-child]:order-2" : ""
      }`}
    >
      <div className="relative w-full max-w-[280px] md:max-w-none aspect-[3/4] overflow-hidden">
        <Image
          src={photo}
          alt={name}
          fill
          className="object-cover object-top"
          sizes="(max-width: 768px) 280px, 40vw"
          placeholder={getBlurDataURL(photo) ? "blur" : "empty"}
          blurDataURL={getBlurDataURL(photo)}
        />
      </div>

      <div>
        <span
          className="text-[0.6875rem] font-medium uppercase tracking-[0.25em]"
          style={{ fontFamily: "var(--font-label)", color: "var(--accent)" }}
        >
          {index} — {role}
        </span>
        <h2 className="font-display text-[clamp(2.5rem,6vw,4rem)] leading-[0.95] tracking-[-0.02em] text-[var(--text-primary)] mt-3 mb-1">
          {name}
        </h2>
        <p className="text-[var(--text-tertiary)] text-sm font-body mb-6">{fullName}</p>

        <p
          className="mb-2 text-[0.625rem] font-medium uppercase tracking-[0.25em]"
          style={{ fontFamily: "var(--font-label)", color: "var(--text-tertiary)" }}
        >
          {parentLabel}
        </p>
        <div className="space-y-1 mb-6">
          {parents.map((parent) => (
            <p key={parent} className="text-[var(--text-secondary)] text-sm font-body leading-relaxed">
              {parent}
            </p>
          ))}
        </div>

        {socialLinks?.instagram && (
          <a
            href={socialLinks.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--text-tertiary)] hover:text-[var(--accent)] transition-colors text-[10px] tracking-[0.2em] uppercase font-body"
            aria-label={`Instagram ${name}`}
          >
            Instagram
          </a>
        )}
      </div>
    </motion.article>
  );
}

export function Couple() {
  const { groom, bride } = invitation.couple;

  return (
    <section id="couple" className="section bg-[var(--bg-primary)]">
      <div className="section-inner">
        <SectionHeader index="01" label="Mempelai" />

        <div className="max-w-4xl space-y-14 md:space-y-20">
          <PersonBlock
            index="I"
            role="Mempelai Wanita"
            {...bride}
            parentLabel="Putri dari"
            delay={0}
          />

          <div className="pl-2" aria-hidden="true">
            <Ampersand size="2.5rem" />
          </div>

          <PersonBlock
            index="II"
            role="Mempelai Pria"
            {...groom}
            parentLabel="Putra dari"
            reverse
            delay={0.1}
          />
        </div>
      </div>
    </section>
  );
}
