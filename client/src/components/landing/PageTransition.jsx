import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

function PageTransition({ children }) {
  const location = useLocation();
  const isHome = location.pathname === '/';

  /* Motion transforms on this wrapper break position:sticky and useScroll. */
  if (isHome) {
    return <div className="flex-1 min-w-0">{children}</div>;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="flex-1 min-w-0"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export default memo(PageTransition);
