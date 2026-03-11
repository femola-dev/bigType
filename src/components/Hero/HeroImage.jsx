import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import styles from './HeroImage.module.css';

// -----------------------------------------------------------------------------
// HOVER FLAG ANIMATION — how it works
// -----------------------------------------------------------------------------
// 1. Mouse enter: isHovered → true. animate runs keyframes (skewX/skewY arrays)
//    with repeat: Infinity so the image loops a gentle wave while hovered.
// 2. Mouse leave: isHovered → false. animate target becomes 0; Framer Motion
//    interpolates from the current skew to 0 over FLAG_RETURN_DURATION_S so the
//    image smoothly returns to flat instead of snapping.
// 3. All motion is transform-based (skew, scale) so there is no layout shift.
// -----------------------------------------------------------------------------

const EASE = [0.25, 0.46, 0.45, 0.94];

/** Keyframes for the flag wave (degrees): gentle skewY + slight skewX for organic feel */
const FLAG_SKEW_Y = [0, 1, 0, -1, 0];
const FLAG_SKEW_X = [0, -0.4, 0, 0.4, 0];
const FLAG_DURATION_S = 2.8;
const FLAG_RETURN_DURATION_S = 0.55;
const MotionDiv = motion.div;

function useReducedMotion() {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e) => setReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return reduced;
}

/**
 * Reusable hero portrait with a subtle flag-like skew wave on hover.
 * Smoothly returns to flat when the mouse leaves.
 */
export default function HeroImage({ src, alt, delay = 0.2 }) {
  const [isHovered, setIsHovered] = useState(false);
  const prefersReduced = useReducedMotion();

  const runFlagWave = isHovered && !prefersReduced;

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  return (
    <MotionDiv
      className={styles.wrapper}
      initial={{ opacity: 0, scale: 1.03 }}
      animate={{
        opacity: 1,
        scale: 1,
        skewX: runFlagWave ? FLAG_SKEW_X : 0,
        skewY: runFlagWave ? FLAG_SKEW_Y : 0,
      }}
      transition={{
        opacity: { duration: 0.9, ease: EASE, delay },
        scale: { duration: 0.9, ease: EASE, delay },
        skewX: runFlagWave
          ? { duration: FLAG_DURATION_S, repeat: Infinity, ease: 'easeInOut' }
          : { duration: FLAG_RETURN_DURATION_S, ease: EASE },
        skewY: runFlagWave
          ? { duration: FLAG_DURATION_S, repeat: Infinity, ease: 'easeInOut' }
          : { duration: FLAG_RETURN_DURATION_S, ease: EASE },
      }}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
    >
      <img src={src} alt={alt} className={styles.image} />
    </MotionDiv>
  );
}
