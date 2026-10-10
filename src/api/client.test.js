import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ApiError, apiRequest } from './client.js';

test('keeps pagination metadata and encodes query parameters', async t => {
  const result = { data: [{ id: 'venue-1' }], meta: { nextPage: 2 } };
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url.origin, 'https://v2.api.noroff.dev');
    assert.equal(url.pathname, '/holidaze/venues');
    assert.equal(url.searchParams.get('q'), 'cabin & sea');
    assert.equal(url.searchParams.get('page'), '1');
    assert.equal(url.searchParams.get('_bookings'), 'false');
    assert.equal(url.searchParams.has('missing'), false);
    assert.equal(options.headers.Authorization, undefined);
    return Response.json(result);
  });
  assert.deepEqual(await apiRequest('/holidaze/venues', {
    query: { q: 'cabin & sea', page: 1, _bookings: false, missing: undefined },
  }), result);
});

test('sends authentication and JSON without changing input', async t => {
  const body = { name: 'Cabin' };
  t.mock.method(globalThis, 'fetch', async (_url, options) => {
    assert.equal(options.method, 'PUT');
    assert.equal(options.headers.Authorization, 'Bearer demo-token');
    assert.equal(options.headers['X-Noroff-API-Key'], 'demo-key');
    assert.equal(options.headers['Content-Type'], 'application/json');
    assert.deepEqual(JSON.parse(options.body), body);
    return Response.json({ data: body });
  });
  await apiRequest('holidaze/venues/venue-1', {
    method: 'PUT', body, token: 'demo-token', apiKey: 'demo-key',
  });
  assert.deepEqual(body, { name: 'Cabin' });
});

test('preserves HTTP status and field errors without changing input', async t => {
  const errors = [{ message: 'Invalid email', path: ['email'] }];
  const body = { email: 'invalid' };
  t.mock.method(globalThis, 'fetch', async () => Response.json({ errors }, { status: 400 }));
  await assert.rejects(apiRequest('auth/login', { method: 'POST', body }), error => {
    assert.ok(error instanceof ApiError);
    assert.equal(error.status, 400);
    assert.equal(error.message, 'Invalid email');
    assert.deepEqual(error.errors, errors);
    return true;
  });
  assert.deepEqual(body, { email: 'invalid' });
});

test('handles successful deletion without parsing an empty response', async t => {
  t.mock.method(globalThis, 'fetch', async () => new Response(null, { status: 204 }));
  assert.equal(await apiRequest('holidaze/bookings/demo', { method: 'DELETE' }), null);
});

test('handles non-JSON errors and network failures', async t => {
  const fetchMock = t.mock.method(globalThis, 'fetch', async () => new Response('Unavailable', { status: 503 }));
  await assert.rejects(apiRequest('holidaze/venues'), { name: 'ApiError', status: 503 });
  fetchMock.mock.mockImplementation(async () => { throw new TypeError('Failed to fetch'); });
  await assert.rejects(apiRequest('holidaze/venues'), { name: 'ApiError', status: 0 });
});

test('forwards cancellation without reporting it as an API error', async t => {
  const controller = new AbortController();
  controller.abort();
  t.mock.method(globalThis, 'fetch', async (_url, { signal }) => {
    assert.equal(signal, controller.signal);
    signal.throwIfAborted();
  });
  await assert.rejects(apiRequest('holidaze/venues', { signal: controller.signal }), { name: 'AbortError' });
});

test('rejects other origins before sending credentials', async t => {
  const fetchMock = t.mock.method(globalThis, 'fetch');
  await assert.rejects(apiRequest('https://example.com', { token: 'demo-token' }), TypeError);
  assert.equal(fetchMock.mock.callCount(), 0);
});
