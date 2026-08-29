/**
 * Updates vehicle imageUrl, description, and bodyType from catalog.
 * Run: node prisma/update-vehicle-images.js
 */
import { PrismaClient } from '@prisma/client';
import { getVehicleImageUrl } from '../src/data/vehicleImages.js';
import { VEHICLE_CATALOG } from '../src/data/vehicleCatalog.js';

const prisma = new PrismaClient();

const catalogByName = Object.fromEntries(
  VEHICLE_CATALOG.map((v) => [v.name, v])
);

async function main() {
  const vehicles = await prisma.vehicle.findMany();
  let updated = 0;

  for (const vehicle of vehicles) {
    const baseName = vehicle.name.replace(/\s*\(\d+\)$/, '');
    const catalog = catalogByName[baseName];
    const bodyType = vehicle.bodyType || catalog?.bodyType || null;
    const imageUrl = getVehicleImageUrl(
      baseName || vehicle.name,
      vehicle.category,
      bodyType,
      vehicle.fuelType
    );
    const description =
      vehicle.description ||
      (catalog
        ? `${catalog.brand} ${catalog.name} — ${catalog.fuelType} ${catalog.bodyType || catalog.category} available for rent in Bengaluru.`
        : null);

    await prisma.vehicle.update({
      where: { id: vehicle.id },
      data: { imageUrl, bodyType, description },
    });
    updated++;
    console.log(`✓ ${vehicle.name} → ${imageUrl.slice(0, 70)}…`);
  }

  console.log(`\n✅ Updated ${updated} vehicles (images + details).`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
