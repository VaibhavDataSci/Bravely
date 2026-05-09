"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { GlassCard, NeonButton, Tag } from '@/components/shared';
import { C } from '@/constants/theme';

export default function DailyPracticeHub() {
  const router = useRouter();

  const handleNavigate = (path) => {
    router.push(path);
  };

  const modules = [
    {
      id: 'day-summary',
      title: 'Day Summary',
      subtitle: 'Reflect on your day and improve natural communication clarity.',
      path: '/daily-practice/day-summary',
      features: [
        'Voice journaling',
        'Real-time transcription',
        'Filler word detection',
        'Confidence analysis',
        'Tone insights'
      ],
      visual: (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 100, color: C.primary, fontSize: 48 }}>
          🎤
        </div>
      ),
      cta: 'Start Session'
    },
    {
      id: 'topic-practice',
      title: 'Topic of the Day',
      subtitle: 'Respond to structured prompts and improve articulation.',
      path: '/daily-practice/topic-practice',
      features: [
        'Daily AI-generated topics',
        'STAR methodology scoring',
        'Structured thinking analysis',
        'Communication breakdown',
        'Progress tracking'
      ],
      tags: ['Opinion', 'Storytelling', 'Argument'],
      visual: (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: 100, color: C.secondary, fontSize: 32 }}>
          📝
        </div>
      ),
      cta: 'Start Speaking'
    },
    {
      id: 'ai-conversation',
      title: 'Phone Call with AI',
      subtitle: 'Practice natural voice conversations to improve fluency and confidence.',
      supportText: 'Just 10 mins daily builds confidence.',
      path: '/daily-practice/ai-conversation',
      features: [
        'Real-time AI conversation',
        'Improve speaking confidence',
        'Build conversational fluency',
        'Reduce hesitation and pauses',
        'Voice-to-voice interaction'
      ],
      visual: (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 100, fontSize: 48 }}>
          📞
        </div>
      ),
      cta: 'Start Call'
    },
    {
      id: 'peer-practice',
      title: 'Peer-to-Peer Practice',
      subtitle: 'Get matched anonymously with other students for live speaking practice.',
      path: '/daily-practice/peer-practice',
      features: [
        'Anonymous voice calls',
        'AI transcript analysis',
        'Communication scoring',
        'Confidence building',
        'Real-time peer interaction'
      ],
      visual: (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 100, color: C.success, fontSize: 48 }}>
          👥
        </div>
      ),
      cta: 'Find a Peer'
    }
  ];

  return (
    <div style={{
      padding: '40px',
      maxWidth: 1200,
      margin: '0 auto',
      minHeight: '100vh',
      color: C.textPrimary,
      fontFamily: 'var(--font-sans)',
    }}>
      <div style={{ textAlign: 'center', marginBottom: 60 }}>
        <h1 style={{
          fontSize: '3rem',
          fontWeight: '700',
          marginBottom: '16px',
          background: `linear-gradient(to right, #fff, ${C.primary})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          lineHeight: 1.2
        }}>Daily Practice</h1>
        <p style={{
          color: C.textSecondary,
          fontSize: '1.2rem',
          maxWidth: '600px',
          margin: '0 auto',
          lineHeight: 1.6
        }}>Build confidence through consistent AI-powered communication practice.</p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '30px'
      }}>
        {modules.map((mod) => (
          <GlassCard
            key={mod.id}
            hoverEffect={true}
            style={{
              padding: '30px',
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              border: `1px solid ${C.border}`,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            onClick={() => handleNavigate(mod.path)}
          >
            {mod.visual}
            
            <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '8px', color: '#fff' }}>
              {mod.title}
            </h3>
            <p style={{ color: C.textSecondary, marginBottom: '20px', minHeight: '48px' }}>
              {mod.subtitle}
            </p>

            {mod.tags && (
               <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
                 {mod.tags.map(tag => (
                   <Tag key={tag} label={tag} active={true} />
                 ))}
               </div>
            )}

            <ul style={{ listStyleType: 'none', padding: 0, margin: '0 0 15px 0', flexGrow: 1 }}>
              {mod.features.map((feature, i) => (
                <li key={i} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  marginBottom: '10px',
                  color: mod.customCheck ? '#F3F4F6' : C.textMuted,
                  fontSize: '0.95rem'
                }}>
                  <span style={{ color: mod.customCheck ? (C.success || '#10B981') : C.primary, fontSize: mod.customCheck ? '1.1rem' : '0.8rem' }}>
                    {mod.customCheck ? '✓' : '✦'}
                  </span>
                  {feature}
                </li>
              ))}
            </ul>
            {mod.supportText && (
              <div style={{ color: C.textSecondary, fontSize: '0.85rem', fontStyle: 'italic', marginBottom: '20px' }}>
                {mod.supportText}
              </div>
            )}

            <NeonButton 
              variant="primary" 
              onClick={(e) => {
                e.stopPropagation();
                handleNavigate(mod.path);
              }}
              style={{ width: '100%', marginTop: 'auto' }}
            >
              {mod.cta}
            </NeonButton>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}