# AUDIT-FULL-CODEBASE-2026-11

**Repo:** `AgungCahyo/wedding-invitation` · **Branch:** `main` · **Commit diaudit:** `6584830` ("refactor", 2026-11-10 21:08 +0700)
**Tanggal audit:** 2026-11-11 · **Mode:** AUDIT ONLY — READ ONLY
**Pembanding historis:** `AUDIT-DAN-RENCANA-REFACTOR.md` (baseline `52d2de0`), `AUDIT-REPORT-2026-11-10.md`, `REFACTORING-FINAL-PLAN.md`

**Status temuan:** `VERIFIED` · `NOT VERIFIED` · `FALSE POSITIVE` · `NEEDS INVESTIGATION`

---

## 0. Cara audit dan batasannya (baca dulu)

- Repo di-clone ke sandbox terpisah (shallow, depth 50). **Tidak ada file di repo kamu yang diubah, tidak ada commit/push.** `npm ci`, `npm run build` dan `tsc` hanya membuat `node_modules/`, `.next/`, `tsconfig.tsbuildinfo` dan `next-env.d.ts` di salinan sandbox.
- Tidak ada nilai env/secret yang dibaca atau dicetak. `.env.example` ternyata tidak ada di repo (lihat F-04), jadi hanya **nama** variabel yang diambil dari `process.env.*` di kode.
- **Tidak bisa diverifikasi dari sini:** isi database produksi, policy RLS aktual, policy Storage, nilai env di Vercel, migrasi `001–003` (tidak ada di repo), perilaku runtime di browser/perangkat mobile. Semua yang bergantung pada itu ditandai `NOT VERIFIED` atau `NEEDS INVESTIGATION`.
- **Cakupan baca:**
  - *Dibaca penuh:* seluruh `src/server/*`, semua `app/api/*`, semua `src/lib/*-service.ts`, `admin-fetch/session`, `AdminAuth`, komposisi undangan (`app/page`, `app/[guest]/page`, `InvitationShell/Sections`, `useCameraDeepLink`, `PhotoBooth`), `MusicContext`, `useCamera`, `useGuestEvents`, `guest-input/token/category`, `phone`, seluruh migrasi `004–013`.
  - *Dianalisis struktural (metrik, grep, baca sebagian):* `GuestLinkGenerator`, `PhotoBoothModal`, `PhotoWall`, `CatchTheLove`, `Wishes`, `RSVP`, `RSVPManagement`.
  - *Tidak dibaca mendalam:* `Opening`, `Countdown`, `Gallery`, `Story`, `ThemeSwitcher`, `theme.ts` (hanya `getThemeInitScript`), pipeline filter (`filters.ts`, `filters-gl.ts`, `filter-engine.ts`, `frames.ts`), `AdminLayout/Navigation/Dashboard`. Tidak ada klaim kebenaran perilaku untuk bagian ini.

---

## 1. Executive Summary

**Kondisi umum:** fondasi codebase cukup sehat. `strict: true`, **0** `any`/`@ts-ignore`, **0** circular dependency, lint 0 error, build lolos. Masalah terkonsentrasi di dua komponen besar (`GuestLinkGenerator` 1.403 baris, `PhotoBoothModal` 769 baris), di model keamanan admin, dan di **refactor C1–C5 yang berhenti di tengah jalan**.

**Temuan inti (urut dampak):**

1. **Regresi nyata di halaman tamu `/[guest]` setelah C5 (P1, VERIFIED).** Dibanding baseline `52d2de0`: (a) `Footer` tampil **dua kali**; (b) `PhotoBooth` tidak lagi menerima `guestName`, sehingga nama tamu tidak terisi otomatis di modal foto; (c) `Footer`/`LyricsRail`/`FloatingBar` pindah dari dalam `<motion.main>` ke luar; (d) deep-link `?camera=open` kini aktif juga di `/[guest]`. Laporan 2026-11-10 hanya menemukan dua bug lain (autoOpen dan Opening ganda); keduanya **sudah benar-benar diperbaiki** (VERIFIED), tetapi regresi di atas tidak tercatat dan lolos dari `tsc`/`lint`/`build`.
2. **Klaim "PASS" C1–C3 tidak sepenuhnya benar (P1, VERIFIED).** Modul baru dibuat tetapi **tidak dipakai siapa pun**: `data/couple.ts`, `constants/storage-keys.ts`, `constants/events.ts`, `lib/errors.ts`, `lib/http.ts`, `lib/format/`, `server/http.ts:withAdminDb/okJson`, dan seluruh `src/types/*` (tipe lama di service tetap ada, sehingga satu entitas kini punya 2 definisi, ada yang berbeda isi). `.env.example` yang diklaim dibuat **tidak ada di repo**. Hasilnya: sumber kebenaran ganda, bukan konsolidasi.
3. **Model keamanan admin lemah dan tidak konsisten (P1).** PIN admin tanpa rate-limit/lockout (hanya jeda 600 ms yang bisa diparalelkan), PIN disimpan di `sessionStorage` dan dikirim di tiap request. Sebagian operasi admin (`guest_links` upsert/update, baca `rsvp_guests`) memakai **anon key dari browser**, sehingga bergantung pada RLS yang **tidak bisa diverifikasi** karena migrasi dasar `001–003` tidak ada di repo. Kalau policy-nya longgar, data RSVP (nama + pesan) terbaca oleh siapa pun yang punya anon key.
4. **`GuestLinkGenerator` adalah god component dengan risiko performa nyata (P1).** ~1.287 baris dalam satu fungsi, 27 `useState`, `renderRow` ±320 baris, seluruh daftar tamu dihitung ulang dan dirender ulang di setiap ketikan textarea. Komentar "React Compiler sudah memoize otomatis" **salah**: React Compiler tidak diaktifkan.
5. **Rencana C4–C8 belum jalan;** `REFACTORING-FINAL-PLAN.md` menjanjikan tag rollback `refactor/pre-C*` dan `vitest`. **Tidak ada tag** dan **tidak ada test**.

**Rekomendasi urutan paling aman (ringkas):** (1) pulihkan paritas halaman tamu, (2) verifikasi RLS secara read-only, (3) bersihkan kejujuran repo (env example, patch, dokumen, modul yatim), (4) tulis test karakterisasi untuk fungsi murni, (5) baru pecah `GuestLinkGenerator`. Detail di bagian 14.

---

## 2. Repository Inventory

| Item | Nilai | Status |
|---|---|---|
| Framework | Next 16.3.1 (App Router, Turbopack), React 19.2.8, TS 5 `strict` | VERIFIED |
| File TS/TSX di `app/` + `src/` | 135 file, 14.961 baris | VERIFIED |
| File `"use client"` | 43 | VERIFIED |
| Route (build) | 24 (`/`, `/[guest]`, `/admin`, `/booth`, `/photowall`, 11 API, 2 `.ics`, OG/icon) | VERIFIED |
| Migrasi | `004–013` (**`001–003` tidak ada**) | VERIFIED |
| Test | **0** file test, tidak ada script `test`, `vitest` tidak ada di `package.json` | VERIFIED |
| Dependency runtime | `@supabase/supabase-js`, `@vercel/analytics`, `date-fns`, `jszip`, `lucide-react`, `motion`, `next`, `react`, `server-only` | VERIFIED |
| Import style | 213 alias `@/…` vs 48 relatif (belum diseragamkan) | VERIFIED |
| `any` / `@ts-ignore` | **0** | VERIFIED |
| `eslint-disable` | 3 (semua `no-img-element`) | VERIFIED |
| `console.*` | 28 pemakaian | VERIFIED |
| Tag git | **tidak ada** (rencana menjanjikan `refactor/pre-C1…`) | VERIFIED |

---

## 3. Architecture Map (kondisi aktual)

