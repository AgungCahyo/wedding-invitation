# Audit Report — wedding-invitation

**Tanggal**: 2026-11-10  
**Baseline Commit**: `52d2de0` — "mini game"  
**Current HEAD**: `4f48477` — "refactor(C3): shared utilities..."  
**Branch**: `main` (ahead 3 dari `origin/main`)

---

## 1. Ringkasan Git Status

| Item | Nilai |
|------|-------|
| **Commit terakhir** | `4f48477` (C3 selesai) |
| **File modified (uncommitted)** | `app/page.tsx`, `app/[guest]/page.tsx` |
| **File untracked** | `src/components/invitation/InvitationShell.tsx`, `src/components/invitation/InvitationSections.tsx`, `src/hooks/useCameraDeepLink.ts` |
| **File staged** | Tidak ada |
| **File deleted (uncommitted)** | Tidak ada |

---

## 2. Commit History Since Baseline (52d2de0..HEAD)

| Hash | Pesan | Fase | Status |
|------|-------|------|--------|
| `6ccec2a` | refactor(C1): safe cleanup — unused imports, .env.example, README, delete admin.patch | **C1** | ✅ Committed |
| `b382a78` | refactor(C2): types/ — break RSVP cycle, unify moderation/attendance types, move types from components | **C2** | ✅ Committed |
| `4f48477` | refactor(C3): shared utilities — errors, http, sleep, format, couple, constants/storage-keys, constants/event... | **C3** | ✅ Committed |

> **C4–C8 belum di-commit**. C5 ada di working tree (uncommitted).

---

## 3. Detail Perubahan per Fase

### C1 — Safe Cleanup (`6ccec2a`)

**File Dihapus**:
- `admin.patch` (47KB) — artifact lama

**File Baru**:
- `.env.example` — 18 environment variables
- `README.md` — rewrite arsitektur, env, migrasi

**File Modified (hapus unused imports)**:
- `app/page.tsx` — hapus `PhotoBoothModal`
- `src/components/Couple.tsx` — hapus `index` param
- `src/components/Opening.tsx` — hapus `NameLine`, `brideName`, `groomName`
- `src/components/Story.tsx` — hapus `gallery`
- `src/components/ThemeSwitcher.tsx` — hapus `formatRotationInterval`
- `src/components/admin/guests/GuestLinkGenerator.tsx` — hapus `mode` state

**Validasi**: `tsc --noEmit` ✅, `eslint` ✅ (1 error remain: C-4 di `app/page.tsx:33`)

---

### C2 — Types & Cycles (`b382a78`)

**File Baru (src/types/)**:
| File | Exports |
|------|---------|
| `rsvp.ts` | `Attendance`, `EventResponses`, `GuestResponse`, `RSVPFormData`, `initialRSVPForm`, `ATTENDANCE_OPTIONS` |
| `moderation.ts` | `ModerationStatus`, `MODERATION_STATUSES`, `WishStatus`, `PhotoStatus` |
| `wish.ts` | `WishRecord`, `PublicWish`, `WishStatus` |
| `photo.ts` | `PhotoRecord`, `PhotoSettings`, `PhotoStatus` |
| `event.ts` | `PublicEvent`, `EventAttendance` |
| `guest.ts` | `GuestLinkRecord`, `GeneratedLink`, `ParsedGuest`, `WaGuestRow` |
| `admin.ts` | `AdminTab` |

**File Modified (import updates — 15+ file)**:
- `src/components/RSVP.tsx`
- `src/lib/rsvp-service.ts`
- `src/lib/wishes-service.ts`
- `src/lib/photo-service.ts`
- `src/lib/events-types.ts`
- `app/api/admin/wishes/route.ts`
- `app/api/admin/photos/route.ts`
- `app/api/admin/guest-links/route.ts`
- `src/components/admin/guests/GuestLinkGenerator.tsx`
- `src/components/admin/AdminDashboard.tsx`
- `src/components/admin/layout/AdminNavigation.tsx`
- `src/components/admin/wishes/WishStatusBadge.tsx`
- `src/components/admin/photos/PhotoManagement.tsx`
- `src/components/admin/wishes/WishesManagement.tsx`

**Tujuan**: Pecah circular dependency `RSVP.tsx ↔ rsvp-service.ts`, unifikasi tipe moderation.

**Perilaku**: Tidak ada perubahan runtime.

---

### C3 — Shared Utilities (`4f48477`)

**File Baru (src/lib/)**:
| File | Exports |
|------|---------|
| `errors.ts` | `getErrorMessage(err, fallback)` |
| `http.ts` | `parseJsonSafe`, `requestJson`, `postJson`, `getJson`, `patchJson`, `deleteJson` |
| `sleep.ts` | `sleep(ms)` |
| `format/index.ts` | `formatDate`, `splitEventDate`, `formatEventDate` |

**File Baru (src/data/)**:
| File | Exports |
|------|---------|
| `couple.ts` | `groomFirstName`, `brideFirstName`, `brideNickname`, `COUPLE_SHORT`, `COUPLE_SHORT_BRIDE_FIRST`, `COUPLE_FULL` |

