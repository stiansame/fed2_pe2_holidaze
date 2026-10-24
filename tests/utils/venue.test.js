import assert from 'node:assert/strict';
import { test } from 'node:test';
import { formatVenuePrice, selectHighlyRatedVenues, shuffleVenuesWithPhotos, venueMapLinks } from '../../src/utils/venue.js';

test('varies highly rated choices with two distinct photos and prioritises usable map data', () => {
  const media = [{ url: 'https://example.com/a.jpg' }, { url: 'https://example.com/b.jpg' }];
  const venues = [
    { id: 'map-a', rating: 5, media, location: { lat: 60, lng: 5 } },
    { id: 'map-b', rating: 4, media, location: { lat: 59, lng: 10 } },
    { id: 'no-map', rating: 5, media, location: { lat: 0, lng: 0 } },
    { id: 'single', rating: 5, media: media.slice(0, 1) },
    { id: 'duplicate', rating: 5, media: [media[0], media[0]] },
    { id: 'invalid', rating: 5, media: [media[0], { url: 'not-a-url' }] },
    { id: 'low', rating: 3, media },
  ];
  const original = structuredClone(venues);
  const first = selectHighlyRatedVenues(venues, () => 0).map(venue => venue.id);
  const second = selectHighlyRatedVenues(venues, () => 0.999).map(venue => venue.id);
  assert.deepEqual(first, ['map-b', 'map-a', 'no-map']);
  assert.deepEqual(second, ['map-a', 'map-b', 'no-map']);
  assert.deepEqual(venues, original);
  assert.deepEqual(selectHighlyRatedVenues([]), []);
  const largerPool = Array.from({ length: 18 }, (_, i) => ({
    id: String(i), rating: 5, media, location: i < 6 ? { lat: 60, lng: 5 } : null,
  }));
  const selection = random => selectHighlyRatedVenues(largerPool, random).slice(0, 6).map(venue => venue.id).sort();
  assert.notDeepEqual(selection(() => 0), selection(() => 0.999));
});

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
