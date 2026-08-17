import type { Transition, Variants } from "motion/react";

export const easeOut: Transition = {
  duration: 0.8,
  ease: [0.25, 0.1, 0.25, 1],
};

export const easeOutSlow: Transition = {
  duration: 1.2,
  ease: [0.25, 0.1, 0.25, 1],
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1 },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

export const lineReveal: Variants = {
  hidden: { scaleX: 0 },
  visible: { scaleX: 1 },
};

export const viewportOnce = { once: true, margin: "-80px" as const };
