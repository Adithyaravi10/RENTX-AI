import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../utils/api';
import { formatPrice } from '../utils/pricing';
import RevenueChart from '../components/admin/RevenueChart';
import BookingHeatmap from '../components/admin/BookingHeatmap';
import VehicleUsageChart from '../components/admin/VehicleUsageChart';
import FraudAlerts from '../components/admin/FraudAlerts';
import LiveMap from '../components/map/LiveMap';

function CountUp({ value, prefix = '' }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const target = typeof value === 'number' ? value : 0;
    const step = target / 30;
    let current = 0;
    const timer = setInterval(() => {
      current += step;
      if (current >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(current));
    }, 30);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{prefix}{typeof value === 'number' && value > 1000 ? count.toLocaleString('en-IN') : count}</span>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({});
  const [revenue, setRevenue] = useState([]);
  const [heatmap, setHeatmap] = useState([]);
  const [usage, setUsage] = useState([]);
  const [fraudAlerts, setFraudAlerts] = useState([]);
  const [maintenance, setMaintenance] = useState([]);

  useEffect(() => {
    Promise.all([
      api.get('/admin/stats'),
      api.get('/admin/revenue'),
      api.get('/admin/heatmap'),
      api.get('/admin/vehicle-usage'),
      api.get('/admin/fraud-alerts'),
      api.get('/maintenance/due'),
    ]).then(([s, r, h, u, f, m]) => {
      setStats(s.data.stats || {});
      setRevenue(r.data.chartData || []);
      setHeatmap(h.data.heatmap || []);
      setUsage(u.data.chartData || []);
      setFraudAlerts(f.data.alerts || []);
      setMaintenance(m.data.vehicles || []);
    });
  }, []);

  const statCards = [
    { label: 'Total Revenue', value: stats.totalRevenue, prefix: '₹', color: 'text-brand-cyan' },
    { label: 'Active Bookings', value: stats.activeBookings, color: 'text-brand-green' },
    { label: 'Vehicles on Road', value: stats.vehiclesOnRoad, color: 'text-brand-violet' },
    { label: 'New Users Today', value: stats.newUsersToday, color: 'text-yellow-400' },
  ];

  return (
    <div className="p-6 space-y-8">
      <h1 className="font-syne font-bold text-3xl text-white">Admin Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, prefix, color }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="glass-card p-5">
            <p className="text-gray-400 text-sm">{label}</p>
            <p className={`font-syne font-bold text-3xl mt-1 ${color}`}>
              <CountUp value={value || 0} prefix={prefix} />
            </p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="font-syne font-bold text-white mb-4">Revenue (30 Days)</h3>
          <RevenueChart data={revenue} />
        </div>
        <div className="glass-card p-6">
          <h3 className="font-syne font-bold text-white mb-4">Top Vehicles by Usage</h3>
          <VehicleUsageChart data={usage} />
        </div>
      </div>

      <div className="glass-card p-6">
        <h3 className="font-syne font-bold text-white mb-4">Booking Heatmap (7×24)</h3>
        <BookingHeatmap data={heatmap} />
      </div>

      <div className="glass-card p-6">
        <h3 className="font-syne font-bold text-white mb-4">Live Fleet Map</h3>
        <LiveMap />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="font-syne font-bold text-white mb-4">Fraud Alerts</h3>
          <FraudAlerts alerts={fraudAlerts} />
        </div>
        <div className="glass-card p-6">
          <h3 className="font-syne font-bold text-white mb-4">Maintenance Due</h3>
          {maintenance.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">All vehicles healthy</p>
          ) : (
            <div className="space-y-2">
              {maintenance.map((v) => (
                <div key={v.id} className="flex justify-between p-3 bg-white/5 rounded-xl text-sm">
                  <span className="text-white">{v.name}</span>
                  <span className="text-brand-red">Health: {v.healthScore}%</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
