import { motion } from 'framer-motion';
import styles from './Loader.module.css';

const EASE = [0.76, 0, 0.24, 1];
const DURATION = 0.9;
const MotionP = motion.p;

function RevealLine({ text, delay, className, textRef }) {
  return (
    <div className={styles.nameLineWrapper}>
      <MotionP
        ref={textRef}
        className={`${styles.nameLine} ${className || ''}`}
        initial={{ y: '110%' }}
        animate={{ y: '0%' }}
        transition={{ duration: DURATION, ease: EASE, delay }}
      >
        {text}
      </MotionP>
    </div>
  );
}

export default function NameReveal({ delay = 0, nameRef }) {
  return (
    <div className={styles.nameBlock}>
      <RevealLine text="OLUWAFEMI" delay={delay} textRef={nameRef} />
      <RevealLine
        text="ISAAC"
        delay={delay + 0.15}
        className={styles.nameLineIsaac}
      />
    </div>
  );
}
