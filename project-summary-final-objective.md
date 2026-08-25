# Project Summary & Final Objective — Digital Wedding Invitation Platform

## 1. Executive Summary

Project ini adalah platform **undangan digital pernikahan** berbasis web yang dibangun dengan Next.js, React, Tailwind CSS, Motion, dan Supabase.

Tujuan akhirnya bukan sekadar membuat satu website undangan untuk Ayutika, tetapi membangun **fondasi platform undangan digital multi-invitation (multi-tenant)** yang:

- Memiliki template undangan yang dapat digunakan ulang.
- Memungkinkan setiap invitation memiliki data, guest links, wishes, dan RSVP sendiri.
- Memiliki halaman publik yang dapat diakses tamu tanpa login.
- Memiliki dashboard `/admin` untuk pemilik/pengelola invitation.
- Memisahkan data antar invitation secara ketat.
- Memiliki authorization berbasis Supabase Auth + `invitation_members` untuk dashboard admin.
- Menjaga service-role key hanya berada di server.
- Memungkinkan platform berkembang menjadi layanan undangan digital yang dapat digunakan untuk banyak pasangan/customer.

---

# 2. Produk yang Sedang Dibangun

Produk akhir dapat dipahami sebagai:

```text
                    DIGITAL INVITATION PLATFORM
                              │
              ┌───────────────┴────────────────┐
              │                                │
        PUBLIC INVITATION                  ADMIN DASHBOARD
              │                                │
        Tanpa login                         Login
              │                                │
       ┌──────┴──────┐                 Supabase Auth
       │             │                       │
    Guest Link    Invitation            invitation_members
       │             │                       │
       └──────┬──────┘                       │
              │                               │
          Wishes / RSVP                 RLS / Authorization
              │                               │
              └──────────────┬────────────────┘
                             │
                          Supabase
```

Ada dua dunia yang sengaja dipisahkan:
1. Public guest experience
2. Private owner/admin management

## 3. Public Invitation
Tamu tidak perlu membuat akun dan tidak perlu login.
Contoh:

`https://ayutika.agungcahyo.my.id/namatamu`

Guest membuka link dan mendapatkan:
- Nama tamu yang dipersonalisasi.
- Informasi hubungan/relation jika digunakan.
- Personal note jika tersedia.
- Flag featured jika digunakan.
- Wishes.
- RSVP.
- Gallery.
- Section undangan lainnya.
- View tracking.

Public invitation harus terasa seperti website undangan biasa, bukan aplikasi yang memaksa user melakukan authentication.

**Prinsip utama**
```text
Guest
  ↓
Public URL
  ↓
Invitation
  ↓
Guest personalization
  ↓
Wishes / RSVP
```
Tidak ada Supabase Auth untuk tamu.

## 4. Admin Dashboard
`/admin` adalah area untuk pemilik/pengelola invitation, bukan untuk tamu.
Admin dapat mengelola data invitation yang memang menjadi tanggung jawabnya.
Fungsi yang sudah menjadi bagian dari arsitektur:

**Wishes**
- Melihat wishes.
- Moderasi wishes.
- Approve wish.
- Pin/unpin wish.
- Delete wish.

**RSVP**
- Melihat RSVP.
- Melihat statistik RSVP.

**Guest Links**
- Melihat daftar guest links.
- Generate guest links.
- Regenerate daftar guest links.
- Update relation.
- Update personal note.
- Toggle featured.
- Delete guest link.

## 5. Apa Itu invitation_members?
`invitation_members` BUKAN daftar tamu undangan.
Fungsinya adalah menentukan:

Siapa yang memiliki izin untuk mengelola invitation tertentu melalui `/admin`.
Contoh:

```text
auth.users
    │
    ▼
invitation_members
    │
    ├── user_id = User Agung
    ├── invitation_id = Ayutika
    └── role = owner
```

Sedangkan tamu berada di:
`guest_links`

Sehingga:
- `invitation_members` = SIAPA YANG BOLEH MENGELOLA
- `guest_links` = SIAPA YANG DIUNDANG

## 6. Role Authorization
Role yang digunakan:
- `owner`
- `admin`
- `editor`

Konsepnya:
**Owner**
Pemilik invitation. Memiliki akses tertinggi terhadap invitation tersebut.

**Admin**
Dapat melakukan operasi administrasi yang diizinkan policy.

**Editor**
Dapat melakukan operasi editing yang diizinkan policy.

Role tidak menentukan siapa tamu.
Role hanya menentukan siapa yang boleh mengelola data invitation.

