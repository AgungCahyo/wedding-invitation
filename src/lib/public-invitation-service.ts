import type { RSVPFormData } from "../types/rsvp";

export interface PublicWish {
  id: number;
  name: string;
  message: string;
  date: string;
  isPinned: boolean;
}

export interface PublicGuestTouch {
  relation: string | null;
  personal_note: string | null;
  is_featured: boolean;
}

async function requestJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);
  const payload = (await response.json().catch(() => null)) as
    | { error?: string }
    | null;

  if (!response.ok) {
    throw new Error(payload?.error || "Permintaan gagal. Silakan coba lagi.");
  }

  return payload as T;
}

export async function fetchPublicWishes(invitationSlug: string) {
  const result = await requestJson<{ success: true; data: PublicWish[] }>(
    `/api/invitations/${encodeURIComponent(invitationSlug)}/wishes`
  );
  return { success: result.success, data: result.data };
}

export async function submitPublicWish(
  invitationSlug: string,
  name: string,
  message: string
) {
  return requestJson<{ success: true }>(
    `/api/invitations/${encodeURIComponent(invitationSlug)}/wishes`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, message }),
    }
  );
}

export async function submitPublicRSVP(invitationSlug: string, guestSlug: string, data: RSVPFormData) {
  return requestJson<{ success: true }>(
    `/api/invitations/${encodeURIComponent(invitationSlug)}/rsvp`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ guestSlug, ...data }),
    }
  );
}

export async function fetchPublicGuestTouch(
  invitationSlug: string,
  guestSlug: string
): Promise<{ success: boolean; data: PublicGuestTouch | null }> {
  const response = await fetch(
    `/api/invitations/${encodeURIComponent(invitationSlug)}/guest/${encodeURIComponent(guestSlug)}`
  );

  if (response.status === 404) {
    return { success: false, data: null };
  }

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(payload?.error || "Permintaan gagal. Silakan coba lagi.");
  }

  const payload = await response.json();
  return { success: payload.success, data: payload.data };
}