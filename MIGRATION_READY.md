# Migration Ready to Run

The migration file `supabase/migrations/007_rsvp_guest_link_migration.sql` has been prepared and is ready to be executed.

## Pre-Run Verification

We have verified that:
- The `rsvp_guests` table is empty (0 rows)
- The migration is safe to run as-is (no existing data to violate NOT NULL constraint)

## Migration SQL

```sql
-- ------------------------------------------------------------
-- 7. Add guest_link_id and updated_at to rsvp_guests for unique RSVP per guest
-- ------------------------------------------------------------

-- Add guest_link_id column (nullable initially)
alter table rsvp_guests
  add column if not exists guest_link_id integer;

-- Add updated_at column if it doesn't exist
alter table rsvp_guests
  add column if not exists updated_at timestamptz;

-- Make guest_link_id NOT NULL (safe because table is empty)
alter table rsvp_guests
  alter column guest_link_id set not null;

-- Add foreign key constraint to guest_links
alter table rsvp_guests
  add constraint rsvp_guests_guest_link_id_fkey
  foreign key (guest_link_id)
  references guest_links (id);

-- Add unique constraint on (invitation_id, guest_link_id)
alter table rsvp_guests
  add constraint rsvp_guests_invitation_id_guest_link_id_key
  unique (invitation_id, guest_link_id);

-- Create index on guest_link_id (though the unique constraint already indexes both columns,
-- an additional index on guest_link_id alone may help for queries filtering only by guest_link_id)
create index if not exists idx_rsvp_guests_guest_link_id on rsvp_guests (guest_link_id);

-- Note: The unique constraint already creates an index on (invitation_id, guest_link_id).
-- The index on guest_link_id alone is optional but may be beneficial for certain queries.
-- We'll add it for completeness.

-- Preserve existing constraints and policies (no action needed)
```

## How to Run

1. Go to your Supabase project dashboard
2. Navigate to the SQL editor
3. Paste the entire migration script above
4. Click "Run"

## Post-Run Verification

After running the migration, you can verify by checking:

```sql
-- Check that the constraints are in place
SELECT conname, contype
FROM pg_constraint
WHERE conrelid = 'rsvp_guests'::regclass
  AND contype IN ('f', 'u', 'c');

-- Check the column definitions
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'rsvp_guests'
  AND column_name IN ('guest_link_id', 'updated_at');
```

## Notes

- The migration assumes the `rsvp_guests` table is empty. If you have existing data, you must backfill the `guest_link_id` column before setting it to NOT NULL.
- See `MIGRATION_NOTES.md` for detailed instructions on handling existing data.

Once the migration is run successfully, the RSVP duplicate submission prevention feature will be fully operational.