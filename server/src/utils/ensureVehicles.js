import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import {
  VEHICLE_CATALOG,
  buildVehicleCreateData,
} from '../data/vehicleCatalog.js';
import { syncAllVehicleImages } from '../data/vehicleImages.js';

const prisma = new PrismaClient();
const MIN_VEHICLES = 30;

/**
 * NON-DESTRUCTIVE fleet bootstrap — only creates vehicles, never deletes.
 * Safe to call on every server start and from API when inventory is empty.
 */
export async function ensureMinimumVehicles() {
  let count = await prisma.vehicle.count({ where: { isDeleted: false } });

  if (count === 0) {
    console.log('[DB] ⚠️  Fleet empty — bootstrapping sample vehicles (no deletions)…');
    await bootstrapFleet();
    count = await prisma.vehicle.count({ where: { isDeleted: false } });
    console.log(`[DB] ✅ Bootstrapped ${count} vehicles`);
  }

  if (count >= MIN_VEHICLES) {
    console.log(`[DB] ${count} vehicles in fleet — inventory OK`);
    await syncAllVehicleImages(prisma);
    return count;
  }

  console.log(`[DB] ${count} vehicles — adding more to reach ${MIN_VEHICLES}…`);
  const existingNames = new Set(
    (await prisma.vehicle.findMany({ where: { isDeleted: false }, select: { name: true } })).map(
      (v) => v.name
    )
  );

  let added = 0;
  let idx = 0;
  let suffix = 1;

  while (count + added < MIN_VEHICLES) {
    if (idx >= VEHICLE_CATALOG.length) {
      idx = 0;
      suffix += 1;
    }
    const template = VEHICLE_CATALOG[idx++];
    const name = suffix === 1 ? template.name : `${template.name} (${suffix})`;
    if (existingNames.has(name)) continue;

    await prisma.vehicle.create({
      data: buildVehicleCreateData({ ...template, name }, count + added),
    });
    existingNames.add(name);
    added++;
  }

  const finalCount = await prisma.vehicle.count({ where: { isDeleted: false } });
  console.log(`[DB] Fleet now has ${finalCount} vehicles (+${added} added, none removed)`);
  await syncAllVehicleImages(prisma);
  return finalCount;
}

async function bootstrapFleet() {
  for (let i = 0; i < VEHICLE_CATALOG.length; i++) {
    await prisma.vehicle.create({
      data: buildVehicleCreateData(VEHICLE_CATALOG[i], i),
    });
  }

  await seedSampleReviews();
}

async function seedSampleReviews() {
  let users = await prisma.user.findMany({ take: 5 });
  if (users.length === 0) {
    const hashedPassword = await bcrypt.hash('password123', 12);
    const user = await prisma.user.create({
      data: {
        name: 'Demo User',
        email: 'demo@rentx.ai',
        password: hashedPassword,
        walletBalance: 1000,
      },
    });
    users = [user];
  }

  const vehicles = await prisma.vehicle.findMany({ where: { isDeleted: false } });
  for (const vehicle of vehicles) {
    const reviewCount = await prisma.review.count({ where: { vehicleId: vehicle.id } });
    if (reviewCount > 0) continue;
    const user = users[Math.floor(Math.random() * users.length)];
    await prisma.review.create({
      data: {
        userId: user.id,
        vehicleId: vehicle.id,
        rating: 3 + Math.floor(Math.random() * 3),
        comment: `Reliable ${vehicle.name} for city rides in Bengaluru.`,
      },
    });
  }
}

export const DEFAULT_LOCATION = { lat: 12.9716, lng: 77.5946, label: 'Bengaluru' };

export { MIN_VEHICLES };
