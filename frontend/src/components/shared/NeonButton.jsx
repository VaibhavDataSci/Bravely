import React, { useState, useEffect, useRef } from 'react';
import { C } from '../../constants/theme';

const NeonButton = ({ children, onClick, variant = 'primary', size = 'md', style = {} }) => {
  const [hov, setHov] = React.useState(false);
  const sizes = { sm: { padding: '8px 18px', fontSize: 13 }, md: { padding: '12px 28px', fontSize: 15 }, lg: { padding: '16px 40px', fontSize: 17 } };
  const variants = {
    primary: {
      background: hov ? `linear-gradient(135deg, #0e7490, #6d28d9)` : `linear-gradient(135deg, #0891b2, #7c3aed)`,
      boxShadow: hov ? `0 0 30px rgba(6,182,212,0.5), 0 0 60px rgba(124,58,237,0.3)` : `0 0 15px rgba(6,182,212,0.3)`,
      color: '#fff',
      border: 'none',
    },
    outline: {
      background: hov ? `rgba(6,182,212,0.1)` : 'transparent',
      border: `1px solid ${hov ? C.cyan : C.borderMid}`,
      color: hov ? C.cyan : C.textDim,
      boxShadow: hov ? `0 0 20px rgba(6,182,212,0.2)` : 'none',
    },
    ghost: {
      background: hov ? `rgba(255,255,255,0.07)` : 'transparent',
      border: `1px solid ${hov ? 'rgba(255,255,255,0.15)' : 'transparent'}`,
      color: C.textDim,
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
        fontFamily: 'Space Grotesk, sans-serif',
        fontWeight: 600,
        letterSpacing: '0.02em',
        transition: 'all 0.25s ease',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        ...style,
      }}
    >{children}</button>
  );
};

export { NeonButton };
