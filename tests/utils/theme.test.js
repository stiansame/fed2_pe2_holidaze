import assert from 'node:assert/strict';
import { test } from 'node:test';
import { restoreTheme, toggleSunnyMode } from '../../src/utils/theme.js';

test('theme changes persist, restore the saved profile and tolerate blocked storage', t => {
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

  delete document.documentElement.dataset.theme;
  restoreTheme();
  assert.equal(document.documentElement.dataset.theme, 'sunny');
  assert.equal(toggleSunnyMode(), false);
  assert.equal(saved.get('holidaze-theme'), 'default');
  for (const value of ['default', 'invalid', undefined]) {
    saved.set('holidaze-theme', value);
    delete document.documentElement.dataset.theme;
    restoreTheme();
    assert.equal(document.documentElement.dataset.theme, undefined);
  }
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, get() { throw new Error('Storage blocked'); } });
  assert.equal(toggleSunnyMode(), true);
  assert.equal(document.documentElement.dataset.theme, 'sunny');
  assert.doesNotThrow(() => restoreTheme());
});
