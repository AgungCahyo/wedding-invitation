/**
 * Unified moderation status — used by wishes, photos, and any future moderated content.
 */
export type ModerationStatus = "pending" | "approved" | "hidden";

export const MODERATION_STATUSES: readonly ModerationStatus[] = [
  "pending",
  "approved",
  "hidden",
] as const;

/** Back-compat aliases for existing code */
export type WishStatus = ModerationStatus;
export type PhotoStatus = ModerationStatus;

export const WISH_STATUSES = MODERATION_STATUSES;
export const PHOTO_STATUSES = MODERATION_STATUSES;