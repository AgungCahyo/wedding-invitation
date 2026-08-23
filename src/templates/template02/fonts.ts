import { Space_Grotesk, Work_Sans } from "next/font/google";

/**
 * Template 02-owned font configuration (Step 10A).
 *
 * Mirrors the shape of src/templates/ayutika/fonts.ts but is fully
 * independent: different fonts, different CSS variable names. Variable
 * names are namespaced (--font-template02-*) so they can never collide
 * with Ayutika's --font-cormorant / --font-dm-sans, even when both
 * modules are statically imported side by side.
 *
 * NOTE (Step 10A scope): app/layout.tsx does not import this module yet.
 * These variables are not applied to the DOM until a later step wires
 * conditional font/CSS loading through the app shell (see Step 9D).
 */

export const template02DisplayFont = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-template02-display",
  display: "swap",
});

export const template02BodyFont = Work_Sans({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-template02-body",
  display: "swap",
});

/** Combined className, mirroring ayutikaFontVariables's shape. */
export const template02FontVariables = `${template02DisplayFont.variable} ${template02BodyFont.variable}`;