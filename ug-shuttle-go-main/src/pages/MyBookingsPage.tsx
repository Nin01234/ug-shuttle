import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { QrCode, MapPin, Clock, Bus, Calendar, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface Booking {
  id: string;
  pickup_location: string;
  destination: string;
  booking_date: string;
  booking_time: string;
  status: string;
  qr_code: string;
  created_at: string;
  payment_reference?: string;
  shuttles: {
    shuttle_code: string;
    driver_name: string;
  };
  routes: {
    name: string;
  };
}

const MyBookingsPage = () => {
  const SIMULATE = ((import.meta as any)?.env?.VITE_SIMULATE_BOOKING === 'true');
  const { user } = useAuth();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [justCreatedId, setJustCreatedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchBookings();
      if (!SIMULATE) {
        const channel = supabase
          .channel('booking-updates')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings', filter: `user_id=eq.${user.id}` }, () => fetchBookings())
          .subscribe();
        return () => {
          supabase.removeChannel(channel);
        };
      }
    }
  }, [user]);

  // Read bookingId from query to highlight and scroll to it
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('highlight');
    if (id) setJustCreatedId(id);
  }, []);

  const fetchBookings = async () => {
    try {
      // Always read simulated bookings
      const simKey = 'simulated_bookings';
      const simulated: Booking[] = JSON.parse(localStorage.getItem(simKey) || '[]');

      // Try DB fetch unless simulation-only
      let dbData: Booking[] = [];
      if (!SIMULATE) {
        try {
          const { data, error } = await supabase
            .from('bookings')
            .select(`
              *,
              shuttles (shuttle_code, driver_name),
              routes (name)
            `)
            .eq('user_id', user?.id)
            .order('booking_date', { ascending: false })
            .order('booking_time', { ascending: false });
          if (error) throw error;
          dbData = data || [];
        } catch {}
      }

      // Merge, prefer simulated first
      const map = new Map<string, Booking>();
      [...simulated, ...dbData].forEach((b: any) => {
        if (b && b.id) map.set(b.id, b);
      });
      const merged = Array.from(map.values()).sort((a: any, b: any) => {
        const aDate = new Date(`${a.booking_date}T${a.booking_time || '00:00'}`);
        const bDate = new Date(`${b.booking_date}T${b.booking_time || '00:00'}`);
        return bDate.getTime() - aDate.getTime();
      });

      setBookings(merged);

      if (merged.length > 0 && justCreatedId) {
        setTimeout(() => {
          const el = document.getElementById(`booking-${justCreatedId}`);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 250);
      }
    } catch (error: any) {
      toast({ title: 'Error', description: 'Failed to load bookings', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (bookingId: string) => {
    try {
      const isSimulated = bookingId.startsWith('sim-');
      if (SIMULATE || isSimulated) {
        const key = 'simulated_bookings';
        const prev = JSON.parse(localStorage.getItem(key) || '[]');
        const next = prev.filter((b: any) => b.id !== bookingId);
        localStorage.setItem(key, JSON.stringify(next));
        window.dispatchEvent(new Event('simulated_bookings_updated'));
        setBookings((cur) => cur.filter((b) => b.id !== bookingId));
      } else {
        const { error } = await supabase
          .from('bookings')
          .update({ status: 'cancelled' })
          .eq('id', bookingId);
        if (error) {
          // Fallback: if it's actually a simulated booking stored locally, remove it
          const key = 'simulated_bookings';
          const prev = JSON.parse(localStorage.getItem(key) || '[]');
          const existsLocal = Array.isArray(prev) && prev.some((b: any) => b.id === bookingId);
          if (existsLocal) {
            const next = prev.filter((b: any) => b.id !== bookingId);
            localStorage.setItem(key, JSON.stringify(next));
            window.dispatchEvent(new Event('simulated_bookings_updated'));
            setBookings((cur) => cur.filter((b) => b.id !== bookingId));
          } else {
            throw error;
          }
        } else {
          fetchBookings();
        }
      }

      toast({ title: 'Booking Cancelled', description: 'Your booking has been cancelled successfully', variant: 'default' });
    } catch (error: any) {
      toast({ title: 'Error', description: 'Failed to cancel booking', variant: 'destructive' });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-ug-success/20 text-ug-success';
      case 'cancelled':
        return 'bg-destructive/20 text-destructive';
      case 'completed':
        return 'bg-blue-500/20 text-blue-600';
      case 'no_show':
        return 'bg-ug-warning/20 text-ug-warning';
      default:
        return 'bg-muted/20 text-muted-foreground';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`1970-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your bookings...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="py-8">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              My Bookings
            </h1>
            <p className="text-lg text-muted-foreground">
              View and manage your shuttle reservations
            </p>
          </div>

          {bookings.length === 0 ? (
            <div className="text-center py-20">
              <Bus className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No bookings yet</h3>
              <p className="text-muted-foreground mb-6">You haven't made any shuttle bookings yet.</p>
              <Button asChild>
                <a href="/booking">Book Your First Shuttle</a>
              </Button>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-6">
              {bookings.map((booking) => (
                <Card id={`booking-${booking.id}`} key={booking.id} className={`shadow-medium hover:shadow-strong transition-all ${justCreatedId === booking.id ? 'ring-2 ring-primary animate-pulse' : ''}`}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Bus className="w-5 h-5 text-primary" />
                          {booking.routes.name}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          Shuttle: {booking.shuttles.shuttle_code} • Driver: {booking.shuttles.driver_name}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(booking.status)}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </Badge>
                        {booking.status === 'confirmed' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => cancelBooking(booking.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <div className="text-sm">
                          <p className="font-medium">From</p>
                          <p className="text-muted-foreground">{booking.pickup_location}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <div className="text-sm">
                          <p className="font-medium">To</p>
                          <p className="text-muted-foreground">{booking.destination}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <div className="text-sm">
                          <p className="font-medium">Date</p>
                          <p className="text-muted-foreground">{formatDate(booking.booking_date)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <div className="text-sm">
                          <p className="font-medium">Time</p>
                          <p className="text-muted-foreground">{formatTime(booking.booking_time)}</p>
                        </div>
                      </div>
                    </div>
                    
                    {booking.status === 'confirmed' && booking.qr_code && (
                      <div className="bg-muted/50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <QrCode className="w-8 h-8 text-primary" />
                            <div>
                              <p className="font-medium text-sm">Digital Ticket</p>
                              <p className="text-xs text-muted-foreground">Show this QR code to the driver</p>
                              {booking.payment_reference && (
                                <p className="text-xs text-muted-foreground mt-1">Ref: {booking.payment_reference}</p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">QR Code</p>
                            <p className="font-mono text-sm">{booking.qr_code.slice(-8)}</p>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                          <span>Booked: {new Date(booking.created_at).toLocaleString()}</span>
                          <span>Fare: GH₵ 5.00</span>
                        </div>
                      </div>
                    )}

                    <div className="mt-4 flex flex-wrap gap-2 justify-end">
                      <Button asChild variant="outline" size="sm">
                        <Link to={`/my-bookings/${booking.id}`}>View Details</Link>
                      </Button>
                      {booking.status === 'confirmed' && (
                        <Button asChild size="sm" className="bg-gradient-primary">
                          <a href="/tracking">Track Shuttle</a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default MyBookingsPage;