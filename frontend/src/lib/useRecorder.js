"use client";
import { useCallback, useEffect, useRef, useState } from 'react';

const MAX_SECONDS = 120;
const PREFERRED_TYPES = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus'];

const pickMimeType = () =>
  (typeof MediaRecorder !== 'undefined' && PREFERRED_TYPES.find((t) => MediaRecorder.isTypeSupported(t))) || '';

/**
 * Records microphone audio one answer at a time.
 * status: idle | requesting | recording | error
 * stop() resolves with { blob, durationSec } (or null if nothing was recorded).
 */
export function useRecorder({ onAutoStop } = {}) {
  // Called with the recording when it ends by itself at the time limit, not through stop().
  const onAutoStopRef = useRef(onAutoStop);
  useEffect(() => { onAutoStopRef.current = onAutoStop; });
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);
  const [seconds, setSeconds] = useState(0);
  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const startedAtRef = useRef(0);
  const timerRef = useRef(null);
  const resolveRef = useRef(null);

  const release = useCallback(() => {
    clearInterval(timerRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const stop = useCallback(() => new Promise((resolve) => {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state === 'inactive') return resolve(null);
    resolveRef.current = resolve;
    recorder.stop();
  }), []);

  const start = useCallback(async () => {
    setError(null);
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setStatus('error');
      setError('This browser cannot record audio. Try a recent Chrome, Edge, Firefox or Safari.');
      return false;
    }
    setStatus('requesting');
    try {
      // Echo cancellation and noise suppression help transcription accuracy.
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, channelCount: 1 },
      });
      streamRef.current = stream;
      const mimeType = pickMimeType();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size) chunksRef.current.push(e.data); };
      recorder.onstop = () => {
        const durationSec = (Date.now() - startedAtRef.current) / 1000;
        const blob = chunksRef.current.length
          ? new Blob(chunksRef.current, { type: recorder.mimeType || mimeType || 'audio/webm' })
          : null;
        release();
        setStatus('idle');
        const result = blob ? { blob, durationSec } : null;
        if (resolveRef.current) resolveRef.current(result);
        else onAutoStopRef.current?.(result);
        resolveRef.current = null;
      };
      recorderRef.current = recorder;
      startedAtRef.current = Date.now();
      recorder.start(1000);
      setSeconds(0);
      timerRef.current = setInterval(() => {
        const s = Math.floor((Date.now() - startedAtRef.current) / 1000);
        setSeconds(s);
        if (s >= MAX_SECONDS && recorder.state !== 'inactive') recorder.stop();
      }, 250);
      setStatus('recording');
      return true;
    } catch (err) {
      release();
      setStatus('error');
      setError(
        err?.name === 'NotAllowedError'
          ? 'Microphone access is blocked. Allow it in your browser settings, then try again.'
          : err?.name === 'NotFoundError'
            ? 'No microphone found. Connect one and try again.'
            : 'Could not start the microphone. Please try again.'
      );
      return false;
    }
  }, [release]);

  useEffect(() => () => {
    release();
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
  }, [release]);

  return { status, error, seconds, start, stop, maxSeconds: MAX_SECONDS };
}

const extensionFor = (type = '') => (type.includes('mp4') ? 'm4a' : type.includes('ogg') ? 'ogg' : 'webm');

/** Wraps a recorded blob as multipart form data for POST /api/ai/transcribe. */
export function audioForm(blob) {
  const form = new FormData();
  form.append('file', blob, `answer.${extensionFor(blob.type)}`);
  return form;
}
