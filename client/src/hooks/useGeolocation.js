import { useState, useEffect } from 'react';

/** Bengaluru city center — RentX fleet is seeded here */
export const DEFAULT_LOCATION = { lat: 12.9716, lng: 77.5946, label: 'Bengaluru' };
const SERVICE_AREA_KM = 100;

const toRad = (deg) => (deg * Math.PI) / 180;

const distanceKm = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const isInServiceArea = (lat, lng) =>
  distanceKm(lat, lng, DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lng) <= SERVICE_AREA_KM;

export const useGeolocation = () => {
  const [location, setLocation] = useState(DEFAULT_LOCATION);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [usingDefault, setUsingDefault] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported — using Bengaluru');
      setUsingDefault(true);
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        if (isInServiceArea(lat, lng)) {
          setLocation({ lat, lng, label: 'your location' });
          setUsingDefault(false);
        } else {
          setLocation(DEFAULT_LOCATION);
          setUsingDefault(true);
          setError('Outside service area — showing Bengaluru fleet');
        }
        setLoading(false);
      },
      () => {
        setLocation(DEFAULT_LOCATION);
        setUsingDefault(true);
        setError('Unable to get location — using Bengaluru');
        setLoading(false);
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 }
    );
  }, []);

  return { location, error, loading, usingDefault };
};
