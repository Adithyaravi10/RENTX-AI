import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import { useSocket } from '../../hooks/useSocket';
import { useGeolocation } from '../../hooks/useGeolocation';
import { getVehicleStatusColor } from '../../utils/formatters';

const BENGALURU = [12.9716, 77.5946];

const createIcon = (color) =>
  L.divIcon({
    className: 'custom-marker',
    html: `<div style="width:14px;height:14px;background:${color};border-radius:50%;border:2px solid white;box-shadow:0 0 10px ${color};animation:pulse 2s infinite"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });

function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, 13);
  }, [center, map]);
  return null;
}

export default function LiveMap({ activeBooking, routeCoords = [] }) {
  const { liveVehicles } = useSocket();
  const { location } = useGeolocation();

  const userIcon = L.divIcon({
    className: 'user-marker',
    html: `<div style="width:16px;height:16px;background:#3b82f6;border-radius:50%;border:3px solid white;box-shadow:0 0 15px #3b82f6"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });

  const vehicles = liveVehicles.length > 0 ? liveVehicles : [];

  return (
    <div className="h-[500px] rounded-2xl overflow-hidden border border-white/10">
      <MapContainer center={BENGALURU} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <MapUpdater center={[location.lat, location.lng]} />

        <Marker position={[location.lat, location.lng]} icon={userIcon}>
          <Popup>Your Location</Popup>
        </Marker>

        <Circle
          center={[location.lat, location.lng]}
          radius={500}
          pathOptions={{ color: '#00d4ff', fillColor: '#00d4ff', fillOpacity: 0.05, weight: 1, dashArray: '5,5' }}
        />

        {vehicles.map((v) => {
          const status = v.status || (v.isAvailable ? 'available' : 'booked');
          const color = getVehicleStatusColor(status);
          return (
            <Marker
              key={v.id}
              position={[v.locationLat, v.locationLng]}
              icon={createIcon(color)}
            >
              <Popup>
                <div className="text-gray-900 min-w-[150px]">
                  <strong>{v.name}</strong>
                  <p className="text-sm">{v.brand} · {status}</p>
                  {v.batteryLevel != null && <p className="text-sm">🔋 {Math.round(v.batteryLevel)}%</p>}
                  {status === 'available' && (
                    <Link to={`/vehicles/${v.id}`} className="text-blue-600 text-sm font-medium">Book Now →</Link>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {routeCoords.length > 1 && (
          <Polyline positions={routeCoords} pathOptions={{ color: '#00d4ff', weight: 4, opacity: 0.8 }} />
        )}
      </MapContainer>
    </div>
  );
}
