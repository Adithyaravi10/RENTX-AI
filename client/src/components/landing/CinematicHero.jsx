import { memo, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useReducedMotion,
} from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useMouseParallax } from '../../hooks/useMouseParallax';

export const HERO_DRIFT_SRC = '/hero/gt3-drift.png';

/**
 * Scroll-driven cinematic hero.
 * Timeline (0 → 1 through a pinned 520vh stage):
 *  0.00–0.12  mask reveal, car enters from the right with motion blur
 *  0.12–0.28  title lockup slides in; camera tracks the drift
 *  0.28–0.46  zoom into taillights / GT3 badge
 *  0.46–0.62  pull back, tunnel rush, secondary copy
 *  0.62–0.78  lateral slide (shot B), specs rise
 *  0.78–1.00  settle, CTA, hand off to next section
 */
function CinematicHero({ isAuthenticated }) {
  const stageRef = useRef(null);
  const reduceMotion = useReducedMotion();
  const mouse = useMouseParallax(!reduceMotion);

  const { scrollYProgress } = useScroll({
    target: stageRef,
    offset: ['start start', 'end end'],
  });

  const progress = useSpring(scrollYProgress, {
    stiffness: reduceMotion ? 400 : 90,
    damping: reduceMotion ? 40 : 28,
    mass: 0.35,
  });

  const mouseX = useSpring(0, { stiffness: 60, damping: 18 });
  const mouseY = useSpring(0, { stiffness: 60, damping: 18 });

  useEffect(() => {
    mouseX.set(mouse.x * 18);
    mouseY.set(mouse.y * 12);
  }, [mouse.x, mouse.y, mouseX, mouseY]);

  /* ── Shot A: full rear-three-quarter tracking ── */
  const shotAScale = useTransform(progress, [0, 0.12, 0.28, 0.42, 0.5], [1.55, 1.38, 1.18, 1.72, 2.05]);
  const shotAX = useTransform(progress, [0, 0.12, 0.28, 0.42, 0.5], ['22%', '8%', '-2%', '-10%', '-16%']);
  const shotAY = useTransform(progress, [0, 0.12, 0.28, 0.42, 0.5], ['10%', '4%', '2%', '14%', '20%']);
  const shotARot = useTransform(progress, [0, 0.2, 0.42, 0.5], [-3.2, -1.2, 1.4, 2.2]);
  const shotAOp = useTransform(progress, [0.42, 0.52], [1, 0]);

  /* ── Shot B: tighter wing / badge crop, then pull-out ── */
  const shotBScale = useTransform(progress, [0.46, 0.62, 0.78, 0.94], [1.9, 1.35, 1.22, 1.08]);
  const shotBX = useTransform(progress, [0.46, 0.62, 0.78, 0.94], ['6%', '-12%', '4%', '0%']);
  const shotBY = useTransform(progress, [0.46, 0.62, 0.78, 0.94], ['8%', '0%', '-4%', '0%']);
  const shotBRot = useTransform(progress, [0.46, 0.7, 0.94], [1.5, -1.8, 0]);
  const shotBOp = useTransform(progress, [0.42, 0.52, 0.96, 1], [0, 1, 1, 0.85]);

  const clipReveal = useTransform(
    progress,
    [0, 0.08, 0.96, 1],
    ['inset(0% 0% 0% 0%)', 'inset(0% 0% 0% 0%)', 'inset(0% 0% 0% 0%)', 'inset(2% 1% 4% 1%)']
  );

  const blurAmt = useTransform(progress, [0, 0.06, 0.14, 0.4, 0.48, 0.7, 0.9], [6, 1.5, 0, 1.5, 6, 0, 0.5]);
  const imgFilter = useTransform(blurAmt, (b) => `blur(${b}px) contrast(1.08) saturate(1.12)`);

  const tunnelX = useTransform(progress, [0, 1], ['0%', '-45%']);
  const streakX = useTransform(progress, [0, 1], ['0%', '-70%']);
  const smokeX = useTransform(progress, [0, 1], ['8%', '-18%']);
  const vignette = useTransform(progress, [0, 0.15, 0.85, 1], [0.85, 0.35, 0.4, 0.7]);

  const introOp = useTransform(progress, [0, 0.04, 0.1], [1, 1, 0]);
  const titleOp = useTransform(progress, [0.06, 0.12, 0.28, 0.34], [0, 1, 1, 0]);
  const titleY = useTransform(progress, [0.06, 0.14, 0.34], [72, 0, -40]);
  const titleScale = useTransform(progress, [0.08, 0.16, 0.34], [0.82, 1, 1.08]);

  const lineOp = useTransform(progress, [0.12, 0.18, 0.3, 0.36], [0, 1, 1, 0]);
  const lineX = useTransform(progress, [0.12, 0.2], [-80, 0]);

  const zoomCapOp = useTransform(progress, [0.38, 0.44, 0.54, 0.6], [0, 1, 1, 0]);
  const zoomCapY = useTransform(progress, [0.38, 0.46], [48, 0]);

  const midOp = useTransform(progress, [0.56, 0.64, 0.76, 0.82], [0, 1, 1, 0]);
  const midX = useTransform(progress, [0.56, 0.66], [90, 0]);

  const specOp = useTransform(progress, [0.62, 0.7, 0.8, 0.86], [0, 1, 1, 0]);
  const specY = useTransform(progress, [0.62, 0.72], [60, 0]);

  const ctaOp = useTransform(progress, [0.78, 0.88, 0.98], [0, 1, 1]);
  const ctaY = useTransform(progress, [0.78, 0.9], [50, 0]);
  const ctaScale = useTransform(progress, [0.78, 0.9], [0.92, 1]);

  const scrollHintOp = useTransform(progress, [0, 0.08, 0.14], [1, 0.6, 0]);

  return (
    <section ref={stageRef} className="relative h-[520vh]" aria-label="Cinematic 911 GT3 film">
      <div className="cinematic-sticky sticky top-0 h-screen overflow-hidden bg-[#0a0a0c]">
        <motion.div className="absolute inset-0" style={{ clipPath: clipReveal }}>
          {/* Tunnel rush — independent parallax bands */}
          <motion.div className="cinematic-tunnel-bands absolute inset-0" style={{ x: tunnelX }} />
          <motion.div className="cinematic-speed-streaks absolute inset-0 opacity-50" style={{ x: streakX }} />

          {/* Shot A */}
          <motion.div
            className="absolute inset-0 will-change-transform"
            style={{
              scale: shotAScale,
              x: shotAX,
              y: shotAY,
              rotate: shotARot,
              opacity: shotAOp,
              filter: imgFilter,
            }}
          >
            <motion.img
              src={HERO_DRIFT_SRC}
              alt=""
              aria-hidden
              draggable={false}
              loading="eager"
              className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none cinematic-car-layer"
              style={{ x: mouseX, y: mouseY }}
            />
          </motion.div>

          {/* Shot B — same still, different camera */}
          <motion.div
            className="absolute inset-0 will-change-transform"
            style={{
              scale: shotBScale,
              x: shotBX,
              y: shotBY,
              rotate: shotBRot,
              opacity: shotBOp,
            }}
          >
            <motion.img
              src={HERO_DRIFT_SRC}
              alt="Porsche 911 GT3 drifting through a tunnel"
              draggable={false}
              className="absolute inset-0 w-full h-full object-cover object-[58%_62%] select-none pointer-events-none cinematic-car-layer"
              style={{ x: mouseX, y: mouseY }}
            />
          </motion.div>

          <motion.div className="cinematic-smoke absolute inset-0" style={{ x: smokeX }} />
          <div className="cinematic-sparks" aria-hidden />
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              opacity: vignette,
              background:
                'radial-gradient(ellipse 70% 60% at 55% 55%, transparent 30%, rgba(0,0,0,0.72) 100%)',
            }}
          />
          <div className="cinematic-red-glow" />
        </motion.div>

        {/* Intro plate */}
        <motion.div
          className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
          style={{ opacity: introOp }}
        >
          <p className="font-syne tracking-[0.55em] text-xs md:text-sm text-white/70 uppercase">
            RentX AI
          </p>
        </motion.div>

        {/* Title lockup */}
        <motion.div
          className="absolute z-10 left-6 md:left-16 bottom-[18%] md:bottom-[22%] max-w-2xl pointer-events-none"
          style={{ opacity: titleOp, y: titleY, scale: titleScale }}
        >
          <p className="text-brand-cyan text-xs md:text-sm tracking-[0.4em] uppercase mb-3">911 GT3</p>
          <h1 className="font-syne font-extrabold text-white leading-[0.9] text-5xl sm:text-6xl md:text-8xl">
            Drift
            <br />
            the curve
          </h1>
        </motion.div>

        <motion.p
          className="absolute z-10 left-6 md:left-16 bottom-[10%] md:bottom-[14%] text-gray-300 text-sm md:text-lg max-w-md pointer-events-none"
          style={{ opacity: lineOp, x: lineX }}
        >
          Precision engineered. Available tonight on RentX.
        </motion.p>

        {/* Zoom caption */}
        <motion.div
          className="absolute z-10 right-6 md:right-16 top-[28%] text-right pointer-events-none"
          style={{ opacity: zoomCapOp, y: zoomCapY }}
        >
          <p className="font-syne text-white/90 text-2xl md:text-4xl font-bold">Rear wing</p>
          <p className="text-brand-cyan tracking-[0.3em] uppercase text-xs mt-2">Locked · 9,000 rpm</p>
        </motion.div>

        {/* Mid copy */}
        <motion.div
          className="absolute z-10 left-6 md:left-20 top-[30%] max-w-lg pointer-events-none"
          style={{ opacity: midOp, x: midX }}
        >
          <h2 className="font-syne font-bold text-4xl md:text-6xl text-white leading-tight">
            Cinematic
            <br />
            <span className="text-gradient-cyan">performance</span>
          </h2>
        </motion.div>

        <motion.ul
          className="absolute z-10 right-6 md:right-16 bottom-[24%] space-y-3 text-right pointer-events-none"
          style={{ opacity: specOp, y: specY }}
        >
          {[
            ['503 hp', 'Naturally aspirated'],
            ['3.4 s', '0–100 km/h'],
            ['318 km/h', 'Vmax'],
          ].map(([stat, label]) => (
            <li key={stat}>
              <p className="font-syne text-3xl md:text-4xl text-white font-bold">{stat}</p>
              <p className="text-xs tracking-[0.25em] uppercase text-gray-400">{label}</p>
            </li>
          ))}
        </motion.ul>

        {/* CTA */}
        <motion.div
          className="absolute z-20 left-6 md:left-16 bottom-16 md:bottom-20 flex flex-col sm:flex-row gap-4"
          style={{ opacity: ctaOp, y: ctaY, scale: ctaScale }}
        >
          <Link to={isAuthenticated ? '/vehicles' : '/register'} className="hero-cta-primary group cinematic-cta">
            Rent this machine
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link to="/vehicles" className="hero-cta-outline cinematic-cta">
            Explore fleet
          </Link>
        </motion.div>

        <motion.div
          className="absolute z-10 bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[10px] tracking-[0.35em] uppercase text-white/50"
          style={{ opacity: scrollHintOp }}
        >
          <span>Scroll</span>
          <span className="cinematic-scroll-line" />
        </motion.div>
      </div>
    </section>
  );
}

export default memo(CinematicHero);
