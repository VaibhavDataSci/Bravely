import { apiFetch, storeToken, clearToken } from './api';

export async function loginWithPassword({ email, password }) {
  const result = await apiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  if (result?.token) {
    storeToken(result.token);
  }

  return result;
}

export async function signupWithPassword({ email, name, password }) {
  const result = await apiFetch('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, name, password }),
  });

  if (result?.token) {
    storeToken(result.token);
  }

  return result;
}

export function logoutAuth() {
  clearToken();
}
