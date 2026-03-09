import { useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import styles from './Loader.module.css';
import micorGraphics from '../../assets/micorGraphics.svg';
import isaacSpeak from '../../assets/isaac_speak.mp3';

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
    <motion.div
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
          className={styles.speakerHit}
          onClick={handleSpeakerClick}
          aria-label="Play pronunciation"
          type="button"
        />
      </div>
    </motion.div>
  );
}
