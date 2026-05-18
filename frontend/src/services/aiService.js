import { apiFetch } from './api';

export function fetchAiHealth() {
  return apiFetch('/api/ai/health');
}
