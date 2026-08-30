import { memo, lazy, Suspense, useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import api from '../../utils/api';
import { DEFAULT_LOCATION } from '../../hooks/useGeolocation';
import Skeleton from '../ui/Skeleton';
import ScrollReveal from './ScrollReveal';
import TiltCard from './TiltCard';

const VehicleCard = lazy(() => import('../vehicles/VehicleCard'));

function FeaturedVehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const stripRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: stripRef,
    offset: ['start end', 'end start'],
  });
  const headingX = useTransform(scrollYProgress, [0, 1], [-48, 48]);
  const gridY = useTransform(scrollYProgress, [0, 1], [36, -36]);

  useEffect(() => {
    const params = new URLSearchParams({
      lat: String(DEFAULT_LOCATION.lat),
      lng: String(DEFAULT_LOCATION.lng),
      radius: '50',
      available: 'true',
    });
    api
      .get(`/vehicles?${params}`)
      .then(({ data }) => {
        const list = (data.vehicles || []).slice(0, 6);
        setVehicles(list);
      })
      .catch(() => setVehicles([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section ref={stripRef} className="relative py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal className="text-center mb-14">
          <motion.div style={{ x: headingX }}>
          <span className="inline-flex items-center gap-2 text-brand-cyan text-sm font-medium mb-3">
            <Sparkles size={16} /> Curated Fleet
          </span>
          <h2 className="font-syne font-bold text-4xl md:text-5xl text-white">
            Featured <span className="text-gradient-cyan">Vehicles</span>
          </h2>
          <p className="text-gray-400 mt-4 max-w-xl mx-auto">
            Hand-picked rides from our Bengaluru fleet — hover to explore in 3D.
          </p>
          </motion.div>
        </ScrollReveal>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-2xl" />
            ))}
          </div>
        ) : vehicles.length === 0 ? (
          <p className="text-center text-gray-500">No vehicles available right now.</p>
        ) : (
          <motion.div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6" style={{ y: gridY }}>
            {vehicles.map((v, i) => (
              <ScrollReveal key={v.id} delay={i * 0.08}>
                <TiltCard className="relative h-full">
                  <Suspense fallback={<Skeleton className="h-80 rounded-2xl" />}>
                    <VehicleCard vehicle={v} index={0} />
                  </Suspense>
                </TiltCard>
              </ScrollReveal>
            ))}
          </motion.div>
        )}

        <ScrollReveal className="text-center mt-12" delay={0.2}>
          <Link to="/vehicles" className="hero-cta-outline inline-flex items-center gap-2">
            View Full Fleet <ArrowRight size={18} />
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}

export default memo(FeaturedVehicles);
