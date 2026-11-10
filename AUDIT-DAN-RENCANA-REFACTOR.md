# Audit Codebase & Rencana Refactoring — wedding-invitation

Repo: `AgungCahyo/wedding-invitation` (branch `main`, commit `52d2de0 "mini game"`)
Status dokumen: **Tahap A (Audit) + Tahap B (Rencana) selesai. Belum ada satu baris kode pun yang diubah.**

---

## 0. Baseline (kondisi sebelum refactor)

| Pemeriksaan | Hasil |
|---|---|
| `tsc --noEmit` | ✅ Lolos, 0 error |
| `eslint` | ❌ **1 error**, 9 warning (rinci di temuan H-11) |
| `next build` | ⚠️ Gagal **di sandbox audit** karena `next/font/google` tidak bisa mengunduh Cormorant Garamond & DM Sans (jaringan sandbox dibatasi). Bukan bug proyek. Untuk Tahap D, build akan dijalankan dengan mock respons font (`NEXT_FONT_GOOGLE_MOCKED_RESPONSES`), sehingga yang dibandingkan hanya efek refactor |
| Test otomatis | ❌ Tidak ada (tidak ada file test, tidak ada script `test`) |
| Circular dependency (`madge`) | 1 siklus: `components/RSVP.tsx ↔ lib/rsvp-service.ts` |
| Kode tidak terpakai (`ts-prune`) | 15 export, 2 file yatim (rinci di H-9) |
| Ukuran | 116 file TS/TSX/CSS/SQL, ≈15.200 baris |

Karena tidak ada test, strategi "refactor tanpa mengubah perilaku" bertumpu pada: type check, ESLint, perbandingan daftar route hasil build sebelum/sesudah, madge, diff yang kecil per fase, dan (bila disetujui) test karakterisasi untuk fungsi murni. Lihat bagian 5.

---

## 1. Peta arsitektur saat ini

```
app/                         Next.js App Router
  page.tsx                   Undangan umum (/)            ← client, komposisi section
  [guest]/page.tsx           Undangan per tamu            ← client, komposisi section (≈85% sama dengan page.tsx)
  [guest]/opengraph-image / twitter-image, opengraph-image / twitter-image   (4 file hampir identik)
  admin/page.tsx             Admin (PIN)
  booth/, photowall/         PhotoBooth langsung / layar acara
  calendar.ics/route.ts      Kalender .ics per kategori tamu
  api/
    admin/{auth,guest-links,photos,photo-settings,wishes,wa}/route.ts   (PIN, service-role)
    admin/calendar.ics/route.ts     ← duplikat persis calendar.ics, tidak direferensikan siapa pun
    rsvp, events, game-scores, photobooth/submit                         (publik, service-role)

src/
  components/                30 file section undangan + ui/ + admin/ + photobooth/  (datar)
  context/MusicContext.tsx
  hooks/                     useCamera, useGuestEvents, useSyncedLyrics, useTheme
  data/                      invitation.ts, theme.ts (625 baris), blur-placeholders.ts
  lib/                       campuran: pure util, service klien (anon key), helper server, domain, photobooth/
  server/                    events.ts, guest-access.ts, wa-compose.ts, whatsapp.ts   (server-only, hanya komentar)
supabase/migrations/         004–013 (001–003 tidak ada di repo)
```

Batas client/server: tidak ada import `src/server/*` atau `lib/admin-server` dari komponen client (sudah dicek, **bersih**). Namun batas itu hanya dijaga komentar, tidak oleh tooling.

---

## 2. Temuan

Legenda risiko perubahan: 🟢 rendah (type-only / pindah murni) · 🟡 sedang · 🔴 tinggi.
Kolom **Persetujuan**: ⛔ = tidak akan dikerjakan sebelum kamu setuju (menyentuh perilaku, URL, dependency, atau konfigurasi).

### 🔴 CRITICAL — berpotensi bug / kesalahan arsitektur

**C-1. Dependency melingkar `RSVP.tsx ↔ rsvp-service.ts`**
- File: `src/components/RSVP.tsx`, `src/lib/rsvp-service.ts`
- Masalah: service di `lib` meng-import type `RSVPFormData` dari komponen UI, sedangkan komponen meng-import service. Arah dependensi terbalik (lib → components).
- Solusi: pindahkan `RSVPFormData` ke `src/types/rsvp.ts`; kedua file mengimpor dari sana.
- Risiko: 🟢 (type-only, dihapus saat kompilasi). Persetujuan: tidak perlu.

