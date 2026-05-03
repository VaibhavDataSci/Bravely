import { useNavigate } from 'react-router-dom';
import React, { useState, useCallback } from 'react';
import { C } from '../../constants/theme';

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
];

const COLLAPSED_WIDTH = 68;
const EXPANDED_WIDTH = 220;

const Sidebar = ({ page }) => {
  const navigate = useNavigate();
  const [pinned, setPinned] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);

  const expanded = pinned || hovered;
  const width = expanded ? EXPANDED_WIDTH : COLLAPSED_WIDTH;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width, height: '100vh', flexShrink: 0,
        background: 'rgba(7,13,26,0.98)',
        borderRight: `1px solid ${C.border}`,
        display: 'flex', flexDirection: 'column',
        paddingTop: 20, paddingBottom: 20,
        zIndex: 100,
        backdropFilter: 'blur(30px)',
        transition: 'width 0.3s ease',
        overflow: 'hidden',
      }}
    >
      {/* Logo + Pin toggle row */}
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: expanded ? 'space-between' : 'center',
        marginBottom: 24,
        paddingLeft: expanded ? 14 : 0,
        paddingRight: expanded ? 10 : 0,
        minHeight: 36,
        transition: 'padding 0.3s ease',
      }}>
        {/* Logo */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: expanded ? 10 : 0,
          minWidth: 36,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            background: `linear-gradient(135deg, ${C.cyan}, ${C.violet})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 0 20px ${C.cyanGlow}`,
            fontSize: 16, fontWeight: 800, color: '#fff',
          }}>B</div>
          {/* Brand text — only when expanded */}
          <span style={{
            fontSize: 14, fontWeight: 700, whiteSpace: 'nowrap',
            background: `linear-gradient(90deg, ${C.cyan}, ${C.violetBright})`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            opacity: expanded ? 1 : 0,
            width: expanded ? '100%' : 0,
            overflow: 'hidden',
            transition: 'all 0.25s ease',
            pointerEvents: expanded ? 'auto' : 'none',
          }}>Bravely</span>
        </div>
        {/* Pin/unpin button — only visible when expanded */}
        <button
          onClick={(e) => { e.stopPropagation(); setPinned(p => !p); }}
          title={pinned ? 'Unpin sidebar' : 'Pin sidebar'}
          style={{
            height: 28, borderRadius: 6,
            background: pinned ? `${C.cyan}20` : 'transparent',
            border: `1px solid ${pinned ? C.cyan + '50' : 'transparent'}`,
            color: pinned ? C.cyan : C.textMuted,
            cursor: 'pointer', fontSize: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: expanded ? 1 : 0,
            width: expanded ? 28 : 0,
            overflow: 'hidden',
            padding: expanded ? undefined : 0,
            borderWidth: expanded ? 1 : 0,
            transition: 'opacity 0.2s ease, background 0.2s ease, width 0.2s ease',
            pointerEvents: expanded ? 'auto' : 'none',
            flexShrink: 0,
          }}
        >{pinned ? '📌' : '📍'}</button>
      </div>

      {/* Nav items */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: expanded ? 'stretch' : 'center',
        gap: 16
      }}>
        {navItems.map(({ id, label, icon }) => {
          const active = page === id;
          const isItemHovered = hoveredItem === id;
          return (
            <button
              key={id}
              onClick={() => id === 'landing' ? navigate('/') : navigate(`/${id}`)}
              onMouseEnter={() => setHoveredItem(id)}
              onMouseLeave={() => setHoveredItem(null)}
              title={!expanded ? label : undefined}
              style={{
                width: expanded ? 'calc(100% - 16px)' : 44,
                height: 44, borderRadius: 12,
                marginLeft: expanded ? 8 : 0,
                marginRight: expanded ? 8 : 0,
                background: active
                  ? `linear-gradient(135deg, ${C.cyanGlow}, ${C.violetGlow})`
                  : isItemHovered
                    ? `rgba(6, 182, 212, 0.08)`
                    : 'transparent',
                border: active
                  ? `1px solid ${C.borderMid}`
                  : isItemHovered
                    ? `1px solid rgba(6, 182, 212, 0.12)`
                    : '1px solid transparent',
                color: active ? C.cyan : isItemHovered ? C.cyan : C.textMuted,
                fontSize: 18, cursor: 'pointer',
                display: 'flex', alignItems: 'center',
                justifyContent: expanded ? 'flex-start' : 'center',
                padding: expanded ? '0 12px' : 0,
                boxSizing: 'border-box',
                gap: expanded ? 12 : 0,
                transition: 'all 0.2s ease',
                boxShadow: active
                  ? `0 0 15px ${C.cyanGlow}`
                  : isItemHovered
                    ? `0 0 10px rgba(6, 182, 212, 0.08)`
                    : 'none',
                flexShrink: 0,
              }}
            >
              <span style={{
                fontFamily: 'Space Grotesk', lineHeight: 1,
                flexShrink: 0, width: 20, textAlign: 'center',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{icon}</span>
              {/* Label — always rendered, opacity-controlled */}
              <span style={{
                fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap',
                fontFamily: 'Space Grotesk',
                color: active ? C.cyan : isItemHovered ? C.text : C.textDim,
                opacity: expanded ? 1 : 0,
                transition: 'all 0.25s ease',
                pointerEvents: 'none',
                overflow: 'hidden',
                width: expanded ? '100%' : 0,
                textAlign: 'left',
              }}>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export { Sidebar };
