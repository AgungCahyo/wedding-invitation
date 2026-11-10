"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Palette, Shuffle, X } from "lucide-react";
import {
  THEME_ROTATION_MINUTES,
  themeNames,
  themes,
} from "@/src/data/theme";
import { useTheme } from "@/src/hooks/useTheme";
import { BAR_BUTTON } from "@/src/lib/floating-bar";

/** Isi panel: tombol "Otomatis" + kisi warna. Dipakai di bar tamu dan di admin. */
function ThemePanel() {
  const { currentTheme, mode, setTheme, setAuto, palette } = useTheme();
  const rotates = THEME_ROTATION_MINUTES > 0;

  return (
    <div>
      <div className="flex items-baseline justify-between mb-3">
        <p className="eyebrow">Tema</p>
        <p className="font-body text-[11px] text-[var(--text-tertiary)]">{palette.label}</p>
      </div>

      {rotates && (
        <button
          type="button"
          onClick={setAuto}
          aria-pressed={mode === "auto"}
          className={`flex items-center justify-between gap-3 border px-3 py-2.5 mb-4 text-left transition-colors ${
            mode === "auto"
              ? "border-[var(--accent)] text-[var(--text-primary)]"
              : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)]"
          }`}
        >
          <span className="flex items-center gap-2 font-body text-xs">
            <Shuffle size={14} strokeWidth={1.5} />
          </span>
        </button>
      )}

      <div className="grid grid-cols-7 gap-x-2 gap-y-3 justify-items-center">
        {themeNames.map((name) => {
          const selected = name === currentTheme;
          return (
            <button
              key={name}
              type="button"
              onClick={() => setTheme(name)}
              title={themes[name].label}
              aria-label={themes[name].label}
              aria-pressed={selected && mode === "manual"}
              className={`w-6 h-6 rounded-full border transition-transform hover:scale-110 ${
                selected
                  ? "ring-1 ring-offset-2 ring-[var(--text-primary)] ring-offset-[var(--bg-primary)] border-transparent"
                  : "border-[var(--border)]"
              }`}
              style={{ backgroundColor: themes[name].accent }}
            />
          );
        })}
      </div>
    </div>
  );
}

/** Tombol palet untuk FloatingBar tamu; panelnya membuka ke atas. */
export function ThemeMenuButton() {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={BAR_BUTTON}
        aria-label={open ? "Tutup pilihan tema" : "Pilih tema warna"}
        aria-expanded={open}
      >
        <Palette size={18} strokeWidth={1.5} />
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Pilihan tema"
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-[min(19rem,calc(100vw-2rem))] border border-[var(--border)] bg-[var(--bg-primary)] p-4 shadow-[0_12px_30px_-14px_rgba(0,0,0,0.35)]"
        >
          <ThemePanel />
        </div>
      )}
    </div>
  );
}

/**
 * Pojok kanan atas, hanya di /admin (untuk mencoba tema). Tamu memakai
 * ThemeMenuButton di FloatingBar.
 */
export function ThemeSwitcher() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  if (!pathname?.startsWith("/admin")) return null;

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
        <div className="absolute right-0 mt-2 w-[min(19rem,calc(100vw-2rem))] border border-[var(--border)] bg-[var(--bg-primary)] p-4 shadow-sm">
          <ThemePanel />
        </div>
      )}
    </div>
  );
}