**C-2. Batas client/server tidak ditegakkan dan helper server tersebar di `lib/`**
- File: `src/lib/admin-server.ts`, `src/lib/app-settings.ts` (keduanya server-only hanya lewat komentar), `src/server/*`
- Masalah: `serviceClient()` dan `fail()` ada di `admin-server.ts` tetapi dipakai juga oleh route **publik** (`rsvp`, `game-scores`, `photobooth/submit`, `server/guest-access`). Nama berbohong (bukan "admin"), lokasi berbohong (di `lib`, folder yang juga diimpor client). Satu import keliru dari komponen client akan membawa `SUPABASE_SERVICE_ROLE_KEY`-path ke bundle tanpa peringatan.
- Solusi: `src/server/db.ts` (`serviceClient`), `src/server/http.ts` (`fail`), `src/server/admin-guard.ts` (`guard`), `src/server/app-settings.ts`; update import. Tambahkan `import "server-only"` di modul `src/server/*`.
- Risiko: 🟡 (banyak import berubah, tetapi mekanis dan dijaga `tsc`). ⛔ Hanya bagian `import "server-only"`: butuh menambah paket `server-only` (dependency baru, sangat kecil). Pemindahan file sendiri tidak perlu persetujuan.

**C-3. Fallback `NEXT_PUBLIC_ADMIN_PIN` untuk PIN admin**
- File: `src/lib/admin-server.ts` (baris `process.env.ADMIN_PIN || process.env.NEXT_PUBLIC_ADMIN_PIN`, dan cek yang sama di `guard`)
- Masalah: variabel berawalan `NEXT_PUBLIC_` memang dirancang untuk dikirim ke browser. Jika PIN masih di-set lewat nama itu di Vercel, nilainya ikut tertanam di JS yang bisa dibaca siapa saja bila ada kode client yang membacanya, dan secara konvensi PIN rahasia tidak boleh bernama `NEXT_PUBLIC_*`. Saat ini hanya kode server yang membaca, jadi belum bocor, tetapi jebakannya ada.
- Solusi yang direkomendasikan: hapus fallback, wajibkan `ADMIN_PIN`.
- Risiko: 🔴 (mengubah konfigurasi: jika deployment produksi masih memakai nama lama, login admin langsung gagal). **⛔ Tidak dikerjakan tanpa persetujuan.** Alternatif aman yang bisa dikerjakan tanpa persetujuan: hanya mendokumentasikan di `.env.example` bahwa `ADMIN_PIN` adalah nama yang benar.

**C-4. Error ESLint `react-hooks/set-state-in-effect` di `app/page.tsx:33`**
- Masalah: `setShowOpening(false)` / `setAutoOpenCamera(true)` dipanggil sinkron di dalam `useEffect` untuk deep-link `?camera=open` (QR di lokasi acara).
- Solusi: ekstrak ke hook kecil `useCameraDeepLink()` dengan pola `startTransition` seperti yang sudah dipakai di `PhotoBooth.tsx`. Perilaku (membuka kamera, menghapus query dari URL lewat `replaceState`) harus identik.
- Risiko: 🟡 (menyentuh alur QR PhotoBooth). Akan diverifikasi dengan membaca urutan state dan, bila disetujui, test karakterisasi. ⛔ Minta konfirmasi karena PhotoBooth masuk daftar "jangan dirusak".

---

### 🟠 HIGH — duplikasi & struktur yang perlu segera dibenahi

**H-1. Komposisi undangan ditulis dua kali**
- File: `app/page.tsx` (82 baris) dan `app/[guest]/page.tsx` (126 baris)
- Masalah: 14 import dan urutan section yang sama (`Couple → Quote → EventDetails → Countdown → ImageBreak → Story → Gallery → RSVP → Wishes → CatchTheLove → DigitalGift → Closing → Footer → LyricsRail → FloatingBar`) di dua tempat. Menambah/menggeser satu section harus dilakukan dua kali.
- Perbedaan nyata yang **wajib dipertahankan**:
  - `[guest]` punya blok sambutan "Kepada Yth." + `relation` + `personal_note`, memanggil `recordGuestView` dan `fetchGuestLinkBySlug`.
  - `[guest]` mengirim `guestName` ke `RSVP`, `Wishes`, `PhotoBooth`; `CatchTheLove` hanya menerima nama bila slug ada.
  - `/` memakai deep-link `?camera=open` dan merender `PhotoBooth` **di luar** `<motion.main>` dengan `autoOpen`; `[guest]` merender `PhotoBooth` **di dalam** `<motion.main>` di antara `CatchTheLove` dan `DigitalGift`.
  - Urutan `Opening → main` dan `AnimatePresence mode="wait"` sama.
