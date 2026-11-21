"use client";
import React, { useState, useEffect, useRef } from 'react';
import { C } from '../../constants/theme';

// ─── NEON INPUT ───────────────────────────────────────────────────────────────
const NeonInput = ({ label, type = 'text', placeholder, value, onChange, icon }) => {
  const [focused, setFocused] = React.useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && <label style={{ fontSize: 12, color: C.textSecondary, fontWeight: 600, letterSpacing: '0.04em' }}>{label}</label>}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        background: focused ? 'color-mix(in srgb, var(--bv-brand) 6%, transparent)' : C.bgCard,
        border: `1px solid ${focused ? C.primary : C.borderMid}`,
        borderRadius: 10, padding: '12px 14px',
        transition: 'all 0.25s',
        boxShadow: focused ? `0 0 20px color-mix(in srgb, var(--bv-brand) 20%, transparent), inset 0 0 10px color-mix(in srgb, var(--bv-brand) 4%, transparent)` : 'none',
      }}>
        {icon && <span style={{ fontSize: 16, opacity: 0.6, color: focused ? C.primary : C.textSecondary }}>{icon}</span>}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            flex: 1, background: 'transparent', border: 'none', outline: 'none',
            color: C.textPrimary, fontFamily: 'Inter, sans-serif', fontSize: 14,
          }}
        />
      </div>
    </div>
  );
};

export { NeonInput };
