import { useMemo, useEffect, useState } from 'react';
import styles from './Footer.module.css';
import shot01 from '../../assets/shot01.png';
import shot02 from '../../assets/shot02.png';
import shot03 from '../../assets/shot03.png';
import shot04 from '../../assets/shot04.png';
import shot05 from '../../assets/shot05.png';
import { LiquidTypeCanvas } from './liquid/LiquidTypeCanvas';

/* Figma: shot01 (mask), shot02 radius 9, shot03 radius 12, shot04 radius 8, shot05 no radius */
const ARCHIVE_IMAGES = [
  { src: shot01, alt: 'Shot 1', radius: 12 },
  { src: shot02, alt: 'Shot 2', radius: 9 },
  { src: shot03, alt: 'Shot 3', radius: 12 },
  { src: shot04, alt: 'Shot 4', radius: 8 },
  { src: shot05, alt: 'Shot 5', radius: 0 },
];

function DevFooterTweak() {
  const [Panel, setPanel] = useState(null);
  useEffect(() => {
    if (!import.meta.env.DEV) return undefined;
    let cancelled = false;
    import('./liquid/FooterTweakPanel').then((m) => {
      if (!cancelled) setPanel(() => m.FooterTweakPanel);
    });
    return () => {
      cancelled = true;
    };
  }, []);
  if (!import.meta.env.DEV || !Panel) return null;
  return <Panel />;
}

export default function Footer() {
  /* Duplicate slides for seamless infinite loop animation */
  const slides = useMemo(
    () => [...ARCHIVE_IMAGES, ...ARCHIVE_IMAGES],
    []
  );

  return (
    <footer className={styles.footer} aria-label="Footer">
      <div className={styles.archiveSection}>
        <div className={styles.archiveTrack}>
          {slides.map((item, idx) => (
            <div
              key={idx}
              className={styles.archiveItem}
              style={{ '--radius': `${item.radius}px` }}
            >
              <img
                src={item.src}
                alt={`${item.alt} project`}
                className={styles.archiveImage}
              />
            </div>
          ))}
        </div>
      </div>

      <div className={styles.divider} aria-hidden="true" />

      <div className={styles.brandSection}>
        <div className={styles.liquidWrapper}>
          <LiquidTypeCanvas />
        </div>
        <DevFooterTweak />
      </div>
    </footer>
  );
}