- Solusi: `src/components/invitation/InvitationShell.tsx` (Music provider + Opening + transisi `main`) dan `InvitationSections.tsx` (urutan section bersama, menerima `guestName?` dan slot untuk blok sambutan serta `PhotoBooth`). Kedua page menjadi tipis.
- Risiko: 🟡 (urutan DOM dan posisi `PhotoBooth` harus identik). Verifikasi dengan membandingkan pohon JSX sebelum/sesudah.

**H-2. Status moderasi didefinisikan tiga kali**
- File: `lib/wishes-service.ts` (`WishStatus`), `lib/photobooth/photo-service.ts` (`PhotoStatus`), array `STATUSES = ["pending","approved","hidden"]` di `api/admin/wishes/route.ts` dan `api/admin/photos/route.ts`.
- Solusi: `src/types/moderation.ts` → `MODERATION_STATUSES` + `ModerationStatus`; `WishStatus`/`PhotoStatus` menjadi alias agar pemakai tidak perlu diubah massal. Route memakai satu validator.
- Risiko: 🟢.

**H-3. Tipe kehadiran (attendance) didefinisikan 4 kali**
- File: `api/rsvp/route.ts` (`Attendance`), `lib/rsvp-service.ts` (`GuestResponse.attendance` dan `event_responses` literal), `components/RSVP.tsx` (`RSVPFormData.attendance` ditambah `""`), `lib/events-types.ts` (`EventAttendance`).
- Solusi: `types/rsvp.ts`: `Attendance`, `EventResponses = Record<string, Attendance>`, `GuestResponse`, `RSVPFormData`. `EventAttendance` menjadi alias.
- Risiko: 🟢.

**H-4. Boilerplate route admin berulang ±10 handler**
- File: `api/admin/{wishes,photos,guest-links,wa}/route.ts`
- Pola berulang: `const g = await guard(req); if (!g.db) return g.res!;` → `req.json().catch(() => ({}))` → validasi → query → "tidak ada baris terpengaruh → 404" → `NextResponse.json({ ok: true })`.
- Solusi: helper di `src/server/http.ts` (`readJson`, `okJson`) dan `src/server/admin-guard.ts` (`withAdminDb(handler)`), serta `requireAffected(data, message)` untuk pola "0 baris → 404". Pesan error dan status code **tidak berubah satu karakter pun**.
- Risiko: 🟡 (kontrak API harus identik). Verifikasi dengan membandingkan respons tiap cabang validasi.

**H-5. Tiga panel admin memakai state machine yang sama**
- File: `admin/wishes/WishesManagement.tsx`, `admin/photos/PhotoManagement.tsx`, `admin/rsvp/RSVPManagement.tsx`
- Pola berulang: `isLoading` + `error` + `load()` dengan `useCallback`, `useEffect(() => startTransition(() => load()))` (workaround lint), `busyId`, `err instanceof Error ? err.message : "Gagal …"` (**23 kemunculan di 7 file**), teks "Memuat…", "Belum ada …", tombol "Muat ulang".
- Solusi: `lib/errors.ts` → `getErrorMessage(err, fallback)`; hook `useAdminResource(fetcher, fallbackMessage)` yang mengembalikan `{ data, setData, isLoading, error, setError, reload }`; komponen kecil `AdminLoading`, `AdminEmpty`, `AdminErrorBanner`. Teks tampilan tidak berubah.
- Risiko: 🟡 (menyentuh 3 komponen aktif, tampilan harus identik). Tidak menggabungkan ketiga panel; hanya mengekstrak pola yang betul-betul sama.

**H-6. `GuestLinkGenerator.tsx` — 1.405 baris, 29 `useState`, `renderRow` ±300 baris**
- Tanggung jawab bercampur: form generator & parsing, daftar + filter + pengelompokan, pilih massal, personalisasi (relasi/catatan), kontak WA (simpan nomor & pesan), pengiriman WA massal dengan progres, tandai terkirim, hapus.
- Ada `WaRow`, `GeneratedLink`, `GuestLinkRecord`, `GuestFilters`, `GuestFacets` yang menggambarkan entitas tamu yang sama dengan bentuk berbeda.
- Solusi (bertahap, **pindahkan dulu, jangan ubah logika**): (a) ekstrak `Chip`, `Badge`, `GuestRow` (isi `renderRow`), `GuestFilterBar`, `BulkActionBar`, `GeneratorForm`; (b) ekstrak hook `useGuestLinks`, `useWhatsAppOutbox`, `useGuestSelection`; (c) bentuk `GuestLinkGenerator` menjadi orkestrator ≈250–350 baris.
- Risiko: 🔴 — ini file paling berisiko dan paling berharga. Dikerjakan **terakhir**, dalam beberapa commit kecil, tiap langkah diverifikasi (`tsc`, `eslint`, build). ⛔ Minta persetujuan sebelum fase ini dimulai.

