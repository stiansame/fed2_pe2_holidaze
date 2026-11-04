import assert from 'node:assert/strict';
import { test } from 'node:test';
import { managerSummary } from '../../src/utils/manager.js';
import { getProfileVenues } from '../../src/api/profiles.js';

test('manager summary counts own bookings, excludes current/past/invalid dates from upcoming and ignores unrated venues', () => {
  const venues = [
    { id: 'a', rating: 4, bookings: [
      { id: 'future', dateFrom: '2090-06-20', dateTo: '2090-06-22' },
      { id: 'current', dateFrom: '2090-06-09', dateTo: '2090-06-11' },
      { id: 'past', dateFrom: '2090-06-01', dateTo: '2090-06-10' },
      { id: 'invalid', dateFrom: 'broken', dateTo: '2090-06-20' },
    ] },
    { id: 'b', rating: 5, bookings: [{ id: 'nearest', dateFrom: '2090-06-11', dateTo: '2090-06-12' }] },
    { id: 'c', rating: 0, bookings: [] },
  ];
  const snapshot = structuredClone(venues);
  const summary = managerSummary(venues, '2090-06-10');
  assert.equal(summary.totalBookings, 5);
  assert.equal(summary.averageRating, '4.5');
  assert.deepEqual(summary.upcoming.map(booking => [booking.id, booking.venue.id]), [['nearest', 'b'], ['future', 'a']]);
  assert.deepEqual(venues, snapshot);
  assert.deepEqual(managerSummary([]), { totalBookings: 0, upcoming: [], averageRating: null });
  assert.throws(() => managerSummary([{ id: 'missing' }]), /unavailable/);
});

test('manager venues load all pages with bookings using only the current profile and reject partial results', async () => {
  const calls = [];
  const request = async (path, options) => {
    calls.push([path, options]);
    return { data: [{ id: String(options.query.page), bookings: [] }], meta: { nextPage: options.query.page === 1 ? 2 : null } };
  };
  const controller = new AbortController();
  assert.equal((await getProfileVenues(request, 'own profile', { bookings: true, signal: controller.signal })).length, 2);
  assert.ok(calls.every(([path, options]) => path === 'holidaze/profiles/own%20profile/venues' && options.query._bookings && options.query.limit === 100 && options.signal === controller.signal));
  await assert.rejects(getProfileVenues(async (path, options) => {
    if (options.query.page === 2) throw new Error('Offline');
    return { data: [{ id: 'first' }], meta: { nextPage: 2 } };
  }, 'own'), /Offline/);
  controller.abort();
  await assert.rejects(getProfileVenues(request, 'own', { signal: controller.signal }), { name: 'AbortError' });
});
