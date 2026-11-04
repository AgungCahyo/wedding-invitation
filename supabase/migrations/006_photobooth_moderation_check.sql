-- ============================================================
-- Checklist (bukan perubahan skema wajib)
-- Guest Photo Booth sekarang insert status = 'pending'.
-- Wall hanya menampilkan 'approved'. Moderasi lewat /api/admin/photos.
--
-- Jalankan SELECT di bawah di SQL Editor untuk verifikasi.
-- Jangan jalankan ALTER kecuali hasil SELECT menunjukkan masalah.
-- ============================================================

-- Policy tabel
select tablename, policyname, cmd
from pg_policies
where tablename = 'photobooth_photos';

-- Default status kolom
select column_name, column_default, data_type
from information_schema.columns
where table_name = 'photobooth_photos' and column_name = 'status';

-- Realtime publication
select * from pg_publication_tables
where tablename = 'photobooth_photos';

-- Opsional, hanya jika default kolom masih 'approved':
-- alter table photobooth_photos alter column status set default 'pending';
