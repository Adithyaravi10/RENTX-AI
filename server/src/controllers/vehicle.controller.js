import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/errorHandler.js';
import { resolveVehicleImagePath } from '../data/vehicleImages.js';
import { ensureMinimumVehicles, DEFAULT_LOCATION as FLEET_DEFAULT } from '../utils/ensureVehicles.js';

const prisma = new PrismaClient();

export const DEFAULT_LOCATION = { lat: FLEET_DEFAULT.lat, lng: FLEET_DEFAULT.lng, label: 'Bengaluru' };
const SERVICE_AREA_KM = 100;
const DEFAULT_RADIUS_KM = 50;

const haversineDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const avgRatingFromReviews = (reviews = []) =>
  reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : null;

const formatVehicle = (vehicle, searchLat, searchLng) => ({
  ...vehicle,
  imageUrl: resolveVehicleImagePath(vehicle),
  distance:
    searchLat != null && searchLng != null
      ? haversineDistance(searchLat, searchLng, vehicle.locationLat, vehicle.locationLng)
      : null,
  avgRating: avgRatingFromReviews(vehicle.reviews),
  reviews: undefined,
});

const resolveSearchCenter = (lat, lng) => {
  const parsedLat = parseFloat(lat);
  const parsedLng = parseFloat(lng);

  if (Number.isNaN(parsedLat) || Number.isNaN(parsedLng)) {
    return { lat: DEFAULT_LOCATION.lat, lng: DEFAULT_LOCATION.lng, usedDefaultLocation: true };
  }

  const distToService = haversineDistance(
    parsedLat,
    parsedLng,
    DEFAULT_LOCATION.lat,
    DEFAULT_LOCATION.lng
  );

  if (distToService > SERVICE_AREA_KM) {
    return { lat: DEFAULT_LOCATION.lat, lng: DEFAULT_LOCATION.lng, usedDefaultLocation: true };
  }

  return { lat: parsedLat, lng: parsedLng, usedDefaultLocation: false };
};

const vehicleInclude = {
  reviews: { select: { rating: true } },
  _count: { select: { bookings: true } },
};

async function fetchActiveVehicles(where) {
  return prisma.vehicle.findMany({
    where: { isDeleted: false, ...where },
    include: vehicleInclude,
    orderBy: { createdAt: 'desc' },
  });
}

function applyRadiusFilter(rawVehicles, searchLat, searchLng, maxRadius) {
  return rawVehicles
    .map((v) => formatVehicle(v, searchLat, searchLng))
    .filter((v) => v.distance <= maxRadius)
    .sort((a, b) => a.distance - b.distance);
}

export const getVehicles = async (req, res, next) => {
  try {
    const { category, fuelType, maxPrice, available, lat, lng, radius } = req.query;

    const filters = {};
    if (category) filters.category = category;
    if (fuelType) filters.fuelType = fuelType;
    if (maxPrice) filters.pricePerHour = { lte: parseFloat(maxPrice) };
    if (available !== undefined) filters.isAvailable = available === 'true';

    let rawVehicles = await fetchActiveVehicles(filters);

    if (rawVehicles.length === 0) {
      await ensureMinimumVehicles();
      rawVehicles = await fetchActiveVehicles(filters);
    }

    const maxRadius = parseFloat(radius) || DEFAULT_RADIUS_KM;
    const { lat: searchLat, lng: searchLng, usedDefaultLocation } = resolveSearchCenter(lat, lng);

    let vehicles = applyRadiusFilter(rawVehicles, searchLat, searchLng, maxRadius);
    let locationNote = usedDefaultLocation
      ? `Showing vehicles near ${DEFAULT_LOCATION.label} (default service area)`
      : null;

    if (vehicles.length === 0 && rawVehicles.length > 0) {
      vehicles = applyRadiusFilter(
        rawVehicles,
        DEFAULT_LOCATION.lat,
        DEFAULT_LOCATION.lng,
        maxRadius
      );
      locationNote = `Showing vehicles near ${DEFAULT_LOCATION.label} (expanded search)`;
    }

    if (vehicles.length === 0 && rawVehicles.length > 0) {
      vehicles = rawVehicles
        .map((v) => formatVehicle(v, DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lng))
        .sort((a, b) => a.distance - b.distance);
      locationNote = `Showing all ${vehicles.length} vehicles in ${DEFAULT_LOCATION.label}`;
    }

    res.json({
      success: true,
      count: vehicles.length,
      totalInFleet: rawVehicles.length,
      vehicles,
      usedDefaultLocation: usedDefaultLocation || vehicles.length === 0,
      locationNote,
      searchCenter: { lat: searchLat, lng: searchLng },
    });
  } catch (error) {
    next(error);
  }
};

