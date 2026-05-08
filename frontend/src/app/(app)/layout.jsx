"use client";
import React from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar, ParticlesBg, Header } from '@/components/layout';

export default function AppLayout({ children }) {
  const pathname = usePathname();
  // derive "page" from pathname. ex: /dashboard -> dashboard
  const page = pathname.split('/').pop() || 'dashboard';

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative' }}>
      <ParticlesBg />
      <Sidebar page={page} />
      
      <div style={{ flex: 1, position: 'relative', zIndex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <Header />
        <div style={{ flex: 1, overflow: 'auto', position: 'relative' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
