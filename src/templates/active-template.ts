import { invitation } from "@/src/data/invitation";
import { resolveTemplate, type TemplateKey } from "@/src/templates/template-registry";
import { Opening as AyutikaOpening } from "@/src/templates/ayutika/Opening";
import { ayutikaSectionOrder, ayutikaSections } from "@/src/templates/ayutika";

/**
 * Application/template boundary (Step 7D).
 *
 * Resolves `invitation.template` through `resolveTemplate()` into the
 * concrete implementation the pages should render. There is only one
 * template today, so `templateImplementations` has exactly one branch —
 * this is an explicit mapping, not a generic rendering engine. When a
 * second template exists, add its branch here; `satisfies Record<TemplateKey, ...>`
 * forces every TemplateKey to be handled.
 *
 * app/page.tsx and app/[guest]/page.tsx should read `activeTemplateImplementation`
 * instead of importing Ayutika's Opening/section registry directly.
 */
const templateImplementations = {
  ayutika: {
    Opening: AyutikaOpening,
    sectionOrder: ayutikaSectionOrder,
    sections: ayutikaSections,
  },
} satisfies Record<TemplateKey, unknown>;

export const activeTemplate: TemplateKey = resolveTemplate(invitation.template);

export const activeTemplateImplementation = templateImplementations[activeTemplate];