import { useEffect, useState, useCallback } from 'react';

/** Normalized pointer position (-1 to 1) for parallax / tilt effects */
export function useMouseParallax(enabled = true) {
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const onMove = useCallback(
    (e) => {
      if (!enabled) return;
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setPos({ x, y });
    },
    [enabled]
  );

  useEffect(() => {
    if (!enabled) return;
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, [enabled, onMove]);

  return pos;
}
