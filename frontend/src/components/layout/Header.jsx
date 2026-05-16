"use client";
import React, { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { C } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';
import { NeonButton } from '../shared';
import { Code, Users, Flame, Bell, Sparkles, User, Settings, LogOut } from 'lucide-react';

export function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const location = usePathname();

  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const headerRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setIsMounted(true), 0);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (headerRef.current && !headerRef.current.contains(e.target)) {
        setNotifOpen(false);
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const displayName = user?.profileResume?.personalInfo?.name || user?.name || user?.email?.split('@')[0] || 'User';
  const initial = displayName.charAt(0).toUpperCase();
  const avatarUrl = user?.profileResume?.personalInfo?.avatar || user?.photoURL || user?.avatarUrl;
  const isDashboard = location === '/dashboard' || location === '/';
  
  return (
    <div
      ref={headerRef}
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 24px',
        background: 'rgba(7, 8, 22, 0.7)',
        backdropFilter: 'blur(24px)',
        borderBottom: `1px solid ${C.border}`,
        boxShadow: `0 4px 30px rgba(0,0,0,0.3)`,
        zIndex: 1000,
        width: '100%',
        boxSizing: 'border-box'
      }}
    >
      {/* Left Section */}
      <div style={{ flex: 1, minWidth: 0, opacity: isDashboard ? 1 : 0, pointerEvents: isDashboard ? 'auto' : 'none' }}>
        {isDashboard && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: C.textPrimary, marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center', gap: 6 }}>
              Good morning, {isMounted ? displayName : 'User'} <Sparkles size={18} color={C.primary} />
            </div>
            <div style={{ fontSize: 13, color: C.textSecondary, whiteSpace: 'nowrap' }}>
              You&apos;re on a <span style={{ color: C.warning }}>7-day streak</span> - keep it up!
            </div>
          </div>
        )}
      </div>

      {/* Middle Section */}
      {isDashboard && (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', margin: '0 20px' }}>
          <NeonButton variant="outline" size="sm" onClick={() => router.push('/coding')} style={{ display: 'flex', gap: 6 }}><Code size={16} /> Coding Round</NeonButton>
          <NeonButton variant="outline" size="sm" onClick={() => router.push('/peer-practice')} style={{ display: 'flex', gap: 6 }}><Users size={16} /> Peer Arena</NeonButton>
          <NeonButton size="sm" onClick={() => router.push('/solo-select')}>Start Mock Interview →</NeonButton>
        </div>
      )}

      {/* Right Section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: isDashboard ? 1 : 'unset', justifyContent: 'flex-end' }}>
        {/* Streak Counter */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            height: 36,
            padding: '0 12px',
            boxSizing: 'border-box',
            background: 'rgba(7, 8, 22, 0.6)',
            border: `1px solid ${C.warning}50`,
            borderRadius: 18,
            backdropFilter: 'blur(10px)',
            color: C.warning,
            fontSize: 14,
            fontWeight: 700,
            boxShadow: `0 0 12px ${C.warning}20`,
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center' }}><Flame size={18} /></span>
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
                e.currentTarget.style.boxShadow = `0 0 15px rgba(167, 139, 250, 0.2)`;
                e.currentTarget.style.borderColor = C.primary;
                e.currentTarget.style.color = C.primary;
              }
            }}
            onMouseLeave={(e) => {
              if (!notifOpen) {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = C.borderMid;
                e.currentTarget.style.color = C.textPrimary;
              }
            }}
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: 'rgba(7, 8, 22, 0.6)',
              border: `1px solid ${notifOpen ? C.primary : C.borderMid}`,
              color: notifOpen ? C.primary : C.textPrimary,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
              backdropFilter: 'blur(10px)',
              transition: 'all 0.2s',
              boxShadow: notifOpen ? `0 0 15px rgba(167, 139, 250, 0.2)` : 'none',
            }}
          >
            <Bell size={18} />
          </button>

          {/* Notification Dropdown */}
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 12px)',
              right: 0,
              width: 320,
              background: C.bgElevated,
              border: `1px solid ${C.borderMid}`,
              borderRadius: 16,
              padding: 24,
              backdropFilter: 'blur(20px)',
              boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 20px rgba(167, 139, 250, 0.1)`,
              opacity: notifOpen ? 1 : 0,
              transform: notifOpen ? 'translateY(0)' : 'translateY(-10px)',
              visibility: notifOpen ? 'visible' : 'hidden',
              transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              zIndex: 10,
            }}
          >
            <div style={{ fontSize: 14, color: C.textSecondary, textAlign: 'center' }}>
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
              if (!profileOpen) e.currentTarget.style.boxShadow = `0 0 18px rgba(167, 139, 250, 0.2)`;
            }}
            onMouseLeave={(e) => {
              if (!profileOpen) e.currentTarget.style.boxShadow = 'none';
            }}
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${C.primary}, ${C.secondary})`,
              border: profileOpen ? `2px solid ${C.primary}` : '2px solid transparent',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16,
              fontWeight: 800,
              boxShadow: profileOpen ? `0 0 18px rgba(167, 139, 250, 0.2)` : 'none',
              transition: 'all 0.2s',
              overflow: 'hidden',
              padding: 0
            }}
          >
            {isMounted && avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              isMounted ? initial : 'U'
            )}
          </button>

          {/* Profile Dropdown */}
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 12px)',
              right: 0,
              width: 220,
              background: C.bgElevated,
              border: `1px solid ${C.borderMid}`,
              borderRadius: 16,
              padding: '8px 0',
              backdropFilter: 'blur(20px)',
              boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 20px rgba(167, 139, 250, 0.1)`,
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
              <div style={{ fontSize: 15, fontWeight: 700, color: C.textPrimary, marginBottom: 2 }}>
                {isMounted ? displayName : 'User'}
              </div>
              <div style={{ fontSize: 12, color: C.textMuted, wordBreak: 'break-all' }}>
                {isMounted ? (user?.email || '') : ''}
              </div>
            </div>
            
            <DropdownItem
              icon={<User size={16} />}
              label="Profile"
              onClick={() => { setProfileOpen(false); router.push('/profile'); }}
            />
            <DropdownItem
              icon={<Settings size={16} />}
              label="Settings"
              onClick={() => { setProfileOpen(false); router.push('/settings'); }}
            />
            
            <div style={{ margin: '4px 0', borderTop: `1px solid ${C.border}` }} />
            
            <button
              onClick={handleLogout}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              style={{
                padding: '10px 20px',
                textAlign: 'left',
                background: 'transparent',
                border: 'none',
                color: C.error,
                cursor: 'pointer',
                fontSize: 14,
                transition: 'background 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <span><LogOut size={16} /></span> Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DropdownItem({ icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(167, 139, 250, 0.08)';
        e.currentTarget.style.color = C.primary;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent';
        e.currentTarget.style.color = C.textSecondary;
      }}
      style={{
        padding: '10px 20px',
        textAlign: 'left',
        background: 'transparent',
        border: 'none',
        color: C.textSecondary,
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
