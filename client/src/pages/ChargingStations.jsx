import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import api from '../utils/api';
import ChargingMap from '../components/map/ChargingMap';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import { useGeolocation } from '../hooks/useGeolocation';

export default function ChargingStations() {
  const { location } = useGeolocation();
  const [stations, setStations] = useState([]);
  const [analytics, setAnalytics] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);

  useEffect(() => {
    api.get(`/charging?lat=${location.lat}&lng=${location.lng}`).then(({ data }) => setStations(data.stations || []));
    api.get('/charging/analytics').then(({ data }) => setAnalytics(data.hourlyData || []));
  }, [location]);

  const bookSlot = async (station) => {
    try {
      await api.post('/charging/book', { stationId: station.id });
      toast.success(`Slot booked at ${station.name}`);
      setSelectedStation(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    }
  };

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="font-syne font-bold text-3xl text-white">EV Charging Stations</h1>
        <p className="text-brand-cyan text-sm mt-2 glass-card inline-block px-4 py-2 mt-3">
          ⚡ AI Tip: Your vehicle battery at 23% — nearest station is {stations[0]?.distance?.toFixed(1) || '1.2'}km away
        </p>
      </div>

      <ChargingMap stations={stations} onBookSlot={setSelectedStation} userLocation={location} />

      <div className="glass-card p-6">
        <h3 className="font-syne font-bold text-white mb-4">Usage by Hour</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={analytics}>
            <XAxis dataKey="hour" stroke="#6b7280" fontSize={10} interval={3} />
            <YAxis stroke="#6b7280" fontSize={12} />
            <Tooltip contentStyle={{ background: '#13131a', border: '1px solid #1e1e2e' }} />
            <Bar dataKey="usage" fill="#00ff87" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <Modal isOpen={!!selectedStation} onClose={() => setSelectedStation(null)} title="Book Charging Slot">
        {selectedStation && (
          <div className="space-y-4">
            <p className="text-white font-medium">{selectedStation.name}</p>
            <p className="text-gray-400 text-sm">{selectedStation.availableSlots} slots available · ₹{selectedStation.pricePerUnit}/unit</p>
            <Button onClick={() => bookSlot(selectedStation)} className="w-full">Confirm Booking</Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