```
app/
  page.tsx                       "/"            → <InvitationShell outside><InvitationSections/>
  [guest]/page.tsx               "/<nama>~<token>" → shell(inside, guestName) + welcomeSection
  [guest]/opengraph-image|twitter-image, opengraph-image|twitter-image   (nodejs, force-dynamic)
  admin/page.tsx                 AdminAuth(PIN) → AdminDashboard
  booth/, photowall/             PhotoBoothModal langsung / layar acara (realtime + polling)
  calendar.ics/route.ts          .ics per kategori tamu (server)
  api/admin/{auth,guest-links,photos,photo-settings,wishes,wa}   PIN + service-role
  api/admin/calendar.ics         re-export GET dari /calendar.ics  (H-10 beres)
  api/{rsvp,events,game-scores,photobooth/submit}                 publik + service-role
src/
  components/ (flat 30 section + admin/ + photobooth/ + invitation/ + ui/)
  server/     db, http, admin-guard, app-settings, events, guest-access, wa-compose, whatsapp
              (semua `import "server-only"`; build lolos ⇒ tidak ada import dari client)
  lib/        service anon-key (rsvp, wishes, photo, guest-link), util murni, photobooth/*
  types/ constants/ data/couple.ts      ← modul C2/C3, sebagian besar yatim
supabase/migrations/004–013
```

**Entry points & routing.** Semua halaman adalah client page. `[guest]` menangkap *semua* path satu segmen yang tidak cocok route lain.
**Alur data.** (a) Publik: browser → anon key → Supabase untuk `wishes` (baca/tulis), `photobooth_photos` (baca approved, realtime), `guest_links` (baca kolom publik, RPC `record_guest_view`); browser → `/api/*` (service-role) untuk RSVP, event, skor, submit foto. (b) Admin: browser → `adminFetch` (header `x-admin-pin`) → `/api/admin/*`; **kecuali** `upsertGuestLinks`, `updateGuestLinkDetails`, `fetchRSVPResponses`, `getRSVPStats` yang memakai anon key langsung.
**State.** Lokal per komponen (`useState`), satu context (`MusicContext`), satu `ThemeProvider`. Tidak ada store global; pantas untuk skala ini.
**Auth/authorization.** Hanya PIN statis (header `x-admin-pin`) + akses tamu via token 16-hex di URL. Tidak ada `supabase.auth` (VERIFIED, grep kosong).
**Integrasi eksternal.** Supabase (DB, Storage, Realtime), WhatsApp (Meta Cloud / Fonnte / WAHA), Vercel Analytics, Google Fonts.

---

## 4. Critical Findings (P0/P1 ringkas)

Tidak ada P0 yang **terbukti** dari kode saja. Satu kandidat P0 bersyarat (F-03) menunggu verifikasi RLS.

| ID | Prioritas | Judul | Status |
|---|---|---|---|
| F-01 | P1 | Regresi halaman tamu pasca-C5 | VERIFIED |
| F-02 | P1 | Autentikasi admin tanpa pembatas percobaan; PIN di sessionStorage | VERIFIED (kekuatan PIN: NOT VERIFIED) |
| F-03 | P1 (P0 bila RLS longgar) | Operasi admin lewat anon key; migrasi dasar hilang | VERIFIED (kode) / NEEDS INVESTIGATION (RLS) |
| F-04 | P1 | Refactor setengah jalan: modul baru yatim, tipe ganda, klaim laporan salah | VERIFIED |
| F-05 | P1 | `GuestLinkGenerator` god component + performa render | VERIFIED |

### F-01 — Regresi halaman tamu pasca-C5 · P1 · VERIFIED

**Evidence (baseline `52d2de0:app/[guest]/page.tsx` vs HEAD):**

| Perilaku | Baseline | HEAD | Lokasi HEAD |
|---|---|---|---|
| `Footer` di halaman tamu | 1× di dalam `<motion.main>` (L119) | **2×**: di `InvitationSections` dan di `InvitationShell` | `InvitationSections.tsx:63` (`footerInsideMain && <Footer/>`), `app/[guest]/page.tsx:77` (`footerInsideMain={true}`), `InvitationShell.tsx:54` (`<Footer />` tanpa syarat) |
| `PhotoBooth guestName` | `<PhotoBooth guestName={guestName}/>` (L116) | `<PhotoBooth autoOpen=… />` **tanpa guestName** | `InvitationShell.tsx:51,53`; modal memakai `guestName` untuk isi awal input nama (`PhotoBoothModal.tsx:85,107`) |
| Posisi `Footer`/`LyricsRail`/`FloatingBar` | di dalam `<motion.main>` (guest L119–121; `/` L72–75) | di luar `<main>` untuk kedua halaman | `InvitationShell.tsx:54–56` |
| Deep-link `?camera=open` | hanya `/` | `/` **dan** `/[guest]` | `InvitationShell.tsx:33` |
| `CatchTheLove guestName` | `guestParam ? guestName : undefined` (L115) | selalu `guestName` (bisa `"Tamu"`) | `InvitationSections.tsx:60` |

**Root cause:** `InvitationShell` menggabungkan dua halaman yang berbeda tanpa membawa tiga detail yang tidak dilindungi tipe: prop `guestName` tidak diteruskan ke `PhotoBooth`, dan `Footer` dirender di dua lapisan. Validasi C5 (`tsc`, `lint`, `build`, `madge`) tidak mendeteksi perubahan perilaku DOM.
**Impact:** halaman utama yang dilihat semua tamu menampilkan footer ganda; personalisasi foto hilang; `LyricsRail` (fixed) dan `FloatingBar` (fixed) tidak ikut fade-in `<main>`.
**Recommendation:** pulihkan paritas persis dengan baseline (lihat Fase R0). Keputusan untuk deep-link di `/[guest]` dan posisi elemen fixed perlu konfirmasi kamu: bisa disengaja, tapi tidak pernah diminta.
**Risk:** rendah–sedang (perubahan kecil, mudah diverifikasi dengan membandingkan pohon JSX).

**Sudah diperbaiki (VERIFIED):** bug 1 laporan lama (`autoOpenCamera` boolean shorthand): `app/page.tsx:8` tidak lagi memberi prop itu. Bug 2 (Opening ganda): `[guest]/page.tsx` tidak lagi punya `MusicProvider/AnimatePresence/Opening`. Error ESLint `set-state-in-effect` hilang (lint 0 error).

### F-02 — Autentikasi admin · P1 · VERIFIED (kode) / NOT VERIFIED (kekuatan PIN)

**Evidence:**
- `src/server/admin-guard.ts:13` `ADMIN_PIN || NEXT_PUBLIC_ADMIN_PIN` (keputusan sebelumnya: dipertahankan; tetap dicatat).
- `admin-guard.ts:17–18` jeda 600 ms hanya saat gagal. Di serverless jeda ini per-request; penyerang bisa mengirim ratusan request paralel. Tidak ada hitungan percobaan, IP-throttle, atau lockout.
- `AdminAuth.tsx:49–50` menyimpan PIN mentah di `sessionStorage`; `admin-fetch.ts:13` mengirimnya di setiap request.
- `AdminAuth.tsx:89,96` `inputMode="numeric"` dan placeholder `••••••` mengisyaratkan PIN numerik 6 digit (**inferensi**, bukan fakta; kekuatan PIN NOT VERIFIED).
- Daya ungkit akun ini besar: service-role, baca `access_token` semua tamu (`api/admin/guest-links` GET), kirim WhatsApp, hapus data.

**Impact:** jika PIN numerik pendek, brute-force praktis dalam skala menit–jam. XSS apa pun di domain yang sama membuka PIN dari `sessionStorage`.
**Recommendation:** tambah pembatas percobaan (mis. tabel `app_settings` atau KV Vercel) dan header `Retry-After`/429; pertimbangkan cookie `httpOnly` bertanda tangan sebagai pengganti PIN di storage. Ini **mengubah perilaku auth/konfigurasi** sehingga butuh persetujuan eksplisit.
**Risk:** sedang (bisa mengunci admin sendiri; harus ada jalur pemulihan).

### F-03 — Anon key untuk operasi admin; migrasi dasar hilang · P1 (P0 bila RLS longgar) · NEEDS INVESTIGATION

