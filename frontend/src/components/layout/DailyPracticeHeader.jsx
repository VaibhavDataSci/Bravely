"use client";
import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { C } from '../../constants/theme';

const SESSION_META = {
  'topic-practice':   { title: 'Topic of the Day',    icon: '✨', subtitle: 'STAR Method Practice' },
  'ai-conversation':  { title: 'Phone Call with AI',  icon: '📞', subtitle: 'Conversational Fluency' },
  'day-summary':      { title: 'Day Summary',          icon: '🎤', subtitle: 'Voice Journal' },
};

export function DailyPracticeHeader() {
  const router   = useRouter();
  const pathname = usePathname();
  const page     = pathname.split('/').pop();
  const isHub    = page === 'daily-practice';
  const meta     = SESSION_META[page] || { title: 'Daily Practice', icon: '⚡', subtitle: 'Practice Hub' };

  return (
    <div style={{
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'space-between',
      padding:        '12px 28px',
      background:     'rgba(7, 8, 22, 0.70)',
      backdropFilter: 'blur(20px)',
      borderBottom:   '1px solid rgba(255,255,255,0.05)',
      boxShadow:      '0 2px 20px rgba(0,0,0,0.25)',
      zIndex:          1000,
      width:           '100%',
      boxSizing:       'border-box',
      flexShrink:      0,
    }}>

      {/* LEFT — back button (hidden on hub) or logo pill on hub */}
      {isHub ? (
        /* Hub: branding pill */
        <div style={{
          display:    'flex',
          alignItems: 'center',
          gap:         10,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, rgba(139,92,246,0.25), rgba(99,102,241,0.12))',
            border: '1px solid rgba(139,92,246,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16,
          }}>⚡</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>Daily Practice</div>
        </div>
      ) : (
        /* Sub-page: back button */
        <button
          onClick={() => router.push('/daily-practice')}
          onMouseEnter={(e) => {
            e.currentTarget.style.background    = 'rgba(167,139,250,0.08)';
            e.currentTarget.style.borderColor   = C.primary;
            e.currentTarget.style.color         = C.primary;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background    = 'transparent';
            e.currentTarget.style.borderColor   = 'rgba(255,255,255,0.08)';
            e.currentTarget.style.color         = 'rgba(255,255,255,0.5)';
          }}
          style={{
            display:     'flex',
            alignItems:  'center',
            gap:          8,
            padding:     '6px 14px',
            background:   'transparent',
            border:      '1px solid rgba(255,255,255,0.08)',
            borderRadius: 8,
            color:        'rgba(255,255,255,0.5)',
            cursor:       'pointer',
            fontSize:     13,
            fontWeight:   600,
            transition:   'all 0.2s',
            fontFamily:   'var(--font-sans)',
          }}
        >
          <span style={{ fontSize: 16, lineHeight: 1 }}>←</span>
          Daily Practice
        </button>
      )}

      {/* CENTRE — session title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: 'rgba(139,92,246,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16,
        }}>
          {isHub ? '🎯' : meta.icon}
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>
            {isHub ? 'Choose Your Practice' : meta.title}
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
            {isHub ? 'Daily Focus Mode' : meta.subtitle}
          </div>
        </div>
      </div>

      {/* RIGHT — badge */}
      <div style={{
        display:    'flex',
        alignItems: 'center',
        gap:         6,
        padding:    '5px 12px',
        background:  isHub ? 'rgba(34,211,238,0.06)' : 'rgba(139,92,246,0.08)',
        borderRadius: 20,
        border:      `1px solid ${isHub ? 'rgba(34,211,238,0.2)' : 'rgba(139,92,246,0.2)'}`,
        fontSize:    12,
        fontWeight:  700,
        color:       isHub ? C.cyan : C.primary,
      }}>
        <span style={{
          width: 6, height: 6, borderRadius: '50%',
          background:  isHub ? C.cyan : C.primary,
          display:     'inline-block',
          boxShadow:  `0 0 6px ${isHub ? C.cyan : C.primary}`,
          animation:   'pulse 2s ease-in-out infinite',
        }} />
        {isHub ? 'Practice Mode' : 'Live Session'}
      </div>
    </div>
  );
}
