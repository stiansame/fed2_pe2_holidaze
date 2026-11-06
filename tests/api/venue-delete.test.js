import assert from 'node:assert/strict';
import { test } from 'node:test';
import { deleteVenue } from '../../src/api/venues.js';
import { ApiError } from '../../src/api/client.js';

test('checks current ownership before sending one DELETE to the encoded venue id', async () => {
  const calls = [];
  await deleteVenue(async (path, options) => {
    calls.push({ path, ...options });
    return options.method === 'DELETE' ? null : { data: { owner: { name: 'Host' } } };
  }, 'venue/1', 'Host');
  assert.deepEqual(calls, [
    { path: 'holidaze/venues/venue%2F1', query: { _owner: true }, signal: undefined },
    { path: 'holidaze/venues/venue%2F1', method: 'DELETE' },
  ]);
});

test('never deletes when ownership is missing, changed or cannot be checked', async () => {
  for (const owner of [undefined, { name: 'Other' }]) {
    let calls = 0;
    await assert.rejects(deleteVenue(async (path, options) => {
      calls++;
      assert.notEqual(options.method, 'DELETE');
      return { data: { owner } };
    }, 'venue', 'Host'), /only manage your own/);
    assert.equal(calls, 1);
  }
  for (const status of [0, 401, 403, 404, 500]) {
    let calls = 0;
    await assert.rejects(deleteVenue(async () => {
      calls++;
      throw new ApiError('Ownership check failed', status);
    }, 'venue', 'Host'), { status });
    assert.equal(calls, 1);
  }
});

test('preserves deletion errors without automatically retrying', async () => {
  let deletions = 0;
  await assert.rejects(deleteVenue(async (path, options) => {
    if (options.method === 'DELETE') {
      deletions++;
      throw new ApiError('Response lost', 0);
    }
    return { data: { owner: { name: 'Host' } } };
  }, 'venue', 'Host'), { status: 0 });
  assert.equal(deletions, 1);
});
