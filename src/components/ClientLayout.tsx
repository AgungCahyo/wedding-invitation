"use client";

import { ThemeProvider } from "@/src/hooks/useTheme";
import { ThemeSwitcher } from "@/src/components/ThemeSwitcher";
import { ReactNode } from "react";

export function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      {children}
      <ThemeSwitcher />
    </ThemeProvider>
  );
}
