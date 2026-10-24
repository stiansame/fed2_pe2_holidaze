import assert from 'node:assert/strict';
import { test } from 'node:test';
import { formatVenuePrice, shuffleVenuesWithPhotos, venueMapLinks } from '../../src/utils/venue.js';

test('shuffles a separate pool with usable photo URLs and preserves venue data', () => {
  const venues = [
    { id: 'a', media: [{ url: 'https://example.com/a.jpg' }] },
    { id: 'missing' },
    { id: 'unsafe', media: [{ url: 'javascript:alert(1)' }] },
    { id: 'b', media: [{ url: 'https://example.com/b.jpg' }] },
    { id: 'c', media: [{ url: 'https://example.com/c.jpg' }] },
  ];
  const original = structuredClone(venues);
  assert.deepEqual(shuffleVenuesWithPhotos(venues, () => 0).map(venue => venue.id), ['b', 'c', 'a']);
  assert.deepEqual(venues, original);
  assert.deepEqual(shuffleVenuesWithPhotos([]), []);
});

test('formats NOK prices including zero and handles missing prices', () => {
  assert.equal(formatVenuePrice(1490), 'NOK 1,490 / night');
  assert.equal(formatVenuePrice(0), 'NOK 0 / night');
  assert.equal(formatVenuePrice(null), 'Price not specified');
});

test('only creates map links for usable coordinates, not API defaults', () => {
  for (const location of [null, {}, { lat: 0, lng: 0 }, { lat: null, lng: 5 },
    { lat: '60', lng: 5 }, { lat: 91, lng: 5 }, { lat: 60, lng: 181 }]) {
    assert.equal(venueMapLinks(location), null);
  }
  const map = venueMapLinks({ lat: 60.39, lng: 5.32 });
  const url = new URL(map.embed);
  assert.equal(url.origin, 'https://www.openstreetmap.org');
  assert.equal(url.searchParams.get('marker'), '60.39,5.32');
  assert.equal(url.searchParams.get('bbox').split(',').length, 4);
  assert.ok(venueMapLinks({ lat: 0, lng: 5 }));
  assert.ok(venueMapLinks({ lat: 60, lng: 0 }));
});
