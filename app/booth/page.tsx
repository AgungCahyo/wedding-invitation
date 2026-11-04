"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PhotoBoothModal } from "@/src/components/photobooth/PhotoBoothModal";

/**
 * Direct photo booth entry — target of the on-site QR code.
 * Skips the invitation (opening, music, auto-scroll) and opens the camera
 * immediately. Closing the booth leads to the full invitation.
 *
 * Optional identity: /booth?name=Budi or /booth?guest=Budi
 */
function BoothInner() {
  const router = useRouter();
  const params = useSearchParams();
  const raw = params.get("name") ?? params.get("guest") ?? "";
  let guestName = raw.trim();
  try {
    guestName = decodeURIComponent(raw).trim();
  } catch {
    guestName = raw.trim();
  }

  return (
    <PhotoBoothModal
      onClose={() => router.push("/")}
      guestName={guestName || "-"}
    />
  );
}

export default function BoothPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--bg-primary)]" />}>
      <BoothInner />
    </Suspense>
  );
}
