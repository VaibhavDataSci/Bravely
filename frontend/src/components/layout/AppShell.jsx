"use client";
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, Flame, LogOut, MoreHorizontal, Pin, PinOff, Settings, User, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { MOCK_STREAK_DAYS } from '@/mocks/user';
import { PRIMARY_NAV, SECONDARY_NAV, navFor, sectionOf, titleFor } from './navConfig';

const TAB_LABELS = { dashboard: 'Home', interview: 'Interview', daily: 'Daily', peer: 'Peers', coding: 'Code' };

const isActive = (item, pathname) => item.match.includes(sectionOf(pathname));

function useDismiss(ref, open, close) {
  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => { if (ref.current && !ref.current.contains(e.target)) close(); };
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, ref, close]);
}

function NavLink({ item, pathname, onNavigate }) {
  const Icon = item.icon;
  const active = isActive(item, pathname);
  return (
    <li>
      <Link
        href={item.href}
        className="bv-nav-item"
        data-active={active}
        aria-current={active ? 'page' : undefined}
        title={item.label}
        style={{ '--item-accent': item.accent }}
        onClick={onNavigate}
      >
        <Icon size={20} aria-hidden="true" />
        <span className="bv-nav-label">{item.label}</span>
      </Link>
    </li>
  );
}

function Sidebar({ pathname }) {
  const [pinned, setPinned] = useState(false);
  const [open, setOpen] = useState(false);

  return (
    <div className="bv-sidebar-wrap" data-pinned={pinned}>
      <nav
        className="bv-sidebar"
        aria-label="Primary"
        data-expanded={pinned || open}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false); }}
      >
        <div className="bv-sidebar-head">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="bv-logo" src="/bravely-logo.jpeg" alt="" />
          <span className="bv-wordmark bv-nav-label">Bravely</span>
          <button
            type="button"
            className="bv-icon-btn bv-nav-label"
            aria-pressed={pinned}
            aria-label={pinned ? 'Unpin sidebar' : 'Pin sidebar'}
            onClick={() => setPinned((p) => !p)}
          >
            {pinned ? <PinOff size={16} aria-hidden="true" /> : <Pin size={16} aria-hidden="true" />}
          </button>
        </div>
        <ul className="bv-nav-list">
          {PRIMARY_NAV.map((item) => <NavLink key={item.id} item={item} pathname={pathname} />)}
        </ul>
        <div className="bv-sep" role="separator" />
        <ul className="bv-nav-list">
          {SECONDARY_NAV.map((item) => <NavLink key={item.id} item={item} pathname={pathname} />)}
        </ul>
      </nav>
    </div>
  );
}

