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
        transition: 'all 0.3s ease',
        ...(hover && hov ? {
          border: `1px solid ${C.borderMid}`,
          background: C.surfaceHigh,
          transform: 'translateY(-2px)',
          boxShadow: `0 8px 32px rgba(6,182,212,0.1)`,
        } : {}),
        ...style,
      }}
    >{children}</div>
  );
};

export { GlassCard };
