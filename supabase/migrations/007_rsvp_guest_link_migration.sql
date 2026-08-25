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