import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, Bus, Calendar, QrCode } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface BookingDetail {
  id: string;
  pickup_location: string;
  destination: string;
  booking_date: string;
  booking_time: string;
  status: string;
  qr_code: string;
  payment_reference?: string;
  shuttles: { shuttle_code: string; driver_name: string };
  routes: { name: string };
}

const BookingDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooking = async () => {
      if (!id || !user) return;
      const { data, error } = await supabase
        .from('bookings')
        .select(`*, shuttles (shuttle_code, driver_name), routes (name)`) 
        .eq('id', id)
        .eq('user_id', user.id)
        .single();
      if (!error) setBooking(data as unknown as BookingDetail);
      setLoading(false);
    };
    fetchBooking();
  }, [id, user]);

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const formatTime = (timeString: string) => new Date(`1970-01-01T${timeString}`).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <Button variant="outline" onClick={() => navigate('/my-bookings')} className="mb-4">Back to My Bookings</Button>
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bus className="w-5 h-5 text-primary" />
                  Booking Details
                </CardTitle>
                <CardDescription>View your full ticket information</CardDescription>
              </CardHeader>
              <CardContent>
                {loading && <p className="text-muted-foreground">Loading booking…</p>}
                {!loading && booking && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <div className="text-sm">
                          <p className="font-medium">Route</p>
                          <p className="text-muted-foreground">{booking.routes.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Bus className="w-4 h-4 text-muted-foreground" />
                        <div className="text-sm">
                          <p className="font-medium">Shuttle</p>
                          <p className="text-muted-foreground">{booking.shuttles.shuttle_code} • Driver: {booking.shuttles.driver_name}</p>
                        </div>
                      </div>
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

                    <div className="bg-muted/50 rounded-lg p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <QrCode className="w-10 h-10 text-primary" />
                          <div>
                            <p className="font-medium">Digital Ticket</p>
                            <p className="text-sm text-muted-foreground">Show this QR code to the driver</p>
                            {booking.payment_reference && (
                              <p className="text-xs text-muted-foreground mt-1">Ref: {booking.payment_reference}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">QR Code</p>
                          <p className="font-mono">{booking.qr_code}</p>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                        <span>Booked: {new Date(booking.booking_date + 'T' + booking.booking_time).toLocaleString()}</span>
                        <span>Fare: GH₵ 5.00</span>
                      </div>
                      <div className="mt-4 flex gap-2 justify-end">
                        <Button variant="outline" onClick={() => window.print()}>Print</Button>
                        <Button onClick={() => navigate('/tracking')} className="bg-gradient-primary">Track Shuttle</Button>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button onClick={() => navigate('/my-bookings')}>Done</Button>
                    </div>
                  </div>
                )}
                {!loading && !booking && (
                  <p className="text-muted-foreground">Booking not found.</p>
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

export default BookingDetailPage;


