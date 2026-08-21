import type { Transition, Variants } from "motion/react";

/**
 * "Editorial reveal" easing — slower, expo-style ease-out. Where modern used
 * a snappy Material curve, this floats in like a magazine spread turning.
 */
export const editorialEasing: Transition["ease"] = [0.16, 1, 0.3, 1];

export const editorialFade: Transition = {
  duration: 0.9,
  ease: editorialEasing,
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.15,
    },
  },
};

/** Large display type rises further and softens in from a slight blur — reads like a headline landing on the page. */
export const fadeUpEditorial: Variants = {
  hidden: { opacity: 0, y: 28, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.9, ease: editorialEasing },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: editorialEasing } },
};

export const viewportOnce = { once: true, margin: "-80px" as const };
