import { useEffect, useState } from 'react';
import api from '../utils/api';
import { formatPrice } from '../utils/pricing';
import { Star } from 'lucide-react';

export default function AdminAnalytics() {
  const [data, setData] = useState({ topSpenders: [], vehicleRatings: [] });

  useEffect(() => {
    api.get('/admin/customers').then(({ data }) => setData(data));
  }, []);

  return (
    <div className="p-6 space-y-8">
      <h1 className="font-syne font-bold text-3xl text-white">Customer Analytics</h1>

      <div className="glass-card p-6">
        <h3 className="font-syne font-bold text-white mb-4">Top 10 Spenders</h3>
        <div className="space-y-3">
          {data.topSpenders?.map((u, i) => (
            <div key={u.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
              <div className="flex items-center gap-3">
                <span className="text-gray-400 w-6">#{i + 1}</span>
                <div>
                  <p className="text-white font-medium">{u.name}</p>
                  <p className="text-gray-500 text-xs">{u.email}</p>
                </div>
              </div>
              <span className="text-brand-cyan font-bold">{formatPrice(u.totalSpent)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card p-6">
        <h3 className="font-syne font-bold text-white mb-4">Vehicle Ratings</h3>
        <div className="space-y-3">
          {data.vehicleRatings?.map((v, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
              <span className="text-white">{v.vehicle}</span>
              <div className="flex items-center gap-2 text-yellow-400">
                <Star size={14} fill="currentColor" />
                <span>{v.avgRating}</span>
                <span className="text-gray-500 text-xs">({v.reviewCount} reviews)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
