import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Bell, 
  User, 
  Bus, 
  TrendingUp, 
  Star,
  CheckCircle,
  AlertTriangle,
  Activity,
  CreditCard
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const StudentDashboard = () => {
  const SIMULATE = ((import.meta as any)?.env?.VITE_SIMULATE_BOOKING === 'true');
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState({
    totalBookings: 0,
    upcomingBookings: 0,
    completedRides: 0,
    savedTime: 0
  });
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activity, setActivity] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
      if (!SIMULATE) {
        const channel = supabase
          .channel('dashboard-realtime')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'bookings', filter: `user_id=eq.${user.id}` },
            () => fetchDashboardData()
          )
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
            () => fetchDashboardData()
          )
          .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=is.null` },
            () => fetchDashboardData()
          )
          .subscribe();
        return () => { supabase.removeChannel(channel); };
      } else {
        const onSimUpdate = () => {
          console.log('Simulation update triggered');
          fetchDashboardData();
        };
        const onStorage = (e: StorageEvent) => { 
          if (e.key === 'simulated_bookings' || e.key === 'simulated_notifications') {
            console.log('Storage change detected:', e.key);
            fetchDashboardData();
          }
        };
        window.addEventListener('simulated_bookings_updated', onSimUpdate as EventListener);
        window.addEventListener('simulated_notifications_updated', onSimUpdate as EventListener);
        window.addEventListener('storage', onStorage);
        return () => {
          window.removeEventListener('simulated_bookings_updated', onSimUpdate as EventListener);
          window.removeEventListener('simulated_notifications_updated', onSimUpdate as EventListener);
          window.removeEventListener('storage', onStorage);
        };
      }
    }
  }, [user, SIMULATE]);

  const fetchDashboardData = async () => {
    try {
      let bookings: any[] = [];
      let notifs: any[] = [];
      let globalNotifs: any[] = [];

      if (SIMULATE) {
        try { 
          const all = JSON.parse(localStorage.getItem('simulated_bookings') || '[]');
          bookings = (all || []).filter((b: any) => b.user_id === user?.id);
          console.log('Loaded simulated bookings:', bookings.length);
        } catch (e) { 
          console.error('Error parsing simulated bookings:', e);
          bookings = []; 
        }
        
        // Load simulated notifications from localStorage
        try {
          const storedNotifs = JSON.parse(localStorage.getItem('simulated_notifications') || '[]');
          notifs = storedNotifs.filter((n: any) => n.user_id === user?.id);
          console.log('Loaded simulated notifications:', notifs.length);
        } catch (e) {
          console.error('Error parsing simulated notifications:', e);
          notifs = [];
        }
        
        // Add some default notifications if none exist
        if (notifs.length === 0) {
          const now = Date.now();
          notifs = [
            { id: 'demo-1', title: 'Service Update', message: 'New shuttle route added: TF Hostel → Business School', type: 'info', is_read: false, created_at: new Date(now - 7*60*60*1000).toISOString() },
            { id: 'demo-2', title: 'Maintenance Notice', message: 'Shuttle SH003 will be offline for maintenance from 2:00 PM - 4:00 PM today', type: 'alert', is_read: false, created_at: new Date(now - 7*60*60*1000).toISOString() },
            { id: 'demo-3', title: 'Welcome!', message: 'Welcome to ShuttleGO - Your smart campus transportation companion', type: 'success', is_read: true, created_at: new Date(now - 7*60*60*1000).toISOString() },
          ];
        }
      } else {
        const { data: dbBookings } = await supabase
          .from('bookings')
          .select('*')
          .eq('user_id', user?.id)
          .order('created_at', { ascending: false })
          .limit(5);
        bookings = dbBookings || [];
        // Fallback to simulated bookings if none in DB (helps during local testing)
        if (!bookings.length) {
          try {
            const all = JSON.parse(localStorage.getItem('simulated_bookings') || '[]');
            bookings = (all || []).filter((b: any) => b.user_id === user?.id);
          } catch {}
        }
        const { data: dbNotifs } = await supabase
          .from('notifications')
          .select('*')
          .or(`user_id.eq.${user?.id},user_id.is.null`)
          .order('created_at', { ascending: false })
          .limit(5);
        notifs = (dbNotifs || []).filter(n => n.user_id === user?.id);
        globalNotifs = (dbNotifs || []).filter(n => n.user_id === null);
        // Fallback notifications from simulation if none
        if (!notifs.length) {
          try {
            const storedNotifs = JSON.parse(localStorage.getItem('simulated_notifications') || '[]');
            notifs = (storedNotifs || []).filter((n: any) => n.user_id === user?.id);
          } catch {}
        }
      }

      const total = bookings?.length || 0;
      const upcoming = bookings?.filter(b => b.status === 'confirmed' && new Date(b.booking_date) >= new Date()).length || 0;
      const completed = bookings?.filter(b => b.status === 'completed').length || 0;

      setStats({ totalBookings: total, upcomingBookings: upcoming, completedRides: completed, savedTime: completed * 15 });
      setRecentBookings(bookings || []);
      setNotifications([...notifs].slice(0, 5) || []);

      // Build activity feed combining bookings and notifications
      const bookingActivities = (bookings || []).map((b) => ({
        kind: 'booking',
        id: b.id,
        created_at: b.created_at,
        title: `${b.pickup_location} → ${b.destination}`,
        status: b.status,
        meta: { date: b.booking_date, time: b.booking_time }
      }));
      const notificationActivities = ([...notifs, ...globalNotifs] || []).map((n: any) => ({
        kind: 'notification',
        id: n.id,
        created_at: n.created_at,
        title: n.title,
        message: n.message,
        type: n.type,
      }));
      const combined = [...bookingActivities, ...notificationActivities]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 8);
      setActivity(combined);
      setLoading(false);
    } catch (error: any) {
      toast({ title: 'Error loading dashboard', description: error.message, variant: 'destructive' });
      setLoading(false);
    }
  };
  const ActivityIcon = ({ item }: { item: any }) => {
    if (item.kind === 'booking') {
      if (item.status === 'confirmed') return <Calendar className="w-4 h-4 text-ug-success" />;
      if (item.status === 'completed') return <CheckCircle className="w-4 h-4 text-ug-blue" />;
      if (item.status === 'cancelled') return <AlertTriangle className="w-4 h-4 text-destructive" />;
      return <Bus className="w-4 h-4 text-muted-foreground" />;
    }
    return <Bell className="w-4 h-4 text-primary" />;
  };


  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-ug-success/20 text-ug-success';
      case 'pending': return 'bg-ug-warning/20 text-ug-warning';
      case 'completed': return 'bg-ug-blue/20 text-ug-blue';
      case 'cancelled': return 'bg-destructive/20 text-destructive';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="py-8">
          <div className="container mx-auto px-4">
            <div className="animate-pulse space-y-8">
              <div className="h-8 bg-muted rounded w-64"></div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[1,2,3,4].map(i => (
                  <div key={i} className="h-32 bg-muted rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="py-8">
        <div className="container mx-auto px-4">
          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              {getGreeting()}, {profile?.full_name?.split(' ')[0] || 'Student'}! 👋
            </h1>
            <p className="text-lg text-muted-foreground">
              Welcome to your ShuttleGO dashboard. Here's what's happening today.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="shadow-soft hover:shadow-medium transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">Total Bookings</p>
                    <p className="text-3xl font-bold text-foreground">{stats.totalBookings}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-ug-blue" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-soft hover:shadow-medium transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">Upcoming Rides</p>
                    <p className="text-3xl font-bold text-foreground">{stats.upcomingBookings}</p>
                  </div>
                  <Clock className="w-8 h-8 text-ug-success" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-soft hover:shadow-medium transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">Completed Rides</p>
                    <p className="text-3xl font-bold text-foreground">{stats.completedRides}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-ug-gold" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-soft hover:shadow-medium transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">Time Saved</p>
                    <p className="text-3xl font-bold text-foreground">{stats.savedTime}m</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="bookings">Recent Bookings</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="profile">Profile</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Quick Actions */}
                <Card className="shadow-soft">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Activity className="w-5 h-5" />
                      <span>Quick Actions</span>
                    </CardTitle>
                    <CardDescription>Common tasks and shortcuts</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button asChild className="w-full justify-start">
                      <Link to="/booking">
                        <Bus className="w-4 h-4 mr-2" />
                        Book a Shuttle
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full justify-start">
                      <Link to="/tracking">
                        <MapPin className="w-4 h-4 mr-2" />
                        Track Live Shuttles
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full justify-start">
                      <Link to="/my-bookings">
                        <Calendar className="w-4 h-4 mr-2" />
                        View My Bookings
                      </Link>
                    </Button>
                  </CardContent>
                </Card>

                {/* Today's Schedule */}
                <Card className="shadow-soft">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Clock className="w-5 h-5" />
                      <span>Today's Schedule</span>
                    </CardTitle>
                    <CardDescription>Your upcoming rides for today</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {recentBookings.filter(booking => 
                      new Date(booking.booking_date).toDateString() === new Date().toDateString()
                    ).length > 0 ? (
                      <div className="space-y-3">
                        {recentBookings
                          .filter(booking => 
                            new Date(booking.booking_date).toDateString() === new Date().toDateString()
                          )
                          .map((booking, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                              <div>
                                <p className="font-medium">{booking.pickup_location} → {booking.destination}</p>
                                <p className="text-sm text-muted-foreground">{booking.booking_time}</p>
                              </div>
                              <Badge className={getStatusColor(booking.status)}>
                                {booking.status}
                              </Badge>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No rides scheduled for today</p>
                        <Button asChild className="mt-4">
                          <Link to="/booking">Book a Ride</Link>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

            {/* Recent Activity */}
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5" />
                  <span>Recent Activity</span>
                </CardTitle>
                <CardDescription>Live updates from your bookings and notifications</CardDescription>
              </CardHeader>
              <CardContent>
                {activity.length > 0 ? (
                  <div className="space-y-3">
                    {activity.map((item, idx) => (
                      <div key={idx} className="flex items-start justify-between p-3 border rounded-lg">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">
                            <ActivityIcon item={item} />
                          </div>
                          <div>
                            <p className="font-medium">
                              {item.kind === 'booking' ? item.title : item.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {item.kind === 'booking' ? (
                                <>
                                  {item.meta?.date} at {item.meta?.time} • Status: {item.status}
                                </>
                              ) : (
                                item.message
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground ml-4 whitespace-nowrap">
                          {new Date(item.created_at).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No recent activity yet</p>
                  </div>
                )}
              </CardContent>
            </Card>

              {/* Usage Analytics */}
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5" />
                    <span>Your ShuttleGO Journey</span>
                  </CardTitle>
                  <CardDescription>Track your usage and achievements</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-ug-success/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Star className="w-8 h-8 text-ug-success" />
                      </div>
                      <h3 className="font-semibold mb-1">Eco Warrior</h3>
                      <p className="text-sm text-muted-foreground">Saved 45kg CO² this month</p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-ug-gold/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <CheckCircle className="w-8 h-8 text-ug-gold" />
                      </div>
                      <h3 className="font-semibold mb-1">Reliable Rider</h3>
                      <p className="text-sm text-muted-foreground">95% on-time rate</p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-ug-blue/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Bus className="w-8 h-8 text-ug-blue" />
                      </div>
                      <h3 className="font-semibold mb-1">Campus Explorer</h3>
                      <p className="text-sm text-muted-foreground">Used 8/10 routes</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="bookings">
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle>Recent Bookings</CardTitle>
                  <CardDescription>Your latest shuttle reservations</CardDescription>
                </CardHeader>
                <CardContent>
                  {recentBookings.length > 0 ? (
                    <div className="space-y-4">
                      {recentBookings.map((booking, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-4">
                            <Bus className="w-8 h-8 text-primary" />
                            <div>
                              <p className="font-medium">{booking.pickup_location} → {booking.destination}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(booking.booking_date).toLocaleDateString()} at {booking.booking_time}
                              </p>
                            </div>
                          </div>
                          <Badge className={getStatusColor(booking.status)}>
                            {booking.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Bus className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No bookings yet</p>
                      <Button asChild className="mt-4">
                        <Link to="/booking">Make Your First Booking</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications">
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Bell className="w-5 h-5" />
                    <span>Notifications</span>
                  </CardTitle>
                  <CardDescription>Stay updated with important alerts</CardDescription>
                </CardHeader>
                <CardContent>
                  {notifications.length > 0 ? (
                    <div className="space-y-4">
                      {notifications.map((notification, index) => (
                        <div key={index} className="flex items-start space-x-3 p-4 border rounded-lg">
                          <div className={`w-2 h-2 rounded-full mt-2 ${notification.is_read ? 'bg-muted' : 'bg-primary'}`} />
                          <div className="flex-1">
                            <h4 className="font-medium mb-1">{notification.title}</h4>
                            <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(notification.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No notifications yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="profile">
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="w-5 h-5" />
                    <span>Profile Information</span>
                  </CardTitle>
                  <CardDescription>Manage your account details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                      <p className="text-lg font-medium">{profile?.full_name || 'Not set'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Email</label>
                      <p className="text-lg font-medium">{profile?.email || user?.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Student ID</label>
                      <p className="text-lg font-medium">{profile?.student_id || 'Not set'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Department</label>
                      <p className="text-lg font-medium">{profile?.department || 'Not set'}</p>
                    </div>
                  </div>
                  <Button variant="outline">Edit Profile</Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default StudentDashboard;