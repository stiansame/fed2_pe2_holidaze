import assert from 'node:assert/strict';
import { test } from 'node:test';
import { appendVenuePage, filterVenues, getAllVenues, getHighlyRatedVenues, getVenue, getVenues, sortVenues, venueSorts } from '../../src/api/venues.js';

test('requests a bounded highest-rating pool and forwards cancellation', async t => {
  const controller = new AbortController();
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url.searchParams.get('sort'), 'rating');
    assert.equal(url.searchParams.get('sortOrder'), 'desc');
    assert.equal(url.searchParams.get('limit'), '100');
    assert.equal(options.signal, controller.signal);
    return Response.json({ data: [{ id: 'rated', rating: 5 }], meta: {} });
  });
  assert.equal((await getHighlyRatedVenues({ signal: controller.signal })).data[0].rating, 5);
});

test('uses listing or search with encoded query and requested page', async t => {
  const calls = [];
  t.mock.method(globalThis, 'fetch', async url => {
    calls.push(url);
    return Response.json({ data: [], meta: { nextPage: null } });
  });
  await getVenues();
  await getVenues({ q: 'cabin & sea', page: 2 });
  assert.equal(calls[0].pathname, '/holidaze/venues');
  assert.equal(calls[0].searchParams.has('q'), false);
  assert.equal(calls[1].pathname, '/holidaze/venues/search');
  assert.equal(calls[1].searchParams.get('q'), 'cabin & sea');
  assert.equal(calls[1].searchParams.get('page'), '2');
  assert.equal(calls[1].searchParams.get('limit'), '15');
});

test('fetches venue details with host data and forwards the abort signal and API errors', async t => {
  const controller = new AbortController();
  const fetchMock = t.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url.pathname, '/holidaze/venues/venue-1');
    assert.equal(url.searchParams.get('_owner'), 'true');
    assert.equal(url.searchParams.get('_bookings'), 'true');
    assert.equal(options.signal, controller.signal);
    return Response.json({ data: { id: 'venue-1', owner: { name: 'host' } } });
  });
  assert.equal((await getVenue('venue-1', { signal: controller.signal })).data.owner.name, 'host');
  fetchMock.mock.mockImplementation(async () => Response.json({ errors: [{ message: 'Not found' }] }, { status: 404 }));
  await assert.rejects(getVenue('missing'), { name: 'ApiError', status: 404 });
});

test('loads every page before filtering, including matches beyond the first page', async t => {
  const pages = [];
  t.mock.method(globalThis, 'fetch', async url => {
    const page = Number(url.searchParams.get('page'));
    pages.push(page);
    assert.equal(url.searchParams.get('limit'), '100');
    assert.equal(url.searchParams.get('q'), 'cabin');
    return Response.json({
      data: [{ id: String(page), maxGuests: page === 1 ? 2 : 6, meta: { wifi: true } }],
      meta: { nextPage: page === 1 ? 2 : null },
    });
  });
  const venues = await getAllVenues({ q: 'cabin' });
  assert.deepEqual(pages, [1, 2]);
  assert.deepEqual(filterVenues(venues, { guests: 4 }).map(v => v.id), ['2']);
});

test('does not return partial results when a page fails and respects cancellation', async t => {
  t.mock.method(globalThis, 'fetch', async url => {
    if (url.searchParams.get('page') === '2') throw new TypeError('Offline');
    return Response.json({ data: [{ id: 'first' }], meta: { nextPage: 2 } });
  });
  await assert.rejects(getAllVenues(), { name: 'ApiError' });
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(getAllVenues({ signal: controller.signal }), { name: 'AbortError' });
});

test('sorts the complete filtered list without changing input', () => {
  const venues = [
    { name: 'Zulu', price: 5, created: '2026-01-01' },
    { name: 'Alpha', price: 20, created: '2026-03-01' },
    { name: 'Beta', price: 10, created: '2026-02-01' },
  ];
  const snapshot = structuredClone(venues);
  assert.deepEqual(sortVenues(venues, 'name-asc').map(v => v.name), ['Alpha', 'Beta', 'Zulu']);
  assert.deepEqual(sortVenues(venues, 'name-desc').map(v => v.name), ['Zulu', 'Beta', 'Alpha']);
  assert.deepEqual(sortVenues(venues, 'price-asc').map(v => v.price), [5, 10, 20]);
  assert.deepEqual(sortVenues(venues, 'price-desc').map(v => v.price), [20, 10, 5]);
  assert.deepEqual(sortVenues(venues).map(v => v.name), ['Alpha', 'Beta', 'Zulu']);
  assert.deepEqual(venues, snapshot);
});

test('sends supported sorting to the API and defaults unknown options', async t => {
  const calls = [];
  t.mock.method(globalThis, 'fetch', async url => {
    calls.push(url);
    return Response.json({ data: [], meta: {} });
  });
  for (const order of Object.keys(venueSorts)) await getVenues({ q: 'cabin', order, page: 2 });
  await getVenues({ order: 'unknown' });
  Object.values(venueSorts).forEach((option, index) => {
    assert.equal(calls[index].searchParams.get('sort'), option.sort);
    assert.equal(calls[index].searchParams.get('sortOrder'), option.sortOrder);
    assert.equal(calls[index].searchParams.get('page'), '2');
    assert.equal(calls[index].searchParams.get('q'), 'cabin');
  });
  assert.equal(calls.at(-1).searchParams.get('sort'), 'created');
});

