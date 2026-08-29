import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, Leaf } from 'lucide-react';
import { aiApi } from '../../utils/api';
import { useWeather } from '../../hooks/useWeather';
import Skeleton from '../ui/Skeleton';
import { formatPrice } from '../../utils/pricing';
import VehicleImage from '../vehicles/VehicleImage';

export default function AIRecommendations() {
  const { weather } = useWeather();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecs = async () => {
      try {
        const { data } = await aiApi.post('/api/ai/recommend', {
          distanceKm: 15,
          budgetInr: 300,
          weather: weather.condition,
          trafficLevel: 'moderate',
          groupSize: 1,
          purpose: 'commute',
          temp: weather.temp,
        });
        setRecommendations(data.recommendations || []);
      } catch {
        setRecommendations([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRecs();
  }, [weather.condition, weather.temp]);

  if (loading) {
    return (
      <div className="flex gap-4 overflow-hidden">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="w-72 h-36 flex-shrink-0" />)}
      </div>
    );
  }

  if (!recommendations.length) return null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="text-brand-cyan" size={20} />
        <h2 className="font-syne font-bold text-xl text-white">AI Picks for You</h2>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
        {recommendations.map((rec, i) => (
          <motion.div
            key={rec.vehicle?.id || i}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex-shrink-0 w-72 glass-card overflow-hidden snap-start gradient-border"
          >
            <VehicleImage vehicle={rec.vehicle} className="w-full h-32 object-cover bg-[#1a1a24]" />
            <div className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-brand-cyan text-xs font-medium">Score: {rec.totalScore}/100</p>
                  <h3 className="font-syne font-bold text-white">{rec.vehicle?.name}</h3>
                  <p className="text-gray-400 text-sm">{rec.vehicle?.brand}</p>
                </div>
                <span className="text-brand-cyan font-bold whitespace-nowrap">
                  {formatPrice(rec.vehicle?.pricePerHour)}/hr
                </span>
              </div>
              <p className="text-gray-300 text-sm mb-3 line-clamp-2">{rec.aiReason}</p>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-brand-green text-xs">
                  <Leaf size={12} /> {rec.co2Estimate} kg CO₂ saved
                </span>
                <Link to={`/vehicles/${rec.vehicle?.id}`} className="text-brand-cyan text-sm hover:underline">
                  Book →
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
