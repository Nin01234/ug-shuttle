import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Bell, Info, AlertTriangle, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
  data?: any;
}

const NotificationsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0); // forces re-render to update relative time and icon animations

  useEffect(() => {
    if (user) {
      fetchNotifications();
      subscribeToNotifications();
    }
  }, [user]);

  // Periodically update relative time and icon animation state
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30000);
    return () => clearInterval(id);
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .or(`user_id.eq.${user?.id},user_id.is.null`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch notifications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const subscribeToNotifications = () => {
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user?.id}`
        },
        (payload) => {
          setNotifications(prev => [payload.new as Notification, ...prev]);
          const newNotification = payload.new as Notification;
          toast({
            title: newNotification.title,
            description: newNotification.message,
            variant: newNotification.type === 'error' ? 'destructive' : 'default',
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: 'user_id=is.null'
        },
        (payload) => {
          setNotifications(prev => [payload.new as Notification, ...prev]);
          const newNotification = payload.new as Notification;
          toast({
            title: newNotification.title,
            description: newNotification.message,
            variant: newNotification.type === 'error' ? 'destructive' : 'default',
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
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, is_read: true }
            : notification
        )
      );
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive",
      });
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.is_read);
      
      if (unreadNotifications.length === 0) return;

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .or(`user_id.eq.${user?.id},user_id.is.null`)
        .eq('is_read', false);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(notification => ({ ...notification, is_read: true }))
      );

      toast({
        title: "Success",
        description: "All notifications marked as read",
        variant: "default",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read",
        variant: "destructive",
      });
    }
  };

  const getNotificationIcon = (n: Notification) => {
    const ageMs = Date.now() - new Date(n.created_at).getTime();
    const isNew = ageMs < 60_000; // < 1 minute
    const isRecent = ageMs < 60 * 60_000; // < 1 hour
    const base = 'w-5 h-5';
    const anim = !n.is_read && (isNew ? ' animate-ping-once' : isRecent ? ' animate-breathe' : '');
    switch (n.type) {
      case 'success':
        return <CheckCircle className={`${base} text-ug-success${anim}`} />;
      case 'warning':
        return <AlertTriangle className={`${base} text-ug-warning${anim}`} />;
      case 'error':
        return <XCircle className={`${base} text-destructive${anim}`} />;
      default:
        return <Info className={`${base} text-primary${anim}`} />;
    }
  };

  const getNotificationBadgeColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-ug-success/20 text-ug-success';
      case 'warning':
        return 'bg-ug-warning/20 text-ug-warning';
      case 'error':
        return 'bg-destructive/20 text-destructive';
      default:
        return 'bg-primary/20 text-primary';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);
    const diffInDays = diffInHours / 24;

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffInHours < 24) {
      const hours = Math.floor(diffInHours);
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else if (diffInDays < 7) {
      const days = Math.floor(diffInDays);
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading notifications...</p>
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
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4 flex items-center justify-center gap-3">
              <Bell className="w-8 h-8 text-primary" />
              Notifications
              {unreadCount > 0 && (
                <Badge className="bg-destructive text-destructive-foreground">
                  {unreadCount}
                </Badge>
              )}
            </h1>
            <p className="text-lg text-muted-foreground">
              Stay updated with shuttle services and announcements
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            {unreadCount > 0 && (
              <div className="mb-6 text-center">
                <Button onClick={markAllAsRead} variant="outline">
                  Mark All as Read ({unreadCount})
                </Button>
              </div>
            )}

            {notifications.length === 0 ? (
              <div className="text-center py-20">
                <Bell className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No notifications</h3>
                <p className="text-muted-foreground">You're all caught up! Check back later for updates.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <Card 
                    key={notification.id} 
                    className={`shadow-soft hover:shadow-medium transition-all cursor-pointer ${
                      !notification.is_read ? 'border-primary/50 bg-primary/5' : ''
                    }`}
                    onClick={() => !notification.is_read && markAsRead(notification.id)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="relative">
                                  {getNotificationIcon(notification)}
                                  {!notification.is_read && (
                                    <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary animate-pulse" />
                                  )}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <div className="text-xs">
                                  <div className="font-medium capitalize">{notification.type}</div>
                                  <div className="text-muted-foreground">{formatTime(notification.created_at)}</div>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <div className="flex-1">
                            <CardTitle className="text-base flex items-center gap-2">
                              {notification.title}
                              {!notification.is_read && (
                                <div className="w-2 h-2 bg-primary rounded-full"></div>
                              )}
                            </CardTitle>
                            <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                              <span>{formatTime(notification.created_at)}</span>
                              <span>•</span>
                              <span className="capitalize">{notification.type}</span>
                              {notification.is_read ? (
                                <span className="ml-2 px-2 py-0.5 rounded bg-muted text-muted-foreground">Read</span>
                              ) : (
                                <span className="ml-2 px-2 py-0.5 rounded bg-primary/10 text-primary">New</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <Badge className={getNotificationBadgeColor(notification.type)}>
                          {notification.type}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <p className="text-muted-foreground whitespace-pre-line">{notification.message}</p>
                      
                      {notification.data && (
                        <div className="mt-3 p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground space-y-1">
                          {Object.entries(notification.data).map(([key, value]) => (
                            <div key={key} className="flex justify-between gap-4">
                              <span className="font-medium text-foreground">{key}</span>
                              <span className="truncate max-w-[60%]" title={String(value)}>{String(value)}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="mt-3 flex gap-2 justify-end">
                        {!notification.is_read && (
                          <Button size="sm" variant="outline" onClick={() => markAsRead(notification.id)}>Mark as read</Button>
                        )}
                        <Button size="sm" variant="outline" onClick={fetchNotifications}>
                          Refresh
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default NotificationsPage;