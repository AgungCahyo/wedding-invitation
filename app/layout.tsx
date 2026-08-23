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
 * ── Template-owned assets, loaded globally (temporary) ──
 *
 * `ayutika.css` and the font variables imported below belong to the
 * Ayutika template, not to the app shell (fonts now defined and owned by
 * src/templates/ayutika/fonts.ts — Step 7B). They are imported
 * unconditionally here only because no active-template resolver exists
 * yet — there is currently exactly one template, so there is nothing to
 * switch between.
 *
 * This is a known, tracked dependency (see Step 6 architecture audit), not
 * an assumption that every future template uses Ayutika's fonts or CSS.
 * `app/globals.css` and `app/[guest]/page.tsx`'s greeting shell have
 * already been kept free of Ayutika-specific classes/components (Step 6B)
 * so that only this import block remains template-coupled.
 *
 * When a second template is introduced, this block is where font + CSS
 * loading needs to become conditional on the active template — do not
 * duplicate this pattern elsewhere in the app shell in the meantime.
 */
import "@/src/templates/ayutika/styles";
import { ayutikaFontVariables } from "@/src/templates/ayutika/fonts";

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
      className={`scroll-smooth ${ayutikaFontVariables}`}
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