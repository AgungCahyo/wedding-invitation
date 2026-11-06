import { renderInvitationOg } from "@/src/lib/og/invitation-og";
import { splitGuestSegment } from "@/src/lib/guest-token";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const alt = "Undangan Pernikahan";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ guest: string }>;
}) {
  const { guest } = await params;
  return renderInvitationOg(splitGuestSegment(guest).slug);
}
