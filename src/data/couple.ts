/**
 * Couple display-name helpers derived from invitation.ts.
 * Not yet adopted by callers (they still split names inline).
 * Keep resulting strings identical if/when this module is wired in.
 */

import { invitation } from "./invitation";

const { groom, bride } = invitation.couple;

export const groomFirstName = groom.name.split(" ")[0];

export const brideFirstName = bride.name.split(" ")[0];

/** PhotoBooth-style nickname: third token ("Tika"), not first ("Ayu"). */
export const brideNickname = bride.name.split(" ")[2] ?? brideFirstName;

export const COUPLE_SHORT = `${groomFirstName} & ${brideNickname}`;

export const COUPLE_SHORT_BRIDE_FIRST = `${groomFirstName} & ${brideFirstName}`;

/** Full couple name for formal contexts */
export const COUPLE_FULL = `${groom.name} & ${bride.name}`;