**Evidence (kode, VERIFIED):**
- `src/lib/rsvp-service.ts:52–61` `select("*")` pada `rsvp_guests` dan `:87–89` stat, dipakai `RSVPManagement.tsx:27–28`, hanya dilindungi gerbang PIN di sisi klien (`AdminAuth`).
- `src/lib/guest-link-service.ts:38–48` `upsert` ke `guest_links` dan `:112–116` `update` (relation/personal_note/is_featured) via anon key. Pesan error di `:124` bahkan menyebut "Periksa policy UPDATE di tabel guest_links".
- Operasi yang lebih sensitif (kategori, side, delete, WA) sudah lewat server → model tidak konsisten.
- Tidak ada `supabase.auth` sama sekali.

**Konsekuensi logis:** agar fitur-fitur ini jalan, RLS **harus** mengizinkan `anon` membaca semua `rsvp_guests` dan menulis `guest_links`. Anon key ada di bundle publik. Maka siapa pun dapat (a) membaca nama + pesan RSVP semua tamu, (b) mengubah `relation`/`personal_note` tamu mana pun (teks "Kepada Yth." di halaman tamu), (c) membuat baris `guest_links` baru (trigger memaksa `category='kudus'` dan token acak, jadi eskalasi akses acara terblokir: **VERIFIED di migrasi 009–013**).
**Yang tidak bisa dipastikan:** policy aktual ada di migrasi `001–003` (hilang) atau di dashboard Supabase. **NOT VERIFIED.**
**Recommendation:** (1) jalankan SQL read-only `select tablename, policyname, cmd, roles, qual, with_check from pg_policies where schemaname in ('public','storage');` dan tempel hasilnya (tanpa secret) agar bisa diverifikasi; (2) commit snapshot skema dasar sebagai `001_baseline.sql`; (3) bila terbukti longgar, pindahkan keempat operasi ke route admin baru (kontrak aditif, tidak mengubah API lama).
**Risk:** verifikasi 0 risiko; pemindahan sedang.

### F-04 — Refactor setengah jalan · P1 · VERIFIED

Tabel verifikasi klaim vs kondisi aktual ada di **bagian 13**. Ringkasnya:

| Klaim laporan | Kenyataan di HEAD |
|---|---|
| C1: `.env.example` dibuat | **Tidak ada** di `git ls-files`. `.gitignore:34` `.env*` mengabaikannya; patch C1 (`a.patch`) menambah pengecualian tetapi **tidak pernah diterapkan**. README `:77–78,89,122` mengarahkan ke file yang tidak ada. |
| C1: `admin.patch` dihapus | Terhapus, tapi `a.patch` (patch C1) **ter-commit** di root. |
| C2: tipe dipindah ke `src/types/` | Tipe **disalin**, bukan dipindah. `GuestLinkRecord` (guest-link-service:6 + types/guest:4), `GuestResponse` (rsvp-service:4 + types/rsvp:11), `WishRecord` (wishes-service:9 + types/wish:8), `PhotoRecord` (photo-service:8 + types/photo:8), `PhotoSettings` (photo-service:147 **vs** types/photo:16, bentuk berbeda), `GeneratedLink` & `AdminTab` (components/admin/types.ts **vs** types/guest.ts & types/admin.ts, `AdminTab` nilainya berbeda). Semua export `types/*` dilaporkan ts-prune sebagai tak terpakai. |
| C3: util bersama menggantikan duplikasi | `lib/errors`, `lib/http`, `lib/format`, `data/couple`, `constants/*`: **0 importer**. Inline `err instanceof Error ?` masih 26×. `sleep` hanya dipakai 1 file; `PhotoBoothModal.tsx:49` masih mendefinisikan sendiri. |
| C4: server dikonsolidasi | `src/server/{db,http,admin-guard,app-settings}` ada dan ber-`server-only` (bagus), tetapi `withAdminDb` dan `okJson` tak dipakai; setiap route masih menulis `guard` + `g.res!`. **`src/lib/app-settings.ts` (salinan lama, tanpa `server-only`) masih ada** dan yatim. |
| C5: bug sudah diperbaiki | Dua bug lama benar; **regresi baru F-01**. |
| Rencana: tag rollback, vitest | Tidak ada keduanya. |

**Impact:** setiap sumber kebenaran ganda adalah titik drift. Contoh nyata: `AdminTab` punya dua nilai berbeda; kunci storage punya tiga definisi (`constants/storage-keys.ts:8–19`, `lib/admin-session.ts:2–4`, `data/theme.ts:31`, plus literal di `CatchTheLove.tsx:13–14` dan `PhotoBoothModal.tsx:48`); nama event `"photobooth:open"` ada di `constants/events.ts:5` dan `lib/floating-bar.ts:6`.
**Recommendation:** per modul, putuskan *adopsi* atau *hapus* (Fase R1/R3). Jangan tambah modul baru sebelum itu.

### F-05 — `GuestLinkGenerator` god component · P1 · VERIFIED

Detail di bagian 6 dan 9.

---

## 5. Spaghetti Code Findings

Skala: Rendah / Sedang / Tinggi / Kritis. Tidak memakai jumlah baris sebagai satu-satunya indikator.

| File | Komponen/fungsi | Kompleksitas | Evidence | Root cause | Impact | Rekomendasi | Risiko refactor |
|---|---|---|---|---|---|---|---|
| `src/components/admin/guests/GuestLinkGenerator.tsx` | `GuestLinkGenerator` (L116–1403) | **Kritis** | 27 `useState` (26 di L117–163 + 1 di L531, di tengah badan); `renderRow` L685–~1000; `handleGenerate` L235–357 dengan 4 `try/catch` bersarang; 10× `err instanceof Error ?` | Form generator, daftar+filter+grouping, seleksi massal, personalisasi, kontak WA, pengiriman massal, hapus: semua satu fungsi | Sulit diuji, tiap perubahan menyentuh area berisiko tinggi; render mahal | Pecah bertahap (R6) setelah test karakterisasi | Tinggi |
| `src/components/photobooth/PhotoBoothModal.tsx` | `PhotoBoothModal` | Tinggi | 16 `useState`, 7 `useEffect`, 8 `useRef`; konstanta, cooldown `localStorage`, `ensureFonts`, kamera, countdown, compose, upload, share | Logika non-render bercampur dengan UI | Perubahan di satu fase (mis. upload) berisiko merusak fase lain | Ekstraksi terbatas fungsi murni (R7); pipeline filter jangan disentuh | Sedang |
| `src/components/CatchTheLove.tsx` | `CatchTheLove` | Sedang | 10 `useState`, 6 `useEffect`, game loop `requestAnimationFrame` L278–337 dengan cleanup lengkap | Game engine dan UI satu komponen (logika murni sudah di `lib/catch-love.ts`, bagus) | Sedang | Tidak mendesak | Rendah |
| `src/components/photobooth/PhotoWall.tsx` | `PhotoWall` | Sedang | 5 state, 6 effect; realtime + polling + spotlight + idle | Banyak side effect berantai | Sulit dilacak, tapi cleanup ada (L59–72) | Tidak mendesak | Rendah |
| `src/components/admin/photos/PhotoManagement.tsx` | — | Sedang | 10 `useState`; pola load/busy/error sama dengan 2 panel lain | Tidak ada hook bersama | Duplikasi pola | R5 | Sedang |
| `src/components/Wishes.tsx` | — | Rendah–Sedang | 8 state, 2 effect | — | — | Tidak mendesak | — |
| `app/api/admin/wa/route.ts` | `POST` (L119–248) | Sedang | claim atomik, alasan skip, worker pool, time budget, kembalikan antrean dalam satu fungsi ±130 baris | Alur pengiriman lengkap dalam satu handler | Sulit diuji terpisah | Ekstrak fungsi murni (mis. `explainSkip`) hanya bila ada test | Sedang |

**Bukan spaghetti (diperiksa, dinyatakan layak):** `useCamera` (stale-request guard + cleanup benar), `MusicContext` (listener dibersihkan), `useGuestEvents` (cache promise + `alive` flag), `lib/catch-love.ts` (logika murni terpisah), `server/*`.

---

## 6. God Components & God Functions

