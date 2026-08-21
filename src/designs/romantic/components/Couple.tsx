"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { invitation } from "@/src/data/invitation";
import { getBlurDataURL } from "@/src/data/blur-placeholders";
import { SectionHeader } from "@/src/designs/romantic/ui/SectionHeader";
import { Ornament } from "@/src/designs/romantic/ui/Ornament";
import { CornerFrame } from "@/src/designs/romantic/ui/CornerFrame";
import { easeOut, fadeUp, viewportOnce } from "@/src/lib/motion";

function PersonBlock({
  index,
  role,
  name,
  fullName,
  parents,
  parentLabel,
  photo,
  socialLinks,
  align,
  delay,
  offsetClass,
}: {
  index: string;
  role: string;
  name: string;
  fullName: string;
  parents: string[];
  parentLabel: string;
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
      className={`relative flex flex-col ${offsetClass} ${
        isLeft
          ? "items-center md:items-end md:text-right"
          : "items-center md:items-start md:text-left"
      } text-center`}
    >
      {/* Framed portrait — matted border, like a gallery print */}
      <div
        className={`relative w-full max-w-[260px] md:max-w-[300px] aspect-[3/4] mb-10 md:mb-12 p-2.5 ${
          isLeft ? "md:mr-0" : "md:ml-0"
        }`}
      >
        <span
          className="absolute inset-0 border border-[var(--accent-muted)]"
          aria-hidden="true"
        />
        <CornerFrame
          className="text-[var(--accent-muted)]"
          insetClassName="inset-0"
          markClassName="w-4 h-4 md:w-5 md:h-5"
        />
        <div className="relative w-full h-full overflow-hidden">
          <Image
            src={photo}
            alt={name}
            fill
            className="object-cover object-top grayscale-[15%] contrast-[1.03]"
            sizes="(max-width: 768px) 260px, 300px"
            placeholder={getBlurDataURL(photo) ? "blur" : "empty"}
            blurDataURL={getBlurDataURL(photo)}
          />
        </div>
      </div>

      <p className="eyebrow mb-5">{role}</p>

      {/* Name, with a soft oversized initial watermark behind it */}
      <div className="relative">
        <span
          className={`pointer-events-none select-none absolute -z-10 top-1/2 -translate-y-1/2 font-maellen text-[6.5rem] md:text-[8.5rem] leading-none text-[var(--accent-muted)] opacity-[0.18] ${
            isLeft ? "-right-2 md:-right-6" : "-left-2 md:-left-6"
          }`}
          aria-hidden="true"
        >
          {name.charAt(0)}
        </span>
        <h2 className="font-maellen text-[clamp(2.5rem,6vw,4rem)] leading-none tracking-normal mb-1 text-[var(--text-primary)]">
          {name}
        </h2>
      </div>
      <p className="text-[var(--text-tertiary)] text-sm font-body mb-8">
        {fullName}
      </p>

      <div className="space-y-1.5 mb-8">
        <p className="eyebrow mb-3">{parentLabel}</p>
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
          className="text-[var(--text-tertiary)] hover:text-[var(--accent)] transition-colors text-[10px] tracking-[0.2em] uppercase font-body"
          aria-label={`Instagram ${name}`}
        >
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
        <SectionHeader label="Mempelai" />

        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] md:items-center gap-16 md:gap-6 lg:gap-10">
            <PersonBlock
              index="I"
              role="Mempelai Wanita"
              {...bride}
              parentLabel="Putri dari"
              align="left"
              delay={0}
              offsetClass="md:-mt-6 lg:-mt-10"
            />

            <div
              className="hidden md:flex flex-col items-center px-2"
              aria-hidden="true"
            >
              <span className="w-px h-16 bg-[var(--border)] mb-6" />
              <Ornament className="mb-2 w-3 h-3" />
              <span className="font-calligraphy text-5xl lg:text-6xl text-[var(--accent)] leading-none">
                &amp;
              </span>
              <Ornament className="mt-2 w-3 h-3" />
              <span className="w-px h-16 bg-[var(--border)] mt-6" />
            </div>

            <PersonBlock
              index="II"
              role="Mempelai Pria"
              {...groom}
              parentLabel="Putra dari"
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