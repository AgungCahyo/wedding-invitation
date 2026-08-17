# 🎯 Supabase Integration Guide

## ✅ Fitur yang Sudah Diintegrasikan

1. **RSVP Data Persistence**
   - Menyimpan respons tamu ke tabel `rsvp_guests`
   - Fields: nama, status kehadiran, jumlah tamu, pesan

2. **Wishes Data Persistence**
   - Menyimpan ucapan tamu ke tabel `wishes`
   - Fields: nama, pesan, timestamp

3. **Real-time Loading**
   - Wishes di-fetch otomatis saat page load
   - Data ditampilkan dengan loading indicator

4. **Error Handling**
   - User-friendly error messages
   - Graceful fallback jika Supabase tidak tersedia

## 🚀 Setup Langkah demi Langkah

### Step 1: Create Supabase Project

1. Buka https://supabase.com
2. Klik **"New Project"**
3. Pilih organization Anda
4. Isi form:
   - **Name**: `undangan-wedding` (atau nama pilihan Anda)
   - **Database Password**: Buat password yang kuat (catat baik-baik!)
   - **Region**: Pilih yang terdekat (misal: `Southeast Asia (Singapore)`)
5. Klik **"Create new project"** dan tunggu selesai (5-10 menit)

### Step 2: Get API Credentials

1. Setelah project selesai, klik **"Settings"** di kiri bawah
2. Klik **"API"**
3. Copy nilai berikut:
   - **Project URL** → Ini adalah `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → Ini adalah `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Step 3: Create Database Tables

1. Di Supabase dashboard, klik **"SQL Editor"** di kiri
2. Klik **"New Query"**
3. Copy-paste code SQL di bawah, run setiap query:

**Query 1: RSVP Guests Table**
```sql
create table if not exists rsvp_guests (
  id bigint primary key generated always as identity,
  name text not null,
  attendance text not null check (attendance in ('attending', 'not-attending')),
  guest_count integer,
  message text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table rsvp_guests enable row level security;

-- Allow anyone to insert
create policy "Allow insert for all" on rsvp_guests
  for insert with check (true);

-- Allow anyone to read
create policy "Allow select for all" on rsvp_guests
  for select using (true);
```

**Query 2: Wishes Table**
```sql
create table if not exists wishes (
  id bigint primary key generated always as identity,
  name text not null,
  message text not null,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table wishes enable row level security;

-- Allow anyone to insert
create policy "Allow insert for all" on wishes
  for insert with check (true);

-- Allow anyone to read
create policy "Allow select for all" on wishes
  for select using (true);
```

### Step 4: Setup Environment Variables

1. Di project root Anda, buat file `.env.local`:

```bash
# Copy .env.local.example
cp .env.local.example .env.local
```

2. Edit `.env.local` dan isi dengan credential Anda:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

3. **PENTING**: Jangan commit `.env.local` ke git!

### Step 5: Test Integration

```bash
npm run dev
```

Buka http://localhost:3000 dan test:

1. **Test RSVP**
   - Fill form RSVP
   - Klik "Kirim Konfirmasi"
   - Lihat respons di Supabase → Table Browser → `rsvp_guests`

2. **Test Wishes**
   - Tulis ucapan
   - Klik "Kirim Ucapan"
   - Lihat di Supabase → Table Browser → `wishes`
   - Refresh page → Ucapan seharusnya still ada (dari database)

## 📊 View Submitted Data

### RSVP Responses

1. Buka Supabase Dashboard
2. Klik **"Table Editor"** di kiri
3. Pilih tabel `rsvp_guests`
4. Lihat semua respons tamu

**Columns:**
- `id` - ID unik (auto-increment)
- `name` - Nama tamu
- `attendance` - Status: "attending" atau "not-attending"
- `guest_count` - Jumlah tamu (null jika tidak hadir)
- `message` - Pesan dari tamu
- `created_at` - Waktu submit
- `updated_at` - Waktu update terakhir

### Wishes

1. Klik **"Table Editor"**
2. Pilih tabel `wishes`
3. Lihat semua ucapan

**Columns:**
- `id` - ID unik
- `name` - Nama pengirim
- `message` - Isi ucapan
- `created_at` - Waktu submit

## 🔍 Advanced: Query Data Programmatically

### Get RSVP Statistics

Gunakan endpoint REST atau function yang sudah disediakan:

```typescript
import { getRSVPStats } from '@/src/lib/rsvp-service';

const stats = await getRSVPStats();
console.log(stats);
// Output:
// {
//   total: 50,
//   attending: 45,
//   notAttending: 5,
//   totalGuests: 120
// }
```

### Get All Wishes

```typescript
import { fetchWishes } from '@/src/lib/wishes-service';

const wishes = await fetchWishes();
console.log(wishes);
// Output: Array of wishes
```

## 🛡️ Security Best Practices

### 1. Row Level Security (RLS)

Sudah disetup untuk allow public insert/read. Jika ingin lebih ketat:

```sql
-- Example: Only allow authenticated users
create policy "Authenticated insert" on rsvp_guests
  for insert 
  to authenticated 
  with check (true);
```

### 2. Email Verification (Optional)

Setup email verification untuk RSVP:

```sql
-- Add verified column
alter table rsvp_guests add column verified boolean default false;

-- Policy: require verification
create policy "Verified only" on rsvp_guests
  for select using (verified = true);
```

### 3. Rate Limiting

Implementasi di frontend atau di Supabase Edge Functions untuk prevent spam.

## 🚨 Troubleshooting

### Error: "Supabase credentials missing"

**Solusi:**
- Check `.env.local` file exists
- Verify `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY` ada
- Restart dev server: `npm run dev`

### Data tidak tersimpan

**Check:**
1. Buka browser Console (F12)
2. Lihat ada error message apa
3. Verify tables sudah dibuat di Supabase
4. Check RLS policies sudah allow insert

### CORS Error

**Solusi:**
- Di Supabase Settings > API, check CORS settings
- Pastikan domain Anda di-whitelist

### Slow query

**Optimize:**
1. Di Supabase, buat index pada column yang sering di-query:
```sql
create index idx_wishes_created_at on wishes(created_at DESC);
create index idx_rsvp_attendance on rsvp_guests(attendance);
```

## 📱 Next Steps

### 1. Add Email Notifications

Kirim email ke couple saat tamu submit RSVP:

```typescript
// Send email via Supabase Functions atau service lain
const emailService = new EmailService();
await emailService.sendRSVPNotification(formData);
```

### 2. Create Admin Dashboard

Buat halaman untuk melihat:
- Jumlah tamu yang confirm
- Statistics
- Export to Excel

### 3. Send Reminders

Create Supabase Function untuk send reminder emails:

```sql
-- Create function
create or replace function send_reminder()
returns void as $$
begin
  -- Implementation here
end;
$$ language plpgsql;

-- Setup scheduled job
select cron.schedule('send-reminder', '0 9 * * *', 'select send_reminder()');
```

### 4. Add SMS Notifications

Integrate dengan Twilio atau service SMS lain.

## 📚 Resources

- [Supabase Docs](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Database Best Practices](https://supabase.com/docs/guides/database/best-practices)

## 💡 Tips

1. **Testing**: Gunakan `supabase.rest_url` untuk direct HTTP requests
2. **Local Development**: Setup local Supabase dengan `supabase start`
3. **Backup**: Regular export data dari Supabase
4. **Monitoring**: Setup alerts untuk error rates

---

**Semoga berhasil! 🎉**
