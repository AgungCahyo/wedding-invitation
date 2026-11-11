# Wedding Invitation — Undangan Digital

Next.js 16 (App Router) + React 19 wedding invitation with guest-specific links, RSVP, wishes, PhotoBooth, and admin dashboard.

## Architecture Overview

```
app/
├── page.tsx                  Public invitation (/)
├── [guest]/page.tsx          Personalized invitation (/:slug~token)
├── admin/page.tsx            Admin panel (PIN-protected)
├── booth/page.tsx            PhotoBooth standalone
├── photowall/page.tsx        PhotoWall display screen
├── calendar.ics/route.ts     Dynamic .ics per guest category
└── api/
    ├── admin/                PIN + service-role
    │   ├── auth, guest-links, photos, photo-settings
    │   ├── wishes, rsvp, wa
    │   └── calendar.ics      re-exports GET from /calendar.ics
    ├── rsvp/route.ts
    ├── events/route.ts
    ├── game-scores/route.ts
    └── photobooth/submit/route.ts

src/
├── components/               Invitation sections (flat) + admin/ + photobooth/ + invitation/ + ui/
├── context/MusicContext.tsx
├── hooks/                    useTheme, useCamera, useCameraDeepLink, useGuestEvents, useSyncedLyrics
├── data/                     invitation.ts, theme.ts, blur-placeholders.ts
├── lib/                      Client utilities + anon-key services
├── server/                   Server-only (service-role): db, http, admin-guard, events, wa-*
├── types/                    Domain type modules (partially adopted)
└── constants/                storage-keys, events (present; not all callers imported yet)

supabase/migrations/          004–013 (001–003 are not in this repo)
docs/WHATSAPP.md              WhatsApp provider env notes
```

## Key Features

- **Guest-specific links**: `/<encoded-name>~<token>` with category-based event visibility (Kudus/Wonogiri)
- **RSVP**: Main attendance + optional Ngunduh Mantu (Wonogiri only)
- **Wishes**: Guest messages with moderation
- **PhotoBooth**: Camera capture, filters, frames, upload → admin approval → PhotoWall
- **PhotoWall**: Venue display (Realtime + polling fallback)
- **Admin**: PIN-protected dashboard (guest links, RSVP, wishes, photos, WA broadcast)
- **Calendar**: Dynamic `.ics` per guest category
- **Theming**: Palettes in `src/data/theme.ts` via CSS variables

## Getting Started

```bash
npm install
cp .env.example .env.local
# Fill .env.local — never commit it
npm run dev
```

Open http://localhost:3000

## Environment Variables

Names only — copy `.env.example`. Details for WhatsApp: [docs/WHATSAPP.md](docs/WHATSAPP.md).

**Critical:**

- `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` — public client
- `SUPABASE_SERVICE_ROLE_KEY` — server only (admin routes and some public APIs)
- `ADMIN_PIN` — `/admin` (legacy fallback: `NEXT_PUBLIC_ADMIN_PIN`)
- `NEXT_PUBLIC_SITE_URL` — guest links / WhatsApp (falls back to `invitation.meta.url`)

## Database (Supabase)

Migrations in `supabase/migrations/` (`004`–`013`). Tables used in code:

- `guest_links` — personalized invitation links (category, side, WA fields)
- `rsvp_guests` — attendance + event responses
- `wishes` — guest messages
- `photobooth_photos` — PhotoBooth uploads
- `game_scores` — CatchTheLove scores
- `app_settings` — key-value (e.g. PhotoBooth auto-approve)

PhotoBooth settings live in `app_settings`, not a separate `photos` table. RLS is intended to protect guest data; admin routes use the service role. Baseline migrations `001`–`003` are not in git — confirm policies in the Supabase dashboard.

## Scripts

```bash
npm run dev      # Development (Turbopack)
npm run build    # Production build
npm run start    # Production server
npm run lint     # ESLint
```

Typecheck: `npx tsc --noEmit` (no npm script).

## Deployment (Vercel)

1. Connect the repo
2. Set variables from `.env.example` (real values in the Vercel dashboard)
3. Deploy

## PhotoBooth at Venue

- `/booth` — standalone camera page
- `/photowall` — fullscreen display

## Admin Panel

- URL: `/admin`
- Auth: PIN in `sessionStorage`, sent as `x-admin-pin`
- Features: guest links + WA broadcast, RSVP, wishes moderation, photo approval

## Theming

Palettes in `src/data/theme.ts`. CSS variables (`--accent`, `--bg-primary`, …) are injected in `<head>` via `getThemeCss()`. Theme switcher is available on `/admin` (and in development on all pages).

## License

Private — Agung & Ayu wedding invitation.
