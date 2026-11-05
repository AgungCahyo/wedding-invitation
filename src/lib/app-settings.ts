import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Tiny key/value settings store (table `app_settings`, see migration 008).
 * Server-only: always called with the service-role client.
 */
export const PHOTO_AUTO_APPROVE_KEY = "photobooth_auto_approve";

/** Postgres 42P01 / PostgREST PGRST205 = the table has not been created yet. */
function isMissingTable(error: { code?: string; message?: string }): boolean {
  const msg = error.message ?? "";
  return (
    error.code === "42P01" ||
    error.code === "PGRST205" ||
    (/app_settings/i.test(msg) && /does not exist|schema cache/i.test(msg))
  );
}

export const SETTINGS_SETUP_MESSAGE =
  "Tabel pengaturan belum dibuat. Jalankan supabase/migrations/008_app_settings.sql di Supabase SQL Editor.";

export type BoolSetting = { value: boolean; ready: boolean };

/** Reads a boolean setting. Anything unexpected falls back to `false` (the safe default). */
export async function readBoolSetting(db: SupabaseClient, key: string): Promise<BoolSetting> {
  const { data, error } = await db
    .from("app_settings")
    .select("value")
    .eq("key", key)
    .maybeSingle();

  if (error) {
    if (isMissingTable(error)) return { value: false, ready: false };
    console.error(`Failed to read setting ${key}:`, error.message);
    return { value: false, ready: true };
  }
  return { value: data?.value === true, ready: true };
}

export async function writeBoolSetting(
  db: SupabaseClient,
  key: string,
  value: boolean
): Promise<{ ok: true } | { ok: false; error: string; status: number }> {
  const { error } = await db
    .from("app_settings")
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });

  if (error) {
    if (isMissingTable(error)) return { ok: false, error: SETTINGS_SETUP_MESSAGE, status: 503 };
    return { ok: false, error: error.message, status: 500 };
  }
  return { ok: true };
}
