import { useMemo } from 'react';
import styles from './Footer.module.css';
import shot01 from '../../assets/shot01.png';
import shot02 from '../../assets/shot02.png';
import shot03 from '../../assets/shot03.png';
import shot04 from '../../assets/shot04.png';
import shot05 from '../../assets/shot05.png';
import FemolaaaSvg from '../../assets/Femolaaa.svg';

/* Figma: shot01 (mask), shot02 radius 9, shot03 radius 12, shot04 radius 8, shot05 no radius */
const ARCHIVE_IMAGES = [
  { src: shot01, alt: 'Shot 1', radius: 12 },
  { src: shot02, alt: 'Shot 2', radius: 9 },
  { src: shot03, alt: 'Shot 3', radius: 12 },
  { src: shot04, alt: 'Shot 4', radius: 8 },
  { src: shot05, alt: 'Shot 5', radius: 0 },
];

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
        <img
          src={FemolaaaSvg}
          alt="FEMOLAAA"
          className={styles.brandSvg}
        />
      </div>
    </footer>
  );
}
