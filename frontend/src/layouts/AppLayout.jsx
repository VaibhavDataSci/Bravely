import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { C } from '../constants/theme';
import { Sidebar, ParticlesBg, Header } from '../components/layout';

export function AppLayout() {
  const location = useLocation();
  const page = location.pathname.substring(1) || 'dashboard';

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative' }}>
      <ParticlesBg />
      <Sidebar page={page} />
      
      <div style={{ flex: 1, position: 'relative', zIndex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <Header />
        <div style={{ flex: 1, overflow: 'auto', position: 'relative' }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
