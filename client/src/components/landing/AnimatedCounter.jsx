import { memo, useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

function parseStatValue(raw) {
  const str = String(raw);
  const match = str.match(/^([\d.]+)(.*)$/);
  if (!match) return { target: 0, suffix: str, decimals: 0 };
  const num = parseFloat(match[1]);
  const suffix = match[2] || '';
  const decimals = (match[1].split('.')[1] || '').length;
  return { target: num, suffix, decimals };
}

function AnimatedCounter({ value, duration = 2, className = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const { target, suffix, decimals } = parseStatValue(value);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = null;
    let raf;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / (duration * 1000), 1);
      const eased = 1 - (1 - p) ** 3;
      setDisplay(target * eased);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, target, duration]);

  const formatted =
    decimals > 0 ? display.toFixed(decimals) : Math.floor(display).toLocaleString();

  return (
    <motion.span ref={ref} className={className}>
      {formatted}
      {suffix}
    </motion.span>
  );
}

export default memo(AnimatedCounter);
