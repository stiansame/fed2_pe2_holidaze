import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { createServer } from 'vite';

test('the unified account keeps customer features and only mounts the manager overview for managers', async () => {
  const server = await createServer({ server: { middlewareMode: true, hmr: false, watch: null }, appType: 'custom' });
  try {
    const [{ default: Profile }, { default: NavigationLinks }, { AuthContext }, { default: SectionHeading }] = await Promise.all([
      server.ssrLoadModule('/src/pages/Profile.jsx'),
      server.ssrLoadModule('/src/components/layout/NavigationLinks.jsx'),
      server.ssrLoadModule('/src/auth/AuthContext.js'),
      server.ssrLoadModule('/src/components/account/SectionHeading.jsx'),
    ]);
    const profile = { name: 'Guest', email: 'guest@stud.noroff.no', bio: 'My profile bio', avatar: { url: 'https://example.com/new-avatar.jpg' } };
    const render = (Component, venueManager) => renderToStaticMarkup(createElement(AuthContext.Provider, {
      value: { user: { name: profile.name, venueManager, avatar: { url: 'https://example.com/old-avatar.jpg' } }, profile, setProfile() {} },
    }, createElement(MemoryRouter, { initialEntries: ['/profile'] }, createElement(Component))));
    const heading = props => renderToStaticMarkup(createElement(MemoryRouter, null, createElement(SectionHeading, props)));
    const collapsed = heading({ title: 'Past bookings', count: 12, expanded: false, onToggle() {} });
    assert.ok(collapsed.includes('aria-expanded="false"') && collapsed.includes('Show all past bookings'));
    assert.ok(collapsed.includes('bg-primary') && collapsed.includes('Total: ') && collapsed.includes('12'));
    const expanded = heading({ title: 'Past bookings', count: 12, expanded: true, onToggle() {} });
    assert.ok(expanded.includes('aria-expanded="true"') && expanded.includes('rotate-90') && expanded.includes('Show fewer past bookings'));
    const link = heading({ title: 'My venues', count: 0, to: '/manager/venues' });
    assert.ok(link.includes('href="/manager/venues"') && link.includes('View all my venues'));
    assert.ok(!link.includes('aria-expanded'));
    const customer = render(Profile, false);
    const manager = render(Profile, true);
    for (const html of [customer, manager]) {
      assert.ok(html.includes('My account') && html.includes('My profile bio') && html.includes('Edit profile'));
      assert.ok(html.includes('Loading your bookings'));
    }
    assert.ok(customer.includes('Become a venue manager') && !manager.includes('Become a venue manager'));
    assert.ok(!customer.includes('Loading your venue overview') && manager.includes('Loading your venue overview'));
    for (const venueManager of [false, true]) {
      const menu = render(NavigationLinks, venueManager);
      assert.ok(menu.includes('https://example.com/new-avatar.jpg') && !menu.includes('https://example.com/old-avatar.jpg'));
      assert.ok(menu.includes('href="/profile"') && menu.includes('Guest'));
    }
  } finally {
    await server.close();
  }
});
