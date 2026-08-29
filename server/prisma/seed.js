import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { VEHICLE_CATALOG, BENGALURU_LOCATIONS, buildVehicleCreateData } from '../src/data/vehicleCatalog.js';

const prisma = new PrismaClient();

const CHARGING_STATIONS = [
  { name: 'ChargeZone Koramangala', lat: 12.9352, lng: 77.6245, slots: 8, available: 5, price: 12 },
  { name: 'Tata Power EV Hub Indiranagar', lat: 12.9784, lng: 77.6408, slots: 12, available: 8, price: 14 },
  { name: 'Ather Grid HSR Layout', lat: 12.9116, lng: 77.6389, slots: 6, available: 3, price: 10 },
  { name: 'BPCL EV Station Whitefield', lat: 12.9698, lng: 77.75, slots: 10, available: 7, price: 13 },
  { name: 'Jio-bp Pulse MG Road', lat: 12.975, lng: 77.6063, slots: 15, available: 10, price: 11 },
];

async function main() {
  console.warn(
    '⚠️  WARNING: Full seed DELETES all users, vehicles, and bookings. For adding vehicles only, restart the server (auto-seed) instead.'
  );
  console.log('🌱 Seeding RentX AI database...');

  await prisma.gPSLog.deleteMany();
  await prisma.maintenanceLog.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.review.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.sOSEvent.deleteMany();
  await prisma.chargingStation.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash('password123', 12);

  await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@rentx.ai',
      password: hashedPassword,
      role: 'ADMIN',
      phone: '+919876543210',
      walletBalance: 10000,
      ecoScore: 500,
      aadhaarVerified: true,
    },
  });

  await prisma.user.create({
    data: {
      name: 'Fleet Manager',
      email: 'fleet@rentx.ai',
      password: hashedPassword,
      role: 'FLEET_MANAGER',
      phone: '+919876543211',
      walletBalance: 5000,
    },
  });

  const users = [];
  for (let i = 1; i <= 10; i++) {
    const user = await prisma.user.create({
      data: {
        name: `User ${i}`,
        email: `user${i}@rentx.ai`,
        password: hashedPassword,
        phone: `+9198765432${String(i).padStart(2, '0')}`,
        walletBalance: Math.floor(Math.random() * 5000) + 500,
        ecoScore: Math.floor(Math.random() * 300),
        loyaltyPoints: Math.floor(Math.random() * 200),
        aadhaarVerified: i % 2 === 0,
        licenseNumber: `KA01${2020000 + i}`,
      },
    });
    users.push(user);
  }

  const createdVehicles = [];
  for (let i = 0; i < VEHICLE_CATALOG.length; i++) {
    const v = VEHICLE_CATALOG[i];
    const vehicle = await prisma.vehicle.create({
      data: buildVehicleCreateData(v, i),
    });
    createdVehicles.push(vehicle);
  }

  for (const vehicle of createdVehicles) {
    const reviewCount = 1 + Math.floor(Math.random() * 3);
    for (let r = 0; r < reviewCount; r++) {
      const user = users[Math.floor(Math.random() * users.length)];
      await prisma.review.create({
        data: {
          userId: user.id,
          vehicleId: vehicle.id,
          rating: 3 + Math.floor(Math.random() * 3),
          comment: 'Great ride with RentX!',
        },
      });
    }
  }

  for (const station of CHARGING_STATIONS) {
    await prisma.chargingStation.create({
      data: {
        name: station.name,
        lat: station.lat,
        lng: station.lng,
        totalSlots: station.slots,
        availableSlots: station.available,
        pricePerUnit: station.price,
        address: `${station.name}, Bengaluru, Karnataka`,
      },
    });
  }

  const vehicles = await prisma.vehicle.findMany({ take: 5 });
  for (let i = 0; i < 3; i++) {
    const start = new Date();
    start.setHours(start.getHours() + 2);
    const end = new Date(start);
    end.setHours(end.getHours() + 4);

    await prisma.booking.create({
      data: {
        userId: users[i].id,
        vehicleId: vehicles[i].id,
        startTime: start,
        endTime: end,
        pickupLat: BENGALURU_LOCATIONS[0].lat,
        pickupLng: BENGALURU_LOCATIONS[0].lng,
        totalPrice: 500,
        surgeMultiplier: 1.2,
        status: 'CONFIRMED',
      },
    });
  }

  console.log(`✅ Seed completed! ${createdVehicles.length} vehicles with reviews.`);
  console.log('   Admin: admin@rentx.ai / password123');
  console.log('   Users: user1@rentx.ai - user10@rentx.ai / password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
