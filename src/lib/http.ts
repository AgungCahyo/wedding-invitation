/**
 * Shared HTTP utilities — consolidates repeated `fetch` + JSON parsing patterns.
 */

/**
 * Safely parse JSON, returning empty object on failure (instead of throwing).
 * Used by client services that call API routes.
 */
export async function parseJsonSafe(res: Response): Promise<Record<string, unknown>> {
  try {
    return await res.json();
  } catch {
    return {};
  }
}

/**
 * Parse JSON and throw if response not ok.
 * Used by client services (rsvp-service, game-score-service, photo-service, admin-fetch).
 */
export async function requestJson<T>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(input, init);
  const json = await parseJsonSafe(res);

  if (!res.ok) {
    const message = (json.error as string) ?? `HTTP ${res.status}`;
    throw new Error(message);
  }

  return json as T;
}

/**
 * POST JSON helper for client services.
 */
export async function postJson<T>(
  url: string,
  body: unknown,
  options?: RequestInit
): Promise<T> {
  return requestJson<T>(url, {
    method: "POST",
    headers: { "content-type": "application/json", ...options?.headers },
    body: JSON.stringify(body),
    ...options,
  });
}

/**
 * GET JSON helper for client services.
 */
export async function getJson<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  return requestJson<T>(url, {
    method: "GET",
    ...options,
  });
}

/**
 * PATCH JSON helper for client services.
 */
export async function patchJson<T>(
  url: string,
  body: unknown,
  options?: RequestInit
): Promise<T> {
  return requestJson<T>(url, {
    method: "PATCH",
    headers: { "content-type": "application/json", ...options?.headers },
    body: JSON.stringify(body),
    ...options,
  });
}

/**
 * DELETE JSON helper for client services.
 */
export async function deleteJson<T>(
  url: string,
  body?: unknown,
  options?: RequestInit
): Promise<T> {
  return requestJson<T>(url, {
    method: "DELETE",
    headers: { "content-type": "application/json", ...options?.headers },
    body: body ? JSON.stringify(body) : undefined,
    ...options,
  });
}