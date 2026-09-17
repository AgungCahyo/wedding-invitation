"use client";

import { useRouter } from "next/navigation";
import InvitationForm from "@/src/components/admin/InvitationForm";
import type { Invitation } from "@/src/types/invitation";

interface InvitationFormWithRedirectProps {
  invitationId: string;
  initialData?: Partial<Invitation>;
}

export default function InvitationFormWithRedirect({
  invitationId,
  initialData = {},
}: InvitationFormWithRedirectProps) {
  const router = useRouter();

  return (
    <InvitationForm
      invitationId={invitationId}
      initialData={initialData}
      onSuccess={(updatedInvitationId) => {
        router.push(`/admin/invitations/${updatedInvitationId}`);
      }}
    />
  );
}
