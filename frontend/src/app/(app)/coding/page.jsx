"use client";
import { useRouter, usePathname } from 'next/navigation';
import React, { useState, useEffect, useRef } from 'react';
import { C } from '@/constants/theme';
import { NeonButton, Tag, AIAvatar } from '@/components/shared';

const highlight = (code) => {
  const router = useRouter();

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

const CodingPage = () => {
  const router = useRouter();
  const [code, setCode] = React.useState(
`// Two Sum — find indices of two numbers that add to target
// Time complexity: O(n)  |  Space: O(n)

function twoSum(nums, target) {
  const map = new Map();

  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];

    if (map.has(complement)) {
      return [map.get(complement), i];
    }

    map.set(nums[i], i);
  }

  return [];
}

// Test cases
console.log(twoSum([2, 7, 11, 15], 9)); // [0, 1]
console.log(twoSum([3, 2, 4], 6));       // [1, 2]`
  );
  const [lang, setLang] = React.useState('javascript');
  const [tab, setTab] = React.useState('problem');
  const [aiTab, setAiTab] = React.useState('chat');
  const [time, setTime] = React.useState(1247);
  const [running, setRunning] = React.useState(false);
  const [output, setOutput] = React.useState(null);
  const [speaking, setSpeaking] = React.useState(false);
  const [aiMsgIdx, setAiMsgIdx] = React.useState(0);
  const [showHint, setShowHint] = React.useState(false);
  const [hintIdx, setHintIdx] = React.useState(0);

  const aiMessages = [
    { role: 'ai', text: "Great start! Let's begin. Could you first walk me through your approach before coding?", ts: '00:00' },
    { role: 'user', text: "I'm thinking of using a hash map to store each number and its index as I iterate.", ts: '00:32' },
    { role: 'ai', text: "Excellent! That's the optimal O(n) approach. What's the key insight that makes a hash map better than a nested loop here?", ts: '00:34' },
    { role: 'user', text: "For each element, I can check if its complement already exists in O(1) lookup time instead of O(n) scan.", ts: '01:05' },
    { role: 'ai', text: "Perfect explanation. Now go ahead and implement it — I'll watch your code as you type.", ts: '01:07' },
  ];

  const hints = [
    "Think about what information you need to look up quickly — what data structure gives O(1) average lookup?",
    "For each element nums[i], the complement you need is target - nums[i]. Store what you've seen so far.",
    "Use a Map where key = number value, val = its index. Before storing nums[i], check if its complement is already in the map.",
  ];

  React.useEffect(() => {
    const t = setInterval(() => setTime(x => x + 1), 1000);
    return () => clearInterval(t);
  }, []);

  React.useEffect(() => {
    const id = setInterval(() => {
      setSpeaking(true);
      setTimeout(() => setSpeaking(false), 2500);
    }, 7000);
    return () => clearInterval(id);
  }, []);

  const fmt = s => `${String(Math.floor(s / 60)).padStart(2,'0')}:${String(s % 60).padStart(2,'0')}`;

  const runCode = () => {
    setRunning(true);
    setOutput(null);
    setTimeout(() => {
      setRunning(false);
      setOutput({
        ok: true,
        lines: [
          { text: '> Running test cases...', color: C.textMuted },
          { text: '✓  twoSum([2,7,11,15], 9)  →  [0, 1]', color: C.success },
          { text: '✓  twoSum([3,2,4], 6)      →  [1, 2]', color: C.success },
          { text: '✓  twoSum([3,3], 6)        →  [0, 1]', color: C.success },
          { text: '', color: C.textMuted },
          { text: '3/3 tests passed  ·  Runtime: 72ms  ·  Memory: 42.1 MB', color: C.primary },
        ]
      });
    }, 1400);
  };

  const submitCode = () => {
    setRunning(true);
    setOutput(null);
    setTimeout(() => {
      setRunning(false);
      setOutput({
        ok: true,
        lines: [
          { text: '> Judging submission...', color: C.textMuted },
          { text: '✓  Accepted! 42/42 test cases passed', color: C.success },
          { text: '', color: C.textMuted },
          { text: '  Runtime:  72 ms   — beats 94.7% of JavaScript submissions', color: C.primary },
          { text: '  Memory:  42.1 MB  — beats 87.2% of JavaScript submissions', color: C.secondary },
        ]
      });
    }, 1800);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', flexDirection: 'column' }}>
      {/* Top chrome */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 20px', borderBottom: `1px solid ${C.borderMid}`,
        background: 'rgba(7, 8, 22, 0.98)', flexShrink: 0, zIndex: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: C.textPrimary }}>Coding Interview</span>
          <Tag color={C.primary}>LeetCode Style</Tag>
          <Tag color={C.secondary}>Round 2 of 3</Tag>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* Language selector */}
          <div style={{ display: 'flex', gap: 2, background: C.bgCard, borderRadius: 8, padding: 3, border: `1px solid ${C.borderMid}` }}>
            {['javascript','python','java','c++'].map(l => (
              <button key={l} onClick={() => setLang(l)} style={{
                padding: '4px 12px', borderRadius: 6, border: 'none', cursor: 'pointer',
                background: lang === l ? `linear-gradient(135deg,rgba(167, 139, 250, 0.2),rgba(139, 92, 246, 0.2))` : 'transparent',
                color: lang === l ? C.primary : C.textMuted,
                fontFamily: 'JetBrains Mono', fontSize: 11, fontWeight: 600,
                transition: 'all 0.2s',
              }}>{l}</button>
            ))}
          </div>
          {/* Timer */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 7, padding: '6px 14px',
            background: time > 3600 ? `${C.error}15` : C.bgCard,
            border: `1px solid ${time > 3600 ? C.error + '40' : C.borderMid}`,
            borderRadius: 8,
          }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: C.warning, animation: 'pulse-ring 2s infinite' }} />
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 14, color: time > 3600 ? C.error : C.warning, fontWeight: 700 }}>{fmt(time)}</span>
          </div>
          <NeonButton size="sm" variant="outline" onClick={runCode} style={{ gap: 6 }}>
            {running ? '⟳ Running…' : '▶ Run'}
          </NeonButton>
          <NeonButton size="sm" onClick={submitCode}>
            Submit ↑
          </NeonButton>
        </div>
      </div>

      {/* Main 3-col layout */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '340px 1fr 320px', overflow: 'hidden' }}>

        {/* ── LEFT: Problem panel ── */}
        <div style={{
          borderRight: `1px solid ${C.borderMid}`, display: 'flex', flexDirection: 'column',
          background: 'rgba(7, 8, 22, 0.96)', overflow: 'hidden',
        }}>
          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: `1px solid ${C.borderMid}`, flexShrink: 0 }}>
            {['problem','hints'].map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                flex: 1, padding: '11px 0', border: 'none', cursor: 'pointer',
                background: tab === t ? `rgba(167, 139, 250, 0.1)` : 'transparent',
                color: tab === t ? C.primary : C.textMuted,
                fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600,
                textTransform: 'capitalize', borderBottom: tab === t ? `2px solid ${C.primary}` : '2px solid transparent',
                transition: 'all 0.2s',
              }}>{t}</button>
            ))}
          </div>

          <div style={{ flex: 1, overflow: 'auto', padding: '20px 20px' }}>
            {tab === 'problem' ? (
              <>
                {/* Difficulty + tags */}
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 14, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 16, fontWeight: 800, color: C.textPrimary }}>Two Sum</span>
                  <Tag color={C.success}>Easy</Tag>
                  <Tag color={C.textMuted}>#1</Tag>
                </div>
                <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
                  {['Array','Hash Table'].map(t => (
                    <span key={t} style={{ fontSize: 10, padding: '3px 9px', borderRadius: 20, background: C.bgCard, border: `1px solid ${C.borderMid}`, color: C.textSecondary }}>{t}</span>
                  ))}
                </div>

                {/* Problem statement */}
                <p style={{ fontSize: 13, color: C.textSecondary, lineHeight: 1.8, marginBottom: 20 }}>
                  Given an array of integers <code style={{ background: `${C.primary}15`, padding: '1px 5px', borderRadius: 4, color: C.primary, fontFamily: 'JetBrains Mono' }}>nums</code> and an integer <code style={{ background: `${C.primary}15`, padding: '1px 5px', borderRadius: 4, color: C.primary, fontFamily: 'JetBrains Mono' }}>target</code>, return <em style={{ color: C.textPrimary }}>indices of the two numbers</em> such that they add up to <code style={{ background: `${C.primary}15`, padding: '1px 5px', borderRadius: 4, color: C.primary, fontFamily: 'JetBrains Mono' }}>target</code>.
                </p>
                <p style={{ fontSize: 13, color: C.textSecondary, lineHeight: 1.8, marginBottom: 20 }}>
                  You may assume that each input would have <em style={{ color: C.textPrimary }}>exactly one solution</em>, and you may not use the same element twice. You can return the answer in any order.
                </p>

                {/* Examples */}
                {[
                  { n: 1, input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', exp: 'nums[0] + nums[1] == 9' },
                  { n: 2, input: 'nums = [3,2,4], target = 6', output: '[1,2]', exp: 'nums[1] + nums[2] == 6' },
                ].map(ex => (
                  <div key={ex.n} style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: C.textPrimary, marginBottom: 8 }}>Example {ex.n}:</div>
                    <div style={{ background: C.bgCard, border: `1px solid ${C.borderMid}`, borderRadius: 8, padding: '12px 14px' }}>
                      <div style={{ fontFamily: 'JetBrains Mono', fontSize: 12, lineHeight: 1.8 }}>
                        <div><span style={{ color: C.textMuted }}>Input: </span><span style={{ color: C.textPrimary }}>{ex.input}</span></div>
                        <div><span style={{ color: C.textMuted }}>Output: </span><span style={{ color: C.success }}>{ex.output}</span></div>
                        <div style={{ color: C.textMuted, fontSize: 11 }}>// {ex.exp}</div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Constraints */}
                <div style={{ marginTop: 20 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 10, color: C.textPrimary }}>Constraints:</div>
                  <ul style={{ paddingLeft: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {['2 ≤ nums.length ≤ 10⁴','−10⁹ ≤ nums[i] ≤ 10⁹','−10⁹ ≤ target ≤ 10⁹','Only one valid answer exists.'].map((c, i) => (
                      <li key={i} style={{ listStyle: 'none', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                        <span style={{ color: C.primary, fontSize: 10, marginTop: 3 }}>◆</span>
                        <span style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: C.textSecondary }}>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Follow-up */}
                <div style={{ marginTop: 20, background: `rgba(139, 92, 246, 0.1)`, borderRadius: 8, padding: '12px 14px', border: `1px solid ${C.secondary}30` }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.secondary, marginBottom: 4 }}>Follow-up</div>
                  <div style={{ fontSize: 12, color: C.textSecondary, lineHeight: 1.7 }}>Can you come up with an algorithm that is less than O(n²) time complexity?</div>
                </div>
              </>
            ) : (
              /* Hints tab */
              <div>
                <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 20, lineHeight: 1.6 }}>
                  Hints are revealed progressively. Each costs <span style={{ color: C.warning }}>-2 pts</span>.
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {hints.map((h, i) => (
                    <div key={i}>
                      {i <= hintIdx ? (
                        <div style={{
                          background: `rgba(167, 139, 250, 0.1)`, borderRadius: 10, padding: '14px 16px',
                          border: `1px solid ${C.borderMid}`, animation: 'hint-slide 0.4s ease',
                        }}>
                          <div style={{ fontSize: 10, color: C.primary, fontFamily: 'JetBrains Mono', marginBottom: 6 }}>HINT {i + 1}</div>
                          <div style={{ fontSize: 13, color: C.textPrimary, lineHeight: 1.7 }}>{h}</div>
                        </div>
                      ) : (
                        <button onClick={() => i === hintIdx + 1 && setHintIdx(i)} style={{
                          width: '100%', padding: '14px 16px', borderRadius: 10, cursor: i === hintIdx + 1 ? 'pointer' : 'default',
                          background: C.bgCard, border: `1px solid ${C.borderMid}`, color: C.textMuted,
                          fontFamily: 'Inter, sans-serif', fontSize: 12, textAlign: 'left',
                          opacity: i === hintIdx + 1 ? 1 : 0.4,
                        }}>
                          🔒 Hint {i + 1} — {i === hintIdx + 1 ? 'Click to reveal (-2 pts)' : 'Reveal previous hints first'}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── CENTER: Code Editor ── */}
        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#050d1c' }}>
          {/* Editor header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '8px 16px', borderBottom: `1px solid ${C.borderMid}`,
            background: 'rgba(7, 8, 22, 0.97)', flexShrink: 0,
          }}>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: C.textMuted, fontFamily: 'JetBrains Mono' }}>solution.{lang === 'javascript' ? 'js' : lang === 'python' ? 'py' : lang === 'java' ? 'java' : 'cpp'}</span>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.warning }} title="Unsaved" />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setCode('')} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 5, border: `1px solid ${C.borderMid}`, background: 'transparent', color: C.textMuted, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Clear</button>
              <button style={{ fontSize: 11, padding: '3px 10px', borderRadius: 5, border: `1px solid ${C.borderMid}`, background: 'transparent', color: C.textMuted, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Format</button>
            </div>
          </div>

          {/* Editor body */}
          <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex' }}>
            {/* Line numbers */}
            <div style={{
              width: 44, flexShrink: 0, padding: '16px 0', borderRight: `1px solid ${C.borderMid}`,
              fontFamily: 'JetBrains Mono', fontSize: 12, color: C.textMuted,
              lineHeight: 1.7, textAlign: 'right', paddingRight: 10, userSelect: 'none',
              overflowY: 'hidden', background: 'rgba(5,9,20,0.8)',
            }}>
              {code.split('\n').map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>
            {/* Textarea */}
            <textarea
              className="code-editor"
              value={code}
              onChange={e => setCode(e.target.value)}
              spellCheck={false}
              style={{ padding: '16px 16px', flex: 1 }}
              onKeyDown={e => {
                if (e.key === 'Tab') {
                  e.preventDefault();
                  const s = e.target.selectionStart;
                  const v = code.substring(0, s) + '  ' + code.substring(s);
                  setCode(v);
                  setTimeout(() => e.target.selectionStart = e.target.selectionEnd = s + 2, 0);
                }
              }}
            />
          </div>

          {/* Output panel */}
          <div style={{
            borderTop: `1px solid ${C.borderMid}`, height: output ? 160 : 44,
            background: 'rgba(3, 4, 11,0.98)', transition: 'height 0.3s ease', flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderBottom: output ? `1px solid ${C.borderMid}` : 'none' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Console</span>
              {running && <span style={{ fontSize: 11, color: C.warning, animation: 'ai-think 0.8s ease infinite' }}>Running…</span>}
              {output && <span style={{ fontSize: 11, color: output.ok ? C.success : C.error }}>{output.ok ? '● All tests passed' : '● Tests failed'}</span>}
            </div>
            {output && (
              <div style={{ padding: '8px 16px', overflow: 'auto', maxHeight: 108 }}>
                {output.lines.map((l, i) => (
                  <div key={i} style={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: l.color, lineHeight: 1.8 }}>{l.text}</div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: AI Interviewer + Assistant ── */}
        <div style={{
          borderLeft: `1px solid ${C.borderMid}`, display: 'flex', flexDirection: 'column',
          background: 'rgba(7, 8, 22, 0.97)', overflow: 'hidden',
        }}>
          {/* AI Avatar (compact) */}
          <div style={{
            padding: '16px 16px 12px', borderBottom: `1px solid ${C.borderMid}`,
            background: `radial-gradient(ellipse at 50% 0%, rgba(167, 139, 250, 0.08) 0%, transparent 70%)`,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, flexShrink: 0,
          }}>
            <AIAvatar size={120} speaking={speaking} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.textPrimary }}>Aria — AI Interviewer</div>
              <div style={{ fontSize: 10, color: speaking ? C.success : C.textMuted, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, marginTop: 2 }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: speaking ? C.success : C.textMuted, animation: speaking ? 'pulse-ring 1s infinite' : 'none' }} />
                {speaking ? 'Speaking…' : 'Observing your code'}
              </div>
            </div>
          </div>

          {/* Tab bar */}
          <div style={{ display: 'flex', borderBottom: `1px solid ${C.borderMid}`, flexShrink: 0 }}>
            {[['chat','Chat'],['assist','AI Assist'],['review','Review']].map(([id, label]) => (
              <button key={id} onClick={() => setAiTab(id)} style={{
                flex: 1, padding: '9px 0', border: 'none', cursor: 'pointer',
                background: aiTab === id ? `rgba(167, 139, 250, 0.1)` : 'transparent',
                color: aiTab === id ? C.primary : C.textMuted,
                fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 600,
                borderBottom: aiTab === id ? `2px solid ${C.primary}` : '2px solid transparent',
                transition: 'all 0.2s',
              }}>{label}</button>
            ))}
          </div>

          {/* Tab content */}
          <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>

            {/* CHAT TAB */}
            {aiTab === 'chat' && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ flex: 1, overflow: 'auto', padding: '14px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {aiMessages.map((m, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, justifyContent: m.role === 'ai' ? 'flex-start' : 'flex-end' }}>
                      {m.role === 'ai' && (
                        <div style={{
                          width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                          background: `linear-gradient(135deg, ${C.primary}, ${C.secondary})`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 10, fontWeight: 800, color: '#fff',
                        }}>AI</div>
                      )}
                      <div style={{
                        maxWidth: '78%', padding: '10px 13px', borderRadius: m.role === 'ai' ? '4px 14px 14px 14px' : '14px 4px 14px 14px',
                        background: m.role === 'ai' ? `rgba(167, 139, 250, 0.1)` : `rgba(139, 92, 246, 0.1)`,
                        border: `1px solid ${m.role === 'ai' ? C.borderMid : C.secondary + '40'}`,
                        fontSize: 12, color: C.textPrimary, lineHeight: 1.6,
                      }}>
                        {m.text}
                        <div style={{ fontSize: 9, color: C.textMuted, marginTop: 4, fontFamily: 'JetBrains Mono' }}>{m.ts}</div>
                      </div>
                    </div>
                  ))}
                  {/* AI typing / asking a question */}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <div style={{ width: 26, height: 26, borderRadius: '50%', background: `linear-gradient(135deg, ${C.primary}, ${C.secondary})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: '#fff', flexShrink: 0 }}>AI</div>
                    <div style={{ padding: '10px 13px', borderRadius: '4px 14px 14px 14px', background: `rgba(167, 139, 250, 0.1)`, border: `1px solid ${C.borderMid}`, fontSize: 12, color: C.textSecondary, fontStyle: 'italic' }}>
                      What is the time complexity of your current solution?
                      <span style={{ display: 'inline-block', width: 2, height: 14, background: C.primary, marginLeft: 2, verticalAlign: 'middle', animation: 'type-cursor 1s infinite' }} />
                    </div>
                  </div>
                </div>
                {/* AI prompts */}
                <div style={{ padding: '10px 14px', borderTop: `1px solid ${C.borderMid}`, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ fontSize: 10, color: C.textMuted, marginBottom: 2 }}>Quick responses:</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {["O(n) time, O(n) space", "Let me explain my approach", "Can I get a hint?"].map(r => (
                      <button key={r} style={{
                        padding: '6px 12px', borderRadius: 8, border: `1px solid ${C.borderMid}`,
                        background: C.bgCard, color: C.textSecondary, cursor: 'pointer',
                        fontFamily: 'Inter, sans-serif', fontSize: 11, textAlign: 'left',
                        transition: 'all 0.2s',
                      }}>{r}</button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* AI ASSIST TAB */}
            {aiTab === 'assist' && (
              <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ fontSize: 11, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>AI Assistant</div>

                {/* Debug section */}
                <div style={{ background: C.bgCard, borderRadius: 10, padding: '14px', border: `1px solid ${C.borderMid}` }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.primary, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>⊛</span> Debug Analysis
                  </div>
                  <div style={{ fontSize: 12, color: C.textSecondary, lineHeight: 1.7, marginBottom: 10 }}>
                    No errors detected. Your code structure looks correct. Edge cases to consider:
                  </div>
                  {['Empty array input', 'Duplicate numbers with same value', 'Negative numbers summing to target'].map((e, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 5 }}>
                      <span style={{ color: C.warning, fontSize: 10, marginTop: 2 }}>◆</span>
                      <span style={{ fontSize: 11, color: C.textSecondary }}>{e}</span>
                    </div>
                  ))}
                </div>

                {/* Optimization section */}
                <div style={{ background: C.bgCard, borderRadius: 10, padding: '14px', border: `1px solid ${C.borderMid}` }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.success, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>⟳</span> Optimization Insights
                  </div>
                  {[
                    { label: 'Time Complexity', val: 'O(n)', good: true },
                    { label: 'Space Complexity', val: 'O(n)', good: true },
                    { label: 'Early exit possible', val: 'Yes', good: true },
                  ].map(({ label, val, good }) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
                      <span style={{ fontSize: 11, color: C.textSecondary }}>{label}</span>
                      <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono', color: good ? C.success : C.warning }}>{val}</span>
                    </div>
                  ))}
                </div>

                {/* Step-by-step */}
                <div style={{ background: C.bgCard, borderRadius: 10, padding: '14px', border: `1px solid ${C.borderMid}` }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.secondary, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>≡</span> Step-by-Step Walkthrough
                  </div>
                  {[
                    { n: 1, text: 'Initialize empty hash map', done: true },
                    { n: 2, text: 'Iterate through array with index i', done: true },
                    { n: 3, text: 'Compute complement = target - nums[i]', done: true },
                    { n: 4, text: 'Check if complement exists in map', done: true },
                    { n: 5, text: 'Return indices if found', done: false },
                    { n: 6, text: 'Store nums[i] → i in map', done: false },
                  ].map(({ n, text, done }) => (
                    <div key={n} style={{ display: 'flex', gap: 10, marginBottom: 8, alignItems: 'flex-start' }}>
                      <div style={{
                        width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                        background: done ? `${C.primary}20` : C.bgCard,
                        border: `1px solid ${done ? C.primary : C.borderMid}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 9, color: done ? C.primary : C.textMuted, fontWeight: 700,
                      }}>{done ? '✓' : n}</div>
                      <span style={{ fontSize: 11, color: done ? C.textPrimary : C.textMuted, lineHeight: 1.5 }}>{text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* REVIEW TAB */}
            {aiTab === 'review' && (
              <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ fontSize: 11, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Code Review</div>

                {/* Score breakdown */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {[
                    { l: 'Correctness', v: 96, c: C.success },
                    { l: 'Efficiency', v: 88, c: C.primary },
                    { l: 'Readability', v: 82, c: C.secondary },
                    { l: 'Edge Cases', v: 70, c: C.warning },
                  ].map(({ l, v, c }) => (
                    <div key={l} style={{ background: C.bgCard, borderRadius: 8, padding: '10px', border: `1px solid ${C.borderMid}`, textAlign: 'center' }}>
                      <div style={{ fontSize: 22, fontWeight: 800, color: c, fontFamily: 'JetBrains Mono', lineHeight: 1 }}>{v}</div>
                      <div style={{ fontSize: 10, color: C.textMuted, marginTop: 4 }}>{l}</div>
                    </div>
                  ))}
                </div>

                {/* Review notes */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { type: 'good', text: 'Excellent use of Map for O(1) lookups' },
                    { type: 'good', text: 'Clean variable naming (complement is clear)' },
                    { type: 'good', text: 'Correct single-pass algorithm' },
                    { type: 'warn', text: 'Consider adding input validation for null/empty arrays' },
                    { type: 'warn', text: 'Add JSDoc comments for production readiness' },
                  ].map((r, i) => (
                    <div key={i} style={{
                      display: 'flex', gap: 10, padding: '10px 12px', borderRadius: 8,
                      background: r.type === 'good' ? `${C.success}08` : `${C.warning}08`,
                      border: `1px solid ${r.type === 'good' ? C.success + '25' : C.warning + '25'}`,
                    }}>
                      <span style={{ color: r.type === 'good' ? C.success : C.warning, fontSize: 12, flexShrink: 0 }}>{r.type === 'good' ? '✓' : '!'}</span>
                      <span style={{ fontSize: 12, color: C.textSecondary, lineHeight: 1.5 }}>{r.text}</span>
                    </div>
                  ))}
                </div>

                {/* Performance insights */}
                <div style={{ background: `rgba(167, 139, 250, 0.1)`, borderRadius: 10, padding: '14px', border: `1px solid ${C.borderMid}` }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.primary, marginBottom: 8 }}>Performance Insights</div>
                  <div style={{ fontSize: 12, color: C.textSecondary, lineHeight: 1.7 }}>
                    Your solution beats <span style={{ color: C.primary, fontWeight: 700 }}>94.7%</span> of submissions in runtime and <span style={{ color: C.secondary, fontWeight: 700 }}>87.2%</span> in memory usage. The single-pass hash map approach is optimal for this problem.
                  </div>
                </div>

                <NeonButton size="sm" onClick={() => router.push('/report')} style={{ justifyContent: 'center' }}>
                  View Full Report →
                </NeonButton>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── ROOT APP ─────────────────────────────────────────────────────────────────

export default CodingPage;
