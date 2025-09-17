import React, { useEffect, useMemo, useState } from 'react';
import { Bell, CheckCircle, AlertTriangle, Info, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';

type Notif = {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'alert' | 'info' | 'booking';
  is_read: boolean;
  created_at: string;
};

const ADVANCE_SIM = ((import.meta as any)?.env?.VITE_SIMULATE_BOOKING === 'true');

const AdvancedNotificationCenter: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notif[]>([]);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const now = Date.now();
    const seed: Notif[] = [
      { id: 'demo-1', title: 'Service Update', message: 'New shuttle route added: TF Hostel → Business School', type: 'info', is_read: false, created_at: new Date(now - 7*60*60*1000).toISOString() },
      { id: 'demo-2', title: 'Maintenance Notice', message: 'Shuttle SH003 will be offline for maintenance from 2:00 PM - 4:00 PM today', type: 'alert', is_read: false, created_at: new Date(now - 7*60*60*1000).toISOString() },
      { id: 'demo-3', title: 'Welcome!', message: 'Welcome to ShuttleGO - Your smart campus transportation companion', type: 'success', is_read: true, created_at: new Date(now - 7*60*60*1000).toISOString() },
    ];
    const savedStr = localStorage.getItem('simulated_notifications') || '[]';
    let saved: Notif[] = [];
    try { saved = JSON.parse(savedStr); } catch { saved = []; }
    const merged = [...seed, ...saved].slice(0, 50);
    setItems(merged);
    setUnread(merged.filter(n => !n.is_read).length);

    const interval = setInterval(() => {
      if (!ADVANCE_SIM) return;
      const templates: Omit<Notif, 'id' | 'is_read' | 'created_at'>[] = [
        { type: 'booking', title: 'Booking confirmed', message: 'Your shuttle has been booked successfully.' },
        { type: 'alert', title: 'Route delay', message: 'Minor delay on Legon Main Loop.' },
        { type: 'info', title: 'Service update', message: 'New evening schedule added.' },
        { type: 'success', title: 'Seat guaranteed', message: 'You have priority boarding for your next ride.' },
      ];
      const t = templates[Math.floor(Math.random() * templates.length)];
      const n: Notif = { id: `sim-${Date.now()}`, ...t, is_read: false, created_at: new Date().toISOString() } as Notif;
      setItems(prev => {
        const next = [n, ...prev].slice(0, 50);
        localStorage.setItem('simulated_notifications', JSON.stringify(next));
        return next;
      });
      setUnread(prev => prev + 1);
      window.dispatchEvent(new Event('simulated_notifications_updated'));
    }, 25000);

    const onSimNotif = () => {
      try {
        const latest: Notif[] = JSON.parse(localStorage.getItem('simulated_notifications') || '[]');
        setItems(prev => {
          const map = new Map<string, Notif>();
          [...latest, ...prev].forEach(it => map.set(it.id, it));
          const merged = Array.from(map.values()).sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at)).slice(0, 50);
          setUnread(merged.filter(n => !n.is_read).length);
          return merged;
        });
      } catch {}
    };
    window.addEventListener('simulated_notifications_updated', onSimNotif);
    return () => { clearInterval(interval); window.removeEventListener('simulated_notifications_updated', onSimNotif); };
  }, []);

  const iconFor = (type: Notif['type']) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-4 h-4 text-ug-success" />;
      case 'alert': return <AlertTriangle className="w-4 h-4 text-ug-warning" />;
      case 'info': return <Info className="w-4 h-4 text-primary" />;
      case 'booking': return <Bus className="w-4 h-4 text-primary" /> as any;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const formatTimeAgo = (d: string) => {
    const diff = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    const h = Math.floor(diff / 60);
    if (h < 24) return `${h}h ago`;
    const days = Math.floor(h / 24);
    return `${days}d ago`;
  };

  const markAllRead = () => {
    setItems(prev => {
      const next = prev.map(n => ({ ...n, is_read: true }));
      localStorage.setItem('simulated_notifications', JSON.stringify(next));
      return next;
    });
    setUnread(0);
  };

  const clearAll = () => {
    setItems([]);
    setUnread(0);
    localStorage.setItem('simulated_notifications', '[]');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className={`relative ${unread > 0 ? 'animate-bounce' : ''}`}>
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 flex items-center justify-center rounded-full bg-destructive text-xs">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[420px] p-0" align="end">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Notifications</CardTitle>
              <div className="flex items-center gap-2">
                {unread > 0 && (
                  <Button size="sm" variant="ghost" onClick={markAllRead}>Mark all read</Button>
                )}
                {items.length > 0 && (
                  <Button size="sm" variant="ghost" onClick={clearAll}>Clear</Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[420px]">
              {items.length ? (
                <div className="divide-y">
                  {items.map((n) => (
                    <div key={n.id} className={`p-3 ${!n.is_read ? 'bg-muted/20' : ''}`}>
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          {n.type === 'success' ? <CheckCircle className="w-4 h-4 text-ug-success" /> :
                           n.type === 'alert' ? <AlertTriangle className="w-4 h-4 text-ug-warning" /> :
                           n.type === 'info' ? <Info className="w-4 h-4 text-primary" /> :
                           <Bell className="w-4 h-4 text-primary" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className={`text-sm font-medium truncate ${!n.is_read ? 'text-foreground' : 'text-muted-foreground'}`}>{n.title}</p>
                            <span className="text-xs text-muted-foreground ml-2">{formatTimeAgo(n.created_at)}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{n.message}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-sm text-muted-foreground">No notifications</div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
};

export default AdvancedNotificationCenter;


