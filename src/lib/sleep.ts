/**
 * Shared sleep utility — used by PhotoBoothModal and api/admin/wa/route.ts
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}