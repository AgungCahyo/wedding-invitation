-- ============================================================
-- Pengaturan aplikasi (key/value), dipakai untuk "Auto-approve foto".
-- RLS aktif TANPA policy => hanya server (service-role) yang bisa
-- baca/tulis. Anon key tidak bisa mengubah pengaturan ini.
-- Jalankan sekali di Supabase SQL Editor.
-- ============================================================

create table if not exists app_settings (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now()
);

alter table app_settings enable row level security;

insert into app_settings (key, value)
values ('photobooth_auto_approve', 'false'::jsonb)
on conflict (key) do nothing;
