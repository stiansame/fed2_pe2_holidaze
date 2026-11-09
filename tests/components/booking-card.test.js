import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { createServer } from 'vite';

test('manager cards reuse booking details and preserve guest and destination without editing controls', async () => {
  const server = await createServer({ server: { middlewareMode: true, hmr: false, watch: null }, appType: 'custom' });
  try {
    const { default: Card } = await server.ssrLoadModule('/src/components/bookings/ManagerBookingCard.jsx');
    const render = booking => renderToStaticMarkup(createElement(MemoryRouter, null, createElement(Card, { booking })));
    const booking = {
      id: 'booking-1', dateFrom: '2030-11-13', dateTo: '2030-11-16', guests: 2,
      venue: { id: 'venue-1', name: 'Cabin', price: 1500, location: { city: 'Bergen', country: 'Norway' } },
      customer: { name: 'Alex' },
    };
    const html = render(booking);
    for (const value of ['Cabin', 'Bergen, Norway', '13–16 Nov 2030', '2 guests', '3 nights', '4 500,- total', 'Alex', '/manager/bookings/booking-1']) assert.ok(html.includes(value), value);
    assert.ok(!html.includes('estimated') && !html.includes('Manage booking') && !html.includes('Cancel booking'));
    const missing = render({ id: 'missing', venue: {} });
    for (const value of ['Location not specified', 'Dates unavailable', 'Total unavailable', 'Guest name unavailable']) assert.ok(missing.includes(value), value);
  } finally {
    await server.close();
  }
});
