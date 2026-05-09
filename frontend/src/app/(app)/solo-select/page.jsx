"use client";
import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { C } from '@/constants/theme';
import { GlassCard, NeonButton, Tag } from '@/components/shared';
import { useAuth } from '@/contexts/AuthContext';
import { EXPERIENCE_LEVELS, INTERVIEW_ROUNDS, getContextsForRole, CONTEXT_TOOLTIPS, suggestContextsFromResume, suggestRolesFromResume } from './roleData';
import { SearchableRoleDropdown, SelectDropdown } from './Dropdowns';

const SIMULATED_PARSE = {
  skills: ['Python', 'TensorFlow', 'SQL', 'Pandas', 'Scikit-learn', 'AWS SageMaker'],
  projects: [{ name: 'ML Recommendation Engine', tech: ['Python', 'TensorFlow'] }],
  education: 'M.S. in Data Science', experienceYears: 2,
};

export default function RoleSelectionPage() {
  const router = useRouter();
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  // Config state
  const [selectedRole, setSelectedRole] = useState(null);
  const [experienceLevel, setExperienceLevel] = useState(null);
  const [interviewRound, setInterviewRound] = useState(null);
  const [interviewContext, setInterviewContext] = useState(null);
  const [hoveredCtx, setHoveredCtx] = useState(null);

  // Resume state
  const profileResume = user?.profileResume || null;
  const [tempResume, setTempResume] = useState(null);
  const [isParsing, setIsParsing] = useState(false);
  const [showTempUpload, setShowTempUpload] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const activeResume = tempResume || profileResume;

  // Suggested roles from resume
  const [suggestedRoles, setSuggestedRoles] = useState([]);
  useEffect(() => {
    if (activeResume) setSuggestedRoles(suggestRolesFromResume(activeResume));
    else setSuggestedRoles([]);
  }, [activeResume]);

  // Dynamic contexts based on role + round
  const availableContexts = selectedRole && interviewRound
    ? getContextsForRole(selectedRole.id, interviewRound)
    : [];

  // AI-suggested contexts from resume
  const suggestedContexts = activeResume && selectedRole
    ? suggestContextsFromResume(activeResume, selectedRole.id)
    : [];

  // Reset context when role or round changes
  useEffect(() => {
    setInterviewContext(null);
  }, [selectedRole?.id, interviewRound]);

  const handleTempUpload = (source) => {
    let file;
    if (source?.dataTransfer) file = source.dataTransfer.files?.[0];
    else if (source?.target) file = source.target.files?.[0];
    if (!file) return;
    setIsParsing(true);
    setTimeout(() => {
      setIsParsing(false);
      setTempResume({ filename: file.name, fileSize: (file.size / 1024).toFixed(1) + ' KB', uploadedAt: new Date().toISOString(), isTemporary: true, ...SIMULATED_PARSE });
      setShowTempUpload(false);
    }, 2000);
  };

  const canStart = selectedRole && experienceLevel && interviewRound && interviewContext;

  const handleStart = () => {
    if (!canStart) return;
    if (activeResume) sessionStorage.setItem('aia_session_resume', JSON.stringify(activeResume));
    else sessionStorage.removeItem('aia_session_resume');

    const config = {
      role: selectedRole.name,
      roleId: selectedRole.id,
      experienceLevel,
      interviewRound,
      interviewContext,
    };

    sessionStorage.setItem('aia_session_config', JSON.stringify(config));

    if (config.interviewRound === 'coding') {
      router.push('/coding');
      return;
    }

    router.push('/solo-session');
  };

  const step1Done = !!selectedRole;
  const step2Done = !!experienceLevel;
  const step3Done = !!interviewRound;
  const step5Done = !!interviewContext;

  return (
    <div style={{ flex: 1, padding: '40px 48px', overflowY: 'auto', paddingBottom: 120 }}>

      {/* Title */}
      <div style={{ marginBottom: 36, textAlign: 'center' }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: C.textPrimary, marginBottom: 10, letterSpacing: '-0.02em' }}>
          Configure Your Mock Interview
        </h1>
        <p style={{ color: C.textSecondary, fontSize: 16, maxWidth: 640, margin: '0 auto', lineHeight: 1.5 }}>
          Set up your session like a real interview - choose role, level, round, and context.
        </p>
      </div>

      <div style={{ maxWidth: 820, margin: '0 auto' }}>

        {/* STEP 1: ROLE */}
        <GlassCard style={{ padding: '24px 28px', marginBottom: 20, background: 'linear-gradient(135deg, rgba(167,139,250,0.04), rgba(139,92,246,0.02))' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: step1Done ? C.success : `${C.primary}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: step1Done ? '#fff' : C.primary }}>
              {step1Done ? '✓' : '1'}
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: C.textPrimary, margin: 0 }}>Select Role</h3>
          </div>
          <SearchableRoleDropdown value={selectedRole} onChange={setSelectedRole} />
          {suggestedRoles.length > 0 && !selectedRole && (
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 11, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>AI</span> Suggested Roles (based on your resume)
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {suggestedRoles.map(r => (
                  <button key={r.id} onClick={() => setSelectedRole(r)} style={{
                    padding: '8px 14px', borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: 'pointer',
                    background: 'rgba(167,139,250,0.08)', border: `1px solid ${C.primary}40`, color: C.primary,
                    display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s',
                  }}>
                    <span>{r.icon}</span> {r.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </GlassCard>

        {/* STEP 2: EXPERIENCE LEVEL */}
        <GlassCard style={{ padding: '24px 28px', marginBottom: 20, opacity: step1Done ? 1 : 0.4, pointerEvents: step1Done ? 'auto' : 'none', transition: 'opacity 0.3s' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: step2Done ? C.success : `${C.primary}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: step2Done ? '#fff' : C.primary }}>
              {step2Done ? '✓' : '2'}
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: C.textPrimary, margin: 0 }}>Experience Level</h3>
          </div>
          <SelectDropdown label="Experience Level" value={experienceLevel} options={EXPERIENCE_LEVELS} onChange={setExperienceLevel} />
        </GlassCard>

        {/* STEP 3: INTERVIEW ROUND */}
        <GlassCard style={{ padding: '24px 28px', marginBottom: 20, opacity: step2Done ? 1 : 0.4, pointerEvents: step2Done ? 'auto' : 'none', transition: 'opacity 0.3s' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: step3Done ? C.success : `${C.primary}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: step3Done ? '#fff' : C.primary }}>
              {step3Done ? '✓' : '3'}
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: C.textPrimary, margin: 0 }}>Interview Round</h3>
          </div>
          <SelectDropdown label="Interview Round" value={interviewRound} options={INTERVIEW_ROUNDS} onChange={setInterviewRound} />
        </GlassCard>

        {/* STEP 4: RESUME */}
        <GlassCard style={{ padding: '24px 28px', marginBottom: 20, background: 'linear-gradient(135deg, rgba(167,139,250,0.04), rgba(139,92,246,0.02))', border: `1px solid ${activeResume ? 'rgba(34,197,94,0.2)' : C.borderMid}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <span style={{ fontSize: 18 }}>📄</span>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: C.textPrimary, margin: 0 }}>Resume <span style={{ fontSize: 12, color: C.textMuted, fontWeight: 400 }}>(optional)</span></h3>
          </div>
          {profileResume && !tempResume && !showTempUpload && (
            <div>
              <div style={{ padding: '16px 20px', background: 'rgba(34,197,94,0.06)', border: `1px solid rgba(34,197,94,0.15)`, borderRadius: 12, marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: `${C.success}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>✅</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary }}>This is your already uploaded resume</div>
                    <div style={{ fontSize: 12, color: C.textMuted }}>{profileResume.filename}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, paddingLeft: 48 }}>
                  {profileResume.skills?.slice(0, 5).map(s => <Tag key={s} color={C.primary}>{s}</Tag>)}
                  {profileResume.skills?.length > 5 && <Tag color={C.textMuted}>+{profileResume.skills.length - 5}</Tag>}
                </div>
              </div>
              <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.02)', border: `1px solid ${C.borderMid}`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 13, color: C.textSecondary }}>Do you have a new one to upload as temporary?</div>
                <NeonButton size="sm" variant="outline" onClick={() => setShowTempUpload(true)}>Upload Temporary</NeonButton>
              </div>
            </div>
          )}
          {tempResume && !showTempUpload && (
            <div>
              <div style={{ padding: '14px 18px', background: 'rgba(245,158,11,0.06)', border: `1px solid rgba(245,158,11,0.2)`, borderRadius: 12, marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 16 }}>⚡</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary }}>Temporary Resume - {tempResume.filename}</div>
                    <div style={{ fontSize: 12, color: C.warning, fontStyle: 'italic' }}>Session only — won't replace your profile resume</div>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {profileResume && <NeonButton size="sm" variant="outline" onClick={() => setTempResume(null)}>↩ Profile Resume</NeonButton>}
                <NeonButton size="sm" variant="ghost" onClick={() => { setTempResume(null); setShowTempUpload(true); }}>Upload Different</NeonButton>
              </div>
            </div>
          )}
          {((!profileResume && !tempResume && !showTempUpload) || showTempUpload) && (
            <div>
              {showTempUpload && <button onClick={() => setShowTempUpload(false)} style={{ background: 'none', border: 'none', color: C.textMuted, fontSize: 13, cursor: 'pointer', marginBottom: 10 }}>← Back</button>}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleTempUpload(e); }}
                onClick={() => !isParsing && fileInputRef.current?.click()}
                style={{ border: `2px dashed ${isDragging ? C.primary : C.borderMid}`, borderRadius: 14, padding: '32px 20px', textAlign: 'center', background: isDragging ? 'rgba(167,139,250,0.06)' : 'rgba(255,255,255,0.01)', cursor: isParsing ? 'default' : 'pointer', transition: 'all 0.3s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}
              >
                <input type="file" accept=".pdf,.doc,.docx" hidden ref={fileInputRef} onChange={handleTempUpload} />
                {isParsing ? (
                  <><div style={{ width: 40, height: 40, borderRadius: '50%', border: `3px solid ${C.borderMid}`, borderTopColor: C.primary, animation: 'spin 1s linear infinite' }} /><div style={{ fontSize: 14, color: C.primary, fontWeight: 600 }}>Parsing Resume...</div></>
                ) : (
                  <><div style={{ fontSize: 28 }}>📄</div><div style={{ fontSize: 14, color: C.textPrimary }}><span style={{ color: C.primary, fontWeight: 600 }}>{showTempUpload ? 'Upload Temporary Resume' : 'Please upload your resume'}</span> or drag & drop</div><div style={{ fontSize: 12, color: C.textMuted }}>PDF, DOC, DOCX - up to 5MB</div></>
                )}
              </div>
            </div>
          )}
        </GlassCard>

        {/* STEP 5: INTERVIEW CONTEXT (dynamic) */}
        <GlassCard style={{ padding: '24px 28px', marginBottom: 20, opacity: step3Done ? 1 : 0.4, pointerEvents: step3Done ? 'auto' : 'none', transition: 'opacity 0.3s' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: step5Done ? C.success : `${C.primary}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: step5Done ? '#fff' : C.primary }}>
              {step5Done ? '✓' : '5'}
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: C.textPrimary, margin: 0 }}>Interview Context</h3>
          </div>
          <p style={{ fontSize: 12, color: C.textMuted, marginBottom: 14, paddingLeft: 38 }}>
            {step3Done
              ? `Contexts tailored for ${selectedRole?.name} - ${INTERVIEW_ROUNDS.find(r => r.id === interviewRound)?.name}`
              : 'Complete the steps above to see context options.'}
          </p>

          {/* AI suggested contexts from resume */}
          {suggestedContexts.length > 0 && !interviewContext && (
            <div style={{ marginBottom: 14, paddingLeft: 38 }}>
              <div style={{ fontSize: 11, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
                <span>AI</span> Recommended
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {suggestedContexts.map(ctx => (
                  <button key={ctx} onClick={() => setInterviewContext(ctx)} style={{
                    padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    background: `linear-gradient(135deg, ${C.primary}18, ${C.secondary}12)`,
                    border: `1px solid ${C.primary}50`, color: C.primary,
                    transition: 'all 0.2s', animation: 'fade-up 0.3s ease',
                  }}>
                    ✨ {ctx}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Context pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, paddingLeft: 38, position: 'relative' }}>
            {availableContexts.map(ctx => {
              const isSelected = interviewContext === ctx;
              const isHovered = hoveredCtx === ctx;
              return (
                <div key={ctx} style={{ position: 'relative' }}
                  onMouseEnter={() => setHoveredCtx(ctx)}
                  onMouseLeave={() => setHoveredCtx(null)}
                >
                  <button onClick={() => setInterviewContext(ctx)} style={{
                    padding: '10px 20px', borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                    background: isSelected
                      ? `linear-gradient(135deg, ${C.primary}25, ${C.secondary}18)`
                      : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${isSelected ? C.primary : C.borderMid}`,
                    color: isSelected ? C.primary : C.textSecondary,
                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                    boxShadow: isSelected ? `0 0 16px ${C.primary}20` : 'none',
                  }}>
                    {ctx}
                  </button>

                  {/* Tooltip */}
                  {isHovered && CONTEXT_TOOLTIPS[ctx] && !isSelected && (
                    <div style={{
                      position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)',
                      padding: '6px 12px', borderRadius: 8, fontSize: 11, color: C.textPrimary,
                      background: C.bgElevated, border: `1px solid ${C.borderMid}`,
                      whiteSpace: 'nowrap', marginBottom: 6, zIndex: 60,
                      boxShadow: '0 8px 24px rgba(0,0,0,0.4)', animation: 'fade-up 0.15s ease',
                    }}>
                      {CONTEXT_TOOLTIPS[ctx]}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </GlassCard>

        {/* SESSION SUMMARY */}
        {canStart && (
          <GlassCard style={{ padding: '20px 24px', marginBottom: 20, border: `1px solid ${C.primary}30`, animation: 'fade-up 0.3s ease' }}>
            <div style={{ fontSize: 12, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Session Summary</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <Tag color={C.primary}>{selectedRole?.icon} {selectedRole?.name}</Tag>
              <Tag color={C.secondary}>{EXPERIENCE_LEVELS.find(e => e.id === experienceLevel)?.name}</Tag>
              <Tag color={C.info}>{INTERVIEW_ROUNDS.find(r => r.id === interviewRound)?.icon} {INTERVIEW_ROUNDS.find(r => r.id === interviewRound)?.name}</Tag>
              <Tag color={C.warning}>{interviewContext}</Tag>
              {activeResume && <Tag color={C.success}>?? Resume Active</Tag>}
            </div>
            <p style={{ fontSize: 12, color: C.textMuted, marginTop: 10, fontStyle: 'italic' }}>
              Difficulty will be adapted automatically by AI based on your performance.
            </p>
          </GlassCard>
        )}
      </div>

      {/* Bottom CTA */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '24px 40px', background: 'linear-gradient(to top, #0A0D14 60%, transparent)', display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
        <div style={{ pointerEvents: 'auto' }}>
          <NeonButton onClick={handleStart} variant="primary" style={{
            padding: '16px 44px', fontSize: 18, opacity: canStart ? 1 : 0.4,
            transform: canStart ? 'translateY(0)' : 'translateY(10px)', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}>
            {canStart ? `Start ${selectedRole?.name} Interview ?` : 'Complete Setup Above'}
          </NeonButton>
        </div>
      </div>
    </div>
  );
}
