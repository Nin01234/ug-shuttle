-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id TEXT UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  department TEXT,
  year_of_study INTEGER,
  avatar_url TEXT,
  notification_preferences JSONB DEFAULT '{"email": true, "push": true, "sms": false}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create shuttles table
CREATE TABLE public.shuttles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shuttle_code TEXT NOT NULL UNIQUE,
  driver_name TEXT NOT NULL,
  driver_phone TEXT,
  capacity INTEGER NOT NULL DEFAULT 30,
  current_occupancy INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'offline')),
  current_location JSONB,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create routes table
CREATE TABLE public.routes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  start_location TEXT NOT NULL,
  end_location TEXT NOT NULL,
  stops JSONB NOT NULL DEFAULT '[]'::jsonb,
  estimated_duration INTEGER NOT NULL, -- in minutes
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create shuttle_schedules table
CREATE TABLE public.shuttle_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shuttle_id UUID NOT NULL REFERENCES public.shuttles(id) ON DELETE CASCADE,
  route_id UUID NOT NULL REFERENCES public.routes(id) ON DELETE CASCADE,
  departure_time TIME NOT NULL,
  arrival_time TIME NOT NULL,
  days_of_week INTEGER[] NOT NULL, -- 1=Monday, 7=Sunday
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  shuttle_id UUID NOT NULL REFERENCES public.shuttles(id) ON DELETE CASCADE,
  route_id UUID NOT NULL REFERENCES public.routes(id) ON DELETE CASCADE,
  pickup_location TEXT NOT NULL,
  destination TEXT NOT NULL,
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'completed', 'no_show')),
  qr_code TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'error')),
  is_read BOOLEAN NOT NULL DEFAULT false,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create feedback table
CREATE TABLE public.feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  shuttle_id UUID REFERENCES public.shuttles(id) ON DELETE SET NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  category TEXT DEFAULT 'general' CHECK (category IN ('general', 'driver', 'cleanliness', 'punctuality', 'safety')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shuttles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shuttle_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policies for shuttles (public read access)
CREATE POLICY "Anyone can view shuttles" ON public.shuttles FOR SELECT USING (true);

-- Create policies for routes (public read access)
CREATE POLICY "Anyone can view routes" ON public.routes FOR SELECT USING (true);

-- Create policies for schedules (public read access)
CREATE POLICY "Anyone can view schedules" ON public.shuttle_schedules FOR SELECT USING (true);

-- Create policies for bookings
CREATE POLICY "Users can view their own bookings" ON public.bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own bookings" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own bookings" ON public.bookings FOR UPDATE USING (auth.uid() = user_id);

-- Create policies for notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view global notifications" ON public.notifications FOR SELECT USING (user_id IS NULL);

-- Create policies for feedback
CREATE POLICY "Users can view their own feedback" ON public.feedback FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create feedback" ON public.feedback FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'), NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample data
INSERT INTO public.shuttles (shuttle_code, driver_name, driver_phone, capacity, current_occupancy, status) VALUES
('SH001', 'Kwame Asante', '+233-24-123-4567', 30, 15, 'active'),
('SH002', 'Ama Osei', '+233-24-234-5678', 30, 22, 'active'),
('SH003', 'Kofi Mensah', '+233-24-345-6789', 25, 0, 'maintenance'),
('SH004', 'Akosua Darko', '+233-24-456-7890', 35, 28, 'active'),
('SH005', 'Yaw Boateng', '+233-24-567-8901', 30, 12, 'active');

INSERT INTO public.routes (name, description, start_location, end_location, stops, estimated_duration) VALUES
('Main Gate → Commonwealth Hall', 'Main campus route to Commonwealth Hall', 'Main Gate', 'Commonwealth Hall', '["Main Gate", "Great Hall", "Department of Psychology", "Commonwealth Hall"]'::jsonb, 15),
('Pentagon → Volta Hall', 'Pentagon to Volta Hall via Science Block', 'Pentagon', 'Volta Hall', '["Pentagon", "Science Library", "Physics Department", "Volta Hall"]'::jsonb, 12),
('Night Market → Library', 'Night Market to Balme Library', 'Night Market', 'Balme Library', '["Night Market", "JCR", "Law Faculty", "Balme Library"]'::jsonb, 10),
('Legon Hall → Medical School', 'Route from Legon Hall to Medical School', 'Legon Hall', 'Medical School', '["Legon Hall", "Engineering Department", "School of Pharmacy", "Medical School"]'::jsonb, 18),
('TF Hostel → Business School', 'TF Hostel to Business School route', 'TF Hostel', 'Business School', '["TF Hostel", "Sports Complex", "Student Affairs", "Business School"]'::jsonb, 20);

INSERT INTO public.shuttle_schedules (shuttle_id, route_id, departure_time, arrival_time, days_of_week) VALUES
((SELECT id FROM public.shuttles WHERE shuttle_code = 'SH001'), (SELECT id FROM public.routes WHERE name = 'Main Gate → Commonwealth Hall'), '07:00', '07:15', '{1,2,3,4,5}'),
((SELECT id FROM public.shuttles WHERE shuttle_code = 'SH001'), (SELECT id FROM public.routes WHERE name = 'Main Gate → Commonwealth Hall'), '12:00', '12:15', '{1,2,3,4,5}'),
((SELECT id FROM public.shuttles WHERE shuttle_code = 'SH002'), (SELECT id FROM public.routes WHERE name = 'Pentagon → Volta Hall'), '08:00', '08:12', '{1,2,3,4,5}'),
((SELECT id FROM public.shuttles WHERE shuttle_code = 'SH004'), (SELECT id FROM public.routes WHERE name = 'Legon Hall → Medical School'), '09:00', '09:18', '{1,2,3,4,5}'),
((SELECT id FROM public.shuttles WHERE shuttle_code = 'SH005'), (SELECT id FROM public.routes WHERE name = 'TF Hostel → Business School'), '10:00', '10:20', '{1,2,3,4,5}');

INSERT INTO public.notifications (user_id, title, message, type) VALUES
(NULL, 'Service Update', 'New shuttle route added: TF Hostel → Business School', 'info'),
(NULL, 'Maintenance Notice', 'Shuttle SH003 will be offline for maintenance from 2:00 PM - 4:00 PM today', 'warning'),
(NULL, 'Welcome!', 'Welcome to ShuttleGO - Your smart campus transportation companion', 'success');