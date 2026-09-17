import type { ComponentType } from "react";
import { resolveTemplate, type TemplateKey } from "@/src/templates/template-registry";
import { Opening as AyutikaOpening } from "@/src/templates/ayutika/Opening";
import { ayutikaSectionOrder, ayutikaSections } from "@/src/templates/ayutika";
import { Opening as Template02Opening } from "@/src/templates/template02/Opening";
import { template02SectionOrder, template02Sections }  from "@/src/templates/template02";

/**
 * Generic shape every template's implementation is widened to (Step 10A).
 *
 * Ayutika and Template 02 each own a distinct, narrower SectionKey union
 * internally (see their respective index.ts files) — that's intentional
 * and unchanged. But `templateImplementations[activeTemplate]` must
 * resolve to ONE concrete type, not a union of both templates' shapes,
 * or `sectionOrder.map(key => sections[key])` in app/page.tsx and
 * app/[guest]/page.tsx can't type-check (a key from one template's
 * SectionKey union isn't guaranteed to exist on the other template's
 * `sections` record). Widening `sectionOrder`/`sections` to `string` here
 * is a safe, one-directional narrowing-to-string on assignment — each
 * template's own module keeps its precise key type. No `any`, `unknown`,
 * or casts are introduced.
 */
interface TemplateImplementation {
  Opening: ComponentType<{ onEnter: () => void; guestName?: string; invitation: any }>;
  sectionOrder: readonly string[];
  sections: Record<
    string,
    ComponentType<{ guestName?: string | undefined; invitation: any; invitationId?: string | undefined; guestSlug?: string }>
  >;
}

const templateImplementations: Record<TemplateKey, TemplateImplementation> = {
  ayutika: {
    Opening: AyutikaOpening,
    sectionOrder: ayutikaSectionOrder,
    sections: ayutikaSections,
  },
  template02: {
    Opening: Template02Opening,
    sectionOrder: template02SectionOrder,
    sections: template02Sections,
  },
};

/**
 * Resolves a TemplateImplementation from an arbitrary `template` value
 * (e.g. `invitationData.template` from a per-invitation lookup), instead
 * of the static site-level invitation. Used by the multi-invitation route
 * so template selection is per-lookup, not fixed at module load.
 */
export function getTemplateImplementation(templateValue?: string | null): TemplateImplementation {
  return templateImplementations[resolveTemplate(templateValue)];
}

// The following exports are kept for backward compatibility but are not used
// in the current application after removing the static invitation dependency.
// They are set to the ayutika template as a placeholder.
export const activeTemplate: TemplateKey = "ayutika";
export const activeTemplateImplementation = templateImplementations[activeTemplate];