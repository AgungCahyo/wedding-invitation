/**
 * Couple name constants — eliminates 11+ occurrences of `name.split(" ")[0]` and the intentional bride nickname `[2]`.
 * Values are derived from invitation.ts at build time; this module is the single source of truth for display names.
 */

import { invitation } from "./invitation";

const { groom, bride } = invitation.couple;

/** First name of groom — used in 10 places (WA messages, PhotoWall, RSVP, etc.) */
export const groomFirstName = groom.name.split(" ")[0];

/** First name of bride — used in 10 places */
export const brideFirstName = bride.name.split(" ")[0];

/** Bride's nickname for PhotoBooth frame label — intentionally uses index [2] = "Tika" (not [0] = "Ayu") */
export const brideNickname = bride.name.split(" ")[2] ?? brideFirstName;

/** Short couple name "Agung & Tika" — used in calendar, WA messages, PhotoWall */
export const COUPLE_SHORT = `${groomFirstName} & ${brideNickname}`;

/** Short couple name with bride first name "Agung & Ayu" — used in most places */
export const COUPLE_SHORT_BRIDE_FIRST = `${groomFirstName} & ${brideFirstName}`;

/** Full couple name for formal contexts */
export const COUPLE_FULL = `${groom.name} & ${bride.name}`;