## 7. Multi-Tenant Architecture
Project diarahkan menjadi multi-tenant.
Artinya database tidak hanya untuk:
`Ayutika`

tetapi nantinya dapat menangani:
- Invitation A
- Invitation B
- Invitation C
- Invitation D
...

Setiap invitation memiliki UUID sendiri.
Contoh:
```text
invitations
├── ayutika
├── budi-sari
├── joko-rina
└── andi-putri
```

Data turunan menggunakan:
`invitation_id`
untuk menentukan tenant.

Data yang sudah menggunakan konsep ini:
- `guest_links`
- `rsvp_guests`
- `wishes`

## 8. Tenant Isolation
Prinsip paling penting:
User/admin yang memiliki akses ke Invitation A tidak boleh otomatis mendapatkan akses ke Invitation B.

Authorization dilakukan melalui:
```text
auth.uid()
      ↓
invitation_members
      ↓
invitation_id
      ↓
RLS policy
      ↓
tenant data
```

Function utama:
`public.is_invitation_member(target_invitation_id, allowed_roles)`

Function tersebut mengecek apakah authenticated user memiliki membership yang sesuai terhadap invitation tertentu.

## 9. Supabase Auth
Supabase Auth hanya digunakan untuk owner/admin dashboard.
Bukan untuk guest.

Flow:
```text
Owner
  ↓
/admin
  ↓
Supabase Auth login
  ↓
auth.uid()
  ↓
invitation_members
  ↓
RLS
  ↓
Authorized invitation data
```

Dengan model ini database dapat membedakan:
- User A → Invitation A
- User B → Invitation B

dan mencegah akses lintas tenant.

## 10. RLS
Migration:
`006_authorization_rls_hardening.sql`
sudah diterapkan ke live Supabase project.

Project live yang diverifikasi:
Project: `wedding-invitation`

Invitation saat ini:
- slug: `ayutika`
- id: `ce1776ad-79ca-4578-80d0-b708aeb1aa21`

RLS telah dikonfirmasi aktif pada:
- `invitations`
- `invitation_members`
- `guest_links`
- `rsvp_guests`
- `wishes`

Policy menggunakan membership-based authorization.

## 11. Public Access vs Admin Access
Arsitektur final yang diinginkan:

```text
                         SUPABASE
                            │
              ┌─────────────┴─────────────┐
              │                           │
          PUBLIC FLOW                 ADMIN FLOW
              │                           │
          Guest user                  Owner/Admin
              │                           │
        No authentication            Supabase Auth
              │                           │
       Next.js API routes          invitation_members
              │                           │
       Server-side service-role          RLS
              │                           │
              └─────────────┬─────────────┘
                            │
                    Tenant-scoped data
```

## 12. Public API Boundary
Client Components tidak lagi mengakses tabel sensitif Supabase secara langsung untuk operasi public.
Public operations menggunakan API server:
- `GET  /api/invitations/[slug]/wishes`
- `POST /api/invitations/[slug]/wishes`
- `POST /api/invitations/[slug]/rsvp`
- `GET  /api/invitations/[slug]/guest/[guestSlug]`

Server menentukan tenant:
```text
URL slug
   ↓
resolveInvitationBySlug()
   ↓
invitations.id
   ↓
database operation
```

Client tidak dipercaya untuk menentukan: `invitation_id`
Jika client mengirim `invitation_id` palsu, field tersebut tidak digunakan.

## 13. Service-Role Boundary
`SUPABASE_SERVICE_ROLE_KEY` hanya boleh digunakan server-side.
Lokasi: `src/lib/server/supabase-admin.ts`

Client Components tidak boleh mengimpor service-role client.
Service-role digunakan untuk public server API karena public wishes/RSVP/guest operations memang tidak memiliki authorization berbasis user.

Ini adalah boundary penting:
```text
Browser
  ↓
API Route
  ↓
Server-only Supabase Admin Client
  ↓
Supabase
```

Bukan:
```text
Browser
  ↓
SERVICE ROLE KEY
```

## 14. Public Wishes
Public wishes memiliki aturan:
- Guest dapat submit melalui API.
- Client tidak menentukan `invitation_id`.
- Server resolve invitation berdasarkan URL slug.
- GET public hanya menampilkan wishes dengan: `status = approved`

Data internal seperti status atau invitation UUID tidak perlu diekspos ke public response.

