import React, { useState, useEffect, useRef } from 'react';
import { C } from '../../constants/theme';

const Toast = ({ msg, onClose }) => (
  <div style={{
    position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
    zIndex: 2000, animation: 'fade-up 0.3s ease',
    background: 'rgba(7,13,26,0.96)', borderRadius: 12,
    border: `1px solid ${C.borderMid}`, backdropFilter: 'blur(20px)',
    padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12,
    boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 20px ${C.cyanGlow}`,
    minWidth: 300,
  }}>
    <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.cyan, animation: 'pulse-ring 1.5s infinite', flexShrink: 0 }} />
    <span style={{ fontSize: 13, color: C.text, flex: 1 }}>{msg}</span>
    <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.textMuted, cursor: 'pointer', fontSize: 16 }}>×</button>
  </div>
);

// ─── NEON INPUT ───────────────────────────────────────────────────────────────

export { Toast };
