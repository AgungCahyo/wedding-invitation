export type TemplateKey = "ayutika" | "template02";

export const templateKeys: TemplateKey[] = ["ayutika", "template02"];

export const defaultTemplate: TemplateKey = "ayutika";

export function isTemplateKey(value: unknown): value is TemplateKey {
  return typeof value === "string" && (templateKeys as string[]).includes(value);
}

export function resolveTemplate(value?: string | null): TemplateKey {
  return isTemplateKey(value) ? value : defaultTemplate;
}