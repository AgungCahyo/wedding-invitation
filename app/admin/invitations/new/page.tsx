"use client";
import { useState } from "react";
import Link from "next/link";
import InvitationForm from "@/src/components/admin/InvitationForm";
import { useRouter } from "next/navigation";

export default function NewInvitationPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSuccess = (invitationId: string) => {
    // Optionally, we can redirect to the detail page or the list.
    // Let's redirect to the detail page to see the created invitation.
    router.push(`/admin/invitations/${invitationId}`);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">New Invitation</h1>
      <Link href="/admin/invitations" className="text-sm text-muted-foreground hover:underline mb-4 inline-block">
        ← Back to Invitations
      </Link>
      {error && <p className="text-destructive mb-4">{error}</p>}
      <InvitationForm
        onSuccess={handleSuccess}
      />
    </div>
  );
}