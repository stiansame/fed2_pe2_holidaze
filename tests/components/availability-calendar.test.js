import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { createServer } from 'vite';

test('read-only venue calendar shows historical booking nights without offering a reservation', async () => {
  const server = await createServer({ server: { middlewareMode: true, hmr: false, watch: null }, appType: 'custom' });
  try {
    const { default: Calendar } = await server.ssrLoadModule('/src/components/venues/AvailabilityCalendar.jsx');
    const render = props => renderToStaticMarkup(createElement(MemoryRouter, null, createElement(Calendar, props)));
    const html = render({
      readOnly: true, maxGuests: 4,
      initialStay: { from: '2020-06-10', to: '2020-06-12', guests: 2 },
      bookings: [{ dateFrom: '2020-06-10', dateTo: '2020-06-12' }],
    });
    assert.ok(html.includes('Venue calendar') && html.includes('June 2020'));
    assert.equal((html.match(/This booking/g) || []).length, 2);
    assert.ok(html.includes('10-06-2020') && html.includes('12-06-2020'));
    assert.ok(!html.includes('<form') && !html.includes('>Reserve<') && !html.includes('Choose check-in'));
    assert.ok(!/aria-label="Previous month" disabled/.test(html));
    const interactive = render({ bookings: [], maxGuests: 4 });
    assert.ok(interactive.includes('<form') && interactive.includes('>Reserve<') && interactive.includes('Choose check-in'));
  } finally {
    await server.close();
  }
});
