"use client";
import { useRouter, usePathname } from 'next/navigation';
import React, { useState, useEffect, useRef } from 'react';
import { C } from '@/constants/theme';
import { NeonButton, Tag, MicWave } from '@/components/shared';
import { Toast } from '@/components/layout';

// ─── PAGE: P2P INTERVIEW ROOM ─────────────────────────────────────────────────



const roleColor = { interviewer: C.secondary, candidate: C.primary };
const roleLabel = { interviewer: 'HR / Interviewer', candidate: 'Candidate' };

const VideoCard = ({ side, name, avatar, speaking, role, muted, camOn }) => (
    <div style={{
      flex: 1, borderRadius: 16, position: 'relative', overflow: 'hidden',
      background: `radial-gradient(ellipse at 40% 30%, #0f2040 0%, #070d1a 100%)`,
      border: `1px solid ${speaking ? roleColor[role] : C.borderMid}`,
      boxShadow: speaking ? `0 0 28px ${roleColor[role]}30` : 'none',
      transition: 'all 0.4s',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12,
      minHeight: 0,
    }}>
      {/* Speaking pulse */}
      {speaking && <div style={{
        position: 'absolute', inset: 0, border: `2px solid ${roleColor[role]}`,
        borderRadius: 16, animation: 'pulse-ring 1.5s ease infinite', pointerEvents: 'none',
      }} />}
      {/* Role badge */}
      <div style={{ position: 'absolute', top: 14, left: 14 }}>
        <Tag color={roleColor[role]}>{roleLabel[role]}</Tag>
      </div>
      {/* Mute / cam indicators */}
      <div style={{ position: 'absolute', top: 14, right: 14, display: 'flex', gap: 6 }}>
        {side === 'right' && muted && <Tag color={C.error}>Muted</Tag>}
        {side === 'right' && !camOn && <Tag color={C.warning}>No Cam</Tag>}
      </div>
      {/* Avatar */}
      <div style={{ fontSize: 56 }}>{avatar}</div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 15, fontWeight: 700 }}>{name}</div>
        {speaking && <MicWave active={true} />}
      </div>
      {/* Scan overlay */}
      <div style={{ position: 'absolute', left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${roleColor[role]}, transparent)`, animation: 'scan-line 4s linear infinite', opacity: 0.3 }} />
    </div>
  );

const P2PPage = () => {
  const router = useRouter();

  const [time, setTime] = React.useState(0);
  const [muted, setMuted] = React.useState(false);
  const [camOn, setCamOn] = React.useState(true);
  const [roles, setRoles] = React.useState({ left: 'interviewer', right: 'candidate' });
  const [aiTab, setAiTab] = React.useState('live');
  const [swapping, setSwapping] = React.useState(false);
  const [activeSpeaker, setActiveSpeaker] = React.useState('left');
  const [toast, setToast] = React.useState(null);

  React.useEffect(() => {
    const t = setInterval(() => setTime(x => x + 1), 1000);
    return () => clearInterval(t);
  }, []);
  React.useEffect(() => {
    const id = setInterval(() => setActiveSpeaker(s => s === 'left' ? 'right' : 'left'), 5000);
    return () => clearInterval(id);
  }, []);

  const fmt = s => `${String(Math.floor(s / 60)).padStart(2,'0')}:${String(s % 60).padStart(2,'0')}`;

  const swapRoles = () => {
    setSwapping(true);
    setTimeout(() => {
      setRoles(r => ({ left: r.right, right: r.left }));
      setSwapping(false);
      setToast('Roles swapped successfully!');
      setTimeout(() => setToast(null), 2500);
    }, 600);
  };

    
  

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', flexDirection: 'column' }}>
      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}

      {/* Top chrome */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 20px', borderBottom: `1px solid ${C.borderMid}`,
        background: 'rgba(7, 8, 22,0.98)', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => router.push('/peer-practice')} style={{ padding: '6px 14px', borderRadius: 7, border: `1px solid ${C.borderMid}`, background: 'transparent', color: C.textSecondary, cursor: 'pointer', fontFamily: 'Space Grotesk', fontSize: 12 }}>← Lobby</button>
          <div style={{ width: 1, height: 20, background: C.borderMid }} />
          <span style={{ fontSize: 14, fontWeight: 700 }}>Peer Interview Room</span>
          <Tag color={C.error}>● Live</Tag>
          <Tag color={C.secondary}>AI Observed</Tag>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* Swap roles */}
          <button onClick={swapRoles} style={{
            padding: '7px 16px', borderRadius: 8, border: `1px solid ${C.borderMid}`,
            background: swapping ? `rgba(167, 139, 250, 0.2)` : C.bgCard,
            color: C.primary, cursor: 'pointer', fontFamily: 'Space Grotesk', fontSize: 12, fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s',
          }}>
            ⇄ {swapping ? 'Swapping…' : 'Swap Roles'}
          </button>
          {/* Timer */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '6px 14px', background: C.bgCard, border: `1px solid ${C.borderMid}`, borderRadius: 8 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: C.error, animation: 'pulse-ring 1s infinite' }} />
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 14, color: C.error, fontWeight: 700 }}>{fmt(time)}</span>
          </div>
          {/* Controls */}
          <div style={{ display: 'flex', gap: 6 }}>
            {[
              { icon: muted ? '🔇' : '🎙', label: 'Mic', action: () => setMuted(m => !m), active: !muted },
              { icon: camOn ? '📹' : '📷', label: 'Cam', action: () => setCamOn(c => !c), active: camOn },
            ].map(({ icon, label, action, active }) => (
              <button key={label} onClick={action} style={{
                width: 38, height: 38, borderRadius: 8, border: `1px solid ${active ? C.borderMid : C.borderMid}`,
                background: active ? `rgba(167, 139, 250, 0.2)` : C.bgCard,
                color: active ? C.primary : C.textMuted, cursor: 'pointer', fontSize: 16,
                transition: 'all 0.2s',
              }}>{icon}</button>
            ))}
          </div>
          <NeonButton size="sm" variant="outline" style={{ borderColor: C.error + '60', color: C.error }} onClick={() => router.push('/report')}>End Session</NeonButton>
        </div>
      </div>

      {/* Main layout */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr 300px', gap: 0, overflow: 'hidden' }}>

        {/* Left video: Interviewer */}
        <div style={{ padding: 16, borderRight: `1px solid ${C.borderMid}`, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <VideoCard
            side="left"
            name="Jordan Kim"
            avatar="🧑"
            speaking={activeSpeaker === 'left'}
            role={roles.left}
            muted={muted}
            camOn={camOn}
          />
          {/* Stats below */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            {[{ l: 'Speaking', v: '62%' }, { l: 'Questions', v: '8' }, { l: 'Avg Pace', v: '142 wpm' }].map(({ l, v }) => (
              <div key={l} style={{ background: C.bgCard, borderRadius: 8, padding: '8px 10px', border: `1px solid ${C.borderMid}`, textAlign: 'center' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.secondary }}>{v}</div>
                <div style={{ fontSize: 9, color: C.textMuted, marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right video: Candidate */}
        <div style={{ padding: 16, borderRight: `1px solid ${C.borderMid}`, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <VideoCard
            side="right"
            name="You (Alex M.)"
            avatar="👤"
            speaking={activeSpeaker === 'right'}
            role={roles.right}
            muted={muted}
            camOn={camOn}
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            {[{ l: 'Speaking', v: '38%' }, { l: 'Responses', v: '7' }, { l: 'Avg Pace', v: '168 wpm' }].map(({ l, v }) => (
              <div key={l} style={{ background: C.bgCard, borderRadius: 8, padding: '8px 10px', border: `1px solid ${C.borderMid}`, textAlign: 'center' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.primary }}>{v}</div>
                <div style={{ fontSize: 9, color: C.textMuted, marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Observer Panel */}
        <div style={{ background: 'rgba(7, 8, 22,0.97)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Header */}
          <div style={{ padding: '14px 16px', borderBottom: `1px solid ${C.borderMid}`, background: `radial-gradient(ellipse at 50% 0%, rgba(139, 92, 246, 0.2) 0%, transparent 80%)` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: C.secondary, animation: 'pulse-ring 2s infinite' }} />
              <span style={{ fontSize: 13, fontWeight: 700 }}>AI Observer</span>
            </div>
            <div style={{ fontSize: 10, color: C.textMuted }}>Silently analyzing your session</div>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: `1px solid ${C.borderMid}`, flexShrink: 0 }}>
            {[['live','Live'],['notes','Notes']].map(([id, label]) => (
              <button key={id} onClick={() => setAiTab(id)} style={{
                flex: 1, padding: '9px 0', border: 'none', cursor: 'pointer',
                background: aiTab === id ? `rgba(139, 92, 246, 0.2)` : 'transparent',
                color: aiTab === id ? C.secondary : C.textMuted,
                fontFamily: 'Space Grotesk', fontSize: 11, fontWeight: 600,
                borderBottom: aiTab === id ? `2px solid ${C.secondary}` : '2px solid transparent',
                transition: 'all 0.2s',
              }}>{label}</button>
            ))}
          </div>

          <div style={{ flex: 1, overflow: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {aiTab === 'live' ? (
              <>
                {/* Live metrics */}
                <div style={{ fontSize: 10, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Real-time Analysis</div>
                {[
                  { l: 'Candidate Confidence', v: 74, c: C.primary },
                  { l: 'Communication Quality', v: 81, c: C.success },
                  { l: 'Answer Relevance', v: 88, c: C.success },
                  { l: 'Speaking Balance', v: 62, c: C.warning },
                  { l: 'Interruptions', v: 2, max: 10, c: C.error, raw: true },
                ].map(({ l, v, c, max, raw }) => (
                  <div key={l} style={{ background: C.bgCard, borderRadius: 8, padding: '10px 12px', border: `1px solid ${C.borderMid}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 11, color: C.textSecondary }}>{l}</span>
                      <span style={{ fontSize: 12, fontFamily: 'JetBrains Mono', color: c, fontWeight: 700 }}>{raw ? v : `${v}%`}</span>
                    </div>
                    <div style={{ height: 3, background: 'rgba(255,255,255,0.05)', borderRadius: 2 }}>
                      <div style={{ height: '100%', width: `${raw ? (v / max) * 100 : v}%`, background: c, borderRadius: 2, transition: 'width 0.8s ease' }} />
                    </div>
                  </div>
                ))}

                {/* Speaking time donut */}
                <div style={{ background: C.bgCard, borderRadius: 10, padding: '14px', border: `1px solid ${C.borderMid}` }}>
                  <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 12 }}>Speaking Time Split</div>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <svg width={60} height={60} viewBox="0 0 60 60">
                      <circle cx="30" cy="30" r="24" fill="none" stroke={`${C.secondary}30`} strokeWidth="8" />
                      <circle cx="30" cy="30" r="24" fill="none" stroke={C.secondary} strokeWidth="8"
                        strokeDasharray={`${0.62 * 2 * Math.PI * 24} ${2 * Math.PI * 24}`}
                        strokeDashoffset={2 * Math.PI * 24 * 0.25}
                        style={{ transform: 'rotate(-90deg)', transformOrigin: '30px 30px' }} />
                      <circle cx="30" cy="30" r="24" fill="none" stroke={C.primary} strokeWidth="8"
                        strokeDasharray={`${0.38 * 2 * Math.PI * 24} ${2 * Math.PI * 24}`}
                        strokeDashoffset={-2 * Math.PI * 24 * 0.37}
                        style={{ transform: 'rotate(-90deg)', transformOrigin: '30px 30px' }} />
                    </svg>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <div style={{ width: 8, height: 8, borderRadius: 2, background: C.secondary }} />
                        <span style={{ fontSize: 11, color: C.textSecondary }}>Interviewer <span style={{ color: C.secondary, fontWeight: 700 }}>62%</span></span>
                      </div>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <div style={{ width: 8, height: 8, borderRadius: 2, background: C.primary }} />
                        <span style={{ fontSize: 11, color: C.textSecondary }}>Candidate <span style={{ color: C.primary, fontWeight: 700 }}>38%</span></span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Live observation */}
                <div style={{ background: `rgba(139, 92, 246, 0.2)`, borderRadius: 10, padding: '12px 14px', border: `1px solid ${C.secondary}30` }}>
                  <div style={{ fontSize: 10, color: C.secondary, marginBottom: 6, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ animation: 'ai-think 1.2s ease infinite' }}>◉</span> AI is observing
                  </div>
                  <div style={{ fontSize: 11, color: C.textSecondary, lineHeight: 1.6 }}>
                    Candidate shows strong technical knowledge. Recommend asking deeper follow-up on scalability.
                  </div>
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 10, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Session Notes</div>
                {[
                  { ts: '00:45', text: 'Strong intro, clear background summary', type: 'pos' },
                  { ts: '02:12', text: 'Good use of STAR method for Q2', type: 'pos' },
                  { ts: '03:58', text: 'Candidate interrupted twice — work on active listening', type: 'warn' },
                  { ts: '05:34', text: 'Excellent system design explanation', type: 'pos' },
                  { ts: '07:20', text: 'Speaking pace high (168 wpm) — slow down', type: 'warn' },
                ].map(({ ts, text, type }, i) => (
                  <div key={i} style={{
                    padding: '10px 12px', borderRadius: 8,
                    background: type === 'pos' ? `${C.success}08` : `${C.warning}08`,
                    border: `1px solid ${type === 'pos' ? C.success + '25' : C.warning + '25'}`,
                    display: 'flex', gap: 10,
                  }}>
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: C.textMuted, marginTop: 2, flexShrink: 0 }}>{ts}</span>
                    <span style={{ fontSize: 11, color: C.textSecondary, lineHeight: 1.5 }}>{text}</span>
                  </div>
                ))}
                <NeonButton size="sm" onClick={() => router.push('/report')} style={{ justifyContent: 'center', marginTop: 4 }}>
                  End & View Report →
                </NeonButton>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── SYNTAX HIGHLIGHTER (lightweight) ────────────────────────────────────────
const highlight = (code) => {
  return code
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/\b(function|const|let|var|return|if|else|for|while|class|new|this|import|export|default|typeof|null|undefined|true|false|async|await|of|in)\b/g, '<span class="token-kw">$1</span>')
    .replace(/\b([A-Z][a-zA-Z0-9]*)\b/g, '<span class="token-type">$1</span>')
    .replace(/\b([a-z][a-zA-Z0-9]*)(?=\s*\()/g, '<span class="token-fn">$1</span>')
    .replace(/(".*?"|'.*?'|`.*?`)/g, '<span class="token-str">$1</span>')
    .replace(/\b(\d+)\b/g, '<span class="token-num">$1</span>')
    .replace(/(\/\/.*)/g, '<span class="token-cm">$1</span>');
};

// ─── PAGE 5: CODING INTERVIEW ─────────────────────────────────────────────────

export default P2PPage;
