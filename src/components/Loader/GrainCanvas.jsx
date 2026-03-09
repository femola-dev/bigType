import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const FRAME_COUNT = 6;
const PATTERN_SIZE = 128;
const GRAIN_FPS = 12;

export default function GrainCanvas({ delay = 0 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const frames = [];
    for (let f = 0; f < FRAME_COUNT; f++) {
      const offscreen = document.createElement('canvas');
      offscreen.width = PATTERN_SIZE;
      offscreen.height = PATTERN_SIZE;
      const offCtx = offscreen.getContext('2d');
      const imageData = offCtx.createImageData(PATTERN_SIZE, PATTERN_SIZE);
      const d = imageData.data;
      for (let i = 0; i < d.length; i += 4) {
        const v = Math.random() * 255;
        d[i] = v;
        d[i + 1] = v;
        d[i + 2] = v;
        d[i + 3] = 255;
      }
      offCtx.putImageData(imageData, 0, 0);
      frames.push(offscreen);
    }

    let animationId;
    let frameIndex = 0;
    let lastTime = 0;
    const interval = 1000 / GRAIN_FPS;

    const animate = (timestamp) => {
      animationId = requestAnimationFrame(animate);
      if (timestamp - lastTime < interval) return;
      lastTime = timestamp;

      const pattern = ctx.createPattern(frames[frameIndex], 'repeat');
      ctx.fillStyle = pattern;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      frameIndex = (frameIndex + 1) % FRAME_COUNT;
    };

    resize();
    window.addEventListener('resize', resize);
    animationId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <motion.canvas
      ref={canvasRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.04 }}
      transition={{ duration: 0.8, delay }}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 10,
      }}
    />
  );
}