## 15. Public RSVP
Guest dapat mengirim RSVP melalui API.
Flow:
```text
Guest
  ↓
POST /api/invitations/[slug]/rsvp
  ↓
Resolve invitation
  ↓
Validate payload
  ↓
Insert dengan invitation.id dari server
```
Tidak ada public RSVP SELECT endpoint.

## 16. Guest Links
`guest_links` digunakan untuk personalisasi tamu.
Contoh: Budi, Siti, Andi, Rina

Setiap guest link memiliki tenant scope:
`invitation_id + slug`

Unique constraint:
`(invitation_id, slug)`

Ini mendukung:
- Ayutika / budi
- Wedding B / budi

tanpa bentrok karena tenant berbeda.

## 17. Guest Link Upsert
Admin memiliki fungsi: `upsertGuestLinks()`
dengan:
```javascript
onConflict: "invitation_id,slug"
ignoreDuplicates: true
```

Artinya jika guest sudah ada: `DO NOTHING` bukan update.
Ini disengaja agar regenerating guest list tidak menimpa statistik/view data guest yang sudah ada.
Update guest dilakukan melalui operasi terpisah: `updateGuestLinkDetails()`

## 18. Guest View Tracking
Function: `record_guest_view(uuid, text)` digunakan untuk tracking view guest.
Function:
- SECURITY DEFINER
- fixed search_path
- scoped berdasarkan `invitation_id + slug`
- tidak diberikan kepada anon/authenticated
- hanya service-role yang memiliki execute privilege

View tracking dilakukan dari server guest endpoint.
Known limitation: *No rate limiting*
Sehingga attacker masih dapat memukul guest endpoint berkali-kali dan memengaruhi `view_count`. Ini adalah future hardening, bukan alasan untuk merombak arsitektur saat ini.

## 19. Current Live Database State
Yang sudah diverifikasi live:

Project: `wedding-invitation`
Invitation:
- slug = `ayutika`
- id   = `ce1776ad-79ca-4578-80d0-b708aeb1aa21`

RLS:
- `invitations`         = enabled
- `invitation_members`  = enabled
- `guest_links`         = enabled
- `rsvp_guests`         = enabled
- `wishes`              = enabled

Functions:
- `is_invitation_member()`
- `record_guest_view()`
keduanya sudah terverifikasi ada sebagai SECURITY DEFINER.

## 20. Current Bootstrap State
Saat verifikasi terakhir:
- `auth.users = 0`
- `invitation_members = 0`

Artinya belum ada owner/admin yang bisa melakukan authenticated admin runtime test.
Ini bukan migration failure.
Ini adalah: **ADMIN BOOTSTRAP NOT YET DONE**

Langkah yang dibutuhkan:
1. Buat user di Supabase Auth.
2. Buat membership: `user → invitation ayutika → owner`
3. Login ke `/admin`.
4. Jalankan runtime authorization test.

## 21. Current Implementation Status
**Completed**
- Multi-invitation data model.
- Invitation UUID scoping.
- Guest link tenant scoping.
- Wishes tenant scoping.
- RSVP tenant scoping.
- Public API boundary.
- Server-only service-role client.
- Public guest lookup API.
- Public wishes API.
- Public RSVP API.
- Server-side guest view tracking.
- Supabase Auth authorization architecture.
- `invitation_members`.
- RLS hardening migration 006.
- Guest link INSERT policy fix.
- Tenant-isolation static audit.
- Live confirmation that migration 006/RLS/policies are active.

**Not Yet Completed**
- Admin Auth user creation.
- `invitation_members` owner bootstrap.
- Authenticated admin runtime test.
- Full admin functional runtime test.
- Real cross-tenant runtime test (currently only one invitation exists).
- Rate limiting.
- CAPTCHA/Turnstile.
- Advanced abuse prevention.
- Production analytics hardening.

## 22. Known Security Model
The security model intentionally uses different mechanisms for different actors.

**Guest** (Public user):
`No Auth → API → Server validation → Tenant resolution → Service role`

**Owner/Admin** (Authenticated user):
`Supabase Auth → auth.uid() → invitation_members → RLS → Tenant data`

This is the intended separation.

## 23. What the Final Product Should Feel Like
**From the guest perspective:**
"Saya mendapatkan link undangan, buka, nama saya sudah muncul, bisa membaca undangan, mengirim ucapan, dan RSVP."
(Tidak ada login.)

**Dari sisi pemilik:**
"Saya login ke dashboard, melihat undangan saya, mengatur tamu, memoderasi ucapan, melihat RSVP, dan mengelola isi undangan."

