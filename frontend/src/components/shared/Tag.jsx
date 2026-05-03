import React, { useState, useEffect, useRef } from 'react';
import { C } from '../../constants/theme';

const Tag = ({ children, color = C.cyan }) => (
  <span style={{
    fontSize: 11,
    fontWeight: 600,
    padding: '3px 10px',
    borderRadius: 20,
    border: `1px solid ${color}40`,
    background: `${color}15`,
    color: color,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
  }}>{children}</span>
);

// ─── AVATAR COMPONENT ─────────────────────────────────────────────────────────

export { Tag };
