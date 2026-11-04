export function escapeCSVField(value: string | number | null | undefined): string {
  let str = String(value ?? "");
  // Guests type these fields: stop Excel/Sheets from executing "=...", "+...", "@..." as formulas.
  if (typeof value === "string" && /^[=+\-@\t\r]/.test(str)) str = `'${str}`;
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}
