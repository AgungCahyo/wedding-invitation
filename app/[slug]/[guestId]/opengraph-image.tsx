export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { getInvitationBySlug } from "@/src/lib/invitation-service";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: { slug: string; guestId: string };
}): Promise<Metadata> {
  const invitationSlug = params.slug;
  const guestName = params.guestId ? decodeURIComponent(params.guestId) : "";

  const invitationData = await getInvitationBySlug(invitationSlug);
  if (!invitationData) {
    notFound();
  }

  const { meta, couple } = invitationData;
  const guestDisplayName = guestName || "Tamu";

  return {
    title: `${meta.title} - Undangan untuk ${guestDisplayName}`,
    description: meta.description,
    openGraph: {
      title: `${meta.title} - Undangan untuk ${guestDisplayName}`,
      description: meta.description,
      url: `${meta.url}?to=${encodeURIComponent(guestName)}`,
      siteName: meta.title,
      images: [
        {
          url: invitationData.meta.ogImage, // Use the ogImage from the invitation
          width: 1200,
          height: 630,
          alt: `${meta.title} - Undangan untuk ${guestDisplayName}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${meta.title} - Undangan untuk ${guestDisplayName}`,
      description: meta.description,
      images: [invitationData.meta.ogImage], // Use the ogImage from the invitation
    },
  };
}

export default function OpengraphImage() {
  // This function is never called directly - Next.js uses the generateMetadata function
  return null;
}