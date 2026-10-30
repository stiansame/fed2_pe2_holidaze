import assert from 'node:assert/strict';
import { test } from 'node:test';
import { addDays, bookedPeriods, dateKey, validateStay } from '../../src/utils/availability.js';

test('validates complete stays, capacity and booking boundaries without timezone shifts', () => {
  const { periods } = bookedPeriods([{ dateFrom: '2026-11-10T00:00:00.000Z', dateTo: '2026-11-13T00:00:00.000Z' }], '2026-10-30');
  const stay = { from: '2026-11-13', to: '2026-11-15', guests: 2, maxGuests: 4, periods, today: '2026-10-30' };
  assert.equal(validateStay(stay), '');
  assert.equal(validateStay({ ...stay, from: '2026-11-08', to: '2026-11-10' }), '');
  for (const [from, to] of [['2026-11-10', '2026-11-13'], ['2026-11-11', '2026-11-12'], ['2026-11-09', '2026-11-14'], ['2026-11-12', '2026-11-14']]) {
    assert.match(validateStay({ ...stay, from, to }), /overlap/);
  }
  assert.match(validateStay({ ...stay, from: '2026-10-29' }), /past/);
  for (const to of [stay.from, '2026-11-12']) assert.match(validateStay({ ...stay, to }), /after/);
  for (const from of ['', 'invalid', '2026-02-30']) assert.match(validateStay({ ...stay, from }), /valid/);
  for (const guests of [0, -1, 1.5, 5, NaN]) assert.match(validateStay({ ...stay, guests }), /capacity/);
  assert.match(validateStay({ ...stay, maxGuests: null }), /capacity/);
  assert.match(validateStay({ ...stay, periods: null }), /unavailable/);
  assert.equal(validateStay({ ...stay, periods: [] }), '');
  assert.equal(bookedPeriods(undefined).periods, null);
  assert.equal(bookedPeriods([null]).reliable, false);
  assert.equal(bookedPeriods([{ dateFrom: 'bad', dateTo: '2026-11-10' }]).reliable, false);
  assert.equal(addDays('2026-10-25', 1), '2026-10-26');
  assert.equal(addDays('2026-12-31', 1), '2027-01-01');
  assert.equal(addDays('2028-02-28', 1), '2028-02-29');
  assert.equal(dateKey(new Date(2026, 9, 30, 23, 30)), '2026-10-30');
});

test('legacy past bookings do not hide upcoming availability; uncertain future data still fails closed', () => {
  const today = '2026-10-30';
  const upcoming = { dateFrom: '2026-11-01T00:00:00Z', dateTo: '2026-11-08T00:00:00Z' };
  const { periods, reliable } = bookedPeriods([
    { dateFrom: '2026-06-04T00:00:00Z', dateTo: '2026-06-03T00:00:00Z' },
    { dateFrom: '2025-12-07T00:00:00Z', dateTo: '2025-12-07T00:00:00Z' },
    upcoming,
  ], today);
  assert.deepEqual(periods, [['2026-11-01', '2026-11-08']]);
  assert.equal(reliable, true);
  const stay = { from: '2026-11-02', to: '2026-11-03', guests: 1, maxGuests: 6, periods, today };
  assert.match(validateStay(stay), /overlap/);
  assert.equal(validateStay({ ...stay, from: '2026-11-08', to: '2026-11-09' }), '');
  for (const invalid of [
    { dateFrom: '2026-11-04', dateTo: '2026-11-03' },
    { dateFrom: '2026-11-04', dateTo: '2026-11-04' },
    { dateFrom: 'bad', dateTo: '2026-01-01' },
  ]) {
    assert.deepEqual(bookedPeriods([upcoming, invalid], today), { periods, reliable: false });
  }
});
