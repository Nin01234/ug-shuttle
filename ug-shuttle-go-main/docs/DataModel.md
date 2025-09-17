## Database Schema (Supabase/Postgres)

Tables (from `supabase/migrations/*.sql`):

- `profiles`
  - `user_id` (FK to `auth.users.id`), `full_name`, `email`, `student_id`, `phone`, `department`, `year_of_study`, `avatar_url`, `notification_preferences`
  - Tracked with `created_at`, `updated_at` and trigger to auto-update `updated_at`
  - RLS: users can select/insert/update their own profile

- `shuttles`
  - `shuttle_code` (unique), `driver_name`, `driver_phone`, `capacity`, `current_occupancy`, `status`, `current_location`, timestamps
  - RLS: public select

- `routes`
  - `name`, `description`, `start_location`, `end_location`, `stops` JSONB, `estimated_duration`, `is_active`
  - RLS: public select

- `shuttle_schedules`
  - `shuttle_id` FK, `route_id` FK, `departure_time`, `arrival_time`, `days_of_week` int[]
  - RLS: public select

- `bookings`
  - `user_id` FK to `profiles.user_id`, `shuttle_id` FK, `route_id` FK
  - `pickup_location`, `destination`, `booking_date`, `booking_time`, `status`, `qr_code`
  - RLS: users can select/insert/update their own

- `notifications`
  - `user_id` nullable FK to `profiles.user_id`, `title`, `message`, `type`, `is_read`, `data`
  - RLS: users can view their own; anyone can view rows where `user_id IS NULL` (global)

- `feedback`
  - `user_id` FK, optional `shuttle_id` FK, `rating` 1–5, `comment`, `category`, `status`
  - RLS: users can select/insert their own

### Triggers & Functions
- `update_updated_at_column()` + triggers on `profiles`, `bookings`
- `handle_new_user()` + trigger on `auth.users` to auto-create a profile on signup

### Seed Data
- 5 sample shuttles, 5 routes, several schedules
- Several global notifications (service updates, maintenance, welcome)

### Notes
- Sunday is stored as 7 in `days_of_week`
- Capacity logic is currently enforced client-side; you can add DB constraints/checks for production

