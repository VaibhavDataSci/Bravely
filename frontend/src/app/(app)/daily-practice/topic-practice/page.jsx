"use client";
import React, { useState } from 'react';
import { GlassCard, NeonButton, Tag, MicWave } from '@/components/shared';
import { C } from '@/constants/theme';

export default function TopicPracticePage() {
  const [isRecording, setIsRecording] = useState(false);

  return (
    <div style={{ padding: '40px', maxWidth: 1000, margin: '0 auto', color: C.textPrimary }}>
      <div style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: 10 }}>
           <Tag label="Topic of the Day" active />
           <Tag label="Storytelling" />
        </div>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>"Describe a time you had to pivot your strategy quickly."</h1>
      </div>

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
            {isRecording ? 'End Session' : 'Start Speaking'}
          </NeonButton>
        </GlassCard>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <GlassCard style={{ padding: '20px' }}>
            <h3 style={{ color: C.primary, marginBottom: 15 }}>STAR Scoring</h3>
            <div style={{ color: C.textSecondary, marginBottom: 10 }}>Situation: Pending</div>
            <div style={{ color: C.textSecondary, marginBottom: 10 }}>Task: Pending</div>
            <div style={{ color: C.textSecondary, marginBottom: 10 }}>Action: Pending</div>
            <div style={{ color: C.textSecondary }}>Result: Pending</div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}