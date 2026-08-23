import type { ComponentType } from "react";
import { Intro } from "./Intro";
import { Details } from "./Details";
import { Opening } from "./Opening";

/**
 * Local section contract for Template 02 (Step 10A).
 *
 * Deliberately not shared with Ayutika's SectionKey (src/templates/ayutika/index.ts)
 * and not hoisted into a global type — each template owns its own key
 * union, matching the "genuinely structurally independent" requirement.
 * As with Ayutika, Opening is not a SectionKey: it is rendered directly
 * by the page and drives the showOpening lifecycle.
 */
export type SectionKey = "intro" | "details";

type SectionProps = {
  guestName?: string;
};

/** Render order for the Template 02 proof-of-concept flow. */
export const template02SectionOrder: readonly SectionKey[] = ["intro", "details"];

/** Maps each Template 02 SectionKey to its component. */
export const template02Sections: Record<SectionKey, ComponentType<SectionProps>> = {
  intro: Intro,
  details: Details,
};

export { Opening };