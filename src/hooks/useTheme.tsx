"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  THEME_STORAGE_KEY,
  resolveTheme,
  themes,
  type ThemeName,
  type ThemePalette,
} from "@/src/data/theme";

interface ThemeContextType {
  currentTheme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  palette: ThemePalette;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const envTheme = process.env.NEXT_PUBLIC_DEFAULT_THEME;
const initialTheme = resolveTheme(envTheme);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [currentTheme, setCurrentThemeState] = useState<ThemeName>(initialTheme);

  // Catch up to the blocking script's localStorage override (dev only).
  // CSS is already correct at this point; this only syncs React state.
  useEffect(() => {
    const attr = document.documentElement.getAttribute("data-theme");
    const resolved = resolveTheme(attr ?? envTheme);
    setCurrentThemeState(resolved);
  }, []);

  const setTheme = useCallback((theme: ThemeName) => {
    const resolved = resolveTheme(theme);
    setCurrentThemeState(resolved);
    document.documentElement.setAttribute("data-theme", resolved);

    if (process.env.NODE_ENV === "development") {
      localStorage.setItem(THEME_STORAGE_KEY, resolved);
    }
  }, []);

  const value = useMemo<ThemeContextType>(
    () => ({
      currentTheme,
      setTheme,
      palette: themes[currentTheme],
    }),
    [currentTheme, setTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
