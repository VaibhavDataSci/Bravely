import React, { useState, useEffect, useRef } from 'react';
import { C } from '../../constants/theme';

// ─── NEON INPUT ───────────────────────────────────────────────────────────────
const NeonInput = ({ label, type = 'text', placeholder, value, onChange, icon }) => {
  const [focused, setFocused] = React.useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && <label style={{ fontSize: 12, color: C.textMuted, fontWeight: 600, letterSpacing: '0.04em' }}>{label}</label>}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        background: focused ? 'rgba(6,182,212,0.06)' : C.glass,
        border: `1px solid ${focused ? C.cyan : C.border}`,
        borderRadius: 10, padding: '12px 14px',
        transition: 'all 0.25s',
        boxShadow: focused ? `0 0 20px ${C.cyanGlow}, inset 0 0 10px rgba(6,182,212,0.04)` : 'none',
      }}>
        {icon && <span style={{ fontSize: 16, opacity: 0.6 }}>{icon}</span>}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            flex: 1, background: 'transparent', border: 'none', outline: 'none',
            color: C.text, fontFamily: 'Space Grotesk', fontSize: 14,
            '::placeholder': { color: C.textMuted },
          }}
        />
      </div>
    </div>
  );
};

// ─── PAGE: AUTH (Login / Signup) ──────────────────────────────────────────────

export { NeonInput };
