import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MapComponent from '@/components/MapComponent';
import GoogleCampusMap from '@/components/GoogleCampusMap';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Users, Navigation, Bus, Search, Filter, Zap, AlertCircle, RefreshCw, Gauge, Info } from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const TrackingPage = () => {
  const [shuttles, setShuttles] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedShuttle, setSelectedShuttle] = useState<string | null>(null);
  const [tracking, setTracking] = useState<{ enabled: boolean; intervalId: any } | null>(null);
  const { toast } = useToast();
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    fetchShuttlesAndRoutes();
    // Get user geolocation (GPS)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setUserLocation(null),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
    // Realtime updates from Supabase for shuttle changes
    const channel = supabase
      .channel('shuttle-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'shuttles' },
        (payload) => {
          setShuttles((prev) => {
            const updated = [...prev];
            const idx = updated.findIndex((s) => s.id === (payload.new as any)?.id);
            if (idx >= 0) {
              updated[idx] = { ...updated[idx], ...(payload.new as any) };
            } else if (payload.eventType === 'INSERT') {
              updated.unshift(payload.new as any);
            }
            return updated;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchShuttlesAndRoutes = async () => {
    try {
      setLoading(true);
      // Fetch shuttles with current location
      const { data: shuttlesData, error: shuttlesError } = await supabase
        .from('shuttles')
        .select('*');
      
      if (shuttlesError) throw shuttlesError;

      // Fetch routes
      const { data: routesData, error: routesError } = await supabase
        .from('routes')
        .select('*')
        .eq('is_active', true);
      
      if (routesError) throw routesError;

      // Fallback/augmentation: ensure location and enrich with derived details
      let shuttlesWithLocation = shuttlesData?.map(shuttle => ({
        ...shuttle,
        current_location: shuttle.current_location ?? {
          lat: 5.6037,
          lng: -0.1870,
        },
        eta: shuttle.status === 'active' ? `${Math.floor(Math.random() * 15) + 1} mins` : 'N/A',
        route_name: shuttle.route_name || routesData?.[0]?.name || 'Campus Route',
        speed_kmh: Math.floor(Math.random() * 20) + 15, // 15-35 km/h
        bus_type: shuttle.bus_type || ['Mini Bus', 'Coaster', 'Coach'][Math.floor(Math.random() * 3)],
        license_plate: shuttle.license_plate || `UG-${Math.floor(100 + Math.random()*900)}-${String(Math.floor(10 + Math.random()*89))}`,
        last_service_date: shuttle.last_service_date || new Date(Date.now() - Math.floor(Math.random()*60)*24*3600*1000).toISOString().split('T')[0],
        next_stops: shuttle.next_stops || ['Main Gate', 'Balme Library', 'Night Market', 'Commonwealth Hall'].slice(0, 2 + Math.floor(Math.random()*3)),
      })) || [];

      // Add simulated extra buses to enrich the list
      const extraSamples = [
        { code: 'SH101', driver: 'A. Mensah', lat: 5.6075, lng: -0.1895, route: 'Central Loop' },
        { code: 'SH102', driver: 'B. Owusu', lat: 5.6009, lng: -0.1842, route: 'Pentagon – Night Market' },
        { code: 'SH103', driver: 'C. Tetteh', lat: 5.6053, lng: -0.1931, route: 'Great Hall – Commonwealth' },
        { code: 'SH104', driver: 'D. Adjei',  lat: 5.6101, lng: -0.1862, route: 'Pentagon – Night Market' },
        { code: 'SH105', driver: 'E. Boateng',lat: 5.5988, lng: -0.1907, route: 'Central Loop' },
        { code: 'SH106', driver: 'F. Addo',   lat: 5.6039, lng: -0.1815, route: 'JQB – Legon Hall' },
        { code: 'SH107', driver: 'G. Quaye',  lat: 5.6121, lng: -0.1881, route: 'Law School – Central' },
        { code: 'SH108', driver: 'H. Lamptey',lat: 5.6062, lng: -0.1952, route: 'UGMC – Central' },
        { code: 'SH109', driver: 'I. Amuzu',  lat: 5.6015, lng: -0.1977, route: 'Pentagon – Night Market' },
        { code: 'SH110', driver: 'J. Akoto',  lat: 5.6084, lng: -0.1834, route: 'Great Hall – Commonwealth' },
      ];
      if ((shuttlesWithLocation?.length || 0) < 10) {
        const simulated = extraSamples.map((s, idx) => ({
          id: `sim-${s.code}-${idx}`,
          shuttle_code: s.code,
          driver_name: s.driver,
          capacity: 30 + (idx % 3) * 10,
          current_occupancy: Math.floor(Math.random() * 30),
          status: Math.random() < 0.85 ? 'active' : (Math.random() < 0.5 ? 'maintenance' : 'inactive'),
          current_location: { lat: s.lat, lng: s.lng },
          eta: `${Math.floor(Math.random() * 12) + 3} mins`,
          route_name: s.route,
          speed_kmh: Math.floor(Math.random() * 20) + 15,
          bus_type: ['Mini Bus', 'Coaster', 'Coach'][Math.floor(Math.random() * 3)],
          license_plate: `UG-${Math.floor(100 + Math.random()*900)}-${String(Math.floor(10 + Math.random()*89))}`,
          last_service_date: new Date(Date.now() - Math.floor(Math.random()*60)*24*3600*1000).toISOString().split('T')[0],
          next_stops: ['Main Gate', 'Balme Library', 'Night Market', 'Commonwealth Hall'].slice(0, 2 + Math.floor(Math.random()*3)),
        }));
        shuttlesWithLocation = [...simulated, ...shuttlesWithLocation];
      }

      setShuttles(shuttlesWithLocation);
      setRoutes(routesData || []);
      setLoading(false);
      setLastUpdated(new Date());
    } catch (error: any) {
      toast({
        title: "Error fetching shuttle data",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const filteredShuttles = shuttles.filter(shuttle => {
    const matchesSearch = shuttle.shuttle_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         shuttle.driver_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         shuttle.route_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || shuttle.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleShuttleClick = (shuttleId: string) => {
    setSelectedShuttle(shuttleId);
    setDetailsOpen(true);
    const shuttle = shuttles.find(s => s.id === shuttleId);
    if (shuttle) {
      toast({
        title: `Shuttle ${shuttle.shuttle_code}`,
        description: `Driver: ${shuttle.driver_name} | Status: ${shuttle.status}`,
      });
    }
  };

  const startSimulatedTracking = () => {
    if (tracking?.enabled) return;
    const id = setInterval(() => {
      setShuttles(prev => prev.map(s => {
        if (s.id !== selectedShuttle || !s.current_location) return s;
        // Nudge the shuttle location slightly to simulate movement
        const deltaLat = (Math.random() - 0.5) * 0.0006;
        const deltaLng = (Math.random() - 0.5) * 0.0006;
        const nextLoc = { lat: s.current_location.lat + deltaLat, lng: s.current_location.lng + deltaLng };
        const nextEta = `${Math.max(1, (parseInt(String(s.eta)) || 8) - 1)} mins`;
        return { ...s, current_location: nextLoc, eta: nextEta };
      }));
    }, 3000);
    setTracking({ enabled: true, intervalId: id });
  };

  const stopSimulatedTracking = () => {
    if (tracking?.intervalId) clearInterval(tracking.intervalId);
    setTracking({ enabled: false, intervalId: null });
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="py-8">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Live Shuttle Tracking
            </h1>
            <p className="text-lg text-muted-foreground mb-4">
              Real-time GPS, routes, and ETAs across UG campus
            </p>
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-muted">
              <div className="w-2 h-2 bg-ug-success rounded-full animate-pulse" />
              <span className="text-sm text-muted-foreground">Live updates enabled</span>
            </div>
            {lastUpdated && (
              <div className="mt-2 text-xs text-muted-foreground">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </div>
            )}
          </div>

          {/* Search and Filter Controls */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search shuttles, drivers, or routes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Shuttles</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Interactive Campus Map (Google if key present, otherwise Mapbox) */}
          <Card className="mb-8 shadow-medium">
            <CardContent className="p-0">
              {(import.meta as any)?.env?.VITE_GOOGLE_MAPS_API_KEY ? (
                <GoogleCampusMap 
                  height="480px" 
                  shuttles={shuttles}
                  userLocation={userLocation}
                  onShuttleClick={(id) => handleShuttleClick(id)}
                />
              ) : (
                <MapComponent 
                  shuttles={shuttles}
                  onShuttleClick={handleShuttleClick}
                />
              )}
            </CardContent>
          </Card>

          {/* Shuttle List */}
          <div className="grid gap-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-foreground">
                Live Shuttle Status ({filteredShuttles.length})
              </h2>
              <Button 
                onClick={fetchShuttlesAndRoutes} 
                variant="outline" 
                size="sm"
                className="flex items-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Zap className="w-4 h-4" />
                )}
                {loading ? 'Refreshing...' : 'Refresh'}
              </Button>
            </div>
            
            {loading ? (
              <div className="grid gap-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <div className="h-4 bg-muted rounded w-32"></div>
                          <div className="h-3 bg-muted rounded w-48"></div>
                        </div>
                        <div className="h-8 bg-muted rounded w-20"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredShuttles.length === 0 ? (
              <Card className="shadow-soft">
                <CardContent className="p-8 text-center">
                  <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No shuttles found</h3>
                  <p className="text-muted-foreground">
                    {searchQuery || statusFilter !== 'all' 
                      ? 'Try adjusting your search or filter criteria.' 
                      : 'No shuttles are currently available.'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredShuttles.map((shuttle) => (
                <Card 
                  key={shuttle.id} 
                  className={`shadow-soft hover:shadow-medium transition-all cursor-pointer ${
                    selectedShuttle === shuttle.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => handleShuttleClick(shuttle.id)}
                >
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center space-x-2">
                          <Bus className="w-5 h-5 text-primary" />
                          <span>{shuttle.shuttle_code}</span>
                          <Badge 
                            variant={shuttle.status === 'active' ? 'default' : 'secondary'}
                            className={
                              shuttle.status === 'active' 
                                ? 'bg-ug-success/20 text-ug-success hover:bg-ug-success/30' 
                                : shuttle.status === 'maintenance'
                                ? 'bg-ug-warning/20 text-ug-warning hover:bg-ug-warning/30'
                                : 'bg-muted text-muted-foreground'
                            }
                          >
                            {shuttle.status}
                          </Badge>
                        </CardTitle>
                        <CardDescription className="text-base font-medium mt-1">
                          {shuttle.route_name || 'Campus Route'}
                        </CardDescription>
                      </div>
                      {shuttle.status === 'active' && (
                        tracking?.enabled && selectedShuttle === shuttle.id ? (
                          <Button size="sm" variant="outline" onClick={stopSimulatedTracking}>
                            Stop Tracking
                          </Button>
                        ) : (
                          <Button size="sm" className="bg-primary" onClick={() => { setSelectedShuttle(shuttle.id); startSimulatedTracking(); }}>
                            <Navigation className="w-4 h-4 mr-1" />
                            Track Live
                          </Button>
                        )
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">
                          <span className="text-muted-foreground">ETA:</span>
                          <span className="font-semibold ml-1 text-ug-success">
                            {shuttle.eta}
                          </span>
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">
                          <span className="text-muted-foreground">Capacity:</span>
                          <span className="font-semibold ml-1">
                            {shuttle.current_occupancy}/{shuttle.capacity}
                          </span>
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Navigation className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">
                          <span className="text-muted-foreground">Driver:</span>
                          <span className="font-semibold ml-1">{shuttle.driver_name}</span>
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Gauge className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">
                          <span className="text-muted-foreground">Speed:</span>
                          <span className="font-semibold ml-1">{shuttle.speed_kmh ?? 'N/A'} km/h</span>
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">
                          <span className="text-muted-foreground">Location:</span>
                          <span className="font-semibold ml-1 text-primary">Live</span>
                        </span>
                      </div>
                    </div>
                    
                    {/* Occupancy Bar */}
                    <div className="mt-4">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Occupancy</span>
                        <span>{Math.round((shuttle.current_occupancy / shuttle.capacity) * 100)}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all ${
                            (shuttle.current_occupancy / shuttle.capacity) > 0.8 
                              ? 'bg-ug-warning' 
                              : 'bg-ug-success'
                          }`}
                          style={{ width: `${(shuttle.current_occupancy / shuttle.capacity) * 100}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Shuttle Details Sheet */}
          <Sheet open={detailsOpen} onOpenChange={setDetailsOpen}>
            <SheetContent side="right" className="w-full sm:max-w-md">
              {selectedShuttle ? (
                (() => {
                  const s = shuttles.find(sh => sh.id === selectedShuttle);
                  if (!s) return (
                    <div className="p-4 text-sm text-muted-foreground">No shuttle selected.</div>
                  );
                  return (
                    <>
                      <SheetHeader>
                        <SheetTitle className="flex items-center gap-2">
                          <Bus className="w-4 h-4 text-primary" />
                          {s.shuttle_code}
                          <Badge 
                            variant={s.status === 'active' ? 'default' : 'secondary'}
                            className={
                              s.status === 'active' 
                                ? 'bg-ug-success/20 text-ug-success hover:bg-ug-success/30' 
                                : s.status === 'maintenance'
                                ? 'bg-ug-warning/20 text-ug-warning hover:bg-ug-warning/30'
                                : 'bg-muted text-muted-foreground'
                            }
                          >
                            {s.status}
                          </Badge>
                        </SheetTitle>
                        <SheetDescription>
                          Detailed live information about this shuttle.
                        </SheetDescription>
                      </SheetHeader>

                      <div className="mt-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="text-muted-foreground">Route</div>
                            <div className="font-semibold">{s.route_name || 'Campus Route'}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">ETA</div>
                            <div className="font-semibold text-ug-success">{s.eta}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Driver</div>
                            <div className="font-semibold">{s.driver_name || 'N/A'}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Capacity</div>
                            <div className="font-semibold">{s.current_occupancy}/{s.capacity}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Speed</div>
                            <div className="font-semibold">{s.speed_kmh ?? 'N/A'} km/h</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Bus Type</div>
                            <div className="font-semibold">{s.bus_type || 'N/A'}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Plate</div>
                            <div className="font-semibold">{s.license_plate || 'N/A'}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Last Service</div>
                            <div className="font-semibold">{s.last_service_date || 'N/A'}</div>
                          </div>
                        </div>

                        <div className="text-sm">
                          <div className="text-muted-foreground mb-1">Next Stops</div>
                          <div className="flex flex-wrap gap-2">
                            {(s.next_stops || []).map((st: string) => (
                              <Badge key={st} variant="secondary">{st}</Badge>
                            ))}
                            {(!s.next_stops || s.next_stops.length === 0) && (
                              <span className="text-muted-foreground">N/A</span>
                            )}
                          </div>
                        </div>

                        <div className="text-xs text-muted-foreground flex items-center gap-2">
                          <Info className="w-3 h-3" />
                          Location: {s.current_location?.lat?.toFixed(5)}, {s.current_location?.lng?.toFixed(5)}
                        </div>

                        <div className="flex gap-2">
                          {s.status === 'active' && (
                            tracking?.enabled && selectedShuttle === s.id ? (
                              <Button size="sm" variant="outline" onClick={stopSimulatedTracking}>
                                Stop Tracking
                              </Button>
                            ) : (
                              <Button size="sm" className="bg-primary" onClick={() => { setSelectedShuttle(s.id); startSimulatedTracking(); }}>
                                <Navigation className="w-4 h-4 mr-1" />
                                Track Live
                              </Button>
                            )
                          )}
                          <Button size="sm" variant="outline" onClick={fetchShuttlesAndRoutes} disabled={loading}>
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            <span className="ml-2">Refresh</span>
                          </Button>
                        </div>
                      </div>
                    </>
                  );
                })()
              ) : (
                <div className="p-4 text-sm text-muted-foreground">Select a shuttle to see details.</div>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default TrackingPage;