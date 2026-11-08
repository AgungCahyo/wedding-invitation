-- ============================================================
-- Pihak tamu (pria / wanita) untuk pengelompokan di dashboard admin.
-- Terpisah dari `category` (Kudus/Wonogiri) yang mengatur acara yang
-- terlihat, jadi tidak mengubah visibilitas acara apa pun.
-- Aman dijalankan berulang, tidak menghapus data. Jalankan SETELAH 011.
-- NULL = belum diatur. Kolom baru TIDAK di-GRANT ke anon (lihat 010).
-- ============================================================
alter table guest_links
  add column if not exists side text;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'guest_links_side_check') then
    alter table guest_links
      add constraint guest_links_side_check
      check (side is null or side in ('groom', 'bride'));
  end if;
end $$;

-- anon/authenticated tidak boleh mengisi/mengubah `side` lewat API Supabase.
create or replace function guest_links_protect_category()
returns trigger
language plpgsql
as $$
begin
  if current_user in ('anon', 'authenticated') then
    if tg_op = 'INSERT' then
      new.category := 'kudus';
      new.access_token := substr(replace(gen_random_uuid()::text, '-', ''), 1, 16);
      new.phone := null; new.wa_message := null; new.wa_status := 'pending';
      new.wa_sent_at := null; new.wa_message_id := null; new.wa_error := null;
      new.side := null;
    else
      new.category := old.category;
      new.access_token := old.access_token;
      new.phone := old.phone; new.wa_message := old.wa_message; new.wa_status := old.wa_status;
      new.wa_sent_at := old.wa_sent_at; new.wa_message_id := old.wa_message_id; new.wa_error := old.wa_error;
      new.side := old.side;
    end if;
  end if;
  return new;
end;
$$;

-- Rollback:
--   alter table guest_links drop constraint if exists guest_links_side_check;
--   alter table guest_links drop column if exists side;
