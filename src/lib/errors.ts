/**
 * Shared error message extraction — eliminates 23+ duplicate `err instanceof Error ? err.message : "Gagal …"` patterns.
 */
export function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return fallback;
}