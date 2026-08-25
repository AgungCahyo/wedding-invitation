# IMPORTANT: You Must Execute the Migration Script First

The error you're seeing:
```
ERROR: 42703: column "guest_link_id" does not exist
LINE 1: select id, invitation_id, guest_link_id
```

indicates that you are trying to query the `guest_link_id` column **before** running the migration script that adds this column.

## ✅ CORRECT PROCEDURE

### Step 1: Execute the Migration Script FIRST
You must run the SQL in `supabase/migrations/007_rsvp_guest_link_migration.sql` **before** trying to query the new column.

**To execute the migration:**
1. Go to your Supabase project dashboard
2. Navigate to the SQL editor
3. Copy and paste the entire content of `supabase/migrations/007_rsvp_guest_link_migration.sql`
4. Click "Run"

### Step 2: Then Verify
**Only after** the migration script has successfully executed, you can run verification queries like:
```sql
select id, invitation_id, guest_link_id from rsvp_guests limit 5;
```

## 📝 The Migration Script Includes:
```sql
-- Add guest_link_id column (nullable initially)
alter table rsvp_guests
  add column if not exists guest_link_id integer;
```

This line **adds** the column if it doesn't exist. You must execute this line (and the rest of the script) before the column exists to be queried.

## 🔍 If You Still Get Errors After Running the Migration

If you execute the migration script and still get this error when querying, then:
1. The migration script may have failed to execute completely
2. You may be connected to a different database than expected
3. There may be a typo in the column name

In that case:
1. Re-run the migration script and check for any error messages
2. Verify you're connected to the correct Supabase project
3. Double-check the exact column name in the migration script

## 📋 Migration Script Location
The complete, ready-to-execute migration script is in:
`supabase/migrations/007_rsvp_guest_link_migration.sql`

**You must execute this script in your Supabase SQL editor before the column will exist and be queryable.**

Once the migration is successfully executed, the column will exist and your verification queries will work.