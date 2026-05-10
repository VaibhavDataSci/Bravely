"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { C } from '../../constants/theme';

// ─── PARTICLE BACKGROUND ─────────────────────────────────────────────────────
const ParticlesBg = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Generate stable random values once on client mount — never during SSR
  const particles = useMemo(() => {
    if (typeof window === 'undefined') return [];
    return Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      width:  Math.random() > 0.5 ? 2 : 1,
      height: Math.random() > 0.5 ? 2 : 1,
      color:  i % 3 === 0 ? C.cyan : i % 3 === 1 ? C.violetBright : '#ffffff',
      left:   `${Math.random() * 100}%`,
      duration: `${8 + Math.random() * 12}s`,
      delay:    `${Math.random() * 10}s`,
      dx:       `${(Math.random() - 0.5) * 100}px`,
    }));
  }, []); // empty deps → computed once, stable forever

  // Don't render anything during SSR — avoids hydration mismatch entirely
  if (!mounted) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      {particles.map((p) => (
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
      {/* Grid lines */}
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
