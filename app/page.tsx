"use client";

import { InvitationShell } from "@/src/components/invitation/InvitationShell";
import { InvitationSections } from "@/src/components/invitation/InvitationSections";

export default function Home() {
  return (
    <InvitationShell photoBoothPlacement="outside">
      <InvitationSections />
    </InvitationShell>
  );
}
