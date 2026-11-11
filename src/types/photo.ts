/**
 * Photo domain types.
 */
import type { ModerationStatus } from "./moderation";

export type PhotoStatus = ModerationStatus;

export const PHOTO_COLUMNS = "id, created_at, guest_name, storage_path, status";

export interface PhotoRecord {
  id: string;
  created_at: string;
  guest_name: string;
  storage_path: string;
  status: PhotoStatus;
}

/** Shape returned by GET /api/admin/photo-settings. */
export interface PhotoSettings {
  autoApprove: boolean;
  /** false until migration 008 (app_settings table) has been run. */
  ready: boolean;
}