function Toolbar({ pathname }) {
  const { user, logout } = useAuth();
  const [menu, setMenu] = useState(null);
  const ref = useRef(null);
  const close = useCallback(() => setMenu(null), []);
  useDismiss(ref, menu !== null, close);

  const nav = navFor(pathname);
  const initial = user?.name ? user.name.charAt(0).toUpperCase() : '?';
  const toggle = (name) => setMenu((current) => (current === name ? null : name));

  return (
    <header className="bv-toolbar">
      <div className="bv-toolbar-title">
        <span className="bv-dot" aria-hidden="true" />
        <h1>{titleFor(pathname)}</h1>
      </div>

      <div className="bv-toolbar-right" ref={ref}>
        {nav.action && (
          <Link className="bv-btn bv-btn--primary bv-btn--sm" href={nav.action.href}>
            <span className="bv-hide-sm">{nav.action.label}</span>
            <span className="bv-show-sm">Start</span>
          </Link>
        )}

        <div className="bv-chip" title={`${MOCK_STREAK_DAYS}-day streak (sample data)`}>
          <Flame size={16} aria-hidden="true" />
          <span aria-hidden="true">{MOCK_STREAK_DAYS}</span>
          <span className="sr-only">{MOCK_STREAK_DAYS}-day streak</span>
        </div>

        <div className="bv-popwrap">
          <button
            type="button"
            className="bv-icon-btn"
            aria-label="Notifications"
            aria-haspopup="dialog"
            aria-expanded={menu === 'notifications'}
            onClick={() => toggle('notifications')}
          >
            <Bell size={18} aria-hidden="true" />
          </button>
          {menu === 'notifications' && (
            <div className="bv-pop" role="dialog" aria-label="Notifications">
              <p className="bv-pop-title">Notifications</p>
              <p className="bv-pop-empty">Nothing new. Interview reports and peer requests will appear here.</p>
            </div>
          )}
        </div>

        <div className="bv-popwrap">
          <button
            type="button"
            className="bv-avatar"
            aria-label="Account menu"
            aria-haspopup="menu"
            aria-expanded={menu === 'account'}
            onClick={() => toggle('account')}
          >
            {initial}
          </button>
          {menu === 'account' && (
            <div className="bv-pop" role="menu" aria-label="Account">
              <div className="bv-pop-user">
                <strong>{user?.name}</strong>
                <span>{user?.email}</span>
              </div>
              <Link className="bv-menu-item" role="menuitem" href="/profile" onClick={close}>
                <User size={16} aria-hidden="true" /> Profile
              </Link>
              <Link className="bv-menu-item" role="menuitem" href="/settings" onClick={close}>
                <Settings size={16} aria-hidden="true" /> Settings
              </Link>
              <button type="button" className="bv-menu-item" role="menuitem" onClick={logout}>
                <LogOut size={16} aria-hidden="true" /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function BottomNav({ pathname, onMore }) {
  return (
    <nav className="bv-bottomnav" aria-label="Primary">
      {PRIMARY_NAV.map((item) => {
        const Icon = item.icon;
        const active = isActive(item, pathname);
        return (
          <Link
            key={item.id}
            href={item.href}
            className="bv-tab"
            data-active={active}
            aria-current={active ? 'page' : undefined}
            style={{ '--item-accent': item.accent }}
          >
            <Icon size={20} aria-hidden="true" />
            <span>{TAB_LABELS[item.id]}</span>
          </Link>
        );
      })}
      <button type="button" className="bv-tab" aria-haspopup="dialog" onClick={onMore}>
        <MoreHorizontal size={20} aria-hidden="true" />
        <span>More</span>
      </button>
    </nav>
  );
}

function MoreSheet({ open, onClose, pathname }) {
  const { user, logout } = useAuth();
  const closeRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    closeRef.current?.focus();
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <>
      <div className="bv-sheet-overlay" onClick={onClose} aria-hidden="true" />
      <div className="bv-sheet" role="dialog" aria-modal="true" aria-label="More">
        <div className="bv-sheet-head">
          <div className="bv-pop-user">
            <strong>{user?.name}</strong>
            <span>{user?.email}</span>
          </div>
          <button ref={closeRef} type="button" className="bv-icon-btn" aria-label="Close menu" onClick={onClose}>
            <X size={18} aria-hidden="true" />
          </button>
        </div>
        <ul className="bv-nav-list">
          {SECONDARY_NAV.map((item) => <NavLink key={item.id} item={item} pathname={pathname} onNavigate={onClose} />)}
        </ul>
        <div className="bv-sep" role="separator" />
        <Link className="bv-menu-item" href="/profile" onClick={onClose}><User size={16} aria-hidden="true" /> Profile</Link>
        <Link className="bv-menu-item" href="/settings" onClick={onClose}><Settings size={16} aria-hidden="true" /> Settings</Link>
        <button type="button" className="bv-menu-item" onClick={logout}><LogOut size={16} aria-hidden="true" /> Sign out</button>
      </div>
    </>
  );
}

export function AppShell({ children }) {
  const pathname = usePathname();
  const [more, setMore] = useState(false);
  const closeMore = useCallback(() => setMore(false), []);

  return (
    <div className="bv-shell" style={{ '--accent': navFor(pathname).accent }}>
      <a className="bv-skip" href="#main">Skip to content</a>
      <Sidebar pathname={pathname} />
      <div className="bv-main">
        <Toolbar pathname={pathname} />
        <main className="bv-content" id="main">{children}</main>
        <BottomNav pathname={pathname} onMore={() => setMore(true)} />
      </div>
      <MoreSheet open={more} onClose={closeMore} pathname={pathname} />
    </div>
  );
}

export function FullScreenMessage({ title, body, busy = false, action }) {
  return (
    <div className="bv-fullscreen" role={busy ? 'status' : 'alert'}>
      {busy && <div className="bv-skeleton" aria-hidden="true" />}
      <h1>{title}</h1>
      {body && <p>{body}</p>}
      {action}
    </div>
  );
}
