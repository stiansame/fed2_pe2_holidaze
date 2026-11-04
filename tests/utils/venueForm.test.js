import assert from 'node:assert/strict';
import { test } from 'node:test';
import { venueCoordinates, venueFormData } from '../../src/utils/venueForm.js';
import { createVenue } from '../../src/api/venues.js';
import { ApiError } from '../../src/api/client.js';

function form(values = {}) {
  const data = new FormData();
  for (const [key, value] of Object.entries({ name: ' Cabin ', description: ' A quiet stay. ', price: '1490.50', maxGuests: '4', ...values })) {
    for (const item of Array.isArray(value) ? value : [value]) data.append(key, item);
  }
  return data;
}

test('map coordinates require a complete valid pair and preserve zero', () => {
  assert.deepEqual(venueCoordinates('0', '0'), [0, 0]);
  assert.deepEqual(venueCoordinates('60.39', '5.32'), [60.39, 5.32]);
  for (const point of [['', '5'], ['60', ''], [null, undefined], ['NaN', '5'], ['91', '5'], ['60', '181']]) {
    assert.equal(venueCoordinates(...point), null);
  }
});

test('venue form trims required fields, supports optional media/amenities/location and sends numeric values', () => {
  assert.deepEqual(venueFormData(form({ price: '0' })), {
    name: 'Cabin', description: 'A quiet stay.', price: 0, maxGuests: 4, media: [],
    meta: { wifi: false, parking: false, breakfast: false, pets: false },
  });
  const body = venueFormData(form({
    mediaUrl: [' https://example.com/one.jpg ', '', 'https://example.com/two.jpg'], mediaAlt: [' View ', '', 'Bedroom'],
    wifi: 'on', pets: 'on', city: ' Bergen ', zip: '5003', lat: '0', lng: '10.5',
  }));
  assert.deepEqual(body.media, [{ url: 'https://example.com/one.jpg', alt: 'View' }, { url: 'https://example.com/two.jpg', alt: 'Bedroom' }]);
  assert.deepEqual(body.location, { city: 'Bergen', zip: '5003', lat: 0, lng: 10.5 });
  assert.equal(body.price, 1490.5);
  assert.equal(body.meta.pets, true);
  assert.equal(body.meta.parking, false);
  assert.equal(Object.hasOwn(body, 'owner'), false);
  assert.equal(Object.hasOwn(body, 'rating'), false);
});

test('venue form rejects invalid required fields, numbers, image URLs and incomplete coordinates', () => {
  for (const values of [
    { name: ' ' }, { description: '' }, { price: '' }, { price: '-1' }, { price: 'NaN' }, { price: '1.001' },
    { maxGuests: '' }, { maxGuests: '0' }, { maxGuests: '1.5' },
    { mediaUrl: ['javascript:alert(1)'] }, { mediaUrl: ['data:image/png;base64,abc'] },
    { mediaUrl: ['https://user:password@example.com/image.jpg'] }, { mediaUrl: [''], mediaAlt: ['Orphan alt'] },
    { mediaUrl: ['https://example.com/a.jpg'], mediaAlt: ['a'.repeat(121)] },
    { lat: '60' }, { lng: '10' }, { lat: '91', lng: '10' }, { lat: '60', lng: '-181' }, { lat: 'abc', lng: '10' },
  ]) assert.throws(() => venueFormData(form(values)), Error, JSON.stringify(values));
});

test('venue creation posts once with validated fields and distinguishes rejected from uncertain outcomes', async () => {
  const calls = [];
  const venue = await createVenue(async (path, options) => {
    calls.push([path, options]);
    return { data: { id: 'new-venue' } };
  }, form());
  assert.equal(venue.id, 'new-venue');
  assert.equal(calls.length, 1);
  assert.equal(calls[0][0], 'holidaze/venues');
  assert.equal(calls[0][1].method, 'POST');
  assert.equal(calls[0][1].body.maxGuests, 4);
  await assert.rejects(createVenue(() => { throw new Error('Must not send'); }, form({ name: ' ' })), /venue name/);
  for (const status of [0, 400, 403, 500, 201]) {
    await assert.rejects(createVenue(async () => { throw new ApiError('Fixture error', status); }, form()), error => error.venueUncertain === (status === 0 || status === 500 || status === 201));
  }
  await assert.rejects(createVenue(async () => ({ data: {} }), form()), error => error.venueUncertain === true);
});
