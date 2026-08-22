"use client";

import { useState } from "react";
import { Palette, X } from "lucide-react";
import { themeNames, themes } from "@/src/data/theme";
import { useTheme } from "@/src/hooks/useTheme";

export function ThemeSwitcher() {
  const { currentTheme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);

  if (process.env.NODE_ENV !== "development") return null;

  return (
    <div className="fixed top-4 right-4 z-[60] font-body">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-11 h-11 border border-[var(--border)] bg-[var(--bg-primary)]/95 text-[var(--text-primary)] flex items-center justify-center hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
        aria-label={open ? "Tutup pilihan tema" : "Buka pilihan tema"}
        aria-expanded={open}
      >
        {open ? <X size={16} strokeWidth={1.5} /> : <Palette size={16} strokeWidth={1.5} />}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-[min(18.5rem,calc(100vw-2rem))] border border-[var(--border)] bg-[var(--bg-primary)]/97 p-3 shadow-sm">
          <p className="text-[0.625rem] md:text-[0.6875rem] font-medium uppercase tracking-[0.32em] text-[var(--text-tertiary)] mb-3">
            Tema · dev
          </p>
          <div className="grid grid-cols-4 gap-2">
            {themeNames.map((name) => {
              const palette = themes[name];
              const selected = name === currentTheme;

              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => setTheme(name)}
                  className={`flex flex-col items-center gap-1.5 p-1.5 border transition-colors ${
                    selected
                      ? "border-[var(--accent)] bg-[var(--bg-secondary)]"
                      : "border-transparent hover:border-[var(--border)]"
                  }`}
                  aria-pressed={selected}
                  title={palette.label}
                >
                  <span
                    className="w-7 h-7 rounded-full border border-[var(--border)]"
                    style={{ backgroundColor: palette.accent }}
                  />
                  <span className="text-[9px] leading-tight text-center text-[var(--text-secondary)]">
                    {palette.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}