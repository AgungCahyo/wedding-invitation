-- ============================================================
-- Optional: allow guest INSERT of pending photos via the anon key.
-- Not required if /api/photobooth/submit is deployed (service-role).
--
-- Typical production policy was:
--   WITH CHECK (consent = true AND status = 'approved')
-- which rejects the new moderation flow (status = pending).
-- ============================================================

drop policy if exists "Guests can insert consented photos" on photobooth_photos;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'photobooth_photos'
      and policyname = 'Guests can insert pending photos'
  ) then
    create policy "Guests can insert pending photos"
      on photobooth_photos
      for insert
      with check (consent = true and status = 'pending');
  end if;
end $$;
