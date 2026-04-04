import { motion } from 'framer-motion';
import styles from './HeroImage.module.css';

const EASE = [0.25, 0.46, 0.45, 0.94];
const MotionDiv = motion.div;

export default function HeroImage({
  src,
  alt,
  delay = 0.2,
  imageRef = null,
  hidden = false,
}) {
  return (
    <MotionDiv
      ref={imageRef}
      className={styles.wrapper}
      initial={{ opacity: 0, scale: 1.03 }}
      animate={{ opacity: hidden ? 0 : 1, scale: 1 }}
      transition={
        hidden
          ? { duration: 0.15, ease: EASE }
          : { duration: 0.9, ease: EASE, delay }
      }
    >
      <img src={src} alt={alt} className={styles.image} />
    </MotionDiv>
  );
}
