import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect, useRef } from 'react';
import { C } from '../../constants/theme';

// ─── NOTIFICATION SYSTEM ─────────────────────────────────────────────────────
const NotificationCenter = () => {
  const navigate = useNavigate();

  const [notifs, setNotifs] = React.useState([
    { id: 1, type: 'request', title: 'Interview Request', body: 'Jordan K. wants to practice with you', time: '2m ago', read: false, action: 'p2p' },
    { id: 2, type: 'match', title: 'Match Found!', body: 'Peer matched for Frontend SWE role', time: '8m ago', read: false, action: 'lobby' },
    { id: 3, type: 'reminder', title: 'Session Reminder', body: 'Your scheduled mock starts in 15 min', time: '12m ago', read: true, action: 'mock' },
    { id: 4, type: 'result', title: 'Analysis Ready', body: 'Your last interview report is ready', time: '1h ago', read: true, action: 'report' },
  ]);
  const [open, setOpen] = React.useState(false);
  const unread = notifs.filter(n => !n.read).length;

  const dismiss = (id) => setNotifs(n => n.filter(x => x.id !== id));
  const markRead = (id) => setNotifs(n => n.map(x => x.id === id ? {...x, read: true} : x));

  const icons = { request: '👥', match: '⚡', reminder: '🔔', result: '📊' };
  const colors = { request: C.cyan, match: C.green, reminder: C.amber, result: C.violetBright };

  return (
    <div style={{ position: 'fixed', top: 16, right: 20, zIndex: 1000 }}>
      {/* Bell button */}
      <button onClick={() => setOpen(o => !o)} style={{
        width: 40, height: 40, borderRadius: 10,
        background: open ? `${C.cyanGlow}` : 'rgba(7,13,26,0.9)',
        border: `1px solid ${open ? C.borderMid : C.border}`,
        color: C.text, cursor: 'pointer', fontSize: 16,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(20px)', position: 'relative',
        boxShadow: open ? `0 0 20px ${C.cyanGlow}` : 'none',
        transition: 'all 0.2s',
      }}>
        🔔
        {unread > 0 && (
          <div style={{
            position: 'absolute', top: -4, right: -4,
            width: 18, height: 18, borderRadius: '50%',
            background: `linear-gradient(135deg, ${C.cyan}, ${C.violet})`,
            fontSize: 9, fontWeight: 800, color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'pulse-ring 2s infinite',
          }}>{unread}</div>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute', top: 48, right: 0, width: 320,
          background: 'rgba(7,13,26,0.97)', borderRadius: 14,
          border: `1px solid ${C.border}`, backdropFilter: 'blur(30px)',
          boxShadow: `0 20px 60px rgba(0,0,0,0.5), 0 0 40px ${C.cyanGlow}`,
          overflow: 'hidden', animation: 'fade-up 0.2s ease',
        }}>
          <div style={{ padding: '14px 16px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, fontWeight: 700 }}>Notifications</span>
            <button onClick={() => setNotifs(n => n.map(x => ({...x, read: true})))} style={{ fontSize: 11, color: C.cyan, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Space Grotesk' }}>Mark all read</button>
          </div>
          <div style={{ maxHeight: 320, overflow: 'auto' }}>
            {notifs.length === 0 && (
              <div style={{ padding: '24px', textAlign: 'center', color: C.textMuted, fontSize: 13 }}>All caught up ✓</div>
            )}
            {notifs.map(n => (
              <div key={n.id} onClick={() => { markRead(n.id); setPage(n.action); setOpen(false); }} style={{
                padding: '12px 16px', display: 'flex', gap: 12, alignItems: 'flex-start',
                background: n.read ? 'transparent' : `${colors[n.type]}06`,
                borderBottom: `1px solid ${C.border}`,
                cursor: 'pointer', transition: 'all 0.2s',
              }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                  background: `${colors[n.type]}18`, border: `1px solid ${colors[n.type]}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
                }}>{icons[n.type]}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: n.read ? C.textDim : C.text }}>{n.title}</span>
                    <span style={{ fontSize: 10, color: C.textMuted, fontFamily: 'JetBrains Mono' }}>{n.time}</span>
                  </div>
                  <div style={{ fontSize: 11, color: C.textMuted, lineHeight: 1.4 }}>{n.body}</div>
                </div>
                <button onClick={e => { e.stopPropagation(); dismiss(n.id); }} style={{
                  background: 'none', border: 'none', color: C.textMuted, cursor: 'pointer',
                  fontSize: 14, lineHeight: 1, padding: '0 2px', flexShrink: 0,
                }}>×</button>
              </div>
            ))}
          </div>
          <div style={{ padding: '10px 16px', borderTop: `1px solid ${C.border}` }}>
            <button style={{ width: '100%', padding: '8px', background: C.glass, border: `1px solid ${C.border}`, borderRadius: 8, color: C.textDim, fontSize: 12, cursor: 'pointer', fontFamily: 'Space Grotesk' }}>View all notifications</button>
          </div>
        </div>
      )}
    </div>
  );
};

// Floating toast notification

export { NotificationCenter };
