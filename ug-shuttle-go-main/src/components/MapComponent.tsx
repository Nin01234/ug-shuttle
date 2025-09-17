import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Navigation, Crosshair } from 'lucide-react';

interface MapComponentProps {
  shuttles?: Array<{
    id: string;
    shuttle_code: string;
    current_location?: {
      lat: number;
      lng: number;
    };
    status: string;
  }>;
  onShuttleClick?: (shuttleId: string) => void;
}

const MapComponent: React.FC<MapComponentProps> = ({ shuttles = [], onShuttleClick }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState('');
  const [isTokenSet, setIsTokenSet] = useState(false);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  // University of Ghana coordinates
  const UG_CENTER: [number, number] = [-0.1870, 5.6037];

  const handleTokenSubmit = () => {
    if (mapboxToken.trim()) {
      mapboxgl.accessToken = mapboxToken.trim();
      setIsTokenSet(true);
      initializeMap();
    }
  };

  // Auto-load Mapbox token from env if available
  useEffect(() => {
    const token = (import.meta as any)?.env?.VITE_MAPBOX_TOKEN || (window as any)?.MAPBOX_TOKEN || '';
    if (token) {
      setMapboxToken(token);
      mapboxgl.accessToken = token;
      setIsTokenSet(true);
      initializeMap();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initializeMap = () => {
    if (!mapContainer.current || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: UG_CENTER,
      zoom: 15,
      pitch: 45,
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      'top-right'
    );

    // Add UG Campus landmarks (sample set)
    map.current.on('load', () => {
      if (!map.current) return;

      // Add campus landmarks
      const landmarks = [
        { name: 'Main Gate', coordinates: [-0.1860, 5.6045] },
        { name: 'Great Hall', coordinates: [-0.1875, 5.6055] },
        { name: 'Balme Library', coordinates: [-0.1890, 5.6040] },
        { name: 'Commonwealth Hall', coordinates: [-0.1850, 5.6020] },
        { name: 'Volta Hall', coordinates: [-0.1900, 5.6030] },
        { name: 'Pentagon', coordinates: [-0.1885, 5.6025] },
        { name: 'Night Market', coordinates: [-0.1895, 5.6015] },
      ];

      landmarks.forEach(landmark => {
        const el = document.createElement('div');
        el.className = 'bg-ug-blue text-white px-2 py-1 rounded text-xs font-semibold shadow-md';
        el.innerHTML = landmark.name;

        new mapboxgl.Marker(el)
          .setLngLat(landmark.coordinates as [number, number])
          .addTo(map.current!);
      });

      // Ensure labels and 3D buildings for modern look
      if (map.current.getStyle().layers) {
        const layers = map.current.getStyle().layers;
        const labelLayerId = layers?.find(
          (l: any) => l.type === 'symbol' && l.layout && l.layout['text-field']
        )?.id;
        map.current.addLayer(
          {
            id: 'add-3d-buildings',
            source: 'composite',
            'source-layer': 'building',
            filter: ['==', 'extrude', 'true'],
            type: 'fill-extrusion',
            minzoom: 15,
            paint: {
              'fill-extrusion-color': '#aaa',
              'fill-extrusion-height': ["interpolate", ["linear"], ["zoom"], 15, 0, 15.05, ["get", "height"]],
              'fill-extrusion-base': ["interpolate", ["linear"], ["zoom"], 15, 0, 15.05, ["get", "min_height"]],
              'fill-extrusion-opacity': 0.6
            }
          },
          labelLayerId
        );
      }
    });

    updateShuttleMarkers();
  };

  const updateShuttleMarkers = () => {
    if (!map.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add shuttle markers
    shuttles.forEach(shuttle => {
      if (shuttle.current_location) {
        const el = document.createElement('div');
        el.className = `w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold cursor-pointer shadow-medium ${
          shuttle.status === 'active' ? 'bg-ug-success animate-pulse-glow' : 'bg-ug-warning'
        }`;
        el.innerHTML = '🚌';
        el.title = `Shuttle ${shuttle.shuttle_code}`;

        el.addEventListener('click', () => {
          onShuttleClick?.(shuttle.id);
        });

        const marker = new mapboxgl.Marker(el)
          .setLngLat([shuttle.current_location.lng, shuttle.current_location.lat])
          .addTo(map.current!);

        markersRef.current.push(marker);
      }
    });
  };

  useEffect(() => {
    updateShuttleMarkers();
  }, [shuttles]);

  useEffect(() => {
    return () => {
      map.current?.remove();
    };
  }, []);

  if (!isTokenSet) {
    return (
      <div className="h-96 bg-gradient-to-br from-ug-blue-lighter to-accent rounded-lg flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <MapPin className="w-16 h-16 mx-auto mb-4 text-ug-blue" />
          <h3 className="text-xl font-semibold mb-4 text-foreground">Campus Map Integration</h3>
          <p className="text-muted-foreground mb-6">
            To view the interactive campus map with real-time shuttle tracking, please enter your Mapbox access token.
          </p>
          <div className="space-y-4">
            <Input
              type="password"
              placeholder="Enter Mapbox access token"
              value={mapboxToken}
              onChange={(e) => setMapboxToken(e.target.value)}
              className="w-full"
            />
            <Button onClick={handleTokenSubmit} className="w-full bg-primary" disabled={!mapboxToken.trim()}>
              <Navigation className="w-4 h-4 mr-2" />
              Load Map
            </Button>
            <p className="text-xs text-muted-foreground">
              Get your token at{' '}
              <a href="https://mapbox.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                mapbox.com
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-96 rounded-lg overflow-hidden shadow-medium">
      <div ref={mapContainer} className="absolute inset-0" />
      
      {/* Map Controls Overlay */}
      <div className="absolute top-4 left-4 bg-card/90 backdrop-blur-sm rounded-lg p-3 shadow-soft">
        <div className="flex items-center space-x-2 text-sm">
          <Crosshair className="w-4 h-4 text-ug-blue" />
          <span className="font-medium text-foreground">University of Ghana Campus</span>
        </div>
      </div>

      {/* Active Shuttles Counter */}
      <div className="absolute top-4 right-4 bg-card/90 backdrop-blur-sm rounded-lg p-3 shadow-soft">
        <div className="flex items-center space-x-2 text-sm">
          <div className="w-2 h-2 bg-ug-success rounded-full animate-pulse"></div>
          <span className="font-medium text-foreground">
            {shuttles.filter(s => s.status === 'active').length} Active Shuttles
          </span>
        </div>
      </div>
    </div>
  );
};

export default MapComponent;