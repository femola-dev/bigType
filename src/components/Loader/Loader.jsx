import { useEffect } from 'react';
import { motion } from 'framer-motion';
import styles from './Loader.module.css';
import loadingPassport from '../../assets/Loading Passport.svg';
import warningSvg from '../../assets/Warning.svg';

const LOADER_DURATION_MS = 3500;
const EASE_REVEAL = [0.76, 0, 0.24, 1];
const EASE_SMOOTH = [0.25, 0.46, 0.45, 0.94];
const MotionDiv = motion.div;
const MotionP = motion.p;

function RevealLine({ text, delay, className, textRef }) {
  return (
    <div className={styles.nameLineWrapper}>
      <MotionP
        ref={textRef}
        className={`${styles.nameLine} ${className || ''}`}
        initial={{ y: '110%' }}
        animate={{ y: '0%' }}
        transition={{ duration: 0.9, ease: EASE_REVEAL, delay }}
      >
        {text}
      </MotionP>
    </div>
  );
}

export default function Loader({ onComplete, nameRef }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete?.();
    }, LOADER_DURATION_MS);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className={styles.loader}>
      {/* Loading bar */}
      <div className={styles.loadingBarTrack}>
        <MotionDiv
          className={styles.loadingBarFill}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{
            duration: LOADER_DURATION_MS / 1000,
            ease: EASE_SMOOTH,
          }}
        />
      </div>

      {/* Content block — flex col, holds names + quote */}
      <div className={styles.contentBlock}>
        <div className={styles.namesContainer}>
          <RevealLine text="OLUWAFEMI" delay={0.45} textRef={nameRef} />
          <RevealLine
            text="ISAAC"
            delay={0.6}
            className={styles.nameLineIsaac}
          />

          <MotionDiv
            className={styles.passport}
            initial={{ opacity: 0, scale: 0.95, y: '-50%' }}
            animate={{ opacity: 1, scale: 1, y: '-50%' }}
            transition={{ duration: 0.7, ease: EASE_SMOOTH, delay: 0.85 }}
          >
            <img
              src={loadingPassport}
              alt="Oluwafemi Isaac"
              className={styles.passportImage}
            />
          </MotionDiv>
        </div>

        <MotionP
          className={styles.quote}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE_SMOOTH, delay: 1.05 }}
        >
          ― Excellence isn't a finish line; it's the version you keep improving
        </MotionP>
      </div>

      {/* Warning badge */}
      <MotionDiv
        className={styles.warning}
        initial={{ opacity: 0, y: 20, x: '-50%' }}
        animate={{ opacity: 1, y: 0, x: '-50%' }}
        transition={{ duration: 0.6, ease: EASE_SMOOTH, delay: 1.25 }}
      >
        <img src={warningSvg} alt="" className={styles.warningImage} />
      </MotionDiv>
    </div>
  );
}
