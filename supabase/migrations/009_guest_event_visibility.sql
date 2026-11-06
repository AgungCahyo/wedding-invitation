-- ============================================================
-- Event visibility per kategori tamu (Kudus / Wonogiri).
-- Aman dijalankan berulang & tidak mengubah/menghapus data lama.
-- JALANKAN SEBELUM deploy kode baru (Supabase SQL Editor).
-- ============================================================

-- 1) Kategori tamu. Tamu lama otomatis 'kudus' (hanya melihat Akad & Resepsi);
--    ubah tamu Wonogiri lewat dashboard admin (Personalisasi → Kategori tamu)
--    atau SQL: update guest_links set category = 'wonogiri' where slug in (...);
alter table guest_links
  add column if not exists category text not null default 'kudus';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'guest_links_category_check'
  ) then
    alter table guest_links
      add constraint guest_links_category_check
      check (category in ('kudus', 'wonogiri'));
  end if;
end $$;

-- 2) Jawaban RSVP per acara tambahan, mis. {"ngunduh-mantu":"attending"}.
--    NULL untuk semua RSVP lama.
alter table rsvp_guests
  add column if not exists event_responses jsonb;

-- 3) Kunci: kategori & jawaban per-acara TIDAK bisa diubah dengan anon key
--    (kunci publik). Hanya service-role (API server) / SQL editor yang bisa.
--    Tanpa ini, tamu Kudus bisa mengubah kategorinya sendiri lewat API Supabase.
create or replace function guest_links_protect_category()
returns trigger
language plpgsql
as $$
begin
  if current_user in ('anon', 'authenticated') then
    if tg_op = 'INSERT' then
      new.category := 'kudus';
    else
      new.category := old.category;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists guest_links_protect_category on guest_links;
create trigger guest_links_protect_category
  before insert or update on guest_links
  for each row execute function guest_links_protect_category();

create or replace function rsvp_guests_protect_event_responses()
returns trigger
language plpgsql
as $$
begin
  if current_user in ('anon', 'authenticated') then
    new.event_responses := null;
  end if;
  return new;
end;
$$;

drop trigger if exists rsvp_guests_protect_event_responses on rsvp_guests;
create trigger rsvp_guests_protect_event_responses
  before insert or update on rsvp_guests
  for each row execute function rsvp_guests_protect_event_responses();

-- Rollback (jika perlu):
--   drop trigger if exists guest_links_protect_category on guest_links;
--   drop trigger if exists rsvp_guests_protect_event_responses on rsvp_guests;
--   alter table guest_links drop column if exists category;
--   alter table rsvp_guests drop column if exists event_responses;
