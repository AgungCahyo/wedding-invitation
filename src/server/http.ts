import "server-only";

import { NextResponse } from "next/server";

/** Standard error response */
export const fail = (error: string, status: number) =>
  NextResponse.json({ error }, { status });

/** Safely parse JSON from request */
export async function readJson<Req>(req: Request): Promise<Req> {
  try {
    return await req.json();
  } catch {
    return {} as Req;
  }
}

/** Verify affected rows (returns 404 if none) */
export function requireAffected(
  data: { length: number } | null | undefined,
  notFoundMessage: string
): NextResponse | null {
  if (!data?.length) return fail(notFoundMessage, 404);
  return null;
}
