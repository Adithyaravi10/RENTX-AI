import { memo, useRef } from 'react';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
const HERO_DRIFT_SRC = '/hero/gt3-drift.png';

const BEATS = [
  { k: '01', t: 'Enter the tunnel', d: 'The 911 GT3 is already sideways — you just catch up.' },
  { k: '02', t: 'Hold the slide', d: 'Camera locked on the wing while the wall screams past.' },
  { k: '03', t: 'Book the night', d: 'This is not a poster. It is a key, waiting in Bengaluru.' },
];

function CinematicGarage() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  });
  const p = useSpring(scrollYProgress, { stiffness: 85, damping: 26, mass: 0.4 });

  const carX = useTransform(p, [0, 0.45, 1], ['28%', '-8%', '-42%']);
  const carScale = useTransform(p, [0, 0.4, 0.75, 1], [1.15, 1.35, 1.55, 1.2]);
  const carY = useTransform(p, [0, 0.5, 1], ['6%', '0%', '-4%']);
  const rot = useTransform(p, [0, 1], [-2, 3]);
  const wallX = useTransform(p, [0, 1], ['0%', '-35%']);
  const mask = useTransform(
    p,
    [0, 0.08, 0.92, 1],
    ['inset(12% 8% 12% 8% round 32px)', 'inset(0% 0% 0% 0%)', 'inset(0% 0% 0% 0%)', 'inset(6% 4% 10% 4% round 28px)']
  );

  const b0 = useTransform(p, [0, 0.08, 0.28, 0.36], [0, 1, 1, 0]);
  const b1 = useTransform(p, [0.32, 0.4, 0.62, 0.7], [0, 1, 1, 0]);
  const b2 = useTransform(p, [0.66, 0.74, 0.92, 1], [0, 1, 1, 0]);
  const ops = [b0, b1, b2];
  const slide = useTransform(p, [0, 1], [40, -20]);

  return (
    <section ref={ref} className="relative h-[320vh] bg-[#07070a]">
      <div className="sticky top-0 h-screen overflow-hidden">
        <motion.div className="absolute inset-0" style={{ clipPath: mask }}>
          <motion.div className="cinematic-tunnel-bands cinematic-tunnel-bands--slow absolute inset-0" style={{ x: wallX }} />
          <motion.img
            src={HERO_DRIFT_SRC}
            alt=""
            draggable={false}
            className="absolute top-[-10%] left-0 h-[120%] w-[160%] max-w-none object-cover object-center select-none pointer-events-none cinematic-car-layer"
            style={{ x: carX, y: carY, scale: carScale, rotate: rot }}
          />
          <div className="cinematic-smoke cinematic-smoke--thin absolute inset-0" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/25 to-transparent" />
        </motion.div>

        <div className="relative z-10 h-full max-w-7xl mx-auto px-6 md:px-10 flex items-center">
          <div className="relative w-full max-w-md min-h-[220px]">
            {BEATS.map((beat, i) => (
              <motion.div
                key={beat.k}
                className="absolute inset-0"
                style={{ opacity: ops[i], y: slide }}
              >
                <p className="text-brand-cyan tracking-[0.4em] text-xs uppercase mb-4">{beat.k}</p>
                <h3 className="font-syne font-bold text-4xl md:text-5xl text-white leading-tight">{beat.t}</h3>
                <p className="text-gray-400 mt-4 text-base md:text-lg">{beat.d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default memo(CinematicGarage);
