import { useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import styles from './Hero.module.css';
import sweep from '../ui/buttonSweep.module.css';
import HeroImage from './HeroImage';
import mainImg from '../../assets/hero/mainImg.png';
import iconVolume from '../../assets/hero/iconVolume.svg';
import iconCopy from '../../assets/hero/iconCopy.svg';
import iconArrowUpRight from '../../assets/hero/iconArrowUpRight.svg';
import iconArrowDown from '../../assets/hero/iconArrowDown.svg';
import isaacSpeak from '../../assets/isaac_speak.mp3';

const EASE = [0.25, 0.46, 0.45, 0.94];
const MotionP = motion.p;
const MotionDiv = motion.div;

export default function Hero({
  hideTitle = false,
  imageRef = null,
  hideMainImage = false,
}) {
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
      <MotionP
        className={styles.title}
        initial={false}
        animate={{ opacity: hideTitle ? 0 : 1 }}
        transition={{
          duration: hideTitle ? 0 : 0.4,
          ease: EASE,
          delay: hideTitle ? 0 : 0.05,
        }}
        style={{ pointerEvents: hideTitle ? 'none' : 'auto' }}
      >
        OLUWAFEMI
      </MotionP>

      <HeroImage
        src={mainImg}
        alt="Oluwafemi Isaac"
        delay={0.2}
        imageRef={imageRef}
        hidden={hideMainImage}
      />

      <div className={styles.content}>
        <MotionDiv
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
              className={`${styles.pronunciationButton} ${sweep.sweepBtn} ${sweep.sweepIconOnly}`}
              onClick={handleSpeakerClick}
              aria-label="Play pronunciation"
            >
              <span className={sweep.sweepInner}>
                <span className={sweep.sweepIconSlot}>
                  <img
                    src={iconVolume}
                    alt=""
                    className={sweep.sweepIconDark}
                  />
                  <img
                    src={iconVolume}
                    alt=""
                    aria-hidden
                    className={sweep.sweepIconLight}
                  />
                </span>
              </span>
            </button>
          </div>
          <p className={styles.bio}>
            Product designer based in Toronto, creating products that make
            complex things simple and helpful through thoughtful design.
          </p>
        </MotionDiv>

        <MotionDiv
          className={styles.actions}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.5 }}
        >
          <button
            className={`${styles.actionButton} ${sweep.sweepBtn} ${sweep.sweepHero}`}
            type="button"
          >
            <span className={sweep.sweepInner}>
              <span className={sweep.sweepIconSlot}>
                <img src={iconCopy} alt="" className={sweep.sweepIconDark} />
                <img
                  src={iconCopy}
                  alt=""
                  aria-hidden
                  className={sweep.sweepIconLight}
                />
              </span>
              <span className={sweep.labelStack}>
                <span className={sweep.sweepTextDark}>Copy email</span>
                <span className={sweep.sweepTextLight} aria-hidden>
                  Copy email
                </span>
              </span>
            </span>
          </button>
          <button
            className={`${styles.actionButton} ${sweep.sweepBtn} ${sweep.sweepHero}`}
            type="button"
          >
            <span className={sweep.sweepInner}>
              <span className={sweep.sweepIconSlot}>
                <img
                  src={iconArrowUpRight}
                  alt=""
                  className={sweep.sweepIconDark}
                />
                <img
                  src={iconArrowUpRight}
                  alt=""
                  aria-hidden
                  className={sweep.sweepIconLight}
                />
              </span>
              <span className={sweep.labelStack}>
                <span className={sweep.sweepTextDark}>View resume</span>
                <span className={sweep.sweepTextLight} aria-hidden>
                  View resume
                </span>
              </span>
            </span>
          </button>
        </MotionDiv>
      </div>

      <MotionDiv
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
      </MotionDiv>
    </div>
  );
}
