import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Car, Calendar, Leaf, Wallet, AlertTriangle } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import { formatPrice } from '../utils/pricing';
import { formatDateTime, getStatusColor } from '../utils/formatters';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    api.get('/bookings/my').then(({ data }) => setBookings(data.bookings?.slice(0, 5) || []));
    api.get('/users/achievements').then(({ data }) => setAchievements(data.achievements || []));
  }, []);

  const triggerSOS = async () => {
    try {
      const { data } = await api.post('/emergency/sos', { lat: 12.9716, lng: 77.5946 });
      toast.success('SOS sent! Help is on the way.');
      if (data.hospitals) {
        toast(`Nearest: ${data.hospitals[0]?.name} (${data.hospitals[0]?.distance})`);
      }
    } catch {
      toast.error('SOS failed');
    }
  };

  const metrics = [
    { label: 'Wallet', value: formatPrice(user?.walletBalance || 0), icon: Wallet, color: 'text-brand-green' },
    { label: 'Eco Score', value: user?.ecoScore || 0, icon: Leaf, color: 'text-brand-cyan' },
    { label: 'Loyalty Pts', value: user?.loyaltyPoints || 0, icon: Car, color: 'text-brand-violet' },
    { label: 'Bookings', value: bookings.length, icon: Calendar, color: 'text-yellow-400' },
  ];

  return (
    <div className="p-6 space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="font-syne font-bold text-3xl text-white">Hey, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="text-gray-400 mt-1">Your smart mobility dashboard</p>
        </div>
        <Button variant="danger" onClick={triggerSOS} className="flex items-center gap-2">
          <AlertTriangle size={16} /> SOS
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map(({ label, value, icon: Icon, color }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="glass-card p-5">
            <Icon className={`${color} mb-2`} size={22} />
            <p className="font-syne font-bold text-2xl text-white">{value}</p>
            <p className="text-gray-400 text-sm">{label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-syne font-bold text-white">Recent Bookings</h2>
            <Link to="/bookings" className="text-brand-cyan text-sm">View all</Link>
          </div>
          {bookings.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No bookings yet. <Link to="/vehicles" className="text-brand-cyan">Browse vehicles</Link></p>
          ) : (
            <div className="space-y-3">
              {bookings.map((b) => (
                <div key={b.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                  <div>
                    <p className="text-white font-medium">{b.vehicle?.name}</p>
                    <p className="text-gray-400 text-xs">{formatDateTime(b.startTime)}</p>
                  </div>
                  <div className="text-right">
                    <Badge className={getStatusColor(b.status)}>{b.status}</Badge>
                    <p className="text-brand-cyan text-sm mt-1">{formatPrice(b.totalPrice)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass-card p-6">
          <h2 className="font-syne font-bold text-white mb-4">Achievements</h2>
          <div className="space-y-3">
            {achievements.map((a) => (
              <div key={a.id} className={`flex items-center gap-3 p-2 rounded-xl ${a.unlocked ? 'bg-brand-cyan/5' : 'opacity-40'}`}>
                <span className="text-2xl">{a.icon}</span>
                <div>
                  <p className="text-white text-sm font-medium">{a.name}</p>
                  <p className="text-xs text-gray-400">{a.unlocked ? 'Unlocked!' : 'Locked'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
