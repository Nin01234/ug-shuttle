## Setup & Local Development

### 1) Prerequisites
- Node.js 18+ and npm
- A Supabase project (optional for simulation; required for real data)

### 2) Install dependencies
```bash
npm install
```

### 3) Environment variables
Create `.env` in the project root:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_MAPBOX_TOKEN=your_mapbox_token # optional
VITE_PAYSTACK_PUBLIC_KEY=pk_test_xxx   # optional
```

The app currently imports keys from `src/integrations/supabase/client.ts`. For production, prefer reading from env and not committing keys.

### 4) Database (Supabase)
Run the SQL in `supabase/migrations/*.sql` inside the Supabase SQL editor. This creates:
- tables: `profiles, shuttles, routes, shuttle_schedules, bookings, notifications, feedback`
- RLS policies and helpful triggers
- seed data for shuttles, routes, schedules, notifications

### 5) Start the dev server
```bash
npm run dev
```
Open the printed localhost URL.

### 6) Sign up and test
- Visit `/auth` to create an account (email + password)
- After email confirmation (or disable confirm in Supabase), log in
- Explore `/booking`, `/advanced-booking`, `/my-bookings`, `/notifications`

### 7) Simulation vs real backend
- Booking and notifications include a simulation mode that stores items in `localStorage` for demos
- For full persistence, add insert calls to Supabase `bookings` and `notifications` after payment

### Troubleshooting
- CORS/auth errors: verify `VITE_SUPABASE_URL` and anon key
- Empty routes/shuttles: ensure migration ran and `is_active = true`
- Map not showing: provide `VITE_MAPBOX_TOKEN` and check network console

