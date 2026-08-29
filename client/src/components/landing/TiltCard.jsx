import { memo, useRef, useState, useCallback } from 'react';
import { motion, useSpring } from 'framer-motion';

function TiltCard({ children, className = '', maxTilt = 12, lift = 8 }) {
  const ref = useRef(null);
  const [hover, setHover] = useState(false);
  const rotateX = useSpring(0, { stiffness: 300, damping: 25 });
  const rotateY = useSpring(0, { stiffness: 300, damping: 25 });
  const scale = useSpring(1, { stiffness: 300, damping: 25 });

  const onMove = useCallback(
    (e) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const px = (e.clientX - cx) / (rect.width / 2);
      const py = (e.clientY - cy) / (rect.height / 2);
      rotateY.set(px * maxTilt);
      rotateX.set(-py * maxTilt);
    },
    [maxTilt, rotateX, rotateY]
  );

  const onEnter = () => {
    setHover(true);
    scale.set(1.02);
  };

  const onLeave = () => {
    setHover(false);
    rotateX.set(0);
    rotateY.set(0);
    scale.set(1);
  };

  return (
    <motion.div
      ref={ref}
      className={`tilt-card relative ${className}`}
      style={{
        rotateX,
        rotateY,
        scale,
        transformStyle: 'preserve-3d',
        y: hover ? -lift : 0,
      }}
      onMouseMove={onMove}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      transition={{ y: { duration: 0.3 } }}
    >
      {children}
      {hover && (
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none opacity-40"
          style={{
            background: 'radial-gradient(circle at var(--mx,50%) var(--my,50%), rgba(0,212,255,0.15), transparent 60%)',
          }}
        />
      )}
    </motion.div>
  );
}

export default memo(TiltCard);
