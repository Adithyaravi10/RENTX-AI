/** Client mirror of server/src/data/vehicleImages.js */
export const CAR_IMAGE = '/vehicles/car.svg';
export const BIKE_IMAGE = '/vehicles/bike.svg';
export const FALLBACK_VEHICLE_IMAGE = CAR_IMAGE;

const SCOOTER_EV_NAMES = new Set(['Ather 450X', 'Hero Electric Optima']);

function isTwoWheeler(category, bodyType, name) {
  const cat = String(category || '').toUpperCase();
  const body = String(bodyType || '').toUpperCase();
  const base = name?.replace(/\s*\(\d+\)$/, '') || '';
  if (cat === 'BIKE' || cat === 'SCOOTER') return true;
  if (body === 'BIKE' || body === 'SCOOTER') return true;
  if (SCOOTER_EV_NAMES.has(base)) return true;
  return false;
}

export function getCategoryFallback(category, bodyType, name) {
  return isTwoWheeler(category, bodyType, name) ? BIKE_IMAGE : CAR_IMAGE;
}

export function resolveVehicleImage(vehicle) {
  if (!vehicle) return CAR_IMAGE;
  return getCategoryFallback(vehicle.category, vehicle.bodyType, vehicle.name);
}

export function getImageFallbackChain(vehicle) {
  return [resolveVehicleImage(vehicle)];
}
