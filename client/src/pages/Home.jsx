import { lazy, Suspense, useEffect, useState } from 'react';
import { Car, Users, Leaf, Route } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import api from '../utils/api';
import { DEFAULT_LOCATION } from '../hooks/useGeolocation';
import CinematicHero from '../components/landing/CinematicHero';
import CinematicGarage from '../components/landing/CinematicGarage';
import AnimatedCounter from '../components/landing/AnimatedCounter';
import ScrollReveal from '../components/landing/ScrollReveal';
import Skeleton from '../components/ui/Skeleton';

const FeaturedVehicles = lazy(() => import('../components/landing/FeaturedVehicles'));
const AIRecommendations = lazy(() => import('../components/ai/AIRecommendations'));

const STAT_ICONS = { Car, Users, Route, Leaf };

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [fleetCount, setFleetCount] = useState(32);

  useEffect(() => {
    const params = new URLSearchParams({
      lat: String(DEFAULT_LOCATION.lat),
      lng: String(DEFAULT_LOCATION.lng),
      radius: '50',
    });
    api
      .get(`/vehicles?${params}`)
      .then(({ data }) => setFleetCount(data.count ?? data.vehicles?.length ?? 32))
      .catch(() => {});
  }, []);

  const stats = [
    { label: 'Total Vehicles', value: `${fleetCount}+`, icon: 'Car' },
    { label: 'Active Users', value: '1250+', icon: 'Users' },
    { label: 'Completed Rentals', value: '10000+', icon: 'Route' },
    { label: 'CO₂ Saved', value: '2.5T', icon: 'Leaf' },
  ];

  return (
    <div className="bg-[#07070a]">
      <CinematicHero isAuthenticated={isAuthenticated} />
      <CinematicGarage />

      <section className="relative py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {stats.map(({ label, value, icon }, i) => {
              const Icon = STAT_ICONS[icon];
              return (
                <ScrollReveal key={label} delay={i * 0.1}>
                  <div className="glass-card-premium p-6 md:p-8 text-center group hover:border-brand-cyan/30 transition-colors">
                    <Icon className="mx-auto text-brand-cyan mb-3 group-hover:scale-110 transition-transform" size={28} />
                    <p className="font-syne font-bold text-3xl md:text-4xl text-white">
                      <AnimatedCounter value={value} />
                    </p>
                    <p className="text-gray-400 text-sm mt-2">{label}</p>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      <Suspense
        fallback={
          <div className="max-w-7xl mx-auto px-4 py-24 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-2xl" />
            ))}
          </div>
        }
      >
        <FeaturedVehicles />
      </Suspense>

      <section className="max-w-7xl mx-auto px-4 py-16 pb-24">
        <Suspense fallback={<Skeleton className="h-40 rounded-2xl" />}>
          <ScrollReveal>
            <AIRecommendations />
          </ScrollReveal>
        </Suspense>
      </section>
    </div>
  );
}
