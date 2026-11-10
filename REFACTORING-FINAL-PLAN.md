# Final Refactoring Plan — wedding-invitation

**Status**: Approved for implementation (all ⛔ decisions resolved)
**Baseline commit**: `52d2de0 "mini game"`
**Source**: Reconciled from `AUDIT-DAN-RENCANA-REFACTOR.md` + fresh audit validation

---

## Decisions Summary (from user approval)

| Item | Decision | Notes |
|------|----------|-------|
| **C1–C3** | ✅ Proceed | Safe, no behavior change |
| **C-3** (NEXT_PUBLIC_ADMIN_PIN fallback) | ❌ Keep fallback | Document correct name in `.env.example` only |
| **H-10** (admin/calendar.ics) | ✅ Re-export | Keep URL, deduplicate code |
| **H-9** (dead code) | ⚠️ Partial | Keep `LyricsTester.tsx`, `__allowSoftwareGl`; delete rest |
| **L-2** (admin.patch) | ✅ Delete | Old patch artifact |
| **Deps** | ✅ Add both | `server-only` + `vitest` |
| **C8** | ✅ Proceed | Sections move + limited PhotoBoothModal extraction |

---

## Phase Plan (C1–C8)

Each phase = one commit, validated independently.

### ✅ C1 — Safe Cleanup (no behavior change)
- Fix ESLint warnings (unused imports/variables) — **except** `app/page.tsx:33` (C-4, handled in C5)
- Rewrite `.gitignore` as UTF-8 (remove BOM)
- Create `.env.example` with all env vars read by code
- Write proper `README.md` (architecture, env, migrations)
- Delete `admin.patch`
- **Validation**: `tsc --noEmit`, `eslint` (1 error remains: C-4)

### ✅ C2 — Types & Cycles (type-only, no runtime change)
- Create `src/types/`:
  - `rsvp.ts` — `Attendance`, `EventResponses`, `GuestResponse`, `RSVPFormData` (fixes C-1 cycle)
  - `moderation.ts` — `ModerationStatus`, `MODERATION_STATUSES` (unifies H-2)
  - `wish.ts` — `WishRecord`, `PublicWish`, `WishStatus = ModerationStatus`
  - `photo.ts` — `PhotoRecord`, `PhotoSettings`, `PhotoStatus = ModerationStatus`
  - `event.ts` — `PublicEvent` (from `events-types.ts`)
  - `guest.ts` — `GuestLinkRecord`, `GeneratedLink`, `ParsedGuest`, `WaGuestRow`
  - `admin.ts` — `AdminTab` (from `admin/types.ts`)
- Move `RSVPFormData` from `components/RSVP.tsx` → `types/rsvp.ts`
- Column constants per table (fixes M-4)
- **Validation**: `tsc --noEmit`, `madge --circular` (target: 0)

### ✅ C3 — Shared Utilities (pure logic, no side effects)
- `lib/errors.ts` — `getErrorMessage(err, fallback)` (consolidates 23 occurrences)
- `lib/http.ts` — `parseJsonSafe`, `requestJson` (consolidates M-9)
- `lib/format/` — date formatters (M-6, no output change)
- `data/couple.ts` — `firstName`, `COUPLE_SHORT`, `BRIDE_NICKNAME` (H-8, 11 sites)
- `constants/storage-keys.ts` — all localStorage/sessionStorage keys (M-2)
- `constants/events.ts` — window event names (`photobooth:open`, etc.)
- Install `server-only`, add `import "server-only"` to `src/server/*`
- **Validation**: `tsc --noEmit`, `eslint`

### ⚠️ C4 — Server Reorganization (mechanically moves server-only code)
- Create `src/server/` structure:
  - `db.ts` — `serviceClient()` (from `admin-server.ts`)
  - `http.ts` — `fail()`, `okJson()`, `readJson()`, `withAdminDb()`, `requireAffected()` (H-4)
  - `admin-guard.ts` — `guard()` (from `admin-server.ts`)
  - `app-settings.ts` — (from `lib/app-settings.ts`)
  - Keep existing: `events.ts`, `guest-access.ts`, `wa-compose.ts`, `whatsapp.ts`
- Update all route imports (admin + public routes using service-role)
- **Validation**: `tsc --noEmit`, `eslint`, build route list comparison

### ⚠️ C5 — Invitation Composition (deduplicates H-1, fixes C-4)
- Create `src/components/invitation/InvitationShell.tsx`:
  - MusicProvider + Opening + transition to `<main>` (shared logic)
- Create `src/components/invitation/InvitationSections.tsx`:
  - Common section order as slot-based composition
  - Props: `guestName?`, `welcomeBlock?`, `photoBoothPlacement?` ("outside" | "inside")