export const getVehicleById = async (req, res, next) => {
  try {
    let vehicle = await prisma.vehicle.findFirst({
      where: { id: req.params.id, isDeleted: false },
      include: {
        reviews: {
          include: { user: { select: { name: true } } },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        gpsLogs: { orderBy: { timestamp: 'desc' }, take: 20 },
        maintenanceLogs: { orderBy: { completedAt: 'desc' }, take: 5 },
      },
    });

    if (!vehicle) {
      await ensureMinimumVehicles();
      vehicle = await prisma.vehicle.findFirst({
        where: { id: req.params.id, isDeleted: false },
        include: {
          reviews: {
            include: { user: { select: { name: true } } },
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
          gpsLogs: { orderBy: { timestamp: 'desc' }, take: 20 },
          maintenanceLogs: { orderBy: { completedAt: 'desc' }, take: 5 },
        },
      });
    }

    if (!vehicle) throw new AppError('Vehicle not found', 404);

    const avgRating = avgRatingFromReviews(vehicle.reviews);

    res.json({
      success: true,
      vehicle: {
        ...vehicle,
        imageUrl: resolveVehicleImagePath(vehicle),
        avgRating,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createVehicle = async (req, res, next) => {
  try {
    const vehicle = await prisma.vehicle.create({ data: req.body });
    res.status(201).json({ success: true, vehicle });
  } catch (error) {
    next(error);
  }
};

export const updateVehicle = async (req, res, next) => {
  try {
    const vehicle = await prisma.vehicle.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json({ success: true, vehicle });
  } catch (error) {
    next(error);
  }
};

export const deleteVehicle = async (req, res, next) => {
  try {
    await prisma.vehicle.update({
      where: { id: req.params.id },
      data: { isDeleted: true, isAvailable: false },
    });
    res.json({ success: true, message: 'Vehicle soft deleted' });
  } catch (error) {
    next(error);
  }
};

export const getVehicleGPS = async (req, res, next) => {
  try {
    const logs = await prisma.gPSLog.findMany({
      where: { vehicleId: req.params.id },
      orderBy: { timestamp: 'desc' },
      take: 50,
    });
    res.json({ success: true, logs });
  } catch (error) {
    next(error);
  }
};

export const getVehicleMaintenance = async (req, res, next) => {
  try {
    const logs = await prisma.maintenanceLog.findMany({
      where: { vehicleId: req.params.id },
      orderBy: { completedAt: 'desc' },
    });
    res.json({ success: true, logs });
  } catch (error) {
    next(error);
  }
};

export const getInternalVehicles = async (req, res, next) => {
  try {
    let vehicles = await prisma.vehicle.findMany({
      where: { isDeleted: false, isAvailable: true },
    });
    if (vehicles.length === 0) {
      await ensureMinimumVehicles();
      vehicles = await prisma.vehicle.findMany({
        where: { isDeleted: false, isAvailable: true },
      });
    }
    res.json({
      success: true,
      vehicles: vehicles.map((v) => ({ ...v, imageUrl: resolveVehicleImagePath(v) })),
    });
  } catch (error) {
    next(error);
  }
};
