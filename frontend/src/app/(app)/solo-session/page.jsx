"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { C } from '@/constants/theme';
import { NeonButton, GlassCard, Tag, AIAvatar, MicWave } from '@/components/shared';
import { endInterview, startInterview, submitInterviewAnswer } from '@/services/interviewService';

function readSessionConfig() {
  try {
    const raw = sessionStorage.getItem('aia_session_config');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function readSessionResume() {
  try {
    const raw = sessionStorage.getItem('aia_session_resume');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function clampScore(value) {
  return Math.max(0, Math.min(100, Math.round(value || 0)));
}

function scorePace(wordsPerMinute) {
  if (!Number.isFinite(Number(wordsPerMinute)) || Number(wordsPerMinute) <= 0) return 0;
  const ideal = 135;
  const distance = Math.abs(Number(wordsPerMinute) - ideal);
  return clampScore(100 - distance * 1.35);
}

function computeTranscriptScores(text, elapsedSeconds) {
  const cleaned = String(text || '').trim();
  if (!cleaned) return { confidence: 0, clarity: 0, pace: 0 };

  const words = cleaned.toLowerCase().match(/[a-z']+/g) || [];
  const wordCount = words.length;
  const uniqueWords = new Set(words).size;
  const sentenceCount = Math.max(1, (cleaned.match(/[.!?]+/g) || []).length);
  const avgSentenceLength = wordCount / sentenceCount;
  const measuredSeconds = Number.isFinite(Number(elapsedSeconds)) && Number(elapsedSeconds) > 0
    ? Number(elapsedSeconds)
    : 0;
  const estimatedSeconds = Math.max(2, (wordCount / 145) * 60);
  const durationMinutes = Math.max(Math.max(measuredSeconds, estimatedSeconds) / 60, 0.05);
  const wordsPerMinute = wordCount / durationMinutes;

  const fillerSet = new Set(['um', 'uh', 'like', 'actually', 'basically', 'literally', 'just', 'maybe', 'kind', 'sort']);
  const hedgeSet = new Set(['maybe', 'probably', 'guess', 'think', 'somehow', 'perhaps']);
  const fillerCount = words.filter((word) => fillerSet.has(word)).length;
  const hedgeCount = words.filter((word) => hedgeSet.has(word)).length;
  let repeatedPairs = 0;
  for (let i = 1; i < words.length; i += 1) {
    if (words[i] === words[i - 1]) repeatedPairs += 1;
  }

  const vocabularyRatio = wordCount ? uniqueWords / wordCount : 0;
  const completeEnding = /[.!?]$/.test(cleaned);
  const clarity =
    34 +
    Math.min(wordCount, 80) * 0.35 +
    vocabularyRatio * 22 +
    (avgSentenceLength >= 8 && avgSentenceLength <= 26 ? 18 : 8) +
    (completeEnding ? 8 : 2) -
    fillerCount * 4 -
    repeatedPairs * 5;

  const confidence =
    36 +
    Math.min(wordCount, 70) * 0.42 +
    (words.some((word) => ['led', 'built', 'improved', 'delivered', 'owned', 'created', 'solved'].includes(word)) ? 12 : 4) +
    (completeEnding ? 7 : 2) -
    hedgeCount * 6 -
    fillerCount * 3;

  return {
    confidence: clampScore(confidence),
    clarity: clampScore(clarity),
    pace: scorePace(wordsPerMinute),
  };
}

export default function SoloPage() {
  const router = useRouter();
  const videoRef = useRef(null);
  const recognitionRef = useRef(null);
  const postureTimerRef = useRef(null);
  const poseLandmarkerRef = useRef(null);
  const poseFrameRef = useRef(null);
  const poseNoLandmarkRef = useRef(0);
  const postureScoreRef = useRef(70);
  const lastVideoTimeRef = useRef(-1);
  const restoreMediapipeConsoleRef = useRef(null);
  const micOnRef = useRef(false);

  const [config] = useState(() => readSessionConfig() || {
    role: 'Software Engineer',
    roleId: 'se',
    interviewRound: 'behavioral',
    interviewContext: 'General',
  });

  const [sessionId, setSessionId] = useState('');
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [questionText, setQuestionText] = useState('Preparing your personalized question...');

  const [time, setTime] = useState(0);
  const [micOn, setMicOn] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interim, setInterim] = useState('');
  const [speaking, setSpeaking] = useState(true);
  const [answerStartedAt, setAnswerStartedAt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [latestScores, setLatestScores] = useState({ confidence: 0, clarity: 0, pace: 0 });
  const [feedback, setFeedback] = useState('');
  const [posture, setPosture] = useState({ score: 70, label: 'Stable posture' });
  const [sessionReady, setSessionReady] = useState(false);

  const canUseSpeech = typeof window !== 'undefined' && (
    'SpeechRecognition' in window || 'webkitSpeechRecognition' in window
  );

  useEffect(() => {
    micOnRef.current = micOn;
  }, [micOn]);

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const speakQuestion = useCallback(function speakQuestion(text, attempt = 0) {
    if (typeof window === 'undefined' || !window.speechSynthesis || !text) return;

    const voices = window.speechSynthesis.getVoices();
    if (!voices.length && attempt < 3) {
      setTimeout(() => speakQuestion(text, attempt + 1), 250);
      return;
    }

    window.speechSynthesis.cancel();
    setSpeaking(true);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.volume = 1;

    if (voices.length) {
      utterance.voice = voices.find((voice) => /female|samantha|allison|google us english/i.test(voice.name)) || voices[0];
    }

    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => {
      setSpeaking(false);
      if (attempt < 2) {
        setTimeout(() => speakQuestion(text, attempt + 1), 300);
      }
    };

    window.speechSynthesis.speak(utterance);
  }, []);

  const enableMediapipeConsoleFilter = useCallback(() => {
    if (restoreMediapipeConsoleRef.current) return;

    const originalError = console.error;
    console.error = (...args) => {
      const message = args.map((arg) => String(arg)).join(' ');
      if (message.includes('INFO: Created TensorFlow Lite XNNPACK delegate for CPU.')) {
        return;
      }
      originalError(...args);
    };

    restoreMediapipeConsoleRef.current = () => {
      console.error = originalError;
      restoreMediapipeConsoleRef.current = null;
    };
  }, []);

  const computePostureFromLandmarks = useCallback((landmarks) => {
    const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, value));
    const distance = (a, b) => Math.hypot((a.x || 0) - (b.x || 0), (a.y || 0) - (b.y || 0));
    const visibility = (point) => point?.visibility ?? point?.presence ?? 0;

    const leftShoulder = landmarks?.[11];
    const rightShoulder = landmarks?.[12];
    const leftHip = landmarks?.[23];
    const rightHip = landmarks?.[24];
    const nose = landmarks?.[0];

    if (!leftShoulder || !rightShoulder || !leftHip || !rightHip) {
      return { score: Math.round(postureScoreRef.current), label: 'Move back so your shoulders and torso are visible' };
    }

    const corePoints = [leftShoulder, rightShoulder, leftHip, rightHip];
    const visibilityAvg = corePoints.reduce((sum, point) => sum + visibility(point), 0) / corePoints.length;
    const visibleCoreCount = corePoints.filter((point) => visibility(point) >= 0.45).length;
    if (visibilityAvg < 0.45 || visibleCoreCount < 3) {
      const faded = postureScoreRef.current * 0.9 + 50 * 0.1;
      postureScoreRef.current = faded;
      return { score: Math.round(faded), label: 'Improve lighting or move into frame for posture tracking' };
    }

    const shoulderMid = {
      x: (leftShoulder.x + rightShoulder.x) / 2,
      y: (leftShoulder.y + rightShoulder.y) / 2,
    };
    const hipMid = {
      x: (leftHip.x + rightHip.x) / 2,
      y: (leftHip.y + rightHip.y) / 2,
    };

    const torsoDx = hipMid.x - shoulderMid.x;
    const torsoDy = Math.max(hipMid.y - shoulderMid.y, 0.001);
    const torsoTiltDeg = Math.abs(Math.atan2(torsoDx, torsoDy) * (180 / Math.PI));
    const shoulderWidth = Math.max(distance(leftShoulder, rightShoulder), 0.001);
    const torsoLength = Math.max(distance(shoulderMid, hipMid), 0.001);
    const shoulderSlopeRatio = Math.abs(leftShoulder.y - rightShoulder.y) / shoulderWidth;
    const centerOffset = Math.abs(shoulderMid.x - 0.5);
    const headOffset = nose ? Math.abs(nose.x - shoulderMid.x) / shoulderWidth : 0.25;
    const frameSizeScore = clamp((shoulderWidth - 0.16) / 0.16, 0, 1);
    const uprightScore = clamp(1 - (torsoTiltDeg / 18), 0, 1);
    const shoulderLevelScore = clamp(1 - (shoulderSlopeRatio / 0.18), 0, 1);
    const centeredScore = clamp(1 - (centerOffset / 0.24), 0, 1);
    const headAlignedScore = clamp(1 - (headOffset / 0.65), 0, 1);
    const torsoVisibleScore = clamp((torsoLength - 0.15) / 0.2, 0, 1);

    const rawScore =
      uprightScore * 30 +
      shoulderLevelScore * 22 +
      centeredScore * 18 +
      headAlignedScore * 14 +
      frameSizeScore * 8 +
      torsoVisibleScore * 4 +
      clamp(visibilityAvg, 0, 1) * 4;

    const smoothed = postureScoreRef.current * 0.72 + clamp(rawScore, 30, 98) * 0.28;
    postureScoreRef.current = smoothed;
    const score = Math.round(smoothed);

    return {
      score,
      label:
        score >= 84 ? 'Strong posture and framing' :
        score >= 70 ? 'Good posture' :
        score >= 55 ? 'Sit upright and re-center your shoulders' :
        'Move into frame and straighten your posture',
    };
  }, []);

  const startRecognition = useCallback(() => {
    if (!canUseSpeech) return;

    const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Ctor) return;

    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
      recognitionRef.current = null;
    }

    const rec = new Ctor();
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 3;
    rec.lang = (typeof navigator !== 'undefined' && navigator.language) ? navigator.language : 'en-US';

    rec.onresult = (event) => {
      let interimText = '';
      let finalText = '';
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalText += `${t} `;
        } else {
          interimText += t;
        }
      }
      if (finalText) {
        setTranscript((prev) => `${prev} ${finalText}`.trim());
      }
      setInterim(interimText);
    };

    rec.onerror = () => {
      setMicOn(false);
    };

    rec.onend = () => {
      if (micOnRef.current) {
        try { rec.start(); } catch {}
      }
    };

    recognitionRef.current = rec;
    try {
      rec.start();
    } catch {
      setMicOn(false);
    }
  }, [canUseSpeech]);

  const stopRecognition = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
    }
    micOnRef.current = false;
    setInterim('');
  }, []);

  const stopSessionMedia = useCallback(() => {
    if (postureTimerRef.current) {
      clearInterval(postureTimerRef.current);
      postureTimerRef.current = null;
    }
    if (poseFrameRef.current) {
      cancelAnimationFrame(poseFrameRef.current);
      poseFrameRef.current = null;
    }
    if (poseLandmarkerRef.current?.close) {
      try { poseLandmarkerRef.current.close(); } catch {}
    }
    poseLandmarkerRef.current = null;
    restoreMediapipeConsoleRef.current?.();
    stopRecognition();
    setMicOn(false);
    if (window?.speechSynthesis) window.speechSynthesis.cancel();
    if (videoRef.current?.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks?.() || [];
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  }, [stopRecognition]);

  const startCameraAndPosture = useCallback(async () => {
    const startFaceFallback = () => {
      if (typeof window.FaceDetector === 'undefined') {
        postureTimerRef.current = setInterval(() => {
          setPosture((prev) => ({ ...prev, label: 'Camera active (landmarks unavailable on this browser)' }));
        }, 2000);
        return;
      }

      const detector = new window.FaceDetector({ fastMode: true, maxDetectedFaces: 1 });
      postureTimerRef.current = setInterval(async () => {
        if (!videoRef.current || videoRef.current.readyState < 2) return;
        try {
          const faces = await detector.detect(videoRef.current);
          if (!faces.length) {
            setPosture({ score: 40, label: 'Face not detected - adjust camera' });
            return;
          }
          const box = faces[0].boundingBox;
          const centerX = box.x + box.width / 2;
          const vw = videoRef.current.videoWidth || 1;
          const offset = Math.abs((centerX / vw) - 0.5);
          const score = Math.max(45, Math.round(100 - offset * 160));
          setPosture({
            score,
            label: score > 78 ? 'Great posture and framing' : score > 62 ? 'Good posture' : 'Sit centered for better posture score',
          });
        } catch {
          setPosture({ score: 60, label: 'Posture analysis temporarily unavailable' });
        }
      }, 1800);
    };

    const waitForVideoReady = () => new Promise((resolve, reject) => {
      const video = videoRef.current;
      if (!video) {
        reject(new Error('Video element unavailable'));
        return;
      }
      if (video.videoWidth > 0 && video.videoHeight > 0) {
        resolve();
        return;
      }
      const onReady = () => {
        video.removeEventListener('loadedmetadata', onReady);
        resolve();
      };
      video.addEventListener('loadedmetadata', onReady, { once: true });
      setTimeout(() => {
        video.removeEventListener('loadedmetadata', onReady);
        reject(new Error('Video not ready'));
      }, 4000);
    });

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await waitForVideoReady();
        await videoRef.current.play();
      }
    } catch {
      setPosture({ score: 55, label: 'Camera unavailable' });
      return;
    }

    try {
      enableMediapipeConsoleFilter();
      const vision = await import('@mediapipe/tasks-vision');
      const { PoseLandmarker, FilesetResolver } = vision;

      const fileset = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21/wasm'
      );

      poseLandmarkerRef.current = await PoseLandmarker.createFromOptions(fileset, {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
        },
        runningMode: 'VIDEO',
        numPoses: 1,
        minPoseDetectionConfidence: 0.5,
        minPosePresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      poseNoLandmarkRef.current = 0;
      lastVideoTimeRef.current = -1;

      const loop = () => {
        if (!videoRef.current || !poseLandmarkerRef.current) return;
        if (videoRef.current.readyState >= 2 && videoRef.current.currentTime !== lastVideoTimeRef.current) {
          try {
            lastVideoTimeRef.current = videoRef.current.currentTime;
            const result = poseLandmarkerRef.current.detectForVideo(videoRef.current, performance.now());
            const landmarks = result?.landmarks?.[0];
            if (landmarks?.length) {
              poseNoLandmarkRef.current = 0;
              const next = computePostureFromLandmarks(landmarks);
              setPosture(next);
            } else {
              poseNoLandmarkRef.current += 1;
              if (poseNoLandmarkRef.current >= 45) {
                setPosture({ score: 52, label: 'Posture landmarks missing - switching to fallback' });
                poseLandmarkerRef.current = null;
                startFaceFallback();
                return;
              }
            }
          } catch {
            // fall through to keep looping
          }
        }
        poseFrameRef.current = window.requestAnimationFrame(loop);
      };

      poseFrameRef.current = window.requestAnimationFrame(loop);
      return;
    } catch {
      startFaceFallback();
    }
  }, [computePostureFromLandmarks, enableMediapipeConsoleFilter]);

  const submitCurrentAnswer = useCallback(async () => {
    if (!sessionId || loading) return;

    const text = `${transcript} ${interim}`.trim();
    if (!text) {
      setError('Please speak your answer before submitting.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await submitInterviewAnswer({
        sessionId,
        question: questionText,
        text,
        posture,
        resume: readSessionResume(),
        config,
      });

      setLatestScores({
        confidence: Math.round(res?.scores?.confidence_score || 0),
        clarity: Math.round(res?.scores?.clarity_score || 0),
        pace: scorePace(res?.metrics?.words_per_minute) || Math.round(res?.scores?.filler_score || 0),
      });

      setFeedback(res?.feedback?.actionable_tip || 'Good response. Keep answers structured using STAR.');
      const next = res?.nextQuestion;
      if (next) {
        const nextIndex = currentQ + 1;
        setCurrentQ(nextIndex);
        setQuestions((prev) => {
          const copy = [...prev];
          copy[nextIndex] = next;
          return copy;
        });
        setQuestionText(next);
        setTranscript('');
        setInterim('');
        setAnswerStartedAt(null);
      } else {
        const ended = await endInterview({ sessionId });
        if (ended?.reportId) {
          sessionStorage.setItem('aia_latest_report_id', ended.reportId);
        }
        stopSessionMedia();
        router.push('/dashboard');
      }
    } catch (err) {
      setFeedback('');
      setError(err?.message || 'Failed to analyze this answer. Please retry.');
    } finally {
      setLoading(false);
    }
  }, [sessionId, loading, transcript, interim, questionText, posture, currentQ, router, config, stopSessionMedia]);

  useEffect(() => {
    if (config?.interviewRound === 'coding') {
      router.replace('/coding');
    }
  }, [config?.interviewRound, router]);

  useEffect(() => {
    let timer;
    const bootstrap = async () => {
      setLoading(true);
      setError('');
      try {
        await startCameraAndPosture();
        const resume = readSessionResume();
        const started = await startInterview({ config, resume });
        setSessionId(started.sessionId);
        setQuestions(started.questions || []);
        setQuestionText(started.firstQuestion || 'Tell me about yourself.');
        setSessionReady(true);
      } catch (err) {
        setError(err?.message || 'Unable to start interview. Please try again.');
      } finally {
        setLoading(false);
      }

      timer = setInterval(() => setTime((t) => t + 1), 1000);
    };

    bootstrap();

    return () => {
      const video = videoRef.current;
      if (timer) clearInterval(timer);
      stopSessionMedia();
      if (video?.srcObject) {
        const tracks = video.srcObject.getTracks?.() || [];
        tracks.forEach((t) => t.stop());
      }
    };
  }, [config, speakQuestion, startCameraAndPosture, stopSessionMedia]);

  useEffect(() => {
    if (sessionReady && questionText && !loading) {
      const t = setTimeout(() => speakQuestion(questionText), 250);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [sessionReady, questionText, loading, speakQuestion]);

  useEffect(() => {
    if (sessionReady && !speaking && answerStartedAt === null && (transcript || interim)) {
      setAnswerStartedAt(time);
    }
  }, [sessionReady, speaking, answerStartedAt, transcript, interim, time]);

  useEffect(() => {
    if ((transcript || interim) && answerStartedAt === null) {
      setAnswerStartedAt(time);
    }
  }, [transcript, interim, answerStartedAt, time]);

  useEffect(() => {
    if (sessionReady && !speaking && canUseSpeech && !micOn && !loading) {
      micOnRef.current = true;
      setMicOn(true);
      startRecognition();
    }
  }, [sessionReady, speaking, canUseSpeech, micOn, loading, startRecognition]);

  const toggleMic = useCallback(() => {
    setMicOn((prev) => {
      const next = !prev;
      if (next) {
        micOnRef.current = true;
        startRecognition();
      } else {
        micOnRef.current = false;
        stopRecognition();
      }
      return next;
    });
  }, [startRecognition, stopRecognition]);

  const subtitle = useMemo(() => {
    if (loading) return 'Preparing AI interviewer...';
    if (speaking) return 'AI is asking the question';
    return 'Your turn: answer with STAR and concrete outcomes.';
  }, [loading, speaking]);

  const displayedScores = useMemo(() => {
    const text = `${transcript} ${interim}`.trim();
    if (text) {
      const elapsed = answerStartedAt === null ? null : Math.max(time - answerStartedAt, 1);
      return computeTranscriptScores(text, elapsed);
    }
    return latestScores;
  }, [transcript, interim, time, answerStartedAt, latestScores]);

  return (
    <div style={{ flex: 1, position: 'relative', overflow: 'hidden', height: '100vh' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 60% 40%, #0f1f3d 0%, #030712 70%)' }} />

      <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}>
        <AIAvatar size={460} speaking={speaking} />
      </div>

      <div style={{ position: 'absolute', top: 24, left: 24, right: 24, display: 'flex', justifyContent: 'space-between', zIndex: 20 }}>
        <GlassCard style={{ padding: '8px 16px' }}>
          <span style={{ fontSize: 12, color: C.textSecondary, fontFamily: 'JetBrains Mono' }}>
            {config?.role || 'Interview'} · {config?.interviewRound || 'behavioral'}
          </span>
        </GlassCard>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <GlassCard style={{ padding: '8px 18px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.error, animation: 'pulse-ring 1s ease infinite' }} />
            <span style={{ fontSize: 13, fontFamily: 'JetBrains Mono', color: C.error }}>REC {fmt(time)}</span>
          </GlassCard>
          <Tag color={C.warning}>Question {Math.min(currentQ + 1, Math.max(questions.length, 1))} of {Math.max(questions.length, 1)}</Tag>
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: 188, left: '50%', transform: 'translateX(-50%)', maxWidth: 860, width: '88%', zIndex: 20 }}>
        <GlassCard style={{ padding: '20px 30px', textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8, fontFamily: 'JetBrains Mono' }}>
            {subtitle}
          </div>
          <p style={{ fontSize: 18, fontWeight: 500, lineHeight: 1.6, color: C.textPrimary }}>
            &quot;{questionText}&quot;
          </p>
          {!!feedback && (
            <div style={{ marginTop: 12, fontSize: 13, color: C.success }}>
              AI tip: {feedback}
            </div>
          )}
          {(transcript || interim) && (
            <div style={{ marginTop: 14, textAlign: 'left', fontSize: 13, color: C.textSecondary, maxHeight: 84, overflow: 'auto', borderTop: `1px solid ${C.borderMid}`, paddingTop: 12 }}>
              {(transcript || '').trim()} <span style={{ opacity: 0.8 }}>{interim}</span>
            </div>
          )}
          {!!error && (
            <div style={{ marginTop: 10, fontSize: 13, color: C.error }}>{error}</div>
          )}
        </GlassCard>
      </div>

      <div style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 12, alignItems: 'center', zIndex: 20 }}>
        <GlassCard style={{ padding: '12px 18px', display: 'flex', gap: 14, alignItems: 'center' }}>
          <MicWave active={micOn} />
          <button
            onClick={toggleMic}
            disabled={!canUseSpeech}
            style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              border: 'none',
              cursor: canUseSpeech ? 'pointer' : 'not-allowed',
              background: micOn ? `linear-gradient(135deg, ${C.primary}, ${C.secondary})` : 'rgba(255,255,255,0.1)',
              color: '#fff',
              fontSize: 18,
              opacity: canUseSpeech ? 1 : 0.5,
            }}
          >
            🎙
          </button>
          <NeonButton size="sm" onClick={submitCurrentAnswer} disabled={loading || !sessionId}>
            {loading ? 'Analyzing...' : 'Submit Answer'}
          </NeonButton>
          <NeonButton
            size="sm"
            variant="outline"
            onClick={async () => {
              try {
                if (sessionId) await endInterview({ sessionId });
              } catch {}
              stopSessionMedia();
              router.push('/dashboard');
            }}
          >
            End Session
          </NeonButton>
        </GlassCard>
      </div>

      <div style={{ position: 'absolute', bottom: 24, right: 24, width: 220, height: 160, borderRadius: 12, overflow: 'hidden', border: `1px solid ${C.borderMid}`, background: '#000', zIndex: 20 }}>
        <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} />
        <div style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(0,0,0,0.5)', padding: '2px 6px', borderRadius: 4, fontSize: 10, color: '#fff' }}>You</div>
      </div>

      <div style={{ position: 'absolute', left: 28, top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: 10, zIndex: 20 }}>
        {[
          { l: 'Confidence', v: displayedScores.confidence },
          { l: 'Clarity', v: displayedScores.clarity },
          { l: 'Pace', v: displayedScores.pace },
          { l: 'Posture', v: posture.score },
        ].map(({ l, v }) => (
          <GlassCard key={l} style={{ padding: '12px 16px', minWidth: 138 }}>
            <div style={{ fontSize: 10, color: C.textMuted, textTransform: 'uppercase', marginBottom: 6 }}>{l}</div>
            <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, marginBottom: 4 }}>
              <div style={{ height: '100%', width: `${Math.max(0, Math.min(100, v || 0))}%`, background: `linear-gradient(90deg, ${C.primary}, ${C.secondary})`, borderRadius: 2 }} />
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.primary, fontFamily: 'JetBrains Mono' }}>{Math.round(v || 0)}%</div>
          </GlassCard>
        ))}
        <GlassCard style={{ padding: '10px 14px', maxWidth: 180 }}>
          <div style={{ fontSize: 11, color: C.textSecondary }}>{posture.label}</div>
        </GlassCard>
      </div>
    </div>
  );
}