**Dari sisi platform:**
"Setiap invitation adalah tenant terpisah dan data antar invitation tidak boleh bocor."

## 24. Long-Term Product Direction
Fondasi ini memungkinkan platform berkembang menjadi layanan: **Digital Invitation SaaS**

Contoh:
```text
Customer A → Invitation Ayutika → Template 01
Customer B → Invitation Budi-Sari → Template 02
Customer C → Invitation Joko-Rina → Template 03
```
Semua dapat hidup dalam satu aplikasi/database tanpa mencampurkan data tenant.

## 25. Template Architecture
Template harus tetap dipisahkan dari core platform.
**Core:** `invitation, guest, wishes, rsvp, admin, API, authorization`
**Template:** `template01, template02, ayutika, ...`

Template sebaiknya bertanggung jawab terhadap:
- Visual presentation.
- Section layout.
- Typography.
- Animation.
- Decorative elements.
- Template-specific components.

Core platform bertanggung jawab terhadap:
- Data.
- Tenant resolution.
- Guest management.
- RSVP.
- Wishes.
- Authorization.
- API.
- Persistence.

Dengan pemisahan ini penambahan template tidak perlu mengubah security architecture.

## 26. Important Architectural Principle
Jangan mencampur:
**Guest identity** dengan **Admin identity**

- Guest identity berasal dari: `guest_links`
- Admin identity berasal dari: `Supabase Auth`
- Authorization admin berasal dari: `invitation_members`
- Tenant berasal dari: `invitations`

Dengan demikian:
`User/Auth → invitation_members → Invitation → Guest Links / Wishes / RSVP`

## 27. Final Target Architecture
```text
                         ┌──────────────────────┐
                         │   DIGITAL INVITATION │
                         │       PLATFORM       │
                         └──────────┬───────────┘
                                    │
                 ┌──────────────────┴──────────────────┐
                 │                                     │
                 ▼                                     ▼
        ┌──────────────────┐                  ┌──────────────────┐
        │  PUBLIC WEBSITE  │                  │  ADMIN DASHBOARD │
        └────────┬─────────┘                  └────────┬─────────┘
                 │                                     │
              Guest                                  Owner
                 │                                     │
             No Auth                             Supabase Auth
                 │                                     │
                 ▼                                     ▼
        ┌──────────────────┐                  ┌──────────────────┐
        │   Public API     │                  │ invitation_      │
        │                  │                  │ members          │
        └────────┬─────────┘                  └────────┬─────────┘
                 │                                     │
                 │ service-role                        │ RLS
                 │                                     │
                 └──────────────────┬──────────────────┘
                                    ▼
                           ┌──────────────────┐
                           │    SUPABASE DB   │
                           └────────┬─────────┘
                                    │
             ┌──────────────────────┼──────────────────────┐
             │                      │                      │
             ▼                      ▼                      ▼
        invitations            guest_links           wishes
                                                        │
                                                        ▼
                                                   rsvp_guests
```

## 28. Final Goal
Tujuan akhir project ini adalah membangun platform undangan digital yang reusable, multi-tenant, aman, dan siap dikembangkan menjadi produk, bukan sekadar satu halaman undangan.

Minimum final capability:
- Public invitation tanpa login.
- Personalized guest links.
- Wishes.
- RSVP.
- Guest view tracking.
- Multiple invitations.
- Owner/admin dashboard.
- Supabase Auth untuk admin.
- `invitation_members` untuk ownership/access.
- RLS untuk tenant isolation.
- Server-side service-role boundary.
- Reusable templates.
- Clean separation antara core platform dan template.
- Tidak ada cross-tenant data leakage.

Setelah admin bootstrap selesai, fokus berikutnya adalah runtime verification, bukan mengulang migration 006.

## 29. Immediate Next Step
Urutan kerja yang benar dari kondisi sekarang:
1. [✓] Migration 006 applied
2. [✓] Live RLS verified
3. [✓] Public API boundary verified
4. [ ] Create Supabase Auth owner
5. [ ] Insert invitation_members owner
6. [ ] Login /admin
7. [ ] Runtime RLS test
8. [ ] Admin functional test
9. [ ] Full guest flow test
10. [ ] Security hardening
11. [ ] Production deployment

Tidak perlu mengulang Step 11E. Migration 006 sudah menjadi bagian dari database live dan sekarang tahap yang tersisa adalah membuktikan bahwa aplikasi bekerja benar di atas authorization model tersebut.
