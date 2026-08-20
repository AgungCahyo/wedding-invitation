export type ThemeName =
  | "gold"
  | "red"
  | "green"
  | "pink"
  | "navy"
  | "sage"
  | "burgundy"
  | "lavender"
  | "champagne"
  | "rose-gold"
  | "terracotta"
  | "dusty-blue"
  | "mocha"
  | "forest"
  | "peach"
  | "slate";

export const THEME_STORAGE_KEY = "undangan-theme";

export interface ThemePalette {
  name: ThemeName;
  label: string;
  bgPrimary: string;
  bgSecondary: string;
  bgElevated: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  muted: string;
  accent: string;
  accentMuted: string;
  border: string;
  borderSubtle: string;
  /**
   * Dedicated neutral-dark color used ONLY to darken photos (Opening cover,
   * Gallery lightbox backdrop). Deliberately near-black/low-saturation
   * regardless of the theme's accent hue — using textPrimary for this
   * instead tints the photo with that hue, which looks like a colored
   * filter rather than a clean darken. Keep these close to black; small
   * hue nudges are fine, heavy saturation is not.
   */
  overlay: string;
}

export const themes: Record<ThemeName, ThemePalette> = {
  gold: {
    name: "gold",
    label: "Gold",
    bgPrimary: "#faf8f3",
    bgSecondary: "#f3f0eb",
    bgElevated: "#ffffff",
    textPrimary: "#2b2520",
    textSecondary: "#5a524a",
    textTertiary: "#8b7f76",
    muted: "#ebe6df",
    accent: "#b89a72",
    accentMuted: "#d4c4b0",
    border: "#e3ddd5",
    borderSubtle: "#ece8e2",
    overlay: "#1a1512",
  },

  red: {
    name: "red",
    label: "Merah",
    bgPrimary: "#fef9f7",
    bgSecondary: "#f8f2f0",
    bgElevated: "#ffffff",
    textPrimary: "#3d1a1a",
    textSecondary: "#6b3c3c",
    textTertiary: "#9d6b6b",
    muted: "#f0e4e0",
    accent: "#c85a5a",
    accentMuted: "#d99b9b",
    border: "#ead4d4",
    borderSubtle: "#f0e4e4",
    overlay: "#180d0d",
  },

  green: {
    name: "green",
    label: "Hijau Pastel",
    bgPrimary: "#f7faf8",
    bgSecondary: "#f0f5f2",
    bgElevated: "#ffffff",
    textPrimary: "#1f3d2e",
    textSecondary: "#4a6a5a",
    textTertiary: "#7a9a8a",
    muted: "#e4eee8",
    accent: "#6fad8f",
    accentMuted: "#9acaae",
    border: "#d4e3dc",
    borderSubtle: "#e4f0eb",
    overlay: "#0d1712",
  },

  pink: {
    name: "pink",
    label: "Pink Pastel",
    bgPrimary: "#faf7f9",
    bgSecondary: "#f3eff1",
    bgElevated: "#ffffff",
    textPrimary: "#3d1f2e",
    textSecondary: "#6b4a5a",
    textTertiary: "#9d7a8a",
    muted: "#eee4ea",
    accent: "#c87ab8",
    accentMuted: "#d9a8c8",
    border: "#e8d4df",
    borderSubtle: "#f0e4ec",
    overlay: "#180d15",
  },

  navy: {
    name: "navy",
    label: "Navy",
    bgPrimary: "#f7f8fa",
    bgSecondary: "#eef1f5",
    bgElevated: "#ffffff",
    textPrimary: "#1a2438",
    textSecondary: "#3f4d68",
    textTertiary: "#77839c",
    muted: "#e4e9f0",
    accent: "#3d5a8c",
    accentMuted: "#8ca3c4",
    border: "#d8dfe9",
    borderSubtle: "#e8ecf2",
    overlay: "#0c111d",
  },

  sage: {
    name: "sage",
    label: "Sage",
    bgPrimary: "#f8f9f6",
    bgSecondary: "#f0f2ec",
    bgElevated: "#ffffff",
    textPrimary: "#2e3327",
    textSecondary: "#565d4c",
    textTertiary: "#87907c",
    muted: "#e6e9df",
    accent: "#8a9678",
    accentMuted: "#b5bfa8",
    border: "#dee2d5",
    borderSubtle: "#e9ece2",
    overlay: "#14170f",
  },

  burgundy: {
    name: "burgundy",
    label: "Burgundy",
    bgPrimary: "#faf6f6",
    bgSecondary: "#f3ecec",
    bgElevated: "#ffffff",
    textPrimary: "#3a1420",
    textSecondary: "#63313e",
    textTertiary: "#a17d85",
    muted: "#efe4e6",
    accent: "#7d2c3f",
    accentMuted: "#b47a8a",
    border: "#e6d3d8",
    borderSubtle: "#efe1e4",
    overlay: "#170a0d",
  },

  lavender: {
    name: "lavender",
    label: "Lavender",
    bgPrimary: "#f9f8fb",
    bgSecondary: "#f2f0f6",
    bgElevated: "#ffffff",
    textPrimary: "#2a2438",
    textSecondary: "#554d68",
    textTertiary: "#8a80a0",
    muted: "#e8e4ef",
    accent: "#8a72b0",
    accentMuted: "#c0aed9",
    border: "#e0dae9",
    borderSubtle: "#ece8f2",
    overlay: "#130f1c",
  },

  champagne: {
    name: "champagne",
    label: "Champagne",
    bgPrimary: "#fbf8f2",
    bgSecondary: "#f4efe6",
    bgElevated: "#fffcf7",
    textPrimary: "#2f291f",
    textSecondary: "#6a5f4e",
    textTertiary: "#9a8d78",
    muted: "#ece5d8",
    accent: "#c9b896",
    accentMuted: "#e2d5b8",
    border: "#e6dccb",
    borderSubtle: "#f0e9dc",
    overlay: "#18140e",
  },

  "rose-gold": {
    name: "rose-gold",
    label: "Rose Gold",
    bgPrimary: "#fbf6f4",
    bgSecondary: "#f4ebe8",
    bgElevated: "#fffbfa",
    textPrimary: "#3a2724",
    textSecondary: "#6e524c",
    textTertiary: "#a07f77",
    muted: "#f0e4df",
    accent: "#c48972",
    accentMuted: "#e0b5a6",
    border: "#ead8d2",
    borderSubtle: "#f3e8e4",
    overlay: "#180f0d",
  },

  terracotta: {
    name: "terracotta",
    label: "Terracotta",
    bgPrimary: "#faf6f2",
    bgSecondary: "#f3ebe4",
    bgElevated: "#fffbf8",
    textPrimary: "#3a2418",
    textSecondary: "#6d4a38",
    textTertiary: "#a07862",
    muted: "#eee3d9",
    accent: "#c46a45",
    accentMuted: "#dca78c",
    border: "#e6d4c6",
    borderSubtle: "#f0e6dc",
    overlay: "#170e09",
  },

  "dusty-blue": {
    name: "dusty-blue",
    label: "Dusty Blue",
    bgPrimary: "#f6f8f9",
    bgSecondary: "#eef2f4",
    bgElevated: "#ffffff",
    textPrimary: "#243038",
    textSecondary: "#4d5e68",
    textTertiary: "#7e909a",
    muted: "#e4eaed",
    accent: "#7a9aa8",
    accentMuted: "#b3c8d1",
    border: "#d5e0e5",
    borderSubtle: "#e6eef1",
    overlay: "#0e1418",
  },

  mocha: {
    name: "mocha",
    label: "Mocha",
    bgPrimary: "#f8f4ef",
    bgSecondary: "#efe8df",
    bgElevated: "#fdfaf6",
    textPrimary: "#2c2218",
    textSecondary: "#5c4c3a",
    textTertiary: "#8c7862",
    muted: "#e8ddd0",
    accent: "#8b6544",
    accentMuted: "#c4a888",
    border: "#ddd0c0",
    borderSubtle: "#ebe2d6",
    overlay: "#16110c",
  },

  forest: {
    name: "forest",
    label: "Forest",
    bgPrimary: "#f5f7f4",
    bgSecondary: "#eaefe8",
    bgElevated: "#fcfdfb",
    textPrimary: "#1c2e22",
    textSecondary: "#3f5746",
    textTertiary: "#6e8574",
    muted: "#dde6de",
    accent: "#3d6b4f",
    accentMuted: "#8fb39a",
    border: "#cfdccf",
    borderSubtle: "#e2ebe3",
    overlay: "#0b140e",
  },

  peach: {
    name: "peach",
    label: "Peach",
    bgPrimary: "#fdf7f3",
    bgSecondary: "#f7eee8",
    bgElevated: "#fffbf8",
    textPrimary: "#3a261c",
    textSecondary: "#6e5246",
    textTertiary: "#a48474",
    muted: "#f2e6de",
    accent: "#e09a78",
    accentMuted: "#f0c4ae",
    border: "#ebd6ca",
    borderSubtle: "#f4e8e0",
    overlay: "#180f0b",
  },

  slate: {
    name: "slate",
    label: "Slate",
    bgPrimary: "#f7f7f6",
    bgSecondary: "#eeeeec",
    bgElevated: "#ffffff",
    textPrimary: "#252524",
    textSecondary: "#555552",
    textTertiary: "#848480",
    muted: "#e6e6e3",
    accent: "#6e6e68",
    accentMuted: "#b0b0a8",
    border: "#dcdcd7",
    borderSubtle: "#eaeae6",
    overlay: "#121211",
  },
};

