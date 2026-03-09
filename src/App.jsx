import { useState, useCallback, useRef, useLayoutEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Loader from './components/Loader/Loader';
import Hero from './components/Hero/Hero';

const EASE_SMOOTH = [0.76, 0, 0.24, 1];
const MORPH_DURATION = 1.2;

const HERO_TITLE_MEASURE = {
  position: 'absolute',
  left: 0,
  width: '100%',
  top: '7.41vh',
  fontFamily: "'Inter', sans-serif",
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
    <motion.p
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        fontFamily: "'Inter', sans-serif",
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
    </motion.p>
  );
}

export default function App() {
  const [phase, setPhase] = useState('loading');
  const nameRef = useRef(null);
  const [morphData, setMorphData] = useState(null);

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

  return (
    <div
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        background: '#fff',
        overflow: 'hidden',
      }}
    >
      <AnimatePresence>
        {phase === 'loading' && (
          <motion.div
            key="loader"
            style={{ position: 'absolute', inset: 0, zIndex: 10 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: EASE_SMOOTH }}
          >
            <Loader onComplete={handleLoaderComplete} nameRef={nameRef} />
          </motion.div>
        )}
      </AnimatePresence>

      {phase === 'hero' && (
        <div style={{ position: 'absolute', inset: 0 }}>
          <Hero hideTitle={!!morphData} />
        </div>
      )}

      {phase !== 'loading' && morphData && (
        <MorphTitle
          morphData={morphData}
          isTransitioning={phase === 'transitioning'}
          onComplete={() => setPhase('hero')}
        />
      )}
    </div>
  );
}
