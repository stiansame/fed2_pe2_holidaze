import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createBooking } from '../../src/api/bookings.js';
import { ApiError } from '../../src/api/client.js';
import { stayFromSearch, staySummary } from '../../src/utils/availability.js';

const stay = { from: '2090-03-25', to: '2090-03-28', guests: 2 };
const venue = { id: 'venue-1', price: 1490.25, maxGuests: 4, bookings: [] };

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
