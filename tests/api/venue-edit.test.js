import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getOwnVenue, updateVenue } from '../../src/api/venues.js';

function form() {
  const data = new FormData();
  for (const [key, value] of Object.entries({ name: ' Updated cabin ', description: ' Updated description ', price: '0', maxGuests: '2' })) data.set(key, value);
  return data;
}

test('loads only owned venues and forwards cancellation', async () => {
  const controller = new AbortController();
  const request = async (path, options) => {
    assert.equal(path, 'holidaze/venues/venue%2F1');
    assert.deepEqual(options, { query: { _owner: true }, signal: controller.signal });
    return { data: { id: 'venue/1', owner: { name: 'Host' } } };
  };
  assert.equal((await getOwnVenue(request, 'venue/1', 'Host', { signal: controller.signal })).id, 'venue/1');
  for (const owner of [undefined, { name: 'Other' }]) {
    await assert.rejects(getOwnVenue(async () => ({ data: { owner } }), 'venue', 'Host'), /only manage your own/);
  }
});

test('validates and rechecks ownership before PUT, clearing removed optional fields', async () => {
  const calls = [];
  const request = async (path, options) => {
    calls.push({ path, ...options });
    return { data: { id: 'venue/1', owner: { name: 'Host' } } };
  };
  await updateVenue(request, 'venue/1', 'Host', form());
  assert.equal(calls.length, 2);
  assert.equal(calls[0].method, undefined);
  assert.equal(calls[1].method, 'PUT');
  assert.equal(calls[1].path, 'holidaze/venues/venue%2F1');
  assert.deepEqual(calls[1].body, {
    name: 'Updated cabin', description: 'Updated description', price: 0, maxGuests: 2, rating: 0, media: [],
    meta: { wifi: false, parking: false, breakfast: false, pets: false },
    location: { address: '', city: '', zip: '', country: '', continent: '', lat: 0, lng: 0 },
  });
  const invalid = form();
  invalid.set('name', ' ');
  await assert.rejects(updateVenue(() => { throw new Error('Must not send'); }, 'venue', 'Host', invalid), /venue name/);
  let attempts = 0;
  await assert.rejects(updateVenue(async () => {
    attempts++;
    return { data: { owner: { name: 'Other' } } };
  }, 'venue', 'Host', form()), /only manage your own/);
  assert.equal(attempts, 1);
});

test('updates images, amenities and coordinates without sending owner or bookings', async () => {
  const data = form();
  data.set('rating', '4.5');
  for (const [key, value] of Object.entries({ mediaUrl: 'https://example.com/view.jpg', mediaAlt: 'View', wifi: 'true', city: 'Bergen', lat: '0', lng: '5' })) data.set(key, value);
  await updateVenue(async (path, options) => {
    if (options.method === 'PUT') {
      assert.equal(options.body.rating, 4.5);
      assert.deepEqual(options.body.media, [{ url: 'https://example.com/view.jpg', alt: 'View' }]);
      assert.equal(options.body.meta.wifi, true);
      assert.equal(options.body.location.city, 'Bergen');
      assert.equal(options.body.location.lat, 0);
      assert.equal(options.body.location.lng, 5);
      assert.equal(Object.hasOwn(options.body, 'owner'), false);
      assert.equal(Object.hasOwn(options.body, 'bookings'), false);
    }
    return { data: { id: 'venue', owner: { name: 'Host' } } };
  }, 'venue', 'Host', data);
  await assert.rejects(updateVenue(async (path, options) => {
    if (options.method === 'PUT') throw new Error('Offline');
    return { data: { owner: { name: 'Host' } } };
  }, 'venue', 'Host', data), /Offline/);
});
