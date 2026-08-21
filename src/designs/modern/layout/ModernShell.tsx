"use client";

import { useEffect } from "react";

/** Marks the document as the Modern design so fonts/layout tokens apply. Colors come from ThemeSwitcher (`data-theme`). */
export function ModernShell({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-design", "modern");
    return () => root.removeAttribute("data-design");
  }, []);

  return (
    <div data-design="modern" className="min-h-dvh bg-[var(--bg-primary)] text-[var(--text-primary)]">
      {children}
    </div>
  );
}
