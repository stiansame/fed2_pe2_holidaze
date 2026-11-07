import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getVenueBooking } from '../../src/api/bookings.js';

test('manager booking details include venue and customer, forward abort and verify the venue owner', async () => {
  const controller = new AbortController();
  const booking = { id: 'booking/1', venue: { id: 'venue', owner: { name: 'Host' } }, customer: { name: 'Guest', avatar: { url: 'https://example.com/avatar.jpg' } } };
  const result = await getVenueBooking(async (path, options) => {
    assert.equal(path, 'holidaze/bookings/booking%2F1');
    assert.deepEqual(options, { query: { _venue: true, _customer: true }, signal: controller.signal });
    return { data: booking };
  }, 'booking/1', 'host', { signal: controller.signal });
  assert.equal(result, booking);
  for (const data of [null, {}, { venue: {} }, { venue: { owner: { name: 'Other' } }, customer: { name: 'Host' } }]) {
    await assert.rejects(getVenueBooking(async () => ({ data }), 'booking', 'Host'), { status: 403 });
  }
  await assert.rejects(getVenueBooking(async () => ({ data: booking }), 'booking', ''), { status: 403 });
  await assert.rejects(getVenueBooking(async () => { throw new Error('Offline'); }, 'booking', 'Host'), /Offline/);
});
