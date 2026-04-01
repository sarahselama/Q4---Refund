# Q4 — Guest Refund Request Form
### Deluxe Holiday Homes™ Internal Tool

## Stack
- React + Vite
- Tailwind CSS
- Supabase (database + file storage)

---

## 1. Supabase Setup

### Create the database table
Run this SQL in your Supabase SQL editor (Dashboard → SQL Editor → New Query):

```sql
create table refund_requests (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  booking_reference text not null,
  booking_date date not null,
  refund_reason text not null,
  additional_details text not null,
  file_url text,
  file_name text,
  outside_window boolean default false,
  submitted_at timestamptz default now()
);

-- Allow public inserts (no auth required for guests)
alter table refund_requests enable row level security;
create policy "Allow public insert" on refund_requests for insert with check (true);
create policy "Allow public select" on refund_requests for select using (true);
```

### Create the storage bucket
1. Go to Supabase Dashboard → Storage → New Bucket
2. Name it: `uploads`
3. Toggle **Public bucket** ON
4. Click Create

---

## 2. Local Development

```bash
# Install dependencies
npm install

# Copy env file and fill in your Supabase keys
cp .env.example .env.local
# Edit .env.local with your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
# (Found in: Supabase Dashboard → Project Settings → API)

# Run dev server
npm run dev
```

---

## 3. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy (follow prompts)
vercel

# Set environment variables in Vercel Dashboard:
# Settings → Environment Variables
# Add: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
```

Or push to GitHub and import the repo at vercel.com — it auto-detects Vite.

---

## Features
- All 7 required fields with validation
- 90-day booking date warning banner
- File upload (images + PDFs) with preview
- Submissions stored in Supabase (PostgreSQL)
- Files stored in Supabase Storage
- Success screen showing full submission summary
- Fully mobile responsive
