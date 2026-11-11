import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { toggleSunnyMode } from '../../src/utils/theme.js';

test('theme changes persist, restore before paint and tolerate blocked storage', t => {
  const descriptors = ['document', 'localStorage'].map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]);
  t.after(() => descriptors.forEach(([key, descriptor]) => {
    if (descriptor) Object.defineProperty(globalThis, key, descriptor);
    else delete globalThis[key];
  }));
  const document = { documentElement: { dataset: {} } };
  const saved = new Map();
  const storage = { setItem: (key, value) => saved.set(key, value), getItem: key => saved.get(key) };
  Object.defineProperty(globalThis, 'document', { configurable: true, value: document });
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: storage });
  assert.equal(toggleSunnyMode(), true);
  assert.equal(document.documentElement.dataset.theme, 'sunny');
  assert.equal(saved.get('holidaze-theme'), 'sunny');

  const html = readFileSync(new URL('../../index.html', import.meta.url), 'utf8');
  const startup = html.match(/<script>([\s\S]*?)<\/script>/)[1];
  assert.ok(html.indexOf('<script>') < html.indexOf('rel="stylesheet"'));
  const restored = { documentElement: { dataset: {} } };
  runInNewContext(startup, { document: restored, localStorage: storage });
  assert.equal(restored.documentElement.dataset.theme, 'sunny');
  assert.equal(toggleSunnyMode(), false);
  assert.equal(saved.get('holidaze-theme'), 'default');
  for (const value of ['default', 'invalid', undefined]) {
    saved.set('holidaze-theme', value);
    const fresh = { documentElement: { dataset: {} } };
    runInNewContext(startup, { document: fresh, localStorage: storage });
    assert.equal(fresh.documentElement.dataset.theme, undefined);
  }
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, get() { throw new Error('Storage blocked'); } });
  assert.equal(toggleSunnyMode(), true);
  assert.equal(document.documentElement.dataset.theme, 'sunny');
  const blocked = { document: restored, get localStorage() { throw new Error('Storage blocked'); } };
  assert.doesNotThrow(() => runInNewContext(startup, blocked));
});
