import { renderInvitationOg } from "@/src/lib/og/invitation-og";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const alt = "Undangan Pernikahan";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return renderInvitationOg();
}
