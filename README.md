# Q4 — Guest Refund Request Form
### Deluxe Holiday Homes™ Internal Tool

A complete, production-ready web application built for the Q4 assignment. Fully functional, mobile-responsive refund request form with real-time validation, persistent storage, and an elevated UI matching the Deluxe Holiday Homes brand guidelines.

## 🚀 Live Demo
**[q4-refund.vercel.app](https://q4-refund.vercel.app/)**

## 🛠️ Stack
- **Frontend**: React + Vite
- **Styling**: Tailwind CSS
- **Database & Storage**: Supabase (PostgreSQL + File Storage)

---

## ✨ Features

1. **Guest Refund Request Form**
   - 7 fields: Full Name, Email, Booking Reference, Booking Date, Reason (dropdown), Details, and optional File Upload (images, PDFs, Word docs).
   - **Smart Input:** Booking Reference has a locked `DLX-` prefix — users only type the 5 digits.
   - **Conditional Logic:** Bookings older than 90 days automatically show a yellow warning banner.
   - **Real-Time Validation:** Every field validates on blur (as soon as you leave it), with clear inline error messages that disappear when corrected.
   - **Confirmation:** Success screen renders the full submitted data back to the guest.

2. **Admin Dashboard**
   - Toggle between the Form and the Dashboard directly from the header.
   - Live stats cards: Total, Outside Window, and by reason.
   - Filter by reason, refund window, and free-text search (name, email, booking ref).
   - Sort by newest or oldest.
   - **CSV Export:** Downloads `RefundRequests_ddmmyyyy.csv` with the currently filtered rows.

3. **Design & UX**
   - Styled to match the Deluxe Holiday Homes brand (`#2d3666` navy, `#4ab9e6` cyan).
   - Dark mode toggle (preference persisted in `localStorage`).
   - Fully mobile responsive — header condenses gracefully on small screens.
   - Premium inputs with glowing cyan focus rings and drop-shadowed cards.

4. **Persistent Storage**
   - All submissions stored in Supabase (PostgreSQL).
   - File uploads stored in Supabase Storage with public URLs.


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
