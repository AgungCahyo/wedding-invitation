"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { invitation } from "@/src/data/invitation";
import { getBlurDataURL } from "@/src/data/blur-placeholders";
import { ModernSection } from "@/src/designs/modern/layout/ModernSection";
import { SectionLabel } from "@/src/designs/modern/layout/SectionLabel";
import { fadeUpModern, viewportOnce } from "@/src/designs/modern/motion";

function PersonBlock({
  index,
  role,
  name,
  fullName,
  parents,
  parentLabel,
  photo,
  socialLinks,
  imageFirst,
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
  imageFirst: boolean;
  delay: number;
}) {
  const image = (
    <div className="relative w-full aspect-[4/5] bg-[var(--muted)] shrink-0 md:w-[42%]">
      <Image
        src={photo}
        alt={name}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 42vw"
        placeholder={getBlurDataURL(photo) ? "blur" : "empty"}
        blurDataURL={getBlurDataURL(photo)}
      />
    </div>
  );

  const text = (
    <div className="flex flex-col justify-center py-6 md:py-4 md:px-10">
      <p className="text-[10px] font-body tabular-nums tracking-[0.18em] text-[var(--accent)] mb-2">
        {index}
      </p>
      <p className="text-[11px] font-body font-medium tracking-[0.22em] uppercase text-[var(--text-tertiary)] mb-3">
        {role}
      </p>
      <h3 className="font-body font-medium text-3xl md:text-4xl mb-1 tracking-tight">
        {name.split(" ")[0]}
      </h3>
      <p className="font-body text-sm text-[var(--text-secondary)] mb-5">{fullName}</p>
      <div className="border-l-2 border-[var(--accent)] pl-4">
        <p className="font-body text-xs tracking-[0.08em] uppercase text-[var(--text-tertiary)] mb-1">
          {parentLabel}
        </p>
        {parents.map((parent) => (
          <p key={parent} className="font-body text-sm text-[var(--text-secondary)]">
            {parent}
          </p>
        ))}
      </div>
      {socialLinks?.instagram && (
        <a
          href={socialLinks.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-5 text-[11px] font-body tracking-[0.16em] uppercase underline underline-offset-4 w-fit"
        >
          Instagram
        </a>
      )}
    </div>
  );

  return (
    <motion.article
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      variants={fadeUpModern}
      transition={{ delay }}
      className="flex flex-col md:flex-row items-stretch"
    >
      {imageFirst ? (
        <>
          {image}
          {text}
        </>
      ) : (
        <>
          <div className="hidden md:block md:w-[58%]">{text}</div>
          {image}
          <div className="md:hidden">{text}</div>
        </>
      )}
    </motion.article>
  );
}

export function Couple() {
  const { groom, bride } = invitation.couple;

  return (
    <ModernSection id="couple">
      <SectionLabel index="02">Mempelai</SectionLabel>

      <div className="space-y-12 md:space-y-16">
        <PersonBlock
          index="01"
          role="Mempelai Wanita"
          {...bride}
          parentLabel="Putri dari"
          imageFirst
          delay={0}
        />
        <div className="h-px bg-[var(--border)]" />
        <PersonBlock
          index="02"
          role="Mempelai Pria"
          {...groom}
          parentLabel="Putra dari"
          imageFirst={false}
          delay={0.08}
        />
      </div>
    </ModernSection>
  );
}
