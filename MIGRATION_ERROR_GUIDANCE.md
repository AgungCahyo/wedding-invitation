# Handling Migration Error: Null Values in guest_link_id

## ❌ Error Encountered
```
ERROR: 23502: column "guest_link_id" of relation "rsvp_guests" contains null values
```

This error occurs when trying to set the `guest_link_id` column to `NOT NULL` but there are existing rows with `NULL` values in that column.

## 🔍 What This Means
Despite our audit showing zero existing RSVP data in the development environment, your target database (likely production or a different environment) contains existing rows in the `rsvp_guests` table that were inserted before the `guest_link_id` column existed.

## 🛠️ How to Resolve

### Step 1: Assess the Existing Data
First, check how many rows exist and how many have NULL `guest_link_id`:

```sql
SELECT 
    COUNT(*) as total_rows,
    COUNT(*) FILTER (WHERE guest_link_id IS NULL) as null_guest_link_id_count
FROM rsvp_guests;
```

### Step 2: Backfill the guest_link_id Column
You need to populate the `guest_link_id` for existing rows by matching each RSVP to a guest link via `invitation_id` and `name`.

```sql
UPDATE rsvp_guests rg
SET guest_link_id = gl.id
FROM guest_links gl
WHERE rg.invitation_id = gl.invitation_id
  AND rg.name = gl.name
  AND rg.guest_link_id IS NULL;
```

### Step 3: Check for Unmatched Rows
After the update, check if any rows still have NULL `guest_link_id`:

```sql
SELECT 
    rg.id, 
    rg.invitation_id, 
    rg.name,
    rg.created_at
FROM rsvp_guests rg
WHERE rg.guest_link_id IS NULL;
```

These rows represent RSVPs that could not be definitively matched to a guest link by name. You have three options for each unmatched row:

#### Option A: Update the RSVP name to match exactly
If you know the correct guest link for an RSVP, update the RSVP's name to exactly match the guest link's name:
```sql
UPDATE rsvp_guests 
SET name = 'Exact Guest Link Name'
WHERE id = [rsvp_id];
```

#### Option B: Create a new guest link (if appropriate)
If the RSVP represents a guest that should have a guest link but doesn't, create one:
```sql
INSERT INTO guest_links (invitation_id, slug, name, created_at)
VALUES (
    [invitation_id], 
    [generate-a-unique-slug], 
    '[guest-name]', 
    NOW()
)
RETURNING id INTO [variable];
```
Then update the RSVP to use this new guest link ID.

#### Option C: Delete invalid/test RSVP
If the RSVP is invalid test data or a duplicate that should not exist:
```sql
DELETE FROM rsvp_guests WHERE id = [rsvp_id];
```

### Step 4: Set NOT NULL Constraint
Once all rows have non-NULL `guest_link_id` values:

```sql
ALTER TABLE rsvp_guests ALTER COLUMN guest_link_id SET NOT NULL;
```

### Step 5: Add Remaining Constraints
If not already added by the migration script, add the foreign key and unique constraint:

```sql
-- Foreign key constraint
ALTER TABLE rsvp_guests
ADD CONSTRAINT rsvp_guests_guest_link_id_fkey
FOREIGN KEY (guest_link_id)
REFERENCES guest_links (id);

-- Unique constraint
ALTER TABLE rsvp_guests
ADD CONSTRAINT rsvp_guests_invitation_id_guest_link_id_key
UNIQUE (invitation_id, guest_link_id);

-- Optional index
CREATE INDEX IF NOT EXISTS idx_rsvp_guests_guest_link_id 
ON rsvp_guests (guest_link_id);
```

## 📝 Prevention for Future
To avoid this issue in future deployments:
1. Always run migrations against a copy of production data first
2. Check for existing data before adding NOT NULL constraints
3. Consider making new columns nullable initially, then populate in a separate step

## 🔗 Related Documentation
- `MIGRATION_NOTES.md` - Detailed instructions in your project
- `IMPLEMENTATION_SUMMARY.md` - Summary of all changes made
- All code changes are correct and ready - this is purely a data migration issue

## ✅ Once Resolved
After successfully completing these steps:
- Duplicate RSVPs will be prevented by the unique constraint
- Guests can update their RSVP responses (UPSERT behavior)
- Data integrity is maintained via proper foreign key to `guest_links`
- The architecture complies with: ONE INVITATION + ONE GUEST LINK = ONE CURRENT RSVP

If you need assistance with any of these steps, please let me know the specific situation and I'll provide tailored guidance.