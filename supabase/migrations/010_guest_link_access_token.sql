-- ============================================================
-- Token rahasia per link tamu. Link baru: /<nama>~<token>.
-- Menutup celah "tebak nama tamu Wonogiri": acara terbatas
-- (Ngunduh Mantu) hanya terbuka lewat token, bukan lewat nama.
-- Tidak menghapus data. Link lama (/<nama>) tetap bisa dibuka
-- dan tetap terlacak, tetapi hanya menampilkan acara utama.
-- Jalankan SETELAH 009, SEBELUM deploy.
-- ============================================================

-- 1) Kolom token: baris lama di-backfill otomatis, baris baru dapat default.
alter table guest_links
  add column if not exists access_token text
  default substr(replace(gen_random_uuid()::text, '-', ''), 1, 16);

update guest_links
   set access_token = substr(replace(gen_random_uuid()::text, '-', ''), 1, 16)
 where access_token is null;

alter table guest_links alter column access_token set not null;

create unique index if not exists guest_links_access_token_key
  on guest_links (access_token);

-- 2) Token tidak boleh bisa dibaca dengan anon key (kunci publik).
--    Hak SELECT tabel dicabut lalu diberikan per kolom, kecuali access_token.
--    Dashboard admin membaca token lewat API server (service-role).
--    CATATAN: kolom baru di guest_links di masa depan perlu di-GRANT SELECT
--    ke anon bila ingin dibaca halaman tamu.
do $$
declare cols text;
begin
  select string_agg(quote_ident(column_name), ', ')
    into cols
    from information_schema.columns
   where table_schema = 'public'
     and table_name = 'guest_links'
     and column_name <> 'access_token';

  revoke select on guest_links from anon, authenticated;
  execute format('grant select (%s) on guest_links to anon, authenticated', cols);
end $$;

-- 3) Token tidak bisa diubah/diisi lewat anon key.
create or replace function guest_links_protect_category()
returns trigger
language plpgsql
as $$
begin
  if current_user in ('anon', 'authenticated') then
    if tg_op = 'INSERT' then
      new.category := 'kudus';
      new.access_token := substr(replace(gen_random_uuid()::text, '-', ''), 1, 16);
    else
      new.category := old.category;
      new.access_token := old.access_token;
    end if;
  end if;
  return new;
end;
$$;

-- Rollback (jika perlu):
--   grant select on guest_links to anon, authenticated;
--   drop index if exists guest_links_access_token_key;
--   alter table guest_links drop column if exists access_token;
