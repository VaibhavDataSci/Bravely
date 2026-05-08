"use client";
import React, { useState, useEffect, useRef } from 'react';
import { C } from '../../constants/theme';
import { glass } from './glass';

const GlassCard = ({ children, style = {}, onClick, hover = false }) => {
  const [hov, setHov] = React.useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        ...glass(),
        borderRadius: 16,
        padding: '24px',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        ...(hover && hov ? {
          background: C.bgElevated,
          transform: 'translateY(-2px)',
          boxShadow: `0 12px 40px rgba(0,0,0,0.4), inset 0 1px 0 0 rgba(255,255,255,0.1)`,
          border: `1px solid ${C.borderMid}`,
        } : {}),
        ...style,
      }}
    >{children}</div>
  );
};

export { GlassCard };
