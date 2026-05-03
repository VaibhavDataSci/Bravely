import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { C } from '../constants/theme';
import { ParticlesBg } from '../components/layout/ParticlesBg';

export function FullscreenLayout() {
  const navigate = useNavigate();

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      background: 'rgba(7, 13, 26, 1)',
      zIndex: 9999
    }}>
      <ParticlesBg />
      
      {/* Back button to return to dashboard */}
      <div style={{ position: 'absolute', top: 16, left: 16, zIndex: 20 }}>
        <button onClick={() => navigate('/dashboard')} style={{
          padding: '8px 16px', borderRadius: 8, border: `1px solid ${C.border}`,
          background: 'rgba(7,13,26,0.9)', color: C.textDim, cursor: 'pointer',
          fontFamily: 'Space Grotesk', fontSize: 13, backdropFilter: 'blur(10px)',
        }}>← Dashboard</button>
      </div>

      {/* Main Content Area */}
      <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 1, overflow: 'hidden' }}>
        <Outlet />
      </div>
    </div>
  );
}