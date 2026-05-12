"use client";
import React from 'react';
import { C } from '../../constants/theme';

const particles = Array.from({ length: 20 }).map((_, i) => {
  const n = (Math.sin((i + 1) * 12.9898) * 43758.5453) % 1;
  const rand = Math.abs(n);
  return {
    id: i,
    width: i % 2 === 0 ? 2 : 1,
    height: i % 3 === 0 ? 2 : 1,
    color: i % 3 === 0 ? C.cyan : i % 3 === 1 ? C.violetBright : '#ffffff',
    left: `${((i * 17.3) + rand * 23) % 100}%`,
    duration: `${8 + (i % 7) + rand * 5}s`,
    delay: `${(i * 0.6 + rand * 3) % 10}s`,
    dx: `${((i % 5) - 2) * 20 + rand * 20}px`,
  };
});

const ParticlesBg = () => {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      {mounted && particles.map((p) => (
        <div key={p.id} style={{
          position: 'absolute',
          width: p.width,
          height: p.height,
          borderRadius: '50%',
          background: p.color,
          left: p.left,
          animation: `particle-float ${p.duration} ease-in-out infinite`,
          animationDelay: p.delay,
          '--dx': p.dx,
          opacity: 0.4,
        }} />
      ))}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.03 }} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke={C.cyan} strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    </div>
  );
};

export { ParticlesBg };
