import React, { useState, useEffect, useRef } from 'react';
import { C } from '../../constants/theme';

const ScoreRing = ({ value, label, color = C.cyan, size = 100 }) => {
  const r = 38; const c = 2 * Math.PI * r;
  const dash = (value / 100) * c;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} viewBox="0 0 90 90" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="45" cy="45" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
          <circle cx="45" cy="45" r={r} fill="none" stroke={color} strokeWidth="6"
            strokeDasharray={`${dash} ${c}`} strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 6px ${color})`, transition: 'stroke-dasharray 1s ease' }} />
        </svg>
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: 22, fontWeight: 700, color: color, lineHeight: 1 }}>{value}</span>
          <span style={{ fontSize: 9, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>/ 100</span>
        </div>
      </div>
      <span style={{ fontSize: 12, color: C.textDim, fontWeight: 500 }}>{label}</span>
    </div>
  );
};

// Sparkline / mini bar chart

export { ScoreRing };
