import assert from 'node:assert/strict';
import { test } from 'node:test';
import { appendVenuePage, filterVenues, getVenues, venueSorts } from '../../src/api/venues.js';

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
