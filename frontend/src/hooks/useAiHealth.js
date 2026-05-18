import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchAiHealth } from '@/services/aiService';

const POLL_MS = 15000;

export function useAiHealth() {
  const [status, setStatus] = useState('unknown');
  const [error, setError] = useState(null);
  const timerRef = useRef(null);

  const load = useCallback(async () => {
    try {
      const res = await fetchAiHealth();
      setStatus(res?.status || 'ok');
      setError(null);
    } catch (err) {
      setStatus('down');
      setError(err);
    }
  }, []);

  useEffect(() => {
    const kickoff = setTimeout(() => load(), 0);
    timerRef.current = setInterval(() => load(), POLL_MS);
    return () => {
      clearTimeout(kickoff);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [load]);

  return { status, error, refresh: load };
}
