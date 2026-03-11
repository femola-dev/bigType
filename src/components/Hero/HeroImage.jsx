import { motion } from 'framer-motion';
import styles from './HeroImage.module.css';

const EASE = [0.25, 0.46, 0.45, 0.94];
const MotionDiv = motion.div;

export default function HeroImage({ src, alt, delay = 0.2 }) {
  return (
    <MotionDiv
      className={styles.wrapper}
      initial={{ opacity: 0, scale: 1.03 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.9, ease: EASE, delay }}
    >
      <img src={src} alt={alt} className={styles.image} />
    </MotionDiv>
  );
}
