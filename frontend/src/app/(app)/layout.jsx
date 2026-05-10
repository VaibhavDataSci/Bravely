"use client";
import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar, ParticlesBg, Header, DailyPracticeHeader } from '@/components/layout';

// Routes that trigger fullscreen immersive interview mode
const IMMERSIVE_ROUTES = ['solo-session', 'mock-room', 'group-room', 'coding'];

// Daily-practice sub-routes where the Header should be hidden
const DAILY_PRACTICE_ROUTES = [];

export default function AppLayout({ children }) {
  const pathname = usePathname();
  const page = pathname.split('/').pop() || 'dashboard';
  const isImmersive = IMMERSIVE_ROUTES.includes(page);
  const hideHeader = DAILY_PRACTICE_ROUTES.includes(page);

  // Animate transition
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    if (isImmersive) {
      const t = setTimeout(() => setEntered(true), 50);
      return () => clearTimeout(t);
    }
    setEntered(false);
  }, [isImmersive]);

  // ─── FULLSCREEN IMMERSIVE MODE ─────────────────────────────────────────────
  if (isImmersive) {
    return (
      <div style={{
        width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative',
        opacity: entered ? 1 : 0,
        transform: entered ? 'scale(1)' : 'scale(1.02)',
        transition: 'opacity 0.5s ease, transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
      }}>
        {children}
      </div>
    );
  }

  // ─── NORMAL DASHBOARD MODE ─────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative' }}>
      <ParticlesBg />
      <Sidebar page={page} />

      <div style={{ flex: 1, position: 'relative', zIndex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {!hideHeader && <Header />}
        {hideHeader && <DailyPracticeHeader />
        }
        <div style={{ flex: 1, overflow: 'auto', position: 'relative', background: '#05060b', isolation: 'isolate' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
