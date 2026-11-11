/**
 * Re-export GET from /calendar.ics — keeps the URL working without duplicating code.
 */
export const dynamic = "force-dynamic";
export { GET } from "@/app/calendar.ics/route";