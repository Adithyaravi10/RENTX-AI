import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import Button from '../ui/Button';

const BENGALURU = [12.9716, 77.5946];

const evIcon = L.divIcon({
  className: 'ev-marker',
  html: `<div style="width:28px;height:28px;background:#00ff87;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:16px;border:2px solid white">⚡</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

export default function ChargingMap({ stations, onBookSlot, userLocation }) {
  return (
    <div className="h-[450px] rounded-2xl overflow-hidden border border-white/10">
      <MapContainer center={BENGALURU} zoom={12} style={{ height: '100%', width: '100%' }}>
        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
        {stations.map((station) => (
          <Marker key={station.id} position={[station.lat, station.lng]} icon={evIcon}>
            <Popup>
              <div className="text-gray-900 min-w-[180px]">
                <strong>{station.name}</strong>
                <p className="text-sm mt-1">Slots: {station.availableSlots}/{station.totalSlots}</p>
                <p className="text-sm">₹{station.pricePerUnit}/unit</p>
                {station.distance && <p className="text-sm text-gray-500">{station.distance.toFixed(1)} km away</p>}
                <button
                  onClick={() => onBookSlot(station)}
                  className="mt-2 w-full bg-green-500 text-white text-sm py-1.5 rounded-lg font-medium"
                >
                  Book Slot
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
