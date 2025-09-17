# UG ShuttleGO – Campus Shuttle Booking System

ShuttleGO is a university shuttle booking web app built for students to discover routes, view schedules, reserve seats, and receive notifications. It uses React (Vite + TypeScript) on the frontend and Supabase for auth and data. Payments are simulated in-app with optional Paystack integration.

Quick links:
- docs: see the `docs/` folder for detailed setup and design notes
- live dev: `npm run dev` then open the shown URL

## Tech Stack
- React 18 + TypeScript + Vite
- Tailwind CSS + shadcn/ui components
- React Router 6
- TanStack Query for async state
- Supabase (Auth, Postgres, RLS policies)
- Mapbox GL (maps) [if enabled in pages/components]
- Paystack (optional payments) + local simulation

## Getting Started
1) Prerequisites
   - Node.js 18+ and npm
   - Supabase project (free) if you want real data

2) Install
```sh
npm install
```

3) Configure environment
Create `.env` (or `.env.local`) with public keys:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
# Optional
VITE_MAPBOX_TOKEN=your_mapbox_token
VITE_PAYSTACK_PUBLIC_KEY=your_paystack_public_key
```

4) Run
```sh
npm run dev
```

5) Supabase database (optional but recommended)
- Apply SQL in `supabase/migrations/*.sql` to your Supabase project
- This creates tables: `profiles, shuttles, routes, shuttle_schedules, bookings, notifications, feedback` and RLS policies

For full instructions, see `docs/Setup.md` and `docs/DataModel.md`.

## Key Features
- Student auth (sign up/in/out) via Supabase
- Browse active routes and schedules
- Multi‑step booking flow with capacity checks
- Payment step (Mobile Money/Card simulated, Paystack optional)
- QR-like booking confirmation code
- Notifications feed (global + user), with local simulation for demo
- Student dashboard, bookings list, and settings

See `docs/Features.md` for page-by-page details.

## Project Structure (high-level)
- `src/pages/` – screens like `BookingPage`, `AdvancedBookingPage`, `StudentDashboard`
- `src/components/` – UI widgets, navbar/footer, notifications, chatbot, map
- `src/contexts/AuthContext.tsx` – auth/session/profile provider
- `src/integrations/supabase/` – generated client and DB types
- `supabase/migrations/` – SQL schema, RLS policies, seed data

More in `docs/Architecture.md`.

## Deployment
- Any static host (Vercel/Netlify/Cloudflare Pages)
- Provide the same env vars at build/runtime
- Point to your Supabase project URL/anon key

See `docs/Deployment.md` for a step‑by‑step guide.

## Security Notes
- Keep Supabase service role keys out of the client; only use the public anon key in the browser
- RLS policies are enabled; verify they meet your rules
- Never commit private API keys

Details in `docs/Security.md`.

## License
For academic use as part of a final year project. Confirm institutional requirements before public distribution.
