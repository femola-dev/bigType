import {
  useState,
  useCallback,
  useRef,
  useLayoutEffect,
  useEffect,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Loader from './components/Loader/Loader';
import Hero from './components/Hero/Hero';
import CaseStudies from './components/CaseStudies/CaseStudies';
import Footer from './components/Footer/Footer';
import mainImg from './assets/hero/mainImg.png';

const EASE_SMOOTH = [0.76, 0, 0.24, 1];
const MORPH_DURATION = 1.4;
const MotionDiv = motion.div;
const MotionP = motion.p;
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const lerp = (from, to, progress) => from + (to - from) * progress;

const HERO_TITLE_MEASURE = {
  position: 'absolute',
  left: '50%',
  top: '7.41vh',
  transform: 'translateX(-50%)',
  width: 'max-content',
  maxWidth: '96vw',
  fontFamily: "'Inter', sans-serif",
  fontFeatureSettings: "'liga' 1, 'calt' 1, 'salt' 1",
  fontWeight: 800,
  fontSize: 'clamp(120px, 17.97vw, 345px)',
  lineHeight: 1,
  letterSpacing: '-0.06em',
  whiteSpace: 'nowrap',
  margin: 0,
  visibility: 'hidden',
  pointerEvents: 'none',
};

function MorphTitle({ morphData, isTransitioning, phase, onComplete }) {
  const measureRef = useRef(null);
  const [target, setTarget] = useState(null);
  const heroTopPx = typeof window !== 'undefined' ? window.innerHeight * 0.0741 : 80;

  useLayoutEffect(() => {
    if (!measureRef.current) return;
    const measure = () => {
      requestAnimationFrame(() => {
        if (!measureRef.current) return;
        const rect = measureRef.current.getBoundingClientRect();
        const fontSize = parseFloat(
          window.getComputedStyle(measureRef.current).fontSize
        );
        setTarget({ y: rect.top, fontSize });
      });
    };
    measure();
  }, []);

  if (!target) {
    return (
      <p ref={measureRef} style={HERO_TITLE_MEASURE}>
        OLUWAFEMI
      </p>
    );
  }

  return (
    <MotionDiv
      key="morph-title"
      style={{
        position: phase === 'hero' ? 'absolute' : 'fixed',
        left: 0,
        right: 0,
        top: 0,
        display: 'flex',
        justifyContent: 'center',
        paddingTop: heroTopPx,
        zIndex: phase === 'transitioning' ? 100 : 1,
        pointerEvents: 'none',
      }}
      exit={{ opacity: 0 }}
      transition={{ exit: { duration: 0.25, ease: EASE_SMOOTH } }}
    >
      <MotionP
        style={{
          fontFamily: "'Inter', sans-serif",
          fontFeatureSettings: "'liga' 1, 'calt' 1, 'salt' 1",
          fontWeight: 800,
          lineHeight: 1,
          letterSpacing: '-0.06em',
          color: '#000',
          whiteSpace: 'nowrap',
          margin: 0,
          willChange: 'transform',
        }}
        initial={{
          y: morphData.top - heroTopPx,
          fontSize: morphData.fontSize,
          opacity: 1,
        }}
        animate={{
          y: target.y - heroTopPx,
          fontSize: target.fontSize,
          opacity: 1,
        }}
        transition={{
          duration: MORPH_DURATION,
          ease: EASE_SMOOTH,
        }}
        onAnimationComplete={() => {
          if (isTransitioning) onComplete();
        }}
      >
        OLUWAFEMI
      </MotionP>
    </MotionDiv>
  );
}

export default function App() {
  const [phase, setPhase] = useState('loading');
  const nameRef = useRef(null);
  const [morphData, setMorphData] = useState(null);
  const heroImageRef = useRef(null);
  const caseSectionRef = useRef(null);
  const caseLogoRef = useRef(null);
  const [logoMorph, setLogoMorph] = useState({
    progress: 0,
    fromRect: null,
    toRect: null,
  });
  const morphDistanceRef = useRef(1);

  const handleLoaderComplete = useCallback(() => {
    if (nameRef.current) {
      const rect = nameRef.current.getBoundingClientRect();
      const fontSize = parseFloat(
        window.getComputedStyle(nameRef.current).fontSize
      );
      setMorphData({ top: rect.top, left: rect.left, width: rect.width, fontSize });
      setPhase('transitioning');
    } else {
      setPhase('hero');
    }
  }, []);

  useLayoutEffect(() => {
    if (phase === 'loading') return;

    const updateMeasurements = () => {
      if (!heroImageRef.current || !caseLogoRef.current || !caseSectionRef.current) {
        return;
      }

      const heroRect = heroImageRef.current.getBoundingClientRect();
      const logoRect = caseLogoRef.current.getBoundingClientRect();
      const caseTop =
        caseSectionRef.current.getBoundingClientRect().top + window.scrollY;

      morphDistanceRef.current = Math.max(1, caseTop - 120);

      setLogoMorph((prev) => ({
        ...prev,
        fromRect: {
          left: heroRect.left,
          top: heroRect.top,
          width: heroRect.width,
          height: heroRect.height,
        },
        toRect: {
          left: logoRect.left,
          top: logoRect.top,
          width: logoRect.width,
          height: logoRect.height,
        },
      }));
    };

    updateMeasurements();
    /* Re-measure after paint to catch layout shifts (e.g. images loaded) */
    const raf = requestAnimationFrame(() => updateMeasurements());
    window.addEventListener('resize', updateMeasurements);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', updateMeasurements);
    };
  }, [phase]);

  useEffect(() => {
    if (phase === 'loading') return;

    const updateProgress = () => {
      const progress = clamp(window.scrollY / morphDistanceRef.current, 0, 1);
      setLogoMorph((prev) => ({ ...prev, progress }));
    };

    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);

    return () => {
      window.removeEventListener('scroll', updateProgress);
      window.removeEventListener('resize', updateProgress);
    };
  }, [phase]);

  const morphInProgress =
    phase === 'hero' && logoMorph.progress > 0.01 && logoMorph.progress < 0.999;
  const canRenderMorphLogo =
    morphInProgress && logoMorph.fromRect && logoMorph.toRect;
  const headerProgress = phase === 'hero' ? logoMorph.progress : 0;

  const morphLogoStyle =
    canRenderMorphLogo && logoMorph.fromRect && logoMorph.toRect
      ? {
          left: lerp(
            logoMorph.fromRect.left,
            logoMorph.toRect.left,
            logoMorph.progress
          ),
          top: lerp(
            logoMorph.fromRect.top,
            logoMorph.toRect.top,
            logoMorph.progress
          ),
          width: lerp(
            logoMorph.fromRect.width,
            logoMorph.toRect.width,
            logoMorph.progress
          ),
          height: lerp(
            logoMorph.fromRect.height,
            logoMorph.toRect.height,
            logoMorph.progress
          ),
          borderRadius: `${lerp(0, 999, logoMorph.progress)}px`,
        }
      : null;

  return (
    <div
      style={{
        position: 'relative',
        width: '100vw',
        background: '#fff',
        overflowX: 'clip',
      }}
    >
      <AnimatePresence>
        {phase === 'loading' && (
          <MotionDiv
            key="loader"
            style={{ position: 'fixed', inset: 0, zIndex: 10 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: EASE_SMOOTH }}
          >
            <Loader onComplete={handleLoaderComplete} nameRef={nameRef} />
          </MotionDiv>
        )}
      </AnimatePresence>

      {phase !== 'loading' && (
        <main>
          <div style={{ minHeight: '100vh' }}>
            <Hero
              hideTitle={phase === 'transitioning' || (phase === 'hero' && !!morphData)}
              imageRef={heroImageRef}
              hideMainImage={morphInProgress}
            />
          </div>
          <CaseStudies
            sectionRef={caseSectionRef}
            logoRef={caseLogoRef}
            headerProgress={headerProgress}
            hideAvatar={morphInProgress}
          />
          <Footer />
        </main>
      )}

      <AnimatePresence mode="wait">
        {(phase === 'transitioning' || (phase === 'hero' && morphData)) && morphData && (
          <MorphTitle
            morphData={morphData}
            isTransitioning={phase === 'transitioning'}
            phase={phase}
            onComplete={() => setPhase('hero')}
          />
        )}
      </AnimatePresence>

      {morphLogoStyle && (
        <div
          style={{
            position: 'fixed',
            left: morphLogoStyle.left,
            top: morphLogoStyle.top,
            width: morphLogoStyle.width,
            height: morphLogoStyle.height,
            borderRadius: morphLogoStyle.borderRadius,
            overflow: 'hidden',
            zIndex: 30,
            pointerEvents: 'none',
            willChange: 'left, top, width, height, border-radius',
          }}
        >
          <img
            src={mainImg}
            alt=""
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center top',
            }}
          />
        </div>
      )}
    </div>
  );
}
