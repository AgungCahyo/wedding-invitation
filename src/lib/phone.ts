/**
 * Normalises an Indonesian WhatsApp number to international digits without "+"
 * ("0812-3456-7890" / "+62 812 3456 7890" / "812…" → "6281234567890").
 * Returns null when the number can't be a valid mobile number.
 * Client-safe.
 */
export function normalizeIdPhone(input: string | null | undefined): string | null {
  if (!input) return null;
  let d = input.replace(/[^\d+]/g, "");
  if (d.startsWith("+")) d = d.slice(1);
  d = d.replace(/\D/g, "");
  if (d.startsWith("00")) d = d.slice(2);
  if (d.startsWith("0")) d = "62" + d.slice(1);
  else if (d.startsWith("8")) d = "62" + d;
  // Indonesian mobile: 62 8xx + 8–11 digits → 11–14 digits total.
  if (!/^628\d{8,11}$/.test(d)) return null;
  return d;
}
