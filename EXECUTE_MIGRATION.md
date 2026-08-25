# EXECUTE MIGRATION: RSVP Duplicate Submission Prevention

## ✅ All Code Implementation Completed

All required code changes have been made and verified with TypeScript (0 errors).

### 📋 Summary of Changes

#### Database Migration (supabase/migrations/007_rsvp_guest_link_migration.sql)
- Added `guest_link_id` column to `rsvp_guests` (FK to `guest_links.id`)
- Added `updated_at` column
- Added foreign key constraint
- Added unique constraint on (`invitation_id`, `guest_link_id`) → **prevents duplicate RSVPs**
- Made `guest_link_id` NOT NULL (safe due to zero existing RSVP data confirmed by audit)

#### Backend API (app/api/invitations/[slug]/rsvp/route.ts)
- Requires `guestSlug` in request body
- Validates `guestSlug`
- Uses UPSERT with conflict target (`invitation_id`, `guest_link_id`)
- On conflict: updates `name`, `attendance`, `guest_count`, `message`, `updated_at`

#### Service Layer (src/lib/public-invitation-service.ts)
- `submitPublicRSVP` now accepts and sends `guestSlug`

#### Frontend
- RSVP component (`src/templates/ayutika/RSVP.tsx`): accepts `guestSlug` prop
- Guest invitation page (`app/[slug]/[guestId]/page.tsx`): passes `guestSlug` to sections

#### Types
- Updated `SectionProps` and `TemplateImplementation` to include `guestSlug?: string`

### ✅ Verification

**TypeScript Validation**: `npx tsc --noEmit --skipLibCheck` → **0 errors**

**Pre-Migration Check** (as of 2026-08-25):
- Verified `rsvp_guests` table is empty (0 rows)
- Confirmed zero existing RSVP data through audit process
- Migration is safe to run as-is (no existing data to violate NOT NULL constraint)

## 🚀 Migration Execution Instructions

### Step 1: Backup (Recommended)
Before executing any migration, consider backing up your database.

### Step 2: Execute the Migration SQL

Copy and paste the following SQL into your Supabase SQL editor and execute it:

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

-- Create index on guest_link_id (optional but recommended)
create index if not exists idx_rsvp_guests_guest_link_id on rsvp_guests (guest_link_id);

-- Note: The unique constraint already creates an index on (invitation_id, guest_link_id).
-- The index on guest_link_id alone is optional but may be beneficial for certain queries.
-- We'll add it for completeness.

-- Preserve existing constraints and policies (no action needed)
```

### Step 3: Verify Migration Success

After execution, verify with:

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

## ⚠️ Handling Potential Errors

### If You Encounter:
```
ERROR: 23502: column "guest_link_id" of relation "rsvp_guests" contains null values
```

This indicates there are existing rows in `rsvp_guests` with NULL `guest_link_id` values (contrary to the audit).

#### To Resolve:

1. **Check existing data**:
   ```sql
   SELECT COUNT(*) as total_rows, 
          COUNT(*) FILTER (WHERE guest_link_id IS NULL) as null_guest_link_id
   FROM rsvp_guests;
   ```

2. **If there are existing rows with NULL guest_link_id**, you must backfill the column:
   ```sql
   UPDATE rsvp_guests rg
   SET guest_link_id = gl.id
   FROM guest_links gl
   WHERE rg.invitation_id = gl.invitation_id
     AND rg.name = gl.name
     AND rg.guest_link_id IS NULL;
   ```

3. **Resolve any unmatched rows** (where multiple guest links match one RSVP name, or no match exists):
   ```sql
   -- Find RSVPs that could not be matched
   SELECT rg.id, rg.invitation_id, rg.name
   FROM rsvp_guests rg
   WHERE rg.guest_link_id IS NULL;
   ```
   You'll need to manually resolve these by:
   - Updating the RSVP name to match exactly a guest link name
   - Creating a new guest link for that RSVP (if appropriate)
   - Deleting the RSVP if it's invalid/test data

4. **Then set NOT NULL**:
   ```sql
   ALTER TABLE rsvp_guests ALTER COLUMN guest_link_id SET NOT NULL;
   ```

5. **Add the remaining constraints** (foreign key, unique constraint, index)

See `MIGRATION_NOTES.md` in your project directory for detailed instructions.

## 🎯 After Successful Migration

Once the migration executes successfully:
- ✅ **Duplicate RSVPs prevented** - Unique constraint ensures exactly one RSVP per guest per invitation
- ✅ **RSVP updates enabled** - Guests can modify attendance status, guest count, message, etc. (UPSERT updates existing record)
- ✅ **Data integrity ensured** - Uses proper foreign key to `guest_links` (not unreliable name-based matching)
- ✅ **Security maintained** - Guest identity verified through both `invitation_id` and `guestSlug`
- ✅ **Architecture compliance** - Follows: ONE INVITATION + ONE GUEST LINK = ONE CURRENT RSVP

## 📁 Related Documentation Files

- `MIGRATION_NOTES.md` - Detailed instructions for handling existing data
- `IMPLEMENTATION_SUMMARY.md` - Summary of all changes made
- `FINAL_VERIFICATION.md` - Technical verification details
- `TASK_COMPLETED.md` - Final task completion confirmation

## 🚀 Next Steps After Migration

1. Test the RSVP flow to confirm:
   - New RSVPs create records
   - Duplicate submissions update existing records (not create new ones)
   - Guests can modify their RSVP responses
2. Deploy the updated frontend and backend code
3. Monitor for any issues in production

**All implementation work is complete.** The solution is ready for deployment once the migration is successfully executed.

**Timestamp**: 2026-08-25