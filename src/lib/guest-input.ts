import { normalizeIdPhone } from "@/src/lib/phone";

export interface ParsedGuest {
  name: string;
  /** Nomor WhatsApp dalam format internasional (628…), atau null bila tidak diisi. */
  phone: string | null;
}

// "Nama, 0812…" — pemisah eksplisit (koma, titik koma, tab, garis tegak).
const EXPLICIT = /^(.*?)\s*[,;\t|]\s*(\+?\d[\d\s\-().]*)$/;
// "Nama 0812…" — tanpa pemisah, tapi ekor baris jelas berupa nomor (≥ 8 karakter).
const TRAILING = /^(.*\S)\s+(\+?\d[\d\s\-().]{7,})$/;

/**
 * Membaca input generator link: satu tamu per baris, `nama, nomor`.
 * Nomor boleh kosong (cukup nama). Baris dengan nomor yang tidak valid
 * dikembalikan di `invalid` supaya admin bisa memperbaikinya, bukan diam-diam
 * dibuang. Nama yang sama di beberapa baris digabung menjadi satu tamu.
 */
export function parseGuestLines(raw: string): { guests: ParsedGuest[]; invalid: string[] } {
  const byName = new Map<string, ParsedGuest>();
  const invalid: string[] = [];

  for (const line of raw.split("\n")) {
    const text = line.trim();
    if (!text) continue;

    const m = text.match(EXPLICIT) ?? text.match(TRAILING);
    // Koma/titik koma yang menggantung di ujung ("Andi,") bukan bagian nama.
    const name = (m ? m[1] : text).replace(/[\s,;|]+$/, "").trim();
    const phoneRaw = m ? m[2].trim() : "";

    const phone = phoneRaw ? normalizeIdPhone(phoneRaw) : null;
    if (!name || (phoneRaw && !phone)) {
      invalid.push(text);
      continue;
    }

    const prev = byName.get(name);
    byName.set(name, { name, phone: phone ?? prev?.phone ?? null });
  }

  return { guests: [...byName.values()], invalid };
}
