import type { Transition, Variants } from "motion/react";

/** Professional ease curve — smooth, no spring bounce (bounce is reserved for a future Celebration design). */
export const modernEasing: Transition["ease"] = [0.4, 0, 0.2, 1];

export const modernFade: Transition = {
  duration: 0.6,
  ease: modernEasing,
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: modernEasing } },
};

export const fadeUpModern: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: modernEasing } },
};

export const viewportOnce = { once: true, margin: "-80px" as const };
