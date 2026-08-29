import { useState, useEffect } from 'react';
import { useGeolocation } from './useGeolocation';

const API_KEY = import.meta.env.VITE_OPENWEATHER_KEY || '';

export const useWeather = () => {
  const { location } = useGeolocation();
  const [weather, setWeather] = useState({
    condition: 'clear',
    temp: 28,
    humidity: 65,
    isRaining: false,
    isHot: false,
    description: 'Loading...',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      if (!API_KEY) {
        setWeather({
          condition: 'clear',
          temp: 28,
          humidity: 65,
          isRaining: false,
          isHot: false,
          description: 'Clear sky',
        });
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lng}&appid=${API_KEY}&units=metric`
        );
        const data = await res.json();
        const condition = data.weather?.[0]?.main?.toLowerCase() || 'clear';
        const temp = data.main?.temp || 28;

        setWeather({
          condition,
          temp,
          humidity: data.main?.humidity || 65,
          isRaining: condition.includes('rain') || condition.includes('drizzle'),
          isHot: temp > 35,
          description: data.weather?.[0]?.description || condition,
        });
      } catch {
        setWeather((w) => ({ ...w, description: 'Weather unavailable' }));
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [location.lat, location.lng]);

  return { weather, loading, location };
};
