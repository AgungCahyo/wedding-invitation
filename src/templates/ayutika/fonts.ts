import { Cormorant_Garamond, DM_Sans } from "next/font/google";

/**
 * Ayutika-owned font configuration.
 *
 * Moved out of app/layout.tsx (Step 7B) so the app shell no longer owns
 * template-specific font choices. Variable names are consumed by
 * app/globals.css's --font-display / --font-body tokens — keep them
 * stable, or update globals.css alongside any rename.
 */

export const ayutikaDisplayFont = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

export const ayutikaBodyFont = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-sans",
  display: "swap",
});

/** Combined className to apply on the root html element. */
export const ayutikaFontVariables = `${ayutikaDisplayFont.variable} ${ayutikaBodyFont.variable}`;