**H-7. `PhotoBoothModal.tsx` — 769 baris**
- Berisi: konstanta, cooldown kirim (`localStorage`), `ensureFonts`, kamera, countdown, capture/compose, upload, share/download, UI. `sleep()` juga diduplikasi di `api/admin/wa/route.ts`.
- Solusi **terbatas** (karena PhotoBooth masuk daftar "jangan dirusak"): hanya ekstrak logika non-render yang murni (`cooldown`, `ensureFonts`, penamaan file, `sleep`) ke `lib/photobooth/`. Pipeline kamera, filter, frame, kompresi JPEG 0.93, dan alur upload **tidak disentuh**.
- Risiko: 🟡. ⛔ Minta persetujuan; boleh ditunda tanpa kehilangan manfaat utama.

**H-8. Nama depan pasangan diturunkan di 11 tempat dengan `name.split(" ")[0]`**
- File: `RSVPManagement`, `GuestLinkGenerator`, `DigitalGift`, `PhotoWall` (2×), `Closing`, `server/wa-compose`, `server/events`, `lib/og/invitation-og`, `lib/calendar`, dan `PhotoBoothModal`.
- ⚠️ **Jebakan yang sengaja dipertahankan:** `PhotoBoothModal.tsx:32` memakai `couple.bride.name.split(" ")[2]` (= "Tika") untuk label frame, sedangkan semua tempat lain memakai indeks `[0]` (= "Ayu"). Itu terlihat seperti inkonsistensi tetapi hasilnya berbeda dan kemungkinan disengaja. **Tidak akan "diseragamkan"**; akan dibuat konstanta bernama eksplisit (mis. `brideNickname`) dengan nilai tetap sama, atau dibiarkan.
- Solusi: `src/data/couple.ts` (`firstName`, `COUPLE_SHORT`, `COUPLE_SHORT_BRIDE_FIRST`) untuk 10 tempat yang memang memakai `[0]`.
- Risiko: 🟢 (string keluaran identik; diverifikasi dengan membandingkan nilai).

**H-9. Kode mati yang sudah diverifikasi 0 referensi**
- File yatim: `components/LyricsTester.tsx` (216 baris, pemakaian di `app/page.tsx` hanya komentar JSX), `components/ui/FloralAccent.tsx` (alias 1 baris ke `Flourish`).
- Export tak terpakai: `calendar.ts` (`buildGoogleCalendarUrl`, `downloadICSFile`, `buildWazeUrl`, `buildAppleMapsUrl`), `motion.ts` (`fadeIn`, `staggerContainer`), `wishes-service.ts` (`getWishesCount`), `theme.ts` (`colors`), `filters-gl.ts` (`__allowSoftwareGl`), `invitation.ts` (`fonts`, `Invitation`).
- CSS tak terpakai: `.section-divider`, `.font-molani` (dan berkas font `Mollani-Regular.ttf`, yang juga di-`.gitignore` namun tetap ter-track).
- Aset tak terpakai: `public/{file,globe,next,vercel,window}.svg` (boilerplate create-next-app).
- Catatan: `__allowSoftwareGl` kemungkinan hook untuk pengujian/debug; `LyricsTester` kemungkinan alat bantu pengembangan. Karena aturan "jangan hapus tanpa memastikan", daftar ini disajikan untuk dikonfirmasi.
- Risiko: 🟢 bila 0 referensi (sudah dicek lewat `ts-prune` dan `grep`). ⛔ Penghapusan file/aset/CSS menunggu konfirmasi; unused variable ESLint (H-11) boleh langsung dibersihkan.

**H-10. Route `api/admin/calendar.ics` adalah salinan persis `calendar.ics` dan tidak direferensikan**
- File: `app/api/admin/calendar.ics/route.ts` vs `app/calendar.ics/route.ts` (isi identik, termasuk komentar).
- Masalah: berada di bawah `/api/admin/*` tetapi **tidak** memakai `guard` PIN, jadi menyesatkan; satu-satunya yang dipakai frontend adalah `/calendar.ics` (`useGuestEvents`).
- Aturan proyek: URL tidak boleh berubah. Menghapus berarti `/api/admin/calendar.ics` tidak ada lagi (jika ada kalender/link lama yang menunjuk ke sana, akan 404).
- Solusi aman: pertahankan URL, hapus duplikasi isi — file admin hanya `export const dynamic = "force-dynamic"; export { GET } from "@/app/calendar.ics/route";`.
- Risiko: 🟡. ⛔ Minta keputusan: pertahankan URL lewat re-export (rekomendasi), atau hapus.

