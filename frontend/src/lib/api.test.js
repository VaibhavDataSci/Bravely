import { describe, it, expect, beforeEach, vi } from 'vitest';
import { api, ApiError, setToken, setUnauthorizedHandler } from './api';

const reply = (status, body) => Promise.resolve(new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } }));

describe('api()', () => {
  beforeEach(() => {
    setToken(null);
    setUnauthorizedHandler(null);
    vi.restoreAllMocks();
  });

  it('sends the bearer token and JSON body', async () => {
    const spy = vi.spyOn(globalThis, 'fetch').mockImplementation(() => reply(200, { ok: true }));
    setToken('abc');
    await api('/api/x', { method: 'POST', body: { a: 1 } });
    const [, init] = spy.mock.calls[0];
    expect(init.headers.authorization).toBe('Bearer abc');
    expect(init.headers['content-type']).toBe('application/json');
    expect(init.body).toBe('{"a":1}');
  });

  it('turns an error response into an ApiError with code and field errors', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(() => reply(400, { error: 'Bad', code: 'validation_error', fields: { email: 'Invalid' } }));
    await expect(api('/api/x')).rejects.toMatchObject({ name: 'ApiError', status: 400, code: 'validation_error', fields: { email: 'Invalid' } });
  });

  it('calls the unauthorized handler on 401 only when a token was sent', async () => {
    const handler = vi.fn();
    setUnauthorizedHandler(handler);
    vi.spyOn(globalThis, 'fetch').mockImplementation(() => reply(401, { error: 'Expired', code: 'token_expired' }));

    await expect(api('/api/x')).rejects.toBeInstanceOf(ApiError);
    expect(handler).not.toHaveBeenCalled(); // failed login must not look like an expired session

    setToken('abc');
    await expect(api('/api/x')).rejects.toBeInstanceOf(ApiError);
    expect(handler).toHaveBeenCalledWith('token_expired');
  });

  it('reports a network failure with a friendly message', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('Failed to fetch'));
    await expect(api('/api/x')).rejects.toMatchObject({ code: 'network', message: expect.stringContaining("Can't reach the server") });
  });

  it('survives a non-JSON error body', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('<html>502</html>', { status: 502 }));
    await expect(api('/api/x')).rejects.toMatchObject({ status: 502, message: expect.stringContaining('Something went wrong') });
  });
});
