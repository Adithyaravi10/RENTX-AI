import { memo, useEffect } from 'react';
import { motion, useSpring } from 'framer-motion';
import { useMouseParallax } from '../../hooks/useMouseParallax';

/**
 * PLACEHOLDER HERO CAR
 * Replace HERO_CAR_SRC with:
 *   - A high-res PNG/WebP: '/hero/sports-car.png'
 *   - Or swap for React Three Fiber: import { Canvas } from '@react-three/fiber'
 *     and load GLB from '/models/sports-car.glb'
 */
export const HERO_CAR_SRC = '/hero/sports-car.svg';

function Hero3DCar() {
  const { x, y } = useMouseParallax(true);
  const rotateX = useSpring(0, { stiffness: 80, damping: 20 });
  const rotateY = useSpring(0, { stiffness: 80, damping: 20 });
  const offsetX = useSpring(0, { stiffness: 80, damping: 20 });
  const offsetY = useSpring(0, { stiffness: 80, damping: 20 });

  useEffect(() => {
    rotateX.set(-y * 6);
    rotateY.set(x * 10);
    offsetX.set(x * 18);
    offsetY.set(y * 12);
  }, [x, y, rotateX, rotateY, offsetX, offsetY]);

  return (
    <div className="relative w-full max-w-3xl mx-auto" style={{ perspective: '1200px' }}>
      <motion.div
        className="absolute bottom-[8%] left-1/2 -translate-x-1/2 w-[70%] h-16 rounded-[100%] bg-brand-cyan/20 blur-2xl"
        animate={{ scale: [1, 1.08, 1], opacity: [0.4, 0.65, 0.4] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        className="relative"
        style={{
          rotateX,
          rotateY,
          x: offsetX,
          y: offsetY,
          transformStyle: 'preserve-3d',
        }}
        animate={{ translateY: [0, -14, 0] }}
        transition={{ translateY: { duration: 5, repeat: Infinity, ease: 'easeInOut' } }}
      >
        <motion.div
          animate={{ rotateY: [0, 360] }}
          transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          <img
            src={HERO_CAR_SRC}
            alt="Premium sports car"
            className="w-full h-auto max-h-[280px] sm:max-h-[360px] md:max-h-[420px] object-contain drop-shadow-[0_40px_80px_rgba(0,212,255,0.35)] select-none"
            loading="eager"
            draggable={false}
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-brand-cyan/10 pointer-events-none" />
        </motion.div>
      </motion.div>
    </div>
  );
}

export default memo(Hero3DCar);
