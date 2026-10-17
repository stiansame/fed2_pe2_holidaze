import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readSession, sessionExpiresAt } from '../../src/auth/session.js';

const user = exp => ({ name: 'tester', venueManager: false, accessToken: `header.${btoa(JSON.stringify({ exp }))}.signature` });

test('restores only unexpired, correctly shaped sessions', () => {
  const valid = user(Math.floor(Date.now() / 1000) + 3600);
  const read = value => readSession({ getItem: () => value });
  assert.deepEqual(read(JSON.stringify(valid)), valid);
  for (const value of [null, 'invalid', '{}', JSON.stringify(user(1)), JSON.stringify({ ...valid, venueManager: 'true' })]) {
    assert.equal(read(value), null);
  }
  assert.equal(sessionExpiresAt({ accessToken: 'invalid' }), 0);
  assert.equal(readSession({ getItem() { throw new Error('Unavailable'); } }), null);
});

test('does not expire a token solely because it has no exp claim', () => {
  const session = { ...user(1), accessToken: `header.${btoa(JSON.stringify({ sub: 'tester' }))}.signature` };
  assert.equal(sessionExpiresAt(session), Infinity);
  assert.deepEqual(readSession({ getItem: () => JSON.stringify(session) }), session);
  const malformed = { ...session, accessToken: `header.${btoa(JSON.stringify({ exp: 'invalid' }))}.signature` };
  assert.equal(sessionExpiresAt(malformed), 0);
});