**File Baru (src/constants/)**:
| File | Exports |
|------|---------|
| `storage-keys.ts` | `THEME_KEY`, `CATCH_LOVE_BEST_KEY`, `CATCH_LOVE_NAME_KEY`, `PHOTOBOOTH_LAST_SEND_KEY`, `ADMIN_PIN_KEY`, `ADMIN_AUTH_KEY` |
| `events.ts` | `WINDOW_EVENTS` (photobooth:open/close/captured) |

**File Baru (src/server/)**:
| File | Exports |
|------|---------|
| `db.ts` | `serviceClient()` dengan `import "server-only"` |
| `http.ts` | `fail`, `okJson`, `readJson`, `requireAffected`, `withAdminDb` |
| `admin-guard.ts` | `guard()` dengan `import "server-only"` |
| `app-settings.ts` | `readBoolSetting`, `writeBoolSetting` dengan `import "server-only"` |

**File Modified (10 API routes updated)**:
- `app/api/admin/wishes/route.ts`
- `app/api/admin/photos/route.ts`
- `app/api/admin/guest-links/route.ts`
- `app/api/admin/wa/route.ts`
- `app/api/admin/auth/route.ts`
- `app/api/admin/photo-settings/route.ts`
- `app/api/admin/calendar.ics/route.ts`
- `app/api/rsvp/route.ts`
- `app/api/game-scores/route.ts`
- `app/api/photobooth/submit/route.ts`
- `src/server/guest-access.ts` (import `serviceClient`)

**Tujuan**: Konsolidasi boilerplate fetch, error handling, auth guard, db client.

**Perilaku**: Tidak ada perubahan kontrak API.

---

## 4. Uncommitted Changes — C5 Invitation Composition

### File Baru (Untracked)

| File | Fungsi |
|------|--------|
| `src/components/invitation/InvitationShell.tsx` | Shell: `MusicProvider` + `Opening` + transition + `PhotoBooth` placement (inside/outside) + `Footer`/`LyricsRail`/`FloatingBar` |
| `src/components/invitation/InvitationSections.tsx` | Section order: Couple → Quote → EventDetails → Countdown → ImageBreak → Story → Gallery → RSVP → Wishes → CatchTheLove → DigitalGift → Closing → Footer (conditional) |
| `src/hooks/useCameraDeepLink.ts` | Hook `?camera=open` deep-link dengan `startTransition` |

### File Modified

| File | Sebelum | Sesudah |
|------|---------|---------|
| `app/page.tsx` | 81 lines: manual state, useEffect, inline sections | 12 lines: `<InvitationShell photoBoothPlacement="outside">` + `<InvitationSections />` |
| `app/[guest]/page.tsx` | 127 lines: manual state, Opening render, inline sections | ~60 lines: `<InvitationShell photoBoothPlacement="inside" guestName={guestName}>` + `<InvitationSections welcomeSection={...}>` |

---

## 5. Status Fase C1–C8

| Fase | Nama | Status |
|------|------|--------|
| **C1** | Safe Cleanup | ✅ Selesai (committed: `6ccec2a`) |
| **C2** | Types & Cycles | ✅ Selesai (committed: `b382a78`) |
| **C3** | Shared Utilities | ✅ Selesai (committed: `4f48477`) |
| **C4** | Public API Consolidation | ❌ Belum dikerjakan |
| **C5** | Invitation Composition | ⚠️ Selesai tapi **belum di-commit** (ada 2 bug) |
| **C6** | Admin Panel Shared Patterns | ❌ Belum dikerjakan |
| **C7** | Dead Code & Import Standardization | ❌ Belum dikerjakan |
| **C8** | Section Reorganization + PhotoBoothModal | ❌ Belum dikerjakan |

---

## 6. Investigasi Bug (Read-Only Analysis)

### BUG 1: Root URL Langsung Membuka PhotoBooth

**Kode Baseline (`app/page.tsx` di `52d2de0`)**:
```tsx
const [autoOpenCamera, setAutoOpenCamera] = useState(false);
useEffect(() => {
  if (url.searchParams.get("camera") === "open") {
    setAutoOpenCamera(true);  // Hanya true jika ?camera=open
  }
}, []);
<PhotoBooth autoOpen={autoOpenCamera} />
```

**Kode Working Tree (`app/page.tsx`)**:
```tsx
<InvitationShell photoBoothPlacement="outside" autoOpenCamera>
  <InvitationSections />
</InvitationShell>
```

**Kode `InvitationShell.tsx`**:
```tsx
autoOpenCamera = false,  // default false
{photoBoothPlacement === "outside" && <PhotoBooth autoOpen={autoOpenCamera} />}
```

**Akar Masalah**: 
- `<InvitationShell ... autoOpenCamera>` = JSX boolean shorthand = `autoOpenCamera={true}`
- Prop default `false` ditimpa explicit `true` dari shorthand
- `PhotoBooth` terima `autoOpen={true}` → kamera buka otomatis tanpa `?camera=open`

