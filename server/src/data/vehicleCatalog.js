import { getVehicleImageUrl } from './vehicleImages.js';

export const DEFAULT_LOCATION = { lat: 12.9716, lng: 77.5946, label: 'Bengaluru' };

export const BENGALURU_LOCATIONS = [
  { lat: 12.9716, lng: 77.5946 },
  { lat: 12.9352, lng: 77.6245 },
  { lat: 12.9279, lng: 77.6271 },
  { lat: 12.9698, lng: 77.75 },
  { lat: 13.0358, lng: 77.597 },
  { lat: 12.9141, lng: 77.6101 },
  { lat: 12.9987, lng: 77.592 },
  { lat: 12.9591, lng: 77.6974 },
  { lat: 12.8456, lng: 77.6603 },
  { lat: 13.0284, lng: 77.5898 },
  { lat: 12.9784, lng: 77.6408 },
  { lat: 12.9116, lng: 77.6389 },
];

const DESCRIPTIONS = {
  HATCHBACK: 'Compact hatchback ideal for city commutes and tight parking in Bengaluru.',
  SEDAN: 'Comfortable sedan with ample legroom for business and family trips.',
  SUV: 'Spacious SUV built for Bengaluru traffic, highways, and weekend getaways.',
  LUXURY: 'Premium luxury vehicle with top-tier comfort and performance.',
  EV: 'Zero-emission electric vehicle with smart connectivity and low running cost.',
  BIKE: 'Fuel-efficient two-wheeler perfect for quick Bengaluru commutes.',
  SCOOTER: 'Easy-to-ride scooter for daily errands and short city hops.',
  TRUCK: 'Utility vehicle for cargo and commercial transport needs.',
};

