import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';
import DigitalTwinDashboard from '../components/vehicles/DigitalTwinDashboard';
import SafetyAlert from '../components/ai/SafetyAlert';
import BookingWizard from '../components/booking/BookingWizard';
import VehicleImage from '../components/vehicles/VehicleImage';
import Badge from '../components/ui/Badge';
import Skeleton from '../components/ui/Skeleton';
import { formatPrice } from '../utils/pricing';
import { formatCategory, formatBodyType } from '../utils/formatters';
import { Star, MapPin } from 'lucide-react';

export default function VehicleDetail() {
  const { id } = useParams();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBooking, setShowBooking] = useState(false);

  useEffect(() => {
    api
      .get(`/vehicles/${id}`)
      .then(({ data }) => setVehicle(data.vehicle))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-6"><Skeleton className="h-96" /></div>;
  if (!vehicle) return <div className="p-6 text-center text-gray-400">Vehicle not found</div>;

  const isAvailable = vehicle.isAvailable !== false;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        <div className="relative rounded-2xl overflow-hidden h-72 bg-[#1a1a24]">
          <VehicleImage vehicle={vehicle} className="w-full h-full object-cover" />
          <div className="absolute top-4 right-4">
            <Badge variant={isAvailable ? 'success' : 'danger'}>
              {isAvailable ? '● Available' : '● Not Available'}
            </Badge>
          </div>
        </div>
        <div className="glass-card p-6">
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="info">{formatCategory(vehicle.category)}</Badge>
            {vehicle.bodyType && <Badge variant="violet">{formatBodyType(vehicle.bodyType)}</Badge>}
            <Badge>{vehicle.fuelType}</Badge>
            {vehicle.avgRating && (
              <Badge variant="warning">
                <Star size={12} className="inline mr-1" />
                {vehicle.avgRating.toFixed(1)}
              </Badge>
            )}
          </div>
          <h1 className="font-syne font-bold text-3xl text-white">{vehicle.name}</h1>
          <p className="text-gray-400 text-lg mt-1">{vehicle.brand}</p>
          {vehicle.description && (
            <p className="text-gray-400 text-sm mt-3 leading-relaxed">{vehicle.description}</p>
          )}
          <p className="font-syne font-bold text-3xl text-brand-cyan mt-4">
            {formatPrice(vehicle.pricePerHour)}
            <span className="text-sm text-gray-400 font-normal">/hour</span>
          </p>
          <p className="text-gray-500 text-sm mt-1">
            ≈ {formatPrice(Math.round(vehicle.pricePerHour * 24))}/day · Bengaluru
            <MapPin size={12} className="inline ml-1" />
          </p>
          {isAvailable && !showBooking && (
            <button onClick={() => setShowBooking(true)} className="neon-button mt-6 w-full py-3">
              Book This Vehicle
            </button>
          )}
          {!isAvailable && (
            <p className="mt-6 text-brand-red text-sm">Currently not available for booking.</p>
          )}
          {showBooking && (
            <div className="mt-6 pt-6 border-t border-white/10">
              <BookingWizard vehicle={vehicle} onComplete={() => setShowBooking(false)} />
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <DigitalTwinDashboard vehicle={vehicle} />
        <SafetyAlert vehicleId={vehicle.id} />
      </div>
    </div>
  );
}
