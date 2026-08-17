import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agung & Tika Wedding | 15 Juni 2024",
  description:
    "Kami dengan bahagia mengundang Anda untuk merayakan hari istimewa kami. Pernikahan Agung Cahyo Prasetyo dan Ayu Cahya Tika.",
  generator: "Next.js",
  applicationName: "Wedding Invitation",
  referrer: "origin-when-cross-origin",
  keywords: [
    "undangan pernikahan",
    "wedding invitation",
    "digital invitation",
    "pernikahan",
  ],
  creator: "Agung & Tika",
  publisher: "Agung & Tika",
  formatDetection: {
    email: true,
    telephone: true,
    address: true,
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://undangan.example.com",
    siteName: "Agung & Tika Wedding",
    title: "Agung & Tika Wedding | 15 Juni 2024",
    description:
      "Kami dengan bahagia mengundang Anda untuk merayakan hari istimewa kami.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Agung & Tika Wedding",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Agung & Tika Wedding | 15 Juni 2024",
    description:
      "Kami dengan bahagia mengundang Anda untuk merayakan hari istimewa kami.",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="scroll-smooth">
      <head>
        <meta name="theme-color" content="#faf8f3" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="bg-[#faf8f3] text-[#2b2520] font-body">
        {children}
      </body>
    </html>
  );
}
