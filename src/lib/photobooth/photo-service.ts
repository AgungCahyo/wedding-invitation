import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "@/src/lib/supabase";

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

export function photoUrl(path: string): string {
  if (!supabase) return "";
  return supabase.storage.from(PHOTO_BUCKET).getPublicUrl(path).data.publicUrl;
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
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("photobooth_photos")
    .select(COLUMNS)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as PhotoRecord[];
}

export async function setPhotoStatus(id: string, status: PhotoStatus) {
  if (!supabase) throw new Error(NOT_CONFIGURED);
  // .select() so a policy that silently matches 0 rows is detectable.
  const { data, error } = await supabase
    .from("photobooth_photos")
    .update({ status })
    .eq("id", id)
    .select("id");
  if (error) throw new Error(error.message);
  if (!data || data.length === 0) throw new Error("Tidak ada baris yang berubah (cek login admin / policy).");
}

export async function deletePhoto(photo: PhotoRecord) {
  if (!supabase) throw new Error(NOT_CONFIGURED);
  const { data, error } = await supabase
    .from("photobooth_photos")
    .delete()
    .eq("id", photo.id)
    .select("id");
  if (error) throw new Error(error.message);
  if (!data || data.length === 0) throw new Error("Tidak ada baris yang terhapus (cek login admin / policy).");
  // Best effort: the DB row is what controls visibility.
  await supabase.storage.from(PHOTO_BUCKET).remove([photo.storage_path]);
}
