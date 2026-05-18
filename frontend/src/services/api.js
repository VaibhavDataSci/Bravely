/**
 * Centralized API client for Bravely frontend.
 *
 * - Uses `fetch` (no extra dependency needed)
 * - Reads NEXT_PUBLIC_API_URL from environment
 * - Attaches JWT from localStorage automatically
 * - Throws structured errors with { status, code, message }
 * - Exposes `checkHealth()` to test if the backend is reachable
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const TIMEOUT_MS = 25000; // allow Gemini-backed analysis to complete

function getToken() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('aia_token');
    return raw || null;
  } catch {
    return null;
  }
}

/** Store a token after login/signup */
export function storeToken(token) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('aia_token', token);
  }
}

/** Remove token on logout */
export function clearToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('aia_token');
  }
}

/**
 * Core fetch wrapper with timeout + structured error.
 * @param {string} path - e.g. '/api/dashboard/summary'
 * @param {RequestInit} [options]
 * @returns {Promise<any>} - parsed JSON data (unwraps { success, data })
 */
export async function apiFetch(path, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!res.ok) {
      let errorBody = {};
      try { errorBody = await res.json(); } catch {}
      const err = new Error(errorBody.error || errorBody.message || `HTTP ${res.status}`);
      err.status = res.status;
      err.code = errorBody.code || 'HTTP_ERROR';
      throw err;
    }

    const json = await res.json();
    // Unwrap { success, data } envelope if present
    return json.data !== undefined ? json.data : json;
  } catch (err) {
    clearTimeout(timer);
    if (err.name === 'AbortError') {
      const timeoutErr = new Error('Request timed out. Backend may be unavailable.');
      timeoutErr.code = 'TIMEOUT';
      timeoutErr.status = 504;
      throw timeoutErr;
    }
    throw err;
  }
}

/**
 * Ping /health to check if the backend is reachable.
 * Returns true if reachable, false otherwise.
 */
export async function checkHealth() {
  try {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 3000); // 3s max for health check
    const res = await fetch(`${BASE_URL}/health`, { signal: controller.signal });
    return res.ok;
  } catch {
    return false;
  }
}
