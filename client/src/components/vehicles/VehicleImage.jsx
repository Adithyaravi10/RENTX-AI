import { resolveVehicleImage } from '../../utils/vehicleImages';

export default function VehicleImage({ vehicle, alt, className = '', loading = 'lazy' }) {
  const src = resolveVehicleImage(vehicle);

  return (
    <img
      src={src}
      alt={alt || vehicle?.name || 'Vehicle'}
      className={className}
      loading={loading}
    />
  );
}
