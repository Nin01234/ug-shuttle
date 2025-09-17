import React, { useEffect, useState } from 'react';
import { Bell, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const LIST_LIMIT = 30;
const DEMO = ((import.meta as any)?.env?.VITE_NOTIFICATIONS_DEMO === 'true') || ((import.meta as any)?.env?.VITE_SIMULATE_BOOKING === 'true');

const NotificationBell: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [bounce, setBounce] = useState(false);

  useEffect(() => {
    if (DEMO) {
      const now = Date.now();
      const seed: any[] = [
        { id: 'demo-1', type: 'info', title: 'Service Update', message: 'New shuttle route added: TF Hostel → Business School', is_read: false, created_at: new Date(now - 7*60*60*1000).toISOString() },
        { id: 'demo-2', type: 'alert', title: 'Maintenance Notice', message: 'Shuttle SH003 will be offline for maintenance from 2:00 PM - 4:00 PM today', is_read: false, created_at: new Date(now - 7*60*60*1000).toISOString() },
        { id: 'demo-3', type: 'success', title: 'Welcome!', message: 'Welcome to ShuttleGO - Your smart campus transportation companion', is_read: true, created_at: new Date(now - 7*60*60*1000).toISOString() },
      ];
      setNotifications(seed);
      setUnreadCount(seed.filter(n => !n.is_read).length);

      const interval = setInterval(() => {
        const templates = [
          { type: 'booking', title: 'Booking confirmed', message: 'Your shuttle has been booked successfully.' },
          { type: 'alert', title: 'Route delay', message: 'Minor delay on Legon Main Loop.' },
          { type: 'info', title: 'Service update', message: 'New evening schedule added.' },
          { type: 'success', title: 'Seat guaranteed', message: 'You have priority boarding for your next ride.' },
        ];
        const t = templates[Math.floor(Math.random() * templates.length)];
        const n = { id: `demo-${Date.now()}`, ...t, is_read: false, created_at: new Date().toISOString() } as any;
        setNotifications(prev => [n, ...prev].slice(0, LIST_LIMIT));
        setUnreadCount(prev => prev + 1);
      }, 20000);
      return () => clearInterval(interval);
    }

    if (user) {
      fetchNotifications();
      fetchUnreadCount();
      setupRealtimeSubscription();
      const id = setInterval(() => { fetchNotifications(); fetchUnreadCount(); }, 60000);
      return () => clearInterval(id);
    }
  }, [user]);

  const fetchNotifications = async () => {
    if (!user || DEMO) return;

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .or(`user_id.eq.${user.id},user_id.is.null`)
        .order('created_at', { ascending: false })
        .limit(LIST_LIMIT);

      if (error) throw error;

      setNotifications(data || []);
      setUnreadCount(data?.filter(n => !n.is_read).length || 0);
    } catch (error: any) {
      console.error('Error fetching notifications:', error.message);
    }
  };

  const fetchUnreadCount = async () => {
    if (!user || DEMO) return;
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .or(`user_id.eq.${user.id},user_id.is.null`)
        .eq('is_read', false);
      if (error) throw error;
      setUnreadCount(count || 0);
    } catch (error: any) {
      console.error('Error counting unread notifications:', error.message);
    }
  };

  const setupRealtimeSubscription = () => {
    if (!user || DEMO) return;

    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const newNotification = payload.new;
          setNotifications(prev => [newNotification, ...prev.slice(0, LIST_LIMIT - 1)]);
          setUnreadCount(prev => prev + 1);
          setBounce(true);
          setTimeout(() => setBounce(false), 1500);
          
          // Show toast for new notification
          toast({
            title: newNotification.title,
            description: newNotification.message,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error: any) {
      console.error('Error marking notification as read:', error.message);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;

      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error: any) {
      console.error('Error marking all notifications as read:', error.message);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking': return '🚌';
      case 'alert': return '⚠️';
      case 'info': return 'ℹ️';
      case 'success': return '✅';
      default: return '📢';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  if (!user) return null;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className={`relative ${bounce ? 'animate-bounce' : ''}`}>
          <div className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 inline-flex h-2 w-2 rounded-full bg-primary animate-ping" />
            )}
          </div>
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-destructive"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80 p-0" align="end">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Notifications</CardTitle>
              {unreadCount > 0 && (
                <Button 
                  onClick={markAllAsRead}
                  variant="ghost" 
                  size="sm" 
                  className="text-xs"
                >
                  Mark all read
                </Button>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            <ScrollArea className="h-96">
              {notifications.length > 0 ? (
                <div className="space-y-1">
                  {notifications.map((notification, index) => (
                    <div
                      key={notification.id}
                      className={`p-3 hover:bg-muted/50 cursor-pointer transition-colors ${
                        !notification.is_read ? 'bg-muted/20' : ''
                      }`}
                      onClick={() => {
                        if (!notification.is_read) {
                          markAsRead(notification.id);
                        }
                      }}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="text-lg mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className={`text-sm font-medium truncate ${
                              !notification.is_read ? 'text-foreground' : 'text-muted-foreground'
                            }`}>
                              {notification.title}
                            </p>
                            {!notification.is_read && (
                              <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 ml-2" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatTimeAgo(notification.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <Bell className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-sm text-muted-foreground">No notifications yet</p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;