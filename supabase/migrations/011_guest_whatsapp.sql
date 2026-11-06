-- ============================================================
-- Pengiriman link undangan via WhatsApp per tamu.
-- Jalankan SETELAH 009 & 010, SEBELUM deploy. Tidak menghapus data.
-- Kolom baru TIDAK di-GRANT ke anon (lihat 010): nomor HP & status
-- hanya bisa dibaca/ditulis lewat API admin (service-role).
-- ============================================================
alter table guest_links
  add column if not exists phone text,
  add column if not exists wa_message text,
  add column if not exists wa_status text not null default 'pending',
  add column if not exists wa_sent_at timestamptz,
  add column if not exists wa_message_id text,
  add column if not exists wa_error text;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'guest_links_wa_status_check') then
    alter table guest_links
      add constraint guest_links_wa_status_check
      check (wa_status in ('pending', 'sending', 'sent', 'failed'));
  end if;
end $$;

-- anon (kunci publik) tidak boleh mengisi/mengubah data WA lewat API Supabase.
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
    else
      new.category := old.category;
      new.access_token := old.access_token;
      new.phone := old.phone; new.wa_message := old.wa_message; new.wa_status := old.wa_status;
      new.wa_sent_at := old.wa_sent_at; new.wa_message_id := old.wa_message_id; new.wa_error := old.wa_error;
    end if;
  end if;
  return new;
end;
$$;

-- Rollback:
--   alter table guest_links drop column if exists phone, drop column if exists wa_message,
--     drop column if exists wa_status, drop column if exists wa_sent_at,
--     drop column if exists wa_message_id, drop column if exists wa_error;
