import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { createServer } from 'vite';

test('manager cards preserve booking details, guest and destination without editing controls', async () => {
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
    const { default: Price } = await server.ssrLoadModule('/src/components/venues/BookingPrice.jsx');
    const summary = renderToStaticMarkup(createElement(Price, {
      price: 1500, stay: { from: '2030-11-13', to: '2030-11-16', guests: 2 },
      summary: { error: '', nights: 3, total: 4500 },
    }));
    for (const value of ['4 500,- total', '13–16 Nov 2030', '3 nights']) assert.ok(summary.includes(value), value);
    assert.ok(!summary.includes('<button') && !summary.includes('<a ') && !summary.includes('accent'));
    const initial = renderToStaticMarkup(createElement(Price, { price: 1500, stay: {}, summary: { error: 'Choose dates.' } }));
    assert.ok(initial.includes('1 500,- / night') && !initial.includes('total') && !initial.includes('text-caption'));
  } finally {
    await server.close();
  }
});
