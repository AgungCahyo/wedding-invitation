"use client";

import { useEffect } from "react";

/** Marks the document as the Editorial Romantic design so fonts/layout tokens apply. Colors come from ThemeSwitcher (`data-theme`). */
export function EditorialShell({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-design", "editorial");
    return () => root.removeAttribute("data-design");
  }, []);

  return (
    <div data-design="editorial" className="min-h-dvh bg-[var(--bg-primary)] text-[var(--text-primary)]">
      {children}
    </div>
  );
}
