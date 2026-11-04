import { ADMIN_PIN_KEY, ADMIN_SESSION_KEY, ADMIN_EXPIRED_EVENT } from "./admin-session";

/**
 * Call a PIN-protected /api/admin/* route. On 401 the stored session is
 * cleared and AdminAuth is told to show the lock screen again, instead of
 * leaving the admin stuck on a dashboard where every action fails.
 */
export async function adminFetch<T = unknown>(
  endpoint: string,
  method: string,
  body?: object
): Promise<T> {
  const pin = sessionStorage.getItem(ADMIN_PIN_KEY) ?? "";
  const res = await fetch(endpoint, {
    method,
    cache: "no-store",
    headers: { "content-type": "application/json", "x-admin-pin": pin },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = (await res.json().catch(() => ({}))) as { error?: string };

  if (res.status === 401) {
    sessionStorage.removeItem(ADMIN_PIN_KEY);
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    window.dispatchEvent(new Event(ADMIN_EXPIRED_EVENT));
  }
  if (!res.ok) throw new Error(json.error ?? `Permintaan gagal (${res.status}).`);
  return json as T;
}