- Refactor `app/page.tsx` → thin wrapper (deep-link `?camera=open` → `useCameraDeepLink` hook)
- Refactor `app/[guest]/page.tsx` → thin wrapper (welcome block + `photoBoothPlacement="inside"`)
- Extract `useCameraDeepLink` hook (fixes C-4 ESLint error with `startTransition`)
- **Validation**: JSX tree diff (before/after), `tsc`, `eslint` (target: 0 error)

### 🔴 C6 — Admin Panel & GuestLinkGenerator (highest risk, stepwise)
**C6a — Shared admin patterns (H-5, M-8)**
- `hooks/useAdminResource.ts` — `useAdminResource(fetcher, fallbackMsg)`
- `components/admin/shared/AdminLoading.tsx`, `AdminEmpty.tsx`, `AdminErrorBanner.tsx`
- Apply to `WishesManagement`, `PhotoManagement`, `RSVPManagement`

**C6b — GuestLinkGenerator decomposition (H-6) — multiple micro-commits**
1. Extract `components/admin/guests/GuestRow.tsx` (from `renderRow`)
2. Extract `components/admin/guests/GuestFilterBar.tsx`
3. Extract `components/admin/guests/BulkActionBar.tsx`
4. Extract `components/admin/guests/GeneratorForm.tsx`
5. Extract `hooks/useGuestLinks.ts`, `hooks/useWhatsAppOutbox.ts`, `hooks/useGuestSelection.ts`
6. Refactor `GuestLinkGenerator.tsx` → orchestrator (~300 lines)
- **Each micro-commit**: `tsc`, `eslint`, build, manual smoke test

### ✅ C7 — Dead Code & Cleanup (H-9 partial, H-10, M-3, M-2)
- Delete: `FloralAccent.tsx`, 5 boilerplate SVGs, `.section-divider`/`.font-molani` CSS, `Mollani-Regular.ttf`
- Delete unused exports (keep `LyricsTester`, `__allowSoftwareGl`, `buildGoogleCalendarUrl`, `downloadICSFile`, `buildWazeUrl`, `buildAppleMapsUrl`, `colors`, `fadeIn`, `staggerContainer`, `getWishesCount`, `fonts`, `Invitation`)
- `app/api/admin/calendar.ics/route.ts` → re-export only
- Standardize imports to alias (`@/src/...`) — 46 relative → alias
- Rename handlers to `handleX` convention (admin) / `onX` (props)
- **Validation**: `tsc`, `eslint`, build route list

### ✅ C8 — Section Reorg + Limited PhotoBoothModal (M-1, H-7)
- Move 14 section components → `src/components/sections/`
- Update imports (alias-based, no routing impact)
- Extract from `PhotoBoothModal` (non-render only):
  - `lib/photobooth/cooldown.ts` — localStorage cooldown logic
  - `lib/photobooth/ensureFonts.ts` — font loading
  - `lib/photobooth/sleep.ts` — shared `sleep()` (also used in `api/admin/wa/route.ts`)
  - `lib/photobooth/fileName.ts` — photo file naming
- **Validation**: `tsc`, `eslint`, build route list, PhotoBooth manual test

---

## Validation Gates (per phase)

| Check | Baseline | Target |
|-------|----------|--------|
| `npx tsc --noEmit` | 0 error | 0 error |
| `npx eslint` | 1 error + 9 warn | 0 error, 1 warn (PhotoWall `<img>`) |
| `next build` (font mocked) | fails (font) | succeeds, route list identical |
| `madge --circular` | 1 cycle | 0 cycles |
| `ts-prune` | 15 unused | per H-9 approval |
| API contract diff (touched routes) | — | identical status/body |
| JSX tree diff (H-1, H-6) | — | identical element order/props |

---

## Rollback Strategy

- Each phase = separate commit with descriptive message
- Tag before each phase: `refactor/pre-C1`, `refactor/pre-C2`, etc.
- If validation fails: `git reset --hard <pre-phase-tag>`
- No phase depends on unfinished later phase

---

## Files NOT Modified (per constraints)

- `supabase/migrations/*` — schema, RLS, RPC untouched
- All API contracts (paths, bodies, status codes, error messages)
- URL/slug/query formats (`?guest=`, `?camera=open`, `<name>~<token>`)
- Kudus/Wonogiri guest access logic (`guest-category`, `guest-access`, `server/events`)
- PhotoBooth/PhotoWall pipeline (filters, frames, compose, JPEG 0.93, upload→approval)
- Visual design (Tailwind classes, CSS variables, themes, animations)
- `localStorage`/`sessionStorage` keys (only centralized, values unchanged)
- `PhotoBoothModal` bride nickname (`split(" ")[2]`) — kept as `BRIDE_NICKNAME` constant

---

## Implementation Order

```
C1 → C2 → C3 → C4 → C5 → C6a → C6b (micro) → C7 → C8
```

Ready to begin with **C1**.