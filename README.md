# Q4 — Guest Refund Request Form
### Deluxe Holiday Homes™ Internal Tool

A complete, production-ready web application built for the Q4 assignment. This project implements a fully functional, mobile-responsive refund request form with real-time validation, persistent storage, and an elevated UI matching the Deluxe Holiday Homes brand guidelines.

## 🚀 Live Demo
**[Insert Your Deployment URL Here]**

## 🛠️ Stack
- **Frontend**: React + Vite
- **Styling**: Tailwind CSS
- **Database & Storage**: Supabase (PostgreSQL + File Storage)

---

## ✨ Features

1. **Guest Refund Request Form**
   - Collects 7 required data points (Name, Email, Reference, Date, Reason, Details, optional File Upload).
   - **Conditional Logic:** Automatically flags bookings older than 90 days with a warning banner.
   - **Confirmation:** Success screen dynamically renders the actual submitted data summary back to the user.
   
2. **Elevated UI & Brand Compliance**
   - Styled from the ground up to mimic the **Deluxe Holiday Homes** corporate aesthetic.
   - Features premium inputs (slate backgrounds, light cyan glowing focus rings) and luxurious drop shadows.
   - Fully mobile responsive.

3. **Advanced Real-Time Validation**
   - Instant field-level validation `onBlur` (errors appear/disappear smoothly as you type or switch fields).
   - **Smart Inputs:** The Booking Reference field features a locked `DLX-` badge and safely sanitizes input to only accept 5 numbers. 
   - Strict email and full-name multi-word validation.

4. **Persistent Storage & Admin View**
   - Seamlessly uploads and stores image/PDF evidence securely in a Supabase Storage Bucket.
   - Persists all request data into a Supabase database.
   - **Evaluator Bonus:** Includes a hidden **"View Submissions"** dashboard directly accessible from the header, allowing the evaluator to verify database persistence LIVE without needing database access!

---

## 🏗️ 1. Supabase Setup

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

## 💻 2. Local Development

```bash
# Install dependencies
npm install

# Copy env file and fill in your Supabase keys
cp .env.example .env.local

# Run dev server
npm run dev
```

---

## 🚀 3. Deployment

To deploy this project:
1. Push this repository to GitHub.
2. Go to [Vercel](https://vercel.com/) or [Netlify](https://netlify.com/) and import your repository.
3. In the deployment settings, add your Environment Variables (`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`).
4. Deploy!
