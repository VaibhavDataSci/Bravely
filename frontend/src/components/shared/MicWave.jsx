import React, { useState, useEffect, useRef } from 'react';
import { C } from '../../constants/theme';

const MicWave = ({ active = false }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 3, height: 36 }}>
    {Array.from({ length: 9 }).map((_, i) => (
      <div key={i} style={{
        width: 3, borderRadius: 2,
        background: active ? `linear-gradient(to top, ${C.cyan}, ${C.violetBright})` : C.textMuted,
        height: active ? undefined : 6,
        animation: active ? `wave ${0.4 + i * 0.08}s ease-in-out infinite alternate` : 'none',
        transition: 'all 0.3s',
        '--target-h': `${30 + Math.sin(i) * 15}px`,
        minHeight: active ? 4 : 6,
        maxHeight: active ? 32 : 6,
      }} />
    ))}
  </div>
);

// Score ring

export { MicWave };
