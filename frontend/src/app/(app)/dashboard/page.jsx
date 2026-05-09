"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { C } from '@/constants/theme';
import { GlassCard, NeonButton } from '@/components/shared';
import styles from './Dashboard.module.css';

export default function DashboardPage(){
  const router = useRouter();

  const metrics = [
    { id:'confidence', label:'Confidence Level', pct:82, accent:C.primary, insight:'Confidence increased 8% this week.' },
    { id:'clarity', label:'Clarity', pct:74, accent:C.secondary, insight:'Clarity improved in structured answers.' },
    { id:'fluency', label:'Fluency', pct:69, accent:C.glow, insight:'Fluency steady; try longer turns.' },
    { id:'listening', label:'Listening Balance', pct:58, accent:C.info, insight:'Work on active listening cues.' },
    { id:'fillers', label:'Filler Reduction', pct:42, accent:C.warning, insight:'Filler words down 12%.' },
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

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.greeting}>
          <div className={styles.greetTitle}>Welcome back, Vaibhav 👋</div>
          <div className={styles.greetSub}>Your clarity improved 12% this week — keep the momentum going. Today's AI insight: focus on pausing before key points for stronger impact.</div>
        </div>

        <div className={`${styles.cardPremium} ${styles.streakCard}`}>
          <div style={{fontSize:12,color: 'rgba(255,255,255,0.7)',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:8}}>Current Streak</div>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <div style={{fontSize:44,fontWeight:800,color:'#FFB86B'}}>7</div>
            <div>
              <div style={{fontSize:13,fontWeight:700}}>Day Streak</div>
              <div className={styles.smallMuted}>You're building communication momentum</div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.gridMain}>
        <div>
          {/* Communication Health */}
          <div className={`${styles.cardPremium}`}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
              <div style={{fontSize:14,fontWeight:800}}>Communication Health</div>
              <div className={styles.smallMuted}>Overview · AI Coach</div>
            </div>
            <div>
              {metrics.map(m=> (
                <div key={m.id} style={{marginBottom:12}}>
                  <div className={styles.healthMetric}>
                    <div>
                      <div className={styles.metricLabel}>{m.label}</div>
                      <div className={styles.smallMuted}>{m.insight}</div>
                    </div>
                    <div style={{fontWeight:800}}>{m.pct}%</div>
                  </div>
                  <div className={styles.metricBar} aria-hidden>
                    <div className={styles.barFill} style={{width: `${m.pct}%`, background: `linear-gradient(90deg, ${m.accent}, ${C.secondary})`}} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Daily Focus */}
          <div className={`${styles.cardPremium}`} style={{marginTop:20}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
              <div style={{fontSize:14,fontWeight:800}}>Today's Communication Focus</div>
              <div className={styles.smallMuted}>Personalized goals</div>
            </div>
            <div className={styles.focusList}>
              {focus.map((f,i)=> (
                <div key={i} className={styles.focusItem}>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700}}>{f.title}</div>
                    <div className={styles.smallMuted} style={{marginTop:6}}>{f.rec}</div>
                  </div>
                  <div style={{marginLeft:12}}>
                    <div className={styles.priority}>{f.impact}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Practice Activity */}
          <div className={`${styles.cardPremium}`} style={{marginTop:20}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
              <div style={{fontSize:14,fontWeight:800}}>Weekly Practice Consistency</div>
              <div className={styles.smallMuted}>Sessions · Minutes</div>
            </div>
            <div className={styles.heatmap}>
              {heat.slice(0,7).map((h,i)=> (
                <div key={i} className={styles.heatCell} style={{background: `rgba(124,58,237,${0.05 + h*0.12})`}} />
              ))}
            </div>
            <div style={{display:'flex',gap:12,marginTop:12,alignItems:'center'}}>
              <div style={{fontWeight:800,fontSize:24}}>12</div>
              <div>
                <div style={{fontWeight:700}}>Sessions this week</div>
                <div className={styles.smallMuted}>Consistency improved 18% vs last week</div>
              </div>
            </div>
          </div>
        </div>

        <div>
          {/* AI Coach Insights */}
          <div className={`${styles.cardPremium}`}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
              <div style={{fontSize:14,fontWeight:800}}>AI Coach Insights</div>
              <div className={styles.smallMuted}>Actionable recommendations</div>
            </div>
            <div className={styles.insightList}>
              <div className={styles.insightCard}>You explain technical ideas clearly — try adding one concise example per answer to improve recall.</div>
              <div className={styles.insightCard}>You hesitate slightly during transitions — practice 5 timed transitions to reduce pauses.</div>
              <div className={styles.insightCard}>Vocabulary richness improved by 9% — keep using new words in daily summaries.</div>
            </div>
          </div>

          {/* Recent Sessions */}
          <div className={`${styles.cardPremium}`} style={{marginTop:20}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
              <div style={{fontSize:14,fontWeight:800}}>Recent Sessions</div>
              <div className={styles.smallMuted}>Quick review</div>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:12}}>
              {sessions.map((s,i)=> (
                <div key={i} className={styles.sessionCard} onClick={() => router.push('/report')}>
                  <div className={styles.sessionMeta}>
                    <div style={{width:48,height:48,borderRadius:10,background:'linear-gradient(135deg,#8B5CF6,#A78BFA)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800}}>S</div>
                    <div>
                      <div style={{fontWeight:800}}>{s.title}</div>
                      <div className={styles.smallMuted}>{s.date} · {s.dur}</div>
                    </div>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <div style={{fontWeight:800,fontSize:18,color: s.score>=90?C.success:s.score>=75?C.primary:C.warning}}>{s.score}</div>
                    <div className={styles.smallMuted}>{s.best} · needs {s.area}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Growth chart */}
          <div className={`${styles.cardPremium}`} style={{marginTop:20}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
              <div style={{fontSize:14,fontWeight:800}}>Your Growth Journey</div>
              <div className={styles.smallMuted}>Confidence · Fluency · Clarity</div>
            </div>
            <svg className={styles.growthSVG} viewBox="0 0 600 160" preserveAspectRatio="none">
              <defs>
                <linearGradient id="l1" x1="0" x2="1"><stop offset="0%" stopColor="#A78BFA"/><stop offset="100%" stopColor="#8B5CF6"/></linearGradient>
              </defs>
              <path d="M0 120 C100 90 200 60 300 70 C380 78 460 50 600 35" fill="none" stroke="url(#l1)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.95" />
            </svg>
          </div>

          {/* Achievements */}
          <div className={`${styles.cardPremium}`} style={{marginTop:20}}>
            <div style={{fontSize:14,fontWeight:800,marginBottom:12}}>Achievements</div>
            <div className={styles.achieves}>
              <div className={styles.achieve}>🏆 10 Sessions Completed</div>
              <div className={styles.achieve}>🔥 7-day Streak</div>
              <div className={styles.achieve}>🎯 Filler Reduction 20%</div>
              <div className={styles.achieve}>🧠 STAR Storytelling Improved</div>
            </div>
          </div>
        </div>
      </div>

      {/* quick actions removed as requested (was floating buttons on the right) */}
    </div>
  )
}
