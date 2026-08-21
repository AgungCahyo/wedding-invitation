"use client";

import { Suspense, type ReactNode } from "react";
import { ThemeProvider } from "@/src/hooks/useTheme";
import { ThemeSwitcher } from "@/src/components/ThemeSwitcher";

export function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      {children}
      <Suspense fallback={null}>
        <ThemeSwitcher />
      </Suspense>
    </ThemeProvider>
  );
}
