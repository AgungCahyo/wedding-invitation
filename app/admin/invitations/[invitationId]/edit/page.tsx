import Link from "next/link";
import { notFound } from "next/navigation";
import { getInvitationById, isSuperAdmin } from "@/src/lib/server/admin";
import { getSupabaseSessionClient } from "@/src/lib/server/supabase";
import InvitationFormWithRedirect from "./InvitationFormWithRedirect";
import type { Invitation } from "@/src/types/invitation";

export default async function EditInvitationPage({
  params,
}: {
  params: Promise<{ invitationId: string }>;
}) {
  const { invitationId } = await params;
  const supabaseClient = await getSupabaseSessionClient();

  if (!(await isSuperAdmin(supabaseClient))) {
    return <p className="text-center text-destructive py-8">Unauthorized</p>;
  }

  const invitation = await getInvitationById(invitationId);

  if (!invitation) {
    notFound();
  }

  // Pass the entire invitation as initialData
  const initialData = invitation as Invitation;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Edit Invitation</h1>
      <div className="mb-4">
        <Link
          href="/admin/invitations"
          className="text-sm text-muted-foreground hover:underline mb-2 inline-block"
        >
          ← Back to Invitations
        </Link>
        <Link
          href={`/admin/invitations/${invitationId}`}
          className="ml-4 text-sm text-muted-foreground hover:underline"
        >
          View Invitation
        </Link>
      </div>
      <InvitationFormWithRedirect
        invitationId={invitationId}
        initialData={initialData}
      />
    </div>
  );
}
