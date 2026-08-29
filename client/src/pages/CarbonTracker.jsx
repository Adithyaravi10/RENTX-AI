import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Leaf, TreePine } from 'lucide-react';
import api from '../utils/api';

export default function CarbonTracker() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/users/carbon').then(({ data }) => setStats(data));
  }, []);

  if (!stats) return <div className="p-6 text-gray-400">Loading...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <h1 className="font-syne font-bold text-3xl text-white flex items-center gap-2">
        <Leaf className="text-brand-green" /> Carbon Footprint Tracker
      </h1>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass-card p-8 text-center gradient-border"
      >
        <p className="text-gray-400">Total CO₂ Saved (Lifetime)</p>
        <motion.p
          className="font-syne font-extrabold text-6xl text-brand-green mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {stats.totalCo2Saved} kg
        </motion.p>
        <div className="flex items-center justify-center gap-2 mt-4 text-brand-cyan">
          <TreePine size={20} />
          <span>= {stats.treesEquivalent} trees planted equivalent 🌳</span>
        </div>
      </motion.div>

      <div className="glass-card p-6">
        <h3 className="font-syne font-bold text-white mb-4">You vs Average Petrol User (Monthly)</h3>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-brand-green">You</span>
              <span>{stats.totalCo2Saved} kg saved</span>
            </div>
            <div className="h-4 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-brand-green rounded-full" style={{ width: `${Math.min(100, (stats.totalCo2Saved / stats.averagePetrolUser) * 100)}%` }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">Avg Petrol User</span>
              <span>{stats.averagePetrolUser} kg emitted</span>
            </div>
            <div className="h-4 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-gray-500 rounded-full w-full" />
            </div>
          </div>
        </div>
      </div>

      {stats.monthlyTrend?.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="font-syne font-bold text-white mb-4">Monthly Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={stats.monthlyTrend}>
              <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip contentStyle={{ background: '#13131a', border: '1px solid #1e1e2e' }} />
              <Line type="monotone" dataKey="co2" stroke="#00ff87" strokeWidth={2} dot={{ fill: '#00ff87' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
