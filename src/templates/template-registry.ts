export type TemplateKey = "ayutika" | "template02";

export const templateKeys: TemplateKey[] = ["ayutika", "template02"];

export function isTemplateKey(value: unknown): value is TemplateKey {
  return typeof value === "string" && (templateKeys as string[]).includes(value);
}

export function resolveTemplate(value?: string | null): TemplateKey {
  if (isTemplateKey(value)) {
    return value;
  }
  const available = templateKeys.join(", ");
  throw new Error(
    `Unknown invitation template "${value}". Registered templates: ${available}.`
  );
}