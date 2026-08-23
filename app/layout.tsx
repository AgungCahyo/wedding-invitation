import type { Metadata } from "next";
import { invitation } from "@/src/data/invitation";
import { activeTemplate } from "@/src/templates/active-template";
import { ClientLayout } from "@/src/components/ClientLayout";
import {
  defaultTheme,
  getThemeCss,
  getThemeInitScript,
  resolveTheme,
} from "@/src/data/theme";
import "./globals.css";

/**
 * ── Template-owned assets, loaded globally ──
 *
 * `ayutika.css`/`template02.css` and each template's font variables
 * belong to their respective templates (each template's own fonts.ts,
 * Step 7B / Step 10A), not to the app shell. Both are imported statically
 * and unconditionally here — `next/font` requires static, top-level
 * imports (no dynamic `import()`), so every template's fonts/CSS are
 * always present in the bundle. Only ONE set of variables is actually
 * applied per render: `app/globals.css`'s `[data-template="..."]` blocks
 * (Step 9B/10C) key off the `data-template` attribute set below from
 * `activeTemplate`, so the inactive template's --font-* variables are
 * declared but never selected into --font-display/--font-body.
 *
 * `app/globals.css` and `app/[guest]/page.tsx`'s greeting shell remain
 * free of template-specific classes/components (Step 6B), so this import
 * block plus the two `[data-template="..."]` mapping rules in
 * globals.css are the only template-coupled points in the app shell.
 *
 * When a third template is introduced, add its `styles`/`fonts` imports
 * here (same static pattern) and its own `[data-template="..."]` block
 * in globals.css — do not duplicate this pattern elsewhere.
 */
import "@/src/templates/ayutika/styles";
import { ayutikaFontVariables } from "@/src/templates/ayutika/fonts";
import "@/src/templates/template02/styles";
import { template02FontVariables } from "@/src/templates/template02/fonts";

const { meta, wedding, couple } = invitation;
const pageTitle = `${meta.title} | ${wedding.displayDate}`;

export const metadata: Metadata = {
  metadataBase: new URL(meta.url),
  title: pageTitle,
  description: meta.description,
  applicationName: "Wedding Invitation",
  keywords: [
    "undangan pernikahan",
    "wedding invitation",
    "digital invitation",
    `${couple.groom.name}`,
    `${couple.bride.name}`,
  ],
  creator: meta.title,
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: meta.url,
    siteName: meta.title,
    title: pageTitle,
    description: meta.description,
    images: [
      {
        url: meta.ogImage,
        width: 1200,
        height: 630,
        alt: meta.title,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: pageTitle,
    description: meta.description,
    images: [meta.ogImage],
  },
};

const initialTheme = resolveTheme(process.env.NEXT_PUBLIC_DEFAULT_THEME ?? defaultTheme);

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      data-theme={initialTheme}
      data-template={activeTemplate}
      suppressHydrationWarning
      className={`scroll-smooth ${ayutikaFontVariables} ${template02FontVariables}`}
    >
      <head>
        <style dangerouslySetInnerHTML={{ __html: getThemeCss() }} />
        {process.env.NODE_ENV === "development" && (
          <script
            dangerouslySetInnerHTML={{
              __html: getThemeInitScript(process.env.NEXT_PUBLIC_DEFAULT_THEME),
            }}
          />
        )}
      </head>
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}