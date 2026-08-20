-- ============================================================
-- Migration: Fix missing UPDATE/DELETE policies on `wishes`
--
-- Root cause of "delete/approve/pin doesn't work, data reverts on reload":
-- the original setup only created INSERT + SELECT policies for `wishes`.
-- With RLS enabled and no UPDATE/DELETE policy, Supabase/PostgREST returns
-- a SUCCESSFUL response but silently affects 0 rows — no error is thrown,
-- so the UI has no way to know the change didn't actually happen. This
-- affects every admin action that touches an existing wish: approve,
-- hide, pin/unpin, delete.
--
-- Run this in Supabase Dashboard → SQL Editor → New Query.
-- Safe to run even if you're not sure these policies already exist.
-- ============================================================

do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'wishes' and policyname = 'Allow update for all'
  ) then
    create policy "Allow update for all" on wishes for update using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where tablename = 'wishes' and policyname = 'Allow delete for all'
  ) then
    create policy "Allow delete for all" on wishes for delete using (true);
  end if;
end $$;

-- Sanity check — should list 4 policies total for `wishes`
-- (insert, select, update, delete) after running this.
select tablename, policyname, cmd from pg_policies where tablename = 'wishes';
