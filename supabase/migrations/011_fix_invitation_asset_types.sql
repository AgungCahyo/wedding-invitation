-- ------------------------------------------------------------
-- 11. Fix invitation_assets type constraint to include breather and lyrics
-- ------------------------------------------------------------

do $$
begin
  -- Drop existing constraint if it exists
  if exists (select 1 from pg_constraint
             where conrelid = 'public.invitation_assets'::regclass
               and conname = 'invitation_assets_type_check') then
    alter table public.invitation_assets drop constraint invitation_assets_type_check;
  end if;

  -- Add corrected constraint
  alter table public.invitation_assets
    add constraint invitation_assets_type_check
    check (type in ('cover', 'gallery', 'groom', 'bride', 'story', 'music', 'og', 'breather', 'lyrics'));
end $$;