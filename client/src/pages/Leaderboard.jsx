import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Leaf } from 'lucide-react';
import api from '../utils/api';

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    api.get('/users/leaderboard').then(({ data }) => setLeaderboard(data.leaderboard || []));
  }, []);

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <Trophy className="mx-auto text-brand-cyan mb-2" size={40} />
        <h1 className="font-syne font-bold text-3xl text-white">Eco Leaderboard</h1>
        <p className="text-gray-400">Top 20 green drivers this month</p>
      </div>
      <div className="space-y-3">
        {leaderboard.map((user, i) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`glass-card p-4 flex items-center gap-4 ${i < 3 ? 'gradient-border' : ''}`}
          >
            <span className="text-2xl w-8 text-center">{medals[i] || `#${i + 1}`}</span>
            <div className="w-10 h-10 rounded-full bg-brand-violet flex items-center justify-center font-bold text-white">
              {user.name?.[0]}
            </div>
            <div className="flex-1">
              <p className="text-white font-medium">{user.name}</p>
              <p className="text-gray-400 text-xs">{user._count?.trips || 0} trips</p>
            </div>
            <div className="flex items-center gap-1 text-brand-green font-syne font-bold">
              <Leaf size={16} /> {user.ecoScore}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
