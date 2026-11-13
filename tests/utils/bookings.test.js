import assert from 'node:assert/strict';
import { test } from 'node:test';
import { guestSummary, bookingDates, bookingPrice, bookingStatus, formatBookingDate, formatBookingRange, groupBookings } from '../../src/utils/bookings.js';

test('short booking ranges retain the month and year when crossing boundaries', () => {
  assert.equal(formatBookingRange({ dateFrom: '2030-11-13', dateTo: '2030-11-16' }), '13–16 Nov 2030');
  assert.equal(formatBookingRange({ dateFrom: '2030-11-30', dateTo: '2030-12-02' }), '30 Nov–2 Dec 2030');
  assert.equal(formatBookingRange({ dateFrom: '2030-12-30', dateTo: '2031-01-02' }), '30 Dec 2030–2 Jan 2031');
  assert.equal(formatBookingRange({ dateFrom: null, dateTo: '2031-01-02' }), 'Dates unavailable');
});

test('estimates full-stay price for past and future bookings using whole UTC nights', () => {
  const booking = { dateFrom: '2020-03-28T00:00:00Z', dateTo: '2020-03-31T00:00:00Z', venue: { price: 1490.25 } };
  assert.deepEqual(bookingPrice(booking), { nights: 3, total: 4470.75 });
  assert.deepEqual(bookingPrice({ ...booking, venue: { price: 0 } }), { nights: 3, total: 0 });
  for (const change of [{ dateTo: booking.dateFrom }, { dateFrom: '2020-02-30' }, { venue: null }, { venue: { price: -1 } }]) {
    assert.equal(bookingPrice({ ...booking, ...change }), null);
  }
});

test('groups upcoming and current stays, newest past stays and invalid dates without mutating input', () => {
  const booking = (id, from, to) => ({ id, dateFrom: from, dateTo: to, guests: 2 });
  const items = [booking('later', '2030-03-10', '2030-03-12'), booking('old', '2030-01-01', '2030-01-02'), booking('current', '2030-03-01', '2030-03-04'), booking('recent', '2030-02-28', '2030-03-02'), booking('invalid', '2030-02-30', '2030-03-02')];
  const original = structuredClone(items);
  const groups = groupBookings(items, '2030-03-02');
  assert.deepEqual(groups.upcoming.map(item => item.id), ['current', 'later']);
  assert.deepEqual(groups.past.map(item => item.id), ['recent', 'old']);
  assert.deepEqual(groups.unknown.map(item => item.id), ['invalid']);
  assert.deepEqual(items, original);
  assert.equal(bookingStatus(items[2], '2030-03-01'), 'current');
  assert.deepEqual(bookingDates(items[0]), { from: '2030-03-10', to: '2030-03-12', guests: 2 });
  assert.equal(formatBookingDate('2030-03-10T00:00:00Z'), '10 Mar 2030');
  assert.equal(formatBookingDate(null), 'Date unavailable');
  assert.equal(formatBookingDate('2030-02-30'), 'Date unavailable');
  assert.equal(formatBookingDate('2032-02-29'), '29 Feb 2032');
});

test('guest statistics distinguish completed, current and future stays and count whole reserved nights', () => {
  const bookings = [
    { dateFrom: '2030-02-27', dateTo: '2030-03-02' },
    { dateFrom: '2030-03-02', dateTo: '2030-03-04' },
    { dateFrom: '2030-03-10', dateTo: '2030-03-14' },
  ];
  const original = structuredClone(bookings);
  const values = items => items.map(item => item[1]);
  assert.deepEqual(values(guestSummary(bookings, '2030-03-02')), [3, 1, 1, 9, 1]);
  assert.deepEqual(bookings, original);
  assert.deepEqual(values(guestSummary([], '2030-03-02')), [0, 0, 0, 0, 0]);
  assert.ok(values(guestSummary(null)).every(value => value == null));
  const invalid = [...bookings, { dateFrom: '2030-02-30', dateTo: '2030-03-03' }];
  assert.deepEqual(values(guestSummary(invalid, '2030-03-02')), [4, 1, 1, null, 1]);
  assert.equal(guestSummary(bookings, '2030-03-02', true)[0][0], 'My bookings');
  assert.equal(guestSummary(bookings, '2030-03-02')[0][0], 'Total bookings');
});
