## Features

### Authentication
- Email/password sign up and sign in via Supabase Auth
- Auto-profile creation via DB trigger
- `AuthContext` exposes `user`, `session`, `profile`, and `signIn/signUp/signOut`

### Booking Flow
- Multi-step journey (Trip → Shuttle → Review → Payment → Confirmation)
- Fetch active `routes`, `shuttles`, and `shuttle_schedules`
- Day-of-week filtering and capacity hints
- Confirmation generates a QR-like code and success screen
- `AdvancedBookingPage` adds preferences, fare breakdown, and sidebar summary

### Payments
- Two modes: simulated form validation, and optional Paystack inline checkout component
- On success (sim or Paystack), finalize booking and create a notification (simulated via localStorage)

### Notifications
- Global notifications from DB (where `user_id IS NULL`)
- Client-side simulated notifications for demo events (booking confirmation)

### Student Dashboard & Bookings
- Dashboard overview for students
- My Bookings page reads from local simulation; can be wired to DB `bookings`

### Settings
- Basic profile/settings page

### Maps & Tracking
- Map components available (Mapbox) for route visualization and potential live shuttle tracking

### Accessibility & Theming
- Dark mode via `next-themes`
- shadcn/ui components with Tailwind for consistent design

