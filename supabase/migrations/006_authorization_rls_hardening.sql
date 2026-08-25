-- Step 11E: database authorization for invitation-owned data.
-- Apply this migration only after creating the first admin in Supabase Auth
-- and provisioning that user's invitation_members row.

create table if not exists public.invitation_members (
  invitation_id uuid not null references public.invitations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('owner', 'admin', 'editor')),
  created_at timestamptz not null default now(),
  constraint invitation_members_invitation_user_key unique (invitation_id, user_id)
);

create index if not exists idx_invitation_members_user_id
  on public.invitation_members (user_id);

alter table public.invitation_members enable row level security;
alter table public.guest_links enable row level security;
alter table public.rsvp_guests enable row level security;
alter table public.wishes enable row level security;

-- Existing policy names are not guaranteed across environments. Remove all
-- policies on these tables before installing the explicit policy set below.
do $$
declare
  policy_record record;
begin
  for policy_record in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in ('invitations', 'invitation_members', 'guest_links', 'rsvp_guests', 'wishes')
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

create or replace function public.is_invitation_member(
  target_invitation_id uuid,
  allowed_roles text[]
)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select exists (
    select 1
    from public.invitation_members as member
    where member.invitation_id = target_invitation_id
      and member.user_id = auth.uid()
      and member.role = any (allowed_roles)
  );
$$;

revoke all on function public.is_invitation_member(uuid, text[]) from public, anon;
grant execute on function public.is_invitation_member(uuid, text[]) to authenticated;

create policy invitations_public_select
  on public.invitations for select
  to anon, authenticated
  using (true);

create policy invitation_members_self_select
  on public.invitation_members for select
  to authenticated
  using (user_id = auth.uid());

create policy invitation_members_owner_insert
  on public.invitation_members for insert
  to authenticated
  with check (
    public.is_invitation_member(invitation_id, array['owner']::text[])
  );

create policy invitation_members_owner_update
  on public.invitation_members for update
  to authenticated
  using (public.is_invitation_member(invitation_id, array['owner']::text[]))
  with check (public.is_invitation_member(invitation_id, array['owner']::text[]));

create policy invitation_members_owner_delete
  on public.invitation_members for delete
  to authenticated
  using (public.is_invitation_member(invitation_id, array['owner']::text[]));

create policy wishes_public_approved_select
  on public.wishes for select
  to anon, authenticated
  using (status = 'approved');

create policy wishes_member_select
  on public.wishes for select
  to authenticated
  using (
    public.is_invitation_member(invitation_id, array['owner', 'admin', 'editor']::text[])
  );

create policy wishes_member_update
  on public.wishes for update
  to authenticated
  using (public.is_invitation_member(invitation_id, array['owner', 'admin']::text[]))
  with check (public.is_invitation_member(invitation_id, array['owner', 'admin']::text[]));

create policy wishes_member_delete
  on public.wishes for delete
  to authenticated
  using (public.is_invitation_member(invitation_id, array['owner', 'admin']::text[]));

create policy rsvp_member_select
  on public.rsvp_guests for select
  to authenticated
  using (
    public.is_invitation_member(invitation_id, array['owner', 'admin', 'editor']::text[])
  );

create policy guest_links_member_select
  on public.guest_links for select
  to authenticated
  using (
    public.is_invitation_member(invitation_id, array['owner', 'admin', 'editor']::text[])
  );

create policy guest_links_member_insert
  on public.guest_links for insert
  to authenticated
  with check (public.is_invitation_member(invitation_id, array['owner', 'admin', 'editor']::text[]));

create policy guest_links_member_update
  on public.guest_links for update
  to authenticated
  using (public.is_invitation_member(invitation_id, array['owner', 'admin', 'editor']::text[]))
  with check (public.is_invitation_member(invitation_id, array['owner', 'admin', 'editor']::text[]));

create policy guest_links_member_delete
  on public.guest_links for delete
  to authenticated
  using (public.is_invitation_member(invitation_id, array['owner', 'admin']::text[]));

-- The public API uses the server-only service-role client for public writes,
-- guest lookup, and view tracking. No direct anon table INSERT is required.
create or replace function public.record_guest_view(
  guest_invitation_id uuid,
  guest_slug text
)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  update public.guest_links
  set
    view_count = coalesce(view_count, 0) + 1,
    first_viewed_at = coalesce(first_viewed_at, now()),
    last_viewed_at = now()
  where invitation_id = guest_invitation_id
    and slug = guest_slug;
end;
$$;

revoke all on function public.record_guest_view(uuid, text) from public, anon, authenticated;
grant execute on function public.record_guest_view(uuid, text) to service_role;