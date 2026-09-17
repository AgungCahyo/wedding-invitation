import type { Metadata } from "next";
import Script from "next/script";
import { ClientLayout } from "@/src/components/ClientLayout";
import {
  defaultTheme,
  getThemeCss,
  getThemeInitScript,
  resolveTheme,
} from "@/src/data/theme";
import "./globals.css";

/**
 * Root layout for the application.
 *
 * This layout is shared across all pages and sets up:
 * - Font variables for both templates (safe to have globally)
 * - Default theme (from environment or fallback) applied via getThemeCss
 * - Global styles
 *
 * Template-specific attributes (data-template) and invitation-specific metadata
 * are set in the [slug] layout for invitation routes.
 */

export const metadata: Metadata = {
  title: "Undangan Digital",
  description:
    "Platform undangan digital modern dan responsif.",
  applicationName: "Undangan Digital",
  keywords: [
    "undangan pernikahan",
    "wedding invitation",
    "digital invitation",
  ],
  creator: "Undangan Digital",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialTheme = resolveTheme(process.env.NEXT_PUBLIC_DEFAULT_THEME ?? defaultTheme);

  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`scroll-smooth`}
    >
      <head>
        {/* Font variables for both templates (harmless if not used) */}
        <style dangerouslySetInnerHTML={{ __html: getThemeCss() }} />
        {process.env.NODE_ENV === "development" && (
          <Script strategy="beforeInteractive">
            {getThemeInitScript(process.env.NEXT_PUBLIC_DEFAULT_THEME ?? defaultTheme)}
          </Script>
        )}
      </head>
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}