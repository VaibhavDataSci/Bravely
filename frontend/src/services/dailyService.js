import { apiFetch } from './api';

export function startDailySession(payload) {
  return apiFetch('/api/daily/start', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function generateDailyTopic() {
  return apiFetch('/api/daily/topic', {
    method: 'POST',
    body: JSON.stringify({}),
  });
}

export function analyzeDailyTranscript(payload) {
  return apiFetch('/api/daily/analyze', {
    method: 'POST',
    timeoutMs: 90000,
    body: JSON.stringify(payload),
  });
}

export function sendDailyChat(payload) {
  return apiFetch('/api/daily/ai-chat', {
    method: 'POST',
    timeoutMs: 60000,
    body: JSON.stringify(payload),
  });
}
