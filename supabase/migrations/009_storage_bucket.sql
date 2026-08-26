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
-- Drop existing policies if any
delete from storage.policies
where bucket_id = 'invitation-assets';

-- Public read access: Anyone can read files from the bucket
create policy "Public Read Access"
on storage.objects for select
using ( bucket_id = 'invitation-assets' )
with check ( bucket_id = 'invitation-assets' );

-- Member write access: Only invitation members can upload/update/delete their own invitation's assets
create policy "Member Write Access"
on storage.objects for all
using (
  bucket_id = 'invitation-assets'
  and (
    -- Extract invitation_id from the storage path: invitation-assets/{invitation_id}/...
    (storage.foldername(name))[1]::uuid in (
      select invitation_id from invitation_members
      where user_id = auth.uid()
        and role in ('owner', 'admin', 'editor')
    )
  )
)
with check (
  bucket_id = 'invitation-assets'
  and (
    -- Extract invitation_id from the storage path: invitation-assets/{invitation_id}/...
    (storage.foldername(name))[1]::uuid in (
      select invitation_id from invitation_members
      where user_id = auth.uid()
        and role in ('owner', 'admin', 'editor')
    )
  )
);