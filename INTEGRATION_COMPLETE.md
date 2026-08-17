# 🎉 Undangan Digital Supabase Integration - Complete!

## ✅ What's Done

Your invitation website is now **fully integrated with Supabase** for persistent guest data! Here's what's been implemented:

### 1. **RSVP Form** - Now Saves to Database
- Guest name, attendance status, guest count, and message are saved
- Form shows loading state while saving
- Success message after save
- Error handling with user-friendly messages

### 2. **Wishes Section** - Now Saves to Database
- Guests can add wishes/congratulations messages
- Messages are saved to Supabase
- Page automatically loads all previously saved wishes on load
- Shows "Loading..." while fetching wishes
- Most recent wishes appear first

### 3. **Database Service Layer**
Two service files for clean, reusable database operations:
- `src/lib/rsvp-service.ts` - Handles RSVP data (save, fetch, stats)
- `src/lib/wishes-service.ts` - Handles wishes data (save, fetch, count)

### 4. **Production Build ✓**
Project builds successfully with zero errors! ✓

## 🚀 Next Step: Connect Real Supabase

Your website is ready to go live, but it's currently using placeholder Supabase credentials. Follow these steps:

### **Step 1: Create Supabase Project (5 minutes)**

1. Go to https://supabase.com and sign up (free!)
2. Click **"New Project"**
3. Fill in:
   - Name: `undangan-wedding`
   - Database Password: Something strong (save it!)
   - Region: `Southeast Asia (Singapore)` or nearest to you
4. Wait for creation (5-10 minutes)

### **Step 2: Get API Keys (2 minutes)**

1. In Supabase Dashboard, click **Settings** (bottom left)
2. Click **API**
3. Copy these two values:
   - `Project URL` → Save as `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` (under "Project API keys") → Save as `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### **Step 3: Update .env.local (2 minutes)**

Edit `.env.local` in your project root and replace:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**⚠️ Keep `.env.local` secret! Never commit it to Git!**

### **Step 4: Create Database Tables (5 minutes)**

1. In Supabase Dashboard, click **"SQL Editor"** (left sidebar)
2. Click **"New Query"**
3. Run these SQL queries one by one:

**Query 1: RSVP Table**
```sql
-- Create RSVP table
create table if not exists rsvp_guests (
  id bigint primary key generated always as identity,
  name text not null,
  attendance text not null check (attendance in ('attending', 'not-attending')),
  guest_count integer,
  message text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable row level security
alter table rsvp_guests enable row level security;

-- Allow public insert
create policy "Allow insert" on rsvp_guests for insert with check (true);

-- Allow public select
create policy "Allow select" on rsvp_guests for select using (true);
```

**Query 2: Wishes Table**
```sql
-- Create wishes table
create table if not exists wishes (
  id bigint primary key generated always as identity,
  name text not null,
  message text not null,
  created_at timestamp with time zone default now()
);

-- Enable row level security
alter table wishes enable row level security;

-- Allow public insert
create policy "Allow insert" on wishes for insert with check (true);

-- Allow public select  
create policy "Allow select" on wishes for select using (true);
```

### **Step 5: Test It! (5 minutes)**

```bash
npm run dev
```

Open http://localhost:3000 and:

1. **Test RSVP**
   - Fill the form and submit
   - Should show "Terima Kasih"
   - Check Supabase Dashboard → Table Editor → `rsvp_guests`
   - Your data should be there! ✓

2. **Test Wishes**
   - Add a wish and submit
   - Should show loading then message appears
   - Refresh page - wish still there (from database!)
   - Check Supabase Dashboard → Table Editor → `wishes`
   - Your wish should be there! ✓

3. **Test Multiple Submits**
   - Add several wishes
   - They should appear in reverse chronological order
   - All data persists after refresh

## 📊 View Your Data in Supabase

Once guests start submitting:

### RSVP Responses
- Dashboard → **Table Editor** → Click `rsvp_guests`
- See all guest responses
- Track attendance and guest count

### Wishes
- Dashboard → **Table Editor** → Click `wishes`
- See all wishes and messages
- Read congratulations from guests

## 💡 File Guide

**New/Updated Files:**
- `.env.local.example` - Template for environment variables
- `.env.local` - YOUR actual credentials (don't commit!)
- `src/lib/supabase.ts` - Supabase client initialization
- `src/lib/rsvp-service.ts` - RSVP database operations
- `src/lib/wishes-service.ts` - Wishes database operations
- `src/components/RSVP.tsx` - Updated to save to Supabase
- `src/components/Wishes.tsx` - Updated to save/load from Supabase
- `SUPABASE_SETUP.md` - Detailed setup guide (this file!)

## 🎯 What's Next?

### Optional: Send Email Notifications
```bash
npm install nodemailer
# Then setup email alerts when guests RSVP
```

### Optional: Create Admin Dashboard
See all RSVPs and wishes in one dashboard with statistics

### Optional: Set Wedding Date
Update `src/data/invitation.ts`:
```typescript
wedding: {
  date: "2025-06-21", // Change to your wedding date
  venue: "The Grand Hotel"
}
```

## ❓ Troubleshooting

### Error: "supabaseUrl is required"
- Check `.env.local` exists and has correct values
- Restart dev server: `npm run dev`
- Check you pasted the full URL (starts with `https://`)

### Form shows error after submit
- Check Supabase credentials are correct
- Verify tables exist in Supabase Dashboard
- Check browser console (F12) for detailed error

### Data not showing after refresh
- Make sure RLS policies allow SELECT
- Check the SQL was run successfully
- Make sure credentials are pasted exactly as-is

## 🔗 Resources

- **Supabase Docs**: https://supabase.com/docs
- **Next.js Guide**: https://nextjs.org/docs
- **Your Invitation Code**: `/src` folder
- **Configuration**: `/src/data/invitation.ts`

---

## 📋 Checklist

When you're ready:

- [ ] Created Supabase project
- [ ] Got API credentials
- [ ] Updated `.env.local`
- [ ] Created database tables
- [ ] Tested RSVP form
- [ ] Tested Wishes section
- [ ] Verified data in Supabase Dashboard
- [ ] Ready to share with guests!

---

**Your invitation is ready! 🎊** 

Once you complete these steps, guests can RSVP and send wishes, and all their data will be saved in your Supabase database. You can view everything in the Supabase Dashboard.

Need help? Check the detailed setup guide in `SUPABASE_SETUP.md`