export const themeNames = Object.keys(themes) as ThemeName[];

export const defaultTheme: ThemeName = "gold";

export function isThemeName(value: unknown): value is ThemeName {
  return typeof value === "string" && value in themes;
}

export function resolveTheme(value: unknown): ThemeName {
  return isThemeName(value) ? value : defaultTheme;
}

/** CSS custom properties for every palette, keyed by `[data-theme]`. */
export function getThemeCss(): string {
  return Object.values(themes)
    .map((palette) => {
      return `[data-theme="${palette.name}"] {
  --background: ${palette.bgPrimary};
  --foreground: ${palette.textPrimary};
  --bg-primary: ${palette.bgPrimary};
  --bg-secondary: ${palette.bgSecondary};
  --bg-elevated: ${palette.bgElevated};
  --text-primary: ${palette.textPrimary};
  --text-secondary: ${palette.textSecondary};
  --text-tertiary: ${palette.textTertiary};
  --muted: ${palette.muted};
  --accent: ${palette.accent};
  --accent-muted: ${palette.accentMuted};
  --border: ${palette.border};
  --border-subtle: ${palette.borderSubtle};
  --overlay: ${palette.overlay};
}`;
    })
    .join("\n\n");
}

/**
 * Runs before paint in development so a localStorage override does not
 * flash the env/default theme first.
 */
export function getThemeInitScript(envTheme: string | undefined): string {
  const fallback = resolveTheme(envTheme);
  return `(function(){try{var k=${JSON.stringify(THEME_STORAGE_KEY)};var t=localStorage.getItem(k);var allowed=${JSON.stringify(themeNames)};if(t&&allowed.indexOf(t)!==-1){document.documentElement.setAttribute("data-theme",t);}else{document.documentElement.setAttribute("data-theme",${JSON.stringify(fallback)});}}catch(e){}})();`;
}

export const colors = themes[defaultTheme];
