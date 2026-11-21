"use client";
import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import styles from './landing.module.css';

gsap.registerPlugin(ScrollTrigger);

// WebGL only loads in the browser, after the first paint of the page.
const HumanStage = dynamic(() => import('./HumanStage'), { ssr: false, loading: () => null });

const HERO_LINES = [['Your', 'voice'], ['can', 'take', 'you'], ['further.']];
// Peer rooms are anonymous by design: participants appear as Peer A, B, C, D.
const ROOM = [
  { id: 'A', name: 'Peer A', color: 'var(--bv-brand)' },
  { id: 'B', name: 'Peer B', color: 'var(--bv-growth)' },
  { id: 'C', name: 'Peer C', color: 'var(--bv-peer)' },
  { id: 'D', name: 'Peer D', color: 'var(--bv-daily)' },
];
const QUESTION = 'Tell me about a time you had to lead a team through a difficult technical decision.';
const ANSWER = [
  'We had two weeks to choose between a rewrite and a patch.',
  'I listed the risks, asked each engineer for a position, and we shipped the patch with a rollback plan.',
];
const MARKERS = [
  { tag: 'Strength', color: 'var(--bv-success)', text: 'Situation, task and action are clear and in order.' },
  { tag: 'Result', color: 'var(--bv-warning)', text: 'The result is missing a number. Add what changed.' },
  { tag: 'Fillers', color: 'var(--bv-info)', text: 'Two "basically" in one answer. Pause instead.' },
];

const PATH_COLORS = ['var(--bv-brand)', 'var(--bv-growth)', 'var(--bv-daily)'];