**H-11. Hasil ESLint (1 error + 9 warning)**
| File | Baris | Isu |
|---|---|---|
| `app/page.tsx` | 21 | `PhotoBoothModal` di-import tapi tidak dipakai |
| `app/page.tsx` | 33 | **error** `set-state-in-effect` (lihat C-4) |
| `components/Couple.tsx` | 13 | param `index` tidak dipakai |
| `components/Opening.tsx` | 26, 60, 61 | `NameLine`, `brideName`, `groomName` tidak dipakai |
| `components/Story.tsx` | 11 | `gallery` tidak dipakai |
| `components/ThemeSwitcher.tsx` | 8 | `formatRotationInterval` di-import tidak dipakai |
| `admin/guests/GuestLinkGenerator.tsx` | 158 | `mode` tidak dipakai |
| `photobooth/PhotoWall.tsx` | 457 | `<img>` (disengaja untuk layar acara, sudah ada pola `eslint-disable` di tempat lain) |

---

### 🟡 MEDIUM — konsistensi & maintainability

**M-1. Struktur folder**
- Masalah: `src/components/` datar berisi 30 file yang mencampur section undangan, provider (`ClientLayout`), game (`CatchTheLove`), alat dev (`LyricsTester`); `src/lib/` mencampur util murni, service klien (anon key), helper server, dan domain. Tidak ada `types/` maupun `constants/`.
- Rencana target (bertahap, bukan "big bang"):
```
src/
  types/            guest.ts · rsvp.ts · moderation.ts · wish.ts · photo.ts · event.ts · admin.ts
  constants/        storage-keys.ts · events.ts (nama event window)
  components/
    invitation/     InvitationShell, InvitationSections (baru, dari H-1)
    sections/       Couple, Quote, EventDetails, Countdown, Story, Gallery, RSVP, Wishes, DigitalGift, Closing, Footer, ImageBreak, Opening
    features/       catch-love/, photobooth/ (tetap), admin/ (tetap)
    ui/             (tetap)
  server/           db.ts · http.ts · admin-guard.ts · app-settings.ts · events.ts · guest-access.ts · wa-compose.ts · whatsapp.ts
  lib/              util murni + service klien
```
- Pemindahan `components/*` → `components/sections/*` melibatkan ±14 file dan hanya perubahan path import (dijaga `tsc`). Rekomendasi: kerjakan **setelah** fase duplikasi/type selesai, sebagai commit terpisah. ⛔ Minta persetujuan untuk pemindahan section (routing Next.js tidak terpengaruh karena semua import memakai alias `@/src/...` dan tidak ada dynamic import berbasis path; sudah dicek).

**M-2. Penamaan**
- *Nama file:* `lib/` kebab-case (`guest-link-service.ts`), `hooks/` camelCase `useX.ts`, `components/` PascalCase — ketiganya konsisten **dalam foldernya**. Penyimpangan: `components/admin/shared/escapeCSV.ts` & `formatDate.ts` (camelCase di folder util), `components/admin/guests/guest-grouping.ts` (kebab di folder komponen), `lib/events-types.ts` (seharusnya `types/event.ts`), `lib/floating-bar.ts` (berisi class Tailwind **dan** nama event window; bukan util "floating-bar").
- *Handler:* admin memakai `handleX` (`handleDelete`, `handleStatus`); PhotoBooth memakai kata kerja polos (`capture`, `retake`, `download`, `share`, `pick`) dan `onPickFile`; `GuestLinkGenerator` campuran (`toggleSelected`, `mark`, `putContact`, `savePhone`). Konvensi: `handleX` untuk handler yang dipasang ke JSX, `onX` untuk prop callback.
- *Nama ambigu/terlalu pendek:* `g` (hasil `guard`, ±10 file), `m`, `r`, `c` di loop, `mark`, `Row` (di route WA, sebetulnya `GuestLinkRow`), `Wish` (model UI, bukan `WishRecord`), `initialForm` (konstanta modul → `INITIAL_FORM`), `NAMES`, `EYEBROW`, `mode` (tidak dipakai).
- *Service:* `fetchX` / `get X` / `saveX` / `setX` / `updateX` / `togglePinWish` / `upsertGuestLinks` dipakai bergantian untuk operasi sejenis (`getWishesCount`, `getRSVPStats` vs `fetchRSVPResponses`).
- *Konstanta:* mayoritas UPPER_SNAKE; `defaultTheme`, `themes`, `themeNames` di `theme.ts` camelCase karena objek konfigurasi, bukan primitif — dibiarkan.
- ⚠️ **Tidak akan diganti namanya:** identifier DB/API (`guest_name`, `is_pinned`, `wa_status`, kolom Supabase, nama RPC `record_guest_view`), path URL, nama event DOM (`photobooth:open`), dan **kunci penyimpanan browser** (`undangan-theme`, `undangan-catch-love-best`, `undangan-catch-love-name`, `photobooth_last_send_at`, `admin_pin`, `admin_authenticated`). Format kunci memang tidak konsisten (kebab vs snake), tetapi mengubahnya akan menghapus preferensi tema/skor/sesi admin di perangkat tamu. Yang akan dilakukan hanya **memusatkan** kunci-kunci itu di `constants/storage-keys.ts` dengan nilai yang sama persis.