**File Terkait**: `app/page.tsx` (line 8), `src/components/invitation/InvitationShell.tsx` (line 26, 52, 54)

---

### BUG 2: Opening Muncul Dua Kali di Guest Page

**Kode Baseline (`app/[guest]/page.tsx` di `52d2de0`)**:
```tsx
const [showOpening, setShowOpening] = useState(true);
return (
  <MusicProvider>
    <AnimatePresence mode="wait">
      {showOpening && <Opening key="opening" onEnter={() => setShowOpening(false)} guestName={guestName} />}
    </AnimatePresence>
    {!showOpening && <motion.main>...sections...</motion.main>}
  </MusicProvider>
);
```
→ Satu `showOpening` state, satu `Opening` render.

**Kode Working Tree (`app/[guest]/page.tsx` sebelum fix manual)**:
```tsx
// Masih punya MusicProvider + AnimatePresence + Opening + showOpening state sendiri
return (
  <MusicProvider>
    <AnimatePresence mode="wait">
      {showOpening && <Opening ... />}
    </AnimatePresence>
    {!showOpening && <InvitationShell ... />}
  </MusicProvider>
);
```

**Kode `InvitationShell.tsx`**:
```tsx
const [showOpening, setShowOpening] = useState(true);
return (
  <MusicProvider>
    <AnimatePresence mode="wait">
      {showOpening && <Opening key="opening" onEnter={() => setShowOpening(false)} guestName={guestName} />}
    </AnimatePresence>
    {!showOpening && <...>...children...</>}
  </MusicProvider>
);
```

**Akar Masalah**:
- Guest page **punya** `MusicProvider` + `AnimatePresence` + `Opening` + `showOpening` state
- `InvitationShell` **juga punya** `MusicProvider` + `AnimatePresence` + `Opening` + `showOpening` state sendiri
- **Dua kali render** `Opening` → animasi dobel

**File Terkait**: `app/[guest]/page.tsx`, `src/components/invitation/InvitationShell.tsx`

> Catatan: Working tree sudah diperbaiki manual (hapus `MusicProvider`/`AnimatePresence`/`showOpening`/`Opening` dari guest page), tapi **belum di-commit**.

---

## 7. Validasi Terakhir (Dijalankan Sekarang)

| Check | Command | Status | Detail |
|-------|---------|--------|--------|
| **TypeScript** | `npx tsc --noEmit` | ✅ PASS | 0 errors |
| **ESLint** | `npm run lint` | ✅ PASS | 0 errors, 1 warning (pre-existing: `PhotoWall.tsx` @next/next/no-img-element) |
| **Build** | `npm run build` | ✅ PASS | Compile success, static generation success |
| **Circular Dependency** | `npx madge --circular --extensions ts,tsx src/` | ✅ PASS | 0 cycles (112 files) |

> Semua validasi **benar-benar dijalankan** pada working tree saat ini (termasuk uncommitted C5 changes).

---

## 8. Kondisi Proyek Saat Ini

### ✅ Sudah Berubah (Committed C1–C3)
- Types terpusat di `src/types/` — circular dependency RSVP hilang
- Shared utilities di `src/lib/`, `src/server/`, `src/constants/`, `src/data/`
- API routes pakai shared modules — kontrak API tidak berubah
- Dead code `admin.patch` dihapus
- Documentation `.env.example`, `README.md` dibuat
- Zero circular dependencies (validasi madge)

### ⚠️ Belum Selesai / Uncommitted (C5)
- 3 file baru: `InvitationShell.tsx`, `InvitationSections.tsx`, `useCameraDeepLink.ts`
- 2 file modified: `app/page.tsx`, `app/[guest]/page.tsx`
- **2 Bug aktif**:
  1. Root URL auto-buka PhotoBooth (boolean shorthand)
  2. Guest page double Opening (sudah fix manual, belum commit)

### ❌ Belum Dikerjakan (C4, C6, C7, C8)

### 🔴 Perubahan Berisiko
| Item | Risiko | Rekomendasi |
|------|--------|-------------|
| C5 uncommitted dengan bug | HIGH — production broken jika commit | Jangan commit sebelum fix |
| `server-only` imports | MEDIUM — build-time enforcement | Sudah validasi build pass |
| Type moves (C2) | LOW — import path only | Sudah validasi |

### 🔄 Perlu Rollback?
- **Tidak** untuk C1–C3 (committed, validasi pass, zero behavior change)
- **C5 working tree** — sebaiknya **fix dulu** (bukan rollback), lalu commit. Atau `git stash` jika pause.

---

## 9. Rekomendasi Lanjutan

1. **Fix Bug 1**: `app/page.tsx` line 8 → hapus `autoOpenCamera` prop (biarkan default `false`)
2. **Fix Bug 2**: Verifikasi `app/[guest]/page.tsx` tidak render `MusicProvider`/`AnimatePresence`/`Opening` sendiri
3. **Commit C5** setelah fix divalidasi
4. **Lanjut C4** sesuai rencana

---

**Status Keseluruhan**: Proyek stabil di C3. C5 perlu 2 fix kecil sebelum commit. C4–C8 belum dimulai.