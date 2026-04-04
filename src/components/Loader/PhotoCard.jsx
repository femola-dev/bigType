import { motion } from 'framer-motion';
import styles from './Loader.module.css';
import imageSignature from '../../assets/imageSignature.svg';

const MotionDiv = motion.div;

export default function PhotoCard({ delay = 0 }) {
  return (
    <MotionDiv
      className={styles.photoCard}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94], delay }}
    >
      <img
        src={imageSignature}
        alt="Oluwafemi Isaac"
        className={styles.photoCardImage}
      />
    </MotionDiv>
  );
}