| Entitas | Ukuran/indikator | Status | Catatan |
|---|---|---|---|
| `GuestLinkGenerator` | 1.403 baris; 1 komponen ±1.287 baris; 27 state | VERIFIED | Lihat F-05. Naik dari 1.405 pada baseline (tidak ada kemajuan C6). |
| `PhotoBoothModal` | 769 baris; 16 state | VERIFIED | Tidak berubah. |
| `GuestLinkGenerator.renderRow` | ±320 baris JSX inline | VERIFIED | Closure atas ±15 state. |
| `handleGenerate` | L235–357 | VERIFIED | Menggabungkan parsing, deteksi bentrok, persist, kategori, side, kontak WA, refresh. |
| `data/theme.ts` | 625 baris | VERIFIED | Data konfigurasi, bukan logika; **bukan masalah**. |

---

## 7. Duplication & Coupling

Klasifikasi: **E** = hilangkan · **I** = sengaja, biarkan · **J** = mirip tetapi jangan disatukan.

| # | Duplikasi | Lokasi | Verdict | Catatan |
|---|---|---|---|---|
| D-1 | Template pesan WhatsApp ganda | `GuestLinkGenerator.tsx:168–188` (`buildWaMessage`, tanpa `{acara}`/`{catatan}`) vs `server/wa-compose.ts:30–48` | **E** | Klien hanya memakai ini sebagai fallback `waLink` (L674) dan di L209/267. Dua format pesan bisa menyimpang. Perlu keputusan perilaku sebelum disentuh (pesan manual vs server). |
| D-2 | Kunci storage | lihat F-04 | **E** | Nilai harus tetap persis. |
| D-3 | Nama event window | `constants/events.ts:5` vs `lib/floating-bar.ts:6` | **E** | |
| D-4 | Tipe entitas ganda | F-04 | **E** | Hapus salinan lama atau baru, bukan keduanya. |
| D-5 | `COLUMNS` foto | `api/admin/photos/route.ts:12`, `api/photobooth/submit/route.ts:13`, `photo-service.ts:16` | **E** | M-4 historis belum dikerjakan. |
| D-6 | `Attendance` literal | `api/rsvp/route.ts:16–19`, `types/rsvp.ts:5`, `types/event.ts:5` | **E** | H-3 historis belum tuntas. |
| D-7 | Cast `"pending"\|"approved"\|"hidden"` manual | `api/admin/photos/route.ts:29`, `api/admin/wishes/route.ts:40` | **E** | Padahal `ModerationStatus` ada. `MODERATION_STATUSES` bertipe `readonly ModerationStatus[]` sehingga cast tidak perlu. |
| D-8 | Pola error `instanceof Error` | 26 tempat | **E** (ringan) | `getErrorMessage` sudah ada, belum dipakai. Mekanis, risiko rendah. |
| D-9 | `sleep` | `PhotoBoothModal.tsx:49`, `admin-guard.ts:18` inline | **E** (ringan) | |
| D-10 | Nama pasangan `name.split(" ")[…]` | 17 pemakaian `split(" ")` di 11 file (RSVPManagement:76, GuestLinkGenerator:165–166, DigitalGift:14–15, PhotoWall:22,242,246, PhotoBoothModal:32, Closing:11–12, wa-compose:28, events:33, og:37–38, calendar:109) | **E** dengan syarat | `data/couple.ts` sudah ada, belum dipakai. Lihat G-1 di bagian 13. |
| D-11 | Helper decode | `app/[guest]/page.tsx:17` `decodeURIComponent` mentah vs `lib/og/invitation-og.tsx:25` `safeDecode` | **E** | Lihat F-12. |
| D-12 | Pola `fetch` JSON | `admin-fetch.ts:20`, `rsvp-service.ts:40`, `photo-service.ts:70`, `game-score-service.ts:19` | **J** | `lib/http.ts` tidak dipakai. Cukup satu keputusan: adopsi atau hapus. |
| D-13 | Boilerplate route admin (`guard` + `g.res!`) | 6 route | **J** | `withAdminDb` tak dipakai. Nilai tambahnya kecil; **tidak perlu** dipaksakan. |
| D-14 | Pola load/busy/error 3 panel admin | Wishes/Photo/RSVPManagement | **E** (R5) | |
| D-15 | `opengraph-image` / `twitter-image` ×4 | `app/` | **I** (klaim lama) | Alasan teknis (config segmen Next harus literal) berasal dari audit lama; **tidak diverifikasi ulang**: NOT VERIFIED. |
| D-16 | Format tanggal berbeda-beda | `formatDate`, `wa-compose.longDate`, `event-date`, `countdown`, `photoFileName` | **I** | Hasil memang berbeda. |
| D-17 | Cache-bust `?v=20260820` | `data/invitation.ts:6`, `next.config.ts:8` | **E** (ringan) | Dua konstanta yang **harus** sama. |
| D-18 | Trigger `guest_links_protect_category` didefinisikan ulang di 4 migrasi | `009:32`, `010:44`, `011:25`, `013:21` | **J** | Hanya versi `013` efektif; urutan eksekusi menentukan hasil. Lihat F-10. |

**Circular dependencies:** `npx madge --circular --extensions ts,tsx src/` → **0** (juga 0 saat `app/` disertakan, 136 file). VERIFIED.
**Coupling:** komponen section mengimpor service dan data langsung (wajar). Tidak ada import client → `src/server/*` (dijaga `server-only`, build lolos). `lib/` masih mencampur util murni, service anon, dan helper domain (M-1 historis, belum dikerjakan).

---

## 8. State Management Audit

| Komponen | `useState` | `useEffect` | `useRef` | Penilaian |
|---|---|---|---|---|
| `GuestLinkGenerator` | 27 | 2 | 0 | State saling bergantung: `links`/`viewStats`/`waRows` mewakili entitas tamu yang sama dalam 3 bentuk; `selected`, `edits`, `draft`, `collapsed`, `filters` dicampur. **Masalah.** |
| `PhotoBoothModal` | 16 | 7 | 8 | Kompleks tetapi cleanup benar (revoke URL, `cancelAnimationFrame`, interval). |
| `CatchTheLove` | 10 | 6 | 6 | Wajar untuk game. |
| `PhotoManagement` | 10 | 2 | 0 | Pola sama dengan panel lain. |
| `Wishes` | 8 | 2 | 2 | Wajar. |
| `RSVP` | 5 | 0 | 0 | Wajar. |

**Pola workaround:** `startTransition(() => load())` di dalam `useEffect` muncul di `AdminAuth.tsx:19`, `RSVPManagement.tsx:46`, `WishesManagement.tsx:46`, `PhotoManagement.tsx:51`, `GuestLinkGenerator.tsx:230,468`, `PhotoBooth.tsx:18`, `PhotoBoothModal.tsx:148`, `useCameraDeepLink.ts:19`, juga `useSyncedLyrics`, `useTheme`, `CatchTheLove`. Fungsional tetapi menyiratkan perlunya hook data (R5).
**Context:** `MusicContext.tsx:98` membuat objek `value` baru setiap render; dampak kecil karena konsumennya sedikit (P3, VERIFIED).

---

## 9. Performance Audit

