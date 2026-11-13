import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getHostProfile } from '../../src/api/profiles.js';

test('loads a profile with every venue and booking page without sending mutations', async () => {
  const controller = new AbortController();
  const calls = [];
  const request = async (path, options) => {
    calls.push(path);
    assert.equal(options.signal, controller.signal);
    assert.equal(options.method, undefined);
    assert.equal(options.query?._bookings, undefined);
    if (path.endsWith('/bookings')) {
      assert.equal(options.query._venue, true);
      return { data: [{ id: `booking-${options.query.page}` }], meta: { nextPage: options.query.page === 1 ? 2 : null } };
    }
    if (!path.endsWith('/venues')) return { data: { name: 'Host name' } };
    assert.equal(options.query.limit, 100);
    return { data: [{ id: 'same' }, { id: String(options.query.page) }], meta: { nextPage: options.query.page === 1 ? 2 : null } };
  };
  const result = await getHostProfile(request, 'Host name', { signal: controller.signal });
  assert.equal(result.profile.name, 'Host name');
  assert.equal(result.venues.length, 3);
  assert.equal(result.bookings.length, 2);
  assert.deepEqual(calls, ['holidaze/profiles/Host%20name', 'holidaze/profiles/Host%20name/venues', 'holidaze/profiles/Host%20name/venues', 'holidaze/profiles/Host%20name/bookings', 'holidaze/profiles/Host%20name/bookings']);
});

test('does not return partial host data after a venue failure and forwards cancellation', async () => {
  await assert.rejects(getHostProfile(async path => {
    if (path.endsWith('/venues')) throw new Error('Venues unavailable');
    return { data: { name: 'host' } };
  }, 'host'), /Venues unavailable/);
  await assert.rejects(getHostProfile(async path => {
    if (path.endsWith('/bookings')) throw new Error('Bookings unavailable');
    return { data: path.endsWith('/venues') ? [] : { name: 'host' } };
  }, 'host'), /Bookings unavailable/);
  await assert.rejects(getHostProfile(async () => ({ data: {} }), 'host', { signal: AbortSignal.abort() }), { name: 'AbortError' });
});
