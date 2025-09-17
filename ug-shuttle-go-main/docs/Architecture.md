## Architecture Overview

### Frontend
- Vite + React + TypeScript
- Tailwind CSS + shadcn/ui for styled components
- React Router for client-side routing
- TanStack Query for data fetching and caching

### Key Modules
- `src/contexts/AuthContext.tsx`: wraps Supabase auth, provides `user`, `session`, `profile`, and auth actions
- `src/integrations/supabase/`: generated `client.ts` and typed `Database`
- `src/pages/`: feature pages (Booking, AdvancedBooking, Dashboard, etc.)
- `src/components/`: UI widgets like `Navbar`, `Footer`, notifications, chatbot, Paystack button

### Routing (`src/App.tsx`)
- Public: `/`, `/about`, `/faq`, `/auth`, `/tracking`
- Protected: `/dashboard`, `/booking`, `/advanced-booking`, `/my-bookings`, `/notifications`, `/settings`
- Guarded by `ProtectedRoute` using `AuthContext`

### State
- Global auth/profile via context
- Server state via Supabase queries wrapped by TanStack Query (and some direct calls)
- Local UI state in pages for multi-step flows

### Data Flow
- Pages query Supabase tables (`routes`, `shuttles`, `shuttle_schedules`) to populate steps
- Booking confirmation simulated to `localStorage` (can be replaced with DB inserts)
- Notifications: global rows in `public.notifications` (user_id NULL) + simulated client entries

### Maps
- `Mapbox GL` integration component present (see `src/components/MapComponent.tsx` or `GoogleCampusMap.tsx` if used)

### Payments
- `src/components/PaystackButton.tsx` provides Paystack inline checkout
- Booking pages currently simulate payment/confirmation, then store demo booking/notification locally

