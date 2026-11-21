"use client";
import React, { useState, useRef, useEffect, useCallback, useId } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Search, X } from 'lucide-react';
import { ALL_ROLES, ROLE_CATEGORIES } from './roleData';

const PANEL_MAX_HEIGHT = 340;

// The list renders in a portal so the scrolling page and card borders never clip it.
function Panel({ anchorRef, open, id, children }) {
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });

  const place = useCallback(() => {
    const anchor = anchorRef.current;
    if (!anchor) return;
    const rect = anchor.getBoundingClientRect();
    const below = window.innerHeight - rect.bottom - 16;
    const flip = below < PANEL_MAX_HEIGHT && rect.top > below;
    setPos({
      top: flip ? rect.top - Math.min(PANEL_MAX_HEIGHT, rect.top - 16) - 6 : rect.bottom + 6,
      left: rect.left,
      width: rect.width,
    });
  }, [anchorRef]);

  useEffect(() => {
    if (!open) return;
    place();
    window.addEventListener('scroll', place, true);
    window.addEventListener('resize', place);
    return () => {
      window.removeEventListener('scroll', place, true);
      window.removeEventListener('resize', place);
    };
  }, [open, place]);

  if (!open || typeof document === 'undefined') return null;
  return createPortal(
    <div
      id={id}
      role="listbox"
      data-dd-portal
      style={{
        position: 'fixed', zIndex: 9999, top: pos.top, left: pos.left, width: pos.width,
        maxHeight: PANEL_MAX_HEIGHT, overflowY: 'auto', padding: 6,
        background: 'var(--bv-s3)', border: '1px solid var(--bv-border-strong)', borderRadius: 10,
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
      }}
    >
      {children}
    </div>,
    document.body
  );
}

const fieldStyle = {
  display: 'flex', alignItems: 'center', gap: 10, minHeight: 44, padding: '0 12px', borderRadius: 8,
  background: 'var(--bv-s1)', border: '1px solid var(--bv-border)',
};

export function SearchableRoleDropdown({ value, onChange }) {
  const uid = useId();
  const listId = `${uid}-roles`;
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const wrapRef = useRef(null);
  const anchorRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const close = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target) && !e.target.closest('[data-dd-portal]')) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const q = query.trim().toLowerCase();
  const results = q ? ALL_ROLES.filter((r) => r.name.toLowerCase().includes(q) || r.id.toLowerCase().includes(q)) : ALL_ROLES;

  const pick = (role) => {
    onChange(role);
    setQuery('');
    setOpen(false);
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!open) setOpen(true);
      else setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && open && results[active]) {
      e.preventDefault();
      pick(results[active]);
    } else if (e.key === 'Escape' && open) {
      e.preventDefault();
      setOpen(false);
    }
  };

  useEffect(() => {
    if (open) document.getElementById(`${uid}-opt-${active}`)?.scrollIntoView({ block: 'nearest' });
  }, [open, active, uid]);

  const grouped = q ? [[null, results]] : Object.entries(ROLE_CATEGORIES);
  let flatIndex = -1;

  return (
    <div ref={wrapRef}>
      <label htmlFor={`${uid}-input`} className="sr-only">Role</label>
      <div ref={anchorRef} style={{ ...fieldStyle, borderColor: open ? 'var(--accent)' : undefined }}>
        <Search size={16} aria-hidden="true" style={{ flexShrink: 0, color: 'var(--bv-t3)' }} />
        <input
          id={`${uid}-input`}
          ref={inputRef}
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={open ? `${uid}-opt-${active}` : undefined}
          autoComplete="off"
          value={open ? query : (value?.name || '')}
          placeholder="Search roles, e.g. SWE or ML"
          onFocus={() => { setQuery(''); setActive(0); setOpen(true); }}
          onChange={(e) => { setQuery(e.target.value); setActive(0); setOpen(true); }}
          onKeyDown={onKeyDown}
          style={{ flex: 1, minWidth: 0, height: 42, background: 'none', border: 0, outline: 0, color: 'var(--bv-t1)', fontSize: 14 }}
        />
        {value && (
          <button type="button" className="bv-icon-btn" aria-label="Clear role" onClick={() => { onChange(null); inputRef.current?.focus(); }}>
            <X size={16} aria-hidden="true" />
          </button>
        )}
      </div>

      <Panel anchorRef={anchorRef} open={open} id={listId}>
        {results.length === 0 ? (
          <p style={{ padding: 16, textAlign: 'center', fontSize: 13, color: 'var(--bv-t3)' }}>No roles match &ldquo;{query}&rdquo;</p>
        ) : grouped.map(([category, roles]) => (
          <div key={category || 'results'} role="group" aria-label={category || 'Results'}>
            {category && <div style={{ padding: '10px 10px 4px', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--bv-t3)' }}>{category}</div>}
            {roles.map((role) => {
              flatIndex += 1;
              const index = flatIndex;
              const isActive = index === active;
              return (
                <div
                  key={role.id}
                  id={`${uid}-opt-${index}`}
                  role="option"
                  aria-selected={value?.id === role.id}
                  onMouseEnter={() => setActive(index)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => pick(role)}
                  style={{
                    padding: '9px 10px', borderRadius: 6, fontSize: 14, cursor: 'pointer',
                    color: 'var(--bv-t1)', fontWeight: value?.id === role.id ? 600 : 400,
                    background: isActive ? 'var(--bv-s4)' : 'transparent',
                  }}
                >
                  {role.name}
                </div>
              );
            })}
          </div>
        ))}
      </Panel>
    </div>
  );
}

// Native select: keyboard, screen reader and mobile pickers come for free.
export function SelectDropdown({ label, value, options, onChange }) {
  const uid = useId();
  return (
    <div>
      <label htmlFor={uid} className="sr-only">{label}</label>
      <div style={{ position: 'relative' }}>
        <select
          id={uid}
          value={value || ''}
          onChange={(e) => onChange(e.target.value || null)}
          style={{
            appearance: 'none', width: '100%', minHeight: 44, padding: '0 40px 0 12px', borderRadius: 8,
            background: 'var(--bv-s1)', border: '1px solid var(--bv-border)', color: value ? 'var(--bv-t1)' : 'var(--bv-t3)',
            fontSize: 14, cursor: 'pointer',
          }}
        >
          <option value="">Select {label}</option>
          {options.map((o) => (
            <option key={o.id} value={o.id}>{o.years ? `${o.name} (${o.years} years)` : o.name}</option>
          ))}
        </select>
        <ChevronDown size={16} aria-hidden="true" style={{ position: 'absolute', right: 14, top: 14, pointerEvents: 'none', color: 'var(--bv-t3)' }} />
      </div>
    </div>
  );
}
