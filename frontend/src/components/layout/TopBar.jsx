import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { C } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';

export function TopBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const topBarRef = useRef(null);

  // Click outside to close active dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (topBarRef.current && !topBarRef.current.contains(e.target)) {
        setNotifOpen(false);
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : '?';

  return (
    <div
      ref={topBarRef}
      style={{
        position: 'fixed',
        top: 24,
        right: 36,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        zIndex: 1000,
      }}
    >
      {/* Streak Counter */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          height: 36,
          padding: '0 12px',
          boxSizing: 'border-box',
          background: 'rgba(7, 13, 26, 0.6)',
          border: `1px solid ${C.amber}50`,
          borderRadius: 18,
          backdropFilter: 'blur(10px)',
          color: C.amber,
          fontSize: 14,
          fontWeight: 700,
          boxShadow: `0 0 12px ${C.amber}20`,
        }}
      >
        <span style={{ fontSize: 18, lineHeight: 1 }}>🔥</span>
        <span>0</span>
      </div>

      {/* Notification Icon */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => {
            setNotifOpen(!notifOpen);
            setProfileOpen(false);
          }}
          onMouseEnter={(e) => {
            if (!notifOpen) {
              e.currentTarget.style.boxShadow = `0 0 15px ${C.cyanGlow}`;
              e.currentTarget.style.borderColor = C.cyan;
              e.currentTarget.style.color = C.cyan;
            }
          }}
          onMouseLeave={(e) => {
            if (!notifOpen) {
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.borderColor = C.border;
              e.currentTarget.style.color = C.text;
            }
          }}
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'rgba(7, 13, 26, 0.6)',
            border: `1px solid ${notifOpen ? C.cyan : C.border}`,
            color: notifOpen ? C.cyan : C.text,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
            backdropFilter: 'blur(10px)',
            transition: 'all 0.2s',
            boxShadow: notifOpen ? `0 0 15px ${C.cyanGlow}` : 'none',
          }}
        >
          🔔
        </button>

        {/* Notification Dropdown */}
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 12px)',
            right: 0,
            width: 320,
            background: 'rgba(7, 13, 26, 0.95)',
            border: `1px solid ${C.borderMid}`,
            borderRadius: 16,
            padding: 24,
            backdropFilter: 'blur(20px)',
            boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 20px ${C.cyanGlow}30`,
            opacity: notifOpen ? 1 : 0,
            transform: notifOpen ? 'translateY(0)' : 'translateY(-10px)',
            visibility: notifOpen ? 'visible' : 'hidden',
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            zIndex: 10,
          }}
        >
          <div style={{ fontSize: 14, color: C.textDim, textAlign: 'center' }}>
            No new notifications
          </div>
        </div>
      </div>

      {/* Profile Avatar */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => {
            setProfileOpen(!profileOpen);
            setNotifOpen(false);
          }}
          onMouseEnter={(e) => {
            if (!profileOpen) e.currentTarget.style.boxShadow = `0 0 18px ${C.cyanGlow}`;
          }}
          onMouseLeave={(e) => {
            if (!profileOpen) e.currentTarget.style.boxShadow = 'none';
          }}
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${C.cyan}, ${C.violetBright})`,
            border: profileOpen ? `2px solid ${C.cyan}` : '2px solid transparent',
            color: '#fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 16,
            fontWeight: 800,
            boxShadow: profileOpen ? `0 0 18px ${C.cyanGlow}` : 'none',
            transition: 'all 0.2s',
          }}
        >
          {initial}
        </button>

        {/* Profile Dropdown */}
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 12px)',
            right: 0,
            width: 220,
            background: 'rgba(7, 13, 26, 0.95)',
            border: `1px solid ${C.borderMid}`,
            borderRadius: 16,
            padding: '8px 0',
            backdropFilter: 'blur(20px)',
            boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 20px ${C.violetGlow}30`,
            opacity: profileOpen ? 1 : 0,
            transform: profileOpen ? 'translateY(0)' : 'translateY(-10px)',
            visibility: profileOpen ? 'visible' : 'hidden',
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ padding: '12px 20px', borderBottom: `1px solid ${C.border}`, marginBottom: 8 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 2 }}>
              {user?.name || 'User'}
            </div>
            <div style={{ fontSize: 12, color: C.textMuted, wordBreak: 'break-all' }}>
              {user?.email || ''}
            </div>
          </div>
          
          <DropdownItem
            icon="👤"
            label="Profile"
            onClick={() => { setProfileOpen(false); navigate('/profile'); }}
          />
          <DropdownItem
            icon="⚙️"
            label="Settings"
            onClick={() => { setProfileOpen(false); /* generic action */ }}
          />
          
          <div style={{ margin: '4px 0', borderTop: `1px solid ${C.border}` }} />
          
          <button
            onClick={handleLogout}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(251, 146, 60, 0.1)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            style={{
              padding: '10px 20px',
              textAlign: 'left',
              background: 'transparent',
              border: 'none',
              color: C.amber,
              cursor: 'pointer',
              fontSize: 14,
              transition: 'background 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <span>🚪</span> Logout
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper component for Dropdown items
function DropdownItem({ icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(6, 182, 212, 0.08)';
        e.currentTarget.style.color = C.cyan;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent';
        e.currentTarget.style.color = C.textDim;
      }}
      style={{
        padding: '10px 20px',
        textAlign: 'left',
        background: 'transparent',
        border: 'none',
        color: C.textDim,
        cursor: 'pointer',
        fontSize: 14,
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}
    >
      <span>{icon}</span> {label}
    </button>
  );
}