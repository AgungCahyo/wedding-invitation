import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "@/src/lib/supabase";
import { adminFetch } from "@/src/lib/admin-fetch";

export const PHOTO_BUCKET = "photobooth";
export type PhotoStatus = "pending" | "approved" | "hidden";

export interface PhotoRecord {
  id: string;
  created_at: string;
  guest_name: string;
  storage_path: string;
  status: PhotoStatus;
}

const COLUMNS = "id, created_at, guest_name, storage_path, status";
const NOT_CONFIGURED = "Fitur kirim foto belum aktif. Silakan hubungi pengelola undangan.";

/** Public URL. With `downloadName` the browser saves the file instead of opening it. */
export function photoUrl(path: string, downloadName?: string): string {
  if (!supabase) return "";
  return supabase.storage
    .from(PHOTO_BUCKET)
    .getPublicUrl(path, downloadName ? { download: downloadName } : undefined).data.publicUrl;
}

/** "Wedding-Budi-Santoso-2026-12-04-1930.jpg" */
export function photoFileName(photo: PhotoRecord): string {
  const guest =
    photo.guest_name
      .normalize("NFKD")
      .replace(/[^\w\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .slice(0, 40) || "Tamu";
  const d = new Date(photo.created_at);
  const pad = (n: number) => String(n).padStart(2, "0");
  const stamp = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`;
  return `Wedding-${guest}-${stamp}.jpg`;
}

/**
 * Upload a guest's photo and register it for the event screen.
 * Callers must have the guest's explicit consent — the DB also rejects
 * rows without `consent = true`.
 */
export async function uploadPhoto(blob: Blob, guestName: string): Promise<PhotoRecord> {
  if (!supabase || !isSupabaseConfigured) throw new Error(NOT_CONFIGURED);

  const id = crypto.randomUUID();
  const storage_path = `${id}.jpg`;

  const up = await supabase.storage
    .from(PHOTO_BUCKET)
    .upload(storage_path, blob, { contentType: "image/jpeg", upsert: false });
  if (up.error) throw new Error(up.error.message);

  const row = {
    id,
    guest_name: guestName.trim().slice(0, 60) || "Tamu",
    storage_path,
    consent: true,
    status: "approved" as PhotoStatus,
  };
  const ins = await supabase.from("photobooth_photos").insert(row);
  if (ins.error) throw new Error(ins.error.message);

  return { ...row, created_at: new Date().toISOString() };
}

/** Approved photos, newest first — what the event screen shows. */
export async function fetchApprovedPhotos(limit = 120): Promise<PhotoRecord[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("photobooth_photos")
    .select(COLUMNS)
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []) as PhotoRecord[];
}

/**
 * Live updates for the event screen. Reports inserts/updates/deletes so
 * a photo hidden by the admin disappears from the screen within seconds.
 */
export function subscribePhotos(handlers: {
  onUpsert: (photo: PhotoRecord, isNew: boolean) => void;
  onRemove: (id: string) => void;
}): () => void {
  if (!supabase) return () => {};
  const client = supabase;

  const channel: RealtimeChannel = client
    .channel("photobooth-wall")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "photobooth_photos" },
      (payload) => {
        if (payload.eventType === "DELETE") {
          const id = (payload.old as { id?: string }).id;
          if (id) handlers.onRemove(id);
          return;
        }
        const photo = payload.new as PhotoRecord;
        if (photo.status === "approved") handlers.onUpsert(photo, payload.eventType === "INSERT");
        else handlers.onRemove(photo.id);
      }
    )
    .subscribe();

  return () => {
    void client.removeChannel(channel);
  };
}

/* ------------------------------- admin (auth) ------------------------------ */

export async function fetchAllPhotosForModeration(): Promise<PhotoRecord[]> {
  const { photos } = await adminFetch<{ photos: PhotoRecord[] }>("/api/admin/photos", "GET");
  return photos;
}

export async function setPhotoStatus(id: string, status: PhotoStatus) {
  await adminFetch("/api/admin/photos", "PATCH", { id, status });
}

export async function deletePhoto(photo: PhotoRecord) {
  await adminFetch("/api/admin/photos", "DELETE", { id: photo.id });
}
