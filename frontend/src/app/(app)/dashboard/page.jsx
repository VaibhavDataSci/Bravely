"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { C } from '@/constants/theme';
import { GlassCard, NeonButton } from '@/components/shared';
import { useAuth } from '@/contexts/AuthContext';
import styles from './Dashboard.module.css';

export default function DashboardPage(){
  const router = useRouter();
  const { user } = useAuth();
  const [range, setRange] = useState('7');

  const displayName = user?.profileResume?.personalInfo?.name || user?.name || user?.email?.split('@')[0] || 'User';

  const userRole = user?.profileResume?.role || 'Software Engineer';
  const isCodingHeavy = userRole.toLowerCase().includes('engineer') || userRole.toLowerCase().includes('developer');
  const isCloudDevOps = userRole.toLowerCase().includes('cloud') || userRole.toLowerCase().includes('devops');
  const isHR = userRole.toLowerCase().includes('hr') || userRole.toLowerCase().includes('product') || userRole.toLowerCase().includes('manager');

  let dynamicSubtext = "Clarity + confidence: keep the momentum.";
  if (isCodingHeavy) {
    dynamicSubtext = "Your coding consistency improved this week. AI recommends focusing on pacing.";
  } else if (isHR) {
    dynamicSubtext = "Your communication scores are improving steadily. Focus on STAR method structure.";
  } else if (isCloudDevOps) {
    dynamicSubtext = "Great progress on architectural concepts. Ready for a System Design mock?";
  }

  const metrics = [
    { id:'confidence', label:'Confidence', pct:82, accent:C.primary, insight:'Confidence increased 8% this week.' },
    { id:'clarity', label:'Clarity', pct:74, accent:C.secondary, insight:'Clarity improved in structured answers.' },
    { id:'fluency', label:'Fluency', pct:69, accent:C.glow, insight:'Fluency steady; try longer turns.' },
    { id:'structure', label:'Structure', pct:58, accent:C.info, insight:'Work on narrative structure and signposting.' },
    { id:'vocab', label:'Vocabulary', pct:72, accent:C.accentSettings, insight:'Vocabulary richness improved by 9%.' },
  ];

  const strengths = [
    { text: 'Clear technical explanations', status: 'Improving' },
    { text: 'Strong conversational confidence', status: 'Stable' },
    { text: 'Natural storytelling energy', status: 'Improving' },
    { text: 'Good speaking consistency', status: 'Stable' },
  ];

  const growthAreas = [
    { text: 'Reduce filler words during transitions', tip: 'Try pausing instead of filling silence.' },
    { text: 'Pause slightly before answering', tip: 'A 1-second pause sounds composed.' },
    { text: 'Use stronger descriptive vocabulary', tip: 'Replace generic words with vivid ones.' },
    { text: 'Improve pacing in longer responses', tip: 'Break answers into 2–3 clear sections.' },
  ];

  const heat = [0,1,2,3,2,1,4, 2,3,4,1,0,2,3, 0,1,2,3,2,1,0];

  const sessions = [
    { title: isCloudDevOps ? 'System Design — AWS' : isHR ? 'Mock — PM Interview' : 'Technical — Software Eng', date:'Yesterday', score:92, best:'Structure', area:'Pacing', dur:'28m' },
    { title:'Phone Call with AI', date:'2 days ago', score:78, best:'Clarity', area:'Fillers', dur:'18m' },
    { title:'Peer Practice', date:'4 days ago', score:85, best:'Confidence', area:'Transitions', dur:'22m' },
  ];

  // Week (7d) points — adjusted to fit tighter vertical space
  const weekPoints = [
    { x: 60, y: 310, label: 'Mon' },
    { x: 190, y: 240, label: 'Tue' },
    { x: 320, y: 220, label: 'Wed' },
    { x: 450, y: 250, label: 'Thu' },
    { x: 580, y: 150, label: 'Fri' },
    { x: 710, y: 60,  label: 'Sat' },
    { x: 840, y: 110,  label: 'Sun' },
  ];

  // Month (30d) simplified sample points
  const monthPoints = [
    { x: 60, y: 330, label: 'Wk1' },{ x: 138, y: 290, label: '' },{ x: 216, y: 310, label: '' },{ x: 294, y: 260, label: '' },
    { x: 372, y: 230, label: '' },{ x: 450, y: 195, label: '' },{ x: 528, y: 160, label: '' },{ x: 606, y: 135, label: '' },
    { x: 684, y: 110, label: 'Wk4' },{ x: 762, y: 125, label: '' },{ x: 840, y: 170, label: '' },
  ];

  const perfPoints = range === '7' ? weekPoints : monthPoints;
  const perfPointsStr = perfPoints.map(p => `${p.x} ${p.y}`).join(' L ');
  const perfStrokePath = `M ${perfPointsStr}`;
  const perfAreaPath = `${perfStrokePath} L 840 390 L 60 390 Z`;

  // Radar polygon points (dynamic from metrics)
  const radarCenter = { x: 200, y: 160 };
  const radarMax = 100;
  const radarAngles = metrics.map((_, i) => (-Math.PI / 2) + (2 * Math.PI * i) / metrics.length);
  const radarPoints = metrics.map((m, i) => {
    const r = (m.pct / 100) * radarMax;
    const x = Math.round(radarCenter.x + r * Math.cos(radarAngles[i]));
    const y = Math.round(radarCenter.y + r * Math.sin(radarAngles[i]));
    return `${x},${y}`;
  }).join(' ');

  const radarLabelPositions = metrics.map((m, i) => {
    const angle = radarAngles[i];
    const x = Math.round(radarCenter.x + (radarMax + 32) * Math.cos(angle));
    const y = Math.round(radarCenter.y + (radarMax + 32) * Math.sin(angle));
    return { x, y, label: m.label };
  });

  const milestones = [
    { label: 'First AI Call Completed', done: true },
    { label: '7-Day Streak', done: true },
    { label: 'Reduced filler words 20%', done: true },
    { label: 'Next goal: Reach 90 confidence score', done: false },
  ];

  return (
    <div className={styles.page}>
      {/* HERO */}
      <div className={styles.hero}>
        <div className={styles.greeting}>
          <div className={styles.greetTitle}>Welcome back, {displayName}</div>
          <div className={styles.greetSub}>{dynamicSubtext}</div>
        </div>

        <div className={styles.streakCard}>
          <div className={styles.streakGlass}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div>
                <div style={{fontSize:12,color:'rgba(255,255,255,0.78)',textTransform:'uppercase',letterSpacing:'0.06em'}}>Streak</div>
                <div className={styles.streakValue}>14 Days</div>
                <div className={styles.streakLabel}>Daily speaking momentum is building.</div>
              </div>
              <div className={`${styles.streakRing} ${styles.streakPulse}`} aria-hidden>
                <svg viewBox="0 0 100 100">
                  <defs>
                    <linearGradient id="sr" x1="0" x2="1"><stop offset="0%" stopColor="#FFD2A8"/><stop offset="100%" stopColor="#FF8B8B"/></linearGradient>
                  </defs>
                  <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.04)" strokeWidth="10" fill="none" />
                  <circle cx="50" cy="50" r="40" stroke="url(#sr)" strokeWidth="6" fill="none" strokeDasharray="251.2" strokeDashoffset="30" strokeLinecap="round" transform="rotate(-90 50 50)" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN SPLIT: Performance + Health + Focus / Radar + Insights + Achievements */}
      <div className={styles.layoutSplit}>
        <div className={styles.leftColumn}>
          {/* Performance Chart */}
          <div className={`${styles.cardPremium} ${styles.performanceCard}`}>
            <div className={styles.cardHeader}>
              <div>
                <div className={styles.cardTitle}>Performance Progress</div>
                <div className={styles.cardSub}>Historical growth of your communication confidence.</div>
              </div>
              <div style={{display:'flex',gap:6,alignItems:'center'}}>
                <button onClick={() => setRange('7')} className={styles.rangeBtn} style={range==='7'?{background:'rgba(255,255,255,0.05)'}:{}}>7D</button>
                <button onClick={() => setRange('30')} className={styles.rangeBtn} style={range==='30'?{background:'rgba(255,255,255,0.05)'}:{}}>30D</button>
              </div>
            </div>
            <svg className={styles.performanceSVG} viewBox="0 0 900 440" preserveAspectRatio="xMinYMin meet">
              <defs>
                <linearGradient id="gconf" x1="0" x2="1"><stop offset="0%" stopColor="#B794F4"/><stop offset="100%" stopColor="#8B5CF6"/></linearGradient>
                <linearGradient id="areaGrad" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#B794F4" stopOpacity="0.22"/><stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.02"/></linearGradient>
              </defs>
              <path d={perfAreaPath} fill="url(#areaGrad)" className={styles.areaFill} />
              <path d={perfStrokePath} fill="none" stroke="url(#gconf)" strokeWidth="4.5" className={styles.perfLine} strokeLinecap="round" strokeLinejoin="round" />
              {perfPoints.map((p, idx) => (
                <circle key={idx} cx={p.x} cy={p.y} r={7} fill="#fff" opacity={0.95} className={styles.perfMarker} />
              ))}
              {perfPoints.map((p, idx) => (
                <text key={`t-${idx}`} x={p.x} y={420} className={styles.xLabel} textAnchor="middle">{p.label}</text>
              ))}
            </svg>
          </div>

          {/* Communication Health */}
          <div className={styles.healthGridInline}>
            {metrics.map(m=> (
              <div key={m.id} className={styles.insightWidget}>
                <div className={styles.widgetTitle}>{m.label}</div>
                <div className={styles.widgetSmall}>{m.insight}</div>
                <div style={{height:8,background:'rgba(255,255,255,0.03)',borderRadius:6,marginTop:8}}>
                  <div style={{width:`${m.pct}%`,height:'100%',borderRadius:6,background:`linear-gradient(90deg, ${m.accent}, ${C.secondary})`,transition:'width 1s'}} />
                </div>
                <div style={{marginTop:6,fontWeight:800,fontSize:13}}>{m.pct}%</div>
              </div>
            ))}
          </div>

          {/* Your Strengths & Growth Areas */}
          <div className={styles.cardPremium}>
            <div className={styles.cardHeader}>
              <div>
                <div className={styles.cardTitle}>Your Strengths &amp; Growth Areas</div>
                <div className={styles.cardSub}>Personalized communication insights based on recent sessions.</div>
              </div>
            </div>
            <div className={styles.sgGrid}>
              {/* Strengths */}
              <div className={styles.sgCard}>
                <div className={styles.sgLabel}><span className={styles.sgDot} style={{background:'#4ADE80'}} />Your Strengths</div>
                <div className={styles.sgList}>
                  {strengths.map((s,i) => (
                    <div key={i} className={styles.sgItem}>
                      <div className={styles.sgCheck}>✓</div>
                      <div style={{flex:1}}>
                        <div className={styles.sgText}>{s.text}</div>
                      </div>
                      <div className={`${styles.sgPill} ${s.status === 'Improving' ? styles.sgPillGreen : styles.sgPillNeutral}`}>{s.status}</div>
                    </div>
                  ))}
                </div>
                <div className={styles.sgInsight}>💡 Your confidence improves significantly during unscripted conversations.</div>
              </div>
              {/* Growth Areas */}
              <div className={styles.sgCard}>
                <div className={styles.sgLabel}><span className={styles.sgDot} style={{background:'#A78BFA'}} />Areas to Improve</div>
                <div className={styles.sgList}>
                  {growthAreas.map((g,i) => (
                    <div key={i} className={styles.sgItem}>
                      <div className={styles.sgArrow}>→</div>
                      <div style={{flex:1}}>
                        <div className={styles.sgText}>{g.text}</div>
                        <div className={styles.sgTip}>{g.tip}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className={styles.sgInsight}>🎯 Practice shorter pauses to sound more composed.</div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.rightColumn}>
          {/* Skill Radar */}
          <div className={styles.cardPremium}>
            <div className={styles.cardHeader}>
              <div>
                <div className={styles.cardTitle}>Skill Radar</div>
                <div className={styles.cardSub}>Multidimensional communication analysis</div>
              </div>
            </div>
            <div className={styles.radarWrap}>
              <svg className={styles.radarSVG} viewBox="0 0 400 320">
                <circle cx="200" cy="160" r="108" fill="rgba(255,255,255,0.00)" stroke="rgba(255,255,255,0.025)" />
                <circle cx="200" cy="160" r="72" fill="none" stroke="rgba(255,255,255,0.015)" />
                <circle cx="200" cy="160" r="36" fill="none" stroke="rgba(255,255,255,0.01)" />
                <polygon points={radarPoints} fill="rgba(139,92,246,0.1)" stroke="rgba(167,139,250,0.35)" strokeWidth="2.5" />
                {radarPoints.split(' ').map((pt, i) => {
                  const [x, y] = pt.split(',');
                  return <circle key={i} cx={x} cy={y} r={5} fill="#CDBBFF" />
                })}
                {radarLabelPositions.map((L, i) => (
                  <text key={`lab-${i}`} x={L.x} y={L.y} className={styles.radarLabel} textAnchor="middle">{L.label.toUpperCase()}</text>
                ))}
              </svg>
              <div style={{textAlign:'center',marginTop:4}}>
                <div style={{fontSize:32,fontWeight:800}}>84</div>
                <div className={styles.smallMuted}>Overall — Excellent</div>
              </div>
            </div>
          </div>

          {/* Filler Words */}
          <div className={styles.cardPremium}>
            <div className={styles.cardHeader}>
              <div>
                <div className={styles.cardTitle}>Filler Words</div>
                <div className={styles.cardSub}>Commonly used — hover to inspect</div>
              </div>
            </div>
            <div className={styles.fillerGrid}>
              {[{w:'uh',n:4},{w:'like',n:3},{w:'you know',n:2},{w:'so',n:1},{w:'actually',n:1}].map(({w,n},i)=> (
                <div key={i} className={styles.fillerChip} title={`${w} — ${n} times`}>
                  <div className={styles.fillerWord}>{w}</div>
                  <div className={styles.fillerCount}>{n}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Communication Milestones */}
          <div className={styles.cardPremium}>
            <div className={styles.cardHeader}>
              <div>
                <div className={styles.cardTitle}>Communication Milestones</div>
                <div className={styles.cardSub}>Your progress timeline</div>
              </div>
            </div>
            <div className={styles.milestoneList}>
              {milestones.map((ms, i) => (
                <div key={i} className={styles.milestoneItem}>
                  <div className={`${styles.milestoneIcon} ${ms.done ? styles.milestoneDone : styles.milestonePending}`}>
                    {ms.done ? '✓' : '⏳'}
                  </div>
                  <div className={ms.done ? styles.milestoneLabel : styles.milestoneLabelPending}>{ms.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Sessions — full width */}
      <div className={styles.cardPremium}>
        <div className={styles.cardHeader}>
          <div>
            <div className={styles.cardTitle}>Recent Sessions</div>
            <div className={styles.cardSub}>Latest feedback &amp; takeaways</div>
          </div>
        </div>
        <div className={styles.sessionsRow}>
          {sessions.map((s,i)=> (
            <div key={i} className={styles.sessionCardPremium} onClick={() => router.push('/report')}>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <div style={{width:44,height:44,borderRadius:10,background:'linear-gradient(135deg,#8B5CF6,#A78BFA)',display:'grid',placeItems:'center',fontWeight:800,fontSize:14,color:'#fff'}}>{s.title.split(' ')[0][0]}</div>
                <div>
                  <div style={{fontWeight:700,fontSize:13}}>{s.title}</div>
                  <div className={styles.smallMuted}>{s.date} · {s.dur}</div>
                </div>
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{fontWeight:900,fontSize:16,color: s.score>=90?C.success:s.score>=75?C.primary:C.warning}}>{s.score}</div>
                <div className={styles.smallMuted} style={{marginTop:4}}>{s.best} · needs {s.area}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
