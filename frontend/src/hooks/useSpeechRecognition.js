"use client";

import { useCallback, useEffect, useRef, useState } from 'react';

function getSpeechRecognition() {
  if (typeof window === 'undefined') return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

export function useSpeechRecognition({ continuous = true, interimResults = true } = {}) {
  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef('');
  const desiredListeningRef = useRef(false);
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');

  const initRecognition = useCallback(() => {
    const Recognition = getSpeechRecognition();
    setSupported(Boolean(Recognition));
    if (!Recognition) return null;

    const recognition = new Recognition();
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let interim = '';
      let finalText = finalTranscriptRef.current;

      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const text = event.results[i][0]?.transcript || '';
        if (event.results[i].isFinal) finalText = `${finalText} ${text}`.trim();
        else interim = `${interim} ${text}`.trim();
      }

      finalTranscriptRef.current = finalText;
      setTranscript(`${finalText} ${interim}`.trim());
    };

    recognition.onerror = (event) => {
      setError(event.error || 'speech-recognition-error');
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
      if (desiredListeningRef.current) {
        setTimeout(() => {
          try {
            recognition.start();
            setListening(true);
          } catch {
            setError('speech-recognition-restart-failed');
            desiredListeningRef.current = false;
          }
        }, 200);
      }
    };

    return recognition;
  }, [continuous, interimResults]);

  useEffect(() => {
    const recognition = initRecognition();
    recognitionRef.current = recognition;
    return () => {
      recognitionRef.current = null;
      try { recognition?.abort(); } catch {}
    };
  }, [initRecognition]);

  const resetTranscript = useCallback(() => {
    finalTranscriptRef.current = '';
    setTranscript('');
    setError('');
  }, []);

  const startListening = useCallback(() => {
    if (listening) return;
    if (!recognitionRef.current) {
      recognitionRef.current = initRecognition();
    }
    if (!recognitionRef.current) {
      setSupported(false);
      setError('speech-recognition-unsupported');
      return;
    }
    desiredListeningRef.current = true;
    setError('');
    try {
      recognitionRef.current.start();
      setListening(true);
    } catch {
      setError('speech-recognition-start-failed');
      setListening(false);
    }
  }, [initRecognition, listening]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    desiredListeningRef.current = false;
    try { recognitionRef.current.stop(); } catch {}
    setListening(false);
  }, []);

  return {
    supported,
    listening,
    transcript,
    error,
    resetTranscript,
    startListening,
    stopListening,
  };
}