/** 32+ vehicles across hatchback, sedan, SUV, luxury, bike, EV, and e-scooter */
export const VEHICLE_CATALOG = [
  { name: 'Maruti Swift', brand: 'Maruti', category: 'CAR', bodyType: 'HATCHBACK', fuelType: 'PETROL', price: 120, fuel: 82 },
  { name: 'Hyundai i20', brand: 'Hyundai', category: 'CAR', bodyType: 'HATCHBACK', fuelType: 'PETROL', price: 130, fuel: 88 },
  { name: 'Volkswagen Polo', brand: 'Volkswagen', category: 'CAR', bodyType: 'HATCHBACK', fuelType: 'PETROL', price: 140, fuel: 85 },
  { name: 'Honda City', brand: 'Honda', category: 'CAR', bodyType: 'SEDAN', fuelType: 'PETROL', price: 160, fuel: 90 },
  { name: 'Hyundai Verna', brand: 'Hyundai', category: 'CAR', bodyType: 'SEDAN', fuelType: 'PETROL', price: 170, fuel: 87 },
  { name: 'Toyota Camry Hybrid', brand: 'Toyota', category: 'CAR', bodyType: 'SEDAN', fuelType: 'HYBRID', price: 280, fuel: 95 },
  { name: 'Hyundai Creta', brand: 'Hyundai', category: 'CAR', bodyType: 'SUV', fuelType: 'DIESEL', price: 150, fuel: 75 },
  { name: 'Toyota Innova Crysta', brand: 'Toyota', category: 'CAR', bodyType: 'SUV', fuelType: 'DIESEL', price: 200, fuel: 70 },
  { name: 'Mahindra XUV700', brand: 'Mahindra', category: 'CAR', bodyType: 'SUV', fuelType: 'DIESEL', price: 220, fuel: 78 },
  { name: 'BMW 3 Series', brand: 'BMW', category: 'LUXURY', bodyType: 'LUXURY', fuelType: 'PETROL', price: 450, fuel: 85 },
  { name: 'Mercedes C-Class', brand: 'Mercedes', category: 'LUXURY', bodyType: 'LUXURY', fuelType: 'PETROL', price: 500, fuel: 82 },
  { name: 'Audi e-tron', brand: 'Audi', category: 'LUXURY', bodyType: 'LUXURY', fuelType: 'ELECTRIC', price: 600, battery: 65 },
  { name: 'Volvo XC60', brand: 'Volvo', category: 'LUXURY', bodyType: 'LUXURY', fuelType: 'HYBRID', price: 550, fuel: 78 },
  { name: 'Tata Nexon EV', brand: 'Tata', category: 'EV', bodyType: 'EV', fuelType: 'ELECTRIC', price: 180, battery: 85 },
  { name: 'MG ZS EV', brand: 'MG', category: 'EV', bodyType: 'EV', fuelType: 'ELECTRIC', price: 200, battery: 78 },
  { name: 'Ather 450X', brand: 'Ather', category: 'EV', bodyType: 'EV', fuelType: 'ELECTRIC', price: 80, battery: 72 },
  { name: 'Hero Electric Optima', brand: 'Hero', category: 'EV', bodyType: 'EV', fuelType: 'ELECTRIC', price: 50, battery: 95 },
  { name: 'Royal Enfield Classic 350', brand: 'Royal Enfield', category: 'BIKE', bodyType: 'BIKE', fuelType: 'PETROL', price: 70, fuel: 88 },
  { name: 'Yamaha MT-15', brand: 'Yamaha', category: 'BIKE', bodyType: 'BIKE', fuelType: 'PETROL', price: 65, fuel: 92 },
  { name: 'KTM Duke 200', brand: 'KTM', category: 'BIKE', bodyType: 'BIKE', fuelType: 'PETROL', price: 90, fuel: 86 },
  { name: 'Honda Activa 6G', brand: 'Honda', category: 'SCOOTER', bodyType: 'SCOOTER', fuelType: 'PETROL', price: 45, fuel: 95 },
  { name: 'TVS iQube', brand: 'TVS', category: 'SCOOTER', bodyType: 'SCOOTER', fuelType: 'ELECTRIC', price: 55, battery: 80 },
  { name: 'Ola S1 Pro', brand: 'Ola', category: 'SCOOTER', bodyType: 'SCOOTER', fuelType: 'ELECTRIC', price: 60, battery: 90 },
  { name: 'Tata Ace', brand: 'Tata', category: 'TRUCK', bodyType: 'TRUCK', fuelType: 'DIESEL', price: 100, fuel: 90 },
  { name: 'Mahindra Bolero Pickup', brand: 'Mahindra', category: 'TRUCK', bodyType: 'TRUCK', fuelType: 'DIESEL', price: 110, fuel: 88 },
  { name: 'Maruti Dzire', brand: 'Maruti', category: 'CAR', bodyType: 'SEDAN', fuelType: 'PETROL', price: 125, fuel: 84 },
  { name: 'Kia Seltos', brand: 'Kia', category: 'CAR', bodyType: 'SUV', fuelType: 'PETROL', price: 190, fuel: 80 },
  { name: 'Tata Punch EV', brand: 'Tata', category: 'EV', bodyType: 'EV', fuelType: 'ELECTRIC', price: 165, battery: 88 },
  { name: 'Jaguar F-Pace', brand: 'Jaguar', category: 'LUXURY', bodyType: 'LUXURY', fuelType: 'DIESEL', price: 580, fuel: 76 },
  { name: 'Suzuki Access 125', brand: 'Suzuki', category: 'SCOOTER', bodyType: 'SCOOTER', fuelType: 'PETROL', price: 42, fuel: 93 },
  { name: 'Bajaj Pulsar 150', brand: 'Bajaj', category: 'BIKE', bodyType: 'BIKE', fuelType: 'PETROL', price: 58, fuel: 91 },
  { name: 'Force Traveller', brand: 'Force', category: 'TRUCK', bodyType: 'TRUCK', fuelType: 'DIESEL', price: 180, fuel: 72 },
];

export function buildVehicleCreateData(v, index) {
  const loc = BENGALURU_LOCATIONS[index % BENGALURU_LOCATIONS.length];
  const isElectric = v.fuelType === 'ELECTRIC';
  const bodyKey = v.bodyType || v.category;
  return {
    name: v.name,
    brand: v.brand,
    category: v.category,
    bodyType: v.bodyType,
    fuelType: v.fuelType,
    description:
      v.description ||
      DESCRIPTIONS[bodyKey] ||
      `Reliable ${v.brand} ${v.name} available for rent in Bengaluru.`,
    pricePerHour: v.price,
    locationLat: loc.lat + (Math.random() - 0.5) * 0.008,
    locationLng: loc.lng + (Math.random() - 0.5) * 0.008,
    isAvailable: Math.random() > 0.15,
    batteryLevel: isElectric ? v.battery ?? 80 : null,
    fuelLevel: !isElectric ? v.fuel ?? 85 : null,
    healthScore: Math.floor(Math.random() * 25) + 75,
    odometer: Math.floor(Math.random() * 50000) + 1000,
    imageUrl: getVehicleImageUrl(v.name, v.category, v.bodyType, v.fuelType),
    lastServiced: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
    insuranceExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
  };
}
