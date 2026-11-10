/**
 * Re-export GET from /calendar.ics — keeps the URL working without duplicating code.
 * See H-10 in REFACTORING-FINAL-PLAN.md
 */
export const dynamic = "force-dynamic";
export { GET } from "@/app/calendar.ics/route";