import { apiFetch } from './api';

export function startInterview(payload) {
  return apiFetch('/api/interview/start', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function submitInterviewAnswer(payload) {
  return apiFetch('/api/interview/answer', {
    method: 'POST',
    timeoutMs: 90000,
    body: JSON.stringify(payload),
  });
}

export function endInterview(payload) {
  return apiFetch('/api/interview/end', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
