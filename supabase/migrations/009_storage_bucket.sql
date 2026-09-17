-- ------------------------------------------------------------
-- 9. Create invitation-assets storage bucket and configure policies
-- ------------------------------------------------------------

-- Create the invitation-assets storage bucket
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'invitation-assets',
  'invitation-assets',
  true,  -- Public bucket for asset delivery
  52428800,  -- 50MB file size limit
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'audio/mpeg',
    'audio/wav',
    'audio/mp4',
    'text/plain',  -- For .lrc lyrics files
    'application/octet-stream'
  ]::text[]
)
on conflict (id) do nothing;

-- Set up storage policies for the invitation-assets bucket
-- Drop existing policies if any (specific to this bucket to avoid affecting others)
drop policy if exists "Public Read Access" on storage.objects;
drop policy if exists "Member Write Access" on storage.objects;

-- Public read access: Anyone can read files from the bucket
create policy "Public Read Access"
on storage.objects for select
using ( bucket_id = 'invitation-assets' );

-- Member write access: Only invitation members can upload/update/delete their own invitation's assets
create policy "Member Write Access"
on storage.objects for all
using (
  bucket_id = 'invitation-assets'
  and public.is_invitation_member(
    (storage.foldername(name))[1]::uuid,
    array['owner', 'admin', 'editor']::text[]
  )
)
with check (
  bucket_id = 'invitation-assets'
  and public.is_invitation_member(
    (storage.foldername(name))[1]::uuid,
    array['owner', 'admin', 'editor']::text[]
  )
);