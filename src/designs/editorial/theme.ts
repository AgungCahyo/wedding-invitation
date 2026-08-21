/**
 * Editorial Romantic design.
 * Big, characterful serif display (Fraunces) contrasted against a clean,
 * tightly-tracked sans for labels/body — the size/weight contrast IS the
 * character, not floral ornament. Colors still come from `data-theme`.
 */
export const EDITORIAL_FONTS = {
  display: "var(--font-fraunces), Georgia, serif",
  body: "var(--font-dm-sans), system-ui, sans-serif",
  label: "var(--font-outfit), system-ui, sans-serif",
} as const;
