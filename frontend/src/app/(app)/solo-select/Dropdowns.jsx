"use client";
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { C } from '@/constants/theme';
import { ALL_ROLES, ROLE_CATEGORIES } from './roleData';

// ─── PORTAL DROPDOWN PANEL ──────────────────────────────────────────────────
// Renders dropdown in a portal at document.body so it escapes all stacking
// contexts created by GlassCard's backdropFilter / transform.
function DropdownPortal({ anchorRef, open, children, maxHeight = 340 }) {
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });

  const updatePos = useCallback(() => {
    if (!anchorRef.current || !open) return;
    const rect = anchorRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom - 16;
    const shouldFlip = spaceBelow < maxHeight && rect.top > spaceBelow;
    setPos({
      top: shouldFlip ? rect.top - Math.min(maxHeight, rect.top - 16) - 8 : rect.bottom + 8,
      left: rect.left,
      width: rect.width,
      flipped: shouldFlip,
    });
  }, [anchorRef, open, maxHeight]);

  useEffect(() => {
    if (!open) return;
    updatePos();
    window.addEventListener('scroll', updatePos, true);
    window.addEventListener('resize', updatePos);
    return () => {
      window.removeEventListener('scroll', updatePos, true);
      window.removeEventListener('resize', updatePos);
    };
  }, [open, updatePos]);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div style={{
      position: 'fixed',
      top: pos.top,
      left: pos.left,
      width: pos.width,
      zIndex: 9999,
      maxHeight,
      overflowY: 'auto',
      background: '#13162b',
      border: `1px solid rgba(167,139,250,0.25)`,
      borderRadius: 14,
      padding: 6,
      boxShadow: '0 20px 60px rgba(0,0,0,0.7), 0 0 1px rgba(167,139,250,0.3), inset 0 1px 0 rgba(255,255,255,0.06)',
      backdropFilter: 'blur(32px)',
      WebkitBackdropFilter: 'blur(32px)',
      animation: 'dd-enter 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
    }}>
      {children}
      <style>{`
        @keyframes dd-enter {
          from { opacity: 0; transform: translateY(-6px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>,
    document.body
  );
}

// ─── SHARED ITEM STYLE ──────────────────────────────────────────────────────
const itemBase = {
  padding: '10px 14px',
  cursor: 'pointer',
  borderRadius: 10,
  fontSize: 14,
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  transition: 'background 0.15s, transform 0.12s',
  color: C.textPrimary,
};

// ─── SEARCHABLE ROLE DROPDOWN ───────────────────────────────────────────────
export function SearchableRoleDropdown({ value, onChange }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(0);
  const ref = useRef(null);
  const anchorRef = useRef(null);
  const inputRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target) && !e.target.closest('[data-dd-portal]')) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const q = query.toLowerCase();
  const filtered = q
    ? ALL_ROLES.filter(r => r.name.toLowerCase().includes(q) || r.id.toLowerCase().includes(q))
    : [];

  const handleSelect = (role) => {
    onChange(role);
    setQuery('');
    setOpen(false);
  };

  const handleKeyDown = (e) => {
    if (!open) return;
    const list = filtered.length ? filtered : ALL_ROLES;
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlightIdx(i => Math.min(i + 1, list.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setHighlightIdx(i => Math.max(i - 1, 0)); }
    if (e.key === 'Enter' && list[highlightIdx]) { e.preventDefault(); handleSelect(list[highlightIdx]); }
    if (e.key === 'Escape') setOpen(false);
  };

  const highlightMatch = (text) => {
    if (!q) return text;
    const idx = text.toLowerCase().indexOf(q);
    if (idx === -1) return text;
    return <>{text.slice(0, idx)}<span style={{ color: C.primary, fontWeight: 700 }}>{text.slice(idx, idx + q.length)}</span>{text.slice(idx + q.length)}</>;
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <label style={{ fontSize: 12, color: C.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8, display: 'block' }}>
        Select Role
      </label>

      <div
        ref={anchorRef}
        onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 50); }}
        style={{
          padding: '12px 16px', borderRadius: 12, cursor: 'pointer',
          background: 'rgba(255,255,255,0.03)', border: `1px solid ${open ? C.primary : C.borderMid}`,
          display: 'flex', alignItems: 'center', gap: 10, transition: 'border-color 0.2s, box-shadow 0.2s',
          boxShadow: open ? `0 0 0 2px ${C.primary}22, 0 0 20px ${C.primary}10` : 'none',
        }}
      >
        {value && !open ? (
          <>
            <span style={{ fontSize: 18 }}>{value.icon}</span>
            <span style={{ fontSize: 15, fontWeight: 600, color: C.textPrimary, flex: 1 }}>{value.name}</span>
            <span style={{ fontSize: 12, color: C.textMuted, cursor: 'pointer', padding: '2px 6px', borderRadius: 4, background: 'rgba(255,255,255,0.05)' }} onClick={(e) => { e.stopPropagation(); onChange(null); }}>✕</span>
          </>
        ) : (
          <>
            <span style={{ fontSize: 16, color: C.textMuted }}>🔍</span>
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => { setQuery(e.target.value); setHighlightIdx(0); }}
              onFocus={() => setOpen(true)}
              onKeyDown={handleKeyDown}
              placeholder="Search roles... e.g. swe, cloud, ml"
              style={{
                flex: 1, background: 'none', border: 'none', outline: 'none',
                color: C.textPrimary, fontSize: 14, fontFamily: 'inherit',
              }}
            />
          </>
        )}
      </div>

      <DropdownPortal anchorRef={anchorRef} open={open} maxHeight={360}>
        <div data-dd-portal>
          {q ? (
            filtered.length === 0 ? (
              <div style={{ padding: 20, textAlign: 'center', color: C.textMuted, fontSize: 13 }}>No roles match &ldquo;{query}&rdquo;</div>
            ) : (
              filtered.map((role, i) => (
                <div key={role.id}
                  style={{ ...itemBase, background: i === highlightIdx ? 'rgba(167,139,250,0.14)' : 'transparent' }}
                  onMouseEnter={() => setHighlightIdx(i)}
                  onClick={() => handleSelect(role)}
                >
                  <span style={{ fontSize: 16 }}>{role.icon}</span>
                  <span>{highlightMatch(role.name)}</span>
                </div>
              ))
            )
          ) : (
            Object.entries(ROLE_CATEGORIES).map(([cat, roles]) => (
              <div key={cat}>
                <div style={{ padding: '10px 14px 4px', fontSize: 10, color: C.textMuted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{cat}</div>
                {roles.map(role => (
                  <div key={role.id}
                    style={{ ...itemBase, background: 'transparent' }}
                    onClick={() => handleSelect(role)}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(167,139,250,0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <span style={{ fontSize: 16 }}>{role.icon}</span>
                    <span style={{ fontSize: 14, color: C.textPrimary }}>{role.name}</span>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      </DropdownPortal>
    </div>
  );
}

// ─── SELECT DROPDOWN ────────────────────────────────────────────────────────
export function SelectDropdown({ label, value, options, onChange, renderOption }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const anchorRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target) && !e.target.closest('[data-dd-portal]')) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selected = options.find(o => o.id === value);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <label style={{ fontSize: 12, color: C.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8, display: 'block' }}>
        {label}
      </label>
      <div
        ref={anchorRef}
        onClick={() => setOpen(!open)}
        style={{
          padding: '12px 16px', borderRadius: 12, cursor: 'pointer',
          background: 'rgba(255,255,255,0.03)', border: `1px solid ${open ? C.primary : C.borderMid}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          transition: 'border-color 0.2s, box-shadow 0.2s',
          boxShadow: open ? `0 0 0 2px ${C.primary}22, 0 0 20px ${C.primary}10` : 'none',
        }}
      >
        <span style={{ fontSize: 14, color: selected ? C.textPrimary : C.textMuted, fontWeight: selected ? 600 : 400 }}>
          {selected ? (renderOption ? renderOption(selected) : selected.name) : `Select ${label}...`}
        </span>
        <span style={{
          fontSize: 10, color: C.textMuted,
          transform: open ? 'rotate(180deg)' : 'none',
          transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        }}>▼</span>
      </div>

      <DropdownPortal anchorRef={anchorRef} open={open} maxHeight={320}>
        <div data-dd-portal>
          {options.map(opt => {
            const isActive = opt.id === value;
            return (
              <div key={opt.id}
                onClick={() => { onChange(opt.id); setOpen(false); }}
                style={{
                  ...itemBase,
                  background: isActive ? 'rgba(167,139,250,0.16)' : 'transparent',
                  color: isActive ? C.primary : C.textPrimary,
                  fontWeight: isActive ? 600 : 400,
                  borderLeft: isActive ? `2px solid ${C.primary}` : '2px solid transparent',
                }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = 'rgba(167,139,250,0.08)'; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
              >
                {opt.icon && <span style={{ fontSize: 16 }}>{opt.icon}</span>}
                <div style={{ flex: 1 }}>
                  <div>{renderOption ? renderOption(opt) : opt.name}</div>
                  {opt.desc && <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>{opt.desc}</div>}
                  {opt.years && <div style={{ fontSize: 11, color: C.textMuted }}>{opt.years} years</div>}
                </div>
                {isActive && <span style={{ color: C.primary, fontSize: 14 }}>✓</span>}
              </div>
            );
          })}
        </div>
      </DropdownPortal>
    </div>
  );
}
