import assert from 'node:assert/strict';
import { test } from 'node:test';
import { backDestination, navigationOrigin } from '../../src/utils/navigation.js';

test('back links keep the actual origin, filters and the preceding navigation context', () => {
  const dashboard = navigationOrigin({ pathname: '/manager' });
  assert.deepEqual(backDestination(dashboard), { to: '/manager', label: 'Back to my account' });
  const list = navigationOrigin({ pathname: '/manager/bookings', search: '?venue=cabin', state: dashboard });
  assert.deepEqual(backDestination(list), { to: '/manager/bookings?venue=cabin', label: 'Back to venue bookings' });
  assert.equal(list.backState, dashboard);
  const details = navigationOrigin({ pathname: '/manager/bookings/reservation', search: '?venue=cabin', state: list });
  assert.deepEqual(backDestination(details), { to: '/manager/bookings/reservation?venue=cabin', label: 'Back to booking details' });
  assert.deepEqual(backDestination(details.backState), backDestination(list));
  for (const [pathname, label] of [['/venues', 'venues'], ['/manager/venues', 'my venues'], ['/bookings', 'my bookings'], ['/profile', 'my account'], ['/venues/cabin', 'venue'], ['/profiles/guest', 'profile']]) {
    assert.equal(backDestination(navigationOrigin({ pathname })).label, `Back to ${label}`);
  }
});

test('direct or invalid return targets use an internal fallback', () => {
  for (const backTo of [undefined, '', '//example.com', '/\\example.com', 'https://example.com', '/unknown']) {
    assert.deepEqual(backDestination({ backTo }, '/bookings', 'Back to my bookings'), { to: '/bookings', label: 'Back to my bookings' });
  }
});
