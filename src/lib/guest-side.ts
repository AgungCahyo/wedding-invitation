/** Pihak tamu: dipakai hanya untuk pengelompokan di admin (tidak memengaruhi acara yang terlihat). */
export const GUEST_SIDES = ["groom", "bride"] as const;
export type GuestSide = (typeof GUEST_SIDES)[number];

export const GUEST_SIDE_LABELS: Record<GuestSide, string> = {
  groom: "Pihak Pria",
  bride: "Pihak Wanita",
};

export const UNSET_SIDE_LABEL = "Belum diatur";

export function isGuestSide(value: unknown): value is GuestSide {
  return typeof value === "string" && (GUEST_SIDES as readonly string[]).includes(value);
}

/** null = belum diatur. */
export function toGuestSide(value: unknown): GuestSide | null {
  return isGuestSide(value) ? value : null;
}