test('filters capacity and all selected amenities without changing the loaded list', () => {
  const venues = [
    { id: 'a', maxGuests: 2, meta: { wifi: true, pets: true } },
    { id: 'b', maxGuests: 6, meta: { wifi: true, pets: false } },
    { id: 'c', maxGuests: 4, meta: { wifi: true, pets: true } },
    { id: 'd', maxGuests: 8 },
  ];
  const snapshot = structuredClone(venues);
  assert.equal(filterVenues(venues).length, 4);
  assert.deepEqual(filterVenues(venues, { guests: 4 }).map(v => v.id), ['b', 'c', 'd']);
  assert.deepEqual(filterVenues(venues, { guests: 4, amenities: ['wifi', 'pets'] }).map(v => v.id), ['c']);
  assert.deepEqual(filterVenues(venues, { amenities: ['breakfast'] }), []);
  assert.deepEqual(venues, snapshot);
});

test('appends pages without duplicates and retains latest metadata', () => {
  const first = { data: [{ id: 'a' }, { id: 'b', name: 'Old' }], meta: { nextPage: 2 } };
  const next = { data: [{ id: 'b', name: 'Updated' }, { id: 'c' }], meta: { nextPage: null } };
  const snapshot = structuredClone(first);
  assert.deepEqual(appendVenuePage(first, next), {
    data: [{ id: 'a' }, { id: 'b', name: 'Updated' }, { id: 'c' }], meta: { nextPage: null },
  });
  assert.deepEqual(first, snapshot);
  assert.deepEqual(appendVenuePage(null, { data: [], meta: {} }), { data: [], meta: {} });
});


test('date filters exclude overlaps and unknown availability, allowing checkout boundaries', () => {
  const venues = [
    { id: 'free', bookings: [] },
    { id: 'booked', bookings: [{ dateFrom: '2090-06-10T00:00:00Z', dateTo: '2090-06-15T00:00:00Z' }] },
    { id: 'unknown' },
    { id: 'invalid', bookings: [{ dateFrom: 'invalid', dateTo: '2090-06-15' }] },
  ];
  assert.deepEqual(filterVenues(venues, { from: '2090-06-12', to: '2090-06-14' }).map(v => v.id), ['free']);
  assert.deepEqual(filterVenues(venues, { from: '2090-06-15', to: '2090-06-17' }).map(v => v.id), ['free', 'booked']);
  assert.deepEqual(filterVenues(venues, { from: '2090-06-08', to: '2090-06-10' }).map(v => v.id), ['free', 'booked']);
  for (const dates of [{ from: '2090-06-12' }, { from: '2090-06-12', to: '2090-06-12' }, { from: '2020-01-01', to: '2020-01-02' }]) {
    assert.deepEqual(filterVenues(venues, dates), []);
  }
  assert.equal(filterVenues(venues).length, 4);
});

test('requests booking data on every page only when needed for date search', async t => {
  const calls = [];
  t.mock.method(globalThis, 'fetch', async url => {
    calls.push(url);
    return Response.json({ data: [], meta: { nextPage: url.searchParams.get('page') === '1' ? 2 : null } });
  });
  await getAllVenues({ q: 'cabin', bookings: true });
  assert.equal(calls.length, 2);
  assert.ok(calls.every(url => url.searchParams.get('_bookings') === 'true'));
  await getVenues();
  assert.equal(calls.at(-1).searchParams.has('_bookings'), false);
});


test('searches names, descriptions, locations and host profile names with combined filters', () => {
  const venues = [
    { id: 'name', name: 'Coastal Cabin', maxGuests: 4 },
    { id: 'description', description: 'Coastal views', maxGuests: 2 },
    { id: 'address', location: { address: 'Coastal Road 12' }, maxGuests: 4 },
    { id: 'city', location: { city: 'Bergen', country: 'Norway', zip: '5003' }, maxGuests: 4 },
    { id: 'host', owner: { name: 'CoastalHost' }, maxGuests: 4, meta: { wifi: true }, bookings: [] },
    { id: 'missing' },
  ];
  assert.deepEqual(filterVenues(venues, { q: ' COASTAL ' }).map(v => v.id), ['name', 'description', 'address', 'host']);
  for (const q of ['BERGEN', 'norway', '5003']) assert.deepEqual(filterVenues(venues, { q }).map(v => v.id), ['city']);
  assert.deepEqual(filterVenues(venues, { q: 'coastal', guests: 4, amenities: ['wifi'], from: '2090-06-10', to: '2090-06-12' }).map(v => v.id), ['host']);
  assert.deepEqual(filterVenues(venues, { q: 'not found' }), []);
});

test('loads host data on all pages so local search can find profile names beyond page one', async t => {
  const calls = [];
  t.mock.method(globalThis, 'fetch', async url => {
    calls.push(url);
    const page = Number(url.searchParams.get('page'));
    return Response.json({ data: [{ id: String(page), owner: { name: page === 2 ? 'TargetHost' : 'Other' } }], meta: { nextPage: page === 1 ? 2 : null } });
  });
  const venues = await getAllVenues({ owner: true });
  assert.ok(calls.every(url => url.searchParams.get('_owner') === 'true' && !url.searchParams.has('q') && url.pathname === '/holidaze/venues'));
  assert.deepEqual(filterVenues(venues, { q: 'targethost' }).map(v => v.id), ['2']);
});
