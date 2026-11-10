import "server-only";

import { NextResponse } from "next/server";

/**
 * Server-side HTTP helpers — used by API routes.
 */

/** Standard error response */
export const fail = (error: string, status: number) =>
  NextResponse.json({ error }, { status });

/** Standard success response */
export const okJson = <T>(data: T, init?: ResponseInit) =>
  NextResponse.json(data, { status: 200, ...init });

/** Safely parse JSON from request */
export async function readJson<Req>(req: Request): Promise<Req> {
  try {
    return await req.json();
  } catch {
    return {} as Req;
  }
}

/** Guard result from admin-guard */
export interface GuardResult {
  db: ReturnType<typeof import("./db").serviceClient> | null;
  res: NextResponse | null;
}

/** Verify affected rows (returns 404 if none) */
export function requireAffected(
  data: { length: number } | null | undefined,
  notFoundMessage: string
): NextResponse | null {
  if (!data?.length) return fail(notFoundMessage, 404);
  return null;
}

/**
 * Higher-order handler for admin routes with DB access.
 * Usage: export const GET = withAdminDb(async (req, db) => { ... })
 */
export function withAdminDb(
  handler: (req: Request, db: NonNullable<GuardResult["db"]>) => Promise<NextResponse>
) {
  return async (req: Request) => {
    const { guard } = await import("./admin-guard");
    const g = await guard(req);
    if (!g.db) return g.res!;
    return handler(req, g.db);
  };
}