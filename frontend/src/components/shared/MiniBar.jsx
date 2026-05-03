import React, { useState, useEffect, useRef } from 'react';
import { C } from '../../constants/theme';

const MiniBar = ({ data, color = C.cyan, height = 48 }) => {
  const max = Math.max(...data);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height }}>
      {data.map((v, i) => (
        <div key={i} style={{
          flex: 1, borderRadius: 3,
          height: `${(v / max) * 100}%`,
          background: `linear-gradient(to top, ${color}80, ${color})`,
          opacity: i === data.length - 1 ? 1 : 0.5,
          transition: 'height 0.8s ease',
        }} />
      ))}
    </div>
  );
};

// ─── SIDEBAR NAV ─────────────────────────────────────────────────────────────
const navItems = [
  { id: 'landing',   label: 'Home',             icon: '⬡' },
  { id: 'dashboard', label: 'Dashboard',         icon: '◈' },
  { id: 'solo',      label: 'Solo Interview',    icon: '◉' },
  { id: 'mock',      label: 'Mock Interview',    icon: '◈' },
  { id: 'coding',    label: 'Coding Interview',  icon: '⌥' },
  { id: 'lobby',     label: 'Peer Arena',        icon: '⬡' },
  { id: 'group',     label: 'Group Discussion',  icon: '⬡' },
  { id: 'report',    label: 'Analysis',          icon: '◈' },
  { id: 'profile',   label: 'Profile',           icon: '◉' },
  { id: 'auth',      label: 'Sign In / Up',      icon: '◉' },
];

export { MiniBar };
