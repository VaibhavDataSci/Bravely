"use client";
import React, { useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Code2, FileText, HeartHandshake, Network, Wrench, X } from 'lucide-react';
import { NeonButton } from '@/components/shared';
import { useAuth } from '@/contexts/AuthContext';
import {
  EXPERIENCE_LEVELS, INTERVIEW_ROUNDS, CONTEXT_TOOLTIPS,
  getContextsForRole, suggestContextsFromResume, suggestRolesFromResume,
} from './roleData';
import { SearchableRoleDropdown, SelectDropdown } from './Dropdowns';
import styles from './SoloSelect.module.css';

const ROUND_ICONS = { hr: HeartHandshake, technical: Wrench, coding: Code2, system_design: Network };
const MAX_RESUME_BYTES = 5 * 1024 * 1024;
const RESUME_EXTENSIONS = /\.(pdf|doc|docx)$/i;

function Section({ step, title, hint, done, children }) {
  return (
    <section className={styles.section}>
      <header className={styles.sectionHead}>
        <span className={styles.step} data-done={done} aria-hidden="true">
          {done ? <Check size={13} /> : step}
        </span>
        <h2>{title}</h2>
        {hint && <span className={styles.hint}>{hint}</span>}
      </header>
      {children}
    </section>
  );
}

