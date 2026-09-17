import Link from "next/link";
import { notFound } from "next/navigation";
import { getInvitationById, isSuperAdmin } from "@/src/lib/server/admin";
import { getSupabaseSessionClient } from "@/src/lib/server/supabase";

type InvitationWithTimestamps = NonNullable<
  Awaited<ReturnType<typeof getInvitationById>>
> & {
  created_at: string;
  updated_at: string;
};

export default async function InvitationDetailPage({
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

  const invitationWithTimestamps = invitation as InvitationWithTimestamps;

  return (
    <div className="p-6">
      <div className="mb-4">
        <Link
          href="/admin/invitations"
          className="text-sm text-muted-foreground hover:underline"
        >
          ← Back to Invitations
        </Link>
        <Link
          href={`/admin/invitations/${invitationWithTimestamps.id}/edit`}
          className="ml-4 text-sm text-primary hover:underline"
        >
          Edit Invitation
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-4">
        {invitationWithTimestamps.meta.title}
      </h1>

      <div className="grid grid-cols-1 gap-6 mb-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">Basic Info</h2>
          <p><strong>Slug:</strong> {invitationWithTimestamps.slug}</p>
          <p><strong>Template:</strong> {invitationWithTimestamps.template}</p>
          <p>
            <strong>Created:</strong>{" "}
            {new Date(invitationWithTimestamps.created_at).toLocaleDateString()}
          </p>
          <p>
            <strong>Updated:</strong>{" "}
            {new Date(invitationWithTimestamps.updated_at).toLocaleDateString()}
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Meta Information</h2>
          <p><strong>Title:</strong> {invitationWithTimestamps.meta.title}</p>
          <p><strong>Description:</strong> {invitationWithTimestamps.meta.description}</p>
          <p><strong>URL:</strong> {invitationWithTimestamps.meta.url}</p>
          <p><strong>OG Image:</strong> {invitationWithTimestamps.meta.ogImage}</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Couple</h2>
          <p><strong>Groom:</strong> {invitationWithTimestamps.couple.groom.fullName}</p>
          <p><strong>Bride:</strong> {invitationWithTimestamps.couple.bride.fullName}</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Wedding Date</h2>
          <p>{invitationWithTimestamps.wedding.displayDate}</p>
        </div>
      </div>
    </div>
  );
}
