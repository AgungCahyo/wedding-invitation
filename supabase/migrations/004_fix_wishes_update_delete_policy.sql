-- ------------------------------------------------------------
-- 1. `invitations` — new table, root of multitenancy
-- ------------------------------------------------------------
create table if not exists invitations (
  id          uuid        not null default gen_random_uuid(),
  slug        text        not null,
  template    text        not null,
  meta        jsonb       not null,
  cover       jsonb       not null,
  couple      jsonb       not null,
  wedding     jsonb       not null,
  breather    jsonb,
  events      jsonb       not null,
  quote       jsonb,
  story       jsonb       not null,
  gallery     jsonb       not null,
  rsvp        jsonb       not null,
  gift        jsonb,
  closing     jsonb       not null,
  maker       jsonb,
  audio       jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  constraint invitations_pkey primary key (id),
  constraint invitations_slug_key unique (slug)
);

create index if not exists idx_invitations_slug on invitations (slug);

alter table invitations enable row level security;

create policy "Allow public read" on invitations
  for select using (true);

-- ------------------------------------------------------------
-- 2. Backfill: the single pre-existing invitation (Ayutika)
-- ------------------------------------------------------------
-- Source: src/data/invitation.ts (static payload) as it exists on
-- the `developments` branch at the time of this reconstruction,
-- fitted to the live row's known id/slug/template.
insert into invitations (
  id, slug, template, meta, cover, couple, wedding, breather,
  events, quote, story, gallery, rsvp, gift, closing, maker, audio
)
values (
  'ce1776ad-79ca-4578-80d0-b708aeb1aa21',
  'ayutika',
  'ayutika',
  jsonb_build_object(
    'title', 'Agung & Ayu Wedding',
    'description', 'Kami dengan bahagia mengundang Anda untuk merayakan hari istimewa kami. Pernikahan Agung Cahyo Prasetyo dan Ayu Cahya Tika.',
    'url', 'https://ayutika.agungcahyo.my.id',
    'ogImage', '/og-image.jpg'
  ),
  jsonb_build_object(
    'image', '/images/gallery-1.jpg?v=20260820',
    'label', 'THE WEDDING OF'
  ),
  jsonb_build_object(
    'groom', jsonb_build_object(
      'name', 'Agung Cahyo Prasetyo',
      'fullName', 'Agung Cahyo Prasetyo, S.T.',
      'parents', jsonb_build_array('Bp. Joko Priyono', 'Ibu Surtini'),
      'photo', '/images/groom.jpg?v=20260820',
      'socialLinks', jsonb_build_object('instagram', 'https://instagram.com')
    ),
    'bride', jsonb_build_object(
      'name', 'Ayu Cahya Tika',
      'fullName', 'Ayu Cahya Tika, S.E.',
      'parents', jsonb_build_array('Bp. Suwarto', 'Ibu Siti Mahmudah'),
      'photo', '/images/bride.jpg?v=20260820',
      'socialLinks', jsonb_build_object('instagram', 'https://instagram.com')
    )
  ),
  jsonb_build_object(
    'date', '2026-12-04',
    'displayDate', '04 Desember 2026',
    'timezone', 'Asia/Jakarta'
  ),
  jsonb_build_object(
    'image', '/images/gallery-6.jpg?v=20260820',
    'caption', ''
  ),
  jsonb_build_object(
    'akad', jsonb_build_object(
      'date', '04 Desember 2026',
      'dayName', 'Jum''at',
      'time', '09:00 – 11:00 WIB',
      'venue', 'Rumah Mempelai Wanita',
      'address', 'Ngembal Kulon, Gg. Juwet 2, RT.01/RW.03, Krasak, belok kanan, Kec. Jati, Kabupaten Kudus',
      'mapsUrl', 'https://maps.app.goo.gl/bDvNSsKY8uW9VrG79'
    ),
    'reception', jsonb_build_object(
      'date', '04 Desember 2026',
      'dayName', 'Jum''at',
      'time', '19:00 – 23:00 WIB',
      'venue', 'Rumah Mempelai Wanita',
      'address', 'Ngembal Kulon, Gg. Juwet 2, RT.01/RW.03, Krasak, belok kanan, Kec. Jati, Kabupaten Kudus',
      'mapsUrl', 'https://maps.app.goo.gl/bDvNSsKY8uW9VrG79'
    )
  ),
  jsonb_build_object(
    'quranic', 'وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا',
    'quranicTranslation', 'Dan di antara tanda-tanda-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri.',
    'quranicReference', 'Ar-Rum: 21'
  ),
  jsonb_build_array(
    jsonb_build_object('title', 'Awal Pertemuan', 'date', '2020', 'description', 'Di tengah riuhnya suasana kerja dan ketidakpastian dunia, takdir mempertemukan tatap mata kami untuk pertama kalinya. Sebuah senyuman sederhana yang tanpa disadari menjadi awal dari kisah indah yang tak terpisahkan.'),
    jsonb_build_object('title', 'Kencan Pertama', 'date', '2020', 'description', 'Di antara sejuknya angin pegunungan dan indahnya cakrawala, kami menghabiskan waktu bertukar cerita. Hari itu, dua hati menyadari bahwa mereka telah menemukan tempat paling nyaman untuk pulang.'),
    jsonb_build_object('title', 'Hari Lamaran', 'date', '2025', 'description', 'Di hadapan kedua keluarga besar, sebuah janji suci diucapkan. Dengan penuh ketulusan dan restu orang tua, kami menetapkan langkah menuju ikatan perkawinan yang lebih bermakna.'),
    jsonb_build_object('title', 'Hari Pernikahan', 'date', '2026', 'description', 'Hari yang paling dinanti pun tiba. Di atas doa dan ikrar suci, kami melangkah bersama. Bukan lagi tentang ''aku'' atau ''kamu'', melainkan tentang ''kita'' yang siap mengarungi masa depan selamanya.')
  ),
  jsonb_build_array(
    jsonb_build_object('id', 1, 'src', '/images/gallery-6.jpg?v=20260820', 'alt', 'Couple photo 1', 'aspect', 'tall'),
    jsonb_build_object('id', 2, 'src', '/images/gallery-5.jpg?v=20260820', 'alt', 'Couple photo 2', 'aspect', 'square'),
    jsonb_build_object('id', 3, 'src', '/images/gallery-4.jpg?v=20260820', 'alt', 'Couple photo 3', 'aspect', 'wide'),
    jsonb_build_object('id', 4, 'src', '/images/gallery-3.jpg?v=20260820', 'alt', 'Couple photo 4', 'aspect', 'square'),
    jsonb_build_object('id', 5, 'src', '/images/gallery-2.jpg?v=20260820', 'alt', 'Couple photo 5', 'aspect', 'tall'),
    jsonb_build_object('id', 6, 'src', '/images/gallery-1.jpg?v=20260820', 'alt', 'Couple photo 6', 'aspect', 'square')
  ),
  jsonb_build_object(
    'deadline', '27 November 2026',
    'deadlineNote', 'Silakan konfirmasi kehadiran Anda sebelum tanggal tersebut',
    'waNumber', '628156906607'
  ),
  jsonb_build_object(
    'note', 'Kehadiran Anda adalah hadiah terbesar bagi kami.',
    'methods', jsonb_build_array(
      jsonb_build_object('id', 'bca-groom', 'owner', 'groom', 'type', 'bank', 'label', 'Bank Central Asia (BCA)', 'accountNumber', '1234567890', 'accountHolder', 'Agung Cahyo Prasetyo'),
      jsonb_build_object('id', 'gopay-groom', 'owner', 'groom', 'type', 'ewallet', 'label', 'GoPay', 'accountNumber', '0815-6906-607', 'accountHolder', 'Agung Cahyo Prasetyo'),
      jsonb_build_object('id', 'ovo-groom', 'owner', 'groom', 'type', 'ewallet', 'label', 'OVO', 'accountNumber', '0815-6906-607', 'accountHolder', 'Agung Cahyo Prasetyo'),
      jsonb_build_object('id', 'dana-groom', 'owner', 'groom', 'type', 'ewallet', 'label', 'DANA', 'accountNumber', '0815-6906-607', 'accountHolder', 'Agung Cahyo Prasetyo'),
      jsonb_build_object('id', 'bca-bride', 'owner', 'bride', 'type', 'bank', 'label', 'Bank Central Asia (BCA)', 'accountNumber', '0987654321', 'accountHolder', 'Ayu Cahya Tika'),
      jsonb_build_object('id', 'gopay-bride', 'owner', 'bride', 'type', 'ewallet', 'label', 'GoPay', 'accountNumber', '0857-0056-6814', 'accountHolder', 'Ayu Cahya Tika'),
      jsonb_build_object('id', 'ovo-bride', 'owner', 'bride', 'type', 'ewallet', 'label', 'OVO', 'accountNumber', '0857-0056-6814', 'accountHolder', 'Ayu Cahya Tika'),
      jsonb_build_object('id', 'dana-bride', 'owner', 'bride', 'type', 'ewallet', 'label', 'DANA', 'accountNumber', '0857-0056-6814', 'accountHolder', 'Ayu Cahya Tika')
    )
  ),
  jsonb_build_object(
    'message', 'Merupakan suatu kebahagiaan dan kehormatan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.',
    'couple', 'Agung & Ayu'
  ),
  jsonb_build_object(
    'name', 'Agung Cahyo',
    'url', 'https://agungcahyo.my.id'
  ),
  jsonb_build_object(
    'src', '/audio/wedding3.mp3',
    'lyricsSrc', '/lyrics/wedding3.lrc'
  )
)
on conflict (id) do nothing;

