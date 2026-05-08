"use client";
import React, { useState, useEffect, useRef } from 'react';
import { C } from '../../constants/theme';

const NeonButton = ({ children, onClick, variant = 'primary', size = 'md', style = {} }) => {
  const [hov, setHov] = React.useState(false);
  const sizes = { sm: { padding: '8px 18px', fontSize: 13 }, md: { padding: '12px 28px', fontSize: 15 }, lg: { padding: '16px 40px', fontSize: 17 } };
  const variants = {
    primary: {
      background: hov ? `linear-gradient(135deg, ${C.primary} 0%, ${C.secondary} 100%)` : `linear-gradient(135deg, ${C.secondary} 0%, ${C.primary} 100%)`,
      boxShadow: hov ? `0 4px 14px 0 rgba(167, 139, 250, 0.39)` : `0 2px 8px 0 rgba(167, 139, 250, 0.1)`,
      color: '#fff',
      border: 'none',
      transform: hov ? 'translateY(-1px)' : 'none',
    },
    outline: {
      background: hov ? `rgba(167, 139, 250, 0.05)` : 'transparent',
      border: `1px solid ${hov ? C.primary : C.borderMid}`,
      color: hov ? C.primary : C.textSecondary,
      boxShadow: hov ? `0 0 12px rgba(167, 139, 250, 0.1)` : 'none',
    },
    ghost: {
      background: hov ? C.glassHover : 'transparent',
      border: `1px solid transparent`,
      color: hov ? C.textPrimary : C.textSecondary,
      boxShadow: 'none',
    },
  };
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        ...sizes[size],
        ...variants[variant],
        borderRadius: 8,
        cursor: 'pointer',
        fontFamily: 'var(--font-sans)',
        fontWeight: 500,
        letterSpacing: '0.01em',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        ...style,
      }}
    >{children}</button>
  );
};

export { NeonButton };
