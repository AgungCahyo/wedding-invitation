/**
 * Wish domain types.
 */
import type { ModerationStatus } from "./moderation";

export type WishStatus = ModerationStatus;

export interface WishRecord {
  id: number;
  name: string;
  message: string;
  created_at: string;
  status: WishStatus;
  is_pinned: boolean;
}

/** Shape returned by GET /api/wishes (client-safe). */
export interface PublicWish {
  id: number;
  name: string;
  message: string;
  created_at: string;
  is_pinned: boolean;
}