import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Bus, 
  QrCode, 
  CreditCard, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight,
  Star,
  Shield,
  Zap,
  Heart,
  Smartphone,
  Wallet,
  Receipt,
  Navigation,
  Timer,
  Route
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useNavigate } from 'react-router-dom';

interface Route {
  id: string;
  name: string;
  description: string;
  start_location: string;
  end_location: string;
  stops: any;
  estimated_duration: number;
  base_fare: number;
}

interface Shuttle {
  id: string;
  shuttle_code: string;
  driver_name: string;
  capacity: number;
  current_occupancy: number;
  status: string;
  amenities: string[];
}

interface Schedule {
  id: string;
  shuttle_id: string;
  route_id: string;
  departure_time: string;
  arrival_time: string;
  days_of_week: number[];
}

interface BookingPreferences {
  seatPreference: 'window' | 'aisle' | 'any';
  accessibility: boolean;
  notifications: boolean;
  insurance: boolean;
}

const AdvancedBookingPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Core state
  const [routes, setRoutes] = useState<Route[]>([]);
  const [shuttles, setShuttles] = useState<Shuttle[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(0);
  
  // Booking details
  const [selectedRoute, setSelectedRoute] = useState<string>('');
  const [selectedPickup, setSelectedPickup] = useState<string>('');
  const [selectedDestination, setSelectedDestination] = useState<string>('');
  const [bookingDate, setBookingDate] = useState<string>('');
  const [bookingTime, setBookingTime] = useState<string>('');
  const [selectedShuttle, setSelectedShuttle] = useState<string>('');
  const [availableShuttles, setAvailableShuttles] = useState<any[]>([]);
  
  // Preferences
  const [preferences, setPreferences] = useState<BookingPreferences>({
    seatPreference: 'any',
    accessibility: false,
    notifications: true,
    insurance: false
  });
  
  // Payment
  const [paymentMethod, setPaymentMethod] = useState<'momo' | 'card' | 'wallet'>('momo');
  const [paymentDetails, setPaymentDetails] = useState<any>({});
  const [agreedTerms, setAgreedTerms] = useState(false);
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [confirmation, setConfirmation] = useState<any>(null);
  
  // Fare calculation
  const [baseFare, setBaseFare] = useState<number>(5);
  const [totalFare, setTotalFare] = useState<number>(5);
  const [discounts, setDiscounts] = useState<number>(0);
  const [fees, setFees] = useState<number>(0);

  useEffect(() => {
    fetchRoutes();
    fetchShuttles();
    fetchSchedules();
  }, []);

  useEffect(() => {
    if (selectedRoute && bookingDate) {
      findAvailableShuttles();
    }
  }, [selectedRoute, bookingDate]);

  useEffect(() => {
    calculateFare();
  }, [selectedRoute, preferences, baseFare]);

  const fetchRoutes = async () => {
    try {
      const { data, error } = await supabase
        .from('routes')
        .select('*')
        .eq('is_active', true);
      
      if (error) throw error;
      setRoutes(data || []);
    } catch (error) {
      console.error('Error fetching routes:', error);
    }
  };

  const fetchShuttles = async () => {
    try {
      const { data, error } = await supabase
        .from('shuttles')
        .select('*')
        .eq('status', 'active');
      
      if (error) throw error;
      setShuttles(data || []);
    } catch (error) {
      console.error('Error fetching shuttles:', error);
    }
  };

  const fetchSchedules = async () => {
    try {
      const { data, error } = await supabase
        .from('shuttle_schedules')
        .select('*')
        .eq('is_active', true);
      
      if (error) throw error;
      setSchedules(data || []);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    }
  };

  const findAvailableShuttles = () => {
    const route = routes.find(r => r.id === selectedRoute);
    if (!route) return;

    const bookingDay = new Date(bookingDate).getDay();
    const dayIndex = bookingDay === 0 ? 7 : bookingDay;

    const relevantSchedules = schedules.filter(schedule => 
      schedule.route_id === selectedRoute &&
      schedule.days_of_week.includes(dayIndex)
    );

    const available = relevantSchedules.map(schedule => {
      const shuttle = shuttles.find(s => s.id === schedule.shuttle_id);
      return {
        ...schedule,
        shuttle,
        route
      };
    }).filter(item => item.shuttle);

    setAvailableShuttles(available);
    setBaseFare(route.base_fare || 5);
  };

  const calculateFare = () => {
    let total = baseFare;
    let discount = 0;
    let fee = 0;

    // Apply discounts
    if (preferences.accessibility) {
      discount += baseFare * 0.1; // 10% discount for accessibility
    }

    // Apply fees
    if (preferences.insurance) {
      fee += 2; // Insurance fee
    }

    setDiscounts(discount);
    setFees(fee);
    setTotalFare(Math.max(0, total - discount + fee));
  };

  const finalizeBooking = async (paymentReference: string) => {
    if (!user) {
      toast({
        title: 'Login required',
        description: 'Please login to book a shuttle.',
        variant: 'destructive',
      });
      navigate('/auth');
      return;
    }

    if (!selectedRoute || !selectedShuttle || !bookingDate || !bookingTime || !selectedPickup || !selectedDestination) {
      toast({ title: 'Missing details', description: 'Complete all fields to proceed.', variant: 'destructive' });
      return;
    }

    const chosen = shuttles.find(s => s.id === selectedShuttle);
    if (chosen && chosen.current_occupancy >= chosen.capacity) {
      toast({ title: 'Shuttle full', description: 'Please select another shuttle time.', variant: 'destructive' });
      return;
    }

    const qrCode = `SHUTTLEGO-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    // Simulation mode: save to localStorage for My Bookings to read, then confirm
    try {
      const simId = `sim-${Date.now()}`;
      const routeName = routes.find(r => r.id === selectedRoute)?.name || '';
      const shuttle = shuttles.find(s => s.id === selectedShuttle);
      const simulated = {
        id: simId,
        user_id: user.id,
        pickup_location: selectedPickup,
        destination: selectedDestination,
        booking_date: bookingDate,
        booking_time: bookingTime,
        status: 'confirmed',
        qr_code: qrCode,
        created_at: new Date().toISOString(),
        payment_reference: paymentReference,
        total_fare: totalFare,
        base_fare: baseFare,
        discounts,
        fees,
        preferences,
        shuttles: {
          shuttle_code: shuttle?.shuttle_code || '-',
          driver_name: shuttle?.driver_name || '-',
        },
        routes: { name: routeName },
      } as any;
      const key = 'simulated_bookings';
      const prev = JSON.parse(localStorage.getItem(key) || '[]');
      localStorage.setItem(key, JSON.stringify([simulated, ...prev].slice(0, 100)));
      window.dispatchEvent(new Event('simulated_bookings_updated'));

      // Add a simulated notification for this booking
      const notifKey = 'simulated_notifications';
      const notif = {
        id: `notif-${Date.now()}`,
        user_id: user.id,
        title: 'Booking confirmed',
        message: `Shuttle booked for ${new Date(bookingDate).toLocaleDateString()} at ${bookingTime} — ${routeName}`,
        type: 'booking',
        is_read: false,
        created_at: new Date().toISOString(),
      } as any;
      const prevNotifs = JSON.parse(localStorage.getItem(notifKey) || '[]');
      localStorage.setItem(notifKey, JSON.stringify([notif, ...prevNotifs].slice(0, 50)));
      window.dispatchEvent(new Event('simulated_notifications_updated'));
      toast({ title: 'Booking confirmed', description: `Shuttle booked for ${new Date(bookingDate).toLocaleDateString()} at ${bookingTime}` });
    } catch {}

    setConfirmation({ paymentReference, qrCode, bookedAt: new Date().toISOString(), bookingId: undefined, bookingNumber: `SIM-${Date.now()}`, totalFare, preferences });
    setCurrentStep(4);
    toast({ title: 'Booking Confirmed!', description: 'Your shuttle has been successfully booked.' });

    // Simulation mode: no background updates
  };

  const selectedRouteData = routes.find(r => r.id === selectedRoute);

  const steps = [
    { key: 'route', label: 'Select Route', icon: <Route className="w-4 h-4" /> },
    { key: 'shuttle', label: 'Choose Shuttle', icon: <Bus className="w-4 h-4" /> },
    { key: 'preferences', label: 'Preferences', icon: <Star className="w-4 h-4" /> },
    { key: 'payment', label: 'Payment', icon: <CreditCard className="w-4 h-4" /> },
    { key: 'confirm', label: 'Confirmation', icon: <CheckCircle2 className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Navbar />
      
      <main className="py-8">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Book Your Shuttle
            </h1>
            <p className="text-xl text-muted-foreground">
              Experience premium shuttle service with advanced features
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            {/* Enhanced Stepper */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                {steps.map((s, index) => (
                  <div key={s.key} className="flex-1 flex items-center last:flex-none">
                    <div className={`flex items-center gap-3 ${currentStep === index || currentStep > index ? 'text-primary' : 'text-muted-foreground'}`}>
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center border-2 transition-all ${currentStep >= index ? 'bg-primary text-primary-foreground border-primary shadow-lg' : 'border-muted-foreground/30'}`}>
                        {currentStep > index ? <CheckCircle2 className="w-5 h-5" /> : s.icon}
                      </div>
                      <span className="text-sm font-medium hidden sm:block">{s.label}</span>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`mx-2 sm:mx-4 mt-5 h-[3px] flex-1 rounded-full transition-all ${currentStep > index ? 'bg-primary' : 'bg-muted'}`}></div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Booking Card */}
              <div className="lg:col-span-2">
                <Card className="shadow-xl border-0 bg-card/50 backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
                    <CardTitle className="flex items-center gap-3 text-2xl">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Bus className="w-6 h-6 text-primary" />
                      </div>
                      {currentStep === 0 && 'Select Your Route'}
                      {currentStep === 1 && 'Choose Your Shuttle'}
                      {currentStep === 2 && 'Booking Preferences'}
                      {currentStep === 3 && 'Secure Payment'}
                      {currentStep === 4 && 'Booking Confirmed'}
                    </CardTitle>
                    <CardDescription className="text-base">
                      {currentStep <= 3 && 'Follow the steps to complete your premium booking experience'}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="p-8">
                    {/* Step 0: Route Selection */}
                    {currentStep === 0 && (
                      <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <Label htmlFor="route" className="flex items-center gap-2 text-base font-medium">
                              <Route className="w-5 h-5 text-primary" />
                              Select Route
                            </Label>
                            <Select value={selectedRoute} onValueChange={(v) => { setSelectedRoute(v); setSelectedPickup(''); setSelectedDestination(''); }}>
                              <SelectTrigger className="h-12">
                                <SelectValue placeholder="Choose your route" />
                              </SelectTrigger>
                              <SelectContent>
                                {routes.map((route) => (
                                  <SelectItem key={route.id} value={route.id}>
                                    <div className="flex items-center justify-between w-full">
                                      <span>{route.name}</span>
                                      <Badge variant="secondary" className="ml-2">GH₵{route.base_fare || 5}</Badge>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-3">
                            <Label htmlFor="date" className="flex items-center gap-2 text-base font-medium">
                              <Calendar className="w-5 h-5 text-primary" />
                              Travel Date
                            </Label>
                            <Input
                              id="date"
                              type="date"
                              value={bookingDate}
                              onChange={(e) => setBookingDate(e.target.value)}
                              min={new Date().toISOString().split('T')[0]}
                              className="h-12"
                            />
                          </div>
                        </div>

                        {selectedRouteData && (
                          <div className="space-y-6">
                            <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg p-6">
                              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-primary" />
                                {selectedRouteData.name}
                              </h3>
                              <p className="text-muted-foreground mb-4">{selectedRouteData.description}</p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-3">
                                  <Label htmlFor="pickup" className="text-sm font-medium">Pickup Location</Label>
                                  <Select value={selectedPickup} onValueChange={setSelectedPickup}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select pickup point" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {selectedRouteData.stops.map((stop: string, index: number) => (
                                        <SelectItem key={index} value={stop}>
                                          {stop}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div className="space-y-3">
                                  <Label htmlFor="destination" className="text-sm font-medium">Destination</Label>
                                  <Select value={selectedDestination} onValueChange={setSelectedDestination}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select destination" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {selectedRouteData.stops.map((stop: string, index: number) => (
                                        <SelectItem key={index} value={stop}>
                                          {stop}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="flex justify-end gap-3">
                          <Button type="button" variant="outline" disabled className="px-6">
                            <ChevronLeft className="w-4 h-4 mr-2" /> Back
                          </Button>
                          <Button 
                            type="button" 
                            onClick={() => setCurrentStep(1)} 
                            disabled={!selectedRoute || !bookingDate || !selectedPickup || !selectedDestination}
                            className="px-8 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                          >
                            Next <ChevronRight className="w-4 h-4 ml-2" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Step 1: Shuttle Selection */}
                    {currentStep === 1 && (
                      <div className="space-y-8">
                        <div className="space-y-6">
                          <Label className="flex items-center gap-2 text-lg font-medium">
                            <Clock className="w-5 h-5 text-primary" />
                            Available Shuttles
                          </Label>
                          <div className="grid gap-4">
                            {availableShuttles.length === 0 && (
                              <div className="text-center py-12 text-muted-foreground">
                                <Bus className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                <p className="text-lg">No shuttles available for this route and date.</p>
                                <p className="text-sm">Please try a different date or route.</p>
                              </div>
                            )}
                            {availableShuttles.map((item: any) => (
                              <Card
                                key={item.id}
                                className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                                  selectedShuttle === item.shuttle_id 
                                    ? 'border-primary shadow-lg ring-2 ring-primary/20 bg-primary/5' 
                                    : 'hover:shadow-md border-border'
                                }`}
                                onClick={() => {
                                  setSelectedShuttle(item.shuttle_id);
                                  setBookingTime(item.departure_time);
                                }}
                              >
                                <CardContent className="p-6">
                                  <div className="flex justify-between items-start">
                                    <div className="space-y-2">
                                      <div className="flex items-center gap-3">
                                        <div className="p-2 bg-primary/10 rounded-lg">
                                          <Bus className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                          <h4 className="font-semibold text-lg">{item.shuttle?.shuttle_code}</h4>
                                          <p className="text-sm text-muted-foreground">Driver: {item.shuttle?.driver_name}</p>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-4 text-sm">
                                        <div className="flex items-center gap-1">
                                          <Timer className="w-4 h-4 text-muted-foreground" />
                                          <span className="font-medium">{item.departure_time}</span>
                                        </div>
                                        <span className="text-muted-foreground">→</span>
                                        <div className="flex items-center gap-1">
                                          <Timer className="w-4 h-4 text-muted-foreground" />
                                          <span className="font-medium">{item.arrival_time}</span>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="text-right space-y-2">
                                      <div className="flex items-center gap-1 text-sm">
                                        <Users className="w-4 h-4 text-muted-foreground" />
                                        <span>{item.shuttle?.current_occupancy}/{item.shuttle?.capacity}</span>
                                      </div>
                                      <div className={`text-xs px-3 py-1 rounded-full font-medium ${
                                        item.shuttle?.current_occupancy < item.shuttle?.capacity * 0.8 
                                          ? 'bg-green-100 text-green-700' 
                                          : 'bg-orange-100 text-orange-700'
                                      }`}>
                                        {item.shuttle?.current_occupancy < item.shuttle?.capacity * 0.8 ? 'Available' : 'Nearly Full'}
                                      </div>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                        <div className="flex justify-between gap-3">
                          <Button type="button" variant="outline" onClick={() => setCurrentStep(0)} className="px-6">
                            <ChevronLeft className="w-4 h-4 mr-2" /> Back
                          </Button>
                          <Button 
                            type="button" 
                            onClick={() => setCurrentStep(2)} 
                            disabled={!selectedShuttle || !bookingTime}
                            className="px-8 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                          >
                            Next <ChevronRight className="w-4 h-4 ml-2" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Step 2: Preferences */}
                    {currentStep === 2 && (
                      <div className="space-y-8">
                        <div className="space-y-6">
                          <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Star className="w-5 h-5 text-primary" />
                            Booking Preferences
                          </h3>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card className="p-6 hover:shadow-md transition-shadow">
                              <CardHeader className="p-0 pb-4">
                                <CardTitle className="text-base flex items-center gap-2">
                                  <Users className="w-4 h-4 text-primary" />
                                  Seat Preference
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="p-0">
                                <div className="space-y-3">
                                  {[
                                    { value: 'window', label: 'Window Seat', icon: '🪟' },
                                    { value: 'aisle', label: 'Aisle Seat', icon: '🚶' },
                                    { value: 'any', label: 'Any Seat', icon: '🎯' }
                                  ].map((option) => (
                                    <label key={option.value} className="flex items-center gap-3 cursor-pointer">
                                      <input
                                        type="radio"
                                        name="seatPreference"
                                        value={option.value}
                                        checked={preferences.seatPreference === option.value}
                                        onChange={(e) => setPreferences(prev => ({ ...prev, seatPreference: e.target.value as any }))}
                                        className="h-4 w-4 text-primary"
                                      />
                                      <span className="text-lg">{option.icon}</span>
                                      <span className="font-medium">{option.label}</span>
                                    </label>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>

                            <Card className="p-6 hover:shadow-md transition-shadow">
                              <CardHeader className="p-0 pb-4">
                                <CardTitle className="text-base flex items-center gap-2">
                                  <Shield className="w-4 h-4 text-primary" />
                                  Additional Services
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="p-0">
                                <div className="space-y-4">
                                  <label className="flex items-center justify-between cursor-pointer">
                                    <div className="flex items-center gap-3">
                                      <input
                                        type="checkbox"
                                        checked={preferences.accessibility}
                                        onChange={(e) => setPreferences(prev => ({ ...prev, accessibility: e.target.checked }))}
                                        className="h-4 w-4 text-primary"
                                      />
                                      <span className="font-medium">Accessibility Support</span>
                                    </div>
                                    <Badge variant="secondary" className="text-xs">10% off</Badge>
                                  </label>
                                  
                                  <label className="flex items-center justify-between cursor-pointer">
                                    <div className="flex items-center gap-3">
                                      <input
                                        type="checkbox"
                                        checked={preferences.notifications}
                                        onChange={(e) => setPreferences(prev => ({ ...prev, notifications: e.target.checked }))}
                                        className="h-4 w-4 text-primary"
                                      />
                                      <span className="font-medium">SMS Notifications</span>
                                    </div>
                                    <Badge variant="secondary" className="text-xs">Free</Badge>
                                  </label>
                                  
                                  <label className="flex items-center justify-between cursor-pointer">
                                    <div className="flex items-center gap-3">
                                      <input
                                        type="checkbox"
                                        checked={preferences.insurance}
                                        onChange={(e) => setPreferences(prev => ({ ...prev, insurance: e.target.checked }))}
                                        className="h-4 w-4 text-primary"
                                      />
                                      <span className="font-medium">Travel Insurance</span>
                                    </div>
                                    <Badge variant="secondary" className="text-xs">+GH₵2</Badge>
                                  </label>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        </div>
                        
                        <div className="flex justify-between gap-3">
                          <Button type="button" variant="outline" onClick={() => setCurrentStep(1)} className="px-6">
                            <ChevronLeft className="w-4 h-4 mr-2" /> Back
                          </Button>
                          <Button 
                            type="button" 
                            onClick={() => setCurrentStep(3)}
                            className="px-8 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                          >
                            Next <ChevronRight className="w-4 h-4 ml-2" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Step 3: Payment */}
                    {currentStep === 3 && (
                      <div className="space-y-8">
                        <div className="space-y-6">
                          <h3 className="text-lg font-semibold flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-primary" />
                            Payment Method
                          </h3>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                              { value: 'momo', label: 'Mobile Money', icon: <Smartphone className="w-6 h-6" />, desc: 'MTN, Vodafone, AirtelTigo' },
                              { value: 'card', label: 'Card Payment', icon: <CreditCard className="w-6 h-6" />, desc: 'Visa, Mastercard' },
                              { value: 'wallet', label: 'Wallet', icon: <Wallet className="w-6 h-6" />, desc: 'ShuttleGO Credits' }
                            ].map((method) => (
                              <button
                                key={method.value}
                                type="button"
                                onClick={() => setPaymentMethod(method.value as any)}
                                className={`p-6 rounded-lg border-2 text-left transition-all ${
                                  paymentMethod === method.value 
                                    ? 'border-primary ring-2 ring-primary/30 bg-primary/5' 
                                    : 'border-border hover:border-primary/50'
                                }`}
                              >
                                <div className="flex items-center gap-3 mb-2">
                                  {method.icon}
                                  <span className="font-semibold">{method.label}</span>
                                </div>
                                <p className="text-sm text-muted-foreground">{method.desc}</p>
                              </button>
                            ))}
                          </div>

                          {paymentMethod === 'momo' && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="momo-provider">Provider</Label>
                                  <Select value={paymentDetails.provider || ''} onValueChange={(v) => setPaymentDetails(prev => ({ ...prev, provider: v }))}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select provider" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="MTN">MTN</SelectItem>
                                      <SelectItem value="Vodafone">Vodafone</SelectItem>
                                      <SelectItem value="AirtelTigo">AirtelTigo</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="payer-name">Account Name</Label>
                                  <Input 
                                    id="payer-name" 
                                    placeholder="Full name on MoMo" 
                                    value={paymentDetails.name || ''} 
                                    onChange={(e) => setPaymentDetails(prev => ({ ...prev, name: e.target.value }))} 
                                  />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="momo">MoMo Number</Label>
                                <Input 
                                  id="momo" 
                                  placeholder="e.g. 024XXXXXXX" 
                                  value={paymentDetails.number || ''} 
                                  onChange={(e) => setPaymentDetails(prev => ({ ...prev, number: e.target.value }))} 
                                />
                              </div>
                            </div>
                          )}

                          {paymentMethod === 'card' && (
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="cardname">Name on Card</Label>
                                <Input 
                                  id="cardname" 
                                  placeholder="Exact name on card" 
                                  value={paymentDetails.cardName || ''} 
                                  onChange={(e) => setPaymentDetails(prev => ({ ...prev, cardName: e.target.value }))} 
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="cardnum">Card Number</Label>
                                <Input 
                                  id="cardnum" 
                                  placeholder="4242 4242 4242 4242" 
                                  value={paymentDetails.cardNumber || ''} 
                                  onChange={(e) => setPaymentDetails(prev => ({ ...prev, cardNumber: e.target.value }))} 
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="exp">Expiry</Label>
                                  <Input 
                                    id="exp" 
                                    placeholder="MM/YY" 
                                    value={paymentDetails.expiry || ''} 
                                    onChange={(e) => setPaymentDetails(prev => ({ ...prev, expiry: e.target.value }))} 
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="cvc">CVC</Label>
                                  <Input 
                                    id="cvc" 
                                    placeholder="123" 
                                    value={paymentDetails.cvc || ''} 
                                    onChange={(e) => setPaymentDetails(prev => ({ ...prev, cvc: e.target.value }))} 
                                  />
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="flex items-center gap-2">
                            <input 
                              id="agree" 
                              type="checkbox" 
                              checked={agreedTerms} 
                              onChange={(e) => setAgreedTerms(e.target.checked)} 
                              className="h-4 w-4 text-primary" 
                            />
                            <Label htmlFor="agree" className="text-sm text-muted-foreground">
                              I agree to the terms and conditions and refund policy
                            </Label>
                          </div>
                        </div>
                        
                        <div className="flex justify-between gap-3">
                          <Button type="button" variant="outline" onClick={() => setCurrentStep(2)} className="px-6">
                            <ChevronLeft className="w-4 h-4 mr-2" /> Back
                          </Button>
                          <Button
                            type="button"
                            className="px-8 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                            disabled={
                              isLoading || !agreedTerms || (
                                paymentMethod === 'momo'
                                  ? !(paymentDetails.provider && paymentDetails.name && paymentDetails.number?.length >= 9)
                                  : paymentMethod === 'card'
                                  ? !(paymentDetails.cardName && paymentDetails.cardNumber?.replace(/\s/g, '').length >= 12 && paymentDetails.expiry && paymentDetails.cvc?.length >= 3)
                                  : paymentMethod === 'wallet'
                                  ? false
                                  : true
                              )
                            }
                            onClick={async () => {
                              setIsLoading(true);
                              try {
                                const ref = `UGS-${paymentMethod.toUpperCase()}-${Date.now()}`;
                                await finalizeBooking(ref);
                              } finally {
                                setIsLoading(false);
                              }
                            }}
                          >
                            {isLoading ? 'Processing...' : `Pay GH₵${totalFare.toFixed(2)} & Book`}
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Step 4: Confirmation */}
                    {currentStep === 4 && confirmation && (
                      <div className="space-y-8">
                        <div className="text-center space-y-4">
                          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                            <CheckCircle2 className="w-12 h-12 text-green-600" />
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-green-600 mb-2">Booking Confirmed!</h3>
                            <p className="text-muted-foreground">Your shuttle has been successfully booked</p>
                          </div>
                        </div>

                        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Receipt className="w-5 h-5 text-primary" />
                              Booking Details
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Booking ID</span>
                                <p className="font-mono font-semibold">{confirmation.bookingNumber}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Payment Ref</span>
                                <p className="font-mono font-semibold">{confirmation.paymentReference}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Route</span>
                                <p className="font-semibold">{selectedRouteData?.name}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Shuttle</span>
                                <p className="font-semibold">{shuttles.find(s => s.id === selectedShuttle)?.shuttle_code}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Pickup</span>
                                <p className="font-semibold">{selectedPickup}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Destination</span>
                                <p className="font-semibold">{selectedDestination}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Date & Time</span>
                                <p className="font-semibold">{bookingDate} at {bookingTime}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Total Paid</span>
                                <p className="font-semibold text-primary text-lg">GH₵{confirmation.totalFare.toFixed(2)}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
                          <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                              <div className="p-3 bg-primary/10 rounded-lg">
                                <QrCode className="w-8 h-8 text-primary" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold mb-1">Digital Ticket</h4>
                                <p className="text-sm text-muted-foreground mb-2">Present this QR code when boarding</p>
                                <p className="font-mono text-sm bg-background/50 p-2 rounded border">{confirmation.qrCode}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <div className="flex justify-between gap-3">
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => navigate(`/my-bookings?highlight=${confirmation.bookingId}`)}
                            className="px-6"
                          >
                            View My Bookings
                          </Button>
                          <Button
                            type="button"
                            onClick={() => {
                              // Reset for a new booking
                              setSelectedRoute('');
                              setSelectedPickup('');
                              setSelectedDestination('');
                              setBookingDate('');
                              setBookingTime('');
                              setSelectedShuttle('');
                              setAvailableShuttles([]);
                              setConfirmation(null);
                              setCurrentStep(0);
                              setPreferences({
                                seatPreference: 'any',
                                accessibility: false,
                                notifications: true,
                                insurance: false
                              });
                              setPaymentDetails({});
                            }}
                            className="px-8 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                          >
                            Book Another Ride
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Booking Summary Sidebar */}
              <div className="lg:col-span-1">
                <Card className="shadow-xl border-0 bg-card/50 backdrop-blur-sm sticky top-8">
                  <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
                    <CardTitle className="flex items-center gap-2">
                      <Receipt className="w-5 h-5 text-primary" />
                      Booking Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Route</span>
                        <span className="font-medium">{selectedRouteData?.name || 'Not selected'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Date</span>
                        <span className="font-medium">{bookingDate || 'Not selected'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Time</span>
                        <span className="font-medium">{bookingTime || 'Not selected'}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Base Fare</span>
                        <span className="font-medium">GH₵{baseFare.toFixed(2)}</span>
                      </div>
                      {discounts > 0 && (
                        <div className="flex justify-between text-sm text-green-600">
                          <span>Discount</span>
                          <span>-GH₵{discounts.toFixed(2)}</span>
                        </div>
                      )}
                      {fees > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Fees</span>
                          <span className="font-medium">GH₵{fees.toFixed(2)}</span>
                        </div>
                      )}
                      <Separator />
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span className="text-primary">GH₵{totalFare.toFixed(2)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AdvancedBookingPage;
