"use client";
import { useRouter, usePathname } from 'next/navigation';
import React, { useState, useCallback } from 'react';
import { C } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';

const navItems = [
  { id: 'dashboard',       label: 'Dashboard',        icon: '◈' },
  { id: 'daily-practice',  label: 'Daily Practice',   icon: '⬡' },
  { id: 'solo-select',     label: 'Mock Interview',   icon: '◉' },
  { id: 'peer-practice',   label: 'Peer to Peer',     icon: '👥' },
  { id: 'group-lobby',     label: 'Group Discussion', icon: '⬡' },
];

const COLLAPSED_WIDTH = 68;
const EXPANDED_WIDTH  = 220;

const Sidebar = ({ page }) => {
  const router = useRouter();
  const { user } = useAuth();
  const [pinned,      setPinned]      = useState(false);
  const [hovered,     setHovered]     = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);

  const expanded = pinned || hovered;
  const width    = expanded ? EXPANDED_WIDTH : COLLAPSED_WIDTH;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width, height: '100vh', flexShrink: 0,
        background: C.bgSidebar,
        borderRight: `1px solid ${C.border}`,
        display: 'flex', flexDirection: 'column',
        paddingTop: 20, paddingBottom: 20,
        zIndex: 100,
        // Only animate width — no 'all', no layout-expensive properties
        transition: 'width 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
        willChange: 'width',
        overflow: 'hidden',
        // Promote sidebar to its own GPU compositing layer
        transform: 'translateZ(0)',
      }}
    >
      {/* Logo + Pin toggle row */}
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: expanded ? 'space-between' : 'center',
        marginBottom: 24,
        paddingLeft:  expanded ? 14 : 0,
        paddingRight: expanded ? 10 : 0,
        minHeight: 36,
        // Padding transition is cheap — no layout recalc in flex
        transition: 'padding 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
      }}>
        {/* Logo */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: expanded ? 10 : 0,
          minWidth: 36,
        }}>
          <img
            src="/bravely-logo.jpeg"
            alt="Bravely"
            style={{
              width:      expanded ? 120 : 36,
              height:     expanded ? 'auto' : 36,
              objectFit: 'contain',
              // Width/height cause layout — tie them to the sidebar width transition
              transition: 'width 0.22s cubic-bezier(0.4, 0, 0.2, 1), height 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          />
        </div>
        {/* Pin/unpin button — only visible when expanded */}
        <button
          onClick={(e) => { e.stopPropagation(); setPinned(p => !p); }}
          title={pinned ? 'Unpin sidebar' : 'Pin sidebar'}
          style={{
            height: 28, borderRadius: 6,
            background: pinned ? `rgba(167, 139, 250, 0.1)` : 'transparent',
            border: `1px solid ${pinned ? `rgba(167, 139, 250, 0.3)` : 'transparent'}`,
            color:  pinned ? C.primary : C.textMuted,
            cursor: 'pointer', fontSize: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity:      expanded ? 1 : 0,
            width:        expanded ? 28 : 0,
            overflow:     'hidden',
            padding:      expanded ? undefined : 0,
            borderWidth:  expanded ? 1 : 0,
            // Opacity is GPU-only — no repaint
            transition:   'opacity 0.15s ease',
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
        gap: 16,
      }}>
        {navItems.map(({ id, label, icon }) => {
          const active        = page === id;
          const isItemHovered = hoveredItem === id;
          return (
            <button
              key={id}
              onClick={() => id === 'landing' ? router.push('/') : router.push(`/${id}`)}
              onMouseEnter={() => setHoveredItem(id)}
              onMouseLeave={() => setHoveredItem(null)}
              title={!expanded ? label : undefined}
              style={{
                width:  expanded ? 'calc(100% - 16px)' : 44,
                height: 44, borderRadius: 12,
                marginLeft:  expanded ? 8 : 0,
                marginRight: expanded ? 8 : 0,
                background: active
                  ? `rgba(167, 139, 250, 0.1)`
                  : isItemHovered
                    ? `rgba(167, 139, 250, 0.05)`
                    : 'transparent',
                border: active
                  ? `1px solid ${C.borderMid}`
                  : isItemHovered
                    ? `1px solid rgba(167, 139, 250, 0.1)`
                    : '1px solid transparent',
                color:    active ? C.primary : isItemHovered ? C.primary : C.textMuted,
                fontSize: 18, cursor: 'pointer',
                display:        'flex',
                alignItems:     'center',
                justifyContent: expanded ? 'flex-start' : 'center',
                padding:     expanded ? '0 12px' : 0,
                boxSizing:   'border-box',
                gap:         expanded ? 12 : 0,
                // ONLY transition cheap compositor properties — NO 'all', NO box-shadow, NO layout props
                transition:  'background 0.15s ease, color 0.15s ease, border-color 0.15s ease',
                boxShadow: active ? `0 0 15px rgba(167, 139, 250, 0.1)` : 'none',
                flexShrink: 0,
              }}
            >
              <span style={{
                fontFamily: 'var(--font-sans)', lineHeight: 1,
                flexShrink: 0, width: 20, textAlign: 'center',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{icon}</span>

              {/* Label — use max-width instead of width to avoid layout reflow */}
              <span style={{
                fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap',
                fontFamily: 'var(--font-sans)',
                color:      active ? C.primary : isItemHovered ? C.textPrimary : C.textSecondary,
                opacity:    expanded ? 1 : 0,
                maxWidth:   expanded ? 160 : 0,
                overflow:   'hidden',
                // max-width + opacity are compositor-friendly; avoid animating width directly
                transition: 'opacity 0.18s ease, max-width 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
                textAlign:  'left',
                pointerEvents: 'none',
              }}>{label}</span>
            </button>
          );
        })}
      </div>

    </div>
  );
};

export { Sidebar };
