import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';

test('gallery image buttons use phrasing content and required guest selects start with an empty option', async () => {
  const server = await createServer({ server: { middlewareMode: true, hmr: false, watch: null }, appType: 'custom' });
  try {
    const [{ default: VenueImage }, { default: GuestSelect }] = await Promise.all([
      server.ssrLoadModule('/src/components/venues/VenueImage.jsx'),
      server.ssrLoadModule('/src/components/GuestSelect.jsx'),
    ]);
    for (const media of [undefined, { url: 'https://example.com/photo.jpg' }]) {
      const button = renderToStaticMarkup(createElement('button', { type: 'button' }, createElement(VenueImage, { media, name: 'Cabin' })));
      assert.ok(button.includes('<button type="button"><span'));
      assert.ok(!button.includes('<div'));
    }
    const render = props => renderToStaticMarkup(createElement(GuestSelect, { maxGuests: 2, value: 1, onChange() {}, ...props }));
    assert.match(render({}), /<select[^>]*required=""[^>]*><option value="" disabled="">Choose guests<\/option>/);
    assert.ok(render({}).includes('<option value="1" selected="">1 guest</option>'));
    assert.ok(render({ maxGuests: 0 }).includes('disabled=""'));
    const any = render({ allowAny: true, value: 0 });
    assert.ok(!any.includes('required=""'));
    assert.ok(any.includes('<option value="0" selected="">Any</option>'));
  } finally {
    await server.close();
  }
});
