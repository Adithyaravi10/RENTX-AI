import { memo } from 'react';
import { motion } from 'framer-motion';

const PARTICLES = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  x: `${(i * 17 + 5) % 100}%`,
  y: `${(i * 23 + 11) % 100}%`,
  size: 2 + (i % 4),
  duration: 4 + (i % 6),
  delay: (i % 8) * 0.3,
}));

const SHAPES = [
  { w: 120, h: 120, x: '8%', y: '20%', rotate: 15, delay: 0 },
  { w: 80, h: 80, x: '85%', y: '15%', rotate: -20, delay: 0.5 },
  { w: 60, h: 60, x: '75%', y: '70%', rotate: 45, delay: 1 },
  { w: 100, h: 100, x: '12%', y: '75%', rotate: -10, delay: 0.8 },
];

function HeroBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      <div className="absolute inset-0 bg-gradient-to-b from-brand-violet/15 via-brand-dark to-brand-dark" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(0,212,255,0.18),transparent)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_80%_50%,rgba(124,58,237,0.12),transparent)]" />

      {/* Animated grid floor */}
      <div className="hero-grid-floor absolute bottom-0 left-0 right-0 h-[45%] opacity-30" />

      {SHAPES.map((s, i) => (
        <motion.div
          key={i}
          className="absolute rounded-2xl border border-brand-cyan/10 bg-brand-cyan/[0.03] backdrop-blur-sm"
          style={{ width: s.w, height: s.h, left: s.x, top: s.y }}
          animate={{
            y: [0, -18, 0],
            rotate: [s.rotate, s.rotate + 8, s.rotate],
          }}
          transition={{ duration: 8 + i, repeat: Infinity, ease: 'easeInOut', delay: s.delay }}
        />
      ))}

      {PARTICLES.map((p) => (
        <motion.span
          key={p.id}
          className="absolute rounded-full bg-brand-cyan/40"
          style={{ left: p.x, top: p.y, width: p.size, height: p.size }}
          animate={{ opacity: [0.2, 0.8, 0.2], y: [0, -30, 0] }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }}
        />
      ))}

      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-brand-cyan/[0.04] blur-[100px]" />
    </div>
  );
}

export default memo(HeroBackground);
