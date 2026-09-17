import { getSupabaseAdmin } from "@/src/lib/server/supabase-admin";
import { getSupabaseServerClient } from "@/src/lib/server/supabase";
import { isSupabaseConfigured } from "@/src/lib/supabase";
import { isSuperAdmin, isAuthorizedForInvitation, getInvitationById } from "@/src/lib/server/admin";
import type { NextRequest } from "next/server";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ invitationId: string; }> }
) {
  if (!isSupabaseConfigured) {
    return new Response("Supabase not configured", { status: 500 });
  }

  let supabaseClient;
  try {
    supabaseClient = await getSupabaseServerClient();
  } catch (error) {
    console.error("Failed to create Supabase client:", error);
    return new Response("Failed to initialize Supabase client", { status: 500 });
  }

  const params = await context.params;
  const invitationId = params.invitationId;

  // Validate UUID
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(invitationId)) {
    return new Response("Invalid invitation ID", { status: 400 });
  }

  // Check if the user is authorized for this invitation
  const isAuthorized = await isAuthorizedForInvitation(supabaseClient, invitationId);
  if (!isAuthorized) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Verify invitation exists
  const invitation = await getInvitationById(invitationId);
  if (!invitation) {
    return new Response("Invitation not found", { status: 404 });
  }

  // Parse multipart/form-data
  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const type = formData.get("type") as string | null;

  if (!file) {
    return new Response("No file provided", { status: 400 });
  }

  if (!type) {
    return new Response("No asset type provided", { status: 400 });
  }

  // Validate asset type
  const allowedTypes = [
    'cover', 'gallery', 'groom', 'bride', 'breather', 'og', 'music', 'lyrics'
  ] as const;
  if (!allowedTypes.includes(type as typeof allowedTypes[number])) {
    return new Response(
      `Invalid asset type. Allowed types: ${allowedTypes.join(", ")}`,
      { status: 400 }
    );
  }

  // Validate file size (50MB limit as per bucket)
  const maxSize = 50 * 1024 * 1024; // 50MB
  if (file.size > maxSize) {
    return new Response(
      `File too large. Maximum size is ${maxSize / (1024 * 1024)}MB`,
      { status: 400 }
    );
  }

  // Validate MIME type against allowed list from bucket
  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'audio/mpeg',
    'audio/wav',
    'audio/mp4',
    'text/plain', // For .lrc lyrics files
    'application/octet-stream'
  ];
  if (!allowedMimeTypes.includes(file.type)) {
    return new Response(
      `Invalid file type: ${file.type}. Allowed types: ${allowedMimeTypes.join(", ")}`,
      { status: 400 }
    );
  }

  // Generate a unique storage path
  // Extract file extension from original filename or MIME type
  const originalFilename = file.name;
  let extension = '';
  if (originalFilename.includes('.')) {
    extension = originalFilename.substring(originalFilename.lastIndexOf('.'));
  } else {
    // Fallback to extension from MIME type
    const mimeToExt: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/gif': '.gif',
      'image/webp': '.webp',
      'image/svg+xml': '.svg',
      'audio/mpeg': '.mp3',
      'audio/wav': '.wav',
      'audio/mp4': '.m4a',
      'text/plain': '.lrc',
      'application/octet-stream': '.bin'
    };
    extension = mimeToExt[file.type] || '';
  }

  // Generate a random UUID for the filename (without extension)
  const randomId = crypto.randomUUID();
  const filename = `${randomId}${extension}`;
  // Storage path: invitationId/type/filename
  const storagePath = `${invitationId}/${type}/${filename}`;

  // Upload file to Supabase Storage
  const supabaseAdmin = getSupabaseAdmin();
  const { data: uploadData, error: uploadError } = await supabaseAdmin
    .storage
    .from('invitation-assets')
    .upload(storagePath, file, {
      contentType: file.type,
      upsert: false // Avoid overwriting existing file
    });

  if (uploadError) {
    console.error("Error uploading file to Supabase Storage:", uploadError);
    return new Response("Failed to upload file", { status: 500 });
  }

  // Insert asset record into invitation_assets table
  const { error: insertError } = await supabaseAdmin
    .from('invitation_assets')
    .insert({
      invitation_id: invitationId,
      type,
      storage_path: storagePath,
      mime_type: file.type,
      file_size: file.size,
      original_filename: originalFilename,
      alt_text: "", // TODO: allow setting alt text in the future
      sort_order: 0
    });

  if (insertError) {
    console.error("Error inserting asset record:", insertError);
    // Optionally, we could delete the uploaded file to avoid orphaned storage
    // but we'll leave it for simplicity.
    return new Response("Failed to save asset record", { status: 500 });
  }

  // Return the storage path (to be stored in the invitation field)
  return new Response(JSON.stringify({ storagePath }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}