-- ------------------------------------------------------------
-- 3. `guest_links` — add invitation_id, backfill, then constrain
-- ------------------------------------------------------------
alter table guest_links add column if not exists invitation_id uuid;

update guest_links
set invitation_id = 'ce1776ad-79ca-4578-80d0-b708aeb1aa21'
where invitation_id is null;

alter table guest_links alter column invitation_id set not null;

alter table guest_links
  add constraint guest_links_invitation_id_fkey
  foreign key (invitation_id) references invitations (id);

-- Replace the old single-invitation uniqueness (slug alone) with the
-- multitenant-safe (invitation_id, slug) pair. The old constraint
-- name is assumed to follow Postgres's default naming
-- (guest_links_slug_key); adjust if the live constraint name differs.
alter table guest_links drop constraint if exists guest_links_slug_key;

alter table guest_links
  add constraint guest_links_invitation_id_slug_key unique (invitation_id, slug);

create index if not exists idx_guest_links_invitation_id on guest_links (invitation_id);

-- ------------------------------------------------------------
-- 4. `rsvp_guests` — add invitation_id, backfill, then constrain
-- ------------------------------------------------------------
alter table rsvp_guests add column if not exists invitation_id uuid;

update rsvp_guests
set invitation_id = 'ce1776ad-79ca-4578-80d0-b708aeb1aa21'
where invitation_id is null;

