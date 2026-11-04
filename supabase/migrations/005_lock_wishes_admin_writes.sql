-- ============================================================
-- Migration: remove public UPDATE/DELETE on `wishes`
--
-- Migration 004 opened UPDATE/DELETE to everyone ("using (true)") so the
-- admin panel could work with the anon key. That means ANYONE who has the
-- anon key (it ships in the browser bundle) could edit or delete every wish.
--
-- Admin moderation now goes through /api/admin/wishes, which uses the
-- service-role key (bypasses RLS). Public users only need INSERT + SELECT.
--
-- ORDER MATTERS: deploy the new code first, then run this.
-- Run in Supabase Dashboard → SQL Editor.
-- ============================================================

drop policy if exists "Allow update for all" on wishes;
drop policy if exists "Allow delete for all" on wishes;

-- Should list only insert + select now.
select tablename, policyname, cmd from pg_policies where tablename = 'wishes';
