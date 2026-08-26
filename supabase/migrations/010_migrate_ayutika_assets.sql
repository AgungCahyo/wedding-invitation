-- ------------------------------------------------------------
-- 10. Migrate Ayutika assets to Supabase Storage
-- ------------------------------------------------------------

-- Create asset records for the Ayutika invitation in the invitation_assets table
-- This migration creates the asset metadata records but does not yet update
-- the invitation JSONB to reference assets by ID. That will be handled in
-- the invitation service layer for backward compatibility.

do $$
declare
  ayutika_invitation_id uuid := 'ce1776ad-79ca-4578-80d0-b708aeb1aa21'::uuid;
begin
  -- Delete any existing asset records for this invitation (clean migration)
  delete from public.invitation_assets where invitation_id = ayutika_invitation_id;

  -- Cover image
  insert into public.invitation_assets (
    id, invitation_id, type, storage_path, sort_order, alt_text, mime_type, file_size, original_filename
  ) values (
    gen_random_uuid(), ayutika_invitation_id, 'cover',
    'invitation-assets/' || ayutika_invitation_id || '/cover/cover.jpg',
    0, 'Wedding cover image', 'image/jpeg', 81800, 'groom.jpg'
  );

  -- Groom photo
  insert into public.invitation_assets (
    id, invitation_id, type, storage_path, sort_order, alt_text, mime_type, file_size, original_filename
  ) values (
    gen_random_uuid(), ayutika_invitation_id, 'groom',
    'invitation-assets/' || ayutika_invitation_id || '/groom/groom.jpg',
    1, 'Groom photo', 'image/jpeg', 81800, 'groom.jpg'
  );

  -- Bride photo
  insert into public.invitation_assets (
    id, invitation_id, type, storage_path, sort_order, alt_text, mime_type, file_size, original_filename
  ) values (
    gen_random_uuid(), ayutika_invitation_id, 'bride',
    'invitation-assets/' || ayutika_invitation_id || '/bride/bride.jpg',
    2, 'Bride photo', 'image/jpeg', 81200, 'bride.jpg'
  );

  -- Breather image
  insert into public.invitation_assets (
    id, invitation_id, type, storage_path, sort_order, alt_text, mime_type, file_size, original_filename
  ) values (
    gen_random_uuid(), ayutika_invitation_id, 'breather',
    'invitation-assets/' || ayutika_invitation_id || '/breather/breather.jpg',
    3, 'Breather image', 'image/jpeg', 74800, 'gallery-6.jpg'
  );

  -- Gallery images (6 photos)
  insert into public.invitation_assets (
    id, invitation_id, type, storage_path, sort_order, alt_text, mime_type, file_size, original_filename
  ) values
    (gen_random_uuid(), ayutika_invitation_id, 'gallery',
     'invitation-assets/' || ayutika_invitation_id || '/gallery/gallery-1.jpg',
     0, 'Gallery photo 1', 'image/jpeg', 143500, 'gallery-1.jpg'),
    (gen_random_uuid(), ayutika_invitation_id, 'gallery',
     'invitation-assets/' || ayutika_invitation_id || '/gallery/gallery-2.jpg',
     1, 'Gallery photo 2', 'image/jpeg', 189500, 'gallery-2.jpg'),
    (gen_random_uuid(), ayutika_invitation_id, 'gallery',
     'invitation-assets/' || ayutika_invitation_id || '/gallery/gallery-3.jpg',
     2, 'Gallery photo 3', 'image/jpeg', 141600, 'gallery-3.jpg'),
    (gen_random_uuid(), ayutika_invitation_id, 'gallery',
     'invitation-assets/' || ayutika_invitation_id || '/gallery/gallery-4.jpg',
     3, 'Gallery photo 4', 'image/jpeg', 309700, 'gallery-4.jpg'),
    (gen_random_uuid(), ayutika_invitation_id, 'gallery',
     'invitation-assets/' || ayutika_invitation_id || '/gallery/gallery-5.jpg',
     4, 'Gallery photo 5', 'image/jpeg', 254600, 'gallery-5.jpg'),
    (gen_random_uuid(), ayutika_invitation_id, 'gallery',
     'invitation-assets/' || ayutika_invitation_id || '/gallery/gallery-6.jpg',
     5, 'Gallery photo 6', 'image/jpeg', 74800, 'gallery-6.jpg');

  -- Audio file
  insert into public.invitation_assets (
    id, invitation_id, type, storage_path, sort_order, alt_text, mime_type, file_size, original_filename
  ) values (
    gen_random_uuid(), ayutika_invitation_id, 'music',
    'invitation-assets/' || ayutika_invitation_id || '/music/wedding3.mp3',
    0, 'Wedding music', 'audio/mpeg', 2900000, 'wedding3.mp3'
  );

  -- Lyrics file
  insert into public.invitation_assets (
    id, invitation_id, type, storage_path, sort_order, alt_text, mime_type, file_size, original_filename
  ) values (
    gen_random_uuid(), ayutika_invitation_id, 'lyrics',
    'invitation-assets/' || ayutika_invitation_id || '/lyrics/wedding3.lrc',
    1, 'Wedding song lyrics', 'text/plain', 1900, 'wedding3.lrc'
  );

  -- OG image (referenced in meta.ogImage)
  insert into public.invitation_assets (
    id, invitation_id, type, storage_path, sort_order, alt_text, mime_type, file_size, original_filename
  ) values (
    gen_random_uuid(), ayutika_invitation_id, 'og',
    'invitation-assets/' || ayutika_invitation_id || '/og/og-image.jpg',
    0, 'Open Graph image', 'image/jpeg', 100172, 'og-image.jpg'
  );
end $$;

-- Note: The actual updating of invitation JSONB to reference assets by ID
-- will be handled in the invitation service layer with a fallback mechanism
-- for backward compatibility during migration. The templates will continue
-- to receive resolved string URLs from the service.