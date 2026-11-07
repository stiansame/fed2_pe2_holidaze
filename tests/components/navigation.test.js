import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { createServer } from 'vite';
import { navigationOrigin } from '../../src/utils/navigation.js';

test('account navigation follows the role and back links follow the originating page', async () => {
  const server = await createServer({ server: { middlewareMode: true, hmr: false, watch: null }, appType: 'custom' });
  try {
    const [{ default: NavigationLinks }, { default: AccountLayout }, { default: BackLink }, { AuthContext }] = await Promise.all([
      server.ssrLoadModule('/src/components/layout/NavigationLinks.jsx'),
      server.ssrLoadModule('/src/components/layout/AccountLayout.jsx'),
      server.ssrLoadModule('/src/components/BackLink.jsx'),
      server.ssrLoadModule('/src/auth/AuthContext.js'),
    ]);
    const render = (component, manager, entry = '/profile', props = {}) => renderToStaticMarkup(
      createElement(AuthContext.Provider, { value: { user: { name: 'User', venueManager: manager } } },
        createElement(MemoryRouter, { initialEntries: [entry] }, createElement(component, props))),
    );
    assert.ok(render(NavigationLinks, true).includes('href="/manager"'));
    assert.ok(render(NavigationLinks, false).includes('href="/profile"'));
    const managerMenu = render(AccountLayout, true, '/manager');
    assert.ok(managerMenu.indexOf('Dashboard') < managerMenu.indexOf('Profile'));
    assert.ok(!render(AccountLayout, false).includes('Dashboard'));
    const back = render(BackLink, true, { pathname: '/manager/bookings/reservation', state: navigationOrigin({ pathname: '/manager' }) });
    assert.ok(back.includes('href="/manager"') && back.includes('Back to dashboard') && back.includes('navigation-link'));
    const direct = render(BackLink, true, '/manager/bookings/reservation', { to: '/manager/bookings', label: 'Back to venue bookings' });
    assert.ok(direct.includes('href="/manager/bookings"') && direct.includes('Back to venue bookings'));
  } finally {
    await server.close();
  }
});
