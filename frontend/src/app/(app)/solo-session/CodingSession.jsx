"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { C } from '@/constants/theme';
import { getProblemsForSession, CODING_AI_MESSAGES, LANGUAGES } from './codingProblems';
import s from './coding.module.css';

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const fmt = sec => `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;
const diffClass = d => d === 'Easy' ? s.tagEasy : d === 'Hard' ? s.tagHard : s.tagMedium;

// Language color mapping for icons
const LANG_COLORS = {
  javascript: '#f7df1e', typescript: '#3178c6', python: '#3776ab', java: '#ed8b00',
  csharp: '#68217a', go: '#00add8', rust: '#ce422b', php: '#777bb4', ruby: '#cc342d',
  c: '#555555', cpp: '#00599c', kotlin: '#7f52ff', swift: '#f05138', sql: '#e38c00',
  scala: '#dc322f', dart: '#0175c2', r: '#276dc3',
};

// Fuzzy match for language search
const matchLang = (lang, query) => {
  const q = query.toLowerCase();
  return lang.name.toLowerCase().includes(q)
    || lang.id.includes(q)
    || (lang.aliases || []).some(a => a.includes(q));
};

export default function CodingSession({ config, resume }) {
  const router = useRouter();
  const [problems, setProblems] = useState([]);
  const [idx, setIdx] = useState(0);
  const [lang, setLang] = useState('javascript');
  const [code, setCode] = useState('');
  const [output, setOutput] = useState([]);
  const [time, setTime] = useState(0);
  const [aiState, setAiState] = useState('intro');
  const [aiMsg, setAiMsg] = useState('');
  const [hints, setHints] = useState(0);
  const [results, setResults] = useState(null);
  const [done, setDone] = useState(false);
  const [leftTab, setLeftTab] = useState('problem');
  const [rightTab, setRightTab] = useState('chat');
  const [chat, setChat] = useState([]);
  const [conOpen, setConOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [langSearch, setLangSearch] = useState('');
  const edRef = useRef(null);
  const langRef = useRef(null);
  const chatEnd = useRef(null);

  // Init
  useEffect(() => {
    const p = getProblemsForSession(config, resume);
    setProblems(p);
    if (p.length) setCode(p[0].starterCode[lang] || '');
    const msg = pick(CODING_AI_MESSAGES.intro);
    setAiMsg(msg);
    setChat([{ role: 'ai', text: msg, t: '00:00' }]);
    setTimeout(() => {
      setAiState('waiting');
      const m2 = pick(CODING_AI_MESSAGES.askApproach);
      setAiMsg(m2);
      setChat(prev => [...prev, { role: 'ai', text: m2, t: fmt(5) }]);
    }, 5000);
  }, [config, resume]);

  useEffect(() => {
    const p = problems[idx];
    if (p && !done) {
      const langObj = LANGUAGES.find(l => l.id === lang);
      setCode(p.starterCode[lang] || langObj?.starter || '// Language not available for this problem');
    }
  }, [lang]);

  // Close lang dropdown on outside click
  useEffect(() => {
    const handler = (e) => { if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  useEffect(() => { const t = setInterval(() => setTime(x => x + 1), 1000); return () => clearInterval(t); }, []);
  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: 'smooth' }); }, [chat]);

  const prob = problems[idx];

  const pushAi = (text) => {
    setAiMsg(text);
    setChat(prev => [...prev, { role: 'ai', text, t: fmt(time) }]);
  };

  const handleKey = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const ta = edRef.current, st = ta.selectionStart;
      setCode(code.substring(0, st) + '  ' + code.substring(ta.selectionEnd));
      setTimeout(() => { ta.selectionStart = ta.selectionEnd = st + 2; }, 0);
    }
  };

  const handleRun = useCallback(() => {
    if (!prob) return;
    setConOpen(true);
    setOutput([{ type: 'info', text: '▶ Running tests...' }]);
    setAiState('reviewing');
    pushAi('Running your solution against test cases...');
    setTimeout(() => {
      const res = prob.testCases.map((tc, i) => ({ ...tc, pass: Math.random() > 0.3, i: i + 1 }));
      setResults(res);
      const pc = res.filter(r => r.pass).length;
      setOutput([
        ...res.map(r => ({ type: r.pass ? 'success' : 'error', text: `Test ${r.i}: ${r.pass ? '✓ Pass' : '✗ Fail'} | Input: ${r.input} → Expected: ${r.expected}` })),
        { type: 'info', text: `${pc}/${res.length} passed` }
      ]);
      if (res.every(r => r.pass)) { setAiState('impressed'); pushAi(pick(CODING_AI_MESSAGES.goodSolution)); }
      else { setAiState('hinting'); pushAi(pick(CODING_AI_MESSAGES.wrongAnswer)); }
    }, 2000);
  }, [prob, time]);

  const handleSubmit = useCallback(() => {
    if (!prob) return;
    setConOpen(true);
    setOutput([{ type: 'info', text: '⏳ Submitting...' }]);
    setAiState('evaluating');
    pushAi('Evaluating your solution...');
    setTimeout(() => {
      const sc = Math.floor(Math.random() * 30) + 65, pass = sc >= 80;
      setOutput([
        { type: pass ? 'success' : 'warning', text: pass ? '✓ Accepted' : '✗ Wrong Answer' },
        { type: 'info', text: `Score: ${sc}/100 · Runtime: ${Math.floor(Math.random() * 80) + 20}ms · Memory: ${(Math.random() * 10 + 5).toFixed(1)} MB` }
      ]);
      setDone(true);
      if (idx < problems.length - 1) { setAiState('followup'); pushAi(pass ? pick(CODING_AI_MESSAGES.followUp) : pick(CODING_AI_MESSAGES.askOptimize)); }
      else { setAiState('complete'); pushAi("Great work! You've completed all coding challenges."); }
    }, 3000);
  }, [prob, idx, problems.length, time]);

  const nextProblem = () => {
    const n = idx + 1;
    if (n < problems.length) {
      setIdx(n); setCode(problems[n].starterCode[lang] || ''); setOutput([]); setResults(null);
      setDone(false); setHints(0); setConOpen(false); setAiState('waiting');
      pushAi(pick(CODING_AI_MESSAGES.askApproach));
    } else router.push('/report');
  };

  const getHint = () => {
    if (!prob) return;
    const h = Math.min(hints, prob.hints.length - 1);
    setHints(x => x + 1);
    setAiState('hinting');
    pushAi(prob.hints[h] || pick(CODING_AI_MESSAGES.hintGentle));
  };

  const quickReply = (text) => {
    setChat(prev => [...prev, { role: 'user', text, t: fmt(time) }]);
    setTimeout(() => pushAi(pick([
      "Good thinking. Can you implement that?",
      "Interesting. What's the time complexity?",
      "How would you handle edge cases?",
      "Go ahead and code it up.",
    ])), 1500);
  };

  if (!prob) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#080b12', color: '#64748b' }}>Loading...</div>;

  const stateMap = {
    intro: { label: 'Introducing...', color: '#a78bfa' }, waiting: { label: 'Observing your code', color: '#64748b' },
    reviewing: { label: 'Running Tests...', color: '#f59e0b' }, evaluating: { label: 'Evaluating...', color: '#60a5fa' },
    impressed: { label: 'Excellent!', color: '#22c55e' }, hinting: { label: 'Hint Available', color: '#f59e0b' },
    followup: { label: 'Next Ready', color: '#a78bfa' }, complete: { label: 'Complete', color: '#22c55e' },
  };
  const ai = stateMap[aiState] || stateMap.waiting;
  const lines = (code || '').split('\n').length;
  const currentLang = LANGUAGES.find(l => l.id === lang) || LANGUAGES[0];
  const fileExt = currentLang.ext || '.js';
  const filteredLangs = langSearch ? LANGUAGES.filter(l => matchLang(l, langSearch)) : LANGUAGES;

  return (
    <div className={s.root}>
      {/* ═══ TOP BAR ═══ */}
      <div className={s.topBar}>
        <div className={s.topLeft}>
          <span className={`${s.badge} ${s.badgePrimary}`}>Coding Interview</span>
        </div>
        <div className={s.topRight}>
          {/* Language Dropdown */}
          <div ref={langRef} style={{ position: 'relative' }}>
            <button onClick={() => { setLangOpen(x => !x); setLangSearch(''); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '5px 14px', borderRadius: 8, cursor: 'pointer',
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                color: '#f1f5f9', fontSize: 12, fontWeight: 600, fontFamily: 'inherit', transition: 'all 0.2s',
              }}>
              <span style={{
                width: 22, height: 22, borderRadius: 5, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 9, fontWeight: 800, letterSpacing: '-0.02em',
                background: `${LANG_COLORS[lang] || '#a78bfa'}20`, color: LANG_COLORS[lang] || '#a78bfa',
                border: `1px solid ${LANG_COLORS[lang] || '#a78bfa'}30`,
              }}>{currentLang.icon}</span>
              {currentLang.name}
              <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', marginLeft: 2 }}>{langOpen ? '▲' : '▼'}</span>
            </button>

            {/* Dropdown Panel */}
            {langOpen && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 6px)', right: 0, width: 260, maxHeight: 340,
                borderRadius: 12, overflow: 'hidden', zIndex: 100,
                background: 'rgba(12,15,28,0.98)', border: '1px solid rgba(139,92,246,0.15)',
                backdropFilter: 'blur(20px)', boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
              }}>
                {/* Search */}
                <div style={{ padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <input
                    value={langSearch} onChange={e => setLangSearch(e.target.value)}
                    placeholder="Search language..."
                    autoFocus
                    onKeyDown={e => {
                      if (e.key === 'Escape') setLangOpen(false);
                      if (e.key === 'Enter' && filteredLangs.length > 0) {
                        setLang(filteredLangs[0].id); setLangOpen(false);
                      }
                    }}
                    style={{
                      width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.08)',
                      background: 'rgba(255,255,255,0.03)', color: '#f1f5f9', fontSize: 12,
                      outline: 'none', fontFamily: 'inherit',
                    }}
                  />
                </div>
                {/* Language List */}
                <div style={{ maxHeight: 270, overflowY: 'auto', padding: '4px 0', scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.06) transparent' }}>
                  {filteredLangs.length === 0 && (
                    <div style={{ padding: '12px 16px', fontSize: 12, color: 'rgba(255,255,255,0.25)', textAlign: 'center' }}>No languages found</div>
                  )}
                  {filteredLangs.map(l => (
                    <button key={l.id}
                      onClick={() => { setLang(l.id); setLangOpen(false); }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '8px 14px',
                        background: lang === l.id ? 'rgba(139,92,246,0.08)' : 'transparent',
                        border: 'none', cursor: 'pointer', transition: 'background 0.15s',
                        fontFamily: 'inherit',
                      }}
                      onMouseEnter={e => { if (lang !== l.id) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                      onMouseLeave={e => { if (lang !== l.id) e.currentTarget.style.background = 'transparent'; }}>
                      <span style={{
                        width: 26, height: 26, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 10, fontWeight: 800,
                        background: `${LANG_COLORS[l.id] || '#888'}15`, color: LANG_COLORS[l.id] || '#888',
                        border: `1px solid ${LANG_COLORS[l.id] || '#888'}25`,
                      }}>{l.icon}</span>
                      <div style={{ flex: 1, textAlign: 'left' }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: lang === l.id ? '#a78bfa' : '#e2e8f0' }}>{l.name}</div>
                        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', fontFamily: 'JetBrains Mono' }}>{l.ext}</div>
                      </div>
                      {lang === l.id && <span style={{ fontSize: 10, color: '#a78bfa' }}>✓</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className={s.timer}>
            <div className={s.timerDot} />
            <span className={s.timerText}>{fmt(time)}</span>
          </div>
          <button className={s.runBtn} onClick={handleRun}>▶ Run</button>
          <button className={s.submitBtn} onClick={handleSubmit}>Submit ↑</button>
        </div>
      </div>

      {/* ═══ THREE COLUMNS ═══ */}
      <div className={s.columns}>

        {/* ─── LEFT: Problem Panel ─── */}
        <div className={s.leftPanel}>
          <div className={s.tabBar}>
            {['Problem', 'Hints', 'Tests'].map((t, i) => {
              const id = ['problem', 'hints', 'tests'][i];
              return <button key={id} className={`${s.tab} ${leftTab === id ? s.tabActive : ''}`} onClick={() => setLeftTab(id)}>{t}</button>;
            })}
          </div>
          <div className={s.tabContent}>
            {leftTab === 'problem' && <>
              <h2 className={s.problemTitle}>{prob.title}</h2>
              <div className={s.tags}>
                <span className={`${s.tag} ${diffClass(prob.difficulty)}`}>{prob.difficulty}</span>
                {prob.tags.map(t => <span key={t} className={`${s.tag} ${s.tagTopic}`}>{t}</span>)}
              </div>
              <div className={s.description} dangerouslySetInnerHTML={{
                __html: prob.description.replace(/`([^`]+)`/g, '<code>$1</code>')
              }} />
              {prob.examples.map((ex, i) => (
                <div key={i} className={s.exampleBox}>
                  <div className={s.exampleLabel}>Example {i + 1}:</div>
                  <div className={s.exampleCode}>
                    <div><span className={s.exampleMuted}>Input: </span>{ex.input}</div>
                    <div><span className={s.exampleMuted}>Output: </span><span className={s.exampleGreen}>{ex.output}</span></div>
                    {ex.explanation && <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, marginTop: 4 }}>// {ex.explanation}</div>}
                  </div>
                </div>
              ))}
              <div className={s.sectionTitle}>Constraints:</div>
              <ul className={s.constraintList}>
                {prob.constraints.map((c, i) => <li key={i} className={s.constraintItem}>{c}</li>)}
              </ul>
              {prob.expectedComplexity && (
                <div className={s.complexityBox}>
                  <div className={s.complexityLabel}>Expected Complexity</div>
                  <div className={s.complexityVal}>Time: {prob.expectedComplexity.time} · Space: {prob.expectedComplexity.space}</div>
                </div>
              )}
              {/* Follow-up */}
              <div style={{ marginTop: 20, padding: '12px 14px', borderRadius: 8, background: 'rgba(6,182,212,0.04)', border: '1px solid rgba(6,182,212,0.1)' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#22d3ee', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Follow-up</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>Can you solve this in O(1) extra space? What if the input is sorted?</div>
              </div>
            </>}

            {leftTab === 'hints' && <>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 14 }}>Hints used: {hints}/{prob.hints.length}</div>
              {prob.hints.slice(0, hints).map((h, i) => (
                <div key={i} className={s.hintCard}>
                  <div className={s.hintLabel}>Hint {i + 1}</div>
                  <div className={s.hintText}>{h}</div>
                </div>
              ))}
              {hints < prob.hints.length && <button className={s.hintBtn} onClick={getHint}>💡 Reveal Next Hint</button>}
              {hints >= prob.hints.length && <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', fontStyle: 'italic' }}>No more hints.</div>}
            </>}

            {leftTab === 'tests' && <>
              {prob.testCases.map((tc, i) => {
                const r = results?.[i];
                return (
                  <div key={i} className={`${s.testCard} ${r ? (r.pass ? s.testCardPass : s.testCardFail) : ''}`}>
                    <div className={s.testHeader}>
                      <span className={s.testLabel}>Case {i + 1}</span>
                      {r && <span className={`${s.testBadge} ${r.pass ? s.testPass : s.testFail}`}>{r.pass ? 'Passed' : 'Failed'}</span>}
                    </div>
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>
                      <div>Input: {tc.input}</div>
                      <div>Expected: <span style={{ color: '#4ade80' }}>{tc.expected}</span></div>
                    </div>
                  </div>
                );
              })}
            </>}
          </div>
        </div>

        {/* ─── CENTER: Code Editor ─── */}
        <div className={s.centerPanel}>
          {/* File tab */}
          <div className={s.editorFileName}>
            <div className={s.fileDot} />
            <span>solution{fileExt}</span>
            <span style={{ color: '#f59e0b', marginLeft: 2 }}>●</span>
          </div>

          {/* Editor */}
          <div className={s.editorArea}>
            <div className={s.lineNums}>
              {Array.from({ length: lines }, (_, i) => <div key={i}>{i + 1}</div>)}
            </div>
            <textarea ref={edRef} value={code} onChange={e => setCode(e.target.value)} onKeyDown={handleKey}
              spellCheck={false} className={s.codeArea} style={{ caretColor: '#a78bfa' }} />
            <div className={s.editorGlow} />
          </div>

          {/* Console toggle */}
          <div className={s.consoleBar} onClick={() => setConOpen(x => !x)}>
            <span className={s.consoleBarLabel}>
              <span>⌘</span> Console
              {output.length > 0 && <span style={{ fontSize: 9, padding: '1px 6px', borderRadius: 4, background: 'rgba(139,92,246,0.12)', color: '#a78bfa' }}>{output.length}</span>}
            </span>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>{conOpen ? '▼' : '▲'}</span>
          </div>

          {/* Console output */}
          <div className={`${s.console} ${conOpen ? s.consoleOpen : s.consoleClosed}`}>
            <div className={s.consoleHeader}>
              <span>Output</span>
              <button className={s.consoleToggle} onClick={(e) => { e.stopPropagation(); setOutput([]); }}>Clear</button>
            </div>
            <div className={s.consoleBody}>
              {output.length === 0
                ? <div className={s.consoleEmpty}>Run your code to see output...</div>
                : output.map((l, i) => (
                  <div key={i} className={s.consoleLine} style={{
                    color: l.type === 'success' ? '#4ade80' : l.type === 'error' ? '#f87171' : l.type === 'warning' ? '#fbbf24' : 'rgba(255,255,255,0.5)'
                  }}>{l.text}</div>
                ))
              }
            </div>
          </div>
        </div>

        {/* ─── RIGHT: AI Interviewer Chat ─── */}
        <div className={s.rightPanel}>
          {/* AI Avatar Header */}
          <div className={s.aiHeader}>
            <div className={s.aiAvatar}>
              <div className={s.aiPulse} />
              🤖
            </div>
            <div className={s.aiName}>Aria — AI Interviewer</div>
            <div className={s.aiStatus} style={{ color: ai.color }}>
              <div className={s.aiStatusDot} style={{ background: ai.color }} />
              {ai.label}
            </div>
          </div>

          {/* Chat Tabs */}
          <div className={s.aiTabs}>
            {['Chat', 'AI Assist', 'Review'].map(t => {
              const id = t.toLowerCase().replace(' ', '');
              return <button key={t} className={`${s.aiTab} ${rightTab === id ? s.aiTabActive : ''}`} onClick={() => setRightTab(id)}>{t}</button>;
            })}
          </div>

          {/* Chat Area */}
          <div className={s.chatArea}>
            {rightTab === 'chat' && chat.map((m, i) => (
              <div key={i} className={m.role === 'ai' ? s.chatBubbleAi : s.chatBubbleUser}>
                <div className={`${s.chatLabel} ${m.role === 'ai' ? s.chatLabelAi : s.chatLabelUser}`}>
                  {m.role === 'ai' ? 'AI' : 'You'}
                </div>
                <div className={s.chatText}>{m.text}</div>
                <div className={s.chatTime}>{m.t}</div>
              </div>
            ))}
            {rightTab === 'aiassist' && (
              <div style={{ padding: 10 }}>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 12 }}>AI will suggest optimizations and patterns based on your code.</div>
                <button className={s.hintBtn} onClick={getHint}>💡 Get AI Suggestion</button>
              </div>
            )}
            {rightTab === 'review' && (
              <div style={{ padding: 10 }}>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 10 }}>Submit your solution first to see the review.</div>
                {done && <>
                  <div style={{ fontSize: 11, color: '#a78bfa', fontWeight: 700, marginBottom: 6 }}>CODE REVIEW</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}>Your solution demonstrates understanding of the core concept. Consider edge cases and input validation for production code.</div>
                </>}
              </div>
            )}
            <div ref={chatEnd} />
          </div>

          {/* Quick Responses */}
          {rightTab === 'chat' && (
            <div className={s.quickResponses}>
              <div className={s.quickLabel}>Quick responses:</div>
              <div className={s.quickBtns}>
                {["I'm thinking of using a hash map", "O(n) time, O(n) space", "Let me trace through an example", "Can I get a hint?"].map(t => (
                  <button key={t} className={s.quickBtn} onClick={() => t.includes('hint') ? getHint() : quickReply(t)}>{t}</button>
                ))}
              </div>
              {done && idx < problems.length - 1 && (
                <button onClick={nextProblem} style={{ marginTop: 8, width: '100%', padding: '8px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', color: '#fff', border: 'none' }}>
                  Next Problem →
                </button>
              )}
              {done && idx >= problems.length - 1 && (
                <button onClick={() => router.push('/report')} style={{ marginTop: 8, width: '100%', padding: '8px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', background: 'linear-gradient(135deg, #059669, #047857)', color: '#fff', border: 'none' }}>
                  Finish Session ✓
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
