import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Calendar, MapPin, Clock, Users, Bus, QrCode, CreditCard, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useNavigate } from 'react-router-dom';
// Payment handled inline with a dedicated step

interface Route {
  id: string;
  name: string;
  description: string;
  start_location: string;
  end_location: string;
  stops: any;
  estimated_duration: number;
}

interface Shuttle {
  id: string;
  shuttle_code: string;
  driver_name: string;
  capacity: number;
  current_occupancy: number;
  status: string;
}

interface Schedule {
  id: string;
  shuttle_id: string;
  route_id: string;
  departure_time: string;
  arrival_time: string;
  days_of_week: number[];
}

const BookingPage = () => {
  const SIMULATE = ((import.meta as any)?.env?.VITE_SIMULATE_BOOKING === 'true');
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [shuttles, setShuttles] = useState<Shuttle[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(0); // 0: Trip, 1: Shuttle, 2: Review, 3: Payment, 4: Confirm
  const [selectedRoute, setSelectedRoute] = useState<string>('');
  const [selectedPickup, setSelectedPickup] = useState<string>('');
  const [selectedDestination, setSelectedDestination] = useState<string>('');
  const [bookingDate, setBookingDate] = useState<string>('');
  const [bookingTime, setBookingTime] = useState<string>('');
  const [availableShuttles, setAvailableShuttles] = useState<any[]>([]);
  const [selectedShuttle, setSelectedShuttle] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [fareGhs, setFareGhs] = useState<number>(5);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'momo' | 'card'>('momo');
  const [momoNumber, setMomoNumber] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [momoProvider, setMomoProvider] = useState<'MTN' | 'Vodafone' | 'AirtelTigo' | ''>('');
  const [payerName, setPayerName] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [saveMethod, setSaveMethod] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [confirmation, setConfirmation] = useState<{
    paymentReference: string;
    qrCode: string;
    bookedAt: string;
    bookingId?: string;
  } | null>(null);

  useEffect(() => {
    fetchRoutes();
    fetchShuttles();
    fetchSchedules();
  }, []);

  useEffect(() => {
    if (selectedRoute && bookingDate) {
      // Load shuttles for the selected route/day for selection in Step 2
      findAvailableShuttles();
    } else {
      setAvailableShuttles([]);
    }
  }, [selectedRoute, bookingDate]);

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
    const dayIndex = bookingDay === 0 ? 7 : bookingDay; // Convert Sunday from 0 to 7

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

      // Capacity check
      const chosen = shuttles.find(s => s.id === selectedShuttle);
      if (chosen && chosen.current_occupancy >= chosen.capacity) {
        toast({ title: 'Shuttle full', description: 'Please select another shuttle time.', variant: 'destructive' });
        return;
      }

      const qrCode = `SHUTTLEGO-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Simulation mode: store in localStorage and immediately confirm
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

      setConfirmation({ paymentReference, qrCode, bookedAt: new Date().toISOString() });
      setCurrentStep(4);
      toast({ title: 'Payment Successful', description: 'Your shuttle has been booked.' });
      // Simulation mode: no background updates
  };

  const selectedRouteData = routes.find(r => r.id === selectedRoute);

  const steps = [
    { key: 'trip', label: 'Trip Details', icon: <MapPin className="w-4 h-4" /> },
    { key: 'shuttle', label: 'Select Shuttle', icon: <Bus className="w-4 h-4" /> },
    { key: 'review', label: 'Review', icon: <Clock className="w-4 h-4" /> },
    { key: 'payment', label: 'Payment', icon: <CreditCard className="w-4 h-4" /> },
  ];

  const canProceedStep0 = !!(selectedRoute && bookingDate && selectedPickup && selectedDestination);
  const canProceedStep1 = !!(selectedShuttle && bookingTime);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="py-8">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Book Your Shuttle
            </h1>
            <p className="text-lg text-muted-foreground">
              Reserve your seat on campus shuttles
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            {/* Stepper */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                {steps.map((s, index) => (
                  <div key={s.key} className="flex-1 flex items-center last:flex-none">
                    <div className={`flex items-center gap-2 ${currentStep === index || currentStep > index ? 'text-primary' : 'text-muted-foreground'}`}>
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center border ${currentStep >= index ? 'bg-primary text-primary-foreground border-primary' : 'border-muted-foreground/30'}`}>
                        {currentStep > index ? <CheckCircle2 className="w-4 h-4" /> : s.icon}
                      </div>
                      <span className="text-sm font-medium hidden sm:block">{s.label}</span>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`mx-2 sm:mx-4 mt-4 h-[2px] flex-1 ${currentStep > index ? 'bg-primary' : 'bg-muted'}`}></div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bus className="w-5 h-5 text-primary" />
                  {currentStep === 0 && 'Trip Details'}
                  {currentStep === 1 && 'Select Shuttle'}
                  {currentStep === 2 && 'Review'}
                  {currentStep === 3 && 'Payment'}
                  {currentStep === 4 && 'Confirmation'}
                </CardTitle>
                {currentStep <= 3 && (
                  <CardDescription>Follow the steps to complete your booking</CardDescription>
                )}
              </CardHeader>
              
              <CardContent>
                {/* Step 0: Trip Details */}
                {currentStep === 0 && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="route" className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          Select Route
                        </Label>
                        <Select value={selectedRoute} onValueChange={(v) => { setSelectedRoute(v); setSelectedPickup(''); setSelectedDestination(''); }}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a route" />
                          </SelectTrigger>
                          <SelectContent>
                            {routes.map((route) => (
                              <SelectItem key={route.id} value={route.id}>
                                {route.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="date" className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Booking Date
                        </Label>
                        <Input
                          id="date"
                          type="date"
                          value={bookingDate}
                          onChange={(e) => setBookingDate(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                    </div>

                    {selectedRouteData && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="pickup">Pickup Location</Label>
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

                        <div className="space-y-2">
                          <Label htmlFor="destination">Destination</Label>
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
                    )}

                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" disabled>
                        <ChevronLeft className="w-4 h-4 mr-2" /> Back
                      </Button>
                      <Button type="button" onClick={() => setCurrentStep(1)} disabled={!canProceedStep0}>
                        Next <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 1: Select Shuttle */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <Label className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Available Shuttles
                      </Label>
                      <div className="grid gap-3">
                        {availableShuttles.length === 0 && (
                          <div className="text-sm text-muted-foreground">No shuttles available. Pick another date/route.</div>
                        )}
                        {availableShuttles.map((item: any) => (
                          <Card
                            key={item.id}
                            className={`cursor-pointer transition-all ${selectedShuttle === item.shuttle_id ? 'border-primary shadow-soft' : 'hover:shadow-soft'}`}
                            onClick={() => {
                              setSelectedShuttle(item.shuttle_id);
                              setBookingTime(item.departure_time);
                            }}
                          >
                            <CardContent className="p-4">
                              <div className="flex justify-between items-center">
                                <div>
                                  <h4 className="font-semibold">{item.shuttle?.shuttle_code}</h4>
                                  <p className="text-sm text-muted-foreground">Driver: {item.shuttle?.driver_name}</p>
                                  <p className="text-sm font-medium">Departure: {item.departure_time} | Arrival: {item.arrival_time}</p>
                                </div>
                                <div className="text-right">
                                  <div className="flex items-center gap-1 text-sm">
                                    <Users className="w-4 h-4" />
                                    {item.shuttle?.current_occupancy}/{item.shuttle?.capacity}
                                  </div>
                                  <div className={`text-xs px-2 py-1 rounded ${item.shuttle?.current_occupancy < item.shuttle?.capacity * 0.8 ? 'bg-ug-success/20 text-ug-success' : 'bg-ug-warning/20 text-ug-warning'}`}>
                                    {item.shuttle?.current_occupancy < item.shuttle?.capacity * 0.8 ? 'Available' : 'Nearly Full'}
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-between gap-2">
                      <Button type="button" variant="outline" onClick={() => setCurrentStep(0)}>
                        <ChevronLeft className="w-4 h-4 mr-2" /> Back
                      </Button>
                      <Button type="button" onClick={() => setCurrentStep(2)} disabled={!canProceedStep1}>
                        Next <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 2: Review */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Route</div>
                        <div className="font-medium">{routes.find(r => r.id === selectedRoute)?.name || '-'}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Shuttle</div>
                        <div className="font-medium">{shuttles.find(s => s.id === selectedShuttle)?.shuttle_code || '-'}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Pickup</div>
                        <div className="font-medium">{selectedPickup || '-'}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Destination</div>
                        <div className="font-medium">{selectedDestination || '-'}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Date</div>
                        <div className="font-medium">{bookingDate || '-'}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Time</div>
                        <div className="font-medium">{bookingTime || '-'}</div>
                      </div>
                      <div className="col-span-2 flex items-center justify-between pt-2 border-t">
                        <div className="text-muted-foreground">Total</div>
                        <div className="text-lg font-semibold">GH₵ {fareGhs.toFixed(2)}</div>
                      </div>
                    </div>
                    <div className="flex justify-between gap-2">
                      <Button type="button" variant="outline" onClick={() => setCurrentStep(1)}>
                        <ChevronLeft className="w-4 h-4 mr-2" /> Back
                      </Button>
                      <Button type="button" onClick={() => { setShowPayment(true); setCurrentStep(3); }} disabled={!canProceedStep1}>
                        Proceed to Payment <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 3: Payment */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('momo')}
                        className={`p-4 rounded-lg border text-left transition-all ${paymentMethod === 'momo' ? 'border-primary ring-2 ring-primary/30 bg-primary/5' : 'border-muted'} hover:shadow-soft`}
                      >
                        <div className="font-semibold">Mobile Money</div>
                        <div className="text-sm text-muted-foreground">Pay with MTN, Vodafone, AirtelTigo</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('card')}
                        className={`p-4 rounded-lg border text-left transition-all ${paymentMethod === 'card' ? 'border-primary ring-2 ring-primary/30 bg-primary/5' : 'border-muted'} hover:shadow-soft`}
                      >
                        <div className="font-semibold">Debit/Credit Card</div>
                        <div className="text-sm text-muted-foreground">Visa, Mastercard accepted</div>
                      </button>
                    </div>

                    {paymentMethod === 'momo' ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="momo-provider">Provider</Label>
                            <Select value={momoProvider} onValueChange={(v) => setMomoProvider(v as any)}>
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
                            <Input id="payer-name" placeholder="Full name on MoMo" value={payerName} onChange={(e) => setPayerName(e.target.value)} />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="momo">MoMo Number</Label>
                          <Input id="momo" placeholder="e.g. 024XXXXXXX" value={momoNumber} onChange={(e) => setMomoNumber(e.target.value)} />
                        </div>
                        <div className="flex items-center gap-2">
                          <input id="save-momo" type="checkbox" checked={saveMethod} onChange={(e) => setSaveMethod(e.target.checked)} className="h-4 w-4" />
                          <Label htmlFor="save-momo" className="text-sm text-muted-foreground">Save this method for faster checkout</Label>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="cardname">Name on Card</Label>
                          <Input id="cardname" placeholder="Exact name on card" value={cardName} onChange={(e) => setCardName(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cardnum">Card Number</Label>
                          <Input id="cardnum" placeholder="4242 4242 4242 4242" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="exp">Expiry</Label>
                            <Input id="exp" placeholder="MM/YY" value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="cvc">CVC</Label>
                            <Input id="cvc" placeholder="123" value={cardCvc} onChange={(e) => setCardCvc(e.target.value)} />
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <input id="save-card" type="checkbox" checked={saveMethod} onChange={(e) => setSaveMethod(e.target.checked)} className="h-4 w-4" />
                          <Label htmlFor="save-card" className="text-sm text-muted-foreground">Save this card for faster checkout</Label>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Amount</span>
                      <span className="font-semibold">GH₵ {fareGhs.toFixed(2)}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <input id="agree" type="checkbox" checked={agreedTerms} onChange={(e) => setAgreedTerms(e.target.checked)} className="h-4 w-4" />
                      <Label htmlFor="agree" className="text-sm text-muted-foreground">I agree to the terms and refund policy</Label>
                    </div>
                    <div className="text-xs text-muted-foreground">Your payment information is encrypted and securely processed.</div>

                    <div className="flex justify-between gap-2">
                      <Button type="button" variant="outline" onClick={() => setCurrentStep(2)} disabled={isLoading}>
                        <ChevronLeft className="w-4 h-4 mr-2" /> Back
                      </Button>
                      <Button
                        type="button"
                        className="bg-gradient-primary"
                        disabled={
                          isLoading || !agreedTerms || (
                            paymentMethod === 'momo'
                              ? !(momoProvider && payerName && momoNumber.length >= 9)
                              : !(cardName && cardNumber.replace(/\s/g, '').length >= 12 && cardExpiry && cardCvc.length >= 3)
                          )
                        }
                        onClick={async () => {
                          setIsLoading(true);
                          try {
                            const ref = `UGS-${paymentMethod}-${Date.now()}`;
                            await finalizeBooking(ref);
                          } catch (e: any) {
                            console.error('Finalize booking failed:', e?.message || e);
                            toast({ title: 'Payment failed', description: 'Could not complete booking. Please try again.', variant: 'destructive' });
                          } finally {
                            setIsLoading(false);
                          }
                        }}
                      >
                        {isLoading ? 'Confirming…' : 'Pay & Book'}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 4: Confirmation */}
                {currentStep === 4 && confirmation && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 text-ug-success">
                      <CheckCircle2 className="w-5 h-5" />
                      <span className="font-semibold">Booking Confirmed</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Payment Ref</div>
                        <div className="font-medium break-all">{confirmation.paymentReference}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Booked At</div>
                        <div className="font-medium">{new Date(confirmation.bookedAt).toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Route</div>
                        <div className="font-medium">{routes.find(r => r.id === selectedRoute)?.name || '-'}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Shuttle</div>
                        <div className="font-medium">{shuttles.find(s => s.id === selectedShuttle)?.shuttle_code || '-'}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Pickup</div>
                        <div className="font-medium">{selectedPickup}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Destination</div>
                        <div className="font-medium">{selectedDestination}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Date</div>
                        <div className="font-medium">{bookingDate}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Time</div>
                        <div className="font-medium">{bookingTime}</div>
                      </div>
                      <div className="col-span-1 md:col-span-2 flex items-center justify-between pt-2 border-t">
                        <div className="text-muted-foreground">Total Paid</div>
                        <div className="text-lg font-semibold">GH₵ {fareGhs.toFixed(2)}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-muted rounded">
                      <QrCode className="w-12 h-12" />
                      <div>
                        <div className="text-sm text-muted-foreground">Present this code when boarding</div>
                        <div className="font-mono text-sm break-all">{confirmation.qrCode}</div>
                      </div>
                    </div>

                    <div className="flex justify-between gap-2">
                      <Button type="button" variant="outline" onClick={() => navigate(`/my-bookings${confirmation?.bookingId ? `?highlight=${confirmation.bookingId}` : ''}`)}>
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
                          setMomoNumber('');
                          setCardNumber('');
                          setConfirmation(null);
                          setCurrentStep(0);
                        }}
                      >
                        Book Another Ride
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default BookingPage;