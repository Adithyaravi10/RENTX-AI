/**
 * One shared car photo and one shared bike photo for the entire fleet.
 * Images are local SVGs in client/public/vehicles/ — always load offline.
 */

export const CAR_IMAGE = '/vehicles/car.svg';
export const BIKE_IMAGE = '/vehicles/bike.svg';
export const FALLBACK_VEHICLE_IMAGE = CAR_IMAGE;

const SCOOTER_EV_NAMES = new Set(['Ather 450X', 'Hero Electric Optima']);

export function isTwoWheeler(category, bodyType, name) {
  const cat = String(category || '').toUpperCase();
  const body = String(bodyType || '').toUpperCase();
  const base = name?.replace(/\s*\(\d+\)$/, '') || '';
  if (cat === 'BIKE' || cat === 'SCOOTER') return true;
  if (body === 'BIKE' || body === 'SCOOTER') return true;
  if (SCOOTER_EV_NAMES.has(base)) return true;
  return false;
}

/** CAR, LUXURY, EV cars, TRUCK → car image. BIKE, SCOOTER, Ather/Hero → bike image. */
export function getVehicleImageUrl(name, category, bodyType) {
  return isTwoWheeler(category, bodyType, name) ? BIKE_IMAGE : CAR_IMAGE;
}

export function getCategoryFallback(category, bodyType, name) {
  return getVehicleImageUrl(name, category, bodyType);
}

export function resolveVehicleImagePath(vehicle) {
  if (!vehicle) return CAR_IMAGE;
  return getVehicleImageUrl(vehicle.name, vehicle.category, vehicle.bodyType);
}

export function getImageFallbackChain(vehicle) {
  return [resolveVehicleImagePath(vehicle)];
}

/** Sync imageUrl on every vehicle in the database (non-destructive). */
export async function syncAllVehicleImages(prisma) {
  const vehicles = await prisma.vehicle.findMany({ where: { isDeleted: false } });
  let updated = 0;
  for (const v of vehicles) {
    const imageUrl = getVehicleImageUrl(v.name, v.category, v.bodyType);
    if (v.imageUrl !== imageUrl) {
      await prisma.vehicle.update({ where: { id: v.id }, data: { imageUrl } });
      updated++;
    }
  }
  if (updated > 0) {
    console.log(`[Images] Synced ${updated} vehicle image(s) → car or bike`);
  }
  return updated;
}
