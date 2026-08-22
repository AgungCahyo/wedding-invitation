import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import { invitation } from "@/src/data/invitation";
import { ClientLayout } from "@/src/components/ClientLayout";
import {
  defaultTheme,
  getThemeCss,
  getThemeInitScript,
  resolveTheme,
} from "@/src/data/theme";
import "./globals.css";
// Ayutika is currently the only template in use, so its CSS is loaded
// directly here. If a second template is introduced later, this import
// should become conditional on the active template rather than always-on.
import "@/src/templates/ayutika/ayutika.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-sans",
  display: "swap",
});

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
      suppressHydrationWarning
      className={`scroll-smooth ${cormorant.variable} ${dmSans.variable}`}
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