**M-3. Pola import tidak seragam**
- 209 import alias `@/…` vs 46 import relatif (termasuk `app/layout.tsx` yang memakai `../src/data/theme` padahal sisanya memakai alias).
- Konvensi: alias untuk lintas folder, relatif hanya untuk file bertetangga/sub-folder yang erat (`./RSVPStats`). Mekanis, dijaga `tsc`. Risiko 🟢.

**M-4. Akses data Supabase tersebar dan daftar kolom diduplikasi**
- Klien anon dipakai di 6 service klien; service-role dipakai di route. Konstanta kolom `COLUMNS = "id, created_at, guest_name, storage_path, status"` ada di `photo-service.ts`, `api/admin/photos`, dan `api/photobooth/submit` (3×); `COLUMNS` wishes di route dan `select("*")` di service.
- Solusi: konstanta kolom per tabel di satu modul (`src/types/*` bersebelahan dengan tipenya atau `src/server/columns.ts`). Risiko 🟢.
- **Catatan keamanan di luar lingkup refactor (hanya dicatat):** `upsertGuestLinks`, `updateGuestLinkDetails`, `fetchRSVPResponses`, `getRSVPStats` memakai klien **anon** dari browser, sehingga bergantung pada RLS Supabase (migrasi 001–003 yang mendefinisikan skema dasar tidak ada di repo, jadi tidak bisa diverifikasi dari sini). Tidak diubah karena menyangkut skema/RLS.

**M-5. Bentuk kembalian service admin tidak konsisten**
- `updateWishStatus` / `togglePinWish` / `deleteWish` → `{ success: true }`; `setGuestCategory` → `{ success: true as const }`; `setPhotoStatus` / `deletePhoto` → `void`. Pemanggil perlu dicek sebelum diseragamkan. Risiko 🟡 → hanya dikerjakan jika semua pemanggil terbukti tidak membaca nilai kembalian.

**M-6. Fungsi format tanggal tersebar (format berbeda, disengaja)**
- `admin/shared/formatDate.ts` (`dateStyle: medium, timeStyle: short`), `Wishes.tsx formatWishDate`, `server/wa-compose.ts` (`Intl.DateTimeFormat` UTC), `lib/event-date.ts`, `lib/countdown.ts`, `photoFileName`. Hasil tiap fungsi berbeda secara sah. Rencana: kumpulkan ke `lib/format/` **tanpa mengubah keluaran**.

**M-7. Tipe di dalam komponen / tipe yang tersebar**
- `Wish` (di `Wishes.tsx`), `RSVPFormData` (di `RSVP.tsx`), `WaRow` (di `GuestLinkGenerator`), `Row` (di route WA), `GeneratedLink`/`AdminTab` (di `admin/types.ts`), `Result`/`Upload` (di `PhotoBoothModal`), `GuestLinkRecord` (di service), `PublicEvent` (`events-types.ts`), `PhotoRecord`/`PhotoSettings` (di service).
- Rencana `types/` per domain: `guest.ts` (`GuestLinkRecord`, `GeneratedLink`, `ParsedGuest`, `WaGuestRow`), `rsvp.ts`, `moderation.ts`, `wish.ts` (`WishRecord`, `PublicWish`), `photo.ts` (`PhotoRecord`, `PhotoSettings`), `event.ts` (`PublicEvent`), `admin.ts` (`AdminTab`).
- Aturan: **nilai runtime yang erat dengan tipenya tetap bersama** (mis. `GUEST_CATEGORIES` + `GuestCategory`, `GUEST_SIDES` + `GuestSide` di `lib/guest-*.ts`) agar tidak memisahkan sumber kebenaran. Tipe yang berdiri sendiri baru dipindah. Penggunaan `any`: **0** (sudah bersih). 

