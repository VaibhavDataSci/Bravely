"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { GlassCard, NeonButton, Tag } from '@/components/shared';
import { C } from '@/constants/theme';
import styles from './DailyPractice.module.css';

export default function DailyPracticeHub() {
  const router = useRouter();

  const handleNavigate = (path) => {
    router.push(path);
  };

  const modules = [
    {
      id: 'day-summary',
      title: 'Day Summary',
      subtitle: 'A spoken journal mode. Reflect on your daily interactions to improve emotional intelligence and articulation.',
      path: '/daily-practice/day-summary',
      features: [
        'Voice journaling',
        'Real-time transcription',
        'Filler word detection',
        'Confidence analysis',
        'Tone insights'
      ],
      visual: (
        <div className={styles.cardIcon} style={{ background: 'linear-gradient(135deg, rgba(167,139,250,0.12), rgba(124,58,237,0.08))' }}>
          🎤
        </div>
      ),
      cta: 'Start Session'
    },
    {
      id: 'topic-practice',
      title: 'Topic of the Day',
      subtitle: 'Structured practice using the STAR method. Tackle specialized scenarios with immediate AI performance feedback.',
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
        <div className={styles.cardIcon} style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(167,139,250,0.06))' }}>
          ✨
        </div>
      ),
      cta: 'Start Speaking'
    },
    {
      id: 'ai-conversation',
      title: 'Phone Call with AI',
      subtitle: 'Improve spontaneity through fluid, real-time conversations powered by the Bravely AI Engine.',
      supportText: '',
      path: '/daily-practice/ai-conversation',
      features: [
        'Real-time AI conversation',
        'Improve speaking confidence',
        'Build conversational fluency',
        'Reduce hesitation and pauses',
        'Voice-to-voice interaction'
      ],
      visual: (
        <div className={styles.cardIcon} style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.12), rgba(99,102,241,0.06))' }}>
          🤖
        </div>
      ),
      cta: 'Start Call'
    },
    {
      id: 'peer-practice',
      title: 'Peer-to-Peer Practice',
      subtitle: 'Anonymous 1:1 speaking practice sessions with verified high performers globally. Real talk, real growth.',
      path: '/daily-practice/peer-practice',
      features: [
        'Anonymous voice calls',
        'AI transcript analysis',
        'Communication scoring',
        'Confidence building',
        'Real-time peer interaction'
      ],
      visual: (
        <div className={styles.cardIcon} style={{ background: 'linear-gradient(135deg, rgba(253,186,116,0.08), rgba(236,72,153,0.06))' }}>
          👥
        </div>
      ),
      cta: 'Find a Peer'
    }
  ];

  return (
    <div className={styles.pageWrap}>
      <div className={styles.hero}>
        <h1 className={styles.heroTitle}>Master the Art of Dialogue.</h1>
        <p className={styles.heroSub}>Hone your professional edge with daily routines designed by conversation experts. Choose your focus area for today.</p>
      </div>

      <div className={styles.grid}>
        {modules.map((mod) => (
          <GlassCard
            key={mod.id}
            hover={true}
            style={{
              padding: '28px',
            }}
            onClick={() => handleNavigate(mod.path)}
          >
            <div className={styles.cardTop}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                {mod.visual}
                <div>
                  <div className={styles.cardTitle}>{mod.title}</div>
                  <div className={styles.cardDesc}>{mod.subtitle}</div>
                </div>
              </div>
              <div className={styles.bgFadedIcon} aria-hidden>{mod.id === 'day-summary' ? '🎙' : mod.id === 'topic-practice' ? '★' : mod.id === 'ai-conversation' ? '🤖' : '📞'}</div>
            </div>

            <div className={styles.features}>
              {mod.features.slice(0,4).map((f,i) => (
                <div key={i}>✦ {f}</div>
              ))}
            </div>

            <div className={styles.ctaWrap}>
              <div className={styles.labelPill} style={{ background: mod.id === 'topic-practice' ? 'linear-gradient(90deg, rgba(203,203,255,0.06), rgba(167,139,250,0.04))' : undefined }}>
                {mod.id === 'day-summary' ? '10–15 MINS' : mod.id === 'topic-practice' ? 'AI GUIDED' : mod.id === 'ai-conversation' ? 'ENDLESS MODE' : 'LIVE CONNECTION'}
              </div>

              <NeonButton 
                variant="primary" 
                onClick={(e) => {
                  e.stopPropagation();
                  handleNavigate(mod.path);
                }}
                size="md"
                style={{ marginLeft: 'auto' }}
              >
                {mod.cta}
              </NeonButton>
            </div>
          </GlassCard>
        ))}
      </div>

      <div className={styles.insightBanner}>
        <span style={{ fontSize: 18 }}>⚡</span>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 12, opacity: 0.9, fontWeight: 700 }}>DAILY INSIGHT:</div>
          <div style={{ fontSize: 14 }}>Your spontaneity score increased by 12% last week.</div>
        </div>
      </div>
    </div>
  );
}