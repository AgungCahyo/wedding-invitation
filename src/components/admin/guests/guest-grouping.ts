import {
  GUEST_CATEGORIES,
  GUEST_CATEGORY_LABELS,
  toGuestCategory,
  type GuestCategory,
} from "@/src/lib/guest-category";
import {
  GUEST_SIDES,
  GUEST_SIDE_LABELS,
  UNSET_SIDE_LABEL,
  toGuestSide,
  type GuestSide,
} from "@/src/lib/guest-side";

export type WaKey = "pending" | "sending" | "sent" | "failed" | "nophone";
export type GroupBy = "none" | "side" | "category" | "wa" | "opened";

export const WA_KEY_LABELS: Record<WaKey, string> = {
  pending: "Belum dikirim",
  sending: "Sedang dikirim",
  sent: "Terkirim",
  failed: "Gagal kirim",
  nophone: "Tanpa nomor WA",
};
const WA_ORDER: WaKey[] = ["pending", "failed", "sending", "sent", "nophone"];

export interface GuestFacets {
  /** null = belum diatur */
  side: GuestSide | null;
  category: GuestCategory;
  wa: WaKey;
  opened: boolean;
}

export interface GuestFilters {
  q: string;
  side: "all" | "unset" | GuestSide;
  category: "all" | GuestCategory;
  wa: "all" | WaKey;
  opened: "all" | "opened" | "unopened";
}

export const EMPTY_FILTERS: GuestFilters = {
  q: "",
  side: "all",
  category: "all",
  wa: "all",
  opened: "all",
};

export function hasActiveFilters(f: GuestFilters) {
  return (
    f.q.trim() !== "" ||
    f.side !== "all" ||
    f.category !== "all" ||
    f.wa !== "all" ||
    f.opened !== "all"
  );
}

export function buildFacets(
  link: { side?: unknown; category?: unknown; first_viewed_at?: string | null } | undefined,
  wa: { phone: string; status: string } | undefined,
): GuestFacets {
  const status = wa?.status;
  return {
    side: toGuestSide(link?.side),
    category: toGuestCategory(link?.category),
    wa: !wa?.phone
      ? "nophone"
      : status === "sent" || status === "sending" || status === "failed"
        ? status
        : "pending",
    opened: !!link?.first_viewed_at,
  };
}

export function matchesFilters(name: string, f: GuestFacets, filters: GuestFilters) {
  const q = filters.q.trim().toLowerCase();
  if (q && !name.toLowerCase().includes(q)) return false;
  if (filters.side !== "all" && (filters.side === "unset" ? f.side !== null : f.side !== filters.side)) return false;
  if (filters.category !== "all" && f.category !== filters.category) return false;
  if (filters.wa !== "all" && f.wa !== filters.wa) return false;
  if (filters.opened === "opened" && !f.opened) return false;
  if (filters.opened === "unopened" && f.opened) return false;
  return true;
}

export interface GuestGroup<T> {
  key: string;
  label: string;
  items: T[];
}

/** Bagi tamu ke grup sesuai `by`. Grup kosong tidak ditampilkan; urutan grup tetap. */
export function groupGuests<T>(
  items: T[],
  facetsOf: (item: T) => GuestFacets,
  by: GroupBy,
): GuestGroup<T>[] {
  if (by === "none") return [{ key: "all", label: "Semua tamu", items }];

  let defs: { key: string; label: string }[];
  let keyOf: (f: GuestFacets) => string;

  if (by === "side") {
    defs = [
      ...GUEST_SIDES.map((s) => ({ key: s, label: GUEST_SIDE_LABELS[s] })),
      { key: "unset", label: UNSET_SIDE_LABEL },
    ];
    keyOf = (f) => f.side ?? "unset";
  } else if (by === "category") {
    defs = GUEST_CATEGORIES.map((c) => ({ key: c, label: `Tamu ${GUEST_CATEGORY_LABELS[c]}` }));
    keyOf = (f) => f.category;
  } else if (by === "wa") {
    defs = WA_ORDER.map((k) => ({ key: k, label: WA_KEY_LABELS[k] }));
    keyOf = (f) => f.wa;
  } else {
    defs = [
      { key: "unopened", label: "Belum membuka undangan" },
      { key: "opened", label: "Sudah membuka undangan" },
    ];
    keyOf = (f) => (f.opened ? "opened" : "unopened");
  }

  const buckets = new Map<string, T[]>(defs.map((d) => [d.key, []]));
  for (const item of items) buckets.get(keyOf(facetsOf(item)))?.push(item);
  return defs
    .map((d) => ({ ...d, items: buckets.get(d.key) ?? [] }))
    .filter((g) => g.items.length > 0);
}
