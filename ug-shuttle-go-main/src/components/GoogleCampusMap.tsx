import React, { useEffect, useRef } from 'react';

declare global {
  interface Window { google: any }
}

interface GoogleCampusMapProps {
  height?: string;
  shuttles?: Array<{
    id: string;
    shuttle_code?: string;
    current_location?: { lat: number; lng: number };
    status?: string;
  }>;
  userLocation?: { lat: number; lng: number } | null;
  onShuttleClick?: (id: string) => void;
}

const GoogleCampusMap: React.FC<GoogleCampusMapProps> = ({ height = '384px', shuttles = [], userLocation = null, onShuttleClick }) => {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const userMarkerRef = useRef<any>(null);

  useEffect(() => {
    const apiKey = (import.meta as any)?.env?.VITE_GOOGLE_MAPS_API_KEY || (window as any)?.GOOGLE_MAPS_API_KEY;
    if (!apiKey) return;

    const existing = document.getElementById('google-maps-sdk');
    const init = () => {
      if (!ref.current || !window.google) return;
      const UG_CENTER = { lat: 5.6037, lng: -0.1870 };
      const map = new window.google.maps.Map(ref.current, {
        center: UG_CENTER,
        zoom: 16,
        tilt: 45,
        mapId: 'DEMO_MAP_ID',
      });
      mapRef.current = map;
      new window.google.maps.Marker({ position: UG_CENTER, map, title: 'University of Ghana (Center)' });
    };

    if (!existing) {
      const script = document.createElement('script');
      script.id = 'google-maps-sdk';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=marker`;
      script.async = true;
      script.defer = true;
      script.onload = init;
      document.body.appendChild(script);
    } else {
      if (window.google) init();
      else existing.addEventListener('load', init as any);
    }
  }, []);

  // Update shuttle markers when shuttles change
  useEffect(() => {
    if (!window.google || !mapRef.current) return;
    // Clear old markers
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    const bounds = new window.google.maps.LatLngBounds();
    let hasAny = false;

    (shuttles || []).forEach((s) => {
      if (!s.current_location) return;
      const marker = new window.google.maps.Marker({
        position: s.current_location,
        map: mapRef.current,
        title: s.shuttle_code || s.id,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 6,
          fillColor: s.status === 'active' ? '#16a34a' : '#f59e0b',
          fillOpacity: 1,
          strokeWeight: 1,
          strokeColor: '#ffffff'
        }
      });
      marker.addListener('click', () => onShuttleClick && onShuttleClick(s.id));
      markersRef.current.push(marker);
      bounds.extend(marker.getPosition());
      hasAny = true;
    });

    // User marker
    if (userLocation) {
      if (userMarkerRef.current) userMarkerRef.current.setMap(null);
      userMarkerRef.current = new window.google.maps.Marker({
        position: userLocation,
        map: mapRef.current,
        title: 'You are here',
        icon: {
          path: window.google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
          scale: 5,
          fillColor: '#3b82f6',
          fillOpacity: 1,
          strokeWeight: 1,
          strokeColor: '#ffffff'
        }
      });
      bounds.extend(userMarkerRef.current.getPosition());
      hasAny = true;
    }

    if (hasAny) {
      try { mapRef.current.fitBounds(bounds); } catch {}
    }
  }, [shuttles, userLocation, onShuttleClick]);

  return (
    <div className="rounded-lg overflow-hidden shadow-medium" style={{ height }}>
      <div ref={ref} className="w-full h-full" />
    </div>
  );
};

export default GoogleCampusMap;


