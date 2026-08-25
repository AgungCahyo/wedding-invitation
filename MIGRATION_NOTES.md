# Migration Notes for 007_rsvp_guest_link_migration.sql

## Pre-Migration Checklist

1. **Verify Environment**: Ensure you are running the migration against the correct database (check .env.local or your Supabase project).

2. **Check Existing Data**: Before running the migration, verify the current state of the `rsvp_guests` table.

   ```sql
   SELECT COUNT(*) as total_rows FROM rsvp_guests;
   SELECT COUNT(*) as null_guest_link_id FROM rsvp_guests WHERE guest_link_id IS NULL;
   ```

   - If the table is empty (0 rows), the migration will run safely as written.
   - If there are existing rows with `guest_link_id` NULL, you must populate the `guest_link_id` column before setting it to NOT NULL.

## Handling Existing Data

If there are existing rows in `rsvp_guests`, you need to backfill the `guest_link_id` by matching each RSVP to a guest link via `invitation_id` and `name`.

### Backfill Script

```sql
UPDATE rsvp_guests rg
SET guest_link_id = gl.id
FROM guest_links gl
WHERE rg.invitation_id = gl.invitation_id
  AND rg.name = gl.name
  AND rg.guest_link_id IS NULL;
```

After running the backfill, check for any rows that could not be matched:

```sql
SELECT rg.id, rg.invitation_id, rg.name
FROM rsvp_guests rg
WHERE rg.guest_link_id IS NULL;
```

These rows represent RSVPs that could not be definitively matched to a guest link by name. You must resolve these manually:
- Either update the RSVP name to match exactly a guest link name
- Or create a new guest link for that RSVP (if appropriate)
- Or delete the RSVP if it's a duplicate/test

Once all `guest_link_id` values are populated (no NULLs), you can proceed with the migration.

## Migration Steps

The migration script `007_rsvp_guest_link_migration.sql` performs the following:

1. Adds `guest_link_id` column (nullable) if it doesn't exist
2. Adds `updated_at` column (nullable) if it doesn't exist
3. Sets `guest_link_id` to NOT NULL (safe only if no NULLs exist)
4. Adds foreign key constraint to `guest_links.id`
5. Adds unique constraint on `(invitation_id, guest_link_id)`
6. Creates index on `guest_link_id` (optional but recommended)

## Post-Migration Verification

After running the migration, verify:

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

-- Verify no duplicates can be inserted (should fail)
-- This is a test; do not leave duplicate data in production
INSERT INTO rsvp_guests (invitation_id, guest_link_id, name, attendance)
VALUES (1, 1, 'Test', 'attending');
-- Second insert with same invitation_id and guest_link_id should fail due to unique constraint
```

## Safe Migration in Empty Table

If you have confirmed the `rsvp_guests` table is empty (as per our audit), you can run the migration as-is without any backfill.

Our audit confirmed zero existing RSVP rows in the development environment, making the NOT NULL constraint safe to apply immediately.

## Troubleshooting

If you encounter the error:
```
ERROR: 23502: column "guest_link_id" of relation "rsvp_guests" contains null values
```

This means there are still NULL values in `guest_link_id` when trying to set NOT NULL. Resolve by:
1. Running the backfill script above to populate missing values
2. Manually resolving any unmatched rows
3. Re-running the ALTER COLUMN ... SET NOT NULL command

## Final Note

Always back up your database before running migrations, especially when modifying constraints and columns that affect existing data.