"use client";
import React, { useState } from 'react';
import { GlassCard, NeonButton, MicWave } from '@/components/shared';
import { C } from '@/constants/theme';

export default function DaySummaryPage() {
  const [isRecording, setIsRecording] = useState(false);

  return (
    <div style={{ padding: '40px', maxWidth: 1000, margin: '0 auto', color: C.textPrimary }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Day Summary</h1>
      <p style={{ color: C.textSecondary, marginBottom: '40px' }}>Reflect on your day and improve natural communication clarity.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
        <GlassCard style={{ padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
          <div style={{ marginBottom: 40 }}>
             <MicWave active={isRecording} />
          </div>
          
          <NeonButton 
            variant={isRecording ? 'danger' : 'primary'}
            onClick={() => setIsRecording(!isRecording)}
            style={{ width: 200, padding: '15px' }}
          >
            {isRecording ? 'Stop Recording' : 'Start Session'}
          </NeonButton>
          
          {isRecording && <p style={{ marginTop: 20, color: C.textMuted }}>Recording in progress...</p>}
        </GlassCard>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <GlassCard style={{ padding: '20px' }}>
            <h3 style={{ color: C.primary, marginBottom: 10 }}>Analysis (Live)</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ color: C.textSecondary }}>Clarity</span>
              <span>Scanning...</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ color: C.textSecondary }}>Pace</span>
              <span>Scanning...</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: C.textSecondary }}>Filler Words</span>
              <span>Scanning...</span>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}