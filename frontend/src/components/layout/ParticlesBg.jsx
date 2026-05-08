"use client";
import React, { useState, useEffect, useRef } from 'react';
import { C } from '../../constants/theme';

// ─── PARTICLE BACKGROUND ─────────────────────────────────────────────────────
const ParticlesBg = () => (
  <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
    {Array.from({ length: 20 }).map((_, i) => (
      <div key={i} style={{
        position: 'absolute',
        width: Math.random() > 0.5 ? 2 : 1,
        height: Math.random() > 0.5 ? 2 : 1,
        borderRadius: '50%',
        background: i % 3 === 0 ? C.cyan : i % 3 === 1 ? C.violetBright : '#ffffff',
        left: `${Math.random() * 100}%`,
        animation: `particle-float ${8 + Math.random() * 12}s ease-in-out infinite`,
        animationDelay: `${Math.random() * 10}s`,
        '--dx': `${(Math.random() - 0.5) * 100}px`,
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

// ─── PAGE 1: LANDING ─────────────────────────────────────────────────────────

export { ParticlesBg };
