import React, { useState, useEffect, useRef } from 'react';
import { C } from '../../constants/theme';

// ─── AVATAR COMPONENT ─────────────────────────────────────────────────────────
const AIAvatar = ({ size = 280, speaking = false, style = {} }) => {
  const t = Date.now();
  return (
    <div style={{ position: 'relative', width: size, height: size, ...style }}>
      {/* Outer glow ring */}
      <div style={{
        position: 'absolute', inset: -20,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${C.violetGlow} 0%, ${C.cyanGlow} 60%, transparent 80%)`,
        animation: 'pulse-ring 3s ease-in-out infinite',
      }} />
      {/* Rotating arc */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', animation: 'rotate-slow 8s linear infinite' }} viewBox="0 0 280 280">
        <circle cx="140" cy="140" r="130" fill="none" stroke={`${C.cyan}30`} strokeWidth="1" strokeDasharray="4 8" />
        <circle cx="140" cy="140" r="130" fill="none" stroke={C.cyan} strokeWidth="2" strokeDasharray="40 200" strokeLinecap="round" />
      </svg>
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', animation: 'rotate-slow 12s linear infinite reverse' }} viewBox="0 0 280 280">
        <circle cx="140" cy="140" r="115" fill="none" stroke={`${C.violet}40`} strokeWidth="1" strokeDasharray="2 12" />
        <circle cx="140" cy="140" r="115" fill="none" stroke={C.violetBright} strokeWidth="1.5" strokeDasharray="25 180" strokeLinecap="round" />
      </svg>
      {/* Avatar face */}
      <div style={{
        position: 'absolute',
        inset: 20,
        borderRadius: '50%',
        overflow: 'hidden',
        background: `radial-gradient(ellipse at 40% 30%, #1e3a5f 0%, #0d1528 50%, #07091a 100%)`,
        border: `2px solid ${C.border}`,
        boxShadow: `inset 0 0 40px rgba(6,182,212,0.1), 0 0 40px rgba(6,182,212,0.15)`,
      }}>
        {/* Scan line */}
        <div style={{
          position: 'absolute', left: 0, right: 0, height: 2,
          background: `linear-gradient(90deg, transparent, ${C.cyan}, transparent)`,
          animation: 'scan-line 3s linear infinite',
          opacity: 0.4,
          zIndex: 10,
        }} />
        {/* Face SVG */}
        <svg viewBox="0 0 240 240" width="100%" height="100%">
          <defs>
            <radialGradient id="skinGrad" cx="50%" cy="40%">
              <stop offset="0%" stopColor="#b8c9e0" />
              <stop offset="100%" stopColor="#6b8fba" />
            </radialGradient>
            <radialGradient id="eyeGrad" cx="50%" cy="50%">
              <stop offset="0%" stopColor="#67e8f9" />
              <stop offset="60%" stopColor="#0891b2" />
              <stop offset="100%" stopColor="#0c4a6e" />
            </radialGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>
          {/* Neck */}
          <ellipse cx="120" cy="230" rx="28" ry="30" fill="url(#skinGrad)" opacity="0.8" />
          {/* Head */}
          <ellipse cx="120" cy="115" rx="72" ry="85" fill="url(#skinGrad)" />
          {/* Hair */}
          <ellipse cx="120" cy="50" rx="72" ry="42" fill="#1a2744" />
          <ellipse cx="60" cy="90" rx="15" ry="35" fill="#1a2744" />
          <ellipse cx="180" cy="90" rx="15" ry="35" fill="#1a2744" />
          {/* Eye sockets */}
          <ellipse cx="94" cy="115" rx="20" ry="18" fill="#0d1a2e" />
          <ellipse cx="146" cy="115" rx="20" ry="18" fill="#0d1a2e" />
          {/* Eyes */}
          <circle cx="94" cy="115" r="14" fill="url(#eyeGrad)" style={{ animation: 'blink 4s ease-in-out infinite' }} />
          <circle cx="146" cy="115" r="14" fill="url(#eyeGrad)" style={{ animation: 'blink 4s ease-in-out infinite 0.5s' }} />
          <circle cx="94" cy="115" r="6" fill="#010a12" />
          <circle cx="146" cy="115" r="6" fill="#010a12" />
          <circle cx="97" cy="112" r="3" fill="white" opacity="0.9" filter="url(#glow)" />
          <circle cx="149" cy="112" r="3" fill="white" opacity="0.9" filter="url(#glow)" />
          {/* Eye glow */}
          <circle cx="94" cy="115" r="14" fill="none" stroke={C.cyan} strokeWidth="1" opacity="0.6" />
          <circle cx="146" cy="115" r="14" fill="none" stroke={C.cyan} strokeWidth="1" opacity="0.6" />
          {/* Nose */}
          <path d="M115 130 Q110 148 112 155 Q120 160 128 155 Q130 148 125 130" fill="none" stroke="rgba(100,140,180,0.4)" strokeWidth="1.5" />
          {/* Mouth */}
          <g style={{ animation: speaking ? 'lip-sync 0.15s steps(1) infinite' : 'none', transformOrigin: '120px 175px' }}>
            <path d="M100 172 Q120 180 140 172" stroke="rgba(80,120,160,0.8)" strokeWidth="2" fill="none" strokeLinecap="round" />
            {speaking && <ellipse cx="120" cy="177" rx="12" ry="5" fill="#030c1a" stroke="rgba(6,182,212,0.3)" strokeWidth="1" />}
          </g>
          {/* Cheek highlights */}
          <ellipse cx="80" cy="135" rx="10" ry="6" fill="rgba(6,182,212,0.08)" />
          <ellipse cx="160" cy="135" rx="10" ry="6" fill="rgba(6,182,212,0.08)" />
          {/* Tech overlays */}
          <line x1="62" y1="90" x2="42" y2="80" stroke={C.cyan} strokeWidth="0.8" opacity="0.5" />
          <circle cx="42" cy="80" r="3" fill={C.cyan} opacity="0.6" />
          <line x1="178" y1="90" x2="198" y2="80" stroke={C.cyan} strokeWidth="0.8" opacity="0.5" />
          <circle cx="198" cy="80" r="3" fill={C.cyan} opacity="0.6" />
        </svg>
      </div>
      {/* Floating data points */}
      {speaking && (
        <>
          <div style={{ position: 'absolute', top: '20%', right: -50, display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'flex-start', animation: 'data-stream 2s ease infinite' }}>
            {['0.94', '0.87', '0.91'].map((v, i) => (
              <div key={i} style={{ fontSize: 9, color: C.cyan, fontFamily: 'JetBrains Mono', opacity: 0.7, animationDelay: `${i * 0.2}s` }}>{v}</div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// Mic waveform

export { AIAvatar };