export default function InterviewSetupPage() {
  const router = useRouter();
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  const [selectedRole, setSelectedRole] = useState(null);
  const [experienceLevel, setExperienceLevel] = useState(null);
  const [interviewRound, setInterviewRound] = useState(null);
  const [interviewContext, setInterviewContext] = useState(null);

  const profileResume = user?.profileResume || null;
  const [tempResume, setTempResume] = useState(null);
  const [resumeError, setResumeError] = useState('');
  const activeResume = tempResume || profileResume;

  const suggestedRoles = useMemo(
    () => (activeResume ? suggestRolesFromResume(activeResume) : []),
    [activeResume]
  );
  const availableContexts = selectedRole && interviewRound
    ? getContextsForRole(selectedRole.id, interviewRound)
    : [];
  const suggestedContexts = activeResume && selectedRole
    ? suggestContextsFromResume(activeResume, selectedRole.id).filter((ctx) => availableContexts.includes(ctx))
    : [];

  // Contexts depend on role and round, so a change to either clears the chosen context.
  const chooseRole = (role) => { setSelectedRole(role); setInterviewContext(null); };
  const chooseRound = (round) => { setInterviewRound(round); setInterviewContext(null); };

  const attachResume = (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!RESUME_EXTENSIONS.test(file.name)) {
      setResumeError('Use a PDF, DOC or DOCX file.');
      return;
    }
    if (file.size > MAX_RESUME_BYTES) {
      setResumeError('That file is over 5 MB.');
      return;
    }
    setResumeError('');
    // TODO(api): POST /api/profile/resume to parse skills. Until then only the filename is kept.
    setTempResume({ filename: file.name, fileSize: `${(file.size / 1024).toFixed(0)} KB`, isTemporary: true, skills: [] });
  };

  const level = EXPERIENCE_LEVELS.find((l) => l.id === experienceLevel);
  const round = INTERVIEW_ROUNDS.find((r) => r.id === interviewRound);
  const completed = [selectedRole, experienceLevel, interviewRound, interviewContext].filter(Boolean).length;
  const canStart = completed === 4;

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
    router.push(config.interviewRound === 'coding' ? '/coding' : '/solo-session');
  };

  return (
    <div className={styles.page}>
      <div className={styles.scroll}>
        <div className={styles.inner}>
          <div className={styles.head}>
            <h1>Set up your interview</h1>
            <p>Pick the role, level and round you are preparing for. Four steps are required.</p>
          </div>

          <div className={styles.layout}>
            <form id="interview-config" className={styles.form} onSubmit={(e) => { e.preventDefault(); handleStart(); }}>
              <Section step={1} title="Role" done={Boolean(selectedRole)}>
                <SearchableRoleDropdown value={selectedRole} onChange={chooseRole} />
                {suggestedRoles.length > 0 && !selectedRole && (
                  <div className={styles.suggest}>
                    <p className={styles.suggestLabel}>Suggested from your resume</p>
                    <div className={styles.chips}>
                      {suggestedRoles.map((r) => (
                        <button key={r.id} type="button" className={styles.chip} onClick={() => chooseRole(r)}>{r.name}</button>
                      ))}
                    </div>
                  </div>
                )}
              </Section>

              <Section step={2} title="Experience level" done={Boolean(experienceLevel)}>
                <SelectDropdown label="experience level" value={experienceLevel} options={EXPERIENCE_LEVELS} onChange={setExperienceLevel} />
              </Section>

              <Section step={3} title="Interview round" done={Boolean(interviewRound)}>
                <fieldset className={styles.choices}>
                  <legend className="sr-only">Interview round</legend>
                  {INTERVIEW_ROUNDS.map((r) => {
                    const Icon = ROUND_ICONS[r.id];
                    return (
                      <label key={r.id} className={styles.choice}>
                        <input type="radio" name="round" className="sr-only" checked={interviewRound === r.id} onChange={() => chooseRound(r.id)} />
                        {Icon && <Icon size={18} aria-hidden="true" />}
                        <span>
                          <span className={styles.choiceTitle}>{r.name}</span>
                          <span className={styles.choiceDesc} style={{ display: 'block' }}>{r.desc}</span>
                        </span>
                      </label>
                    );
                  })}
                </fieldset>
              </Section>

              <Section step={4} title="Interview context" done={Boolean(interviewContext)} hint={round && selectedRole ? `${selectedRole.name}, ${round.name}` : undefined}>
                {availableContexts.length === 0 ? (
                  <p className={styles.empty}>Choose a role and an interview round to see matching contexts.</p>
                ) : (
                  <>
                    {suggestedContexts.length > 0 && !interviewContext && (
                      <div className={styles.suggest} style={{ marginTop: 0, marginBottom: 12 }}>
                        <p className={styles.suggestLabel}>Suggested from your resume</p>
                        <div className={styles.chips}>
                          {suggestedContexts.map((ctx) => (
                            <button key={ctx} type="button" className={styles.chip} onClick={() => setInterviewContext(ctx)}>{ctx}</button>
                          ))}
                        </div>
                      </div>
                    )}
                    <fieldset className={styles.chips}>
                      <legend className="sr-only">Interview context</legend>
                      {availableContexts.map((ctx) => (
                        <label key={ctx} className={styles.chip}>
                          <input type="radio" name="context" className="sr-only" checked={interviewContext === ctx} onChange={() => setInterviewContext(ctx)} />
                          {ctx}
                        </label>
                      ))}
                    </fieldset>
                    {interviewContext && CONTEXT_TOOLTIPS[interviewContext] && (
                      <p className={styles.note}>{CONTEXT_TOOLTIPS[interviewContext]}</p>
                    )}
                  </>
                )}
              </Section>

              <Section step={5} title="Resume" hint="Optional">
                {activeResume ? (
                  <div className={styles.file}>
                    <FileText size={20} aria-hidden="true" />
                    <div className={styles.fileMeta}>
                      <div className={styles.fileName}>{activeResume.filename}</div>
                      <div className={styles.fileSub}>{tempResume ? 'This session only' : 'Your profile resume'}</div>
                    </div>
                    {tempResume && (
                      <button type="button" className="bv-icon-btn" aria-label="Remove attached resume" onClick={() => setTempResume(null)}>
                        <X size={16} aria-hidden="true" />
                      </button>
                    )}
                  </div>
                ) : (
                  <NeonButton variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
                    <FileText size={16} aria-hidden="true" /> Attach resume
                  </NeonButton>
                )}
                {activeResume && !tempResume && (
                  <div style={{ marginTop: 10 }}>
                    <NeonButton variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()}>Use a different file for this session</NeonButton>
                  </div>
                )}
                <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx" hidden onChange={attachResume} />
                {resumeError && <p className={styles.error} role="alert">{resumeError}</p>}
                <p className={styles.note}>PDF, DOC or DOCX up to 5 MB. Resume parsing is not connected yet, so an attached file does not change your questions.</p>
              </Section>
            </form>

            <aside className={styles.summary} aria-label="Session summary">
              <h2>Session summary</h2>
              <p className={styles.progress}>{completed} of 4 required steps done</p>
              <dl>
                <div><dt>Role</dt><dd data-empty={!selectedRole}>{selectedRole?.name || 'Not selected'}</dd></div>
                <div><dt>Level</dt><dd data-empty={!level}>{level?.name || 'Not selected'}</dd></div>
                <div><dt>Round</dt><dd data-empty={!round}>{round?.name || 'Not selected'}</dd></div>
                <div><dt>Context</dt><dd data-empty={!interviewContext}>{interviewContext || 'Not selected'}</dd></div>
                <div><dt>Resume</dt><dd data-empty={!activeResume}>{activeResume?.filename || 'None attached'}</dd></div>
              </dl>
              <p className={styles.fine}>Difficulty adapts to your answers during the session.</p>
            </aside>
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        <NeonButton type="submit" form="interview-config" size="lg" disabled={!canStart}>
          {canStart ? `Start ${selectedRole.name} interview` : `Complete ${4 - completed} more ${4 - completed === 1 ? 'step' : 'steps'}`}
        </NeonButton>
      </div>
    </div>
  );
}
