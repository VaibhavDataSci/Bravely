const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export class ApiError extends Error {
  constructor(message, { status = 0, code, fields } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.fields = fields || {};
  }
}

let token = null;
let onUnauthorized = null;

export const setToken = (value) => { token = value; };
export const getToken = () => token;

// Called when an authenticated request comes back 401 (expired or revoked token).
export const setUnauthorizedHandler = (handler) => { onUnauthorized = handler; };

export async function api(path, { method = 'GET', body } = {}) {
  let res;
  try {
    // FormData (file uploads) sets its own multipart content-type with a boundary.
    const isForm = typeof FormData !== 'undefined' && body instanceof FormData;
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: {
        ...(body && !isForm ? { 'content-type': 'application/json' } : {}),
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
      body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
    });
  } catch {
    throw new ApiError("Can't reach the server. Check your connection and try again.", { code: 'network' });
  }

  let data = null;
  try { data = await res.json(); } catch { /* empty or non-JSON body */ }

  if (!res.ok) {
    if (res.status === 401 && token && onUnauthorized) onUnauthorized(data?.code);
    throw new ApiError(data?.error || 'Something went wrong. Please try again.', {
      status: res.status,
      code: data?.code,
      fields: data?.fields,
    });
  }
  return data;
}