| ID | Temuan | Status | Evidence | Dampak |
|---|---|---|---|---|
| P-1 | **React Compiler tidak aktif, tetapi kode berasumsi aktif.** | VERIFIED | Komentar `GuestLinkGenerator.tsx:479` "React Compiler sudah memoize otomatis"; `next.config.ts` tanpa `reactCompiler`; `package.json` tanpa `babel-plugin-react-compiler`. | Setiap ketikan di textarea (`rawInput`, L117) merender ulang komponen 1.287 baris: `facetsOf`, `filter`, `sort(localeCompare)`, `groupGuests`, loop `counts`, dan **semua** `renderRow`. Tanpa pagination/virtualisasi. Dampak nyata: NEEDS INVESTIGATION (profil). Untuk ratusan tamu kemungkinan terasa di HP admin. |
| P-2 | `PUT /api/admin/wa` memperbarui kontak **satu per satu** (N+1) | VERIFIED | `wa/route.ts:82–115`, maks 500 kontak, `maxDuration = 60` (L26) | Bisa mendekati batas waktu pada impor besar. NEEDS INVESTIGATION. |
| P-3 | PhotoWall: polling 20 dtk mengganti seluruh array tiap siklus | VERIFIED | `PhotoWall.tsx:17,45–46` `setPhotos(fresh)` tanpa pembandingan; limit 120 (`photo-service.ts:80`) | Re-render tak perlu pada layar acara; kecil. |
| P-4 | PhotoWall memuat foto **ukuran penuh** (`photoUrl(path)`) tanpa thumbnail | VERIFIED | `PhotoWall.tsx:173,458`; `<img loading="lazy">` L460; JPEG 0.93 dari kamera 1080×1440 (`useCamera.ts:49–50`) | Bandwidth/memori tinggi untuk grid 120 foto di layar acara. NEEDS INVESTIGATION (ukuran file aktual). Peringatan lint `no-img-element` di L457 terkait. |
| P-5 | `getUserMedia` meminta 1920 ideal | VERIFIED | `useCamera.ts:45–51` | Berat di HP lawas; pipeline preview menyesuaikan skala (`PhotoBoothModal.tsx:111` `fxScale`). Tidak diverifikasi di perangkat. |
| P-6 | Build log: `Missing Supabase credentials` dicetak di tingkat modul | VERIFIED | `lib/supabase.ts:8–12`; `createClient(supabaseUrl!, supabaseAnonKey!)` di L18 | Berisik saat build tanpa env; aman secara fungsional. |
| P-7 | `/api/events` dan `/calendar.ics` mencari kategori di DB setiap panggilan | VERIFIED | `guest-access.ts:34–41` | Wajar (`no-store` disengaja); hook klien sudah me-cache per slug. |
| P-8 | Dua `.otf`, satu `.ttf` besar di `public/` | NOT VERIFIED | `globals.css:6,14,22` | Hanya diunduh bila dipakai; `Mollani-Regular.ttf` + `.font-molani` tidak dipakai (lihat bagian 11). |

Tidak ada temuan performa yang terbukti kritis. Item di atas adalah hipotesis berbasis kode.

---

## 10. Security Audit

| ID | Prioritas | Temuan | Status | Evidence |
|---|---|---|---|---|
| S-1 | P1 | Brute-force PIN admin | VERIFIED | F-02 |
| S-2 | P1/P0? | Operasi admin lewat anon key | NEEDS INVESTIGATION | F-03 |
| S-3 | P2 | **Service-role tidak bocor ke client.** | VERIFIED (baik) | Satu-satunya pembaca `SUPABASE_SERVICE_ROLE_KEY` adalah `src/server/db.ts:11` yang ber-`server-only`; build lolos. |
| S-4 | P2 | `access_token` tamu hanya dikembalikan oleh API admin; anon tidak bisa `SELECT` kolom itu | VERIFIED (kode) | `010:39–40` revoke+grant per kolom; `guest-link-service.ts:26–27` kolom publik. Berlaku bila migrasi 010 benar-benar dijalankan di produksi: NOT VERIFIED. |
| S-5 | P2 | Trigger melindungi `category`, `access_token`, `phone`, `wa_*`, `side` dari anon (INSERT/UPDATE) | VERIFIED | `013:21–43`. |
| S-6 | P2 | **Endpoint publik tanpa rate-limit/anti-abuse**: `POST /api/rsvp`, `/api/game-scores`, `/api/photobooth/submit`; `wishes` insert langsung via anon | VERIFIED | `rsvp/route.ts:21`, `game-scores/route.ts:45`, `photobooth/submit/route.ts:17`, `wishes-service.ts:31`. Bisa dibanjiri spam. |
| S-7 | P2 | `photobooth/submit` mempercayai klien: tidak memeriksa objek di Storage benar-ada/tipe/ukuran, `consent: true` di-hardcode | VERIFIED | `submit/route.ts:32,45`. Jika *auto-approve* menyala, baris untuk UUID tanpa file tampil sebagai tile rusak di PhotoWall. Policy Storage: NOT VERIFIED. |
| S-8 | P2 | Migrasi `007` membuka INSERT `pending` oleh anon ke `photobooth_photos` (dokumen menyebut "optional") | VERIFIED (file) / NEEDS INVESTIGATION (produksi) | `007:10–23`. Bila aktif, validasi di `/api/photobooth/submit` bisa dilewati. |
| S-9 | P2 | `wishes` insert langsung dari browser dengan `status` ditentukan klien | VERIFIED (kode) / NEEDS INVESTIGATION (RLS) | `wishes-service.ts:31–38`; `WISH_APPROVAL_REQUIRED = false` (L7). Tanpa `WITH CHECK` pada policy, status/`is_pinned` bisa diset penyerang. |
| S-10 | P2 | Nama tamu di URL ditampilkan tanpa validasi ke DB | VERIFIED | `[guest]/page.tsx:15–18,46–48`: path acak (mis. `/Transfer-ke-…`) merender "Kepada Yth. …". React meng-escape (bukan XSS), tetapi bisa dipakai spoofing teks di domain asli. OG image juga merender nama dari URL (`invitation-og.tsx:32,203`) tanpa batas panjang. |
| S-11 | P3 | **Token rahasia ikut di query string** | VERIFIED | `useGuestEvents.ts:18,33,56` (`/api/events?guest=<nama~token>`, `/calendar.ics?guest=`) → muncul di log akses. Token juga ada di path URL halaman (by design). |
| S-12 | P3 | `recordGuestView` memakai slug nama (tebakan), bukan token | VERIFIED | `[guest]/page.tsx:25–28`, `guest-link-service.ts:171` → `view_count` bisa digelembungkan. |
| S-13 | P3 | Race non-atomik di skor game | VERIFIED | `game-scores/route.ts:59–77` read-then-write `plays`. Dampak kecil. |
| S-14 | — | `dangerouslySetInnerHTML` di `layout.tsx:68–73` | **FALSE POSITIVE** sebagai injeksi | Isi dari `getThemeCss()`/`getThemeInitScript()` dibangun dari data statis (`theme.ts:615–623`); tidak ada input pengguna. |
| S-15 | — | Skor game: batas `MAX_SCORE` vs `CHECK (score ≤ 2000)` | **FALSE POSITIVE** | `MAX_DURATION=50` → `MAX_RED=159` → `MAX_SCORE=1590` ≤ 2000. Konsisten. |
| S-16 | — | Pesan error dari Supabase diteruskan mentah ke admin | VERIFIED, risiko rendah | `fail(error.message, 500)` di route admin; hanya untuk admin ber-PIN. |
| S-17 | P3 | Env `NEXT_PUBLIC_ADMIN_PIN` sebagai fallback | VERIFIED | `admin-guard.ts:13,27`. Saat ini hanya dibaca server (tidak bocor). Keputusan sebelumnya: dipertahankan. Nilai di Vercel: NOT VERIFIED. |

