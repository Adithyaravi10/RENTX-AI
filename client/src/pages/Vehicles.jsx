import { useEffect, useState, useCallback } from 'react';
import api from '../utils/api';
import { useGeolocation, DEFAULT_LOCATION } from '../hooks/useGeolocation';
import VehicleCard from '../components/vehicles/VehicleCard';
import VehicleFilter from '../components/vehicles/VehicleFilter';
import Skeleton from '../components/ui/Skeleton';
import toast from 'react-hot-toast';

const DEFAULT_FILTERS = { maxPrice: '600' };

async function loadVehicles(location, filters) {
  const params = new URLSearchParams();
  if (filters.category) params.set('category', filters.category);
  if (filters.fuelType) params.set('fuelType', filters.fuelType);
  if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
  if (filters.available) params.set('available', filters.available);
  params.set('lat', String(location.lat));
  params.set('lng', String(location.lng));
  params.set('radius', '50');

  const { data } = await api.get(`/vehicles?${params.toString()}`);
  return data;
}

export default function Vehicles() {
  const { location, loading: geoLoading, usingDefault, error: geoError } = useGeolocation();
  const [vehicles, setVehicles] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [locationNote, setLocationNote] = useState(null);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    try {
      let data = await loadVehicles(location, filters);
      let list = Array.isArray(data.vehicles) ? data.vehicles : [];

      if (list.length === 0) {
        data = await loadVehicles(DEFAULT_LOCATION, DEFAULT_FILTERS);
        list = Array.isArray(data.vehicles) ? data.vehicles : [];
        if (list.length > 0) {
          data.locationNote =
            data.locationNote ||
            `Showing vehicles near ${DEFAULT_LOCATION.label} (location fallback)`;
        }
      }

      setVehicles(list);
      setCount(typeof data.count === 'number' ? data.count : list.length);
      setLocationNote(data.locationNote || null);
    } catch (err) {
      console.error('[Vehicles] fetch failed:', err);
      try {
        const data = await loadVehicles(DEFAULT_LOCATION, DEFAULT_FILTERS);
        const list = Array.isArray(data.vehicles) ? data.vehicles : [];
        setVehicles(list);
        setCount(list.length);
        setLocationNote(`Showing vehicles near ${DEFAULT_LOCATION.label} (API retry)`);
      } catch {
        setVehicles([]);
        setCount(0);
        toast.error('Failed to load vehicles — please refresh');
      }
    } finally {
      setLoading(false);
    }
  }, [filters, location.lat, location.lng]);

  useEffect(() => {
    if (geoLoading) return;
    fetchVehicles();
  }, [fetchVehicles, geoLoading]);

  const locationLabel = usingDefault ? DEFAULT_LOCATION.label : 'you';

  return (
    <div className="p-6">
      <h1 className="font-syne font-bold text-3xl text-white mb-2">Browse Vehicles</h1>
      <p className="text-gray-400 mb-2">
        {loading || geoLoading
          ? 'Finding vehicles near you…'
          : `${count} vehicle${count === 1 ? '' : 's'} near ${locationLabel}`}
      </p>
      {(locationNote || geoError) && (
        <p className="text-gray-500 text-sm mb-6">{locationNote || geoError}</p>
      )}
      {!locationNote && !geoError && <div className="mb-6" />}

      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <VehicleFilter filters={filters} onChange={setFilters} />
        </div>
        <div className="lg:col-span-3">
          {loading || geoLoading ? (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-80" />
              ))}
            </div>
          ) : vehicles.length === 0 ? (
            <div className="glass-card p-8 text-center text-gray-400">
              No vehicles match the selected filters. Try clearing filters or increasing max price.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {vehicles.map((v, i) => (
                <VehicleCard key={v.id} vehicle={v} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
