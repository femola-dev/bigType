import { useEffect } from 'react';
import { motion } from 'framer-motion';
import styles from './Loader.module.css';
import GrainCanvas from './GrainCanvas';
import PhotoCard from './PhotoCard';
import NameReveal from './NameReveal';
import MicroGraphics from './MicroGraphics';

const LOADER_DURATION_MS = 3500;
const MotionDiv = motion.div;
const MotionP = motion.p;

export default function Loader({ onComplete, nameRef }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete?.();
    }, LOADER_DURATION_MS);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className={styles.loader}>
      <div className={styles.loadingBarTrack}>
        <MotionDiv
          className={styles.loadingBarFill}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{
            duration: LOADER_DURATION_MS / 1000,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
        />
      </div>

      <GrainCanvas delay={0.2} />

      <PhotoCard delay={0.85} />

      <MotionP
        className={styles.subtitle}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.6,
          ease: [0.25, 0.46, 0.45, 0.94],
          delay: 1.05,
        }}
      >
        Product designer based in Toronto.
      </MotionP>

      <div className={styles.nameCardRow}>
        <NameReveal delay={0.45} nameRef={nameRef} />
        <MicroGraphics delay={1.25} />
      </div>
    </div>
  );
}