export default function Landing() {
  const root = useRef(null);
  const { status } = useAuth();
  const signedIn = status === 'authenticated';
  const primaryHref = signedIn ? '/dashboard' : '/auth';
  const primaryLabel = signedIn ? 'Open dashboard' : 'Start practising';

  const [joined, setJoined] = useState(0);
  const [topicOn, setTopicOn] = useState(false);
  const [typed, setTyped] = useState({ q: '', a: 0, chars: 0 });
  const [markersOn, setMarkersOn] = useState(0);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    ScrollTrigger.defaults({ scroller: el });
    const mm = gsap.matchMedia();

    const startInterview = () => {
      let i = 0;
      const qTimer = setInterval(() => {
        i += 2;
        setTyped((t) => ({ ...t, q: QUESTION.slice(0, i) }));
        if (i >= QUESTION.length) {
          clearInterval(qTimer);
          let line = 0; let ch = 0;
          const aTimer = setInterval(() => {
            ch += 2;
            setTyped((t) => ({ ...t, a: line, chars: ch }));
            if (ch >= ANSWER[line].length) {
              if (line === ANSWER.length - 1) {
                clearInterval(aTimer);
                MARKERS.forEach((_, m) => setTimeout(() => setMarkersOn(m + 1), 350 * (m + 1)));
              } else { line += 1; ch = 0; }
            }
          }, 28);
        }
      }, 22);
      return () => clearInterval(qTimer);
    };

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const ctx = gsap.context(() => {
        gsap.from('[data-hero-word]', { yPercent: 110, duration: 1.1, ease: 'power4.out', stagger: 0.07, delay: 0.1 });
        gsap.from('[data-hero-fade]', { opacity: 0, y: 18, duration: 0.9, ease: 'power3.out', stagger: 0.1, delay: 0.7 });

        // Skill paths draw as the visitor scrolls.
        gsap.utils.toArray('[data-draw]').forEach((p) => {
          gsap.fromTo(p, { strokeDashoffset: 1 }, {
            strokeDashoffset: 0, ease: 'none',
            scrollTrigger: { trigger: p.closest('section'), start: 'top 70%', end: 'bottom 60%', scrub: 0.6 },
          });
        });
        gsap.from('[data-path-label]', {
          opacity: 0, y: 12, stagger: 0.15, duration: 0.6,
          scrollTrigger: { trigger: '[data-paths]', start: 'top 55%' },
        });

        gsap.utils.toArray('[data-reveal]').forEach((n) => {
          gsap.from(n, { opacity: 0, y: 36, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: n, start: 'top 85%' } });
        });

        gsap.set('[data-tile]', { opacity: 0, scale: 0.9, y: 16 });
        ScrollTrigger.create({
          trigger: '[data-room]', start: 'top 75%', once: true,
          onEnter: () => {
            gsap.to('[data-tile]', { opacity: 1, scale: 1, y: 0, duration: 0.6, ease: 'back.out(1.5)', stagger: 0.18 });
            ROOM.forEach((_, n) => setTimeout(() => setJoined(n + 1), 450 + n * 180));
          },
        });

        let stop;
        ScrollTrigger.create({ trigger: '[data-interview]', start: 'top 70%', once: true, onEnter: () => { stop = startInterview(); } });
        return () => stop?.();
      }, el);
      return () => ctx.revert();
    });

    mm.add('(prefers-reduced-motion: reduce)', () => {
      setJoined(ROOM.length);
      setTyped({ q: QUESTION, a: ANSWER.length - 1, chars: ANSWER[ANSWER.length - 1].length });
      setMarkersOn(MARKERS.length);
      gsap.set('[data-draw]', { strokeDashoffset: 0 });
    });

    // Restrained magnetic pull on the primary buttons, fine pointers only.
    mm.add('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
      const els = gsap.utils.toArray('[data-magnetic]');
      const cleanups = els.map((m) => {
        const move = (e) => {
          const r = m.getBoundingClientRect();
          gsap.to(m, { x: (e.clientX - (r.left + r.width / 2)) * 0.18, y: (e.clientY - (r.top + r.height / 2)) * 0.25, duration: 0.3, ease: 'power3.out' });
        };
        const leave = () => gsap.to(m, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)' });
        m.addEventListener('pointermove', move);
        m.addEventListener('pointerleave', leave);
        return () => { m.removeEventListener('pointermove', move); m.removeEventListener('pointerleave', leave); };
      });
      return () => cleanups.forEach((c) => c());
    });

    return () => { mm.revert(); ScrollTrigger.defaults({ scroller: window }); };
  }, []);

  const onHeroMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
    e.currentTarget.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
  };

  return (
    <div ref={root} className={styles.page}>
      <header className={styles.nav}>
        <Link href="/" className={styles.brand}>
          <img src="/brand/bravely-lockup.png" alt="Bravely" />
          <span className="sr-only">Home</span>
        </Link>
        <nav className={styles.navLinks} aria-label="Sections">
          <a className={styles.navLink} href="#paths">Skills</a>
          <a className={styles.navLink} href="#rooms">Peer rooms</a>
          <a className={styles.navLink} href="#interview">Interviews</a>
        </nav>
        <div className={styles.navCta}>
          {!signedIn && <Link href="/auth" className="bv-btn bv-btn--ghost bv-btn--sm">Sign in</Link>}
          <Link href={primaryHref} className="bv-btn bv-btn--primary bv-btn--sm">{signedIn ? 'Dashboard' : 'Get started'}</Link>
        </div>
      </header>

      <main>
        <section className={styles.hero} onPointerMove={onHeroMove}>
          <div className={styles.glow} aria-hidden="true" />
          <div className={`${styles.wrap} ${styles.heroGrid}`}>
            <div>
              <p className={styles.eyebrow} data-hero-fade>Say it. Mean it.</p>
              <h1 className={styles.h1} aria-label="Your voice can take you further.">
                {HERO_LINES.map((words, i) => (
                  <span key={i} className={styles.line} aria-hidden="true">
                    {words.map((w) => <span key={w} data-hero-word className={styles.word}>{w}&nbsp;</span>)}
                  </span>
                ))}
              </h1>
              <p className={styles.lede} data-hero-fade>
                Speak with more clarity and confidence. Practise with an AI coach or with other people, earn streaks and levels, and watch your fluency grow.
              </p>
              <div className={styles.heroCta} data-hero-fade>
                <span className={styles.magnetic} data-magnetic>
                  <Link href={primaryHref} className="bv-btn bv-btn--primary bv-btn--lg">{primaryLabel} <ArrowRight size={18} aria-hidden="true" /></Link>
                </span>
                <a href="#paths" className="bv-btn bv-btn--secondary bv-btn--lg">See how it works</a>
              </div>
              <div className={styles.wave} aria-hidden="true" data-hero-fade>
                {Array.from({ length: 28 }, (_, i) => (
                  <i key={i} style={{ animationDelay: `${(i % 9) * 0.12}s`, animationDuration: `${1.1 + (i % 5) * 0.18}s` }} />
                ))}
              </div>
            </div>

            <div className={styles.stage} data-hero-fade>
              <HumanStage />
              <div className={styles.stageCaption}>
                <span className={styles.dot} aria-hidden="true" />
                Your AI interviewer. Ready when you are.
              </div>
            </div>
          </div>
        </section>

        <section className={styles.section} id="paths">
          <div className={styles.wrap}>
            <p className={styles.kicker} data-reveal>Growth paths</p>
            <h2 className={styles.h2} data-reveal>Skills aren&apos;t built alone.</h2>
            <p className={styles.sub} data-reveal>One conversation branches into the abilities that matter: speaking clearly, discussing with others and building confidence a little every day.</p>
            <div className={styles.paths} data-paths>
              <svg viewBox="0 0 1000 300" role="img" aria-label="One conversation line splits into three paths: communicate, collaborate and grow">
                <path data-draw pathLength="1" strokeDasharray="1" className={styles.pathLine} stroke="var(--bv-t3)" d="M0 150 C 180 150, 260 150, 380 150" />
                {[
                  { d: 'M380 150 C 520 150, 560 50, 760 50 L 1000 50', y: 50, label: 'COMMUNICATE', note: 'Clear, structured, fewer fillers' },
                  { d: 'M380 150 C 520 150, 600 150, 760 150 L 1000 150', y: 150, label: 'COLLABORATE', note: 'Group discussions and peer calls' },
                  { d: 'M380 150 C 520 150, 560 250, 760 250 L 1000 250', y: 250, label: 'GROW', note: 'Streaks and scores against your baseline' },
                ].map((p, i) => (
                  <g key={p.label}>
                    <path data-draw pathLength="1" strokeDasharray="1" className={styles.pathLine} stroke={PATH_COLORS[i]} d={p.d} />
                    <g data-path-label>
                      <text className={styles.pathLabel} x="790" y={p.y - 12}>{p.label}</text>
                      <text className={styles.pathNote} x="790" y={p.y + 22}>{p.note}</text>
                    </g>
                  </g>
                ))}
              </svg>
            </div>
          </div>
        </section>

        <section className={styles.section} id="rooms">
          <div className={styles.wrap}>
            <p className={styles.kicker} data-reveal>Peer rooms</p>
            <h2 className={styles.h2} data-reveal>Think together. Speak better.</h2>
            <p className={styles.sub} data-reveal>Join a small anonymous room, get a topic and practise a real discussion. Everyone appears as Peer A, B, C or D, and feedback is only about you.</p>
            <div className={styles.roomGrid} data-room>
              {ROOM.map((p, i) => (
                <div key={p.id} data-tile className={`${styles.tile} ${i >= joined ? styles.tileEmpty : ''}`}>
                  {i < joined ? (
                    <>
                      <span className={styles.tileAvatar} style={{ background: p.color }}>{p.id}</span>
                      <span className={styles.tileName}>{p.name}</span>
                      <span className={styles.tileLive} aria-hidden="true" />
                    </>
                  ) : 'Waiting…'}
                </div>
              ))}
            </div>
            <div className={styles.roomBar} data-reveal>
              <span aria-live="polite">
                {joined} of 4 participants · {topicOn ? <span className={styles.topic}>Topic unlocked: Giving feedback that lands</span> : 'Topic locked'}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span className={styles.sample}>Sample preview</span>
                <button type="button" className="bv-btn bv-btn--secondary bv-btn--sm" disabled={joined < 4 || topicOn} onClick={() => setTopicOn(true)}>
                  {topicOn ? 'Discussion started' : 'Unlock topic'}
                </button>
              </span>
            </div>
          </div>
        </section>

        <section className={styles.section} id="interview">
          <div className={styles.wrap}>
            <p className={styles.kicker} data-reveal>Interview practice</p>
            <h2 className={styles.h2} data-reveal>Prepare for the moments that matter.</h2>
            <p className={styles.sub} data-reveal>Answer out loud. Your words are transcribed and scored on STAR structure, clarity, filler words and pace. Strengths first, then one clear tip.</p>
            <div className={styles.interview} data-interview>
              <div className={styles.panel}>
                <p className={styles.panelLabel}>Question · sample preview</p>
                <p className={styles.question} aria-live="polite">{typed.q}{typed.q.length < QUESTION.length && <span className={styles.caret} />}</p>
                <div className={styles.transcript}>
                  {ANSWER.map((line, i) => {
                    const shown = i < typed.a ? line : i === typed.a ? line.slice(0, typed.chars) : '';
                    return shown ? <p key={i}>{shown}</p> : null;
                  })}
                </div>
              </div>
              <div className={styles.panel}>
                <p className={styles.panelLabel}>Feedback markers</p>
                <div className={styles.markers}>
                  {MARKERS.slice(0, markersOn).map((m) => (
                    <div key={m.tag} className={styles.marker}>
                      <span className={styles.markerTag} style={{ background: m.color }}>{m.tag}</span>
                      <span>{m.text}</span>
                    </div>
                  ))}
                  {markersOn === 0 && <p className={styles.sample}>Appears as you answer.</p>}
                </div>
              </div>
            </div>
            <p className={styles.caution} role="note">
              <strong>How accurate are the scores?</strong> They are estimates. Pace, pauses and filler words are measured from your speech.
              Structure and relevance come from an AI model. Accents, background noise and very short answers can reduce accuracy,
              so Bravely shows a range and a confidence level, and asks for enough speech before it scores. Use scores to track your own progress, not as an exam result.
            </p>
          </div>
        </section>

        <section className={`${styles.section} ${styles.closing}`}>
          <div className={styles.wrap}>
            <div className={styles.paths} data-paths-end>
              <svg viewBox="0 0 1000 200" role="img" aria-label="Three paths join into one upward line">
                {[
                  { d: 'M0 30 C 300 30, 420 100, 640 100', c: PATH_COLORS[0] },
                  { d: 'M0 100 C 300 100, 420 100, 640 100', c: PATH_COLORS[1] },
                  { d: 'M0 170 C 300 170, 420 100, 640 100', c: PATH_COLORS[2] },
                ].map((p) => <path key={p.c} data-draw pathLength="1" strokeDasharray="1" className={styles.pathLine} stroke={p.c} d={p.d} />)}
                <path data-draw pathLength="1" strokeDasharray="1" className={styles.pathLine} stroke="var(--bv-t1)" d="M640 100 C 780 100, 860 60, 1000 20" />
              </svg>
            </div>
            <div className={styles.closingInner}>
              <h2 className={styles.h2} data-reveal>Every conversation moves you forward.</h2>
              <ul className={styles.habits} data-reveal>
                <li><strong>Daily streaks</strong> Short daily practice builds the habit.</li>
                <li><strong>Levels and badges</strong> Progress against your own baseline, not other people.</li>
                <li><strong>Practise either way</strong> With an AI coach or live with other people.</li>
              </ul>
              <div style={{ marginTop: 32 }} data-reveal>
                <span className={styles.magnetic} data-magnetic>
                  <Link href={primaryHref} className="bv-btn bv-btn--primary bv-btn--lg">{primaryLabel} <ArrowRight size={18} aria-hidden="true" /></Link>
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.wrap}>© {new Date().getFullYear()} Bravely</div>
      </footer>
    </div>
  );
}
