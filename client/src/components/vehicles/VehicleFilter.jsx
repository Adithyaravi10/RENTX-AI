import { motion } from 'framer-motion';

const CATEGORIES = ['ALL', 'CAR', 'BIKE', 'EV', 'SCOOTER', 'LUXURY', 'TRUCK'];
const FUEL_TYPES = ['ALL', 'PETROL', 'DIESEL', 'ELECTRIC', 'HYBRID'];

export default function VehicleFilter({ filters, onChange }) {
  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="glass-card p-6 space-y-6"
    >
      <h3 className="font-syne font-bold text-white">Filters</h3>

      <div>
        <label className="text-sm text-gray-400 mb-2 block">Category</label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => onChange({ ...filters, category: cat === 'ALL' ? '' : cat })}
              className={`px-3 py-1 rounded-full text-xs transition ${
                (filters.category || '') === (cat === 'ALL' ? '' : cat)
                  ? 'bg-brand-cyan text-black font-medium'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm text-gray-400 mb-2 block">Fuel Type</label>
        <div className="flex flex-wrap gap-2">
          {FUEL_TYPES.map((fuel) => (
            <button
              key={fuel}
              onClick={() => onChange({ ...filters, fuelType: fuel === 'ALL' ? '' : fuel })}
              className={`px-3 py-1 rounded-full text-xs transition ${
                (filters.fuelType || '') === (fuel === 'ALL' ? '' : fuel)
                  ? 'bg-brand-violet text-white font-medium'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {fuel}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm text-gray-400 mb-2 block">Max Price (₹/hr)</label>
        <input
          type="range"
          min="50"
          max="600"
          step="10"
          value={filters.maxPrice || 600}
          onChange={(e) => onChange({ ...filters, maxPrice: e.target.value })}
          className="w-full accent-brand-cyan"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>₹50</span>
          <span className="text-brand-cyan">₹{filters.maxPrice || 600}</span>
          <span>₹600</span>
        </div>
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={filters.available === 'true'}
          onChange={(e) => onChange({ ...filters, available: e.target.checked ? 'true' : '' })}
          className="accent-brand-cyan"
        />
        <span className="text-sm text-gray-300">Available only</span>
      </label>
    </motion.div>
  );
}
