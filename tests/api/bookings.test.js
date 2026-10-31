import assert from 'node:assert/strict';
import { test } from 'node:test';
import { cancelBooking, createBooking, getOwnBooking, getOwnBookings, updateBooking } from '../../src/api/bookings.js';
import { ApiError } from '../../src/api/client.js';
import { stayFromSearch, staySummary } from '../../src/utils/availability.js';

const stay = { from: '2090-03-25', to: '2090-03-28', guests: 2 };
const venue = { id: 'venue-1', price: 1490.25, maxGuests: 4, bookings: [] };

test('loads every page of own bookings with venue data and rejects partial results', async () => {
  const pages = [];
  const request = async (path, { query }) => {
    assert.equal(path, 'holidaze/profiles/A%20B/bookings');
    assert.equal(query._venue, true);
    pages.push(query.page);
    return { data: [{ id: 'a' }, { id: String(query.page) }], meta: { nextPage: query.page === 1 ? 2 : null } };
  };
  assert.equal((await getOwnBookings(request, 'A B')).length, 3);
  assert.deepEqual(pages, [1, 2]);
  await assert.rejects(getOwnBookings(async (path, options) => {
    if (options.query.page === 2) throw new Error('Page failed');
    return request(path, options);
  }, 'A B'), /Page failed/);
  await assert.rejects(getOwnBookings(request, 'A B', { signal: AbortSignal.abort() }), { name: 'AbortError' });
});

test('editing excludes only this booking and sends PUT to its original id', async t => {
  let latestVenue = { ...venue, bookings: [{ id: 'own', dateFrom: stay.from, dateTo: stay.to }] };
  t.mock.method(globalThis, 'fetch', async () => Response.json({ data: latestVenue }));
  const calls = [];
  const request = async (path, options) => {
    calls.push(options.method || 'GET');
    assert.equal(path, 'holidaze/bookings/own');
    if (options.method === 'PUT') {
      assert.deepEqual(options.body, { dateFrom: `${stay.from}T00:00:00.000Z`, dateTo: `${stay.to}T00:00:00.000Z`, guests: 2 });
      return { data: { id: 'own' } };
    }
    return { data: { id: 'own', dateFrom: stay.from, dateTo: stay.to, customer: { name: 'Guest' }, venue } };
  };
  assert.equal((await updateBooking(request, 'own', 'guest', stay, venue.price)).booking.id, 'own');
  assert.deepEqual(calls, ['GET', 'PUT']);
  calls.length = 0;
  latestVenue.bookings.push({ id: 'other', dateFrom: stay.from, dateTo: stay.to });
  await assert.rejects(updateBooking(request, 'own', 'guest', stay, venue.price));
  assert.deepEqual(calls, ['GET']);
  latestVenue = { ...venue, price: 1500 };
  assert.equal((await updateBooking(request, 'own', 'guest', stay, venue.price)).booking, null);
  assert.deepEqual(calls, ['GET', 'GET']);
});

test('checks ownership and unstarted dates before cancellation or changes', async () => {
  const calls = [];
  let booking = { dateFrom: stay.from, dateTo: stay.to, customer: { name: 'Guest' } };
  const request = async (path, options) => { calls.push(options.method || 'GET'); return { data: booking }; };
  await cancelBooking(request, 'own', 'guest');
  assert.deepEqual(calls, ['GET', 'DELETE']);
  calls.length = 0;
  await assert.rejects(getOwnBooking(request, 'own', 'someone-else'), { status: 403 });
  booking = { ...booking, dateFrom: '2020-01-01', dateTo: '2020-01-03' };
  await assert.rejects(cancelBooking(request, 'own', 'guest'), /not started/);
  await assert.rejects(updateBooking(request, 'own', 'guest', stay, venue.price), /not started/);
  assert.deepEqual(calls, ['GET', 'GET', 'GET']);
});

test('reads the URL selection and calculates nights and total using whole calendar days', () => {
  assert.deepEqual(stayFromSearch('?from=2090-03-25&to=2090-03-28&guests=2'), stay);
  assert.deepEqual(staySummary(venue, stay), { error: '', nights: 3, total: 4470.75 });
  assert.equal(stayFromSearch('?from=2090-02-30').from, '');
  assert.match(staySummary(venue, { ...stay, guests: 0 }).error, /capacity/);
  assert.match(staySummary({ ...venue, price: null }, stay).error, /price/);
  assert.equal(staySummary({ ...venue, price: 0 }, stay).total, 0);
});

test('rechecks availability before sending only the required booking payload', async t => {
  const calls = [];
  t.mock.method(globalThis, 'fetch', async url => {
    calls.push('GET');
    assert.equal(url.searchParams.get('_bookings'), 'true');
    return Response.json({ data: venue });
  });
  const request = async (path, options) => {
    calls.push('POST');
    assert.equal(path, 'holidaze/bookings');
    assert.deepEqual(options, { method: 'POST', body: { venueId: venue.id, dateFrom: '2090-03-25T00:00:00.000Z', dateTo: '2090-03-28T00:00:00.000Z', guests: 2 } });
    return { data: { id: 'booking-1' } };
  };
  assert.equal((await createBooking(request, venue.id, stay, venue.price)).booking.id, 'booking-1');
  assert.deepEqual(calls, ['GET', 'POST']);
});

test('does not post for new overlap, missing bookings, changed capacity, invalid dates or changed price', async t => {
  let current = venue;
  t.mock.method(globalThis, 'fetch', async () => Response.json({ data: current }));
  const request = () => assert.fail('Invalid selections must never be posted');
  for (const change of [
    { bookings: [{ dateFrom: stay.from, dateTo: stay.to }] }, { bookings: undefined }, { maxGuests: 1 },
  ]) {
    current = { ...venue, ...change };
    await assert.rejects(createBooking(request, venue.id, stay, venue.price));
  }
  current = venue;
  await assert.rejects(createBooking(request, venue.id, { ...stay, to: stay.from }, venue.price));
  current = { ...venue, price: 1500 };
  assert.deepEqual(await createBooking(request, venue.id, stay, venue.price), { venue: current, booking: null });
});

test('marks uncertain POST outcomes and never retries a booking automatically', async t => {
  t.mock.method(globalThis, 'fetch', async () => Response.json({ data: venue }));
  for (const status of [0, 200, 201, 503, 400, 401]) {
    let posts = 0;
    await assert.rejects(createBooking(async () => {
      posts++;
      throw new ApiError('Failure', status);
    }, venue.id, stay, venue.price), error => {
      assert.equal(error.bookingUncertain, [0, 200, 201, 503].includes(status));
      return true;
    });
    assert.equal(posts, 1);
  }
  await assert.rejects(createBooking(async () => ({ data: {} }), venue.id, stay, venue.price), { bookingUncertain: true });
});
