import type { ComponentType } from "react";
import { invitation } from "@/src/data/invitation";
import { resolveTemplate, type TemplateKey } from "@/src/templates/template-registry";
import { Opening as AyutikaOpening } from "@/src/templates/ayutika/Opening";
import { ayutikaSectionOrder, ayutikaSections } from "@/src/templates/ayutika";
import { Opening as Template02Opening } from "@/src/templates/template02/Opening";
import { template02SectionOrder, template02Sections }  from "@/src/templates/template02";

/**
 * Application/template boundary (Step 7D).
 *
 * Resolves `invitation.template` through `resolveTemplate()` into the
 * concrete implementation the pages should render. `templateImplementations`
 * is an explicit mapping, not a generic rendering engine — each template
 * gets its own listed branch. The `Record<TemplateKey, TemplateImplementation>`
 * annotation forces every TemplateKey to be handled (Step 10A added the
 * `template02` branch).
 *
 * app/page.tsx and app/[guest]/page.tsx should read `activeTemplateImplementation`
 * instead of importing Ayutika's Opening/section registry directly.
 */

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
    ComponentType<{ guestName?: string | undefined; invitation: any; invitationId?: string }>
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

export const activeTemplate: TemplateKey = resolveTemplate(invitation.template);

export const activeTemplateImplementation = templateImplementations[activeTemplate];