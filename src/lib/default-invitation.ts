import type { Invitation, TemplateKey } from "@/src/types/invitation";

/**
 * The row shape supplied to Supabase when creating an invitation. `id` and
 * timestamps are database-generated, while every public invitation field is
 * present and compatible with the canonical Invitation contract.
 */
export type DefaultInvitationInsert = Omit<Invitation, "id">;

export interface CreateDefaultInvitationInput {
  slug: string;
  template: TemplateKey;
  title: string;
  description?: string;
  url?: string;
  ogImage?: string;
}

/**
 * A self-contained neutral SVG, intentionally embedded rather than using a
 * project image path. The existing local wedding images are personal assets
 * and must never be copied into a newly created invitation.
 */
const neutralImageSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1600" viewBox="0 0 1200 1600" role="img" aria-label="Placeholder undangan pernikahan">
  <defs>
    <linearGradient id="background" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f8f4ee"/>
      <stop offset="100%" stop-color="#e8ddd0"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="1600" fill="url(#background)"/>
  <rect x="96" y="96" width="1008" height="1408" rx="12" fill="none" stroke="#a98467" stroke-width="4" opacity="0.65"/>
  <path d="M600 610c-80-95-235-7-158 112l158 178 158-178c77-119-78-207-158-112Z" fill="none" stroke="#a98467" stroke-width="12"/>
  <text x="600" y="1020" text-anchor="middle" font-family="serif" font-size="50" fill="#4b3b2e">UNDANGAN PERNIKAHAN</text>
  <text x="600" y="1090" text-anchor="middle" font-family="sans-serif" font-size="28" fill="#6c5a4b">Detail acara akan segera diperbarui</text>
</svg>`;

export const NEUTRAL_IMAGE = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(neutralImageSvg)}`;

/** A valid, zero-duration WAV data URI. It is silent and contains no private music. */
const SILENT_AUDIO = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=";

/** A valid LRC data URI; the lyric rail can load it without a missing-file request. */
const NEUTRAL_LYRICS = "data:text/plain;charset=UTF-8,%5B00%3A00.00%5DMusik%20akan%20ditambahkan";

const DEFAULT_DATE = "2099-12-31";
const DEFAULT_DISPLAY_DATE = "31 Desember 2099";
const DEFAULT_TIMEZONE = "Asia/Jakarta";

/**
 * Creates a complete, render-safe canonical invitation payload for a new row.
 *
 * The factory deliberately contains no Ayutika names, photos, account details,
 * or music. Inline neutral data URIs avoid inventing asset paths or relying on
 * external placeholder services before invitation-specific assets are uploaded.
 */
export function createDefaultInvitation(
  input: CreateDefaultInvitationInput
): DefaultInvitationInsert {
  const title = input.title.trim() || "Undangan Pernikahan";
  const description = input.description?.trim() || "Detail undangan pernikahan akan segera diperbarui.";

  return {
    slug: input.slug,
    template: input.template,
    meta: {
      title,
      description,
      url: input.url?.trim() || "",
      ogImage: input.ogImage?.trim() || NEUTRAL_IMAGE,
    },
    cover: {
      image: NEUTRAL_IMAGE,
      label: "THE WEDDING OF",
    },
    couple: {
      groom: {
        name: "Mempelai Pria",
        fullName: "Mempelai Pria",
        parents: ["Keluarga Mempelai Pria"],
        photo: NEUTRAL_IMAGE,
        socialLinks: {},
      },
      bride: {
        name: "Mempelai Wanita",
        fullName: "Mempelai Wanita",
        parents: ["Keluarga Mempelai Wanita"],
        photo: NEUTRAL_IMAGE,
        socialLinks: {},
      },
    },
    wedding: {
      date: DEFAULT_DATE,
      displayDate: DEFAULT_DISPLAY_DATE,
      timezone: DEFAULT_TIMEZONE,
    },
    breather: {
      image: NEUTRAL_IMAGE,
      caption: "",
    },
    events: {
      akad: {
        date: DEFAULT_DATE,
        dayName: "Kamis",
        time: "09:00 – 11:00 WIB",
        venue: "Lokasi acara akan segera diperbarui",
        address: "Indonesia",
        mapsUrl: "https://www.google.com/maps",
      },
      reception: {
        date: DEFAULT_DATE,
        dayName: "Kamis",
        time: "19:00 – 21:00 WIB",
        venue: "Lokasi acara akan segera diperbarui",
        address: "Indonesia",
        mapsUrl: "https://www.google.com/maps",
      },
    },
    quote: {
      quranic: "",
      quranicTranslation: "",
      quranicReference: "",
    },
    story: [
      {
        title: "Persiapan Pernikahan",
        date: "",
        description: "Kisah perjalanan kedua mempelai akan segera dibagikan.",
      },
    ],
    // Ayutika Story reads gallery[1].src without a guard, so at least two
    // usable images are required even though Gallery itself supports any count.
    gallery: [
      {
        id: 1,
        src: NEUTRAL_IMAGE,
        alt: "Placeholder galeri undangan pernikahan 1",
        aspect: "tall",
      },
      {
        id: 2,
        src: NEUTRAL_IMAGE,
        alt: "Placeholder galeri undangan pernikahan 2",
        aspect: "square",
      },
    ],
    rsvp: {
      deadline: "",
      deadlineNote: "Silakan konfirmasi kehadiran setelah detail acara diperbarui",
      waNumber: "",
    },
    gift: {
      note: "Kehadiran dan doa Anda adalah hadiah terindah bagi kami.",
      methods: [],
    },
    closing: {
      message: "Terima kasih atas doa dan kehadiran Anda.",
      couple: title,
    },
    maker: {
      name: "Undangan Digital",
      url: "",
    },
    audio: {
      src: SILENT_AUDIO,
      lyricsSrc: NEUTRAL_LYRICS,
    },
  };
}