**M-8. Pola `startTransition(() => load())` di dalam `useEffect`**
- Muncul di `AdminAuth`, `WishesManagement`, `PhotoManagement`, `PhotoBooth` — workaround untuk aturan lint `set-state-in-effect`. Akan hilang sendiri untuk 3 panel admin lewat `useAdminResource` (H-5).

**M-9. Panggilan `fetch` JSON berulang**
- Pola `await res.json().catch(() => ({}))` + `if (!res.ok) throw new Error(json.error ?? …)` ada di `rsvp-service`, `game-score-service`, `photo-service`, `admin-fetch`. Solusi: `lib/http.ts` (`parseJsonSafe`, `requestJson`). `adminFetch` tetap mempertahankan perilaku 401-nya. Risiko 🟡.

**M-10. Komponen client yang bisa disederhanakan**
- Semua section undangan memang memakai `motion/react` sehingga **harus** client; tidak ada Server Component yang salah ditandai client. Kandidat kecil: `ClientLayout.tsx` (`"use client"` tidak diperlukan karena `ThemeProvider` dan `ThemeSwitcher` sudah client) — manfaatnya kecil dan menyentuh root layout, jadi tidak dikerjakan kecuali kamu mau. `src/server/events.ts` terdeteksi grep karena string `"use client"` di komentar (bukan direktif).

---

### 🟢 LOW — kosmetik & perapian

