import { useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import styles from './Loader.module.css';
import sweep from '../ui/buttonSweep.module.css';
import micorGraphics from '../../assets/micorGraphics.svg';
import isaacSpeak from '../../assets/isaac_speak.mp3';

const MotionDiv = motion.div;

export default function MicroGraphics({ delay = 0 }) {
  const audioRef = useRef(null);

  const handleSpeakerClick = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(isaacSpeak);
    }
    const audio = audioRef.current;
    audio.currentTime = 0;
    audio.play();
  }, []);

  return (
    <MotionDiv
      className={styles.microCard}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94], delay }}
    >
      <div className={styles.microCardInner}>
        <img
          src={micorGraphics}
          alt=""
          className={styles.microCardImage}
        />
        <button
          className={`${styles.speakerHit} ${sweep.sweepBtn} ${sweep.sweepLoaderGhost}`}
          onClick={handleSpeakerClick}
          aria-label="Play pronunciation"
          type="button"
        />
      </div>
    </MotionDiv>
  );
}
