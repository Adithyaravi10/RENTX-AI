import { lazy, Suspense, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Car, Users, Leaf, Route } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import api from '../utils/api';
import { DEFAULT_LOCATION } from '../hooks/useGeolocation';
import HeroBackground from '../components/landing/HeroBackground';
import Hero3DCar from '../components/landing/Hero3DCar';
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
    <div className="overflow-x-hidden">
      {/* ── Full-width premium hero ── */}
      <section className="relative min-h-[92vh] flex flex-col justify-center py-16 md:py-24">
        <HeroBackground />

        <div className="relative z-10 max-w-7xl mx-auto px-4 w-full">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-6 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="text-center lg:text-left order-2 lg:order-1"
            >
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-block px-4 py-1.5 rounded-full text-xs font-medium text-brand-cyan border border-brand-cyan/30 bg-brand-cyan/5 mb-6"
              >
                Next-Gen Mobility · Bengaluru
              </motion.span>

              <h1 className="font-syne font-extrabold text-4xl sm:text-5xl md:text-6xl xl:text-7xl text-white leading-[1.08] tracking-tight">
                Drive the
                <br />
                <span className="text-gradient-cyan">Future</span> Today
              </h1>

              <p className="text-gray-400 text-base md:text-lg mt-6 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                Premium cars, bikes & EVs with AI-powered recommendations, live tracking, and carbon-smart rentals.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mt-10">
                <Link to={isAuthenticated ? '/vehicles' : '/register'} className="hero-cta-primary group">
                  Rent Now
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/vehicles" className="hero-cta-outline">
                  Explore Fleet
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="order-1 lg:order-2"
            >
              <Hero3DCar />
            </motion.div>
          </div>
        </div>

        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2 text-gray-500 text-xs"
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <span>Scroll to explore</span>
          <div className="w-px h-8 bg-gradient-to-b from-brand-cyan/50 to-transparent" />
        </motion.div>
      </section>

      {/* ── Animated stats ── */}
      <section className="relative py-16 px-4">
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

      {/* ── Featured vehicles (lazy) ── */}
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

      {/* ── AI recommendations (lazy) ── */}
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