- **L-1.** `.gitignore` baris 1 berisi teks **UTF-16** (`# wedding-invitation` ber-BOM, tampak sebagai karakter kosong antar huruf) — kemungkinan hasil `echo >` di PowerShell. Perlu ditulis ulang sebagai UTF-8. `.gitignore` juga mendaftar `public/og-image.jpg`, `Maellen-e9j06.otf`, dll. padahal ter-track di git (aturan ignore tidak berlaku; membingungkan).
- **L-2.** `admin.patch` (47 KB) ter-commit di root repo — artefak patch lama; kemungkinan sudah diterapkan. ⛔ Konfirmasi sebelum dihapus.
- **L-3.** `README.md` masih boilerplate create-next-app. Rencana: README singkat (arsitektur, env, migrasi) + `.env.example` dengan semua variabel yang dibaca kode: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_PIN`, `NEXT_PUBLIC_SITE_URL`, `WHATSAPP_*`, `FONNTE_*`, `WAHA_*`. Hanya dokumentasi.
- **L-4.** Versi cache-busting aset `?v=20260820` duplikat di `data/invitation.ts` (`image()`) dan `next.config.ts` (`localPatterns.search`) — keduanya harus sama; jadikan satu konstanta (nilai tetap).
- **L-5.** Duplikasi Tailwind sangat kecil: satu string 4× (tombol chip di `GuestLinkGenerator`) dan satu 3× (`font-body text-sm … tracking-[0.02em]`). Akan terselesaikan saat `Chip` diekstrak (H-6); tidak perlu utilitas baru.
- **L-6.** Warna hex inline hanya di tempat yang memang butuh nilai literal (kanvas `CatchTheLove`, ikon `icon.tsx`/`apple-icon.tsx`, beberapa badge admin). Token di `globals.css :root` sengaja sebagai fallback sebelum CSS tema diinjeksi `getThemeCss()`. **Tidak diubah** (menyentuh tampilan).
- **L-7.** Empat file `opengraph-image`/`twitter-image` (2 root + 2 `[guest]`) hampir identik, tetapi Next.js mensyaratkan `runtime`, `dynamic`, `size`, `contentType` ditulis literal di tiap file (tidak boleh re-export), jadi duplikasi ini **sengaja dibiarkan**.
- **L-8.** Penamaan file migrasi mulai dari 004 (001–003 tidak ada di repo): dicatat, tidak diubah.

---

## 3. Yang sengaja TIDAK disentuh (sesuai aturan #1–#12)

- Seluruh `supabase/migrations/*`, nama tabel/kolom/RPC, RLS.
- Kontrak API (path, body, kode status, **teks pesan error**) semua route `app/api/*`.
- URL, slug, query param (`?guest=`, `?camera=open`, `?name=`, `?design=` bila ada), format link `<nama>~<token>`.
- Logika akses tamu Kudus/Wonogiri: `guest-category`, `guest-access`, `server/events`, `.ics`, validasi RSVP.
- PhotoBooth/PhotoWall: pipeline filter (`filters.ts`, `filters-gl.ts`, `filter-engine.ts`, `preview-pipeline.ts`), `frames.ts`, `compose.ts`, JPEG 0.93, alur upload → submit → approval.
- Tampilan: kelas Tailwind, token CSS, animasi, tema (`theme.ts`).
- Kunci `localStorage`/`sessionStorage`.
- Kebiasaan `PhotoBoothModal` memakai `bride.name.split(" ")[2]`.

---

## 4. Urutan pengerjaan (Tahap C) — tiap fase = satu commit/zip yang bisa diuji terpisah

| Fase | Isi | Temuan | Risiko | Persetujuan |
|---|---|---|---|---|
| **C1** | Pembersihan aman: unused import/variable ESLint, `.gitignore` UTF-8, `.env.example`, README | H-11 (kecuali C-4), L-1, L-3 | 🟢 | tidak perlu |
| **C2** | `src/types/` + hilangkan siklus RSVP; satukan status moderasi & attendance; konstanta kolom | C-1, H-2, H-3, M-4, M-7 | 🟢 | tidak perlu |
| **C3** | Utilitas bersama: `getErrorMessage`, `sleep`, `lib/http`, `data/couple.ts`, `constants/storage-keys.ts`, `lib/format/` | H-8, M-2 (sebagian), M-6, M-9, L-4 | 🟢–🟡 | tidak perlu |
| **C4** | Reorganisasi server: `src/server/{db,http,admin-guard,app-settings}` + helper route admin (`withAdminDb`, `requireAffected`) | C-2, H-4 | 🟡 | `server-only` (paket baru) ⛔ |
| **C5** | Komposisi undangan: `InvitationShell` + `InvitationSections`, hook deep-link kamera | H-1, C-4 | 🟡 | C-4 ⛔ |
| **C6** | Admin panel: `useAdminResource`, komponen state bersama, lalu pecah `GuestLinkGenerator` per langkah | H-5, H-6, M-8 | 🟡–🔴 | H-6 ⛔ |
| **C7** | Kode mati & duplikat route, konsistensi import, penamaan handler | H-9, H-10, M-3, M-2 | 🟢–🟡 | H-9, H-10 ⛔ |
| **C8 (opsional)** | Pindah section ke `components/sections/`; ekstraksi terbatas `PhotoBoothModal` | M-1, H-7 | 🟡 | ⛔ |

Tidak dikerjakan kecuali kamu menyetujui secara eksplisit: **C-3** (hapus fallback `NEXT_PUBLIC_ADMIN_PIN`) dan semua yang bertanda ⛔.

## 5. Validasi (Tahap D) per fase

1. `npx tsc --noEmit` (baseline: 0 error).
2. `npx eslint` (baseline: 1 error + 9 warning → target 0 error, warning hanya `<img>` PhotoWall).
3. `next build` dengan font Google di-mock; bandingkan **daftar route** (`ƒ`/`○`) sebelum vs sesudah — harus identik.
4. `madge --circular` (baseline: 1 → target 0).
5. `ts-prune` (baseline: 15 → turun sesuai persetujuan H-9).
6. Diff API: untuk tiap route yang disentuh (H-4), bandingkan status + body untuk setiap cabang validasi.
7. Diff JSX: untuk H-1 dan H-6, bandingkan urutan elemen/props sebelum vs sesudah.
8. **Usulan (butuh persetujuan karena menambah devDependency `vitest`):** test karakterisasi untuk fungsi murni yang disentuh — `parseGuestLines`, `normalizeIdPhone`, `splitGuestSegment`/`buildGuestSegment`, `toGuestCategory`, `guest-grouping`, `splitEventDate`/`formatEventDate`, `escapeCSVField`. Ditulis terhadap kode **sebelum** diubah, lalu dijalankan sesudahnya.

## 6. Keputusan yang saya butuhkan

1. Setuju mulai dari **C1 → C3** (aman, tanpa persetujuan tambahan)?
2. **C-3**: hapus fallback `NEXT_PUBLIC_ADMIN_PIN`? (butuh kamu pastikan `ADMIN_PIN` sudah ter-set di Vercel.) Default saya: **tidak**, hanya didokumentasikan.
3. **H-10**: `/api/admin/calendar.ics` — pertahankan URL dengan re-export (rekomendasi) atau hapus?
4. **H-9**: boleh hapus `LyricsTester.tsx`, `FloralAccent.tsx`, 5 SVG boilerplate, `.section-divider`/`.font-molani` + `Mollani-Regular.ttf`, dan export tak terpakai? Atau ada yang ingin dipertahankan (mis. `LyricsTester`, `__allowSoftwareGl`)?
5. **L-2**: `admin.patch` boleh dihapus?
6. Boleh menambah `server-only` (dependency) dan `vitest` (devDependency)?
7. **C8**: mau pemindahan section ke `components/sections/` dan ekstraksi terbatas PhotoBooth, atau cukup sampai C7?
