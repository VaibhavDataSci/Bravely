import React from 'react';
import { Outlet } from 'react-router-dom';
import { ParticlesBg } from '../components/layout';

export function PublicLayout() {
  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative' }}>
      <ParticlesBg />
      <div style={{ flex: 1, position: 'relative', zIndex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <Outlet />
      </div>
    </div>
  );
}
