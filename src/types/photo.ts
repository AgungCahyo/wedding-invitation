/**
 * Photo domain types.
 */
import type { ModerationStatus } from "./moderation";

export type PhotoStatus = ModerationStatus;

export interface PhotoRecord {
  id: string;
  created_at: string;
  guest_name: string;
  storage_path: string;
  status: PhotoStatus;
}

export interface PhotoSettings {
  frame_enabled: boolean;
  frame_id: string;
  filters_enabled: boolean;
  default_filter: string;
  auto_approve: boolean;
  max_upload_size_mb: number;
}