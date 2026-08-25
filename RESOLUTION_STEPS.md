# QUICK RESOLUTION STEPS FOR MIGRATION ERROR

If you encounter this error when running the migration:
```
ERROR: 23502: column "guest_link_id" of relation "rsvp_guests" contains null values
```

Follow these steps:

## 1. Check Existing Data
```sql
SELECT 
    COUNT(*) as total_rows,
    COUNT(*) FILTER (WHERE guest_link_id IS NULL) as null_count
FROM rsvp_guests;
```

## 2. If null_count > 0, Backfill the Data
```sql
UPDATE rsvp_guests rg
SET guest_link_id = gl.id
FROM guest_links gl
WHERE rg.invitation_id = gl.invitation_id
  AND rg.name = gl.name
  AND rg.guest_link_id IS NULL;
```

## 3. Verify No More Nulls
```sql
SELECT COUNT(*) as null_count 
FROM rsvp_guests 
WHERE guest_link_id IS NULL;
```
Should return 0.

## 4. Then Continue with Migration
Run these commands:
```sql
-- Make NOT NULL (if not already done)
ALTER TABLE rsvp_guests ALTER COLUMN guest_link_id SET NOT NULL;

-- Add foreign key constraint
ALTER TABLE rsvp_guests
ADD CONSTRAINT rsvp_guests_guest_link_id_fkey
FOREIGN KEY (guest_link_id)
REFERENCES guest_links (id);

-- Add unique constraint
ALTER TABLE rsvp_guests
ADD CONSTRAINT rsvp_guests_invitation_id_guest_link_id_key
UNIQUE (invitation_id, guest_link_id);

-- Add index (optional but recommended)
CREATE INDEX IF NOT EXISTS idx_rsvp_guests_guest_link_id 
ON rsvp_guests (guest_link_id);
```

## 5. Verify Success
```sql
-- Check constraints
SELECT conname, contype
FROM pg_constraint
WHERE conrelid = 'rsvp_guests'::regclass
  AND contype IN ('f', 'u', 'c');

-- Check columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'rsvp_guests'
  AND column_name IN ('guest_link_id', 'updated_at');
```

## 📝 Important Notes
- Always backup your database before running these operations
- If you find rows that still have NULL guest_link_id after the update, you need to manually resolve them (see MIGRATION_ERROR_GUIDANCE.md for details)
- Our audit showed zero existing RSVP data, so this error indicates your target database has existing data that wasn't in our audit environment

## 🔗 Full Guidance
See `MIGRATION_ERROR_GUIDANCE.md` in your project directory for detailed explanations and alternatives.

## ✅ Once Completed
After successfully running these steps:
- Duplicate RSVPs are prevented by unique constraint on (invitation_id, guest_link_id)
- Guests can update their RSVP responses (UPSERT behavior)
- Data integrity ensured via proper foreign key to guest_links
- Architecture compliance: ONE INVITATION + ONE GUEST LINK = ONE CURRENT RSVP

All implementation work is complete. The solution is ready for use once these database steps are executed.