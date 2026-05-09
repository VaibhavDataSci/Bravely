"use client";
import React, { useState } from 'react';
import { GlassCard, NeonButton, Tag } from '@/components/shared';
import { C } from '@/constants/theme';

export default function AIConversationPage() {
  const [activePersona, setActivePersona] = useState('peer');
  const [sessionActive, setSessionActive] = useState(false);

  const personas = [
    { id: 'manager', label: 'Hiring Manager', icon: '👔' },
    { id: 'peer', label: 'Friendly Peer', icon: '👋' },
    { id: 'founder', label: 'Founder', icon: '🚀' },
    { id: 'professor', label: 'Professor', icon: '📚' }
  ];

  return (
    <div style={{ padding: '40px', maxWidth: 1000, margin: '0 auto', color: C.textPrimary }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>AI Conversation</h1>
      <p style={{ color: C.textSecondary, marginBottom: '40px' }}>Practice real-world conversational fluency with AI personas.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: 40 }}>
        {personas.map(p => (
           <GlassCard 
             key={p.id}
             onClick={() => !sessionActive && setActivePersona(p.id)}
             style={{ 
               padding: '20px', 
               textAlign: 'center', 
               cursor: sessionActive ? 'not-allowed' : 'pointer',
               border: activePersona === p.id ? `1px solid ${C.primary}` : `1px solid ${C.border}`,
               background: activePersona === p.id ? 'rgba(167, 139, 250, 0.1)' : undefined
             }}
           >
             <div style={{ fontSize: '2rem', marginBottom: 10 }}>{p.icon}</div>
             <div style={{ fontWeight: '500' }}>{p.label}</div>
           </GlassCard>
        ))}
      </div>

      <GlassCard style={{ padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: 300 }}>
         {!sessionActive ? (
           <>
             <div style={{ fontSize: '4rem', marginBottom: 20 }}>🤖</div>
             <NeonButton onClick={() => setSessionActive(true)}>
               Start Conversation
             </NeonButton>
           </>
         ) : (
           <>
             <div style={{ 
               width: 120, height: 120, borderRadius: '50%', 
               background: `linear-gradient(45deg, ${C.primary}, #fff)`,
               boxShadow: `0 0 30px ${C.primary}`,
               marginBottom: 40,
               animation: 'pulse 2s infinite'
             }} />
             <div style={{ color: C.textSecondary, marginBottom: 30 }}>Listening...</div>
             <NeonButton variant="danger" onClick={() => setSessionActive(false)}>
               End Session
             </NeonButton>
           </>
         )}
      </GlassCard>
    </div>
  );
}