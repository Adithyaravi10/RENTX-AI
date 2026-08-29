import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Battery, Fuel, MapPin, Star, Gauge } from 'lucide-react';
import Badge from '../ui/Badge';
import VehicleImage from './VehicleImage';
import { formatPrice } from '../../utils/pricing';
import { formatCategory, formatBodyType } from '../../utils/formatters';

export default function VehicleCard({ vehicle, index = 0 }) {
  const isAvailable = vehicle.isAvailable !== false && vehicle.status !== 'booked';
  const pricePerDay = Math.round((vehicle.pricePerHour || 0) * 24);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="vehicle-card overflow-hidden flex flex-col"
    >
      <div className="relative h-44 bg-[#1a1a24] shrink-0">
        <VehicleImage vehicle={vehicle} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f]/90 via-transparent to-transparent" />

        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 max-w-[65%]">
          <Badge variant="info">{formatCategory(vehicle.category)}</Badge>
          {vehicle.bodyType && (
            <Badge variant="violet">{formatBodyType(vehicle.bodyType)}</Badge>
          )}
        </div>

        <div className="absolute top-3 right-3">
          <Badge variant={isAvailable ? 'success' : 'danger'}>
            {isAvailable ? '● Available' : '● Not Available'}
          </Badge>
        </div>

        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
          <div>
            <h3 className="font-syne font-bold text-white text-lg leading-tight drop-shadow">
              {vehicle.name}
            </h3>
            <p className="text-gray-300 text-sm">{vehicle.brand}</p>
          </div>
          {vehicle.avgRating != null && (
            <span className="flex items-center gap-1 bg-black/60 rounded-full px-2 py-0.5 text-xs text-yellow-400">
              <Star size={12} fill="currentColor" /> {vehicle.avgRating.toFixed(1)}
            </span>
          )}
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        {vehicle.description && (
          <p className="text-gray-400 text-xs leading-relaxed line-clamp-2 mb-3">
            {vehicle.description}
          </p>
        )}

        <div className="grid grid-cols-2 gap-2 text-xs text-gray-400 mb-3">
          <span className="flex items-center gap-1">
            <Gauge size={13} className="text-brand-cyan shrink-0" />
            {vehicle.fuelType}
          </span>
          <span className="text-right font-syne font-bold text-brand-cyan">
            {formatPrice(vehicle.pricePerHour)}/hr
          </span>
          <span className="text-gray-500">≈ {formatPrice(pricePerDay)}/day</span>
          {vehicle.distance != null && (
            <span className="flex items-center gap-1 justify-end">
              <MapPin size={13} /> {vehicle.distance.toFixed(1)} km
            </span>
          )}
          {vehicle.batteryLevel != null ? (
            <span className="flex items-center gap-1 col-span-2">
              <Battery size={13} className="text-brand-cyan" /> Battery {Math.round(vehicle.batteryLevel)}%
            </span>
          ) : vehicle.fuelLevel != null ? (
            <span className="flex items-center gap-1 col-span-2">
              <Fuel size={13} className="text-yellow-400" /> Fuel {Math.round(vehicle.fuelLevel)}%
            </span>
          ) : null}
        </div>

        <Link
          to={`/vehicles/${vehicle.id}`}
          className={`mt-auto block text-center text-sm py-2 rounded-xl font-medium transition ${
            isAvailable
              ? 'neon-button'
              : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
          }`}
        >
          {isAvailable ? 'View & Book' : 'View Details'}
        </Link>
      </div>
    </motion.div>
  );
}
