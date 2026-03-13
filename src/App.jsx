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
const MORPH_DURATION = 1.2;
const MotionDiv = motion.div;
const MotionP = motion.p;
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const lerp = (from, to, progress) => from + (to - from) * progress;

const HERO_TITLE_MEASURE = {
  position: 'absolute',
  left: 0,
  width: '100%',
  top: '7.41vh',
  fontFamily: "'Inter', sans-serif",
  fontFeatureSettings: "'liga' 1, 'calt' 1, 'salt' 1",
  fontWeight: 800,
  fontSize: 'clamp(120px, 17.97vw, 345px)',
  lineHeight: 1,
  letterSpacing: '-0.06em',
  textAlign: 'center',
  whiteSpace: 'nowrap',
  margin: 0,
  visibility: 'hidden',
  pointerEvents: 'none',
};

function MorphTitle({ morphData, isTransitioning, onComplete }) {
  const measureRef = useRef(null);
  const [target, setTarget] = useState(null);

  useLayoutEffect(() => {
    if (!measureRef.current) return;
    const rect = measureRef.current.getBoundingClientRect();
    const fontSize = parseFloat(
      window.getComputedStyle(measureRef.current).fontSize
    );
    setTarget({ x: rect.left, y: rect.top, fontSize });
  }, []);

  if (!target) {
    return (
      <p ref={measureRef} style={HERO_TITLE_MEASURE}>
        OLUWAFEMI
      </p>
    );
  }

  return (
    <MotionP
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        fontFamily: "'Inter', sans-serif",
  fontFeatureSettings: "'liga' 1, 'calt' 1, 'salt' 1",
        fontWeight: 800,
        lineHeight: 1,
        letterSpacing: '-0.06em',
        color: '#000',
        whiteSpace: 'nowrap',
        margin: 0,
        zIndex: isTransitioning ? 100 : 1,
        pointerEvents: 'none',
        willChange: 'transform',
      }}
      initial={{
        x: morphData.left,
        y: morphData.top,
        fontSize: morphData.fontSize,
      }}
      animate={{
        x: target.x,
        y: target.y,
        fontSize: target.fontSize,
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
      setMorphData({ top: rect.top, left: rect.left, fontSize });
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
              hideTitle={phase === 'transitioning'}
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

      {phase === 'transitioning' && morphData && (
        <MorphTitle
          morphData={morphData}
          isTransitioning
          onComplete={() => setPhase('hero')}
        />
      )}

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
