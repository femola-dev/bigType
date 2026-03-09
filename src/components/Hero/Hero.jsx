import { useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import styles from './Hero.module.css';
import HeroImage from './HeroImage';
import mainImg from '../../assets/hero/mainImg.png';
import iconVolume from '../../assets/hero/iconVolume.svg';
import iconCopy from '../../assets/hero/iconCopy.svg';
import iconArrowUpRight from '../../assets/hero/iconArrowUpRight.svg';
import iconArrowDown from '../../assets/hero/iconArrowDown.svg';
import isaacSpeak from '../../assets/isaac_speak.mp3';

const EASE = [0.25, 0.46, 0.45, 0.94];

export default function Hero({ hideTitle = false }) {
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
    <div className={styles.hero}>
      {!hideTitle && (
        <motion.p
          className={styles.title}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
        >
          OLUWAFEMI
        </motion.p>
      )}

      <HeroImage src={mainImg} alt="Oluwafemi Isaac" delay={0.2} />

      <div className={styles.content}>
        <motion.div
          className={styles.contentInner}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.35 }}
        >
          <div className={styles.pronunciation}>
            <p className={styles.pronunciationText}>
              <span>ISAAC - [EYE</span>
              <span className={styles.pronunciationTextAlt}>-zak</span>
              <span>]</span>
            </p>
            <button
              type="button"
              className={styles.pronunciationButton}
              onClick={handleSpeakerClick}
              aria-label="Play pronunciation"
            >
              <img
                src={iconVolume}
                alt=""
                className={styles.pronunciationIcon}
              />
            </button>
          </div>
          <p className={styles.bio}>
            Product designer based in Toronto, creating products that make
            complex things simple and helpful through thoughtful design.
          </p>
        </motion.div>

        <motion.div
          className={styles.actions}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.5 }}
        >
          <button className={styles.actionButton} type="button">
            <div className={styles.actionButtonIcon}>
              <img
                src={iconCopy}
                alt=""
                className={styles.actionButtonIconInner}
              />
            </div>
            <span className={styles.actionButtonText}>Copy email</span>
          </button>
          <button className={styles.actionButton} type="button">
            <div className={styles.actionButtonIcon}>
              <img
                src={iconArrowUpRight}
                alt=""
                className={styles.actionButtonIconInner}
              />
            </div>
            <span className={styles.actionButtonText}>View resume</span>
          </button>
        </motion.div>
      </div>

      <motion.div
        className={styles.scrollIndicator}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: EASE, delay: 0.65 }}
      >
        <div className={styles.scrollIconBox}>
          <div className={styles.scrollIconInner}>
            <img
              src={iconArrowDown}
              alt=""
              style={{ width: '100%', height: '100%', display: 'block' }}
            />
          </div>
        </div>
        <p className={styles.scrollText}>
          Scroll down to view case studies
        </p>
      </motion.div>
    </div>
  );
}
