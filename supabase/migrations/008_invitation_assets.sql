-- ------------------------------------------------------------
-- 8. invitation_assets table for Supabase Storage integration
-- ------------------------------------------------------------

-- Create the invitation_assets table
create table if not exists public.invitation_assets (
  id uuid primary key default gen_random_uuid(),

  invitation_id uuid not null
    references public.invitations (id)
    on delete cascade,

  type text not null
    check (type in ('cover', 'gallery', 'groom', 'bride', 'story', 'music', 'og')),

  storage_path text not null,

  sort_order integer null,

  alt_text text null,

  mime_type text not null,

  file_size bigint null,

  original_filename text null,

  created_at timestamptz not null default now(),

  updated_at timestamptz not null default now()
);

-- Create indexes for efficient querying
create index if not exists idx_invitation_assets_invitation_id
  on public.invitation_assets (invitation_id);

create index if not exists idx_invitation_assets_invitation_id_type
  on public.invitation_assets (invitation_id, type);

create index if not exists idx_invitation_assets_invitation_id_type_sort
  on public.invitation_assets (invitation_id, type, sort_order);

-- Enable Row Level Security
alter table public.invitation_assets enable row level security;

-- Drop any existing policies (clean slate)
do $$
declare
  policy_record record;
begin
  for policy_record in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = 'invitation_assets'
  loop
    execute format(
      'drop policy if exists %I on %I.%I',
      policy_record.policyname,
      policy_record.schemaname,
      policy_record.tablename
    );
  end loop;
end;
$$;

-- Public read access for asset metadata (needed for resolving asset IDs to URLs)
create policy invitation_assets_public_select
  on public.invitation_assets for select
  to anon, authenticated
  using (true);

-- Member-only write access to own invitation's assets
create policy invitation_assets_member_insert
  on public.invitation_assets for insert
  to authenticated
  with check (
    exists (
      select 1 from public.invitation_members
      where invitation_members.invitation_id = invitation_assets.invitation_id
        and invitation_members.user_id = auth.uid()
        and invitation_members.role in ('owner', 'admin', 'editor')
    )
  );

create policy invitation_assets_member_update
  on public.invitation_assets for update
  to authenticated
  using (
    exists (
      select 1 from public.invitation_members
      where invitation_members.invitation_id = invitation_assets.invitation_id
        and invitation_members.user_id = auth.uid()
        and invitation_members.role in ('owner', 'admin', 'editor')
    )
  )
  with check (
    exists (
      select 1 from public.invitation_members
      where invitation_members.invitation_id = invitation_assets.invitation_id
        and invitation_members.user_id = auth.uid()
        and invitation_members.role in ('owner', 'admin', 'editor')
    )
  );

create policy invitation_assets_member_delete
  on public.invitation_assets for delete
  to authenticated
  using (
    exists (
      select 1 from public.invitation_members
      where invitation_members.invitation_id = invitation_assets.invitation_id
        and invitation_members.user_id = auth.uid()
        and invitation_members.role in ('owner', 'admin')
    )
  );