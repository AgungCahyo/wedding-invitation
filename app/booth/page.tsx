"use client";

import { useRouter } from "next/navigation";
import { PhotoBoothModal } from "@/src/components/photobooth/PhotoBoothModal";

/**
 * Direct photo booth entry — target of the on-site QR code.
 * Skips the invitation (opening, music, auto-scroll) and opens the camera
 * immediately. Closing the booth leads to the full invitation.
 */
export default function BoothPage() {
  const router = useRouter();
  return <PhotoBoothModal onClose={() => router.push("/")} />;
}
