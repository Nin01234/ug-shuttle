import React, { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const NotificationListener: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('global-notifications-listener')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
        (payload) => {
          const n: any = payload.new;
          toast({
            title: n.title,
            description: n.message,
            variant: n.type === 'error' ? 'destructive' : 'default',
          });
          if ('Notification' in window && Notification.permission === 'granted') {
            try { new Notification(n.title || 'Notification', { body: n.message }); } catch {}
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: 'user_id=is.null' },
        (payload) => {
          const n: any = payload.new;
          toast({ title: n.title, description: n.message });
          if ('Notification' in window && Notification.permission === 'granted') {
            try { new Notification(n.title || 'Notification', { body: n.message }); } catch {}
          }
        }
      )
      .subscribe();

    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, toast]);

  return null;
};

export default NotificationListener;


