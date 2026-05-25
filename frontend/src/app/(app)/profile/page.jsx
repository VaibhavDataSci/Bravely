"use client";
import { useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useState, useRef } from 'react';
import { C } from '@/constants/theme';
import { GlassCard, Tag, NeonButton } from '@/components/shared';
import { useAuth } from '@/contexts/AuthContext';
import { fetchMilestones, fetchPerformance, fetchSessions, fetchSummary } from '@/services/dashboardService';
import { User, FileText, CheckCircle, Paperclip, CloudUpload, Flame, Zap, Trophy, Target, Gem, Star } from 'lucide-react';

// ─── SIMULATED RESUME PARSER ────────────────────────────────────────────────
const SIMULATED_PARSE_RESULTS = {
  skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'AWS', 'Docker', 'Redis', 'System Design'],
  projects: [
    { name: 'E-Commerce Platform', tech: ['React', 'Node.js', 'PostgreSQL'] },
    { name: 'Real-time Chat App', tech: ['WebSocket', 'Redis', 'Docker'] },
    { name: 'CI/CD Pipeline Automation', tech: ['AWS', 'Docker', 'GitHub Actions'] },
  ],
  education: 'B.Tech in Computer Science',
  experienceYears: 3,
};

// ─── PAGE: PROFILE ──────────────────────────────────────────────────────────
const ProfilePage = () => {
  const router = useRouter();
  const { user, updateProfileResume, removeProfileResume } = useAuth();
  const fileInputRef = useRef(null);

  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [parseSuccess, setParseSuccess] = useState(false);
  const [profileStats, setProfileStats] = useState({
    summary: null,
    sessions: [],
    milestones: [],
    points: [],
  });

  const profileResume = user?.profileResume || null;
  const displayName = user?.profileResume?.personalInfo?.name || user?.name || user?.email?.split('@')[0] || '';
  const displayEmail = user?.email || '';
  const plan = user?.plan ? `${String(user.plan).charAt(0).toUpperCase()}${String(user.plan).slice(1)} Plan` : 'Plan unavailable';
  const memberSince = user?.createdAt
    ? `Member since ${new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`
    : 'Member date unavailable';
  const currentRole = user?.profileResume?.personalInfo?.title || user?.preferences?.targetRole || user?.role || 'Role not set';
  const focus = user?.preferences?.focus || profileResume?.skills?.[0] || 'Focus not set';
  const metrics = profileStats.summary?.metrics || {};
  const streak = profileStats.summary?.streak?.current || user?.streak?.current || 0;
  const avgScore = Math.round(metrics.overall || 0);
  const sessions = profileStats.sessions || [];
  const earnedCount = (profileStats.milestones || []).filter((item) => item.done).length;
  const trendPoints = profileStats.points?.length ? profileStats.points : [];

  useEffect(() => {
    let cancelled = false;

    Promise.allSettled([
      fetchSummary(),
      fetchSessions(5),
      fetchMilestones(),
      fetchPerformance(30),
    ]).then(([summaryRes, sessionsRes, milestonesRes, performanceRes]) => {
      if (cancelled) return;
      setProfileStats({
        summary: summaryRes.status === 'fulfilled' ? summaryRes.value : null,
        sessions: sessionsRes.status === 'fulfilled' ? sessionsRes.value?.sessions || [] : [],
        milestones: milestonesRes.status === 'fulfilled' ? milestonesRes.value?.milestones || [] : [],
        points: performanceRes.status === 'fulfilled' ? performanceRes.value?.points || [] : [],
      });
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleFileUpload = (source) => {
    let file;
    if (source?.dataTransfer) {
      file = source.dataTransfer.files?.[0];
    } else if (source?.target) {
      file = source.target.files?.[0];
    }
    if (!file) return;

    setIsParsing(true);
    setParseSuccess(false);

    // Simulate AI parsing with a 2.5s delay
    setTimeout(() => {
      setIsParsing(false);
      setParseSuccess(true);
      updateProfileResume({
        filename: file.name,
        fileSize: (file.size / 1024).toFixed(1) + ' KB',
        uploadedAt: new Date().toISOString(),
        ...SIMULATED_PARSE_RESULTS,
      });
      // Clear success banner after 3s
      setTimeout(() => setParseSuccess(false), 3000);
    }, 2500);
  };

  const handleRemoveResume = () => {
    removeProfileResume();
    setParseSuccess(false);
  };

  const achievementIcons = useMemo(() => [Flame, Zap, Trophy, Target, Gem, Star], []);
  const achievements = (profileStats.milestones || []).map((item, index) => {
    const Icon = achievementIcons[index % achievementIcons.length];
    return { icon: <Icon size={28} />, label: item.label, earned: item.done };
  });

  const uploadTimestamp = profileResume?.uploadedAt
    ? new Date(profileResume.uploadedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <div style={{ flex: 1, height: '100vh', overflow: 'auto', padding: '32px 36px' }}>
      {/* Profile header */}
      <GlassCard style={{ marginBottom: 24, padding: '32px', background: `linear-gradient(135deg, rgba(6,182,212,0.06), rgba(124,58,237,0.06))` }}>
        <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
          <div style={{
            width: 96, height: 96, borderRadius: '50%',
            background: `linear-gradient(135deg, ${C.primary}, ${C.secondary})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 36, boxShadow: `0 0 30px rgba(167, 139, 250, 0.2)`,
            animation: 'glow-pulse 3s ease infinite',
          }}><User size={48} color="#fff" /></div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>{displayName || 'Signed-in user'}</h2>
            <p style={{ color: C.textSecondary, fontSize: 14, marginBottom: 12 }}>{[displayEmail, plan, memberSince].filter(Boolean).join(' · ')}</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <Tag>{currentRole}</Tag>
              <Tag color={C.secondary}>{focus}</Tag>
              <Tag color={C.success}>Active</Tag>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              { n: String(sessions.length), l: 'Interviews' },
              { n: avgScore ? String(avgScore) : '0', l: 'Avg Score' },
              { n: String(streak), l: 'Day Streak' },
              { n: `${earnedCount}/${Math.max(profileStats.milestones.length, 1)}`, l: 'Goals' },
            ].map(({ n, l }) => (
              <div key={l} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: C.primary, lineHeight: 1 }}>{n}</div>
                <div style={{ fontSize: 11, color: C.textMuted }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* ─── RESUME MANAGEMENT ─────────────────────────────────────────── */}
      <GlassCard style={{ marginBottom: 24, padding: '28px', background: 'linear-gradient(135deg, rgba(167,139,250,0.04), rgba(139,92,246,0.02))' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <span style={{ fontSize: 20, display: 'flex' }}><FileText size={20} /></span>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: C.textPrimary, margin: 0 }}>Resume Management</h3>
            </div>
            <p style={{ fontSize: 13, color: C.textSecondary, margin: 0 }}>
              Upload your resume and our AI will extract your skills, projects, and experience to personalize mock interviews.
            </p>
          </div>
          {profileResume && (
            <NeonButton variant="outline" size="sm" onClick={handleRemoveResume} style={{ flexShrink: 0 }}>
              Remove
            </NeonButton>
          )}
        </div>

        {/* Parse success banner */}
        {parseSuccess && (
          <div style={{
            padding: '12px 16px', borderRadius: 10, marginBottom: 16,
            background: 'rgba(34,197,94,0.08)', border: `1px solid rgba(34,197,94,0.25)`,
            display: 'flex', alignItems: 'center', gap: 10,
            animation: 'fade-up 0.4s ease',
          }}>
            <span style={{ fontSize: 18, display: 'flex' }}><CheckCircle size={18} color={C.success} /></span>
            <span style={{ fontSize: 13, color: C.success, fontWeight: 600 }}>Resume parsed successfully! Your interviews will now be personalized.</span>
          </div>
        )}

        {profileResume ? (
          /* ── UPLOADED STATE ── */
          <div style={{
            background: 'rgba(255,255,255,0.02)', border: `1px solid ${C.borderMid}`,
            borderRadius: 14, padding: '20px 24px',
          }}>
            {/* File info row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: `linear-gradient(135deg, ${C.primary}20, ${C.secondary}20)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22, border: `1px solid ${C.borderMid}`,
                }}><Paperclip size={24} color={C.primary} /></div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: C.textPrimary }}>{profileResume.filename}</div>
                  <div style={{ fontSize: 12, color: C.textMuted }}>{profileResume.fileSize} · Uploaded {uploadTimestamp}</div>
                </div>
              </div>
              <NeonButton size="sm" variant="outline" onClick={() => fileInputRef.current?.click()}>
                Replace Resume
              </NeonButton>
              <input type="file" accept=".pdf,.doc,.docx" hidden ref={fileInputRef} onChange={handleFileUpload} />
            </div>

            {/* Extracted skills */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10, fontWeight: 600 }}>
                Extracted Skills
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {profileResume.skills?.map(s => (
                  <Tag key={s} color={C.primary}>{s}</Tag>
                ))}
              </div>
            </div>

            {/* Extracted projects */}
            {profileResume.projects?.length > 0 && (
              <div>
                <div style={{ fontSize: 11, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10, fontWeight: 600 }}>
                  Detected Projects
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {profileResume.projects.map((p, i) => (
                    <div key={i} style={{
                      padding: '10px 14px', background: 'rgba(255,255,255,0.02)',
                      borderRadius: 8, border: `1px solid ${C.border}`,
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}>
                      <span style={{ fontSize: 13, fontWeight: 500, color: C.textPrimary }}>{p.name}</span>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {p.tech.map(t => (
                          <span key={t} style={{ fontSize: 11, color: C.textMuted, background: 'rgba(255,255,255,0.04)', padding: '2px 8px', borderRadius: 4 }}>{t}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ── UPLOAD STATE (drag & drop) ── */
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFileUpload(e); }}
            onClick={() => !isParsing && fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${isDragging ? C.primary : C.borderMid}`,
              borderRadius: 14, padding: '48px 24px', textAlign: 'center',
              background: isDragging ? 'rgba(167,139,250,0.06)' : 'rgba(255,255,255,0.01)',
              cursor: isParsing ? 'default' : 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
            }}
          >
            <input type="file" accept=".pdf,.doc,.docx" hidden ref={fileInputRef} onChange={handleFileUpload} />
            {isParsing ? (
              <>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  border: `3px solid ${C.borderMid}`, borderTopColor: C.primary,
                  animation: 'spin 1s linear infinite',
                }} />
                <div style={{ fontSize: 15, color: C.primary, fontWeight: 600 }}>Parsing Resume with AI...</div>
                <div style={{ fontSize: 13, color: C.textMuted }}>Extracting skills, projects, and experiences</div>
              </>
            ) : (
              <>
                <div style={{
                  width: 56, height: 56, borderRadius: 14,
                  background: `linear-gradient(135deg, ${C.primary}15, ${C.secondary}15)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 24, border: `1px solid ${C.borderMid}`,
                }}><CloudUpload size={28} color={C.primary} /></div>
                <div style={{ fontSize: 15, color: C.textPrimary, fontWeight: 500 }}>
                  <span style={{ color: C.primary, fontWeight: 600 }}>Click to upload</span> or drag and drop
                </div>
                <div style={{ fontSize: 12, color: C.textMuted }}>PDF, DOC, DOCX — up to 5MB</div>
              </>
            )}
          </div>
        )}
      </GlassCard>

      {/* ─── ACHIEVEMENTS & HISTORY ROW ────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Achievements */}
        <GlassCard>
          <div style={{ fontSize: 13, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>Achievements</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            {(achievements.length ? achievements : [{ icon: <Star size={28} />, label: 'Complete your first session', earned: false }]).map(({ icon, label, earned }) => (
              <div key={label} style={{
                borderRadius: 10, padding: '16px 10px', textAlign: 'center',
                background: earned ? `rgba(167, 139, 250, 0.2)` : C.bgCard,
                border: `1px solid ${C.borderMid}`,
                opacity: earned ? 1 : 0.4,
              }}>
                <div style={{ fontSize: 28, marginBottom: 6 }}>{icon}</div>
                <div style={{ fontSize: 10, color: earned ? C.textPrimary : C.textMuted, fontWeight: 600 }}>{label}</div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Interview history */}
        <GlassCard>
          <div style={{ fontSize: 13, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>Interview History</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(sessions.length ? sessions : []).map((s, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 14px', background: C.bgCard, borderRadius: 8, border: `1px solid ${C.borderMid}`,
                cursor: 'pointer', transition: 'all 0.2s',
              }} onClick={() => router.push('/report')}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{s.title || s.role || 'Interview session'}</div>
                  <div style={{ fontSize: 11, color: C.textMuted }}>{s.date} · {s.type}</div>
                </div>
                <div style={{
                  fontSize: 18, fontWeight: 800, fontFamily: 'JetBrains Mono',
                  color: s.score >= 85 ? C.success : s.score >= 75 ? C.primary : C.warning,
                }}>{s.score}</div>
              </div>
            ))}
            {!sessions.length && (
              <div style={{ padding: '14px', background: C.bgCard, borderRadius: 8, border: `1px solid ${C.borderMid}`, color: C.textMuted, fontSize: 13 }}>
                No interview history yet.
              </div>
            )}
          </div>
        </GlassCard>
      </div>

      {/* Progress over time */}
      <GlassCard>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 13, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Score Trend</div>
          <Tag color={C.success}>{trendPoints.length ? `${trendPoints.length} recent sessions` : 'No trend yet'}</Tag>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 80 }}>
          {(trendPoints.length ? trendPoints.map((p) => p.score || 0) : [0]).map((v, i, arr) => (
            <div key={i} style={{
              flex: 1, borderRadius: 4,
              height: `${(v / 100) * 80}px`,
              background: i === arr.length - 1
                ? `linear-gradient(to top, ${C.primary}, ${C.secondary})`
                : `${C.primary}${Math.round((i / Math.max(arr.length - 1, 1)) * 60 + 20).toString(16).padStart(2, '0')}`,
              transition: 'height 1s ease',
            }} />
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
          <span style={{ fontSize: 11, color: C.textMuted }}>{trendPoints[0]?.label || 'Start'}</span>
          <span style={{ fontSize: 11, color: C.textMuted }}>{trendPoints[trendPoints.length - 1]?.label || 'Now'}</span>
        </div>
      </GlassCard>
    </div>
  );
};

export default ProfilePage;