alter table rsvp_guests alter column invitation_id set not null;

alter table rsvp_guests
  add constraint rsvp_guests_invitation_id_fkey
  foreign key (invitation_id) references invitations (id);

create index if not exists idx_rsvp_guests_invitation_id on rsvp_guests (invitation_id);

-- Pre-existing `attendance` CHECK constraint is untouched by this
-- migration — no column it depends on is modified above.

-- ------------------------------------------------------------
-- 5. `wishes` — add invitation_id, backfill, then constrain
-- ------------------------------------------------------------
alter table wishes add column if not exists invitation_id uuid;

update wishes
set invitation_id = 'ce1776ad-79ca-4578-80d0-b708aeb1aa21'
where invitation_id is null;

alter table wishes alter column invitation_id set not null;

alter table wishes
  add constraint wishes_invitation_id_fkey
  foreign key (invitation_id) references invitations (id);

create index if not exists idx_wishes_invitation_id on wishes (invitation_id);

-- Pre-existing status/pinned indexes and constraints are untouched
-- by this migration — no column they depend on is modified above.

-- ------------------------------------------------------------
-- 6. `record_guest_view` — replace single-arg RPC with the
--    invitation-scoped, two-argument version
-- ------------------------------------------------------------
-- Drop the pre-11C single-argument version if present. The exact
-- pre-11C parameter name/type could not be confirmed from git
-- (migrations 001–003 are absent from this repo), so this drops by
-- the most likely prior signature; if the live single-arg function
-- used a different parameter name, drop it manually before applying
-- this migration to a fresh database.
drop function if exists record_guest_view(guest_slug text);

create or replace function record_guest_view(
  guest_invitation_id uuid,
  guest_slug text
)
returns void
language plpgsql
security definer
as $$
begin
  update guest_links
  set
    view_count = coalesce(view_count, 0) + 1,
    first_viewed_at = coalesce(first_viewed_at, now()),
    last_viewed_at = now()
  where invitation_id = guest_invitation_id
    and slug = guest_slug;
end;
$$;

-- ============================================================
-- End of reconstructed migration.
-- ============================================================
