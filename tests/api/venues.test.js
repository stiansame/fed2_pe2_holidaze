import assert from 'node:assert/strict';
import { test } from 'node:test';
import { appendVenuePage, getVenues } from '../../src/api/venues.js';

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
  assert.equal(calls[1].searchParams.get('limit'), '12');
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