**Env var yang dibaca kode (hanya nama):** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_PIN`, `NEXT_PUBLIC_ADMIN_PIN`, `NEXT_PUBLIC_SITE_URL`, `WHATSAPP_{PROVIDER,ACCESS_TOKEN,PHONE_NUMBER_ID,MODE,TEMPLATE_NAME,TEMPLATE_LANG,API_VERSION,GRAPH_URL}`, `FONNTE_{TOKEN,API_URL}`, `WAHA_{URL,API_KEY,SESSION}`.

---

## 11. Dead Code Audit

Verifikasi mencakup: `grep` path/nama, `ts-prune`, dynamic import (hanya `jszip` di `PhotoManagement.tsx:139` dan `./admin-guard` di `server/http.ts:49`), route registration, event listener. Tidak ada registrasi komponen berbasis string ditemukan.

| Item | Status | Catatan |
|---|---|---|
| `src/lib/app-settings.ts` | **VERIFIED yatim** | 0 importer; salinan lama dari `src/server/app-settings.ts` (beda hanya `import "server-only"`). Tanpa `server-only` sehingga jebakan bila ada yang mengimpornya dari client. |
| `src/components/ui/FloralAccent.tsx` | VERIFIED yatim | Alias 1 baris ke `Flourish`; 0 referensi. |
| `src/data/couple.ts` | VERIFIED yatim | 0 importer (lihat G-1). |
| `src/constants/storage-keys.ts`, `constants/events.ts` | VERIFIED yatim | |
| `src/lib/errors.ts`, `lib/http.ts`, `lib/format/index.ts` | VERIFIED yatim | `sleep.ts` dipakai 1 file. |
| `server/http.ts`: `withAdminDb`, `okJson`, `GuardResult` | VERIFIED tak terpakai | `withAdminDb` juga memakai `await import("./admin-guard")` yang tidak perlu (tidak ada siklus). |
| `src/types/*` (7 file) | VERIFIED tak terpakai | Lihat F-04. |
| `components/LyricsTester.tsx` | NEEDS INVESTIGATION | Keputusan lama: **dipertahankan**. Satu-satunya jejak pemakaian (komentar di `app/page.tsx` baseline L74) kini hilang bersama C5, jadi sepenuhnya tak terhubung. |
| Export tak terpakai (ts-prune) | VERIFIED | `calendar.ts` (`buildGoogleCalendarUrl`, `downloadICSFile`, `buildWazeUrl`, `buildAppleMapsUrl`), `motion.ts` (`fadeIn`, `staggerContainer`), `getWishesCount`, `theme.ts` (`colors`, `formatRotationInterval`), `invitation.ts` (`fonts`, `Invitation`), `filters-gl.ts:__allowSoftwareGl`. Keputusan lama: dipertahankan. |
| `public/{file,globe,next,vercel,window}.svg` | VERIFIED 0 referensi di `app/`+`src/` | Referensi dari luar repo: NOT VERIFIED. |
| `.font-molani` + `@font-face Molani` + `public/Mollani-Regular.ttf` | VERIFIED tak dipakai | `globals.css:14,33,115`; tidak ada `.tsx` yang memakai kelas itu. |
| `a.patch` | VERIFIED artefak | Patch C1 yang sudah (sebagian) diterapkan. Menyesatkan karena memuat `.env.example` yang tidak ada di repo. |
| Prop `autoOpenCamera` di `InvitationShell` | VERIFIED tak terpakai | Tidak ada pemanggil yang mengirimnya (`InvitationShell.tsx:18,26,30`). |

---

## 12. Technical Debt Inventory

| ID | Debt | Prioritas | Status | Evidence |
|---|---|---|---|---|
| F-06 | `docs/WHATSAPP.md` direferensikan di pesan error pengguna tetapi **tidak ada** | P2 | VERIFIED | `wa/route.ts:149`; tidak ada folder `docs/` |
| F-07 | Baris `sending` bisa macet bila fungsi mati/ditutup di tengah kirim; satu-satunya pemulihan adalah reset manual | P2 | VERIFIED (desain) / NEEDS INVESTIGATION (frekuensi) | `wa/route.ts:161–167,199–240`; budget 45 dtk + timeout 15 dtk ≈ 60 dtk = `maxDuration` (L26,30; `whatsapp.ts:126`). Tidak ada TTL/pemulihan otomatis. UI sudah menjelaskan cara reset (L192–193) |
| F-08 | Tidak ada test sama sekali; refactor bertumpu pada `tsc`/lint/build yang terbukti **tidak** menangkap F-01 | P1 | VERIFIED | — |
| F-09 | Duplikat nama dan slug: slug = `encodeURIComponent(name)`; "Budi" ≠ "budi" menghasilkan dua tamu; dedupe di `parseGuestLines` memakai string persis | P2 | VERIFIED (kode) / NEEDS INVESTIGATION (unik di DB tidak bisa dicek) | `guest-input.ts:21,39`; `GuestLinkGenerator.tsx:263–264`. Bentrok beda-kategori sudah dijaga (L252–260) |
| F-10 | Fungsi trigger `guest_links_protect_category` diredefinisi di 4 migrasi (urutan-sensitif); nama tidak lagi mencerminkan cakupan (kini melindungi 8 kolom) | P3 | VERIFIED | migrasi `009`,`010`,`011`,`013` |
| F-11 | Migrasi `001–003` hilang; tidak ada skema dasar versi | P2 | VERIFIED | `ls supabase/migrations` |
| F-12 | `decodeURIComponent` mentah dapat melempar `URIError` (mis. `/%E0%A4%A`) dan menjatuhkan halaman tamu | P2 | VERIFIED (kode) | `[guest]/page.tsx:17`; bandingkan `og/invitation-og.tsx:25` `safeDecode` yang aman. `fetchGuestLinkBySlug(...).then` juga tanpa `.catch` (L29) |
| F-13 | Komentar basi/menyesatkan | P3 | VERIFIED | `api/admin/photos/route.ts:7` ("see admin-server.ts", file sudah dihapus); `GuestLinkGenerator.tsx:479` (React Compiler); `data/couple.ts:2,10,13` ("10 places"); `api/admin/calendar.ics/route.ts:3` ("H-10 in REFACTORING-FINAL-PLAN.md") |
| F-14 | Satu `!` non-null di `useSyncedLyrics.ts:75`; `g.db!` di `wa/route.ts:224`; `g.res!` ×6; `createClient(url!, key!)` di `supabase.ts:18` | P3 | VERIFIED | Aman dalam konteksnya; tipe `guard()` bisa diperketat |
| F-15 | `readJson<Req>` mengembalikan `{} as Req` saat JSON rusak (tipe berbohong) | P3 | VERIFIED | `server/http.ts:18–24`. Semua pemakai memvalidasi field, jadi aman |
| F-16 | Peringatan lint tersisa 1 | P3 | VERIFIED | `PhotoWall.tsx:457` `no-img-element` (disengaja) |
| F-17 | Tiga `window.confirm` untuk aksi destruktif | P3 | VERIFIED | `PhotoManagement:114`, `GuestLinkGenerator:587`, `WishesManagement:65` (konsistensi UX, bukan bug) |
| F-18 | Aksesibilitas: hanya diperiksa pola kasar (tidak ada `div/span onClick`, 4 `<img>`); atribut `alt`/label tidak diverifikasi satu per satu | — | NOT VERIFIED | — |
| F-19 | `.gitignore` mengabaikan `.env*` tanpa pengecualian `!.env.example` | P2 | VERIFIED | `.gitignore:33–34` |
| F-20 | Struktur folder belum rapi: `components/` datar (30 file), `lib/` campur, nama file tidak seragam (`escapeCSV.ts`, `guest-grouping.ts`, `events-types.ts`, `floating-bar.ts`) | P3 | VERIFIED | M-1/M-2 historis |

---

## 13. Validation Results & Perbandingan dengan Audit Historis

### 13.1 Validasi teknis (dijalankan di sandbox, commit `6584830`)

| Perintah | Hasil | Detail |
|---|---|---|
| `npm ci` | OK | |
| `npx tsc --noEmit` | **PASS** (exit 0) | 0 error |
| `npm run lint` | **PASS** | 0 error, **1 warning**: `PhotoWall.tsx:457` `@next/next/no-img-element` (sudah ada sejak baseline) |
| `npm run build` | **GAGAL di sandbox → PASS dengan font di-mock** | Kegagalan awal: `fonts.googleapis.com` tidak terjangkau dari sandbox (keterbatasan lingkungan, bukan bug proyek). Dengan `NEXT_FONT_GOOGLE_MOCKED_RESPONSES`: kompilasi dan TypeScript sukses, 8/8 halaman statis, **24 route** (daftar di bagian 2). Pesan `Missing Supabase credentials` muncul karena env tidak diisi di sandbox. |
| `npx madge --circular --extensions ts,tsx src/` | **PASS** | 0 siklus (juga 0 dengan `app/`, 136 file) |
| `npx ts-prune` | 50 export tak terpakai sama sekali + 43 yang hanya dipakai di modulnya sendiri (di luar `app/` dan `.next`) | Rincian di bagian 11 |
| Test | **Tidak ada** | — |

**Efek samping validasi:** hanya di salinan sandbox (`node_modules`, `.next`, `tsconfig.tsbuildinfo`, `next-env.d.ts`). Repo kamu tidak tersentuh.
**Tidak dijalankan:** uji manual/browser, profiling, inspeksi DB/RLS/Storage, build dengan env produksi.
**Catatan penting:** lolosnya empat validasi di atas **tidak membuktikan paritas perilaku**: F-01 lolos semuanya.

### 13.2 Verifikasi klaim `AUDIT-DAN-RENCANA-REFACTOR.md` / laporan 2026-11-10 terhadap kondisi aktual

| Item historis | Klaim | Kondisi aktual | Status |
|---|---|---|---|
| C-1 siklus RSVP↔service | diperbaiki di C2 | madge 0 siklus | VERIFIED |
| C-2 server reorg + `server-only` | C3/C4 | `src/server/*` ada dan ber-`server-only`; `lib/admin-server.ts` dihapus; **`lib/app-settings.ts` lama masih ada** | PARSIAL |
| C-3 fallback `NEXT_PUBLIC_ADMIN_PIN` | dipertahankan (keputusan) | masih ada (`admin-guard.ts:13`) | VERIFIED (sesuai keputusan) |
| C-4 error ESLint | C5 | lint 0 error | VERIFIED |
| H-1 komposisi ganda | C5 | tersatukan, **dengan regresi F-01** | PARSIAL |
| H-2 status moderasi | C2 | `types/moderation.ts` ada; route memakai tetapi dengan cast literal (D-7); `PhotoStatus`/`WishStatus` didefinisikan 2–3× | PARSIAL |
| H-3 attendance | C2 | route masih punya tipe lokal; `EventAttendance` terpisah (D-6) | BELUM TUNTAS |
| H-4 boilerplate route admin | C4 | `requireAffected`, `readJson` dipakai; `withAdminDb`/`okJson` **tidak** dipakai | PARSIAL |
| H-5 hook admin bersama | C6a | tidak ada `useAdminResource` | BELUM |
| H-6 pecah `GuestLinkGenerator` | C6b | 1.403 baris (baseline 1.405) | BELUM |
| H-7 ekstraksi PhotoBoothModal | C8 | 769 baris, `sleep` lokal masih ada | BELUM |
| H-8 nama pasangan via `couple.ts` | C3 | **0 importer**; 17 pemakaian `split(" ")` tersisa | BELUM (modul yatim) |
| H-9 kode mati | C7 | sebagian sengaja dipertahankan; `FloralAccent` dan `lib/app-settings.ts` masih ada | BELUM |
| H-10 `/api/admin/calendar.ics` | re-export | re-export terverifikasi | VERIFIED |
| H-11 ESLint | C1 | 0 error / 1 warning | VERIFIED |
| M-2 pemusatan kunci storage | C3 | file dibuat, **0 importer**, definisi ganda | BELUM (modul yatim) |
| M-3 gaya import | C7 | 213 alias / 48 relatif | BELUM |
| M-4 konstanta kolom | C2 | `COLUMNS` masih 3× | BELUM |
| M-9 helper `fetch` | C3 | `lib/http.ts` **0 importer** | BELUM (modul yatim) |
| L-1 `.gitignore` UTF-8 | C1 | baris 1 terbaca normal (encoding tidak diperiksa dengan `file`) | VERIFIED (visual) |
| L-2 `admin.patch` | dihapus | dihapus, tetapi `a.patch` ter-commit | PARSIAL |
| L-3 README + `.env.example` | C1 | README ada; **`.env.example` tidak ada** | PARSIAL |
| L-4 konstanta cache-bust | C3 | masih 2 definisi (D-17) | BELUM |
| Tag rollback, `vitest` | rencana | tidak ada | BELUM |

**Koreksi terhadap audit lama (G-1, FALSE POSITIVE):** audit lama menyebut "10 tempat memakai `[0]` untuk mempelai wanita; hanya `PhotoBoothModal` memakai `[2]`". Di HEAD, **semua** pemakaian nama mempelai wanita memakai indeks `[2]` (kecuali `Opening.tsx:136` yang memakai `slice(-2)`). Komentar di `data/couple.ts` ("10 places", `COUPLE_SHORT_BRIDE_FIRST … used in most places`) tidak sesuai kenyataan. Jangan "menyeragamkan" indeks; cukup satu sumber nilai bila nanti diadopsi, dengan **string hasil identik**.

### 13.3 Status fase C1–C8 (diverifikasi dari source)

| Fase | Klaim laporan | Status aktual |
|---|---|---|
| C1 | PASS | **PARSIAL**: `.env.example` hilang; `a.patch` tertinggal |
| C2 | PASS | **PARSIAL**: tipe disalin, bukan dipindah; sebagian besar tak terpakai |
| C3 | PASS | **PARSIAL**: modul dibuat, hampir semua tak diadopsi |
| C4 | "belum" | **PARSIAL**: struktur `src/server/*` ada; helper tak diadopsi; salinan lama tersisa |
| C5 | "selesai, 2 bug" | **SELESAI DENGAN REGRESI** (F-01) |
| C6–C8 | belum | **BELUM DIMULAI** |

---

## 14. Refactoring Roadmap

Prinsip: satu fase = satu tujuan, perilaku tetap, bisa di-revert terpisah. **Tidak ada fase yang boleh dimulai tanpa persetujuan.** Fase R0–R1 aman dan kecil; R2 butuh persetujuan karena menyentuh auth/RLS.

### R0 — Pulihkan paritas halaman tamu (F-01)
1. **Tujuan:** kembalikan perilaku `/` dan `/[guest]` persis seperti baseline `52d2de0`.
2. **File:** `InvitationShell.tsx`, `InvitationSections.tsx`, `app/[guest]/page.tsx`.
3. **Masalah:** footer ganda; `guestName` ke PhotoBooth hilang; elemen fixed di luar `<main>`; deep-link di `/[guest]`; `CatchTheLove` nama `"Tamu"`.
4. **Perubahan:** teruskan `guestName` ke `PhotoBooth`; satu `Footer` saja; kembalikan `Footer/LyricsRail/FloatingBar` ke dalam `<motion.main>` (atau konfirmasi bahwa pemindahan disengaja); batasi deep-link ke `/` (atau konfirmasi); kembalikan kondisi `CatchTheLove`; hapus prop `autoOpenCamera` yang tak terpakai.
5. **Dependensi:** tidak ada.
6. **Risiko regresi:** rendah–sedang.
7. **Validasi:** diff pohon JSX baseline vs sesudah untuk kedua halaman; uji manual: footer tunggal, nama terisi di modal foto, `?camera=open` di `/`, tema/musik/lirik.
8. **Kriteria selesai:** pohon JSX identik dengan baseline untuk `/` dan `/[guest]` (selain perbedaan yang kamu setujui).
9. **Commit:** 1 commit `fix(invitation): restore baseline parity`.

### R1 — Kejujuran repo dan dokumentasi (tanpa perubahan runtime)
1. **Tujuan:** repo mencerminkan realitas.
2. **File:** `.gitignore`, `.env.example` (baru, **tanpa nilai**), `README.md`, `a.patch` (hapus), referensi `docs/WHATSAPP.md`, komentar basi (F-13), tag git.
3. **Masalah:** F-04, F-06, F-13, F-19.
4. **Perubahan:** tambah `!.env.example` di `.gitignore`, commit `.env.example`; hapus `a.patch`; tulis `docs/WHATSAPP.md` pendek atau ubah pesan error (ini mengubah **teks error API**, jadi butuh persetujuan: alternatif aman: tulis dokumennya); buat tag `refactor/pre-R*`.
5. **Dependensi:** tidak ada.
6. **Risiko:** sangat rendah (kecuali teks error).
7. **Validasi:** `tsc`, `lint`, `build`; cek `git ls-files`.
8. **Selesai:** README tidak mengacu ke file yang tidak ada.
9. **Commit:** 1 commit docs/chore.

### R2 — Hardening keamanan (butuh persetujuan; urut: verifikasi → keputusan → perubahan)
1. **Tujuan:** menutup F-02, F-03, S-6–S-10.
2. **File:** `admin-guard.ts`, `AdminAuth.tsx`, `admin-fetch.ts`, `rsvp-service.ts`, `guest-link-service.ts`, route admin baru, migrasi baru.
3. **Langkah:** (a) **read-only:** keluarkan `pg_policies` dan policy Storage, commit snapshot `001_baseline.sql`; (b) bila terbukti longgar, tambahkan route admin untuk `rsvp` read dan `guest_links` detail/upsert (kontrak **aditif**), lalu pindahkan pemanggil; cabut policy anon lewat migrasi terpisah **setelah** deploy (urutan seperti migrasi 005); (c) rate-limit PIN dan endpoint publik; (d) verifikasi objek Storage di `photobooth/submit`.
4. **Dependensi:** R1.
5. **Risiko:** sedang–tinggi (auth, RLS, bisa mengunci admin).
6. **Validasi:** uji matriks per route (status + body per cabang validasi); uji manual login admin; uji bahwa anon key tidak lagi bisa membaca `rsvp_guests`.
7. **Selesai:** anon key tidak punya akses ke data admin; PIN dibatasi percobaannya.
8. **Commit:** terpisah per langkah (a), (b), (c), (d).

### R3 — Putuskan nasib modul C2/C3 yang yatim (adopsi atau hapus)
1. **Tujuan:** satu sumber kebenaran per konsep.
2. **File:** `types/*`, `constants/*`, `lib/{errors,http,format}`, `data/couple.ts`, service dan komponen pemakai.
3. **Perubahan:** per modul pilih satu: **adopsi** (ganti impor, hapus definisi lama; mis. `getErrorMessage` mengganti 26 pola, `types/*` menggantikan salinan di service) atau **hapus**. Nilai storage key, nama event, dan string nama pasangan **harus identik**.
4. **Dependensi:** R0 (supaya diff bersih).
5. **Risiko:** rendah–sedang (mekanis, dijaga `tsc`).
6. **Validasi:** `tsc`, `lint`, build, madge, `ts-prune` turun; daftar route identik; bandingkan nilai konstanta lama/baru.
7. **Selesai:** `ts-prune` tidak lagi melaporkan modul baru C2/C3; tidak ada tipe entitas yang didefinisikan 2×.
8. **Commit:** satu commit per modul.

### R4 — Pembersihan kode mati yang sudah disetujui
`src/lib/app-settings.ts`, `FloralAccent.tsx`, SVG boilerplate, `.font-molani`/Mollani (sesuai keputusan lama untuk yang boleh dihapus), `a.patch`. Risiko rendah; validasi `tsc`/`lint`/build/route list. 1 commit.

### R5 — Pola admin bersama (`useAdminResource`)
1. **File:** `WishesManagement`, `PhotoManagement`, `RSVPManagement`, hook baru.
2. **Perubahan:** ekstrak hanya pola load/error/busy yang identik; **jangan** menggabungkan panel; teks tampilan tidak berubah.
3. **Dependensi:** R3 (`getErrorMessage`).
4. **Risiko:** sedang. **Validasi:** smoke test tiap panel + diff teks UI. **Selesai:** workaround `startTransition` hilang dari ketiga panel. **Commit:** 1 per panel.

### R6 — Pecah `GuestLinkGenerator` (paling berisiko, dikerjakan terakhir)
1. **Prasyarat wajib:** test karakterisasi (vitest, *perlu persetujuan menambah devDependency*) untuk fungsi murni: `parseGuestLines`, `normalizeIdPhone`, `splitGuestSegment/buildGuestSegment`, `toGuestCategory`, `guest-grouping`, `escapeCSVField`. Ditulis terhadap kode **sebelum** diubah.
2. **Urutan micro-commit (pindah dulu, jangan ubah logika):** (1) `Chip`/`Badge` ke file sendiri; (2) `GuestRow` dari `renderRow`; (3) `GuestFilterBar`; (4) `BulkActionBar`; (5) `GeneratorForm`; (6) hook `useGuestSelection`; (7) hook `useWhatsAppOutbox`; (8) hook `useGuestLinks`; (9) orkestrator. Pertimbangkan `React.memo` pada `GuestRow` atau aktifkan React Compiler **sebagai keputusan terpisah** (dependency + konfigurasi).
3. **Risiko:** tinggi. **Validasi:** test, `tsc`, lint, build, diff JSX, uji manual alur: generate, bentrok kategori, bulk side/kategori, simpan nomor, kirim massal, reset status, hapus.
4. **Selesai:** komponen utama ≤ ~350 baris; perilaku identik di semua alur di atas.

### R7 — PhotoBooth/PhotoWall terbatas
Ekstrak hanya fungsi murni dari `PhotoBoothModal` (cooldown, `ensureFonts`, nama file, `sleep`); PhotoWall: bandingkan hasil polling sebelum `setPhotos`, evaluasi thumbnail (butuh keputusan Storage/transform). **Tidak menyentuh** `filters*`, `frames`, `compose`, JPEG 0.93, alur upload→submit→approval. Risiko sedang. Validasi uji manual di HP nyata.

### R8 — Opsional: reorganisasi folder dan gaya import
`components/sections/`, alias vs relatif, penamaan handler. Hanya perubahan path; commit terpisah; tunda sampai R0–R6 stabil.

**Dependensi antar fase:** R0 → R3 → R5 → R6; R1 independen; R2 setelah R1; R4 setelah R3; R7 independen setelah R0.

---

## 15. Risk Assessment

| Area | Risiko jika dibiarkan | Risiko jika diubah | Mitigasi |
|---|---|---|---|
| Paritas halaman tamu (F-01) | **Tinggi**: sudah tayang bila `main` = produksi | Rendah | R0 segera |
| Admin auth/RLS (F-02/F-03) | Tinggi bila RLS longgar atau PIN pendek; **belum terverifikasi** | Sedang–tinggi | Verifikasi dulu, perubahan aditif, migrasi cabut policy terpisah |
| Modul yatim/tipe ganda (F-04) | Sedang, drift diam-diam | Rendah | R3 mekanis |
| `GuestLinkGenerator` | Sedang (performa, maintenance) | **Tinggi** | Test karakterisasi + micro-commit |
| Pengiriman WhatsApp | Sedang (baris `sending` macet, spam endpoint) | Tinggi bila menyentuh perilaku kirim | **Jangan ubah** perilaku kirim; hanya ekstraksi murni |
| PhotoBooth/PhotoWall | Rendah–sedang (perf mobile belum terukur) | Sedang | Uji di perangkat nyata |
| Tanpa test | Tinggi (F-01 lolos semua gerbang) | — | Test karakterisasi sebelum R6 |
| Migrasi/skema | Sedang (`001–003` hilang, trigger berlapis) | Tinggi | Snapshot baseline; jangan edit migrasi lama |

---

## 16. Final Recommendations

**Urutan paling aman:**
1. **R0** (fix paritas) → sebelum apa pun yang lain; ini satu-satunya temuan yang sudah memengaruhi pengguna.
2. **Verifikasi RLS** (SQL read-only dari F-03): 15 menit, menentukan apakah F-03 berstatus P0.
3. **R1** → **R3/R4** (kejujuran repo, adopsi atau hapus modul yatim).
4. **Tambah test karakterisasi** → **R5** → **R6**.
5. R2 (hardening) dijadwalkan segera setelah hasil verifikasi RLS, bukan menunggu R6.

**Jangan dilakukan (tetap berlaku):** mengubah nama kolom/RPC/kunci storage/path URL/teks error API; "menyeragamkan" indeks nama mempelai; menyentuh pipeline filter/frame/kompres/upload PhotoBooth; mengubah perilaku kirim WhatsApp; mengubah skema atau RLS tanpa fase R2.

**Keputusan yang saya butuhkan dari kamu:**
1. Apakah footer/LyricsRail/FloatingBar di luar `<main>` dan deep-link di `/[guest]` **disengaja**, atau harus kembali ke baseline?
2. Bersedia menjalankan SQL `pg_policies` (read-only) dan membagikan hasilnya (tanpa secret)?
3. Setuju menambah `vitest` (devDependency) sebelum R6?
4. Untuk tiap modul yatim C2/C3 (F-04): **adopsi** atau **hapus**? (Rekomendasi: adopsi `getErrorMessage`, `types/*`, `constants/*`; hapus `lib/http`, `withAdminDb`, `okJson`.)
5. Apakah `main` saat ini = produksi? Jika ya, R0 mendesak.

---

*Audit ini bersifat diagnosis. Tidak ada refactoring, commit, perubahan database/dependency/konfigurasi, atau perubahan kode yang dilakukan pada repository.*
