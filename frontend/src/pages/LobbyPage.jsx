import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect, useRef } from 'react';
import { C } from '../constants/theme';
import { NeonButton, GlassCard, Tag } from '../components/shared';
import { Toast } from '../components/layout';

// ─── PAGE: P2P LOBBY ──────────────────────────────────────────────────────────
const LobbyPage = () => {
  const navigate = useNavigate();

  const [filter, setFilter] = React.useState('all');
  const [search, setSearch] = React.useState('');
  const [toast, setToast] = React.useState(null);
  const [activeReq, setActiveReq] = React.useState(null);

  const users = [
    { id: 1, name: 'Jordan Kim', role: 'candidate', status: 'available', level: 'Senior', focus: 'System Design', score: 88, avatar: '🧑', country: 'US' },
    { id: 2, name: 'Sam Lee', role: 'interviewer', status: 'available', level: 'Staff', focus: 'Behavioral', score: 92, avatar: '👩', country: 'IN' },
    { id: 3, name: 'Riley Torres', role: 'candidate', status: 'busy', level: 'Mid', focus: 'Frontend', score: 74, avatar: '🧔', country: 'UK' },
    { id: 4, name: 'Morgan Chen', role: 'interviewer', status: 'available', level: 'Principal', focus: 'Coding', score: 95, avatar: '👨', country: 'SG' },
    { id: 5, name: 'Taylor Wu', role: 'candidate', status: 'in-interview', level: 'Junior', focus: 'Backend', score: 67, avatar: '🧑‍💻', country: 'CA' },
    { id: 6, name: 'Casey Park', role: 'candidate', status: 'available', level: 'Senior', focus: 'ML/AI', score: 81, avatar: '👩‍💻', country: 'KR' },
    { id: 7, name: 'Alex Rivera', role: 'interviewer', status: 'available', level: 'Staff', focus: 'Mixed', score: 89, avatar: '🧑‍🔬', country: 'MX' },
    { id: 8, name: 'Jamie Okafor', role: 'candidate', status: 'busy', level: 'Mid', focus: 'DevOps', score: 79, avatar: '👨‍💼', country: 'NG' },
  ];

  const statusColor = { available: C.green, busy: C.amber, 'in-interview': C.red };
  const statusLabel = { available: 'Available', busy: 'Busy', 'in-interview': 'In Interview' };

  const filtered = users.filter(u => {
    if (filter === 'hr') return u.role === 'interviewer';
    if (filter === 'candidate') return u.role === 'candidate';
    if (filter === 'available') return u.status === 'available';
    return true;
  }).filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.focus.toLowerCase().includes(search.toLowerCase()));

  const sendRequest = (user) => {
    setActiveReq(user.id);
    setToast(`Interview request sent to ${user.name}!`);
    setTimeout(() => { setActiveReq(null); navigate('/p2p'); }, 2200);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div style={{ flex: 1, height: '100vh', overflow: 'auto', padding: '28px 32px', position: 'relative' }}>
      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 10 }}>
            Peer Arena
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.green, boxShadow: `0 0 10px ${C.green}`, marginTop: 2 }} />
          </h2>
          <p style={{ color: C.textDim, fontSize: 14 }}>
            <span style={{ color: C.green, fontWeight: 700 }}>6 online</span> · Connect with real users for live mock interviews
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <NeonButton variant="outline" size="sm" onClick={() => navigate('/dashboard')}>← Dashboard</NeonButton>
          <NeonButton size="sm" onClick={() => navigate('/p2p')}>Quick Match ⚡</NeonButton>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Online Now', value: '6', color: C.green, icon: '◉' },
          { label: 'Active Rooms', value: '3', color: C.cyan, icon: '◈' },
          { label: 'Available HR', value: '3', color: C.violetBright, icon: '🎙' },
          { label: 'Avg Wait', value: '< 2m', color: C.amber, icon: '⏱' },
        ].map(({ label, value, color, icon }) => (
          <GlassCard key={label} style={{ padding: '16px 18px', display: 'flex', gap: 14, alignItems: 'center' }}>
            <div style={{ fontSize: 20 }}>{icon}</div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
              <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>{label}</div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Search + Filter */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center' }}>
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', gap: 10,
          background: C.glass, border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 14px',
        }}>
          <span style={{ color: C.textMuted }}>🔍</span>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or focus area…"
            style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: C.text, fontFamily: 'Space Grotesk', fontSize: 13 }}
          />
        </div>
        <div style={{ display: 'flex', gap: 4, background: C.glass, borderRadius: 10, padding: 4, border: `1px solid ${C.border}` }}>
          {[['all','All'],['available','Available'],['hr','HR / Interviewer'],['candidate','Candidate']].map(([v, l]) => (
            <button key={v} onClick={() => setFilter(v)} style={{
              padding: '7px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: filter === v ? `linear-gradient(135deg, ${C.cyanGlow}, ${C.violetGlow})` : 'transparent',
              color: filter === v ? C.cyan : C.textMuted,
              fontFamily: 'Space Grotesk', fontSize: 12, fontWeight: 600,
              border: filter === v ? `1px solid ${C.borderMid}` : '1px solid transparent',
              transition: 'all 0.2s',
            }}>{l}</button>
          ))}
        </div>
      </div>

      {/* User grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {filtered.map(u => (
          <GlassCard key={u.id} hover style={{ padding: '20px 18px', textAlign: 'center', position: 'relative' }}>
            {/* Status dot */}
            <div style={{
              position: 'absolute', top: 14, right: 14,
              display: 'flex', alignItems: 'center', gap: 5,
            }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: statusColor[u.status], boxShadow: `0 0 8px ${statusColor[u.status]}` }} />
              <span style={{ fontSize: 9, color: statusColor[u.status], fontWeight: 600 }}>{statusLabel[u.status]}</span>
            </div>
            {/* Avatar */}
            <div style={{
              fontSize: 36, marginBottom: 10, width: 64, height: 64, borderRadius: '50%',
              background: `radial-gradient(ellipse, #1e3a5f, #07091a)`,
              border: `2px solid ${u.status === 'available' ? C.borderMid : C.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 10px',
              boxShadow: u.status === 'available' ? `0 0 16px ${C.cyanGlow}` : 'none',
            }}>{u.avatar}</div>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>{u.name}</div>
            <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 10 }}>{u.country} · {u.level}</div>
            <div style={{ display: 'flex', gap: 5, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
              <Tag color={u.role === 'interviewer' ? C.violetBright : C.cyan}>{u.role === 'interviewer' ? 'HR / Interviewer' : 'Candidate'}</Tag>
              <Tag color={C.textMuted}>{u.focus}</Tag>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 14 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: C.cyan }}>{u.score}</div>
                <div style={{ fontSize: 9, color: C.textMuted }}>Score</div>
              </div>
            </div>
            <NeonButton
              size="sm"
              variant={u.status === 'available' ? 'primary' : 'ghost'}
              style={{ width: '100%', justifyContent: 'center', opacity: u.status !== 'available' ? 0.4 : 1 }}
              onClick={() => u.status === 'available' && sendRequest(u)}
            >
              {activeReq === u.id ? '⟳ Requesting…' : u.status === 'available' ? 'Start Interview' : u.status === 'busy' ? 'Busy' : 'In Session'}
            </NeonButton>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};

// ─── PAGE: P2P INTERVIEW ROOM ─────────────────────────────────────────────────

export { LobbyPage };
