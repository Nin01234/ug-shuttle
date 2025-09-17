import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [mapboxToken, setMapboxToken] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('ugshuttle.mapboxToken');
    if (stored) setMapboxToken(stored);
  }, []);

  const save = async () => {
    setSaving(true);
    localStorage.setItem('ugshuttle.mapboxToken', mapboxToken);
    if (user) {
      await supabase
        .from('profiles')
        .update({ notification_preferences: { notificationsEnabled } })
        .eq('user_id', user.id);
    }
    setSaving(false);
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 py-10">
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Map Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mapbox">Mapbox Access Token</Label>
                <Input id="mapbox" type="password" value={mapboxToken} onChange={(e) => setMapboxToken(e.target.value)} placeholder="pk.XXXXXXXXXXXXXXXX" />
                <p className="text-xs text-muted-foreground">Used to render the UG campus map and live tracking.</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Enable notifications</span>
                <Button variant={notificationsEnabled ? 'default' : 'outline'} onClick={() => setNotificationsEnabled((v) => !v)}>
                  {notificationsEnabled ? 'On' : 'Off'}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Receive alerts for arrivals, delays, and route changes.</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6">
          <Button onClick={save} disabled={saving}>
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SettingsPage;


