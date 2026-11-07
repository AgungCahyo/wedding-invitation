"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  startTransition,
  useState,
  type ReactNode,
} from "react";
import {
  THEME_STORAGE_KEY,
  defaultTheme,
  getRotationTheme,
  isThemeName,
  msUntilNextRotation,
  resolveTheme,
  themes,
  type ThemeName,
  type ThemePalette,
} from "../data/theme";

/** auto = ganti sendiri tiap beberapa menit; manual = tamu memilih sendiri. */
export type ThemeMode = "auto" | "manual";

interface ThemeContextType {
  currentTheme: ThemeName;
  mode: ThemeMode;
  /** Tamu memilih tema → rotasi otomatis berhenti dan pilihan diingat. */
  setTheme: (theme: ThemeName) => void;
  /** Kembali ke rotasi otomatis. */
  setAuto: () => void;
  palette: ThemePalette;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function applyTheme(theme: ThemeName) {
  document.documentElement.setAttribute("data-theme", theme);
}

function readStored(): ThemeName | null {
  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY);
    return isThemeName(value) ? value : null;
  } catch {
    return null;
  }
}

function writeStored(theme: ThemeName | null) {
  try {
    if (theme) localStorage.setItem(THEME_STORAGE_KEY, theme);
    else localStorage.removeItem(THEME_STORAGE_KEY);
  } catch {
    /* mode privat / storage penuh: tema tetap berlaku untuk sesi ini */
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<ThemeName>(defaultTheme);
  const [mode, setMode] = useState<ThemeMode>("auto");

  // Skrip di <head> sudah memasang tema yang benar sebelum paint; di sini
  // hanya menyamakan state React dengannya.
  useEffect(() => {
    const stored = readStored();
    const attr = resolveTheme(document.documentElement.getAttribute("data-theme"));
    startTransition(() => {
      setMode(stored ? "manual" : "auto");
      setCurrentTheme(attr);
    });
  }, []);

  // Mode otomatis: pindah tema tepat saat giliran berikutnya tiba, dan cek
  // ulang saat tab kembali aktif (timer ditahan browser saat tab di latar).
  useEffect(() => {
    if (mode !== "auto") return;
    let timer: number | undefined;

    const sync = () => {
      const next = getRotationTheme();
      applyTheme(next);
      setCurrentTheme(next);
    };
    const schedule = () => {
      window.clearTimeout(timer);
      const wait = msUntilNextRotation();
      if (wait === null) return;
      timer = window.setTimeout(() => {
        sync();
        schedule();
      }, wait + 50);
    };
    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      sync();
      schedule();
    };

    sync();
    schedule();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [mode]);

  const setTheme = useCallback((theme: ThemeName) => {
    const resolved = resolveTheme(theme);
    applyTheme(resolved);
    writeStored(resolved);
    setCurrentTheme(resolved);
    setMode("manual");
  }, []);

  const setAuto = useCallback(() => {
    writeStored(null);
    setMode("auto");
  }, []);

  const value = useMemo<ThemeContextType>(
    () => ({
      currentTheme,
      mode,
      setTheme,
      setAuto,
      palette: themes[currentTheme],
    }),
    [currentTheme, mode, setTheme, setAuto]
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
