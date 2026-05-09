"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { C } from '@/constants/theme';
import { GlassCard, NeonButton } from '@/components/shared';
import styles from './Dashboard.module.css';

export default function DashboardPage(){
  const router = useRouter();

  const metrics = [
    { id:'confidence', label:'Confidence', pct:82, accent:C.primary, insight:'Confidence increased 8% this week.' },
    { id:'clarity', label:'Clarity', pct:74, accent:C.secondary, insight:'Clarity improved in structured answers.' },
    { id:'fluency', label:'Fluency', pct:69, accent:C.glow, insight:'Fluency steady; try longer turns.' },
    { id:'structure', label:'Structure', pct:58, accent:C.info, insight:'Work on narrative structure and signposting.' },
    { id:'vocab', label:'Vocabulary', pct:72, accent:C.accentSettings, insight:'Vocabulary richness improved by 9%.' },
  ];

  const focus = [
    { title:'Reduce filler words during storytelling', impact:'High', rec:'Practice 5 short stories with AI.' },
    { title:'Pause slightly before answering', impact:'Medium', rec:'Practice with pacing prompts.' },
    { title:'Improve eye-contact confidence', impact:'Low', rec:'Try peer sessions with feedback.' },
  ];

  const heat = [0,1,2,3,2,1,4, 2,3,4,1,0,2,3, 0,1,2,3,2,1,0];

  const sessions = [
    { title:'Mock — PM Interview', date:'Yesterday', score:92, best:'Structure', area:'Pacing', dur:'28m' },
    { title:'Phone Call with AI', date:'2 days ago', score:78, best:'Clarity', area:'Fillers', dur:'18m' },
    { title:'Peer Practice', date:'4 days ago', score:85, best:'Confidence', area:'Transitions', dur:'22m' },
  ];

  const [range, setRange] = useState('7');

  // Week (7d) points — adjusted to fit tighter vertical space
  const weekPoints = [
    { x: 60, y: 170, label: 'Mon' },
    { x: 160, y: 140, label: 'Tue' },
    { x: 260, y: 130, label: 'Wed' },
    { x: 360, y: 140, label: 'Thu' },
    { x: 460, y: 100, label: 'Fri' },
    { x: 560, y: 60,  label: 'Sat' },
    { x: 760, y: 90,  label: 'Sun' },
  ];

  // Month (30d) simplified sample points
  const monthPoints = [
    { x: 40, y: 170, label: 'Wk1' },{ x: 140, y: 150, label: '' },{ x: 200, y: 160, label: '' },{ x: 260, y: 140, label: '' },
    { x: 320, y: 130, label: '' },{ x: 380, y: 120, label: '' },{ x: 440, y: 110, label: '' },{ x: 500, y: 100, label: '' },
    { x: 560, y: 90, label: 'Wk4' },{ x: 660, y: 95, label: '' },{ x: 760, y: 120, label: '' },
  ];

  const perfPoints = range === '7' ? weekPoints : monthPoints;
  const perfPointsStr = perfPoints.map(p => `${p.x} ${p.y}`).join(' L ');
  const perfStrokePath = `M ${perfPointsStr}`;
  const perfAreaPath = `${perfStrokePath} L 860 180 L 40 180 Z`;

  // Radar polygon points (dynamic from metrics)
  const radarCenter = { x: 110, y: 110 };
  const radarMax = 72; // radius
  const radarAngles = metrics.map((_, i) => (-Math.PI / 2) + (2 * Math.PI * i) / metrics.length);
  const radarPoints = metrics.map((m, i) => {
    const r = (m.pct / 100) * radarMax;
    const x = Math.round(radarCenter.x + r * Math.cos(radarAngles[i]));
    const y = Math.round(radarCenter.y + r * Math.sin(radarAngles[i]));
    return `${x},${y}`;
  }).join(' ');

  const radarLabelPositions = metrics.map((m, i) => {
    const angle = radarAngles[i];
    const x = Math.round(radarCenter.x + (radarMax + 18) * Math.cos(angle));
    const y = Math.round(radarCenter.y + (radarMax + 18) * Math.sin(angle));
    return { x, y, label: m.label };
  });

  return (
    <div className={styles.page}>
      {/* HERO */}
      <div className={styles.hero}>
        <div className={styles.greeting}>
          <div className={styles.greetTitle}>Welcome back, Vaibhav</div>
          <div className={styles.greetSub}>Clarity + confidence: keep the momentum.</div>
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

      {/* MAIN SPLIT: Performance / Radar */}
      <div className={styles.layoutSplit}>
        <div className={`${styles.cardPremium} ${styles.performanceCard}`}>
          <div className={styles.cardHeader}>
            <div>
              <div className={styles.cardTitle}>Performance Progress</div>
              <div className={styles.cardSub}>Historical growth of your communication confidence.</div>
            </div>
            <div style={{display:'flex',gap:8,alignItems:'center'}}>
              <button onClick={() => setRange('7')} className={styles.rangeBtn} style={range==='7'?{background:'rgba(255,255,255,0.03)'}:{}}>7D</button>
              <button onClick={() => setRange('30')} className={styles.rangeBtn} style={range==='30'?{background:'rgba(255,255,255,0.03)'}:{}}>30D</button>
            </div>
          </div>

          <svg className={styles.performanceSVG} viewBox="0 0 900 200" preserveAspectRatio="xMinYMin meet">
            <defs>
              <linearGradient id="gconf" x1="0" x2="1"><stop offset="0%" stopColor="#B794F4"/><stop offset="100%" stopColor="#8B5CF6"/></linearGradient>
              <linearGradient id="areaGrad" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#B794F4" stopOpacity="0.18"/><stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.02"/></linearGradient>
            </defs>
            <path d={perfAreaPath} fill="url(#areaGrad)" className={styles.areaFill} />
            <path d={perfStrokePath} fill="none" stroke="url(#gconf)" strokeWidth="4" className={styles.perfLine} strokeLinecap="round" strokeLinejoin="round" />
            {perfPoints.map((p, idx) => (
              <circle key={idx} cx={p.x} cy={p.y} r={5} fill="#fff" opacity={0.95} className={styles.perfMarker} />
            ))}
            {perfPoints.map((p, idx) => (
              <text key={`t-${idx}`} x={p.x} y={186} className={styles.xLabel} textAnchor="middle">{p.label}</text>
            ))}
          </svg>
        </div>

        <div>
          <div className={styles.cardPremium}>
            <div className={styles.cardHeader}>
              <div>
                <div className={styles.cardTitle}>Skill Radar</div>
                <div className={styles.cardSub}>Multidimensional communication analysis</div>
              </div>
            </div>
            <div className={styles.radarWrap}>
              <svg className={styles.radarSVG} viewBox="0 0 220 220">
                {/* concentric rings */}
                <circle cx="110" cy="110" r="80" fill="rgba(255,255,255,0.00)" stroke="rgba(255,255,255,0.02)" />
                <circle cx="110" cy="110" r="56" fill="none" stroke="rgba(255,255,255,0.01)" />
                <circle cx="110" cy="110" r="32" fill="none" stroke="rgba(255,255,255,0.01)" />
                {/* radar polygon */}
                <polygon points={radarPoints} fill="rgba(139,92,246,0.08)" stroke="rgba(167,139,250,0.26)" strokeWidth="2" />
                {/* markers at points */}
                {radarPoints.split(' ').map((pt, i) => {
                  const [x, y] = pt.split(',');
                  return <circle key={i} cx={x} cy={y} r={4} fill="#CDBBFF" />
                })}
                {/* labels */}
                {radarLabelPositions.map((L, i) => (
                  <text key={`lab-${i}`} x={L.x} y={L.y} className={styles.radarLabel} textAnchor="middle">{L.label.toUpperCase()}</text>
                ))}
              </svg>
              <div style={{textAlign:'center'}}>
                <div style={{fontSize:28,fontWeight:800}}>84</div>
                <div className={styles.smallMuted}>Overall — Excellent</div>
              </div>
            </div>
          </div>

          <div className={styles.cardPremium} style={{marginTop:20}}>
            <div className={styles.cardHeader}>
              <div>
                <div className={styles.cardTitle}>AI Coach Insights</div>
                <div className={styles.cardSub}>Conversational recommendations</div>
              </div>
            </div>
            <div className={styles.aiInsights}>
              <div className={styles.aiCard}>You explain ideas clearly under pressure — add one concise example to increase memorability.</div>
              <div className={styles.aiCard}>Transitions show slight hesitation — practice 5 timed transitions to smooth flow.</div>
              <div className={styles.aiCard}>Tone is more natural in unscripted speech — keep practicing spontaneous prompts.</div>
            </div>
          </div>

          {/* Filler words card */}
          <div className={styles.cardPremium} style={{marginTop:20}}>
            <div className={styles.cardHeader}>
              <div>
                <div className={styles.cardTitle}>Filler Words</div>
                <div className={styles.cardSub}>Commonly used — hover to inspect</div>
              </div>
            </div>
            <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
              {['uh','like','you know','so','actually'].map((w,i)=> (
                <div key={i} className={styles.fillerChip} title={`${w} — ${Math.max(1, 4-i)} times`}>
                  <div className={styles.fillerWord}>{w}</div>
                  <div className={styles.fillerCount}>{Math.max(1,4-i)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Communication Health as premium vertical widgets */}
      <div className={styles.healthGrid}>
        {metrics.map(m=> (
          <div key={m.id} className={styles.insightWidget}>
            <div className={styles.widgetTitle}>{m.label}</div>
            <div className={styles.widgetSmall}>{m.insight}</div>
            <div style={{height:12,background:'rgba(255,255,255,0.03)',borderRadius:8,marginTop:12}}>
              <div style={{width:`${m.pct}%`,height:'100%',borderRadius:8,background:`linear-gradient(90deg, ${m.accent}, ${C.secondary})`,transition:'width 1s'}} />
            </div>
            <div style={{marginTop:10,fontWeight:800}}>{m.pct}%</div>
          </div>
        ))}
      </div>

      {/* Today's Focus + Recent Sessions + Achievements */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 420px',gap:28,marginTop:28}}>
        <div>
          <div className={styles.cardPremium}>
            <div className={styles.cardHeader}>
              <div>
                <div className={styles.cardTitle}>Today's Focus</div>
                <div className={styles.cardSub}>High-impact practice recommendations</div>
              </div>
            </div>
            <div className={styles.focusGrid}>
              {focus.map((f,i)=> (
                <div key={i} className={styles.focusCard}>
                  <div>
                    <div style={{fontWeight:800}}>{f.title}</div>
                    <div className={styles.widgetSmall} style={{marginTop:6}}>{f.rec}</div>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <div className={styles.priority}>{f.impact}</div>
                    <div className={styles.smallMuted} style={{marginTop:6}}>Estimated impact: {i===0?'High':i===1?'Medium':'Low'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.cardPremium} style={{marginTop:20}}>
            <div className={styles.cardHeader}>
              <div>
                <div className={styles.cardTitle}>Recent Sessions</div>
                <div className={styles.cardSub}>Latest feedback & takeaways</div>
              </div>
            </div>
            <div className={styles.sessionsList}>
              {sessions.map((s,i)=> (
                <div key={i} className={styles.sessionCardPremium} onClick={() => router.push('/report')}>
                  <div style={{display:'flex',alignItems:'center',gap:12}}>
                    <div style={{width:56,height:56,borderRadius:12,background:'linear-gradient(135deg,#8B5CF6,#A78BFA)',display:'grid',placeItems:'center',fontWeight:800,color:'#fff'}}>{s.title.split(' ')[0][0]}</div>
                    <div>
                      <div style={{fontWeight:800}}>{s.title}</div>
                      <div className={styles.smallMuted}>{s.date} · {s.dur}</div>
                    </div>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <div style={{fontWeight:900,fontSize:18,color: s.score>=90?C.success:s.score>=75?C.primary:C.warning}}>{s.score}</div>
                    <div className={styles.smallMuted} style={{marginTop:6}}>{s.best} · needs {s.area}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className={styles.cardPremium}>
            <div className={styles.cardHeader}>
              <div>
                <div className={styles.cardTitle}>Achievements</div>
                <div className={styles.cardSub}>Milestones & rewards</div>
              </div>
            </div>
            <div className={styles.achieves}>
              <div className={styles.achieve}><span className="shine">🔥 14-Day Streak</span></div>
              <div className={styles.achieve}><span className="shine">🎯 Reduced Fillers 20%</span></div>
              <div className={styles.achieve}><span className="shine">🧠 STAR Storytelling</span></div>
              <div className={styles.achieve}><span className="shine">🏆 25 Sessions</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* quick action dock removed per request */}
    </div>
  )
}
