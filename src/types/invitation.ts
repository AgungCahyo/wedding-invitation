import type { TemplateKey } from "@/src/templates/template-registry";

/**
 * Canonical invitation shape (Step 11C).
 *
 * Mirrors the `invitations` table in Supabase (see
 * supabase/migrations/005_invitations_multitenancy.sql) column for
 * column: `id`/`slug`/`template` map to plain columns, everything
 * else maps to a JSONB column of the same name. This is also the
 * exact runtime shape `src/data/invitation.ts` has always produced,
 * so no component prop types change as part of this migration.
 */
export interface Invitation {
  id: string;
  slug: string;
  template: TemplateKey;

  meta: {
    title: string;
    description: string;
    url: string;
    ogImage: string;
  };

  cover: {
    image: string;
    label: string;
  };

  couple: {
    groom: Person;
    bride: Person;
  };

  wedding: {
    date: string;
    displayDate: string;
    timezone: string;
  };

  breather: {
    image: string;
    caption: string;
  };

  events: {
    akad: EventDetail;
    reception: EventDetail;
  };

  quote: {
    quranic: string;
    quranicTranslation: string;
    quranicReference: string;
  };

  story: StoryEntry[];

  gallery: GalleryImage[];

  rsvp: {
    deadline: string;
    deadlineNote: string;
    waNumber: string;
  };

  gift: {
    note: string;
    methods: GiftMethod[];
  };

  closing: {
    message: string;
    couple: string;
  };

  maker: {
    name: string;
    url: string;
  };

  audio: {
    src: string;
    lyricsSrc: string;
  };
}

interface Person {
  name: string;
  fullName: string;
  parents: string[];
  photo: string;
  socialLinks: { instagram?: string };
}

interface EventDetail {
  date: string;
  dayName: string;
  time: string;
  venue: string;
  address: string;
  mapsUrl: string;
}

interface StoryEntry {
  title: string;
  date: string;
  description: string;
}

interface GalleryImage {
  id: number;
  src: string;
  alt: string;
  aspect: "tall" | "square" | "wide";
}

interface GiftMethod {
  id: string;
  owner: "groom" | "bride";
  type: "bank" | "ewallet";
  label: string;
  accountNumber: string;
  accountHolder: string;
}