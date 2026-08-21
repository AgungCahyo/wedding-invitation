/**
 * Modern design uses the shared invitation palettes (`data-theme` + ThemeSwitcher).
 * This file only keeps layout-oriented tokens — fonts are applied via
 * `html[data-design="modern"]` in globals.css.
 */
export const MODERN_FONTS = {
  display: "var(--font-outfit), system-ui, sans-serif",
  body: "var(--font-outfit), system-ui, sans-serif",
} as const;
