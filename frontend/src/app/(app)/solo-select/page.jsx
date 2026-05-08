"use client";
import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { C } from '@/constants/theme';
import { GlassCard, NeonButton } from '@/components/shared';

const ROLES = [
  { id: 'se', name: 'Software Engineer', icon: '💻', desc: 'Data structures, algorithms, and web dev constraints.' },
  { id: 'pm', name: 'Product Manager', icon: '🚀', desc: 'Product sense, execution, and strategy questions.' },
  { id: 'da', name: 'Data Analyst', icon: '📊', desc: 'SQL, A/B testing, and data interpretation.' },
  { id: 'hr', name: 'HR / Behavioral', icon: '🤝', desc: 'Culture fit, conflict resolution, and teamwork.' },
  { id: 'sd', name: 'System Design', icon: '🏗️', desc: 'Scalability, architecture, and distributed systems.' },
];

const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

const CONTEXTS_BY_ROLE = {
  se: ['General', 'FAANG', 'Startup', 'System Design'],
  pm: ['Product Sense', 'Case Study', 'Strategy', 'FAANG'],
  da: ['General', 'SQL Heavy', 'Business Case', 'FAANG Style'],
  hr: ['General', 'Culture Fit', 'Behavioral', 'Conflict Resolution'],
  sd: ['General', 'Architecture', 'Distributed Systems', 'FAANG'],
  default: ['General', 'FAANG', 'Startup']
};

export default function RoleSelectionPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState(null);
  const [difficulty, setDifficulty] = useState('Medium');
  const [interviewContext, setInterviewContext] = useState('General');

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    // Reset context if the current one isn't available for the newly selected role
    const availableContexts = CONTEXTS_BY_ROLE[role.id] || CONTEXTS_BY_ROLE.default;
    if (!availableContexts.includes(interviewContext)) {
      setInterviewContext(availableContexts[0]);
    }
  };

  const handleStart = () => {
    if (!selectedRole) return;
    router.push('/solo-session', { 
      state: { 
        role: selectedRole.name, 
        roleId: selectedRole.id,
        difficulty,
        context: interviewContext
      } 
    });
  };

  return (
    <div style={{ flex: 1, padding: '40px 48px', overflowY: 'auto' }}>
      
      <div style={{ marginBottom: 40, textAlign: 'center' }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: C.textPrimary, marginBottom: 12, letterSpacing: '-0.02em' }}>
          What role do you want to practice today?
        </h1>
        <p style={{ color: C.textSecondary, fontSize: 16, maxWidth: 640, margin: '0 auto', lineHeight: 1.5 }}>
          Choose a role and configure your constraints to tailor the AI interviewer's evaluations perfectly to your path.
        </p>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
        gap: 24,
        maxWidth: 1000,
        margin: '0 auto 40px auto',
      }}>
        {ROLES.map(role => (
          <RoleCard 
            key={role.id} 
            role={role} 
            isSelected={selectedRole?.id === role.id}
            onSelect={() => handleRoleSelect(role)} 
          />
        ))}
      </div>

      {/* Filters (Disabled if no role is selected) */}
      <div style={{ 
        display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 40,
        maxWidth: 1000, margin: '0 auto', paddingBottom: 100,
        opacity: selectedRole ? 1 : 0.4,
        pointerEvents: selectedRole ? 'auto' : 'none',
        transition: 'opacity 0.3s ease'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={{ fontSize: 13, color: C.textMuted, fontWeight: 600 }}>Difficulty</label>
          <div style={{ display: 'flex', gap: 8, background: 'rgba(255,255,255,0.02)', padding: 6, borderRadius: 12, border: `1px solid ${C.borderMid}` }}>
            {DIFFICULTIES.map(d => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 500,
                  background: difficulty === d ? 'rgba(255,255,255,0.1)' : 'transparent',
                  color: difficulty === d ? C.textPrimary : C.textSecondary,
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: difficulty === d ? `0 2px 8px rgba(0,0,0,0.2)` : 'none'
                }}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={{ fontSize: 13, color: C.textMuted, fontWeight: 600 }}>Interview Context</label>
          <div style={{ display: 'flex', gap: 8, background: 'rgba(255,255,255,0.02)', padding: 6, borderRadius: 12, border: `1px solid ${C.borderMid}` }}>
            {(selectedRole ? CONTEXTS_BY_ROLE[selectedRole.id] : CONTEXTS_BY_ROLE.default).map(c => (
              <button
                key={c}
                onClick={() => setInterviewContext(c)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 500,
                  background: interviewContext === c ? 'rgba(255,255,255,0.1)' : 'transparent',
                  color: interviewContext === c ? C.textPrimary : C.textSecondary,
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: interviewContext === c ? `0 2px 8px rgba(0,0,0,0.2)` : 'none'
                }}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Bottom CTA */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        padding: '24px 40px',
        background: 'linear-gradient(to top, #0A0D14 60%, transparent)',
        display: 'flex', justifyContent: 'center', pointerEvents: 'none'
      }}>
        <div style={{ pointerEvents: 'auto' }}>
          <NeonButton 
            onClick={handleStart}
            variant="primary"
            style={{ 
              padding: '16px 40px', 
              fontSize: 18, 
              opacity: selectedRole ? 1 : 0.5,
              transform: selectedRole ? 'translateY(0)' : 'translateY(20px)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            {selectedRole ? `Start ${selectedRole.name} Interview` : 'Select a Role'}
          </NeonButton>
        </div>
      </div>

    </div>
  );
};

const RoleCard = ({ role, isSelected, onSelect }) => {
  const [hover, setHover] = useState(false);

  const isActive = isSelected || hover;

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onSelect}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '32px 24px',
        background: isSelected ? 'rgba(255,255,255,0.08)' : (hover ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)'),
        borderRadius: 16,
        border: `1px solid ${isSelected ? C.primary : (hover ? 'rgba(6,182,212,0.5)' : C.borderMid)}`,
        transform: isSelected ? 'scale(1.05)' : (hover ? 'translateY(-4px)' : 'scale(1)'),
        boxShadow: isSelected ? `0 0 32px ${C.primary}40, inset 0 0 16px ${C.primary}10` : (hover ? `0 12px 32px rgba(6,182,212,0.15)` : 'none'),
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        textAlign: 'center',
        cursor: 'pointer'
      }}
    >
      <div style={{ 
        fontSize: 40, marginBottom: 16,
        transform: isActive ? 'scale(1.1)' : 'none',
        transition: 'transform 0.3s ease'
      }}>
        {role.icon}
      </div>
      <h3 style={{ fontSize: 18, fontWeight: 700, color: isActive ? C.textPrimary : C.textSecondary, marginBottom: 12, transition: 'color 0.3s ease' }}>
        {role.name}
      </h3>
      <p style={{ fontSize: 14, color: isActive ? '#eee' : C.textMuted, flex: 1, margin: 0, lineHeight: 1.5, transition: 'color 0.3s ease' }}>
        {role.desc}
      </p>
    </div>
  );
};
